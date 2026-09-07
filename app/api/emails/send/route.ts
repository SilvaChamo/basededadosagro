import { NextResponse } from "next/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { createClient } from "@/utils/supabase/server";
import { isAdminRole } from "@/lib/roles";
import { createMailTransport, mailFromAddress, mailFromHeader } from "@/lib/email/mailer";

// Envio de e-mail individual (Painel -> Interações -> E-mails). Só admin.
// Ao contrário das campanhas: não cria email_campaigns, não põe rodapé de
// desinscrição, não é um-a-um. Um envio direto, com CC/BCC opcionais, e
// regista a linha em basededados.email_messages (separador "Enviados").

const parseList = (v: unknown): string[] =>
    (Array.isArray(v) ? v : String(v || "").split(/[\s,;\n]+/))
        .map((e) => String(e).trim().toLowerCase())
        .filter((e) => e.includes("@"));

function htmlToSnippet(html: string) {
    return String(html || "")
        .replace(/<style[\s\S]*?<\/style>/gi, " ")
        .replace(/<[^>]+>/g, " ")
        .replace(/&nbsp;/gi, " ")
        .replace(/\s+/g, " ")
        .trim()
        .slice(0, 200);
}

export async function POST(request: Request) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "É necessário iniciar sessão" }, { status: 401 });

    let admin;
    try {
        admin = createAdminClient();
    } catch {
        return NextResponse.json({ error: "Configuração do servidor incompleta" }, { status: 500 });
    }

    const { data: profile } = await admin.from("profiles").select("role").eq("id", user.id).single();
    if (!isAdminRole(profile?.role)) {
        return NextResponse.json({ error: "Apenas administradores" }, { status: 403 });
    }

    try {
        const body = await request.json();
        const to = parseList(body.to);
        const cc = parseList(body.cc);
        const bcc = parseList(body.bcc);
        const subject = String(body.subject || "").trim();
        const html = String(body.html || "");
        const replyTo = String(body.replyTo || "").trim() || process.env.SMTP_USER;
        const attachments: string[] = Array.isArray(body.attachments)
            ? body.attachments.filter((u: unknown) => typeof u === "string")
            : [];

        if (to.length === 0 && cc.length === 0 && bcc.length === 0) {
            return NextResponse.json({ error: "Indica pelo menos um destinatário (Para, CC ou BCC)." }, { status: 400 });
        }
        if (!subject) return NextResponse.json({ error: "Escreve o assunto." }, { status: 400 });
        if (!html.trim()) return NextResponse.json({ error: "Escreve a mensagem." }, { status: 400 });

        const transporter = createMailTransport();
        const fromHeader = mailFromHeader();
        const mailAttachments = attachments.map((url) => ({ path: url }));
        const primaryTo = to.length ? to : [mailFromAddress()];

        let status = "sent";
        let detail: string | null = null;
        try {
            const info = await transporter.sendMail({
                from: fromHeader,
                replyTo,
                to: primaryTo,
                cc: cc.length ? cc : undefined,
                bcc: bcc.length ? bcc : undefined,
                subject,
                html,
                attachments: mailAttachments,
            });
            const rejected = (info?.rejected || []).map((r) => String(r).toLowerCase());
            if (rejected.length && rejected.length >= primaryTo.length) {
                status = "failed";
                detail = "Rejeitado pelo servidor SMTP.";
            }
        } catch (e) {
            status = "failed";
            detail = (e instanceof Error ? e.message : "Erro SMTP").slice(0, 500);
        }

        // Regista no separador "Enviados" (uma linha por endereço em Para).
        const snippet = htmlToSnippet(html);
        const rows = (to.length ? to : primaryTo).map((address) => ({
            direction: "outbound",
            address,
            from_address: mailFromAddress(),
            cc: cc.join(", ") || null,
            bcc: bcc.join(", ") || null,
            subject,
            html,
            snippet,
            status,
            detail,
            attachments,
            sent_by: user.id,
        }));
        const { error: logErr } = await admin.from("email_messages").insert(rows);
        if (logErr) console.error("emails/send: falha ao registar", logErr.message);

        if (status === "failed") {
            return NextResponse.json({ error: detail || "Falha no envio." }, { status: 502 });
        }
        return NextResponse.json({ ok: true, sent: primaryTo.length + cc.length + bcc.length });
    } catch (err) {
        console.error("emails/send error:", err);
        return NextResponse.json({ error: "Não foi possível enviar." }, { status: 500 });
    }
}
