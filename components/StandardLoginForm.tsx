"use client";

import React from "react";
import { Coffee, ArrowRight } from "lucide-react";
import Link from "next/link";

export function StandardLoginForm() {
    return (
        <div className="flex items-center justify-center py-24">
            <div className="card-agro-lg w-full max-w-[450px] text-center form-premium-card rounded-agro-lg">
                {/* Header Section */}
                <div className="mb-6">
                    <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6 text-emerald-600">
                        <Coffee strokeWidth={1.5} className="w-8 h-8" />
                    </div>
                    <h2>Bem-vindo de volta</h2>
                    <p>Aceda à sua conta para gerir o seu agronegócio.</p>
                </div>

                {/* Form Section */}
                <form className="space-y-5 text-left">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Email</label>
                        <div className="candy-border-wrapper rounded-agro-btn">
                            <input
                                type="email"
                                placeholder="exemplo@baseagro.com"
                                className="w-full bg-[#F8FAFC] border-none px-5 py-3 focus-candy outline-none transition-all font-medium text-sm text-slate-700 relative z-10 rounded-agro-btn"
                            />
                        </div>
                    </div>

                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <label className="block text-sm font-bold text-slate-700">Palavra-passe</label>
                            <Link href="/auth/login" className="text-xs font-bold text-[#f97316] hover:underline">
                                Esqueceu-se?
                            </Link>
                        </div>
                        <div className="candy-border-wrapper rounded-agro-btn">
                            <input
                                type="password"
                                placeholder="••••••••"
                                className="w-full bg-[#F8FAFC] border-none px-5 py-3 focus-candy outline-none transition-all font-medium text-sm text-slate-700 relative z-10 rounded-agro-btn"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mt-3">
                        <button className="btn-primary w-full justify-center h-10 text-[11px] uppercase tracking-wider rounded-agro-btn shadow-lg border-0 bg-emerald-600 hover:bg-[#f97316] transition-all">
                            Entrar
                            <ArrowRight className="w-3.5 h-3.5" />
                        </button>

                        <button className="flex items-center justify-center gap-2 h-10 rounded-agro-btn border border-slate-200 bg-white text-slate-700 font-bold text-[10px] hover:border-[#f97316] hover:bg-[#f97316]/5 transition-all shadow-sm uppercase tracking-tight px-4">
                            <span className="opacity-70">Entrar via</span>
                            <svg className="w-4.5 h-4.5" viewBox="0 0 24 24">
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                            </svg>
                        </button>
                    </div>
                </form>

                {/* Footer Section */}
                <div className="mt-3.5 pt-3.5 border-t border-slate-100">
                    <p className="text-xs text-slate-400">
                        Ainda não tem conta? <Link href="/registar" className="text-[#f97316] font-bold hover:underline">Criar conta gratuita</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
