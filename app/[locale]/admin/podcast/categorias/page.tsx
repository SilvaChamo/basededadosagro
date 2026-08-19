"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Save, X, Tag } from "lucide-react";
import { ConfirmationModal } from "@/components/ui/ConfirmationModal";
import Link from "next/link";
import { useAdminTopBar, TOPBAR_NEW_BUTTON_CLASS } from "@/components/admin/AdminTopBar";

interface PodcastCategory {
    id: string;
    name: string;
    slug: string;
    description: string;
    is_active: boolean;
}

export default function PodcastCategoriesPage() {
    const [categories, setCategories] = useState<PodcastCategory[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [showNew, setShowNew] = useState(false);
    const [newName, setNewName] = useState("");
    const [newDescription, setNewDescription] = useState("");
    const [editName, setEditName] = useState("");
    const [editDescription, setEditDescription] = useState("");
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<PodcastCategory | null>(null);

    const supabase = createClient();

    async function fetchCategories() {
        setLoading(true);
        const { data, error } = await supabase
            .from("podcast_categories")
            .select("*")
            .order("name");

        if (error) {
            toast.error("Erro ao carregar categorias");
        } else {
            setCategories(data || []);
        }
        setLoading(false);
    }

    useEffect(() => {
        fetchCategories();
    }, []);

    function generateSlug(name: string) {
        return name
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-+|-+$/g, "");
    }

    async function handleCreate() {
        if (!newName.trim()) {
            toast.error("O nome é obrigatório");
            return;
        }

        const slug = generateSlug(newName);
        const { error } = await supabase
            .from("podcast_categories")
            .insert([{ name: newName.trim(), slug, description: newDescription.trim() || null }]);

        if (error) {
            toast.error("Erro ao criar: " + error.message);
        } else {
            toast.success("Categoria criada!");
            setNewName("");
            setNewDescription("");
            setShowNew(false);
            fetchCategories();
        }
    }

    async function handleUpdate(id: string) {
        if (!editName.trim()) {
            toast.error("O nome é obrigatório");
            return;
        }

        const slug = generateSlug(editName);
        const { error } = await supabase
            .from("podcast_categories")
            .update({ name: editName.trim(), slug, description: editDescription.trim() || null })
            .eq("id", id);

        if (error) {
            toast.error("Erro ao actualizar: " + error.message);
        } else {
            toast.success("Categoria actualizada!");
            setEditingId(null);
            fetchCategories();
        }
    }

    async function confirmDelete() {
        if (!itemToDelete) return;
        const { error } = await supabase
            .from("podcast_categories")
            .delete()
            .eq("id", itemToDelete.id);

        if (error) {
            toast.error("Erro ao eliminar: " + error.message);
        } else {
            toast.success("Categoria eliminada!");
            fetchCategories();
        }
        setShowDeleteConfirm(false);
        setItemToDelete(null);
    }

    function startEdit(cat: PodcastCategory) {
        setEditingId(cat.id);
        setEditName(cat.name);
        setEditDescription(cat.description || "");
    }

    useAdminTopBar("", undefined, undefined, {
        showLogout: true,
        actions: (
            <button
                type="button"
                onClick={() => { setShowNew(true); setNewName(""); setNewDescription(""); }}
                className={TOPBAR_NEW_BUTTON_CLASS}
            >
                <Plus className="w-4 h-4" />
                Nova Categoria
            </button>
        ),
    });

    return (
        <div className="space-y-6">
            <AdminHeader
                title="Categorias de Podcast"
                subtitle="Gerencie as categorias/temas dos episódios AgroCast"
            />

            <div className="flex items-center justify-between">
                <Link
                    href="/admin/podcast"
                    className="text-sm text-slate-500 hover:text-orange-500 font-medium transition-colors"
                >
                    ← Voltar aos Episódios
                </Link>
            </div>

            {/* New Category Form */}
            {showNew && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5 space-y-3">
                    <h3 className="text-sm font-bold text-emerald-800">Nova Categoria</h3>
                    <div className="flex gap-4">
                        <input
                            type="text"
                            placeholder="Nome da categoria (ex: Tecnologia)"
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            className="w-[30%] px-4 py-2.5 rounded-[8px] border border-emerald-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                            autoFocus
                        />
                        <input
                            type="text"
                            placeholder="Descrição (opcional)"
                            value={newDescription}
                            onChange={(e) => setNewDescription(e.target.value)}
                            className="w-[50%] px-4 py-2.5 rounded-[8px] border border-emerald-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                        />
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={handleCreate}
                            className="flex items-center gap-1.5 bg-emerald-600 text-white px-4 py-2 rounded-[8px] text-xs font-bold hover:bg-orange-500 transition-colors"
                        >
                            <Save className="w-3.5 h-3.5" />
                            Guardar
                        </button>
                        <button
                            onClick={() => setShowNew(false)}
                            className="flex items-center gap-1.5 bg-white text-slate-600 px-4 py-2 rounded-[8px] text-xs font-bold hover:bg-orange-50 hover:text-orange-600 hover:border-orange-200 transition-colors border border-slate-200"
                        >
                            <X className="w-3.5 h-3.5" />
                            Cancelar
                        </button>
                    </div>
                </div>
            )}

            {/* Categories List */}
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                {loading ? (
                    <div className="p-8 text-center text-slate-400 text-sm">Carregando...</div>
                ) : categories.length === 0 ? (
                    <div className="p-8 text-center text-slate-400 text-sm">Nenhuma categoria encontrada</div>
                ) : (
                    <div className="divide-y divide-slate-100">
                        {categories.map((cat) => (
                            <div key={cat.id} className="px-5 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                                {editingId === cat.id ? (
                                    <div className="flex-1 flex gap-4 mr-4">
                                        <input
                                            type="text"
                                            value={editName}
                                            onChange={(e) => setEditName(e.target.value)}
                                            className="w-[30%] px-3 py-2 rounded-[8px] border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                                            autoFocus
                                        />
                                        <input
                                            type="text"
                                            value={editDescription}
                                            onChange={(e) => setEditDescription(e.target.value)}
                                            placeholder="Descrição (opcional)"
                                            className="w-[50%] px-3 py-2 rounded-[8px] border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                                        />
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleUpdate(cat.id)}
                                                className="text-xs font-bold text-white bg-emerald-600 px-3 py-1.5 rounded-[8px] hover:bg-orange-500 transition-colors"
                                            >
                                                Guardar
                                            </button>
                                            <button
                                                onClick={() => setEditingId(null)}
                                                className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-[8px] hover:bg-orange-100 hover:text-orange-600 transition-colors"
                                            >
                                                Cancelar
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-3">
                                        <Tag className="w-4 h-4 text-emerald-500" />
                                        <div>
                                            <span className="font-bold text-slate-900 text-sm">{cat.name}</span>
                                            {cat.description && (
                                                <p className="text-xs text-slate-400 mt-0.5">{cat.description}</p>
                                            )}
                                            <span className="text-[10px] text-slate-300 font-mono">/{cat.slug}</span>
                                        </div>
                                    </div>
                                )}
                                {editingId !== cat.id && (
                                    <div className="flex items-center gap-1">
                                        <button
                                            onClick={() => startEdit(cat)}
                                            className="p-2 hover:bg-orange-50 rounded-[8px] text-slate-400 hover:text-orange-500 transition-colors"
                                        >
                                            <Pencil className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => { setItemToDelete(cat); setShowDeleteConfirm(true); }}
                                            className="p-2 hover:bg-rose-50 rounded-[8px] text-slate-400 hover:text-rose-600 transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <ConfirmationModal
                isOpen={showDeleteConfirm}
                onClose={() => setShowDeleteConfirm(false)}
                onConfirm={confirmDelete}
                title="Eliminar Categoria"
                description={`Tem a certeza que deseja eliminar "${itemToDelete?.name}"? Episódios com esta categoria não serão afectados.`}
                confirmLabel="Eliminar"
                variant="destructive"
            />
        </div>
    );
}
