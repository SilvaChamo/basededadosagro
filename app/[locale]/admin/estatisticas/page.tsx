"use client";

import { BarChart3 } from "lucide-react";

export default function AdminEstatisticasPage() {
    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Estatísticas</h1>
                    <p className="text-slate-500">Cadastro e visualização de estatísticas agrárias.</p>
                </div>
            </div>

            <div className="bg-white p-20 rounded-2xl border border-slate-200 text-center">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <BarChart3 className="w-8 h-8 text-slate-400" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Em Construção</h3>
                <p className="text-slate-500 max-w-md mx-auto">
                    O módulo de gestão de estatísticas estará disponível em breve.
                </p>
            </div>
        </div>
    );
}
