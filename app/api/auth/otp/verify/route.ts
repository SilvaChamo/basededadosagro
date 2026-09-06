import { NextResponse } from "next/server";
import { createHash } from "node:crypto";
import { createAdminClient } from "@/utils/supabase/admin";

// Passo 2 do login por telemóvel: valida o código e devolve um token_hash de
// magiclink para o cliente abrir a sessão com supabase.auth.verifyOtp.
// Usa admin.generateLink -> não mexe nas definições de Auth do Supabase
// partilhado.

const MAX_ATTEMPTS = 5;

function hashCode(phone: string, code: string) {
    return createHash("sha256").update(`${phone}:${code}`).digest("hex");
}
function last9(phone: string) {
    return String(phone).replace(/\D/g, "").slice(-9);
}

export async function POST(request: Request) {
    let admin;
    try {
        admin = createAdminClient();
    } catch {
        return NextResponse.json({ error: "Configuração do servidor incompleta" }, { status: 500 });
    }

    try {
        const { phone, code } = await request.json();
        const tail = last9(phone || "");
        const cleanCode = String(code || "").replace(/\D/g, "");
        if (tail.length !== 9 || cleanCode.length !== 6) {
            return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });
        }

        const { data: row } = await admin
            .from("login_otp_codes")
            .select("id, code_hash, attempts, expires_at, user_id")
            .eq("phone", tail)
            .is("consumed_at", null)
            .order("created_at", { ascending: false })
            .limit(1)
            .maybeSingle();

        if (!row) {
            return NextResponse.json(
                { error: "Código inválido ou expirado. Peça um novo." },
                { status: 400 },
            );
        }
        if (new Date(row.expires_at).getTime() < Date.now()) {
            return NextResponse.json({ error: "Código expirado. Peça um novo." }, { status: 400 });
        }
        if (row.attempts >= MAX_ATTEMPTS) {
            return NextResponse.json(
                { error: "Demasiadas tentativas. Peça um novo código." },
                { status: 429 },
            );
        }

        if (row.code_hash !== hashCode(tail, cleanCode)) {
            await admin
                .from("login_otp_codes")
                .update({ attempts: row.attempts + 1 })
                .eq("id", row.id);
            return NextResponse.json({ error: "Código incorrecto." }, { status: 400 });
        }

        // Código certo — marca como usado e cria a sessão.
        await admin
            .from("login_otp_codes")
            .update({ consumed_at: new Date().toISOString() })
            .eq("id", row.id);

        const { data: userRes, error: userErr } = await admin.auth.admin.getUserById(row.user_id);
        if (userErr || !userRes?.user?.email) {
            return NextResponse.json({ error: "Conta sem email associado." }, { status: 400 });
        }

        const { data: link, error: linkErr } = await admin.auth.admin.generateLink({
            type: "magiclink",
            email: userRes.user.email,
        });
        if (linkErr || !link?.properties?.hashed_token) {
            console.error("generateLink error:", linkErr);
            return NextResponse.json({ error: "Não foi possível iniciar a sessão." }, { status: 500 });
        }

        return NextResponse.json({ ok: true, tokenHash: link.properties.hashed_token });
    } catch (err) {
        console.error("otp/verify error:", err);
        return NextResponse.json({ error: "Não foi possível validar o código." }, { status: 500 });
    }
}
