// Cache genérico em localStorage para listas do painel admin (Empresas,
// Produtos, Notícias, etc.) — mesmo padrão já usado em lib/adminDashboardCache.ts,
// generalizado para qualquer página poder ter a sua própria chave/TTL.
//
// TTL curto de propósito (90s por omissão): o objectivo não é dados "quase
// estáticos" como os totais do site, é só evitar reprocessar tudo sempre que
// se navega para fora da página e se volta dentro da mesma sessão curta.
// Cada leitura, mesmo com cache válido, deve disparar sempre uma actualização
// em segundo plano (stale-while-revalidate) — nunca ficar preso a um valor
// desactualizado. E qualquer criação/edição/eliminação deve invalidar a
// chave logo a seguir, para não mostrar dados de antes da alteração.
const PREFIX = "admin_list_cache_v1:";
export const DEFAULT_LIST_CACHE_TTL_MS = 90 * 1000;

interface CacheEntry<T> {
    data: T;
    cachedAt: number;
}

export function getCachedList<T>(key: string, ttlMs: number = DEFAULT_LIST_CACHE_TTL_MS): T | null {
    if (typeof window === "undefined") return null;
    try {
        const raw = window.localStorage.getItem(PREFIX + key);
        if (!raw) return null;
        const entry: CacheEntry<T> = JSON.parse(raw);
        if (Date.now() - entry.cachedAt > ttlMs) return null;
        return entry.data;
    } catch {
        return null;
    }
}

export function setCachedList<T>(key: string, data: T) {
    if (typeof window === "undefined") return;
    try {
        const entry: CacheEntry<T> = { data, cachedAt: Date.now() };
        window.localStorage.setItem(PREFIX + key, JSON.stringify(entry));
    } catch {
        // localStorage indisponível (modo privado, quota cheia, etc.) — sem cache, sem problema.
    }
}

// Chamar logo após qualquer criação/edição/eliminação bem sucedida, para a
// próxima leitura não devolver a versão de antes da alteração.
export function invalidateCachedList(key: string) {
    if (typeof window === "undefined") return;
    try {
        window.localStorage.removeItem(PREFIX + key);
    } catch {
        // ignorar
    }
}
