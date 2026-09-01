import type { NextRequest, NextResponse } from 'next/server';
import createIntlMiddleware from 'next-intl/middleware';
import { updateSession } from '@/utils/supabase/middleware';

// Copia para `target` os cookies que o cliente Supabase renovou em `source`.
// Sem isto, quando o next-intl devolve a sua própria resposta (rewrite,
// redirect ou passagem), os tokens de sessão acabados de renovar pelo
// updateSession eram deitados fora — obrigando o utilizador a reautenticar-se
// mais cedo do que devia.
function carryOverCookies(source: NextResponse, target: NextResponse) {
  for (const cookie of source.cookies.getAll()) {
    target.cookies.set(cookie.name, cookie.value, cookie);
  }
}

const handleI18nRouting = createIntlMiddleware({
  locales: ['pt', 'en'],
  defaultLocale: 'pt',
  localePrefix: 'as-needed',
  // Sem cookie NEXT_LOCALE. Ele era escrito em TODAS as respostas
  // (Set-Cookie), e a Cloudflare recusa-se a guardar em cache qualquer
  // resposta com Set-Cookie (cf-cache-status: BYPASS) — anulava o
  // s-maxage das páginas estáticas. O idioma continua a vir do prefixo do
  // URL (/en/...) ou do defaultLocale 'pt'; o selector de idioma navega
  // para o URL prefixado, por isso não se perde a escolha.
  localeCookie: false,
});

export async function middleware(request: NextRequest) {
  // 1. Executar lógica do Supabase (Sessão/Auth)
  const response = await updateSession(request);

  // 2. Se for uma resposta de redirecionamento do Supabase, retornar imediatamente
  if (response.status >= 300 && response.status < 400) {
    return response;
  }

  // 3. Executar lógica de roteamento i18n
  const intlResponse = handleI18nRouting(request);

  // Preserva os cookies de sessão renovados pelo Supabase na resposta que o
  // next-intl preparou (é esta que vai ser devolvida, não a do updateSession).
  carryOverCookies(response, intlResponse);

  // Se o next-intl também redirecionar (ex: falta o prefixo de idioma), nada a renderizar.
  if (intlResponse.headers.get('location')) {
    return intlResponse;
  }

  // 4. Disponibiliza o pathname actual aos Server Components (ex: para o
  // admin/layout.tsx saber restringir Editor/Contribuidor à Central de Notícias),
  // já que o App Router não tem forma nativa de o ler fora de Client Components.
  //
  // Importante: não se pode substituir intlResponse por um NextResponse.next()
  // novo aqui — em modo "as-needed" o next-intl às vezes devolve um rewrite
  // interno (ex.: "/" -> "/pt") para páginas do idioma padrão sem prefixo, e
  // criar uma resposta do zero perdia esse rewrite, dando 404. Em vez disso,
  // injecta-se o cabeçalho directamente na resposta que o next-intl já
  // preparou, preservando o que ele decidiu (rewrite ou passagem directa).
  intlResponse.headers.set('x-middleware-request-x-pathname', request.nextUrl.pathname);
  return intlResponse;
}
 
export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api/|.*\\..*).*)']
};
