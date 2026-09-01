import type { Metadata } from "next";
import localFont from "next/font/local";
import Scripts from "next/script";
import "../globals.css";
import NavFooterToggle from "./components/NavFooterToggle";

import { ThemeProvider } from "@/components/theme-provider";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { FloatingChatButton } from "@/components/FloatingChatButton";
import { PWAInstallPrompt } from "@/components/PWAInstallPrompt";
import { Toaster } from "sonner";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { OrganizationJsonLd } from "@/components/seo/OrganizationJsonLd";

// Lista de idiomas suportados. Ao declarar generateStaticParams + chamar
// setRequestLocale() no layout, o next-intl deixa de ler cabeçalhos do
// pedido para descobrir o idioma — o que forçava TODAS as páginas a
// renderizar dinamicamente (sem cache), fazendo cada visita reconstruir a
// página no servidor. Com isto, as páginas públicas voltam a poder ser
// pré-renderizadas e servidas pela Cloudflare, como o visualdesign.
const LOCALES = ['pt', 'en'] as const;

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

// Revalidação por omissão de TODA a árvore [locale]. Sem isto, as páginas
// sem `revalidate` próprio saíam com s-maxage=1 ano — a Cloudflare guardava
// a versão do momento e nunca mais a actualizava (um deploy não chegava aos
// visitantes). Com 1h + stale-while-revalidate, cada deploy propaga-se
// sozinho na hora seguinte, sem penalizar a velocidade. Páginas com
// `revalidate` próprio (ex.: a home = 60s, /mercado = 300s) mandam nelas.
export const revalidate = 3600;

// Ficheiros locais em vez de next/font/google — o download do Google Fonts
// em build/dev falha silenciosamente em alguns ambientes e a fonte cai
// para o fallback sans-serif sem aviso nenhum.
const mavenPro = localFont({
  src: [
    { path: "../fonts/maven-pro/MavenPro-Regular.ttf", weight: "400", style: "normal" },
    { path: "../fonts/maven-pro/MavenPro-Medium.ttf", weight: "500", style: "normal" },
    { path: "../fonts/maven-pro/MavenPro-SemiBold.ttf", weight: "600", style: "normal" },
    { path: "../fonts/maven-pro/MavenPro-Bold.ttf", weight: "700", style: "normal" },
    { path: "../fonts/maven-pro/MavenPro-ExtraBold.ttf", weight: "800", style: "normal" },
    { path: "../fonts/maven-pro/MavenPro-Black.ttf", weight: "900", style: "normal" },
  ],
  variable: "--font-maven-pro",
});

// Montserrat local — usada apenas no título principal (h1). Ver app/globals.css.
const montserrat = localFont({
  src: [
    { path: "../fonts/montserrat/Montserrat-Regular.ttf", weight: "400", style: "normal" },
    { path: "../fonts/montserrat/Montserrat-Medium.ttf", weight: "500", style: "normal" },
    { path: "../fonts/montserrat/Montserrat-SemiBold.ttf", weight: "600", style: "normal" },
    { path: "../fonts/montserrat/Montserrat-Bold.ttf", weight: "700", style: "normal" },
    { path: "../fonts/montserrat/Montserrat-ExtraBold.ttf", weight: "800", style: "normal" },
    { path: "../fonts/montserrat/Montserrat-Black.ttf", weight: "900", style: "normal" },
  ],
  variable: "--font-montserrat",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://basededadosagro.com"),
  title: {
    // Ordem pedida: 1) "Base de Dados" à cabeça, 2) o nome próprio do site
    // "basededadosagro", 3) a frase-chave (agrícola / Moçambique).
    default: "Base de Dados Agro — basededadosagro | base de dados agrícola de Moçambique",
    // Subpáginas: "<nome da página> · Base de Dados Agro"
    template: "%s · Base de Dados Agro",
  },
  description:
    "Base de dados agrária de Moçambique: preços e mercado agrícola, empresas e serviços do sector, artigos científicos, notícias de agricultura e clima, estatísticas e repositório de documentos.",
  // Ordem pedida: primeiro "base de dados", depois o nome próprio
  // "basededadosagro", depois palavras-chave que ajudam a encontrar o domínio.
  keywords: [
    "base de dados",
    "basededadosagro",
    "base de dados agro",
    "base de dados agrícola",
    "base de dados agricultura Moçambique",
    "dados agrários Moçambique",
    "repositório agrário",
    "mercado agrícola Moçambique",
    "preços agrícolas Moçambique",
    "notícias agricultura e clima Moçambique",
    "estatísticas agrárias",
    "empresas agrícolas Moçambique",
  ],
  applicationName: "Base de Dados Agro",
  alternates: { canonical: "/" },
  manifest: "/manifest.json",
  // ?v= força os browsers a irem buscar o ícone novo (a cache de favicons
  // ignora Ctrl+Shift+R). Bump este número sempre que o ícone mudar.
  icons: {
    icon: [
      { url: "/favicon.ico?v=3", sizes: "48x48", type: "image/x-icon" },
      { url: "/icon.png?v=3", type: "image/png", sizes: "512x512" },
    ],
    shortcut: "/favicon.ico?v=3",
    apple: "/icon.png?v=3",
  },
  openGraph: {
    type: "website",
    siteName: "Base de Dados Agro",
    locale: "pt_MZ",
    url: "https://basededadosagro.com",
    title: "Base de Dados Agro — base de dados agrícola de Moçambique",
    description:
      "Preços e mercado agrícola, empresas e serviços, artigos científicos, notícias de agricultura e clima, estatísticas e documentos — tudo num só sítio.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Base de Dados Agro — base de dados agrícola de Moçambique",
    description:
      "Preços e mercado agrícola, empresas e serviços, artigos científicos, notícias de agricultura e clima, estatísticas e documentos.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
  },
};

export function generateViewport() {
  return {
    themeColor: "#059669",
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
  };
}

export default async function RootLayout({
  children,
  params
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;

  // Tem de vir ANTES de qualquer chamada ao next-intl (getMessages, etc.) —
  // é o que permite a renderização estática desta árvore.
  setRequestLocale(locale);

  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        <OrganizationJsonLd />
      </head>
      <body
        className={`${mavenPro.variable} ${montserrat.variable} font-sans antialiased bg-background min-h-screen flex flex-col`}
        suppressHydrationWarning
      >
        {/* Global Identification Bar - 6px Green */}
        <div className="fixed top-0 left-0 w-full h-[6px] bg-[#22c55e] z-[99999]" />
        
        <NextIntlClientProvider messages={messages} locale={locale}>
          <ThemeProvider
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <LanguageProvider>
              <NavFooterToggle>
                <main className="flex-1 flex flex-col">
                  {children}
                </main>
              </NavFooterToggle>
            </LanguageProvider>
            <Toaster position="bottom-right" richColors closeButton />
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
