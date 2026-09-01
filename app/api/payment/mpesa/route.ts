import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { createAdminClient } from '@/utils/supabase/admin';
import {
    getMpesaConfig,
    isMpesaConfigured,
    generateMpesaToken,
    mpesaUrl,
    mpesaHeaders,
    normalizeMsisdn,
    makeMpesaReference,
    MPESA_OK,
    MPESA_PENDING_CODES,
} from '@/lib/mpesa';

// O C2B singleStage do IPG é SÍNCRONO: a resposta HTTP só chega depois de o
// cliente meter (ou não) o PIN no telemóvel — pode demorar até ~60s.
const MPESA_TIMEOUT_MS = 110_000;

async function activatePlan(
    adminClient: ReturnType<typeof createAdminClient>,
    userId: string,
    planName: string,
) {
    await adminClient.from('profiles').update({ plan: planName }).eq('id', userId);
    await adminClient.from('companies').update({ plan: planName }).eq('user_id', userId);
}

export async function POST(request: Request) {
    try {
        // 0. Exige sessão — sem isto, qualquer pessoa disparava um pedido de
        // pagamento sem conta associada nenhuma para activar depois.
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return NextResponse.json({ error: 'É necessário iniciar sessão para pagar' }, { status: 401 });
        }

        const { phoneNumber, amount, planName } = await request.json();

        if (!phoneNumber || !amount || !planName) {
            return NextResponse.json({ error: 'Número de telefone, valor e plano são obrigatórios' }, { status: 400 });
        }

        const adminClient = createAdminClient();
        const reference = makeMpesaReference();

        // 1. Regista a transacção como pendente ANTES de contactar o M-Pesa.
        const { error: insertError } = await adminClient.from('payment_transactions').insert({
            user_id: user.id,
            reference,
            plan_name: planName,
            amount,
            phone: phoneNumber,
            status: 'pending',
        });
        if (insertError) {
            console.error('Erro ao registar transacção:', insertError);
            return NextResponse.json({ error: 'Erro ao registar o pedido de pagamento' }, { status: 500 });
        }

        // 2. Modo simulado — só quando NADA do M-Pesa está configurado.
        // Permite testar o fluxo completo (registo + activação de plano) sem
        // tocar no IPG. Se as credenciais estiverem lá, este ramo é saltado.
        if (!isMpesaConfigured()) {
            console.warn(
                'M-Pesa não configurado (MPESA_API_KEY / MPESA_PUBLIC_KEY / MPESA_SERVICE_PROVIDER_CODE). A correr em modo simulado.',
            );
            await adminClient.from('payment_transactions')
                .update({ status: 'completed', completed_at: new Date().toISOString(), provider_response: { mock: true } })
                .eq('reference', reference);
            await activatePlan(adminClient, user.id, planName);
            return NextResponse.json({
                success: true,
                mock: true,
                reference,
                message: 'MOCK: Pedido de pagamento simulado.',
            });
        }

        // 3. Caminho real — Vodacom IPG v1x, C2B singleStage.
        const { apiKey, publicKey, serviceProviderCode } = getMpesaConfig();

        try {
            const token = generateMpesaToken(apiKey, publicKey);

            const controller = new AbortController();
            const timer = setTimeout(() => controller.abort(), MPESA_TIMEOUT_MS);

            let paymentData: any = {};
            try {
                const paymentResponse = await fetch(mpesaUrl('c2b'), {
                    method: 'POST',
                    headers: mpesaHeaders(token),
                    signal: controller.signal,
                    body: JSON.stringify({
                        input_TransactionReference: reference,
                        input_CustomerMSISDN: normalizeMsisdn(phoneNumber),
                        input_Amount: String(amount),
                        input_ThirdPartyReference: reference,
                        input_ServiceProviderCode: serviceProviderCode,
                    }),
                });
                paymentData = await paymentResponse.json().catch(() => ({}));
            } finally {
                clearTimeout(timer);
            }

            const code = String(paymentData?.output_ResponseCode ?? '');

            // INS-0 = cliente confirmou com o PIN, pagamento feito.
            if (code === MPESA_OK) {
                await adminClient.from('payment_transactions')
                    .update({ status: 'completed', completed_at: new Date().toISOString(), provider_response: paymentData })
                    .eq('reference', reference);
                await activatePlan(adminClient, user.id, planName);
                return NextResponse.json({ success: true, reference, data: paymentData });
            }

            // INS-9 (timeout) / INS-10 (duplicada) / INS-16 (sobrecarga
            // temporária) — pode ainda concluir. Fica pending; o frontend
            // faz polling a /status, que consulta o queryTransactionStatus.
            if (MPESA_PENDING_CODES.has(code)) {
                await adminClient.from('payment_transactions')
                    .update({ provider_response: paymentData })
                    .eq('reference', reference);
                return NextResponse.json({ success: true, reference, pending: true, data: paymentData });
            }

            // Recusa explícita (cancelado, saldo insuficiente, número
            // inválido, código de provider errado, etc.).
            console.error('Pedido M-Pesa recusado:', code, paymentData?.output_ResponseDesc, paymentData);
            await adminClient.from('payment_transactions')
                .update({ status: 'failed', provider_response: paymentData })
                .eq('reference', reference);
            return NextResponse.json(
                { success: false, error: paymentData?.output_ResponseDesc || 'Pagamento não concluído', code, details: paymentData },
                { status: 400 },
            );
        } catch (mpesaError: any) {
            const aborted = mpesaError?.name === 'AbortError';
            console.error('Erro ao contactar o M-Pesa:', mpesaError);
            await adminClient.from('payment_transactions')
                .update({
                    status: aborted ? 'pending' : 'failed',
                    provider_response: { error: mpesaError?.message || String(mpesaError) },
                })
                .eq('reference', reference);

            if (aborted) {
                // Não sabemos se falhou — deixa o polling confirmar.
                return NextResponse.json({ success: true, reference, pending: true });
            }
            return NextResponse.json(
                { success: false, error: mpesaError?.message || 'Erro ao contactar o M-Pesa', reference },
                { status: 500 },
            );
        }
    } catch (error: any) {
        console.error('API Error:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
