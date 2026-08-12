import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url)
    const code = searchParams.get('code')
    // if "next" is in search params, use it as the redirection URL
    const next = searchParams.get('next') ?? '/usuario/dashboard'

    if (code) {
        const supabase = await createClient()
        const { error, data } = await supabase.auth.exchangeCodeForSession(code)

        if (!error && data.user) {
            // Check for admin role and plan
            const { data: profile } = await supabase
                .from('profiles')
                .select('role, plan')
                .eq('id', data.user.id)
                .single()

            if (profile?.role === 'admin') {
                return NextResponse.redirect(`${origin}/admin`)
            }

            // All users end up on the destination or dashboard
            const targetNext = next;


            const forwardedHost = request.headers.get('x-forwarded-host') // i.e. local.com:3000
            const isLocalEnv = process.env.NODE_ENV === 'development'
            if (isLocalEnv) {
                // we can be sure that origin is http://localhost:3000
                return NextResponse.redirect(`${origin}${targetNext}`)
            } else if (forwardedHost) {
                return NextResponse.redirect(`https://${forwardedHost}${targetNext}`)
            } else {
                return NextResponse.redirect(`${origin}${targetNext}`)
            }
        }
    }

    // return the user to an error page with instructions
    return NextResponse.redirect(`${origin}/auth/login?status=error&message=Authentication failed`)
}
