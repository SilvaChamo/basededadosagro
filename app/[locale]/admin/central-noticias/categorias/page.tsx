"use client";

import React, { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { ArrowLeft, Tag, Plus, Pencil, Trash2, X, Check } from "lucide-react";
import { useNewsCategories, NewsCategory } from "@/components/admin/central-noticias/useNewsCategories";
import { ConfirmationModal } from "@/components/ui/ConfirmationModal";
import { AdminListToolbar } from "@/components/admin/AdminListToolbar";
import { useAdminTopBar } from "@/components/admin/AdminTopBar";
import { LogoutButton } from "@/components/LogoutButton";

export default function CategoriasPage() {
    const categories = useNewsCategories();
    const [items, setItems] = useState<NewsCategory[] | null>(null);
    const [newName, setNewName] = useState("");
    const [creating, setCreating] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editingName, setEditingName] = useState("");
    const [confirmDelete, setConfirmDelete] = useState<NewsCategory | null>(null);

    // Espelha o hook mas permite actualização optimista local após criar/editar/apagar.
    const list = items ?? categories;
    React.useEffect(() => { if (categories.length && items === null) setItems(categories); }, [categories, items]);

    const createCategory = async () => {
        if (!newName.trim()) return;
        setCreating(true);
        try {
            const res = await fetch("/api/admin/news-categories", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: newName.trim() }),
            });
            const result = await res.json();
            if (!res.ok) throw new Error(result.error);
            setItems([...(items || categories), result.data].sort((a, b) => a.name.localeCompare(b.name)));
            setNewName("");
            toast.success("Categoria criada.");
        } catch (err: any) {
            toast.error(err.message || "Erro ao criar categoria.");
        } finally {
            setCreating(false);
        }
    };

    const saveEdit = async (id: string) => {
        if (!editingName.trim()) return;
        try {
            const res = await fetch("/api/admin/news-categories", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id, name: editingName.trim() }),
            });
            const result = await res.json();
            if (!res.ok) throw new Error(result.error);
            setItems((items || categories).map((c) => (c.id === id ? result.data : c)));
            setEditingId(null);
            toast.success("Categoria actualizada.");
        } catch (err: any) {
            toast.error(err.message || "Erro ao actualizar categoria.");
        }
    };

    const deleteCategory = async () => {
        if (!confirmDelete) return;
        try {
            const res = await fetch("/api/admin/news-categories", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id: confirmDelete.id }),
            });
            const result = await res.json();
            if (!res.ok) throw new Error(result.error);
            setItems((items || categories).filter((c) => c.id !== confirmDelete.id));
            toast.success("Categoria eliminada.");
        } catch (err: any) {
            toast.error(err.message || "Erro ao eliminar categoria.");
        } finally {
            setConfirmDelete(null);
        }
    };

    useAdminTopBar("");

    return (
        <div className="text-[#2c3338]">
            <AdminListToolbar className="flex-nowrap">
                <div className="flex items-center gap-4 shrink-0">
                    <Link href="/admin/central-noticias" className="text-slate-400 hover:text-slate-600 shrink-0">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight shrink-0 leading-none flex items-center gap-2">
                        <Tag className="w-5 h-5 text-gray-500" /> Categorias
                    </h1>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                    <LogoutButton
                        variant="outline"
                        className="h-9 px-4 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-red-600 border-slate-200"
                        showIcon
                        label="Sair"
                    />
                </div>
            </AdminListToolbar>

            <div className="max-w-2xl mt-6">
            <div className="bg-white border border-[#ccd0d4] rounded-md p-4 mb-5 flex items-center gap-2">
                <input
                    type="text"
                    placeholder="Nova categoria..."
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && createCategory()}
                    className="flex-1 h-9 px-3 bg-white text-[#2c3338] border border-[#8c8f94] rounded text-sm outline-none focus:border-[#2271b1]"
                />
                <button
                    onClick={createCategory}
                    disabled={creating || !newName.trim()}
                    className="flex items-center gap-1.5 px-4 h-9 bg-[#2271b1] text-white text-sm font-bold rounded hover:bg-[#135e96] disabled:opacity-50"
                >
                    <Plus className="w-4 h-4" /> Adicionar
                </button>
            </div>

            <div className="bg-white border border-[#ccd0d4] rounded-md overflow-hidden">
                {list.length === 0 ? (
                    <div className="p-8 text-center text-gray-400 text-sm">Sem categorias.</div>
                ) : (
                    list.map((cat, idx) => (
                        <div key={cat.id} className={`flex items-center gap-3 p-3 border-b border-[#f0f0f1] last:border-0 ${idx % 2 === 0 ? "bg-white" : "bg-[#f9f9f9]"}`}>
                            {editingId === cat.id ? (
                                <>
                                    <input
                                        type="text"
                                        value={editingName}
                                        onChange={(e) => setEditingName(e.target.value)}
                                        onKeyDown={(e) => e.key === "Enter" && saveEdit(cat.id)}
                                        autoFocus
                                        className="flex-1 h-8 px-2 bg-white text-[#2c3338] border border-[#2271b1] rounded text-sm outline-none"
                                    />
                                    <button onClick={() => saveEdit(cat.id)} className="p-1.5 text-[#00a651] hover:bg-green-50 rounded">
                                        <Check className="w-4 h-4" />
                                    </button>
                                    <button onClick={() => setEditingId(null)} className="p-1.5 text-slate-400 hover:bg-slate-50 rounded">
                                        <X className="w-4 h-4" />
                                    </button>
                                </>
                            ) : (
                                <>
                                    <span className="flex-1 text-sm font-medium text-[#2c3338]">{cat.name}</span>
                                    <span className="text-xs text-slate-400">{cat.slug}</span>
                                    <button
                                        onClick={() => { setEditingId(cat.id); setEditingName(cat.name); }}
                                        className="p-1.5 text-slate-400 hover:text-[#2271b1] hover:bg-blue-50 rounded"
                                    >
                                        <Pencil className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                        onClick={() => setConfirmDelete(cat)}
                                        className="p-1.5 text-slate-400 hover:text-[#d63638] hover:bg-red-50 rounded"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                </>
                            )}
                        </div>
                    ))
                )}
            </div>

            <ConfirmationModal
                isOpen={!!confirmDelete}
                onClose={() => setConfirmDelete(null)}
                onConfirm={deleteCategory}
                title="Eliminar Categoria"
                description={`Eliminar a categoria "${confirmDelete?.name}"? Só é possível se nenhuma notícia a estiver a usar.`}
                confirmLabel="Eliminar"
                variant="destructive"
            />
            </div>
        </div>
    );
}
