import type { Metadata } from "next";
import { Montserrat, Maven_Pro } from "next/font/google";
import Scripts from "next/script";
import "../globals.css";
import NavFooterToggle from "./components/NavFooterToggle";

import { ThemeProvider } from "@/components/theme-provider";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { FloatingChatButton } from "@/components/FloatingChatButton";
import { PWAInstallPrompt } from "@/components/PWAInstallPrompt";
import { Toaster } from "sonner";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { OrganizationJsonLd } from "@/components/seo/OrganizationJsonLd";

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
});

const mavenPro = Maven_Pro({
  subsets: ["latin"],
  variable: "--font-maven-pro",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://basededadosagro.com"),
  title: "Base de Dados Agro",
  description: "O seu repositório agrário",
  keywords: ["Base de Dados Agro", "BaseDeDadosAgro", "Base de Dados", "Base", "Dados", "Agro"],
  manifest: "/manifest.json",
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
  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        <OrganizationJsonLd />
      </head>
      <body
        className={`${montserrat.variable} ${mavenPro.variable} font-sans antialiased bg-background min-h-screen flex flex-col`}
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
