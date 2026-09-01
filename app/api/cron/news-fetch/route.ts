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
//
//  - `label`      nome amigável que aparece como "Fonte:" na notícia.
//  - `maxAgeDays` (opcional) encurta a janela de recolha só para esta fonte.
//                 Nunca a alarga: o tecto global MAX_AGE_DAYS manda sempre.
//
// As fontes generalistas entram só como "rede de pesca": um artigo delas só
// passa se o filtro de relevância o marcar como agricultura ou clima/ambiente
// (ver isRelevantNews). Notícia geral nunca entra, venha de onde vier.
const FEEDS: { url: string; label: string; maxAgeDays?: number }[] = [
    // Especializadas em agricultura / agro em Moçambique.
    { url: 'https://www.agricultura.gov.mz/feed/', label: 'Ministério da Agricultura' },
    { url: 'https://revistaterraonline.com/destaques/feed/', label: 'Revista Terra' },
    // Generalistas de Moçambique — "rede de pesca": um artigo só passa se o
    // filtro de relevância (isRelevantNews) o marcar como agricultura ou
    // clima/ambiente. Quantas mais fontes, mais material relevante apanhado.
    { url: 'https://jornalnoticias.co.mz/feed/', label: 'Jornal Notícias' },
    { url: 'https://opais.co.mz/feed/', label: 'O País' },
    { url: 'https://cartamz.com/feed/', label: 'Carta de Moçambique' },
    { url: 'https://jornaldomingo.co.mz/feed/', label: 'Jornal Domingo' },
    { url: 'https://mmo.co.mz/feed/', label: 'MMO' },
    { url: 'https://360mozambique.com/feed/', label: '360 Mozambique' },
    { url: 'https://evidencias.co.mz/feed/', label: 'Evidências' },
    // Club of Mozambique saiu: o feed passou a responder 403 (bloqueio de bots).
];

// Só guardamos notícias recentes: nada com mais de 14 dias, em TODAS as
// fontes (pedido do utilizador, 31 ago — antes era "mês em curso", e as
// fontes dedicadas não tinham corte de data nenhum). As já publicadas em
// `articles` nunca são tocadas por este filtro.
const MAX_AGE_DAYS = 14;

