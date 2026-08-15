import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin'
import { isAdminRole, isNewsTeamRole } from '@/lib/roles'

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
            let { data: profile } = await supabase
                .from('profiles')
                .select('role, plan')
                .eq('id', data.user.id)
                .single()

            // A mesma pessoa pode ter entrado antes por email+password (outro id de
            // auth) e agora está a entrar pela primeira vez via Google/OAuth — o
            // Supabase cria um utilizador novo nesse caso, sem o role elevado.
            // Em vez de a mandar para a área de cliente, herda o role da conta
            // já existente com o mesmo email.
            if (!isAdminRole(profile?.role) && !isNewsTeamRole(profile?.role) && data.user.email) {
                const admin = createAdminClient()
                const { data: existingElevated } = await admin
                    .from('profiles')
                    .select('role')
                    .eq('email', data.user.email)
                    .in('role', ['admin', 'editor', 'contribuidor'])
                    .neq('id', data.user.id)
                    .limit(1)
                    .maybeSingle()

                if (existingElevated?.role) {
                    await admin
                        .from('profiles')
                        .upsert({ id: data.user.id, email: data.user.email, role: existingElevated.role }, { onConflict: 'id' })
                    profile = { ...profile, role: existingElevated.role } as typeof profile
                }
            }

            if (isAdminRole(profile?.role)) {
                return NextResponse.redirect(`${origin}/admin`)
            }

            if (isNewsTeamRole(profile?.role)) {
                return NextResponse.redirect(`${origin}/admin/central-noticias`)
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
