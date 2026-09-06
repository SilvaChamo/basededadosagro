import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

// Recuperação de senha: o link do e-mail aponta para cá.
//
// Caminho principal (novo): ?token_hash=...&type=recovery — o link é gerado e
// enviado por /api/auth/forgot-password no NOSSO domínio, e aqui trocamos o
// token_hash por sessão com verifyOtp (fluxo OTP, sem PKCE, sem redirect do
// GoTrue — por isso não depende da lista de redirects do Supabase partilhado,
// que mandava o utilizador para o login do visualdesign).
//
// Caminho antigo (fallback): ?code=... — troca o código PKCE por sessão. Fica
// para links nativos ainda em circulação.
//
// Robustez: atrás de Cloudflare -> Apache -> PM2 o origin de request.url é
// interno (localhost:3010) e o x-forwarded-host pode chegar com VÁRIOS
// valores separados por vírgula (um por cada proxy). Se construíssemos o URL
// de redirect à bruta com esse valor, `NextResponse.redirect` recebia um URL
// inválido e rebentava com 500 de corpo vazio (ERR_INVALID_RESPONSE). Aqui o
// `base` é SEMPRE um URL absoluto válido, e todo o handler está em try/catch.
export async function GET(request: Request) {
    const pick = (v: string | null) => (v ?? "").split(",")[0].trim();
    const fwdHost = pick(request.headers.get("x-forwarded-host"));
    const fwdProto = pick(request.headers.get("x-forwarded-proto")) || "https";

    let base = "https://basededadosagro.com";
    try {
        base = fwdHost
            ? new URL(`${fwdProto}://${fwdHost}`).origin
            : new URL(request.url).origin;
    } catch {
        /* mantém o fallback fixo */
    }

    const fail = (message: string) =>
        NextResponse.redirect(
            `${base}/auth/login?status=error&message=${encodeURIComponent(message)}`,
        );

    try {
        const params = new URL(request.url).searchParams;
        const tokenHash = params.get("token_hash");
        const code = params.get("code");

        const supabase = await createClient();

        // Caminho principal: token_hash (verifyOtp, sem PKCE).
        if (tokenHash) {
            const { error } = await supabase.auth.verifyOtp({
                type: "recovery",
                token_hash: tokenHash,
            });
            if (error) {
                return fail("O link de recuperação é inválido ou já foi usado. Peça um novo.");
            }
            return NextResponse.redirect(`${base}/auth/login?mode=recovery`);
        }

        // Erros do GoTrue (ex.: otp_expired) chegam no fragmento (#error=...),
        // que não é enviado ao servidor — sem token nenhum tratamos como inválido.
        if (!code) {
            return fail("O link de recuperação é inválido ou expirou. Peça um novo.");
        }

        // Fallback: exchangeCodeForSession pode LANÇAR (não só devolver {error})
        // quando falta o cookie code_verifier — link aberto noutro
        // browser/dispositivo ou dados do site limpos entre pedir e clicar.
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (error) {
            return fail(
                "Não foi possível validar o link de recuperação. Pode ter expirado ou sido aberto noutro dispositivo/navegador. Peça um novo a partir do mesmo browser.",
            );
        }

        // Sessão de recuperação criada (cookies). O formulário em
        // /auth/login?mode=recovery faz updateUser() com a senha nova.
        return NextResponse.redirect(`${base}/auth/login?mode=recovery`);
    } catch {
        return fail(
            "Ocorreu um erro ao validar o link de recuperação. Peça um novo a partir do mesmo browser.",
        );
    }
}