// Filtro de relevância (ver isRelevantNews mais abaixo). A plataforma é
// sobre agricultura + clima/ambiente em Moçambique, por isso entram:
//   • qualquer notícia de agricultura / sector agrário  (AGRI_TERMS)
//   • qualquer notícia de clima, tempo, ambiente ou desastre natural,
//     mesmo sem ligação directa à lavoura                (CLIMATE_ENV_TERMS)
// e ficam de fora política, desporto, crime e entretenimento (BLOCK_TERMS).
// A sigla do ministério (MADER/MAAP) fica de fora de propósito — aparece
// em todos os comunicados, qualquer que seja o tema.
const AGRI_TERMS = [
    // Núcleo agrícola / agro / agrário
    'agr[ií]cola', 'agricultur\\w*', 'agr[oó]nom\\w*', 'agroneg[oó]cio',
    'agr[oó]\\s?-?\\s?ind[uú]stri\\w*', 'agropecu[aá]ri\\w*', 'agro\\s?-?\\s?pecu[aá]ri\\w*',
    'agr[aá]ri[oa]s?', 'agroprocessa\\w*', 'agroflorest\\w*', 'agro-?ecolog\\w*',
    // Pecuária e criação animal
    'pecu[aá]ri\\w*', 'avicultur\\w*', 'suinicultur\\w*', 'bovinicultur\\w*',
    'piscicultur\\w*', 'aqui?cultur\\w*', 'apicultur\\w*',
    '\\bgado\\b', 'rebanho\\w*', 'bovinos?', 'caprinos?', 'su[ií]nos?', 'capoeira',
    // Gente do campo
    'campon[eê]s\\w*', 'agricultor\\w*', 'lavrador\\w*', 'pequenos? produtor\\w*',
    // Actividade agrícola
    'lavoura\\w*', 'colheita\\w*', '\\bsafra\\b', 'campanha agr[aá]ria', 'planta[çc][aã]o',
    'sementeir\\w*', '\\bsementes?\\b', 'plant[ií]o', '\\bcultivo\\w*', 'produ[çc][aã]o agr[ií]cola',
    'produ[çc][aã]o de alimentos', 'produ[çc][aã]o alimentar', 'produtiv\\w* agr[ií]cola',
    // Água, solo, insumos
    'irriga[çc]\\w*', 'regadio', 'fertilizante\\w*', '\\baduba?o\\w*', 'cal[çc][aá]rio agr[ií]cola',
    'insumos? agr[ií]cola\\w*', 'mecaniza[çc][aã]o agr[ií]cola', 'semente\\w* melhorada\\w*',
    // Pragas / sanidade
    '\\bpraga\\w*', 'gafanhoto\\w*', 'lagarta\\w*', 'peste su[ií]na', 'gripe aviária',
    'fitossanit[aá]ri\\w*',
    // Culturas
    '\\bmilho\\b', '\\barroz\\b', '\\btrigo\\b', '\\bfeij[aã]o\\b', '\\bsoja\\b', 'mapira',
    'mexoeira', '\\bsorgo\\b', 'mandioca', 'batata\\s?-?doce', 'hort[ií]cola\\w*',
    'hortali[çc]a\\w*', 'oler[ií]cola\\w*', 'gergelim', 'amendoim', 'girassol',
    'cana\\s?-?de\\s?-?a[çc][uú]car', '\\btabaco\\b', 'cajueiro\\w*', 'castanha de caju',
    '\\bcaju\\b', 'algod[aã]o', 'macad[aâ]mia', '\\bcitrinos\\b',
    // Sistema agrário / instituições especializadas
    'extens[aã]o rural', 'desenvolvimento rural', 'seguran[çc]a alimentar',
    'soberania alimentar', 'cadeia\\w* de valor agr\\w*', 'sistema\\w* alimentar\\w*',
    '\\bIIAM\\b', '\\bINIR\\b', '\\bSETSAN\\b',
    // Inglês (Club of Mozambique publica em inglês)
    'agricultur\\w*', 'agri-?business', 'agronom\\w*', '\\bfarm(?:ers?|ing|land|s)\\b',
    '\\bcrops?\\b', '\\bharvest\\w*', '\\blivestock\\b', '\\birrigation\\b',
    '\\bfertili[sz]er\\w*', '\\bseeds?\\b', '\\bmaize\\b', '\\bcassava\\b',
    '\\bsmallholder\\w*', 'food security', 'food production', 'agri-?food',
    'beekeep\\w*', 'apicultur\\w*', '\\bpoultry\\b', '\\bcattle\\b', '\\bgrain\\b',
    'horticultur\\w*', 'plantation\\w*', 'greenhouse\\w*', 'estufas? agr\\w*',
];
const AGRI_PATTERN = new RegExp(AGRI_TERMS.join('|'), 'i');

