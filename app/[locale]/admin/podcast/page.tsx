"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { AdminDataTable } from "@/components/admin/AdminDataTable";
import { toast } from "sonner";
import { PlayCircle, Pencil, Trash2, CheckCircle2, User, Clock, Tag, Plus } from "lucide-react";
import { ConfirmationModal } from "@/components/ui/ConfirmationModal";
import { AdminListToolbar, AdminToolbarTitle } from "@/components/admin/AdminListToolbar";
import { useAdminTopBar, TOPBAR_NEW_BUTTON_CLASS } from "@/components/admin/AdminTopBar";
import { LogoutButton } from "@/components/LogoutButton";
import Link from "next/link";

export default function PodcastPage() {
    const router = useRouter();
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [itemToProcess, setItemToProcess] = useState<any>(null);

    async function fetchData() {
        setLoading(true);
        const { data: result, error } = await supabase
            .from('podcasts')
            .select('*')
            .order('published_at', { ascending: false });

        if (error) {
            console.error(error);
            toast.error("Erro ao carregar episódios");
        } else {
            setData(result || []);
        }
        setLoading(false);
    }

    useEffect(() => {
        fetchData();
    }, []);

    const handleDelete = (row: any) => {
        setItemToProcess(row);
        setShowDeleteConfirm(true);
    };

    const confirmDelete = async () => {
        if (!itemToProcess) return;
        try {
            const { error } = await supabase
                .from('podcasts')
                .delete()
                .eq('id', itemToProcess.id);

            if (error) throw error;
            toast.success("Episódio eliminado!");
            fetchData();
        } catch (error: any) {
            toast.error("Erro ao eliminar: " + error.message);
        } finally {
            setShowDeleteConfirm(false);
            setItemToProcess(null);
        }
    };

    const columns = [
        {
            header: "Episódio",
            key: "title",
            render: (val: string, row: any) => (
                <div className="flex items-center gap-3">
                    <div className="bg-slate-100 p-1 rounded-lg w-16 h-10 overflow-hidden relative shrink-0">
                        {row.thumbnail_url ? (
                            <img src={row.thumbnail_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-slate-200">
                                <PlayCircle className="w-5 h-5 text-slate-400" />
                            </div>
                        )}
                    </div>
                    <div className="flex flex-col min-w-0">
                        <span className="font-bold text-slate-900 truncate max-w-[200px]" title={val}>{val}</span>
                        <span className="text-xs text-slate-500 flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {row.duration}
                        </span>
                    </div>
                </div>
            )
        },
        {
            header: "Convidado",
            key: "specialist_name",
            render: (val: string) => (
                <span className="flex items-center gap-1 text-xs font-medium text-slate-600">
                    <User className="w-3 h-3" /> {val}
                </span>
            )
        },
        {
            header: "Categoria",
            key: "category",
            render: (val: string) => <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2 py-1 rounded-full">{val}</span>
        },
        {
            header: "Destaque",
            key: "is_featured",
            render: (val: boolean) => (
                val ? <span className="text-amber-500 text-xs font-black uppercase tracking-wider">★ Destaque</span> : null
            )
        },
        {
            header: "Acções",
            key: "actions",
            render: (_: any, row: any) => (
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => router.push(`/admin/podcast/${row.id}`)}
                        className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-emerald-600 transition-colors"
                    >
                        <Pencil className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => handleDelete(row)}
                        className="p-2 hover:bg-rose-50 rounded-lg text-slate-400 hover:text-rose-600 transition-colors"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            )
        }
    ];

    useAdminTopBar("");

    return (
        <div className="space-y-6">
            <AdminListToolbar className="flex-nowrap">
                <AdminToolbarTitle title="Gestão de Podcast" />
                <div className="flex items-center gap-2 shrink-0">
                    <Link
                        href="/admin/podcast/categorias"
                        className="flex items-center gap-2 h-9 px-4 text-xs font-bold text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors whitespace-nowrap"
                    >
                        <Tag className="w-4 h-4" />
                        Gerir Categorias
                    </Link>
                    <Link href="/admin/podcast/novo" className={TOPBAR_NEW_BUTTON_CLASS}>
                        <Plus className="w-4 h-4" />
                        Novo Episódio
                    </Link>
                    <LogoutButton
                        variant="outline"
                        className="h-9 px-4 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-red-600 border-slate-200"
                        showIcon
                        label="Sair"
                    />
                </div>
            </AdminListToolbar>
            <AdminDataTable
                title={`Episódios (${data.length})`}
                columns={columns}
                data={data}
                loading={loading}
                onEdit={(row) => router.push(`/admin/podcast/${row.id}`)}
                onDelete={handleDelete}
            />

            <ConfirmationModal
                isOpen={showDeleteConfirm}
                onClose={() => setShowDeleteConfirm(false)}
                onConfirm={confirmDelete}
                title="Eliminar Episódio"
                description={`Tem a certeza que deseja eliminar "${itemToProcess?.title}"?`}
                confirmLabel="Eliminar"
                variant="destructive"
            />
        </div>
    );
}
