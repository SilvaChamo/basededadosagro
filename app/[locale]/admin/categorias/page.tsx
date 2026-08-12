"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { AdminDataTable } from "@/components/admin/AdminDataTable";
import { Grid2X2 } from "lucide-react";
import * as LucideIcons from "lucide-react";
import { CategoryForm } from "@/components/admin/CategoryForm";
import { toast } from "sonner";
import { ConfirmationModal } from "@/components/ui/ConfirmationModal";

export default function AdminCategoriesPage() {
    const supabase = createClient();
    const [categories, setCategories] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingItem, setEditingItem] = useState<any>(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<any>(null);

    async function fetchCategories() {
        setLoading(true);
        const { data, error } = await supabase
            .from('info_categories')
            .select('*')
            .order('created_at', { ascending: true });

        if (error) console.error(error);
        else setCategories(data || []);
        setLoading(false);
    }

    useEffect(() => {
        fetchCategories();
    }, []);

    const confirmDelete = async () => {
        if (!itemToDelete) return;
        try {
            const { error } = await supabase
                .from('info_categories')
                .delete()
                .eq('id', itemToDelete.id);

            if (error) throw error;
            toast.success("Categoria eliminada!");
            fetchCategories();
        } catch (error: any) {
            toast.error("Erro ao eliminar: " + error.message);
        } finally {
            setShowDeleteConfirm(false);
            setItemToDelete(null);
        }
    };

    const handleDelete = (row: any) => {
        setItemToDelete(row);
        setShowDeleteConfirm(true);
    };

    const columns = [
        {
            header: "Título",
            key: "title",
            render: (val: string, row: any) => {
                // @ts-expect-error: LucideIcons type indexing
                const Icon = LucideIcons[row.icon_name] || LucideIcons.Grid2X2;
                return (
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${row.bg_color || 'bg-slate-100'} ${row.text_color || 'text-slate-500'}`}>
                            <Icon className="w-4 h-4" />
                        </div>
                        <span className="font-black text-slate-800">{val}</span>
                    </div>
                );
            }
        },
        {
            header: "Descrição",
            key: "description",
            render: (val: string) => <p className="line-clamp-1 max-w-xs">{val}</p>
        },
        {
            header: "Link (HREF)",
            key: "href",
            render: (val: string) => <code className="text-[10px] bg-slate-100 px-2 py-1 rounded text-slate-500">{val}</code>
        }
    ];

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Categorias de Serviços</h1>
                    <p className="text-slate-500 font-medium text-sm">Gerencie os cartões de serviços exibidos na página principal.</p>
                </div>
            </div>

            <AdminDataTable
                title="Categorias Activas"
                columns={columns}
                data={categories}
                loading={loading}
                onAdd={() => {
                    setEditingItem(null);
                    setShowForm(true);
                }}
                onEdit={(row) => {
                    setEditingItem(row);
                    setShowForm(true);
                }}
                onDelete={handleDelete}
            />

            {showForm && (
                <CategoryForm
                    initialData={editingItem}
                    onClose={() => setShowForm(false)}
                    onSuccess={() => {
                        fetchCategories();
                        setShowForm(false);
                    }}
                />
            )}

            <ConfirmationModal
                isOpen={showDeleteConfirm}
                onClose={() => setShowDeleteConfirm(false)}
                onConfirm={confirmDelete}
                title="Eliminar Categoria"
                description={`Tem a certeza que deseja eliminar a categoria "${itemToDelete?.title}"? Esta ação removerá o acesso a esta seção no site.`}
                confirmLabel="Eliminar"
                variant="destructive"
            />
        </div>
    );
}
