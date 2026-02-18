"use client";

import { CompanyEditor } from "@/components/admin/CompanyEditor";
import { Store, ChevronRight, Plus } from "lucide-react";
import Link from "next/link";

export default function NewStorePage() {
    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-sm text-slate-500">
                    <Link href="/admin/lojas" className="hover:text-orange-500 transition-colors">Lojas</Link>
                    <ChevronRight className="w-4 h-4" />
                    <span className="text-slate-900 font-bold">Nova Loja</span>
                </div>

                <Link
                    href="/admin/lojas/novo"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-xs font-black uppercase tracking-widest rounded-full transition-all shadow-lg shadow-orange-500/20"
                >
                    <Plus className="w-3 h-3" />
                    Adicionar Loja
                </Link>
            </div>

            <CompanyEditor isNew={true} defaultType="Loja" />
        </div>
    );
}
