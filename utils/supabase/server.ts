import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

interface Cookie {
    name: string
    value: string
    options?: any
}

export async function createClient() {
    const cookieStore = await cookies()

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

    const config = {
        url: isValidUrl(url) ? url : 'https://placeholder.supabase.co',
        key: key || 'placeholder-key'
    }

    if (!isValidUrl(url) || !key) {
        if (process.env.NODE_ENV !== 'production') {
            console.warn('⚠️ Warning: Supabase credentials missing or invalid in utils/supabase/server.ts.')
        }

        // Return a proxy that returns empty data/error responses instead of throwing
        // This prevents 500 errors in Server Components
        return new Proxy({} as any, {
            get: (_, prop) => {
                if (prop === 'auth') {
                    return new Proxy({} as any, {
                        get: (_, authProp) => {
                            if (authProp === 'getUser' || authProp === 'getSession') {
                                return async () => ({ data: { user: null, session: null }, error: null })
                            }
                            return () => {
                                console.error(`🔴 Supabase auth method "${String(authProp)}" called without configuration.`)
                                return { data: null, error: new Error('Supabase not configured') }
                            }
                        }
                    })
                }
                return () => ({
                    from: () => ({
                        select: () => ({
                            eq: () => ({
                                order: () => ({
                                    limit: () => Promise.resolve({ data: [], error: null })
                                }),
                                limit: () => Promise.resolve({ data: [], error: null }),
                                single: () => Promise.resolve({ data: null, error: null })
                            }),
                            single: () => Promise.resolve({ data: null, error: null })
                        })
                    }),
                    rpc: () => Promise.resolve({ data: null, error: null })
                })
            }
        })
    }

    return createServerClient(
        config.url,
        config.key,
        {
            cookies: {
                getAll() {
                    return cookieStore.getAll()
                },
                setAll(cookiesToSet: Cookie[]) {
                    try {
                        cookiesToSet.forEach(({ name, value, options }) =>
                            cookieStore.set(name, value, options)
                        )
                    } catch {
                        // The `setAll` method was called from a Server Component.
                        // This can be ignored if you have middleware refreshing
                        // user sessions.
                    }
                },
            },
        }
    )
}
