import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

// Recuperação de senha: o link do e-mail aponta para cá.
//
// Trocamos o código PKCE por sessão NO SERVIDOR (lê o cookie `code_verifier`
// escrito quando o utilizador pediu a recuperação) em vez de depender do
// `detectSessionInUrl` do cliente. Se o link expirou ou foi aberto noutro
// browser/dispositivo, o erro é mostrado SEMPRE na basededadosagro — nunca no
// `SITE_URL` do GoTrue partilhado (`visualdesignmoz.com`), como acontecia antes.
export async function GET(request: Request) {
    const url = new URL(request.url);
    const code = url.searchParams.get("code");

    // Atrás do proxy (Apache -> PM2 :3010) o origin de request.url é o interno
    // (localhost). O host público vem nos headers X-Forwarded-* — mesmo padrão
    // da rota /auth/callback.
    const fwdHost = request.headers.get("x-forwarded-host");
    const fwdProto = request.headers.get("x-forwarded-proto") ?? "https";
    const base = fwdHost ? `${fwdProto}://${fwdHost}` : url.origin;

    const fail = (message: string) =>
        NextResponse.redirect(
            `${base}/auth/login?status=error&message=${encodeURIComponent(message)}`,
        );

    // Erros do GoTrue (ex.: otp_expired) chegam no fragmento (#error=...), que
    // não é enviado ao servidor — sem `code` tratamos como link inválido.
    if (!code) {
        return fail("O link de recuperação é inválido ou expirou. Peça um novo.");
    }

    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
        return fail(
            "Não foi possível validar o link de recuperação. Pode ter expirado ou sido aberto noutro dispositivo/navegador. Peça um novo link.",
        );
    }

    // Sessão criada (cookies). O formulário de nova senha faz updateUser().
    return NextResponse.redirect(`${base}/auth/login?mode=recovery`);
}
