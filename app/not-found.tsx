"use client";

import Link from "next/link";
import { MoveLeft, Home, ShieldAlert } from "lucide-react";

export default function NotFound() {
    return (
        <div className="min-h-screen bg-[#020617] flex items-center justify-center p-6 relative overflow-hidden">
            {/* Background Decorations */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-500/10 rounded-full blur-[120px]" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-orange-500/10 rounded-full blur-[120px]" />

            <div className="max-w-md w-full text-center space-y-8 relative z-10 animate-in fade-in slide-in-from-bottom-5 duration-700">
                {/* 404 Icon */}
                <div className="relative inline-block">
                    <div className="absolute inset-0 bg-orange-500/20 rounded-full blur-2xl animate-pulse" />
                    <div className="relative bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-xl p-10 shadow-2xl">
                        <ShieldAlert className="w-20 h-20 text-[#f97316] mx-auto mb-4" />
                        <h2 className="text-7xl font-black text-white tracking-tighter">404</h2>
                    </div>
                </div>

                <div className="space-y-4">
                    <h1 className="text-3xl font-bold text-white tracking-tight">Caminho Protegido ou Inexistente</h1>
                    <p className="text-slate-400 font-medium leading-relaxed">
                        A página que procura não foi encontrada. Se este é um acesso restrito, certifique-se de que tem as permissões necessárias.
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                    <button
                        onClick={() => window.history.back()}
                        className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 bg-slate-800/50 text-slate-300 font-bold rounded-lg hover:bg-slate-800 transition-all border border-white/5 backdrop-blur-sm"
                    >
                        <MoveLeft className="w-4 h-4" />
                        Retroceder
                    </button>

                    <Link
                        href="/"
                        className="w-full sm:w-auto flex items-center justify-center gap-2 px-10 py-4 bg-[#f97316] text-white font-bold rounded-lg hover:bg-orange-600 transition-all shadow-lg shadow-orange-500/20"
                    >
                        <Home className="w-4 h-4" />
                        Voltar ao Início
                    </Link>
                </div>

                <div className="pt-12 border-t border-white/5">
                    <p className="text-xs text-slate-500 uppercase tracking-[0.2em] font-bold">
                        Sistema de Proteção BaseAgroData v2.0
                    </p>
                </div>
            </div>
        </div>
    );
}
