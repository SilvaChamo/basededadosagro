import { createClient } from '@supabase/supabase-js'

const getSupabaseConfig = () => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    // Validation to prevent build-time crashes if variables are missing
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
        if (process.env.NODE_ENV === 'production') {
            console.error('❌ CRITICAL: Supabase credentials missing or invalid in production!')
        } else {
            console.warn('⚠️ Warning: Supabase credentials missing during build/development.')
        }

        // Return a proxy that logs errors instead of fetching from a fake domain
        return new Proxy({} as any, {
            get: (_, prop) => {
                return () => {
                    console.error(`🔴 Supabase method "${String(prop)}" called via lib/supabaseClient.ts without valid configuration.`)
                    throw new Error(`Supabase client is not configured. Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY.`)
                }
            }
        })
    }

    return { url, key }
}

const config = getSupabaseConfig()
// Note: If both url and key are strings, config will have them. 
// If it returned the proxy, createClient will likely fail or we can handle it.
// To be safe with supabase-js:
export const supabase = (config as any).url
    ? createClient((config as any).url, (config as any).key, { db: { schema: 'basededados' } })
    : config as any; // This would be the proxy
