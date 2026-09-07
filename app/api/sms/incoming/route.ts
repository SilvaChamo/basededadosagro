import { NextResponse } from "next/server";
import { createAdminClient } from "@/utils/supabase/admin";

// Webhook do httpSMS. Trata:
//  - message.phone.received  -> grava um SMS recebido (inbound)
//  - message.phone.sent      -> a linha outbound passa a "sent"
//  - message.phone.delivered -> "delivered"
//  - message.send.failed     -> "failed" (+ motivo em detail)
//  - message.send.expired    -> "expired"
// Protegido por ?secret=... na URL (= HTTPSMS_WEBHOOK_SECRET). Configurar em
// httpsms.com -> Settings -> Webhooks com:
//   https://basededadosagro.com/api/sms/incoming?secret=<HTTPSMS_WEBHOOK_SECRET>

const OUTBOUND_STATUS: Record<string, string> = {
    "message.phone.sent": "sent",
    "message.phone.delivered": "delivered",
    "message.send.failed": "failed",
    "message.send.expired": "expired",
};

export async function POST(request: Request) {
    const url = new URL(request.url);
    if (!process.env.HTTPSMS_WEBHOOK_SECRET || url.searchParams.get("secret") !== process.env.HTTPSMS_WEBHOOK_SECRET) {
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

        // --- SMS recebido ---
        if (type === "message.phone.received") {
            if (!d.content || !d.contact) return NextResponse.json({ ok: true, ignored: true });

            const providerId = d.message_id ? String(d.message_id) : null;
            if (providerId) {
                const { data: existing } = await admin
                    .from("sms_messages")
                    .select("id")
                    .eq("provider_id", providerId)
                    .limit(1)
                    .maybeSingle();
                if (existing) return NextResponse.json({ ok: true, duplicate: true });
            }

            const { error } = await admin.from("sms_messages").insert({
                direction: "inbound",
                phone: String(d.contact),
                from_phone: d.owner ? String(d.owner) : null,
                content: String(d.content),
                status: "received",
                provider_id: providerId,
                created_at: d.timestamp ? new Date(d.timestamp).toISOString() : new Date().toISOString(),
            });
            if (error && error.code !== "23505") console.error("sms/incoming received:", error.message);
            return NextResponse.json({ ok: true });
        }

        // --- estado de um SMS enviado ---
        const newStatus = OUTBOUND_STATUS[type];
        if (newStatus) {
            // id em data.id (sent/delivered/failed) ou data.message_id (expired)
            const providerId = d.id || d.message_id;
            if (!providerId) return NextResponse.json({ ok: true, ignored: true });

            const patch: Record<string, unknown> = { status: newStatus };
            if (newStatus === "failed" && d.error_message) patch.detail = String(d.error_message);

            const { error } = await admin
                .from("sms_messages")
                .update(patch)
                .eq("provider_id", String(providerId))
                .eq("direction", "outbound");
            if (error) console.error("sms/incoming status:", error.message);
            return NextResponse.json({ ok: true });
        }

        return NextResponse.json({ ok: true, ignored: true });
    } catch (err) {
        console.error("sms/incoming error:", err);
        // 200 mesmo em erro, para o httpSMS não entrar em loop de retentativas.
        return NextResponse.json({ ok: true });
    }
}

export async function GET(request: Request) {
    const url = new URL(request.url);
    const ok = url.searchParams.get("secret") === process.env.HTTPSMS_WEBHOOK_SECRET;
    return NextResponse.json({ ok }, { status: ok ? 200 : 401 });
}
