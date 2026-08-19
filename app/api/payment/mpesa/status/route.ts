import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { createAdminClient } from '@/utils/supabase/admin';
import { getMpesaAccessToken, getMpesaCredentials, MPESA_BASE_URL } from '@/lib/mpesa';

// Activa o plano com o cliente admin (service_role) — desde que a coluna
// profiles.role/plan passou a estar protegida por trigger contra escrita
// directa do dono da conta, isto já não pode ser feito a partir do browser.
async function activatePlan(adminClient: ReturnType<typeof createAdminClient>, userId: string, planName: string) {
    await adminClient.from('profiles').update({ plan: planName }).eq('id', userId);
    await adminClient.from('companies').update({ plan: planName }).eq('user_id', userId);
}

export async function GET(request: Request) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return NextResponse.json({ error: 'É necessário iniciar sessão' }, { status: 401 });
    }

    const reference = new URL(request.url).searchParams.get('reference');
    if (!reference) {
        return NextResponse.json({ error: 'Falta a referência da transacção' }, { status: 400 });
    }

    const { data: tx, error: txError } = await supabase
        .from('payment_transactions')
        .select('status, plan_name')
        .eq('reference', reference)
        .eq('user_id', user.id)
        .single();

    if (txError || !tx) {
        return NextResponse.json({ error: 'Transacção não encontrada' }, { status: 404 });
    }

    // Já temos uma resposta definitiva guardada (concluída, falhada, ou modo
    // simulado) — não vale a pena voltar a perguntar ao M-Pesa.
    if (tx.status !== 'pending') {
        if (tx.status === 'completed') {
            // Idempotente — repetir a activação não faz mal, só garante que
            // uma falha a meio de um pedido anterior não deixe o plano por
            // activar.
            await activatePlan(createAdminClient(), user.id, tx.plan_name);
        }
        return NextResponse.json({ status: tx.status, planName: tx.plan_name });
    }

    const { consumerKey, consumerSecret, shortcode } = getMpesaCredentials();
    if (!consumerKey || !consumerSecret) {
        // Modo simulado: o registo já devia ter ficado "completed" no
        // /api/payment/mpesa — se ainda está pending aqui é porque a
        // inserção falhou antes disso; reporta pending sem tentar o M-Pesa.
        return NextResponse.json({ status: 'pending', planName: tx.plan_name });
    }

    // Ainda pendente na nossa base — pergunta directamente ao M-Pesa qual é
    // o estado real, em vez de esperar por um callback (que exige um URL
    // público acessível a partir da internet, o que não serve para testar
    // a partir de localhost).
    const adminClient = createAdminClient();
    try {
        const accessToken = await getMpesaAccessToken(consumerKey, consumerSecret);
        const statusResponse = await fetch(
            `${MPESA_BASE_URL}/queryTransactionStatus/?input_QueryReference=${encodeURIComponent(reference)}&input_ThirdPartyReference=${encodeURIComponent(reference)}&input_ServiceProviderCode=${encodeURIComponent(shortcode || '')}`,
            {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    Origin: 'developer.mpesa.vm.co.mz',
                },
            }
        );
        const statusData = await statusResponse.json().catch(() => null);

        // Nome exacto do campo de estado não está 100% confirmado sem testar
        // contra o sandbox real — por isso aceitam-se algumas variantes
        // plausíveis, e a resposta em bruto fica sempre guardada para se
        // poder ajustar isto depois de ver uma resposta real.
        const rawStatus = String(
            statusData?.output_ResponseTransactionStatus ??
            statusData?.output_TransactionStatus ??
            statusData?.transactionStatus ??
            ''
        ).toLowerCase();

        if (rawStatus.includes('complet') || rawStatus.includes('success')) {
            await adminClient.from('payment_transactions')
                .update({ status: 'completed', completed_at: new Date().toISOString(), provider_response: statusData })
                .eq('reference', reference);
            await activatePlan(adminClient, user.id, tx.plan_name);
            return NextResponse.json({ status: 'completed', planName: tx.plan_name });
        }

        if (rawStatus.includes('fail') || rawStatus.includes('cancel') || rawStatus.includes('reject')) {
            await adminClient.from('payment_transactions')
                .update({ status: 'failed', provider_response: statusData })
                .eq('reference', reference);
            return NextResponse.json({ status: 'failed', planName: tx.plan_name });
        }

        // Continua pendente — guarda a resposta em bruto para depuração sem
        // mudar o estado.
        await adminClient.from('payment_transactions')
            .update({ provider_response: statusData })
            .eq('reference', reference);
        return NextResponse.json({ status: 'pending', planName: tx.plan_name });
    } catch (error: any) {
        console.error('Erro ao consultar estado no M-Pesa:', error);
        // Falha a consultar o M-Pesa não é o mesmo que o pagamento ter
        // falhado — mantém pending, o frontend tenta novamente a seguir.
        return NextResponse.json({ status: 'pending', planName: tx.plan_name });
    }
}
