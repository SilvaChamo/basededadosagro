import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin'
import { isAdminRole, isNewsTeamRole } from '@/lib/roles'

export async function GET(request: Request) {
    const url = new URL(request.url)
    const code = url.searchParams.get('code')
    // "next" explícito (ex.: /auth/login?next=/destaque). Só caminhos
    // internos; tem prioridade sobre o destino por role.
    const rawNext = url.searchParams.get('next')
    const safeNext = rawNext && rawNext.startsWith('/') && !rawNext.startsWith('//') ? rawNext : null
    const next = safeNext ?? '/usuario/dashboard'

    // Host PÚBLICO. Atrás de Cloudflare -> Apache -> PM2 o origin de
    // request.url é interno (localhost:3010) e o x-forwarded-host pode chegar
    // com vários valores separados por vírgula. Ficamos com o 1.º; `base` é
    // SEMPRE um URL absoluto válido (fallback fixo). Sem isto, um admin a
    // entrar por Google/Facebook era mandado para localhost:3010/admin ->
    // ERR_CONNECTION_REFUSED. Em dev usa-se o origin real.
    const pick = (v: string | null) => (v ?? '').split(',')[0].trim()
    const isDev = process.env.NODE_ENV === 'development'
    let base = 'https://basededadosagro.com'
    try {
        if (isDev) {
            base = url.origin
        } else {
            const fwdHost = pick(request.headers.get('x-forwarded-host'))
            const fwdProto = pick(request.headers.get('x-forwarded-proto')) || 'https'
            base = fwdHost ? new URL(`${fwdProto}://${fwdHost}`).origin : url.origin
        }
    } catch {
        /* mantém o fallback fixo */
    }

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

            // `next` explícito ganha a qualquer role (voltar ao sítio de onde veio).
            if (safeNext) {
                return NextResponse.redirect(`${base}${safeNext}`)
            }

            if (isAdminRole(profile?.role)) {
                return NextResponse.redirect(`${base}/admin`)
            }

            if (isNewsTeamRole(profile?.role)) {
                return NextResponse.redirect(`${base}/admin/central-noticias`)
            }

            // Restantes utilizadores: dashboard.
            return NextResponse.redirect(`${base}${next}`)
        }
    }

    // Erro: volta ao login com mensagem, sempre no host público.
    return NextResponse.redirect(`${base}/auth/login?status=error&message=Authentication failed`)
}
