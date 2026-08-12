"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { AdminDataTable } from "@/components/admin/AdminDataTable";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { toast } from "sonner";
import { Box, Pencil, Trash2, CheckCircle2, XCircle } from "lucide-react";
import { ConfirmationModal } from "@/components/ui/ConfirmationModal";

export default function ServicesPage() {
    const router = useRouter();
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [itemToProcess, setItemToProcess] = useState<any>(null);

    async function fetchData() {
        setLoading(true);
        const { data: result, error } = await supabase
            .from('services')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error(error);
            toast.error("Erro ao carregar serviços");
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
                .from('services')
                .delete()
                .eq('id', itemToProcess.id);

            if (error) throw error;
            toast.success("Serviço eliminado!");
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
            header: "Serviço",
            key: "title",
            render: (val: string, row: any) => (
                <div className="flex items-center gap-3">
                    <div className="bg-slate-100 p-2 rounded-lg">
                        <Box className="w-5 h-5 text-slate-500" />
                    </div>
                    <div className="flex flex-col">
                        <span className="font-bold text-slate-900">{val}</span>
                        <span className="text-xs text-slate-500">{row.slug}</span>
                    </div>
                </div>
            )
        },
        {
            header: "Categoria",
            key: "category",
            render: (val: string) => <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2 py-1 rounded-full">{val}</span>
        },
        {
            header: "Estado",
            key: "is_active",
            render: (val: boolean) => (
                val ?
                    <span className="flex items-center gap-1 text-emerald-600 text-xs font-bold"><CheckCircle2 className="w-3 h-3" /> Activo</span> :
                    <span className="flex items-center gap-1 text-slate-400 text-xs font-bold"><XCircle className="w-3 h-3" /> Inativo</span>
            )
        },
        {
            header: "Acções",
            key: "actions",
            render: (_: any, row: any) => (
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => router.push(`/admin/servicos/${row.id}`)}
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

    return (
        <div className="space-y-6">
            <AdminHeader
                title="Gestão de Serviços"
                subtitle="Gerencie as categorias e serviços oferecidos na plataforma"
                action={{
                    label: "Novo Serviço",
                    href: "/admin/servicos/novo"
                }}
            />

            <AdminDataTable
                title={`Serviços (${data.length})`}
                columns={columns}
                data={data}
                loading={loading}
                // We handle actions inside the column render now, or we can keep these
                onEdit={(row) => router.push(`/admin/servicos/${row.id}`)}
                onDelete={handleDelete}
            />

            <ConfirmationModal
                isOpen={showDeleteConfirm}
                onClose={() => setShowDeleteConfirm(false)}
                onConfirm={confirmDelete}
                title="Eliminar Serviço"
                description={`Tem a certeza que deseja eliminar "${itemToProcess?.title}"?`}
                confirmLabel="Eliminar"
                variant="destructive"
            />
        </div>
    );
}