// Clima + tempo + ambiente + desastres naturais. O utilizador quer estes
// temas TODOS, mesmo sem ligação directa à lavoura ("chuvas cortam
// estradas", "ciclone destrói Quelimane", "nível do mar sobe").
const CLIMATE_ENV_TERMS = [
    // Clima / carbono
    'clima\\b', 'clim[aá]tic\\w*', 'mudan[çc]as? clim\\w*', 'altera[çc][õo]es? clim\\w*',
    'aquecimento global', 'crise clim\\w*', 'emerg[êe]ncia clim\\w*', 'resili[êe]ncia clim\\w*',
    'ac[çc][aã]o clim\\w*', 'adapta[çc][aã]o clim\\w*', 'clima-?smart', 'climate-?smart', 'climate change',
    'gases? com efeito de estufa', 'emiss[õo]es de (?:carbono|gases|co2|di[óo]xido)',
    'cr[ée]ditos? de carbono', 'neutralidade carb[óo]nica', 'pegada de carbono', 'sequestro de carbono',
    'transi[çc][aã]o energ[ée]tica', 'energias? renov\\w*', 'fotovoltaic\\w*', 'e[óo]lic[ao]s?\\b',
    // Seca / água / desertificação
    '\\bseca\\b', '\\bsecas\\b', 'estiagem', 'aridez', 'desertifica[çc][aã]o',
    'degrada[çc][aã]o (?:do solo|da terra|dos solos)', 'eros[aã]o (?:do solo|costeira|dos solos)',
    'd[ée]fice h[ií]drico', 'stress h[ií]drico', 'escassez de [aá]gua', 'seguran[çc]a h[ií]drica',
    'recursos h[ií]dricos', 'bacia hidrogr[aá]fica', 'barragem\\w*', 'len[çc]ol fre[aá]tico',
    // Chuva / tempo / meteorologia
    '\\bchuvas?\\b', 'precipita[çc][aã]o', '[ée]poca chuvosa', '\\bsequeiro\\b', 'irregularidade das chuvas',
    'meteorolog\\w*', '\\bINAM\\b', 'previs[aã]o do tempo', 'mau tempo', 'vento\\w* fort\\w*',
    'ventos? ciclonic\\w*', 'temporal\\b', 'trovoada\\w*', 'granizo', 'onda de calor', 'vaga de calor',
    // Ciclones / cheias / calamidades
    '\\bcheias?\\b', 'inunda[çc][õo]es?', 'enxurrada\\w*', 'aluvi[aã]o', 'ciclone\\w*',
    'depress[aã]o tropical', 'tempestade tropical', 'desliza\\w* de terras?', 'calamidade\\w*',
    'desastres? naturais?', 'cat[aá]strofe\\w* natural\\w*', '\\bINGD\\b', 'popula[çc][õo]es? afectad\\w*',
    'el ni[nñ]o', 'la ni[nñ]a', 'fen[óo]meno\\w* clim\\w*', 'eventos? clim\\w*', 'extremos clim\\w*',
    'n[íi]vel do mar', 'zona\\w* costeira\\w*',
    // Ambiente / natureza / floresta
    'meio ambiente', 'ambient(?:al|ais)\\w*', 'ambientalist\\w*', 'sustentabilidade', 'desenvolvimento sustent\\w*',
    'biodiversidade', 'ecossistema\\w*', 'conserva[çc][aã]o (?:da natureza|ambiental|de recursos|marinha)',
    '[aá]reas? de conserva[çc][aã]o', '[aá]reas? protegidas?', 'parque nacional', 'reserva natural',
    '\\bfauna\\b', 'vida selvagem', 'esp[ée]cies? amea[çc]ad\\w*', 'ca[çc]a furtiva',
    'floresta\\w*', 'desfloresta[çc][aã]o', 'reflorest\\w*', 'queimadas?', 'inc[êe]ndios? florest\\w*',
    '\\bmangal\\b', 'mangais', 'polui[çc][aã]o', 'res[íi]duos s[óo]lidos', 'lixo pl[aá]stico',
    // Inglês
    '\\bdrought\\b', '\\brainfall\\b', 'greenhouse gas', 'climate resilien\\w*', 'sea[- ]level',
    'deforestation', 'biodiversity', 'cyclone\\w*', 'flooding', '\\bfloods?\\b',
    'national park', 'wildlife', 'conservation area', 'mangrove\\w*', 'reforestation',
];
const CLIMATE_ENV_PATTERN = new RegExp(CLIMATE_ENV_TERMS.join('|'), 'i');

