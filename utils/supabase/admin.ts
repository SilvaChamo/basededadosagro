import { createClient } from '@supabase/supabase-js';
import { resilientFetch } from './resilient-fetch';

export function createAdminClient() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

    if (!supabaseUrl || !supabaseServiceRoleKey) {
        throw new Error("Missing Supabase URL or Service Role Key");
    }

    return createClient(supabaseUrl, supabaseServiceRoleKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
        },
        db: { schema: 'basededados' },
        // Re-tenta leituras quando a rede falha (Supabase atrás da Cloudflare
        // fica lento sob carga) — ver resilient-fetch.ts.
        global: { fetch: resilientFetch() },
    });
}
