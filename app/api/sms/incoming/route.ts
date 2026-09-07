import { NextResponse } from "next/server";
import { createAdminClient } from "@/utils/supabase/admin";

// Webhook do httpSMS: chamado quando o telemóvel recebe um SMS
// (evento "message.phone.received"). Protegido por ?secret=... na URL, que
// tem de bater com HTTPSMS_WEBHOOK_SECRET. Configurar em httpsms.com ->
// Settings -> Webhooks com a URL:
//   https://basededadosagro.com/api/sms/incoming?secret=<HTTPSMS_WEBHOOK_SECRET>

export async function POST(request: Request) {
    const url = new URL(request.url);
    const secret = url.searchParams.get("secret");
    const expected = process.env.HTTPSMS_WEBHOOK_SECRET;

    if (!expected || secret !== expected) {
        return NextResponse.json({ error: "não autorizado" }, { status: 401 });
    }

    let admin;
    try {
        admin = createAdminClient();
    } catch {
        return NextResponse.json({ error: "config incompleta" }, { status: 500 });
    }

    try {
        const body = await request.json().catch(() => ({}));
        const type = body?.type;
        const d = body?.data || {};

        // Só nos interessa mensagem recebida. Outros eventos: 200 e ignora.
        if (type !== "message.phone.received" || !d.content || !d.contact) {
            return NextResponse.json({ ok: true, ignored: true });
        }

        const row = {
            direction: "inbound",
            phone: String(d.contact),
            from_phone: d.owner ? String(d.owner) : null,
            content: String(d.content),
            status: "received",
            provider_id: d.message_id ? String(d.message_id) : null,
            created_at: d.timestamp ? new Date(d.timestamp).toISOString() : new Date().toISOString(),
        };

        // upsert por provider_id evita duplicar se o httpSMS reenviar o webhook.
        const { error } = await admin
            .from("sms_messages")
            .upsert(row, { onConflict: "provider_id", ignoreDuplicates: true });
        if (error) console.error("sms/incoming: falha ao gravar", error.message);

        return NextResponse.json({ ok: true });
    } catch (err) {
        console.error("sms/incoming error:", err);
        // 200 mesmo em erro, para o httpSMS não entrar em loop de retentativas.
        return NextResponse.json({ ok: true });
    }
}

// Alguns painéis fazem um GET de verificação ao guardar o webhook.
export async function GET(request: Request) {
    const url = new URL(request.url);
    const ok = url.searchParams.get("secret") === process.env.HTTPSMS_WEBHOOK_SECRET;
    return NextResponse.json({ ok }, { status: ok ? 200 : 401 });
}
