import { supabase } from "@/lib/supabaseClient";

const CACHE_KEY = "admin_dashboard_stats_cache_v1";
const CACHE_TTL_MS = 8 * 60 * 60 * 1000; // 8 horas

export interface AdminDashboardStats {
    articles: number;
    companies: number;
    products: number;
    professionals: number;
    statsRows: number;
}

interface CacheEntry {
    data: AdminDashboardStats;
    cachedAt: number;
}

export function getCachedDashboardStats(): AdminDashboardStats | null {
    if (typeof window === "undefined") return null;
    try {
        const raw = window.localStorage.getItem(CACHE_KEY);
        if (!raw) return null;
        const entry: CacheEntry = JSON.parse(raw);
        if (Date.now() - entry.cachedAt > CACHE_TTL_MS) return null;
        return entry.data;
    } catch {
        return null;
    }
}

function setCachedDashboardStats(data: AdminDashboardStats) {
    if (typeof window === "undefined") return;
    try {
        const entry: CacheEntry = { data, cachedAt: Date.now() };
        window.localStorage.setItem(CACHE_KEY, JSON.stringify(entry));
    } catch {
        // localStorage indisponível (modo privado, quota cheia, etc.) — sem cache, sem problema.
    }
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
