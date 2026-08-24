"use client";

import { Target } from "lucide-react";
import { AdminListToolbar, AdminToolbarTitle } from "@/components/admin/AdminListToolbar";
import { useAdminTopBar } from "@/components/admin/AdminTopBar";
import { LogoutButton } from "@/components/LogoutButton";

export default function AdminIndicadoresPage() {
    useAdminTopBar("");

    return (
        <div className="space-y-8">
            <AdminListToolbar className="flex-nowrap">
                <AdminToolbarTitle title="Indicadores" />
                <div className="flex items-center gap-2 shrink-0">
                    <LogoutButton
                        variant="outline"
                        className="h-9 px-4 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-red-600 border-slate-200"
                        showIcon
                        label="Sair"
                    />
                </div>
            </AdminListToolbar>
            <p className="text-slate-500 -mt-4">Gestão de indicadores de desempenho do sector.</p>

            <div className="bg-white p-20 rounded-2xl border border-slate-200 text-center">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Target className="w-8 h-8 text-slate-400" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Em Construção</h3>
                <p className="text-slate-500 max-w-md mx-auto">
                    O módulo de indicadores estará disponível em breve.
                </p>
            </div>
        </div>
    );
}
