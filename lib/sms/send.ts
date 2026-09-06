// Ponto único de envio de SMS para toda a app. Usa o httpSMS: telemóvel(es)
// Android como gateway (custo = SIM já pago).
// HTTPSMS_FROM aceita um ou vários números separados por vírgula; quando são
// vários, o envio alterna entre eles (round-robin) para repartir a carga.
// SMS_DRY_RUN !== "false" (o valor por defeito) NUNCA envia: escreve o texto
// no log e devolve status "sent_mock". Passar SMS_DRY_RUN=false para ligar.

type SmsResult = { phone: string; status: string };

const SMS_DRY_RUN = process.env.SMS_DRY_RUN !== "false";

const HTTPSMS_API_KEY = process.env.HTTPSMS_API_KEY;
const HTTPSMS_BASE_URL = process.env.HTTPSMS_BASE_URL || "https://api.httpsms.com";

// O httpSMS quer os números em E.164 com "+".
function toE164(phone: string) {
    const t = phone.replace(/[\s-]/g, "");
    if (t.startsWith("+")) return t;
    return `+${t.replace(/^00/, "")}`;
}

const HTTPSMS_FROM_LIST = (process.env.HTTPSMS_FROM || "")
    .split(",")
    .map((n) => n.trim())
    .filter(Boolean)
    .map(toE164);

// Round-robin entre os números configurados. Estado ao nível do módulo —
// suficiente com o processo único do PM2 em produção.
let fromCursor = 0;
function nextFrom(): string | undefined {
    if (HTTPSMS_FROM_LIST.length === 0) return undefined;
    const pick = HTTPSMS_FROM_LIST[fromCursor % HTTPSMS_FROM_LIST.length];
    fromCursor = (fromCursor + 1) % HTTPSMS_FROM_LIST.length;
    return pick;
}

export function smsIsDryRun() {
    return SMS_DRY_RUN;
}

export async function sendSMS(phone: string, text: string): Promise<SmsResult> {
    const from = nextFrom();

    if (SMS_DRY_RUN) {
        console.log(`[SMS dry-run · httpsms${from ? ` · de ${from}` : ""}] Para ${phone}: ${text}`);
        return { phone, status: "sent_mock" };
    }

    if (!HTTPSMS_API_KEY || !from) {
        console.error("[SMS] httpSMS sem HTTPSMS_API_KEY / HTTPSMS_FROM");
        return { phone, status: "failed" };
    }

    try {
        const res = await fetch(`${HTTPSMS_BASE_URL}/v1/messages/send`, {
            method: "POST",
            headers: {
                "x-api-key": HTTPSMS_API_KEY,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                content: text,
                from,
                to: toE164(phone),
            }),
        });
        if (!res.ok) {
            console.error(`[SMS] httpSMS respondeu ${res.status} para ${phone}:`, await res.text());
            return { phone, status: "failed" };
        }
        return { phone, status: "sent" };
    } catch (err) {
        console.error(`[SMS] erro httpSMS para ${phone}:`, err);
        return { phone, status: "failed" };
    }
}
