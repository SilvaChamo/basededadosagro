import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import nodemailer from 'nodemailer';

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { db: { schema: 'basededados' } }
);

// Pesquisas em português cobrindo os temas mais relevantes para o sector
// agrário moçambicano. O robô só recolhe título/link/fonte/data/resumo
// curto do RSS — não reescreve nem resume com IA (decisão do utilizador,
// para não ter custos por notícia). O texto final do artigo fica sempre
// a cargo de quem revê em /admin/noticias, separador "Pendentes do Robô".
const QUERIES = [
    'agricultura Moçambique',
    'agronegócio Moçambique',
    'produção agrícola Moçambique',
    'chuvas culturas Moçambique',
    'pecuária Moçambique',
];

const CATEGORY_RULES: { pattern: RegExp; category: string }[] = [
    { pattern: /\b(evento|feira|conferência|congresso|workshop|seminário)\b/i, category: 'Evento' },
    { pattern: /\b(lei|legislação|decreto|regulamento|diploma)\b/i, category: 'Legislação' },
    { pattern: /\b(financiamento|crédito|fundo|investimento|subsídio|empréstimo)\b/i, category: 'Oportunidade' },
    { pattern: /\b(estudo|pesquisa científica|relatório)\b/i, category: 'Relatório' },
    { pattern: /\b(áfrica do sul|zimbabué|zâmbia|malawi|tanzânia|internacional|mundial|global|onu|fao)\b/i, category: 'Internacional' },
];

function guessCategory(text: string): string {
    for (const rule of CATEGORY_RULES) {
        if (rule.pattern.test(text)) return rule.category;
    }
    return 'Notícia';
}

function decodeHtmlEntities(text: string): string {
    return text
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&nbsp;/g, ' ');
}

function extractTag(chunk: string, tag: string): string {
    const match = chunk.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`));
    if (!match) return '';
    return decodeHtmlEntities(
        match[1].replace('<![CDATA[', '').replace(']]>', '').trim()
    );
}

interface RssItem {
    title: string;
    link: string;
    pubDate: string;
    description: string;
    source: string;
}

async function fetchRss(query: string): Promise<RssItem[]> {
    const url = `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=pt-MZ&gl=MZ&ceid=MZ:pt`;
    const res = await fetch(url, {
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; BaseAgroDataBot/1.0)' },
        cache: 'no-store',
    });
    if (!res.ok) throw new Error(`RSS ${res.status} para "${query}"`);
    const xml = await res.text();

    const items: RssItem[] = [];
    const chunks = xml.split('<item>').slice(1);
    for (const raw of chunks) {
        const chunk = raw.split('</item>')[0];
        const title = extractTag(chunk, 'title');
        const link = extractTag(chunk, 'link');
        const pubDate = extractTag(chunk, 'pubDate');
        const description = extractTag(chunk, 'description').replace(/<[^>]+>/g, '').trim();
        const sourceMatch = chunk.match(/<source[^>]*>([\s\S]*?)<\/source>/);
        const source = sourceMatch ? decodeHtmlEntities(sourceMatch[1].trim()) : '';
        if (title && link) items.push({ title, link, pubDate, description, source });
    }
    return items;
}

async function sendAlertEmail(count: number) {
    if (!process.env.SMTP_HOST) return;
    try {
        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: Number(process.env.SMTP_PORT) || 465,
            secure: Number(process.env.SMTP_PORT) === 465,
            auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
        });
        await transporter.sendMail({
            from: `"Base Agro Data" <${process.env.SMTP_USER}>`,
            to: process.env.SMTP_USER,
            subject: `${count} nova(s) notícia(s) à espera de revisão`,
            html: `<p>O robô de notícias encontrou <strong>${count}</strong> notícia(s) nova(s) sobre o sector agrário.</p>
                   <p>Reveja, edite o texto e publique em:
                   <a href="https://basededadosagro.com/pt/admin/noticias">Painel &rarr; Notícias &rarr; Pendentes do Robô</a>.</p>`,
        });
    } catch (err) {
        console.error('news-fetch: erro ao enviar email de alerta (não crítico):', err);
    }
}

export async function GET(req: Request) {
    const auth = req.headers.get('authorization');
    if (!process.env.CRON_SECRET || auth !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
    }

    try {
        const [{ data: existingArticles }, { data: existingPending }] = await Promise.all([
            supabaseAdmin.from('articles').select('source_url'),
            supabaseAdmin.from('articles_pending').select('source_url'),
        ]);

        const knownUrls = new Set<string>([
            ...(existingArticles || []).map((a: any) => a.source_url).filter(Boolean),
            ...(existingPending || []).map((a: any) => a.source_url).filter(Boolean),
        ]);

        const candidates: any[] = [];
        for (const query of QUERIES) {
            try {
                const items = await fetchRss(query);
                for (const item of items.slice(0, 8)) {
                    if (!item.link || knownUrls.has(item.link)) continue;
                    knownUrls.add(item.link);
                    candidates.push({
                        title: item.title,
                        snippet: item.description || null,
                        source: item.source || null,
                        source_url: item.link,
                        date: item.pubDate ? new Date(item.pubDate).toISOString().slice(0, 10) : null,
                        category: guessCategory(`${item.title} ${item.description}`),
                    });
                }
            } catch (err) {
                console.error(`news-fetch: falha na pesquisa "${query}":`, err);
            }
        }

        let inserted = 0;
        if (candidates.length > 0) {
            const { data, error } = await supabaseAdmin
                .from('articles_pending')
                .insert(candidates)
                .select('id');
            if (error) {
                console.error('news-fetch: erro ao guardar candidatos:', error);
            } else {
                inserted = data?.length || 0;
            }
        }

        if (inserted > 0) {
            await sendAlertEmail(inserted);
        }

        return NextResponse.json({ found: candidates.length, inserted });
    } catch (err: any) {
        console.error('news-fetch: erro geral:', err);
        return NextResponse.json({ error: err.message || 'erro desconhecido' }, { status: 500 });
    }
}
