import { NextResponse } from 'next/server';
import { createAdminClient } from '@/utils/supabase/admin';

// "Asynchronous Response URL" do portal M-Pesa (IPG). O C2B singleStage é
// síncrono, mas quando a resposta imediata é INS-9 (timeout) o IPG conclui
// a transacção mais tarde e faz POST do resultado final para aqui. Serve de
// rede de segurança ao polling do /status.
//
// Configurar no portal (developer.mpesa.vm.co.mz → API Details → campo
// "Asynchronous Response URL"):
//   https://basededadosagro.com/api/payment/mpesa/callback
//
// Sem autenticação — a Vodacom não envia segredo. Segurança: só actua sobre
// uma transacção que exista na BD e esteja `pending`, e só a move para
// completed/failed uma vez. Nunca cobra nem cria nada.

async function activatePlan(
    adminClient: ReturnType<typeof createAdminClient>,
    userId: string,
    planName: string,
) {
    await adminClient.from('profiles').update({ plan: planName }).eq('id', userId);
    await adminClient.from('companies').update({ plan: planName }).eq('user_id', userId);
}

export async function POST(request: Request) {
    let payload: any = null;
    try {
        payload = await request.json();
    } catch {
        try {
            const form = await request.formData();
            payload = Object.fromEntries(form.entries());
        } catch {
            payload = null;
        }
    }

    if (!payload || typeof payload !== 'object') {
        return NextResponse.json({ output_ResponseCode: 'INS-996', received: false }, { status: 200 });
    }

    // O nome do campo de referência varia entre versões/documentos do IPG.
    const reference = String(
        payload.input_ThirdPartyReference ??
        payload.output_ThirdPartyReference ??
        payload.thirdPartyReference ??
        payload.input_TransactionReference ??
        payload.output_TransactionReference ??
        '',
    ).trim();

    const rawStatus = String(
        payload.output_ResponseCode ??
        payload.input_ResponseCode ??
        payload.output_ResponseTransactionStatus ??
        payload.output_TransactionStatus ??
        payload.status ??
        '',
    ).toLowerCase();

    if (!reference) {
        return NextResponse.json({ output_ResponseCode: 'INS-996', received: false }, { status: 200 });
    }

    const adminClient = createAdminClient();

    const { data: tx } = await adminClient
        .from('payment_transactions')
        .select('user_id, plan_name, status')
        .eq('reference', reference)
        .maybeSingle();

    // Responde sempre 200 — reenvios do IPG param quando recebem OK. Se a
    // referência não existir ou já estiver resolvida, não há nada a fazer.
    if (!tx || tx.status !== 'pending') {
        return NextResponse.json({ output_ResponseCode: 'INS-0', handled: false });
    }

    const isSuccess = rawStatus === 'ins-0' || rawStatus.includes('complet') || rawStatus.includes('success');
    const isFailure =
        rawStatus.includes('fail') ||
        rawStatus.includes('cancel') ||
        rawStatus.includes('reject') ||
        (rawStatus.startsWith('ins-') && rawStatus !== 'ins-0' && rawStatus !== 'ins-9' && rawStatus !== 'ins-16');

    if (isSuccess) {
        await adminClient.from('payment_transactions')
            .update({ status: 'completed', completed_at: new Date().toISOString(), provider_response: payload })
            .eq('reference', reference);
        await activatePlan(adminClient, tx.user_id, tx.plan_name);
        return NextResponse.json({ output_ResponseCode: 'INS-0', handled: true, status: 'completed' });
    }

    if (isFailure) {
        await adminClient.from('payment_transactions')
            .update({ status: 'failed', provider_response: payload })
            .eq('reference', reference);
        return NextResponse.json({ output_ResponseCode: 'INS-0', handled: true, status: 'failed' });
    }

    // Ainda inconclusivo — guarda o payload em bruto sem mudar o estado.
    await adminClient.from('payment_transactions')
        .update({ provider_response: payload })
        .eq('reference', reference);
    return NextResponse.json({ output_ResponseCode: 'INS-0', handled: false, status: 'pending' });
}

// Alguns ambientes do IPG fazem um GET de verificação antes de aceitar o URL.
export async function GET() {
    return NextResponse.json({ ok: true, endpoint: 'mpesa-callback' });
}
