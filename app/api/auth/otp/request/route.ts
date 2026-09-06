import { NextResponse } from "next/server";
import { createHash, randomInt } from "node:crypto";
import { createAdminClient } from "@/utils/supabase/admin";
import { sendSMS, smsIsDryRun } from "@/lib/sms/send";

// Passo 1 do login por telemóvel: recebe um número, confirma que pertence a
// uma conta existente e envia um código de 6 dígitos por SMS PARA O NÚMERO
// GRAVADO NESSA CONTA (nunca para o valor submetido — senão qualquer pessoa
// pedia o código de outra pessoa para o seu próprio telemóvel). Não toca em
// nenhum outro método de login.

const CODE_TTL_MS = 5 * 60 * 1000;      // código válido 5 min
const RESEND_COOLDOWN_MS = 60 * 1000;   // 1 min entre pedidos do mesmo número
const IS_DEV = process.env.NODE_ENV !== "production";

function hashCode(phone: string, code: string) {
    return createHash("sha256").update(`${phone}:${code}`).digest("hex");
}

// Últimos 9 dígitos: o telefone em profiles pode estar como +258XXXXXXXXX,
// 258XXXXXXXXX ou XXXXXXXXX.
function last9(phone: string) {
    return String(phone).replace(/\D/g, "").slice(-9);
}

// Número gravado -> E.164 (assume Moçambique quando não há indicativo).
function storedToE164(stored: string) {
    const d = String(stored).replace(/\D/g, "");
    if (d.length === 9) return `+258${d}`;
    return `+${d}`;
}

// Resposta única para TODOS os caminhos (não encontrado / cooldown / enviado)
// — não revelar se um número está registado.
function genericOk() {
    return NextResponse.json(IS_DEV ? { ok: true, dryRun: smsIsDryRun() } : { ok: true });
}

export async function POST(request: Request) {
    let admin;
    try {
        admin = createAdminClient();
    } catch {
        return NextResponse.json({ error: "Configuração do servidor incompleta" }, { status: 500 });
    }

    try {
        const { phone } = await request.json();
        const tail = last9(phone || "");
        if (tail.length !== 9) {
            return NextResponse.json({ error: "Número de telemóvel inválido." }, { status: 400 });
        }

        // Candidatos por sufixo, mas só conta quem bate exatamente nos 9
        // dígitos — evita confundir números iguais com indicativos diferentes.
        const { data: candidates } = await admin
            .from("profiles")
            .select("id, phone")
            .ilike("phone", `%${tail}`)
            .limit(5);

        const matches = (candidates || []).filter((c) => c.phone && last9(c.phone) === tail);

        // 0 -> não existe; >1 -> ambíguo. Em ambos os casos, resposta genérica
        // e não se envia nada.
        if (matches.length !== 1) {
            if (matches.length > 1) {
                console.warn(`otp/request: ${matches.length} perfis com o número terminado em ${tail}`);
            }
            return genericOk();
        }
        const profile = matches[0];
        const dest = storedToE164(profile.phone as string);

        // Cooldown de reenvio — aplicado em silêncio (mesma resposta genérica),
        // sem 429, para não distinguir número registado de não registado.
        const { data: recent } = await admin
            .from("login_otp_codes")
            .select("created_at")
            .eq("phone", tail)
            .is("consumed_at", null)
            .order("created_at", { ascending: false })
            .limit(1)
            .maybeSingle();

        if (
            recent?.created_at &&
            Date.now() - new Date(recent.created_at).getTime() < RESEND_COOLDOWN_MS
        ) {
            return genericOk();
        }

        const code = String(randomInt(0, 1_000_000)).padStart(6, "0");

        const { error: insErr } = await admin.from("login_otp_codes").insert({
            phone: tail,
            code_hash: hashCode(tail, code),
            user_id: profile.id,
            expires_at: new Date(Date.now() + CODE_TTL_MS).toISOString(),
        });
        if (insErr) throw insErr;

        await sendSMS(dest, `Base Agro: o seu codigo de acesso e ${code}. Valido por 5 minutos.`);

        return genericOk();
    } catch (err) {
        console.error("otp/request error:", err);
        return NextResponse.json({ error: "Não foi possível enviar o código." }, { status: 500 });
    }
}
