import { NextResponse, after } from 'next/server';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import { createClient } from '@supabase/supabase-js';
import { createClient as createSessionClient } from '@/utils/supabase/server';
import { isAdminRole } from '@/lib/roles';

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://basededadosagro.com';

// Pausa entre envios um-a-um — não martelar o SMTP e não bater em limites
// de ritmo do fornecedor. ~120ms => ~8 emails/s.
const SEND_DELAY_MS = 120;
// Insere os logs de entrega em lotes, não um a um.
const LOG_BATCH = 100;

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Token estável por email para o link de cancelar subscrição (sem guardar nada). */
function unsubToken(email: string) {
    return crypto
        .createHmac('sha256', process.env.SUPABASE_SERVICE_ROLE_KEY!)
        .update(email.toLowerCase().trim())
        .digest('hex')
        .slice(0, 32);
}

function unsubscribeFooter(email: string) {
    const url = `${SITE_URL}/api/newsletter/unsubscribe?e=${encodeURIComponent(email)}&t=${unsubToken(email)}`;
    return `<div style="margin-top:28px;padding-top:16px;border-top:1px solid #e5e7eb;font-size:12px;color:#94a3b8;text-align:center;">
        Recebeu este email da Base de Dados Agro.
        <a href="${url}" style="color:#94a3b8;text-decoration:underline;">Cancelar subscrição</a>
    </div>`;
}

export async function POST(req: Request) {
    try {
        // Sem isto, qualquer pessoa conseguia usar o SMTP do site para
        // mandar spam/phishing em nome da Base Agro para qualquer lista de
        // emails — só administração pode disparar campanhas.
        const sessionSupabase = await createSessionClient();
        const { data: { user } } = await sessionSupabase.auth.getUser();
        if (!user) {
            return NextResponse.json({ error: 'É necessário iniciar sessão' }, { status: 401 });
        }
        const { data: profile } = await supabaseAdmin
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();
        if (!isAdminRole(profile?.role)) {
            return NextResponse.json({ error: 'Apenas administradores podem enviar campanhas de email' }, { status: 403 });
        }

        const { to, subject, html, replyTo, attachments, targetAudiences, testEmail } = await req.json();

        // 1. Basic Validation
        if (!subject || !html) {
            return NextResponse.json({ error: 'Missing subject or content' }, { status: 400 });
        }

        // 2. Configure Transporter
        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: Number(process.env.SMTP_PORT) || 465,
            secure: Number(process.env.SMTP_PORT) === 465,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });

        // 3. Verify Connection
        try {
            await transporter.verify();
        } catch (error) {
            console.error("SMTP Connection Error:", error);
            return NextResponse.json({ error: 'Failed to connect to SMTP server' }, { status: 500 });
        }

        const fromHeader = `"${process.env.SMTP_USER_FROM_NAME || 'Base Agro Data'}" <${process.env.SMTP_USER}>`;
        const mailAttachments = Array.isArray(attachments)
            ? attachments.map((url: string) => ({ path: url }))
            : [];

        // ---- Modo TESTE: envia só para um endereço, não cria campanha ----
        if (testEmail) {
            try {
                await transporter.sendMail({
                    from: fromHeader,
                    replyTo: replyTo || process.env.SMTP_USER,
                    to: testEmail,
                    subject: `[TESTE] ${subject}`,
                    html: html + unsubscribeFooter(testEmail),
                    attachments: mailAttachments,
                });
                return NextResponse.json({ success: true, test: true });
            } catch (e: any) {
                return NextResponse.json({ error: `Falha no envio de teste: ${e.message}` }, { status: 500 });
            }
        }

        // ---- Campanha real: um email por destinatário, em segundo plano ----
        if (!to || !Array.isArray(to) || to.length === 0) {
            return NextResponse.json({ error: 'Missing recipients' }, { status: 400 });
        }

        // Lista final: sem vazios, sem duplicados, minúsculas.
        const recipients = Array.from(
            new Set(
                to
                    .filter((e: any) => typeof e === 'string' && e.includes('@'))
                    .map((e: string) => e.trim().toLowerCase())
            )
        );
        if (recipients.length === 0) {
            return NextResponse.json({ error: 'Nenhum email válido na lista' }, { status: 400 });
        }

        // 4. Cria a campanha já em estado "enviando".
        let campaignId: string | null = null;
        try {
            const { data: campaign } = await supabaseAdmin
                .from('email_campaigns')
                .insert({
                    subject,
                    content: html,
                    sender_email: replyTo || process.env.SMTP_USER,
                    target_audiences: targetAudiences || [],
                    recipient_count: recipients.length,
                    status: 'enviando',
                })
                .select('id')
                .single();
            if (campaign) campaignId = campaign.id;
        } catch (e) {
            console.error("Campaign insert error:", e);
        }

        // 5. Envio um-a-um em segundo plano (a resposta volta já; a lista de
        //    Campanhas mostra o progresso e o estado final).
        after(async () => {
            let delivered = 0;
            let failed = 0;
            let logBuffer: { campaign_id: string | null; email: string; status: string; error: string | null }[] = [];

            const flush = async () => {
                if (!campaignId || logBuffer.length === 0) return;
                const batch = logBuffer;
                logBuffer = [];
                try {
                    await supabaseAdmin.from('email_campaign_logs').insert(batch);
                } catch (e) {
                    console.error("campaign_logs insert error (non-critical):", e);
                }
            };

            for (const email of recipients) {
                try {
                    const info = await transporter.sendMail({
                        from: fromHeader,
                        replyTo: replyTo || process.env.SMTP_USER,
                        to: email,
                        subject,
                        html: html + unsubscribeFooter(email),
                        attachments: mailAttachments,
                    });
                    const rejected = (info?.rejected || []).map((r: any) => String(r).toLowerCase());
                    if (rejected.includes(email)) {
                        failed++;
                        logBuffer.push({ campaign_id: campaignId, email, status: 'falhado', error: 'Rejeitado pelo servidor SMTP' });
                    } else {
                        delivered++;
                        logBuffer.push({ campaign_id: campaignId, email, status: 'enviado', error: null });
                    }
                } catch (e: any) {
                    failed++;
                    logBuffer.push({ campaign_id: campaignId, email, status: 'falhado', error: (e?.message || 'erro desconhecido').slice(0, 500) });
                }

                if (logBuffer.length >= LOG_BATCH) await flush();
                await sleep(SEND_DELAY_MS);
            }
            await flush();

            if (campaignId) {
                const status = delivered === 0 ? 'falhada' : failed === 0 ? 'enviada' : 'parcial';
                try {
                    await supabaseAdmin
                        .from('email_campaigns')
                        .update({
                            status,
                            delivered_count: delivered,
                            failed_count: failed,
                            sent_at: new Date().toISOString(),
                        })
                        .eq('id', campaignId);
                } catch (e) {
                    console.error("campaign final update error (non-critical):", e);
                }
            }
        });

        return NextResponse.json({ success: true, campaignId, queued: true, recipientCount: recipients.length });

    } catch (error: any) {
        console.error("Email Sending Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
