import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
    try {
        const { to, subject, html, replyTo, attachments, targetAudiences } = await req.json();

        // 1. Basic Validation
        if (!to || !Array.isArray(to) || to.length === 0) {
            return NextResponse.json({ error: 'Missing recipients' }, { status: 400 });
        }
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

        // 4. Create Campaign Record
        let campaignId: string | null = null;
        try {
            const { data: campaign } = await supabaseAdmin
                .from('email_campaigns')
                .insert({
                    subject,
                    content: html,
                    sender_email: replyTo || process.env.SMTP_USER,
                    target_audiences: targetAudiences || [],
                    recipient_count: to.length,
                    status: 'enviando',
                })
                .select('id')
                .single();

            if (campaign) campaignId = campaign.id;
        } catch (e) {
            // Campaign logging is non-critical; continue with email sending
            console.error("Campaign log insert error (non-critical):", e);
        }

        // 5. Send Email via BCC
        const mailOptions = {
            from: `"${process.env.SMTP_USER_FROM_NAME || 'Base Agro Data'}" <${process.env.SMTP_USER}>`,
            replyTo: replyTo || process.env.SMTP_USER,
            to: process.env.SMTP_USER,
            bcc: to,
            subject: subject,
            html: html,
            attachments: attachments ? attachments.map((url: string) => ({
                path: url
            })) : []
        };

        const info = await transporter.sendMail(mailOptions);

        // 6. Log per-recipient delivery
        if (campaignId) {
            try {
                const logEntries = to.map((email: string) => ({
                    campaign_id: campaignId,
                    email,
                    status: 'enviado',
                }));
                await supabaseAdmin.from('email_campaign_logs').insert(logEntries);

                // Update campaign status to 'enviada'
                await supabaseAdmin
                    .from('email_campaigns')
                    .update({ status: 'enviada', sent_at: new Date().toISOString() })
                    .eq('id', campaignId);
            } catch (e) {
                console.error("Campaign log update error (non-critical):", e);
            }
        }

        return NextResponse.json({ success: true, messageId: info.messageId, campaignId });

    } catch (error: any) {
        console.error("Email Sending Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

