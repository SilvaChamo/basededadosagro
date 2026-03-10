import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

interface Cookie {
    name: string
    value: string
    options?: any
}

export async function updateSession(request: NextRequest) {
    let supabaseResponse = NextResponse.next({
        request,
    })

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
        // middleware cannot easily proxy everything as it needs to return a response
        // but it should at least not hit a fake domain
        return supabaseResponse;
    }

    const supabase = createServerClient(
        supabaseUrl,
        supabaseAnonKey,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet: Cookie[]) {
                    cookiesToSet.forEach(({ name, value }) =>
                        request.cookies.set(name, value)
                    )
                    supabaseResponse = NextResponse.next({
                        request,
                    })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    // 0. Rate Limiting Simples para Login
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    const { pathname } = request.nextUrl;

    if (pathname === '/login' && request.method === 'POST') {
        const lastAttempt = request.cookies.get('last_login_attempt')?.value;
        const now = Date.now();
        if (lastAttempt && now - parseInt(lastAttempt) < 2000) {
            return new NextResponse('Muitas solicitações. Aguarde um momento.', { status: 429 });
        }
    }

    // IMPORTANT: DO NOT REMOVE auth.getUser()
    const {
        data: { user },
    } = await supabase.auth.getUser()

    // 1. Obscuridade: Em vez de redirecionar para login, damos rewrite para 404
    const isProtectedRoute = pathname.startsWith('/usuario') || pathname.startsWith('/admin');
    const isSensitivePath = pathname === '/login' ||
        pathname === '/admin' ||
        pathname === '/autenticar' ||
        pathname === '/autenticacao' ||
        pathname === '/dashboard' ||
        pathname === '/auth/login';

    // O parâmetro solicitado: ?from=/base ou ?from=/base*
    const fromParam = request.nextUrl.searchParams.get('from');
    const hasSecureFrom = fromParam && fromParam.startsWith('/base');

    // Se tentar aceder a rota protegida sem user, OU se tentar aceder a caminhos sensíveis sem o parâmetro oficial
    // NOTA: Se for /auth/login E tiver o parâmetro correto, PERMITIMOS o acesso à página de login
    if ((isProtectedRoute && !user) || (isSensitivePath && !user && !(pathname === '/auth/login' && hasSecureFrom))) {
        // Rewrite interno para o 404, mantendo a URL original (obscuridade total)
        const url = request.nextUrl.clone();
        url.pathname = '/404'; // Next.js renderiza o not-found.tsx
        return NextResponse.rewrite(url);
    }

    if (pathname === '/auth/login' && user) {
        const url = request.nextUrl.clone();
        url.pathname = '/usuario/dashboard';
        return NextResponse.redirect(url);
    }


    return supabaseResponse
}
