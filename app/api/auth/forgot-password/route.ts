import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { createAdminClient } from "@/utils/supabase/admin";

// Recuperação de senha SEM depender do redirect do GoTrue partilhado.
//
// O Supabase self-hosted é partilhado com o visualdesign e o seu SITE_URL /
// lista de redirects aponta para lá — por isso o link do email nativo
// (`resetPasswordForEmail`) leva o utilizador para a página do visualdesign
// em vez de basededadosagro.com/auth/reset-password.
//
// Aqui geramos o token de recuperação no servidor (generateLink), montamos
// NÓS o link no nosso domínio, e enviamo-lo pelo NOSSO SMTP. A página
// /auth/reset-password troca o token_hash por sessão via verifyOtp — nunca
// passa pelo redirect do GoTrue. Mesma ideia do "Caminho C" do login Google.

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://basededadosagro.com";
const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

export async function POST(request: Request) {
    try {
        const body = await request.json().catch(() => ({}));
        const email = String(body.email || "").trim().toLowerCase();
        if (!email || !EMAIL_RE.test(email)) {
            return NextResponse.json({ error: "Indique um email válido." }, { status: 400 });
        }

        const admin = createAdminClient();

        const { data, error } = await admin.auth.admin.generateLink({
            type: "recovery",
            email,
            options: { redirectTo: `${SITE_URL}/auth/reset-password` },
        });

        // Não revela se a conta existe — se não houver utilizador (ou outro
        // erro benigno), responde OK na mesma e não envia nada.
        if (error || !data?.properties?.hashed_token) {
            if (error && !/not found|no user|email not confirmed|for security/i.test(error.message)) {
                console.error("generateLink(recovery) inesperado:", error);
            }
            return NextResponse.json({ success: true });
        }

        const link = `${SITE_URL}/auth/reset-password?token_hash=${encodeURIComponent(
            data.properties.hashed_token,
        )}&type=recovery`;

        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: Number(process.env.SMTP_PORT) || 465,
            secure: Number(process.env.SMTP_PORT) === 465,
            auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
        });

        try {
            await transporter.sendMail({
                from: `"Base Agro Data" <${process.env.SMTP_USER}>`,
                to: email,
                subject: "Recuperação de senha — Base Agro Data",
                text:
                    `Recebemos um pedido para redefinir a senha da sua conta na Base Agro Data.\n\n` +
                    `Abra este endereço para definir uma nova senha (expira dentro de 1 hora):\n${link}\n\n` +
                    `Se não pediu esta alteração, ignore este email — a sua senha não muda.`,
                html: `
                    <div style="font-family:system-ui,-apple-system,'Segoe UI',Roboto,sans-serif;max-width:480px;margin:0 auto;color:#0f172a">
                      <h2 style="color:#047857;margin:0 0 12px">Recuperação de senha</h2>
                      <p style="margin:0 0 16px">Recebemos um pedido para redefinir a senha da sua conta na <strong>Base Agro Data</strong>.</p>
                      <p style="margin:24px 0">
                        <a href="${link}" style="background:#047857;color:#fff;text-decoration:none;padding:12px 22px;border-radius:8px;font-weight:700;display:inline-block">Redefinir a minha senha</a>
                      </p>
                      <p style="font-size:13px;color:#64748b;margin:0 0 8px">Ou copie este endereço para o navegador:</p>
                      <p style="font-size:13px;color:#64748b;word-break:break-all;margin:0 0 16px">${link}</p>
                      <p style="font-size:13px;color:#64748b;margin:0 0 4px">Se não pediu esta alteração, ignore este email — a sua senha não muda.</p>
                      <p style="font-size:12px;color:#94a3b8;margin:8px 0 0">O link expira dentro de 1 hora.</p>
                    </div>`,
            });
        } catch (sendErr) {
            console.error("Erro ao enviar email de recuperação:", sendErr);
            return NextResponse.json(
                { error: "Não foi possível enviar o email agora. Tente novamente dentro de instantes." },
                { status: 502 },
            );
        }

        return NextResponse.json({ success: true });
    } catch (err) {
        console.error("forgot-password route error:", err);
        return NextResponse.json({ error: "Erro ao processar o pedido." }, { status: 500 });
    }
}

export const dynamic = "force-dynamic";
