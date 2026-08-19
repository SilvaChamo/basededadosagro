import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { createAdminClient } from '@/utils/supabase/admin';
import { getMpesaAccessToken, getMpesaCredentials, MPESA_BASE_URL } from '@/lib/mpesa';

export async function POST(request: Request) {
    try {
        // 0. Exige sessão — sem isto, qualquer pessoa conseguia disparar um
        // pedido de pagamento sem conta associada nenhuma para activar depois.
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
        const uniqueReference = `PLAN_${Date.now()}_${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

        // 1. Regista a transacção como pendente ANTES de contactar o M-Pesa —
        // o pedido só confirma que o STK Push foi enviado, a confirmação real
        // (pago/falhado) é consultada depois via /api/payment/mpesa/status.
        const { error: insertError } = await adminClient.from('payment_transactions').insert({
            user_id: user.id,
            reference: uniqueReference,
            plan_name: planName,
            amount,
            phone: phoneNumber,
            status: 'pending',
        });
        if (insertError) {
            console.error('Erro ao registar transacção:', insertError);
            return NextResponse.json({ error: 'Erro ao registar o pedido de pagamento' }, { status: 500 });
        }

        const { consumerKey, consumerSecret, shortcode, passkey } = getMpesaCredentials();

        // Modo simulado se as credenciais não estiverem configuradas (permite
        // testar o fluxo todo — incluindo o registo da transacção acima —
        // sem depender do sandbox do M-Pesa estar acessível).
        if (!consumerKey || !consumerSecret) {
            console.warn('Variáveis de ambiente do M-Pesa em falta. A correr em modo simulado.');
            await adminClient.from('payment_transactions')
                .update({ status: 'completed', completed_at: new Date().toISOString(), provider_response: { mock: true } })
                .eq('reference', uniqueReference);
            return NextResponse.json({
                success: true,
                mock: true,
                reference: uniqueReference,
                message: 'MOCK: Pedido de pagamento simulado.',
            });
        }

        try {
            const accessToken = await getMpesaAccessToken(consumerKey, consumerSecret);

            const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, 14);
            const password = Buffer.from(`${shortcode}${passkey}${timestamp}`).toString('base64');

            const paymentResponse = await fetch(`${MPESA_BASE_URL}/c2bPayment/singleStage/`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                    'Origin': 'developer.mpesa.vm.co.mz',
                },
                body: JSON.stringify({
                    input_TransactionReference: uniqueReference,
                    input_CustomerMSISDN: phoneNumber,
                    input_Amount: amount,
                    input_ThirdPartyReference: uniqueReference,
                    input_ServiceProviderCode: shortcode,
                }),
            });

            const paymentData = await paymentResponse.json();

            if (!paymentResponse.ok) {
                console.error('Erro no pedido M-Pesa:', paymentData);
                await adminClient.from('payment_transactions')
                    .update({ status: 'failed', provider_response: paymentData })
                    .eq('reference', uniqueReference);
                return NextResponse.json({ error: 'Pedido de pagamento falhou', details: paymentData }, { status: 500 });
            }

            await adminClient.from('payment_transactions')
                .update({ provider_response: paymentData })
                .eq('reference', uniqueReference);

            return NextResponse.json({ success: true, reference: uniqueReference, data: paymentData });
        } catch (mpesaError: any) {
            console.error('Erro ao contactar o M-Pesa:', mpesaError);
            await adminClient.from('payment_transactions')
                .update({ status: 'failed', provider_response: { error: mpesaError.message } })
                .eq('reference', uniqueReference);
            return NextResponse.json({ error: mpesaError.message || 'Erro ao contactar o M-Pesa' }, { status: 500 });
        }
    } catch (error: any) {
        console.error('API Error:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
