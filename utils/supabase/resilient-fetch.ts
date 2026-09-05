// Retenta chamadas idempotentes (GET/HEAD) quando a REDE falha — "fetch
// failed" / ConnectTimeout — antes de desistir. O Supabase self-hosted
// deste projecto fica atrás da Cloudflare e, sob carga, o handshake chega
// a estourar o timeout interno do Node (~10s); um retry curto resolve a
// esmagadora maioria desses casos.
//
// Escritas (POST / PATCH / PUT / DELETE) NUNCA são retentadas aqui: se a
// primeira tentativa chegou a gravar mas a resposta perdeu-se, um retry
// duplicava a linha (ex.: dois comprovativos). Uma resposta HTTP de erro
// (4xx/5xx) também não é retentada — só a falha de rede é que conta.
export function resilientFetch(retries = 2, backoffMs = 400): typeof fetch {
    return async (input: Parameters<typeof fetch>[0], init?: Parameters<typeof fetch>[1]) => {
        const method = (init?.method || "GET").toUpperCase();
        const idempotent = method === "GET" || method === "HEAD";
        const maxAttempts = idempotent ? retries + 1 : 1;

        let lastErr: unknown;
        for (let attempt = 0; attempt < maxAttempts; attempt++) {
            try {
                return await fetch(input, init);
            } catch (err) {
                lastErr = err;
                if (attempt < maxAttempts - 1) {
                    await new Promise((r) => setTimeout(r, backoffMs * (attempt + 1)));
                }
            }
        }
        throw lastErr;
    };
}
