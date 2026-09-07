// Ponto único de envio de SMS para toda a app. Usa o httpSMS: telemóvel(es)
// Android como gateway (custo = SIM já pago).
// HTTPSMS_FROM: um ou vários números separados por vírgula. O 1º é o
// PRINCIPAL — é sempre o usado; os seguintes são reserva e só entram se a
// API do httpSMS rejeitar o envio pelo anterior.
// Nota: um "sent" aqui = a API aceitou e passou ao telemóvel. A entrega
// real (ou falha no telemóvel) chega depois pelos webhooks e actualiza a
// linha em basededados.sms_messages.
// SMS_DRY_RUN !== "false" (o valor por defeito) NUNCA envia: escreve o texto
// no log e devolve status "sent_mock".

type SmsResult = { phone: string; status: string; from?: string; providerId?: string };

const SMS_DRY_RUN = process.env.SMS_DRY_RUN !== "false";

const HTTPSMS_API_KEY = process.env.HTTPSMS_API_KEY;
const HTTPSMS_BASE_URL = process.env.HTTPSMS_BASE_URL || "https://api.httpsms.com";

// O httpSMS quer os números em E.164 com "+".
function toE164(phone: string) {
    const t = phone.replace(/[\s-]/g, "");
    if (t.startsWith("+")) return t;
    return `+${t.replace(/^00/, "")}`;
}

// 1º = principal, resto = reserva pela ordem em que aparecem.
const HTTPSMS_FROM_LIST = (process.env.HTTPSMS_FROM || "")
    .split(",")
    .map((n) => n.trim())
    .filter(Boolean)
    .map(toE164);

export function smsIsDryRun() {
    return SMS_DRY_RUN;
}

async function tryOne(from: string, phone: string, text: string): Promise<{ ok: boolean; id?: string }> {
    try {
        const res = await fetch(`${HTTPSMS_BASE_URL}/v1/messages/send`, {
            method: "POST",
            headers: {
                "x-api-key": HTTPSMS_API_KEY!,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ content: text, from, to: toE164(phone) }),
        });
        if (!res.ok) {
            console.error(`[SMS] httpSMS ${res.status} (de ${from}) para ${phone}:`, await res.text());
            return { ok: false };
        }
        const body = await res.json().catch(() => null);
        return { ok: true, id: body?.data?.id };
    } catch (err) {
        console.error(`[SMS] erro httpSMS (de ${from}) para ${phone}:`, err);
        return { ok: false };
    }
}

export async function sendSMS(phone: string, text: string): Promise<SmsResult> {
    if (SMS_DRY_RUN) {
        const from = HTTPSMS_FROM_LIST[0];
        console.log(`[SMS dry-run · httpsms${from ? ` · de ${from}` : ""}] Para ${phone}: ${text}`);
        return { phone, status: "sent_mock", from };
    }

    if (!HTTPSMS_API_KEY || HTTPSMS_FROM_LIST.length === 0) {
        console.error("[SMS] httpSMS sem HTTPSMS_API_KEY / HTTPSMS_FROM");
        return { phone, status: "failed" };
    }

    // Principal primeiro; passa à reserva seguinte só se este for rejeitado.
    let lastFrom: string | undefined;
    for (const from of HTTPSMS_FROM_LIST) {
        lastFrom = from;
        const r = await tryOne(from, phone, text);
        if (r.ok) return { phone, status: "sent", from, providerId: r.id };
    }
    return { phone, status: "failed", from: lastFrom };
}
