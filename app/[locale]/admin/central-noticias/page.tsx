"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";
import {
    Search,
    Edit2,
    Trash2,
    ExternalLink,
    Plus,
    AlertTriangle,
    Wrench,
    Archive,
    Recycle,
} from "lucide-react";
import { ConfirmationModal } from "@/components/ui/ConfirmationModal";
import { useNewsCategories } from "@/components/admin/central-noticias/useNewsCategories";
import { AdminListToolbar, AdminToolbarTitle } from "@/components/admin/AdminListToolbar";
import { useAdminTopBar } from "@/components/admin/AdminTopBar";
import { LogoutButton } from "@/components/LogoutButton";

interface NewsItem {
    id: string;
    title: string;
    slug: string | null;
    type: string | null;
    categories?: string[] | null;
    date: string | null;
    created_at: string;
    image_url: string | null;
    status: string | null;
    subtitle: string | null;
}

export default function CentralNoticiasPage() {
    const supabase = createClient();
    const categories = useNewsCategories();
    const [news, setNews] = useState<NewsItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [filterCategory, setFilterCategory] = useState("Todas as categorias");
    const [filterDate, setFilterDate] = useState("Todas as datas");
    const [quickEditId, setQuickEditId] = useState<string | null>(null);
    const [editForm, setEditForm] = useState<Partial<NewsItem>>({});
    const [filterMissingImage, setFilterMissingImage] = useState(false);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [bulkAction, setBulkAction] = useState("");
    const [confirmAction, setConfirmAction] = useState<null | { kind: "trash" | "archive"; id?: string; title?: string; bulk?: boolean }>(null);

    const loadNews = async (isInitialLoad: boolean) => {
        if (isInitialLoad) setLoading(true);
        try {
            const { data, error } = await supabase
                .from("articles")
                .select("id, title, slug, type, date, created_at, image_url, status, subtitle")
                .is("deleted_at", null)
                .order("date", { ascending: false });

            if (error) throw error;
            setNews(data || []);
            setErrorMsg(null);
        } catch (err: any) {
            console.error("Erro ao carregar notícias:", err);
            setErrorMsg(err.message || "Erro desconhecido ao carregar notícias.");
        } finally {
            if (isInitialLoad) setLoading(false);
        }
    };

    useEffect(() => {
        loadNews(true);
    }, []);

    const years = Array.from(new Set(news.map((item) => new Date(item.date || item.created_at).getFullYear()))).sort((a, b) => b - a);

    const filteredNews = news.filter((item) => {
        if (item.status === "inactive" || item.status === "draft") return false;
        const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = filterCategory === "Todas as categorias" || item.type === filterCategory;
        const matchesDate = filterDate === "Todas as datas" || new Date(item.date || item.created_at).getFullYear().toString() === filterDate;
        const matchesMissingImage = !filterMissingImage || !item.image_url;
        return matchesSearch && matchesCategory && matchesDate && matchesMissingImage;
    });

    const updateArticle = async (id: string, payload: Record<string, any>) => {
        const res = await fetch("/api/admin/articles", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id, payload }),
        });
        const result = await res.json();
        if (!res.ok) throw new Error(result.error || "Erro ao guardar.");
        return result.data;
    };

    const bulkUpdateArticles = async (ids: string[], payload: Record<string, any>) => {
        const res = await fetch("/api/admin/articles", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ids, payload }),
        });
        const result = await res.json();
        if (!res.ok) throw new Error(result.error || "Erro ao guardar.");
    };

    const moveToTrash = async (id: string) => {
        await updateArticle(id, { deleted_at: new Date().toISOString() });
        setNews((prev) => prev.filter((item) => item.id !== id));
    };

    const archiveOne = async (id: string) => {
        await updateArticle(id, { status: "inactive" });
        setNews((prev) => prev.map((item) => (item.id === id ? { ...item, status: "inactive" } : item)));
    };

    const toggleSelect = (id: string) => {
        const newSelected = new Set(selectedIds);
        if (newSelected.has(id)) newSelected.delete(id);
        else newSelected.add(id);
        setSelectedIds(newSelected);
    };

    const toggleSelectAll = () => {
        if (selectedIds.size === filteredNews.length) setSelectedIds(new Set());
        else setSelectedIds(new Set(filteredNews.map((n) => n.id)));
    };

    const runConfirmedAction = async () => {
        if (!confirmAction) return;
        try {
            if (confirmAction.bulk) {
                const ids = Array.from(selectedIds);
                if (confirmAction.kind === "trash") {
                    await bulkUpdateArticles(ids, { deleted_at: new Date().toISOString() });
                    setNews((prev) => prev.filter((n) => !selectedIds.has(n.id)));
                    toast.success(`${ids.length} notícia(s) movida(s) para o lixo.`);
                } else {
                    await bulkUpdateArticles(ids, { status: "inactive" });
                    setNews((prev) => prev.map((n) => (selectedIds.has(n.id) ? { ...n, status: "inactive" } : n)));
                    toast.success(`${ids.length} notícia(s) arquivada(s).`);
                }
                setSelectedIds(new Set());
                setBulkAction("");
            } else if (confirmAction.id) {
                if (confirmAction.kind === "trash") {
                    await moveToTrash(confirmAction.id);
                    toast.success("Notícia movida para o lixo.");
                } else {
                    await archiveOne(confirmAction.id);
                    toast.success("Notícia arquivada.");
                }
            }
        } catch (err: any) {
            toast.error(err.message || "Erro ao processar a acção.");
        } finally {
            setConfirmAction(null);
        }
    };

    const handleQuickEdit = (item: NewsItem) => {
        setQuickEditId(item.id);
        setEditForm({ ...item, categories: item.categories && item.categories.length > 0 ? item.categories : (item.type ? [item.type] : []) });
    };

    // Múltiplas categorias por notícia: a primeira selecionada continua a ser
    // gravada em `type` (categoria principal — usada nos badges e filtros
    // antigos), enquanto `categories` guarda o conjunto completo.
    const toggleEditCategory = (name: string) => {
        setEditForm((prev) => {
            const current = prev.categories || [];
            const has = current.includes(name);
            const next = has ? current.filter((c) => c !== name) : [...current, name];
            const safeNext = next.length > 0 ? next : [name];
            return { ...prev, categories: safeNext, type: safeNext[0] };
        });
    };

    const saveQuickEdit = async () => {
        if (!quickEditId) return;
        try {
            await updateArticle(quickEditId, {
                title: editForm.title,
                slug: editForm.slug,
                type: editForm.type,
                categories: editForm.categories,
                status: editForm.status,
                date: editForm.date,
                subtitle: editForm.subtitle,
            });
            setNews(news.map((n) => (n.id === quickEditId ? { ...n, ...editForm } : n)));
            setQuickEditId(null);
            toast.success("Notícia actualizada.");
        } catch (err: any) {
            toast.error(err.message || "Erro ao guardar.");
        }
    };

    useAdminTopBar("");

    return (
        <div className="text-[#2c3338]">
            <AdminListToolbar className="flex-nowrap">
                <AdminToolbarTitle
                    title="Central de Notícias"
                    searchValue={searchQuery}
                    onSearchChange={setSearchQuery}
                    searchPlaceholder="Pesquisar artigos"
                />

                <div className="flex items-center gap-2 shrink-0">
                    <Link
                        href="/admin/central-noticias/reparar"
                        className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-md text-sm font-bold hover:bg-amber-600 transition-colors whitespace-nowrap"
                    >
                        <Wrench className="w-4 h-4" />
                        Reparar Imagens
                    </Link>
                    <Link
                        href="/admin/central-noticias/novo"
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-[#00a651] text-[#00a651] rounded-md text-sm font-semibold hover:bg-[#f6f7f7] transition-all whitespace-nowrap"
                    >
                        <Plus className="w-4 h-4" />
                        Adicionar nova
                    </Link>
                    <LogoutButton
                        variant="outline"
                        className="h-9 px-4 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-red-600 border-slate-200"
                        showIcon
                        label="Sair"
                    />
                </div>
            </AdminListToolbar>

            {/* Toolbar */}
            <div className="flex flex-wrap items-center gap-2 mt-4 mb-4">
                <select
                    className="h-8 border-[#ccd0d4] rounded-md text-sm bg-white px-2 outline-none focus:border-[#2271b1]"
                    value={bulkAction}
                    onChange={(e) => setBulkAction(e.target.value)}
                >
                    <option value="">Ações em massa</option>
                    <option value="archive">Arquivar</option>
                    <option value="trash">Mover para o lixo</option>
                </select>

                {selectedIds.size > 0 && bulkAction === "trash" && (
                    <button
                        onClick={() => setConfirmAction({ kind: "trash", bulk: true })}
                        className="h-8 px-4 bg-[#d63638] text-white rounded-md text-sm font-semibold hover:bg-[#b32d2e] flex items-center gap-2"
                    >
                        <Trash2 className="w-4 h-4" />
                        Eliminar ({selectedIds.size})
                    </button>
                )}

                {selectedIds.size > 0 && bulkAction === "archive" && (
                    <button
                        onClick={() => setConfirmAction({ kind: "archive", bulk: true })}
                        className="h-8 px-4 bg-[#2271b1] text-white rounded-md text-sm font-semibold hover:bg-[#135e96] flex items-center gap-2"
                    >
                        <Archive className="w-4 h-4" />
                        Arquivar ({selectedIds.size})
                    </button>
                )}

                {selectedIds.size > 0 && (
                    <button
                        onClick={() => { setSelectedIds(new Set()); setBulkAction(""); }}
                        className="h-8 px-4 border border-[#ccd0d4] bg-white text-[#50575e] rounded-md text-sm font-semibold hover:bg-[#f6f7f7]"
                    >
                        Cancelar
                    </button>
                )}
                <select
                    className="h-8 border-[#ccd0d4] rounded-md text-sm bg-white px-2 outline-none focus:border-[#2271b1] ml-2"
                    value={filterDate}
                    onChange={(e) => setFilterDate(e.target.value)}
                >
                    <option value="Todas as datas">Todas as datas</option>
                    {years.map((year) => (
                        <option key={year} value={year.toString()}>{year}</option>
                    ))}
                </select>
                <select
                    className="h-8 border-[#ccd0d4] rounded-md text-sm bg-white px-2 outline-none focus:border-[#2271b1]"
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                >
                    <option>Todas as categorias</option>
                    {categories.map((cat) => <option key={cat.id} value={cat.name}>{cat.name}</option>)}
                </select>

                <button
                    onClick={() => setFilterMissingImage(!filterMissingImage)}
                    className={`h-8 px-3 border rounded-md text-sm font-semibold transition-all ${filterMissingImage
                        ? "bg-amber-50 border-amber-500 text-amber-700 shadow-inner"
                        : "bg-white border-[#ccd0d4] text-[#2c3338] hover:bg-[#f6f7f7]"
                        }`}
                >
                    {filterMissingImage ? "A mostrar sem imagem" : "Filtrar sem imagem"}
                </button>

                <div className="ml-auto flex items-center gap-2">
                    <Link
                        href="/admin/central-noticias/arquivadas"
                        className="p-2 bg-white border border-[#ccd0d4] rounded-md hover:bg-[#f6f7f7] text-[#50575e] inline-flex"
                        title="Arquivadas"
                    >
                        <Archive className="w-4 h-4" />
                    </Link>
                    <Link
                        href="/admin/central-noticias/lixo"
                        className="p-2 bg-white border border-[#ccd0d4] rounded-md hover:bg-[#f6f7f7] text-[#50575e] inline-flex"
                        title="Lixo"
                    >
                        <Trash2 className="w-4 h-4" />
                    </Link>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white border border-[#ccd0d4] rounded-md overflow-hidden overflow-x-auto">
                <table className="w-full border-collapse text-[13px]">
                    <thead>
                        <tr className="bg-white text-left font-bold border-b border-[#ccd0d4] text-[#2c3338]">
                            <th className="p-2 w-10 text-center">
                                <input
                                    type="checkbox"
                                    checked={selectedIds.size === filteredNews.length && filteredNews.length > 0}
                                    onChange={toggleSelectAll}
                                />
                            </th>
                            <th className="p-3 min-w-[300px]">Título</th>
                            <th className="p-3 w-40">Categoria</th>
                            <th className="p-3 w-48">Data</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={4} className="p-10 text-center text-gray-400">A carregar...</td></tr>
                        ) : errorMsg ? (
                            <tr><td colSpan={4} className="p-10 text-center text-red-600 bg-red-50 font-medium">{errorMsg}</td></tr>
                        ) : filteredNews.length === 0 ? (
                            <tr><td colSpan={4} className="p-10 text-center text-gray-500">Nenhum artigo encontrado.</td></tr>
                        ) : (
                            filteredNews.map((item, idx) => (
                                <React.Fragment key={item.id}>
                                    <tr className={`group border-b border-[#f0f0f1] hover:bg-[#f6f7f7] ${idx % 2 === 0 ? "bg-white" : "bg-[#f9f9f9]"} ${selectedIds.has(item.id) ? "bg-blue-50" : ""}`}>
                                        <td className="p-2 text-center align-top pt-4">
                                            <input type="checkbox" checked={selectedIds.has(item.id)} onChange={() => toggleSelect(item.id)} />
                                        </td>
                                        <td className="p-3 align-top">
                                            <div className="flex items-start gap-3">
                                                {item.image_url ? (
                                                    <div className="w-14 h-14 flex-shrink-0 border border-[#ccd0d4] bg-gray-50 overflow-hidden mt-1 shadow-sm">
                                                        <img src={item.image_url} className="w-full h-full object-cover" alt="" />
                                                    </div>
                                                ) : (
                                                    <div className="w-14 h-14 flex-shrink-0 border border-dashed border-amber-300 bg-amber-50 rounded flex items-center justify-center mt-1">
                                                        <AlertTriangle className="w-6 h-6 text-amber-500" />
                                                    </div>
                                                )}
                                                <div className="flex flex-col gap-1 min-w-0">
                                                    <div className="flex items-center gap-2">
                                                        {item.status === "inactive" && <Recycle className="w-4 h-4 text-gray-400" />}
                                                        <Link href={`/admin/central-noticias/editar/${item.id}`} className="text-[#2271b1] font-bold text-[14px] hover:text-[#135e96] block">
                                                            {item.title}
                                                        </Link>
                                                    </div>
                                                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity text-[11px] font-medium text-[#2271b1]">
                                                        <Link href={`/admin/central-noticias/editar/${item.id}`} className="hover:text-[#135e96]">Editar</Link>
                                                        <span className="text-gray-300">|</span>
                                                        <button onClick={() => handleQuickEdit(item)} className="hover:text-[#135e96]">Edição rápida</button>
                                                        <span className="text-gray-300">|</span>
                                                        <button onClick={() => setConfirmAction({ kind: "trash", id: item.id, title: item.title })} className="text-[#d63638] hover:text-red-700">Lixo</button>
                                                        <span className="text-gray-300">|</span>
                                                        <button onClick={() => setConfirmAction({ kind: "archive", id: item.id, title: item.title })} className="hover:text-[#135e96]">Arquivar</button>
                                                        {item.slug && (
                                                            <>
                                                                <span className="text-gray-300">|</span>
                                                                <Link href={`/artigos/${item.slug}`} target="_blank" className="hover:text-[#135e96] inline-flex items-center gap-1">
                                                                    Ver <ExternalLink className="w-3 h-3" />
                                                                </Link>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-3 align-top">
                                            <button onClick={() => setFilterCategory(item.type || "Notícia")} className="text-[#2271b1] hover:text-[#135e96] capitalize text-left">
                                                {item.type || "Notícia"}
                                            </button>
                                        </td>
                                        <td className="p-3 align-top text-[#50575e]">
                                            <div className="flex flex-col leading-tight">
                                                <span>{item.status === "inactive" ? "Arquivado" : "Publicado"}</span>
                                                <span>{new Date(item.date || item.created_at).toLocaleDateString("pt-PT")}</span>
                                            </div>
                                        </td>
                                    </tr>

                                    {quickEditId === item.id && (
                                        <tr className="bg-[#f6f7f7] border-b border-[#ccd0d4]">
                                            <td colSpan={4} className="p-6">
                                                <div className="w-full">
                                                    <h4 className="text-[14px] font-bold uppercase text-[#1d2327] mb-4">Edição Rápida</h4>
                                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                                        <div className="space-y-4">
                                                            <div>
                                                                <label className="block text-[12px] font-bold mb-1">Título</label>
                                                                <input
                                                                    type="text"
                                                                    value={editForm.title || ""}
                                                                    onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                                                                    className="w-full h-8 px-2 bg-white text-[#2c3338] border border-[#8c8f94] rounded-[3px] text-sm outline-none focus:border-[#2271b1]"
                                                                />
                                                            </div>
                                                            <div>
                                                                <label className="block text-[12px] font-bold mb-1">Slug</label>
                                                                <input
                                                                    type="text"
                                                                    value={editForm.slug || ""}
                                                                    onChange={(e) => setEditForm({ ...editForm, slug: e.target.value })}
                                                                    className="w-full h-8 px-2 bg-white text-[#2c3338] border border-[#8c8f94] rounded-[3px] text-sm outline-none focus:border-[#2271b1]"
                                                                />
                                                            </div>
                                                        </div>

                                                        <div className="space-y-4">
                                                            <div>
                                                                <label className="block text-[12px] font-bold mb-1">Categorias</label>
                                                                <div className="max-h-32 overflow-y-auto p-2 border border-[#8c8f94] bg-white rounded-[3px]">
                                                                    {categories.map((cat) => (
                                                                        <label key={cat.id} className="flex items-center gap-2 text-sm py-0.5">
                                                                            <input
                                                                                type="checkbox"
                                                                                checked={(editForm.categories || []).includes(cat.name)}
                                                                                onChange={() => toggleEditCategory(cat.name)}
                                                                            />
                                                                            {cat.name}
                                                                        </label>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="space-y-4">
                                                            <div>
                                                                <label className="block text-[12px] font-bold mb-1">Data</label>
                                                                <input
                                                                    type="date"
                                                                    value={editForm.date ? editForm.date.slice(0, 10) : ""}
                                                                    onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
                                                                    className="w-full h-8 px-2 bg-white text-[#2c3338] border border-[#8c8f94] rounded-[3px] text-sm outline-none focus:border-[#2271b1]"
                                                                />
                                                            </div>
                                                            <div>
                                                                <label className="block text-[12px] font-bold mb-1">Estado</label>
                                                                <select
                                                                    value={editForm.status || "active"}
                                                                    onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                                                                    className="w-full h-8 px-2 bg-white text-[#2c3338] border border-[#8c8f94] rounded-[3px] text-sm outline-none focus:border-[#2271b1]"
                                                                >
                                                                    <option value="draft">Rascunho</option>
                                                                    <option value="active">Publicado</option>
                                                                    <option value="inactive">Arquivado</option>
                                                                </select>
                                                            </div>
                                                        </div>

                                                        <div className="space-y-4 col-span-1 md:col-span-3 border-t border-[#ccd0d4] pt-4 mt-2">
                                                            <div>
                                                                <label className="block text-[12px] font-bold mb-1">Subtítulo / Resumo</label>
                                                                <textarea
                                                                    value={editForm.subtitle || ""}
                                                                    onChange={(e) => setEditForm({ ...editForm, subtitle: e.target.value })}
                                                                    className="w-full h-20 p-3 bg-white text-[#2c3338] border border-[#8c8f94] rounded-[3px] text-sm outline-none focus:border-[#2271b1] resize-none"
                                                                    placeholder="Resumo curto da notícia..."
                                                                />
                                                            </div>
                                                            <div className="flex items-center gap-2 justify-end">
                                                                <button onClick={saveQuickEdit} className="h-8 px-6 bg-[#2271b1] text-white rounded-[3px] text-sm font-bold hover:bg-[#135e96] transition-colors">
                                                                    Atualizar Notícia
                                                                </button>
                                                                <button onClick={() => setQuickEditId(null)} className="h-8 px-6 border border-[#ccd0d4] text-[#1d2327] rounded-[3px] text-sm font-bold hover:bg-white transition-colors">
                                                                    Cancelar
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </React.Fragment>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <div className="mt-4 text-[13px] text-[#50575e]">{filteredNews.length} itens</div>

            <ConfirmationModal
                isOpen={!!confirmAction}
                onClose={() => setConfirmAction(null)}
                onConfirm={runConfirmedAction}
                title={confirmAction?.kind === "trash" ? "Mover para o Lixo" : "Arquivar Notícia"}
                description={
                    confirmAction?.bulk
                        ? `Tem a certeza que deseja ${confirmAction.kind === "trash" ? "mover para o lixo" : "arquivar"} ${selectedIds.size} notícia(s)?`
                        : `Tem a certeza que deseja ${confirmAction?.kind === "trash" ? "mover" : "arquivar"} "${confirmAction?.title}"${confirmAction?.kind === "trash" ? " para o lixo" : ""}?`
                }
                confirmLabel={confirmAction?.kind === "trash" ? "Mover para o Lixo" : "Arquivar"}
                variant={confirmAction?.kind === "trash" ? "destructive" : "default"}
            />
        </div>
    );
}
