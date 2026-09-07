import { NextResponse } from "next/server";
import crypto from "crypto";
import { createAdminClient } from "@/utils/supabase/admin";

// Webhook do httpSMS. Trata:
//  - message.phone.received  -> grava um SMS recebido (inbound)
//  - message.phone.sent      -> a linha outbound passa a "sent"
//  - message.phone.delivered -> "delivered"
//  - message.send.failed     -> "failed" (+ motivo em detail)
//  - message.send.expired    -> "expired"
//
// Autenticação (por ordem de preferência):
//  1. HMAC nativo do httpSMS: cabeçalho X-Event-Signature = HMAC-SHA256 do
//     corpo cru com HTTPSMS_WEBHOOK_SIGNING_KEY.
//  2. Cabeçalho X-Webhook-Secret = HTTPSMS_WEBHOOK_SECRET (preferível ao URL).
//  3. Legado: ?secret=<HTTPSMS_WEBHOOK_SECRET> no URL — mantido para não
//     partir o webhook já configurado; migrar para (1) ou (2) no httpsms.com
//     (Webhooks -> custom headers / signing key) e tirar o ?secret= do URL.

const OUTBOUND_STATUS: Record<string, string> = {
    "message.phone.sent": "sent",
    "message.phone.delivered": "delivered",
    "message.send.failed": "failed",
    "message.send.expired": "expired",
};

// Comparação em tempo constante (compara digests, sem fugas de comprimento).
function safeEqual(a: string, b: string): boolean {
    const ha = crypto.createHash("sha256").update(a).digest();
    const hb = crypto.createHash("sha256").update(b).digest();
    return crypto.timingSafeEqual(ha, hb);
}

function webhookAuthorised(request: Request, rawBody: string): boolean {
    const signingKey = process.env.HTTPSMS_WEBHOOK_SIGNING_KEY;
    const sig = request.headers.get("x-event-signature");
    if (signingKey && sig) {
        const expected = crypto.createHmac("sha256", signingKey).update(rawBody).digest("hex");
        return safeEqual(sig.trim(), expected);
    }

    const secret = process.env.HTTPSMS_WEBHOOK_SECRET;
    if (!secret) return false;

    const headerSecret = request.headers.get("x-webhook-secret");
    if (headerSecret) return safeEqual(headerSecret, secret);

    const qs = new URL(request.url).searchParams.get("secret");
    if (qs) return safeEqual(qs, secret);

    return false;
}

export async function POST(request: Request) {
    const rawBody = await request.text();
    if (!webhookAuthorised(request, rawBody)) {
        return NextResponse.json({ error: "não autorizado" }, { status: 401 });
    }

    let admin;
    try {
        admin = createAdminClient();
    } catch {
        return NextResponse.json({ error: "config incompleta" }, { status: 500 });
    }

    try {
        let parsed: Record<string, unknown> = {};
        try { parsed = rawBody ? JSON.parse(rawBody) : {}; } catch { parsed = {}; }
        const type = typeof parsed.type === "string" ? parsed.type : "";
        const d = (parsed.data ?? {}) as Record<string, unknown> & {
            content?: unknown; contact?: unknown; owner?: unknown; message_id?: unknown;
            id?: unknown; timestamp?: unknown; error_message?: unknown;
        };

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
                created_at: d.timestamp ? new Date(d.timestamp as string).toISOString() : new Date().toISOString(),
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
    // Verificação do webhook (sem corpo). Aceita cabeçalho ou ?secret= legado.
    const ok = webhookAuthorised(request, "");
    return NextResponse.json({ ok }, { status: ok ? 200 : 401 });
}
