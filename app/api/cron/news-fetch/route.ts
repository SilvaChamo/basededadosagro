import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import nodemailer from 'nodemailer';

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { db: { schema: 'basededados' } }
);

const BROWSER_UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

// Fontes com feed RSS directo (link real do artigo, não um redirect do
// Google) — só assim conseguimos ir buscar o texto e a imagem reais.
const FEEDS = [
    'https://jornalnoticias.co.mz/feed/',
    'https://clubofmozambique.com/feed/',
];

// Só guardamos notícias destes últimos N dias (pedido do utilizador — as já
// publicadas em `articles` nunca são tocadas por este filtro).
const MAX_AGE_DAYS = 7;

// Filtro de relevância por palavra-chave (as fontes são generalistas, não só
// de agricultura).
const RELEVANCE_PATTERN = /\b(agr[ií]cola|agricultura|agr[oó]nomo|agron[eé]gocio|agropecu[aá]ria|pecu[aá]ria|gado|milho|arroz|algod[aã]o|cajueiro|caju|semente|colheita|planta[çc][aã]o|irriga[çc][aã]o|fertilizante|adubo|praga|seca|chuvas?|clima\b.*cultura|iiam|camponeses?|agricultores?|farm(ing|er)?|crop|livestock|harvest|irrigation|agri(business|culture)?)\b/i;

const CATEGORY_RULES: { pattern: RegExp; category: string }[] = [
    { pattern: /\b(evento|feira|conferência|congresso|workshop|seminário|conference|summit)\b/i, category: 'Evento' },
    { pattern: /\b(lei|legislação|decreto|regulamento|diploma|law|regulation)\b/i, category: 'Legislação' },
    { pattern: /\b(financiamento|crédito|fundo|investimento|subsídio|empréstimo|investment|funding|loan)\b/i, category: 'Oportunidade' },
    { pattern: /\b(estudo|pesquisa científica|relatório|report|study)\b/i, category: 'Relatório' },
    { pattern: /\b(áfrica do sul|zimbabué|zâmbia|malawi|tanzânia|internacional|mundial|global|onu|fao|international)\b/i, category: 'Internacional' },
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
        .replace(/&#8217;/g, "'")
        .replace(/&#8216;/g, "'")
        .replace(/&#8220;/g, '"')
        .replace(/&#8221;/g, '"')
        .replace(/&#8211;/g, '-')
        .replace(/&#8230;/g, '…')
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
}

async function fetchFeed(feedUrl: string): Promise<RssItem[]> {
    const res = await fetch(feedUrl, {
        headers: { 'User-Agent': BROWSER_UA },
        cache: 'no-store',
    });
    if (!res.ok) throw new Error(`Feed ${res.status} para "${feedUrl}"`);
    const xml = await res.text();

    const items: RssItem[] = [];
    const chunks = xml.split('<item>').slice(1);
    for (const raw of chunks) {
        const chunk = raw.split('</item>')[0];
        const title = extractTag(chunk, 'title');
        const link = extractTag(chunk, 'link');
        const pubDate = extractTag(chunk, 'pubDate');
        const description = extractTag(chunk, 'description').replace(/<[^>]+>/g, '').trim();
        if (title && link) items.push({ title, link, pubDate, description });
    }
    return items;
}

interface ArticleContent {
    image: string | null;
    snippet: string | null;
}

// Vai buscar a página real do artigo (link directo da fonte, não um
// redirect do Google) e extrai a imagem principal (og:image) e um resumo
// substancial do texto — sem IA, só extracção directa dos parágrafos.
async function fetchArticleContent(url: string): Promise<ArticleContent> {
    try {
        const res = await fetch(url, {
            headers: { 'User-Agent': BROWSER_UA },
            cache: 'no-store',
            signal: AbortSignal.timeout(10000),
        });
        if (!res.ok) return { image: null, snippet: null };
        const html = await res.text();

        const imageMatch = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i)
            || html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i);
        const image = imageMatch ? decodeHtmlEntities(imageMatch[1]) : null;

        const paraMatches = [...html.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/gi)];
        const paragraphs = paraMatches
            .map((m) => decodeHtmlEntities(m[1].replace(/<[^>]+>/g, '').trim()))
            .filter((p) => p.length > 40 && !/^(share|leia também|leia mais|related|publicidade)/i.test(p));

        if (paragraphs.length === 0) return { image, snippet: null };

        // Artigo completo, tal como vem na fonte — só com um tecto de
        // segurança para não guardar algo desproporcionalmente gigante.
        const snippet = paragraphs.join('\n\n').slice(0, 20000);

        return { image, snippet };
    } catch (err) {
        console.error(`news-fetch: falha a extrair conteúdo de ${url}:`, err);
        return { image: null, snippet: null };
    }
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
            html: `<p>Foram encontradas <strong>${count}</strong> notícia(s) nova(s) sobre o sector agrário.</p>
                   <p>Reveja, edite o texto e publique em:
                   <a href="https://basededadosagro.com/pt/admin/noticias">Painel &rarr; Notícias &rarr; Notícias pendentes</a>.</p>`,
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

        const cutoff = Date.now() - MAX_AGE_DAYS * 24 * 60 * 60 * 1000;
        const candidates: any[] = [];

        for (const feedUrl of FEEDS) {
            let items: RssItem[] = [];
            try {
                items = await fetchFeed(feedUrl);
            } catch (err) {
                console.error(`news-fetch: falha no feed "${feedUrl}":`, err);
                continue;
            }

            for (const item of items) {
                if (!item.link || knownUrls.has(item.link)) continue;
                if (!RELEVANCE_PATTERN.test(`${item.title} ${item.description}`)) continue;

                const ts = item.pubDate ? new Date(item.pubDate).getTime() : NaN;
                if (!isNaN(ts) && ts < cutoff) continue;

                knownUrls.add(item.link);
                const sourceHost = (() => {
                    try { return new URL(item.link).hostname.replace(/^www\./, ''); } catch { return null; }
                })();

                const { image, snippet } = await fetchArticleContent(item.link);

                candidates.push({
                    title: item.title,
                    snippet: snippet || item.description || null,
                    source: sourceHost,
                    source_url: item.link,
                    image_url: image,
                    date: !isNaN(ts) ? new Date(ts).toISOString().slice(0, 10) : null,
                    category: guessCategory(`${item.title} ${item.description}`),
                });
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
