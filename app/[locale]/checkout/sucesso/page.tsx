"use client";

import React, { useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { CheckCircle2, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";

function SucessoContent() {
    const searchParams = useSearchParams();
    const router = useRouter();

    const planName = searchParams.get("plan") || "Básico";

    // Auto-redirect to dashboard after 5 seconds
    useEffect(() => {
        const timer = setTimeout(() => {
            router.push("/usuario/dashboard");
        }, 5000);
        return () => clearTimeout(timer);
    }, [router]);

    return (
        <div className="min-h-[80vh] flex flex-col items-center justify-center p-4 text-center">
            {/* Success Animation */}
            <div className="relative mb-8">
                <div className="w-32 h-32 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center shadow-2xl shadow-emerald-500/30">
                    <CheckCircle2 className="w-16 h-16 text-white" />
                </div>
                <div className="absolute -top-2 -right-2 w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center shadow-lg animate-bounce">
                    <Sparkles className="w-6 h-6 text-white" />
                </div>
            </div>

            {/* Success Message */}
            <h1 className="text-4xl font-black text-slate-900 mb-3 tracking-tight">
                Parabéns! 🎉
            </h1>
            <h2 className="text-2xl font-bold text-emerald-600 mb-6">
                Pagamento Efectuado com Sucesso
            </h2>

            <p className="text-slate-600 text-lg mb-8 max-w-lg leading-relaxed">
                A sua assinatura do plano <span className="font-black text-orange-600">{planName}</span> foi activada.
                Você já tem acesso total a todos os recursos do seu plano.
            </p>

            {/* Progress Steps - All Complete */}
            <div className="flex items-center justify-center gap-4 mb-10">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                        <CheckCircle2 className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-medium text-emerald-600">Conta</span>
                </div>
                <div className="w-12 h-1 bg-emerald-600 rounded-full" />
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                        <CheckCircle2 className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-medium text-emerald-600">Pagamento</span>
                </div>
                <div className="w-12 h-1 bg-emerald-600 rounded-full" />
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                        <CheckCircle2 className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-bold text-emerald-600">Concluído</span>
                </div>
            </div>

            {/* CTA Button */}
            <Button
                onClick={() => router.push("/usuario/dashboard")}
                className="h-14 px-10 rounded-[10px] bg-slate-900 hover:bg-slate-800 text-white font-black text-lg shadow-xl transition-all flex items-center gap-3 active:scale-[0.98] cursor-pointer"
            >
                Ir para o Dashboard
                <ArrowRight className="w-5 h-5" />
            </Button>

            <p className="text-slate-400 text-sm mt-6">
                Redirecionando automaticamente em 5 segundos...
            </p>
        </div>
    );
}

export default function SucessoPage() {
    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white font-sans">
            {/* Header */}
            <header className="bg-white/80 backdrop-blur-sm border-b border-slate-100 py-4 sticky top-0 z-50">
                <div className="max-w-5xl mx-auto px-4 flex items-center justify-center">
                    <Image
                        src="/Logo.svg"
                        alt="Base Agro Data"
                        width={180}
                        height={60}
                        className="h-10 w-auto"
                    />
                </div>
            </header>

            <Suspense fallback={
                <div className="min-h-screen flex items-center justify-center">
                    <div className="w-12 h-12 border-4 border-slate-200 border-t-emerald-600 rounded-full animate-spin"></div>
                </div>
            }>
                <SucessoContent />
            </Suspense>
        </div>
    );
}