// Fora do âmbito da plataforma: política, desporto, crime, entretenimento.
// NOTA (31 ago): já não é usado — o filtro passou a "só entra agricultura ou
// clima", por isso tudo o resto fica de fora sem precisar desta lista. Fica
// aqui guardado caso se volte a querer uma barreira explícita a estes temas.
const BLOCK_TERMS = [
    // Política
    '\\belei[çc][õo]es\\b', 'eleitoral\\w*', 'recenseamento eleitoral', '\\bpartido\\b', '\\bpartid[áa]ri\\w*',
    '\\bFrelimo\\b', '\\bRenamo\\b', '\\bMDM\\b', 'parlament\\w*', 'assembleia da rep[uú]blica',
    'assembleia municipal', '\\bbancada\\b', 'deputad\\w*', 'remodela[çc][aã]o governament\\w*',
    'toma(?:da|r) de posse', 'conselho de ministros', 'mo[çc][aã]o de censura', 'referendo',
    'campanha eleitoral', '\\bsondagem\\w*', 'l[íi]der da oposi[çc][aã]o', 'oposi[çc][aã]o pol[ií]tica',
    '\\bgreve\\w*', 'd[íi]vidas ocultas', 'processo-?crime',
    // Desporto
    '\\bfutebol\\b', '\\bMambas\\b', '\\bgolos?\\b', 'ta[çc]a das na[çc][õo]es', '\\bCOSAFA\\b',
    'mo[çc]ambola', 'campeonato\\w*', 'est[aá]dio\\w*', 'treinador\\w*', 'atletismo', 'basquetebol',
    'andebol', 'jogos escolares', 'sele[çc][çc][aã]o nacional', 'liga (?:mo[çc]|desport|dos campe)',
    // Crime / faits divers
    'esfaquead\\w*', 'homic[íi]dio\\w*', 'assassinad\\w*', 'assassinato\\w*', 'raptad\\w*',
    'sequestrad\\w*', '\\brapto\\w*', 'roubo à mão armada', 'assalto à mão armada',
    'tr[aá]fico de droga\\w*', 'estupefacientes', 'viola[çc][aã]o sexual', 'corpo sem vida',
    'linchamento\\w*', 'detid\\w* pela pol[íi]cia',
    // Entretenimento / cultura
    '\\bm[uú]sica\\b', 'concerto\\w*', 'espect[aá]culo\\w*', '\\bartista\\w*', '\\bcantor\\w*',
    '\\brapper\\b', '\\bfilme\\w*', 'celebridade\\w*', 'desfile de moda', 'passadeira vermelha',
    'festival (?:de m[uú]sica|de cinema|cultural)',
];
const BLOCK_PATTERN = new RegExp(BLOCK_TERMS.join('|'), 'i');

// Só passa quem fala mesmo de agricultura ou de clima/ambiente. Tudo o
// resto fica de fora, venha de fonte generalista ou especializada — o
// utilizador quer a plataforma apenas com estes dois temas (31 ago).
function isRelevantNews(text: string): boolean {
    if (AGRI_PATTERN.test(text)) return true;          // agricultura — entra
    if (CLIMATE_ENV_PATTERN.test(text)) return true;   // clima / tempo / ambiente / desastres — entra
    return false;                                      // qualquer outra coisa — fora
}

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
            html: `<p>Foram encontradas <strong>${count}</strong> notícia(s) nova(s) sobre agricultura, clima e ambiente.</p>
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

        const candidates: any[] = [];
        const perFeed: Record<string, { found: number; kept: number }> = {};

        for (const feed of FEEDS) {
            let items: RssItem[] = [];
            try {
                items = await fetchFeed(feed.url);
            } catch (err) {
                console.error(`news-fetch: falha no feed "${feed.url}":`, err);
                continue;
            }

            // Janela de tempo: tecto global de MAX_AGE_DAYS dias para todas
            // as fontes; `maxAgeDays` na fonte só pode encurtar, nunca alargar.
            const ageDays = Math.min(feed.maxAgeDays ?? MAX_AGE_DAYS, MAX_AGE_DAYS);
            const cutoff = Date.now() - ageDays * 24 * 60 * 60 * 1000;

            perFeed[feed.label] = { found: items.length, kept: 0 };

            for (const item of items) {
                if (!item.link || knownUrls.has(item.link)) continue;
                // Só agricultura ou clima/ambiente, em TODAS as fontes.
                if (!isRelevantNews(`${item.title} ${item.description}`)) continue;

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
                    source: feed.label || sourceHost,
                    source_url: item.link,
                    image_url: image,
                    date: !isNaN(ts) ? new Date(ts).toISOString().slice(0, 10) : null,
                    category: guessCategory(`${item.title} ${item.description}`),
                });
                perFeed[feed.label].kept++;
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

        return NextResponse.json({ found: candidates.length, inserted, perFeed });
    } catch (err: any) {
        console.error('news-fetch: erro geral:', err);
        return NextResponse.json({ error: err.message || 'erro desconhecido' }, { status: 500 });
    }
}
