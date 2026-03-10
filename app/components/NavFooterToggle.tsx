"use client";

import { usePathname } from "next/navigation";
import { Navbar } from "../../components/Navbar";
import { Footer } from "../../components/Footer";
import { FloatingChatButton } from "@/components/FloatingChatButton";
import { GoogleTranslate } from "@/components/GoogleTranslate";
import { PWAInstallPrompt } from "@/components/PWAInstallPrompt";

export default function NavFooterToggle({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isPresentation = pathname?.includes("apresentacao");
    const hide = pathname?.includes("usuario") ||
        pathname?.includes("admin") ||
        pathname?.includes("login") ||
        pathname?.includes("registar") ||
        isPresentation ||
        pathname?.includes("cadastro-empresa");

    return (
        <>
            {!hide && <Navbar />}
            <div className="flex-1 flex flex-col min-h-0">
                {children}
            </div>
            {!hide && <Footer />}
            {!isPresentation && !pathname?.includes("admin") && (
                <>
                    <FloatingChatButton />
                    <GoogleTranslate />
                    <PWAInstallPrompt />
                </>
            )}
        </>
    );
}
