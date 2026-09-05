import { supabase } from "@/lib/supabaseClient";

const CACHE_TTL_MS = 8 * 60 * 60 * 1000; // 8 horas

export interface AdminDashboardStats {
    articles: number;
    companies: number;
    products: number;
    professionals: number;
    statsRows: number;
}

interface CacheEntry<T> {
    data: T;
    cachedAt: number;
}

// Leitura/escrita genérica em localStorage com TTL — cada chamador escolhe a
// sua própria chave e TTL consoante a rapidez com que os dados envelhecem.
function readCache<T>(key: string, ttlMs: number): T | null {
    if (typeof window === "undefined") return null;
    try {
        const raw = window.localStorage.getItem(key);
        if (!raw) return null;
        const entry: CacheEntry<T> = JSON.parse(raw);
        if (Date.now() - entry.cachedAt > ttlMs) return null;
        return entry.data;
    } catch {
        return null;
    }
}

function writeCache<T>(key: string, data: T) {
    if (typeof window === "undefined") return;
    try {
        const entry: CacheEntry<T> = { data, cachedAt: Date.now() };
        window.localStorage.setItem(key, JSON.stringify(entry));
    } catch {
        // localStorage indisponível (modo privado, quota cheia, etc.) — sem cache, sem problema.
    }
}

const STATS_CACHE_KEY = "admin_dashboard_stats_cache_v1";

export function getCachedDashboardStats(): AdminDashboardStats | null {
    return readCache<AdminDashboardStats>(STATS_CACHE_KEY, CACHE_TTL_MS);
}

function setCachedDashboardStats(data: AdminDashboardStats) {
    writeCache(STATS_CACHE_KEY, data);
}

// Corre as mesmas queries que o dashboard admin precisa e guarda o resultado em cache.
// Usado tanto pelo próprio dashboard como pelo pré-carregamento no login.
export async function fetchAndCacheDashboardStats(): Promise<AdminDashboardStats> {
    const counts = await Promise.all([
        supabase.from('articles').select('*', { count: 'exact', head: true }),
        supabase.from('companies').select('*', { count: 'exact', head: true }),
        supabase.from('products').select('*', { count: 'exact', head: true }),
        supabase.from('professionals').select('*', { count: 'exact', head: true }),
        supabase.from('agricultural_stats').select('*', { count: 'exact', head: true }),
    ]);

    const data: AdminDashboardStats = {
        articles: counts[0].count || 0,
        companies: counts[1].count || 0,
        products: counts[2].count || 0,
        professionals: counts[3].count || 0,
        statsRows: counts[4].count || 0,
    };

    setCachedDashboardStats(data);
    return data;
}

// Chamado logo após o login confirmar a password certa, antes de navegar para /admin.
// Nunca deve bloquear o login além do tempo dado por maxWaitMs — se demorar mais,
// o dashboard simplesmente busca os dados sozinho ao abrir, como fazia antes.
export function prefetchDashboardStats(maxWaitMs = 4000): Promise<void> {
    const prefetch = fetchAndCacheDashboardStats().then(() => undefined).catch(() => undefined);
    const timeout = new Promise<void>((resolve) => setTimeout(resolve, maxWaitMs));
    return Promise.race([prefetch, timeout]);
}

export interface RecentItem {
    id: string;
    name: string;
    href: string;
    type: string;
    created_at: string;
}

export interface AdminDashboardExtra {
    pendingCount: number;
    weeklyArticlesCount: number;
    recentItems: RecentItem[];
    pendingPaymentsCount: number;
}

const EXTRA_CACHE_KEY = "admin_dashboard_extra_cache_v1";
// TTL curto de propósito: ao contrário dos totais do site (8h, mudam pouco),
// isto é actividade recente e contagem de pendentes — quer-se que pareça
// sempre actual, só evita reprocessar tudo a cada clique dentro da mesma sessão curta.
const EXTRA_CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutos

export function getCachedDashboardExtra(): AdminDashboardExtra | null {
    return readCache<AdminDashboardExtra>(EXTRA_CACHE_KEY, EXTRA_CACHE_TTL_MS);
}

// Junta num só Promise.all as contagens (pendentes, notícias da semana) e as
// listas recentes das 4 tabelas — antes eram dois efeitos separados na página,
// cada um com o seu próprio grupo de pedidos.
export async function fetchAndCacheDashboardExtra(): Promise<AdminDashboardExtra> {
    const sinceOneWeek = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

    // "Pendentes" no dashboard tem de bater certo com o que a própria vista
    // /admin/noticias?tab=Pendentes considera pendente: fila do robô
    // (articles_pending) SOMADA aos artigos reais em revisão
    // (articles.publish_status='review') — antes só contava a primeira, por
    // isso o card dizia "0" mesmo havendo notícias por rever. Não replica
    // aqui os filtros finos de categoria/arquivadas que a vista aplica do
    // lado do cliente (relatório não conta como "notícia", arquivadas não
    // contam) — preferível um número um pouco por cima do que arriscar uma
    // consulta partida a voltar a mostrar zero.
    const [pendingResult, pendingReviewResult, weeklyResult, companiesRecent, productsRecent, professionalsRecent, articlesRecent, pendingPaymentsResult] = await Promise.all([
        supabase.from('articles_pending').select('*', { count: 'exact', head: true }),
        supabase.from('articles').select('*', { count: 'exact', head: true })
            .is('deleted_at', null)
            .eq('publish_status', 'review'),
        supabase.from('articles').select('*', { count: 'exact', head: true }).gte('created_at', sinceOneWeek),
        supabase.from('companies').select('id, name, created_at').order('created_at', { ascending: false }).limit(15),
        supabase.from('products').select('id, name, created_at').order('created_at', { ascending: false }).limit(15),
        supabase.from('professionals').select('id, name, created_at').order('created_at', { ascending: false }).limit(15),
        supabase.from('articles').select('id, title, created_at').order('created_at', { ascending: false }).limit(15),
        // Comprovativos de transferência bancária por aprovar — política de
        // leitura própria em payment_transactions (só admin vê todas as
        // linhas; um utilizador normal só vê as suas, por RLS).
        supabase.from('payment_transactions').select('*', { count: 'exact', head: true }).eq('method', 'visa').eq('status', 'pending'),
    ]);

    // Descarta linhas sem nome preenchido em vez de mostrar um placeholder —
    // por isso busca-se mais (15) do que o necessário (3) por tabela.
    const toItems = (rows: any[] | null, type: string, base: string, field = "name"): RecentItem[] =>
        (rows || [])
            .filter((r) => r[field] && String(r[field]).trim())
            .map((r) => ({ id: r.id, name: r[field], type, created_at: r.created_at, href: `${base}/${r.id}` }));

    const recentItems = [
        ...toItems(companiesRecent.data, "Empresa", "/admin/empresas"),
        ...toItems(productsRecent.data, "Produto", "/admin/produtos"),
        ...toItems(professionalsRecent.data, "Profissional", "/admin/profissionais"),
        ...toItems(articlesRecent.data, "Notícia", "/admin/noticias", "title"),
    ]
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 3);

    const data: AdminDashboardExtra = {
        pendingCount: (pendingResult.count || 0) + (pendingReviewResult.count || 0),
        weeklyArticlesCount: weeklyResult.count || 0,
        recentItems,
        pendingPaymentsCount: pendingPaymentsResult.count || 0,
    };

    writeCache(EXTRA_CACHE_KEY, data);
    return data;
}
