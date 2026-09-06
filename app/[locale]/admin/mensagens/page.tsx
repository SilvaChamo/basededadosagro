"use client";

import { MessageComposer } from "@/components/admin/MessageComposer";
import { AdminListToolbar, AdminToolbarTitle } from "@/components/admin/AdminListToolbar";
import { useAdminTopBar } from "@/components/admin/AdminTopBar";
import { LogoutButton } from "@/components/LogoutButton";

export default function AdminMessagesPage() {
    useAdminTopBar("");

    return (
        <div className="w-full max-w-full space-y-8">
            <AdminListToolbar className="flex-nowrap">
                <AdminToolbarTitle title="Enviar Mensagem" />
                <div className="flex items-center gap-2 shrink-0">
                    <LogoutButton
                        variant="outline"
                        className="h-9 px-4 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-red-600 border-slate-200"
                        showIcon
                        label="Sair"
                    />
                </div>
            </AdminListToolbar>

            <MessageComposer />
        </div>
    );
}
