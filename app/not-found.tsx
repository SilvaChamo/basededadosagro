"use client";

import Link from "next/link";
import { MoveLeft, Home, Search } from "lucide-react";

export default function NotFound() {
    return (
        <div className="min-h-screen bg-white flex items-center justify-center p-6">
            <div className="max-w-md w-full text-center space-y-8">
                {/* Animated Icon Container */}
                <div className="relative inline-block">
                    <div className="absolute inset-0 bg-orange-100 rounded-full blur-2xl opacity-50 animate-pulse" />
                    <div className="relative bg-white border border-slate-100 rounded-3xl p-8 shadow-xl">
                        <span className="text-8xl font-black text-slate-900 tracking-tighter">404</span>
                    </div>
                </div>

                <div className="space-y-3">
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Página não encontrada</h1>
                    <p className="text-slate-500 font-medium leading-relaxed">
                        Ups! Parece que o conteúdo que procura não existe ou foi movido para uma nova localização.
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                    <button
                        onClick={() => window.history.back()}
                        className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-all border border-slate-200"
                    >
                        <MoveLeft className="w-4 h-4" />
                        Voltar
                    </button>

                    <Link
                        href="/"
                        className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3 bg-[#f97316] text-white font-bold rounded-xl hover:bg-orange-600 transition-all shadow-lg shadow-orange-500/20"
                    >
                        <Home className="w-4 h-4" />
                        Ir para o Início
                    </Link>
                </div>

                <div className="pt-12 border-t border-slate-100">
                    <div className="flex items-center justify-center gap-2 text-slate-400 font-semibold text-sm uppercase tracking-widest">
                        <Search className="w-4 h-4" />
                        <span>Precisa de ajuda?</span>
                    </div>
                    <p className="mt-2 text-sm text-slate-400">
                        Contacte o nosso suporte se acredita que isto é um erro do sistema.
                    </p>
                </div>
            </div>
        </div>
    );
}
