// Baseagrodata - App Layout | Deployment: 2026-01-25 08:11
import type { Metadata } from "next";
import { Montserrat, Maven_Pro } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import NavFooterToggle from "./components/NavFooterToggle";

import { ThemeProvider } from "@/components/theme-provider";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { FloatingChatButton } from "@/components/FloatingChatButton";

import { GoogleTranslate } from "@/components/GoogleTranslate";
import { PWAInstallPrompt } from "@/components/PWAInstallPrompt";
import { Toaster } from "sonner";

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
});

const mavenPro = Maven_Pro({
  subsets: ["latin"],
  variable: "--font-maven-pro",
});

export const metadata: Metadata = {
  title: "Baseagrodata",
  description: "O seu repositório agrário",
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${montserrat.variable} ${mavenPro.variable} font-sans antialiased bg-background min-h-screen flex flex-col`}
        suppressHydrationWarning
      >
        {/* Global Identification Bar - 6px Green */}
        <div className="fixed top-0 left-0 w-full h-[6px] bg-[#22c55e] z-[99999]" />
        <Script
          src="//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"
          strategy="afterInteractive"
        />
        <Script id="google-translate-init" strategy="afterInteractive">
          {`
            function googleTranslateElementInit() {
              new google.translate.TranslateElement({
                pageLanguage: 'pt',
                includedLanguages: 'en,pt',
                layout: google.translate.TranslateElement.InlineLayout.SIMPLE,
                autoDisplay: false
              }, 'google_translate_element');
            }
          `}
        </Script>
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
      </body>
    </html>
  );
}
