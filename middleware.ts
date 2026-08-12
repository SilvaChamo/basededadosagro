import { type NextRequest } from 'next/server';
import createIntlMiddleware from 'next-intl/middleware';
import { updateSession } from '@/utils/supabase/middleware';
 
const handleI18nRouting = createIntlMiddleware({
  locales: ['pt', 'en'],
  defaultLocale: 'pt',
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
  return handleI18nRouting(request);
}
 
export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api/|.*\\..*).*)']
};
