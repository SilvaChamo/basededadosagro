import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    const isValidUrl = (u: string | undefined): u is string => {
        if (!u) return false
        try {
            new URL(u)
            return true
        } catch {
            return false
        }
    }

    if (!isValidUrl(url) || !key) {
        if (typeof window === 'undefined' && process.env.NODE_ENV !== 'production') {
            console.warn('⚠️ Warning: Supabase credentials missing in utils/supabase/client.ts during build.')
        } else if (typeof window !== 'undefined') {
            console.error('❌ Error: Supabase URL or Anon Key is missing. Check your .env.local file.')
        }

        // Return a proxy that logs errors instead of fetching from a fake domain
        return new Proxy({} as any, {
            get: (_, prop) => {
                return () => {
                    console.error(`🔴 Supabase method "${String(prop)}" called without valid configuration.`)
                    throw new Error(`Supabase client is not configured. Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY.`)
                }
            }
        })
    }

    return createBrowserClient(url, key, { db: { schema: 'basededados' } })
}
