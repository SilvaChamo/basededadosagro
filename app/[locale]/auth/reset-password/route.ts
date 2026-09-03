import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

// Recuperação de senha: o link do e-mail aponta para cá. Troca o código PKCE
// por sessão NO SERVIDOR (lê o cookie code_verifier escrito quando o
// utilizador pediu a recuperação) e reencaminha para o formulário de nova
// senha em /auth/login?mode=recovery.
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
        const code = new URL(request.url).searchParams.get("code");

        // Erros do GoTrue (ex.: otp_expired) chegam no fragmento (#error=...),
        // que não é enviado ao servidor — sem `code` tratamos como inválido.
        if (!code) {
            return fail("O link de recuperação é inválido ou expirou. Peça um novo.");
        }

        // exchangeCodeForSession pode LANÇAR (não só devolver {error}) quando
        // falta o cookie code_verifier — link aberto noutro browser/dispositivo
        // ou dados do site limpos entre pedir e clicar.
        const supabase = await createClient();
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (error) {
            return fail(
                "Não foi possível validar o link de recuperação. Pode ter expirado ou sido aberto noutro dispositivo/navegador. Peça um novo a partir do mesmo browser.",
            );
        }

        // Sessão criada (cookies). O formulário de nova senha faz updateUser().
        return NextResponse.redirect(`${base}/auth/login?mode=recovery`);
    } catch {
        return fail(
            "Ocorreu um erro ao validar o link de recuperação. Peça um novo a partir do mesmo browser.",
        );
    }
}
