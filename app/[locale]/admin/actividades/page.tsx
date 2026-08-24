"use client";

import { AdminListToolbar, AdminToolbarTitle } from "@/components/admin/AdminListToolbar";
import { useAdminTopBar } from "@/components/admin/AdminTopBar";
import { LogoutButton } from "@/components/LogoutButton";

export default function ActivitiesPage() {
    useAdminTopBar("");

    return (
        <div className="space-y-6">
            <AdminListToolbar className="flex-nowrap">
                <AdminToolbarTitle title="Gestão de Actividades" />
                <div className="flex items-center gap-2 shrink-0">
                    <LogoutButton
                        variant="outline"
                        className="h-9 px-4 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-red-600 border-slate-200"
                        showIcon
                        label="Sair"
                    />
                </div>
            </AdminListToolbar>
            <p className="text-slate-500 -mt-2">Acompanhe as actividades recentes</p>

            <div className="bg-white rounded-2xl p-8 text-center border border-slate-100 shadow-sm">
                <p className="text-slate-500">Módulo em desenvolvimento...</p>
            </div>
        </div>
    );
}
