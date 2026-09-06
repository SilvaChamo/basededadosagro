import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Mesmo token do rodapé dos emails de campanha (app/api/messages/send).
function expectedToken(email: string) {
    return crypto
        .createHmac('sha256', process.env.SUPABASE_SERVICE_ROLE_KEY!)
        .update(email.toLowerCase().trim())
        .digest('hex')
        .slice(0, 32);
}

function esc(s: string) {
    return s
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

function page(title: string, message: string) {
    title = esc(title);
    message = esc(message);
    return new NextResponse(
        `<!doctype html><html lang="pt"><head><meta charset="utf-8">
        <meta name="viewport" content="width=device-width,initial-scale=1">
        <title>${title}</title></head>
        <body style="font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;background:#E6EAF1;margin:0;display:flex;min-height:100vh;align-items:center;justify-content:center;">
          <div style="background:#fff;border:1px solid #e2e8f0;border-radius:12px;padding:32px 28px;max-width:420px;text-align:center;">
            <h1 style="font-size:18px;margin:0 0 8px;color:#1e293b;">${title}</h1>
            <p style="font-size:14px;color:#64748b;margin:0;">${message}</p>
            <a href="https://basededadosagro.com" style="display:inline-block;margin-top:20px;font-size:13px;color:#059669;text-decoration:none;font-weight:700;">Ir para basededadosagro.com</a>
          </div>
        </body></html>`,
        { headers: { 'Content-Type': 'text/html; charset=utf-8' } }
    );
}

export async function GET(req: Request) {
    const url = new URL(req.url);
    const email = (url.searchParams.get('e') || '').toLowerCase().trim();
    const token = url.searchParams.get('t') || '';

    if (!email || !token) {
        return page('Link inválido', 'Faltam dados no link de cancelamento.');
    }

    const expected = expectedToken(email);
    // Comparação em tempo constante.
    const ok =
        token.length === expected.length &&
        crypto.timingSafeEqual(Buffer.from(token), Buffer.from(expected));
    if (!ok) {
        return page('Link inválido', 'Este link de cancelamento não é válido.');
    }

    try {
        await supabaseAdmin
            .from('newsletter_subscribers')
            .update({ status: 'unsubscribed' })
            .eq('email', email);
    } catch (e) {
        console.error('unsubscribe update error:', e);
        return page('Erro', 'Não foi possível processar o pedido. Tente mais tarde.');
    }

    return page('Subscrição cancelada', 'Deixou de receber os nossos emails. Pode voltar a subscrever a qualquer momento no site.');
}
