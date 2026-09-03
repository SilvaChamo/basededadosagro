"use client";

import React, { useState, useEffect } from "react";
import { Download, X, Smartphone } from "lucide-react";
import Image from "next/image";

interface BeforeInstallPromptEvent extends Event {
    readonly platforms: string[];
    readonly userChoice: Promise<{
        outcome: "accepted" | "dismissed";
        platform: string;
    }>;
    prompt(): Promise<void>;
}

export function PWAInstallPrompt() {
    const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const handleBeforeInstallPrompt = (e: Event) => {
            // Prevent the default browser prompt
            e.preventDefault();
            // Store the event for later use
            setDeferredPrompt(e as BeforeInstallPromptEvent);
            // Show our custom banner after a short delay
            setTimeout(() => {
                setIsVisible(true);
            }, 3000);
        };

        window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

        // Check if app is already installed
        if (window.matchMedia('(display-mode: standalone)').matches && isVisible) {
            setTimeout(() => setIsVisible(false), 0);
        }

        return () => {
            window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
        };
    }, []);

    const handleInstallClick = async () => {
        if (!deferredPrompt) return;

        // Show the browser install prompt
        await deferredPrompt.prompt();

        // Wait for the user to respond to the prompt
        const { outcome } = await deferredPrompt.userChoice;

        if (outcome === "accepted") {
            console.log("User accepted the install prompt");
        } else {
            console.log("User dismissed the install prompt");
        }

        // Clear the deferred prompt
        setDeferredPrompt(null);
        setIsVisible(false);
    };

    const handleDismiss = () => {
        setIsVisible(false);
        // Optionally store dismissal in localStorage to not show it again for a while
        localStorage.setItem("pwa-prompt-dismissed", Date.now().toString());
    };

    // Don't show if already dismissed in the last 7 days
    useEffect(() => {
        const lastDismissed = localStorage.getItem("pwa-prompt-dismissed");
        if (lastDismissed) {
            const sevenDaysInMs = 7 * 24 * 60 * 60 * 1000;
            if (Date.now() - parseInt(lastDismissed) < sevenDaysInMs && isVisible) {
                setTimeout(() => setIsVisible(false), 0);
            }
        }
    }, [isVisible]);

    if (!isVisible) return null;

    return (
        <div className="fixed bottom-6 left-6 right-6 md:left-auto md:right-6 md:w-[400px] z-[99999] animate-in slide-in-from-bottom-10 duration-500">
            <div className="bg-white rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-emerald-100 p-5 flex flex-col gap-4 relative overflow-hidden">
                {/* Background glow */}
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl"></div>

                <button
                    onClick={handleDismiss}
                    className="absolute top-3 right-3 p-1 rounded-full hover:bg-slate-100 text-slate-400 transition-colors"
                >
                    <X className="w-4 h-4" />
                </button>

                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 relative flex-shrink-0 bg-emerald-50 rounded-xl p-2 border border-emerald-100">
                        <Image
                            src="/Logo.png"
                            alt="Base de Dados Agro Logo"
                            width={56}
                            height={56}
                            className="object-contain"
                        />
                    </div>
                    <div className="flex-1">
                        <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight">Instalar Base de Dados Agro</h3>
                        <p className="text-[12px] text-slate-500 leading-tight mt-0.5">
                            Adicione à sua tela inicial para acesso rápido e navegação offline.
                        </p>
                    </div>
                </div>

                <div className="flex gap-2 mt-1">
                    <button
                        onClick={handleInstallClick}
                        className="flex-1 bg-emerald-600 hover:bg-[#f97316] text-white py-2.5 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/10 group"
                    >
                        <Download className="w-4 h-4 transition-transform group-hover:-translate-y-0.5" />
                        INSTALAR AGORA
                    </button>
                    <button
                        onClick={handleDismiss}
                        className="px-4 text-slate-400 font-bold text-xs hover:text-slate-600 transition-colors"
                    >
                        MAIS TARDE
                    </button>
                </div>
            </div>
        </div>
    );
}
