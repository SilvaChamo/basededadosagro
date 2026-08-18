"use client";

import { useEffect, useState, Suspense } from "react";
import { createClient } from "@/utils/supabase/client";
import { AdminDataTable } from "@/components/admin/AdminDataTable";
import { Button } from "@/components/ui/button";
import { Plus, LayoutGrid, List, Pencil, Trash2, Calendar, Link as LinkIcon, Search, GraduationCap, FileText, BookOpen, Layers, Archive, RotateCcw, MoreVertical } from "lucide-react";
import { Input } from "@/components/ui/input";
import { NewsCard } from "@/components/NewsCard";
import { toast } from "sonner";
import { ConfirmationModal } from "@/components/ui/ConfirmationModal";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useRouter, useSearchParams } from "next/navigation";
import { Spinner } from "@/components/ui/spinner";

function AdminArtigosCientificosContent() {
    const supabase = createClient();
    const router = useRouter();
    const searchParams = useSearchParams();
    const tabParam = searchParams.get('tab');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [activeTab, setActiveTab] = useState(tabParam || 'Dissertações');

    // O menu lateral (grupo "Documentos") liga para /admin/artigos?tab=X —
    // mantém o separador sincronizado se o parâmetro mudar.
    useEffect(() => {
        setActiveTab(tabParam || 'Dissertações');
    }, [tabParam]);
    const [articles, setArticles] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [editingArticle, setEditingArticle] = useState<null | any>(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);
    const [articleToDelete, setArticleToDelete] = useState<any>(null);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [statusFilter, setStatusFilter] = useState("active"); // active, archived, deleted
    const [showEmptyBinConfirm, setShowEmptyBinConfirm] = useState(false);

    const tabs = [
        { id: 'Dissertações', label: 'Dissertações', icon: GraduationCap },
        { id: 'Artigos', label: 'Artigos Científicos', icon: FileText },
        { id: 'Livros', label: 'Livros & Manuais', icon: BookOpen },
        { id: 'Outros', label: 'Outros', icon: Layers },
    ];

    const fetchArticles = async () => {
        setLoading(true);
        try {
            let query = supabase
                .from('articles')
                .select('*')
                .in('type', tabs.map((t: any) => t.id));

            if (statusFilter === 'active') {
                query = query.is('deleted_at', null).or('status.eq.active,status.is.null');
            } else if (statusFilter === 'archived') {
                query = query.is('deleted_at', null).eq('status', 'inactive');
            } else if (statusFilter === 'deleted') {
                query = query.not('deleted_at', 'is', null);
            }

            query = query.order('created_at', { ascending: false });

            const { data, error } = await query;

            if (error) {
                if (error.code === '42703') { // Column does not exist
                    let fallbackQuery = supabase
                        .from('articles')
                        .select('*')
                        .in('type', tabs.map((t: any) => t.id))
                        .order('created_at', { ascending: false });

                    if (statusFilter === 'deleted') {
                        fallbackQuery = fallbackQuery.not('deleted_at', 'is', null);
                    } else if (statusFilter === 'active') {
                        fallbackQuery = fallbackQuery.is('deleted_at', null);
                    } else {
                        // Archived mode - if column missing, we can't have archived items
                        setArticles([]);
                        return;
                    }
                    const { data: fallbackData, error: fallbackError } = await fallbackQuery;
                    if (fallbackError) throw fallbackError;
                    setArticles(fallbackData || []);
                } else {
                    throw error;
                }
            } else {
                setArticles(data || []);
            }
        } catch (error: any) {
            console.error(error);
            toast.error("Erro ao carregar artigos");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchArticles();
    }, [statusFilter]);

    const confirmDelete = async () => {
        if (!articleToDelete) return;

        try {
            if (statusFilter === 'deleted') {
                // Hard Delete (Permanent) for items already in Bin
                const { error, count } = await supabase
                    .from('articles')
                    .delete({ count: 'exact' })
                    .eq('id', articleToDelete.id);

                if (error) throw error;
                if (count === 0) throw new Error("Permissão negada ou item não encontrado.");

                toast.success("Artigo eliminado permanentemente!");
            } else {
                // Soft Delete (Move to Bin) for active items
                const { error, count } = await supabase
                    .from('articles')
                    .update({
                        deleted_at: new Date().toISOString(),
                        status: 'deleted'
                    }, { count: 'exact' })
                    .eq('id', articleToDelete.id);

                if (error) throw error;
                if (count === 0) throw new Error("Permissão negada ou item não encontrado.");

                toast.success("Artigo movido para a lixeira!");
            }

            await fetchArticles();
        } catch (error: any) {
            toast.error(error.message || "Erro ao eliminar artigo");
        } finally {
            setShowDeleteConfirm(false);
            setArticleToDelete(null);
        }
    };

    const handleRestore = async (article: any) => {
        try {
            const { error, count } = await supabase
                .from('articles')
                .update({
                    deleted_at: null,
                    status: 'active'
                }, { count: 'exact' })
                .eq('id', article.id);

            if (error) {
                if (error.code === '42703') {
                    const { error: fallbackError, count: fallbackCount } = await supabase
                        .from('articles')
                        .update({ deleted_at: null }, { count: 'exact' })
                        .eq('id', article.id);
                    if (fallbackError) throw fallbackError;
                } else {
                    throw error;
                }
            }

            toast.success("Artigo restaurado com sucesso!");
            await fetchArticles();
        } catch (error: any) {
            toast.error(error.message || "Erro ao restaurar artigo");
        }
    };

    const handleArchive = async (article: any) => {
        const newStatus = statusFilter === 'archived' ? 'active' : 'inactive';
        try {
            const { error } = await supabase
                .from('articles')
                .update({ status: newStatus })
                .eq('id', article.id);

            if (error) {
                if (error.code === '42703') {
                    toast.error("Funcionalidade de Arquivo requer actualização da base de dados.");
                } else {
                    throw error;
                }
                return;
            }

            toast.success(newStatus === 'inactive' ? "Artigo arquivado" : "Artigo restaurado");
            await fetchArticles();
        } catch (error: any) {
            toast.error("Erro ao actualizar estado");
        }
    };

    const handleRestoreAll = async () => {
        try {
            const query = supabase.from('articles').update({
                deleted_at: null,
                status: 'active'
            }).in('type', tabs.map((t: any) => t.id));

            if (statusFilter === 'deleted') {
                query.not('deleted_at', 'is', null);
            } else {
                query.eq('status', 'inactive');
            }

            const { error } = await query;
            if (error) throw error;

            toast.success("Todos os itens foram restaurados");
            await fetchArticles();
        } catch (error: any) {
            toast.error("Erro ao restaurar todos os itens");
        }
    };

    const handleEmptyBin = async () => {
        try {
            const { error, count } = await supabase
                .from('articles')
                .delete({ count: 'exact' })
                .not('deleted_at', 'is', null)
                .in('type', tabs.map((t: any) => t.id));

            if (error) throw error;

            toast.success(`Lixeira esvaziada! ${count} artigo(s) eliminado(s) permanentemente.`);
            await fetchArticles();
        } catch (error: any) {
            toast.error(error.message || "Erro ao esvaziar lixeira");
        }
    };

    const confirmBulkDelete = async () => {
        const previousArticles = [...articles];
        try {
            // Optimistic update
            setArticles(prev => prev.filter((a: any) => !selectedIds.includes(a.id)));

            const { error } = await supabase
                .from('articles')
                .delete()
                .in('id', selectedIds);

            if (error) throw error;

            toast.success(`${selectedIds.length} documentos eliminados!`);
            setSelectedIds([]);
            await fetchArticles();
        } catch (error: any) {
            setArticles(previousArticles);
            toast.error("Erro na eliminação em massa: " + error.message);
        } finally {
            setShowBulkDeleteConfirm(false);
        }
    };

    const handleDelete = (article: any) => {
        setArticleToDelete(article);
        setShowDeleteConfirm(true);
    };

    const handleEdit = (article: any) => {
        router.push(`/admin/artigos/${article.id}`);
    };


    const filteredArticles = articles.filter((a: any) => {
        const matchesSearch = a.title.toLowerCase().includes(search.toLowerCase());
        const matchesType = a.type === activeTab;
        return matchesSearch && matchesType;
    });

    const columns = [
        {
            header: "Título",
            key: "title",
            render: (val: string, row: any) => (
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-slate-100 overflow-hidden flex-shrink-0 border border-slate-200">
                        {row.image_url && <img src={row.image_url} className="w-full h-full object-cover" />}
                        {!row.image_url && <div className="w-full h-full flex items-center justify-center"><GraduationCap className="w-4 h-4 text-slate-300" /></div>}
                    </div>
                    <span className="font-semibold text-slate-700 line-clamp-1">{val}</span>
                </div>
            )
        },
        {
            header: "Tipo",
            key: "type",
            render: (val: string) => (
                <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded text-[10px] font-bold uppercase">
                    {val}
                </span>
            )
        },
        {
            header: "Data",
            key: "date",
            render: (val: string, row: any) => new Date(val || row.created_at).toLocaleDateString()
        }
    ];

    return (
        <div className="space-y-8">
            {/* Header & Controls */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">Artigos</h1>
                </div>

                <div className="flex flex-col md:flex-row items-center gap-3">
                    {/* Category Selector */}
                    <select
                        value={activeTab}
                        onChange={(e) => {
                            setActiveTab(e.target.value);
                            setStatusFilter('active');
                            if (viewMode === 'list') setViewMode('list');
                        }}
                        className="bg-white border border-slate-200 text-slate-600 text-xs font-bold uppercase tracking-wide rounded-lg px-4 py-2 outline-none focus:border-emerald-500 h-10 w-full md:w-40"
                    >
                        {tabs.map((tab: any) => (
                            <option key={tab.id} value={tab.id}>{tab.label}</option>
                        ))}
                    </select>

                    {/* Search Input */}
                    <div className="relative w-72">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                        <Input
                            placeholder="Buscar documentos..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-9 h-10 bg-white border-slate-200 text-sm"
                        />
                    </div>

                    {/* Status Toggles */}
                    <div className="flex items-center bg-white p-1 rounded-lg border border-slate-200 shadow-sm">
                        <button
                            onClick={() => setStatusFilter('active')}
                            className={`p-2 rounded-md transition-all ${statusFilter === 'active' ? 'bg-slate-100 text-emerald-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                            title="Activos"
                        >
                            <List className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => setStatusFilter('archived')}
                            className={`p-2 rounded-md transition-all ${statusFilter === 'archived' ? 'bg-amber-50 text-amber-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                            title="Arquivados"
                        >
                            <Archive className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => setStatusFilter('deleted')}
                            className={`p-2 rounded-md transition-all ${statusFilter === 'deleted' ? 'bg-rose-50 text-rose-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                            title="Lixeira"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>



                    {/* View Toggles */}
                    <div className="flex items-center bg-white p-1 rounded-lg border border-slate-200 shadow-sm">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`p-2 rounded-md transition-all ${viewMode === 'grid' ? 'bg-slate-100 text-emerald-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            <LayoutGrid className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`p-2 rounded-md transition-all ${viewMode === 'list' ? 'bg-slate-100 text-emerald-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            <List className="w-4 h-4" />
                        </button>
                    </div>

                    <Button
                        onClick={() => router.push('/admin/artigos/novo')}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold uppercase tracking-widest text-[10px] h-10 px-4 rounded-lg gap-2"
                    >
                        <Plus className="w-4 h-4" />
                        Novo Científico
                    </Button>
                </div>
            </div>

            {/* Bin Banner (Optional, keeping consistent with Noticias logic if we remove it, but good for feedback) */}
            {/* Same decision as Noticias: Remove generic banner, use empty state or table header */}

            {/* Content */}
            {loading ? (
                <div className="flex justify-center py-20">
                    <Spinner className="h-8 w-8" />
                </div>
            ) : filteredArticles.length === 0 ? (
                <div className="text-center py-20 bg-slate-50/50 rounded-2xl border-2 border-dashed border-slate-100">
                    <div className="mb-4 flex justify-center">
                        <div className="w-16 h-16 bg-white rounded-full shadow-sm flex items-center justify-center">
                            <BookOpen className="w-8 h-8 text-slate-200" />
                        </div>
                    </div>
                    <h3 className="font-bold text-slate-900 mb-1">
                        {statusFilter === 'deleted' ? "Lixeira vazia" : statusFilter === 'archived' ? "Arquivo vazio" : "Nenhum documento encontrado"}
                    </h3>
                    <p className="text-sm text-slate-400 italic max-w-xs mx-auto">
                        {statusFilter === 'deleted' ? "Não há itens na lixeira." : "Comece adicionando um novo documento ou altere os filtros."}
                    </p>
                </div>
            ) : viewMode === 'grid' ? (
                // Grid View
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 3xl:grid-cols-5 4xl:grid-cols-6 gap-6">
                    {filteredArticles.map((article) => (
                        <NewsCard
                            key={article.id}
                            title={article.title}
                            subtitle={article.subtitle}
                            category={article.type}
                            categories={article.categories}
                            date={article.date || article.created_at}
                            image={article.image_url}
                            slug={article.slug}
                            isAdmin={true}
                            isDeleted={statusFilter === 'deleted'}
                            isArchived={statusFilter === 'archived'}
                            onArchive={() => handleArchive(article)}
                            onRestore={() => handleRestore(article)}
                            onEdit={() => handleEdit(article)}
                            onDelete={() => handleDelete(article)}
                        />
                    ))}
                    {/* Add New Card (Only in Active Mode) */}
                    {statusFilter === 'active' && (
                        <button
                            onClick={() => router.push('/admin/artigos/novo')}
                            className="bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center p-6 hover:border-emerald-500 hover:bg-emerald-50/50 transition-all group min-h-[400px]"
                        >
                            <div className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                <Plus className="w-6 h-6 text-emerald-500" />
                            </div>
                            <span className="font-bold text-slate-400 group-hover:text-emerald-600">Novo Científico</span>
                        </button>
                    )}
                </div>
            ) : (
                // List View
                <AdminDataTable
                    title={statusFilter === 'deleted' ? "Reciclagem de Artigos" : statusFilter === 'archived' ? "Arquivo de Artigos" : activeTab}
                    columns={columns}
                    data={filteredArticles}
                    loading={loading}
                    hideSearch={true}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    selectedIds={selectedIds}
                    onSelectRow={(id: string, selected: boolean) => {
                        if (selected) setSelectedIds(prev => [...prev, id]);
                        else setSelectedIds(prev => prev.filter(i => i !== id));
                    }}
                    onSelectAll={(all: boolean) => {
                        if (all) {
                            setSelectedIds(filteredArticles.map((r: any) => r.id));
                        } else {
                            setSelectedIds([]);
                        }
                    }}
                    bulkActions={
                        selectedIds.length > 0 && (
                            <Button
                                onClick={() => setShowBulkDeleteConfirm(true)}
                                variant="outline"
                                className="bg-white/10 text-white hover:bg-white/20 border-white/20 h-8 text-xs font-bold uppercase tracking-wider gap-2"
                            >
                                <Trash2 className="w-3.5 h-3.5" />
                                {statusFilter === 'deleted' ? 'Eliminar Definitivamente' : 'Mover para Lixeira'} ({selectedIds.length})
                            </Button>
                        )
                    }
                    headerMenu={
                        (statusFilter === 'deleted' || statusFilter === 'archived') && filteredArticles.length > 0 ? (
                            <div className="flex flex-col">
                                <button
                                    onClick={handleRestoreAll}
                                    className="flex items-center gap-2 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 w-full text-left rounded-sm font-medium transition-colors"
                                >
                                    <RotateCcw className="w-4 h-4" />
                                    Restaurar Tudo
                                </button>
                                {statusFilter === 'deleted' && (
                                    <button
                                        onClick={() => setShowEmptyBinConfirm(true)}
                                        className="flex items-center gap-2 px-3 py-2 text-sm text-rose-600 hover:bg-rose-50 w-full text-left rounded-sm font-medium transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                        Esvaziar Lixeira
                                    </button>
                                )}
                            </div>
                        ) : null
                    }
                    customActions={(row) => {
                        if (statusFilter === 'deleted') {
                            return (
                                <button
                                    onClick={(e) => { e.stopPropagation(); handleRestore(row); }}
                                    className="size-7 rounded text-slate-400 flex items-center justify-center hover:bg-emerald-50 hover:text-emerald-600 transition-all font-bold"
                                    title="Restaurar"
                                >
                                    <RotateCcw className="w-3.5 h-3.5" />
                                </button>
                            );
                        }
                        return (
                            <button
                                onClick={(e) => { e.stopPropagation(); handleArchive(row); }}
                                className={`size-7 rounded text-slate-400 flex items-center justify-center hover:bg-amber-50 hover:text-amber-600 transition-all font-bold`}
                                title={statusFilter === 'archived' ? 'Desarquivar' : 'Arquivar'}
                            >
                                <Archive className="w-3.5 h-3.5" />
                            </button>
                        );
                    }}
                    hideHeader={statusFilter === 'active'}
                    pageSize={50}
                />
            )}


            <ConfirmationModal
                key={statusFilter}
                isOpen={showDeleteConfirm}
                onClose={() => setShowDeleteConfirm(false)}
                onConfirm={confirmDelete}
                title={statusFilter === 'deleted' ? "Eliminar Permanentemente" : "Mover para Lixeira"}
                description={
                    statusFilter === 'deleted'
                        ? `Tem a certeza que deseja eliminar PERMANENTEMENTE o artigo "${articleToDelete?.title}"? Esta acção NÃO pode ser desfeita.`
                        : `O artigo "${articleToDelete?.title}" será movido para a lixeira. Poderá restaurá-lo mais tarde.`
                }
                confirmLabel={statusFilter === 'deleted' ? "Eliminar de vez" : "Mover para Lixeira"}
                variant="destructive"
            />

            <ConfirmationModal
                isOpen={showEmptyBinConfirm}
                onClose={() => setShowEmptyBinConfirm(false)}
                onConfirm={handleEmptyBin}
                title="Esvaziar Lixeira"
                description="Tem a certeza que deseja eliminar PERMANENTEMENTE todos os artigos na lixeira? Esta acção NÃO pode ser desfeita."
                confirmLabel="Esvaziar Lixeira"
                variant="destructive"
            />

            <ConfirmationModal
                isOpen={showBulkDeleteConfirm}
                onClose={() => setShowBulkDeleteConfirm(false)}
                onConfirm={confirmBulkDelete}
                title="Eliminar em Massa"
                description={`Tem a certeza que deseja eliminar ${selectedIds.length} documentos? Esta acção não pode ser desfeita.`}
                confirmLabel="Eliminar Todos"
                variant="destructive"
            />
        </div>
    );
}

export default function AdminArtigosCientificosPage() {
    return (
        <Suspense fallback={<div className="flex justify-center py-20"><Spinner className="h-8 w-8" /></div>}>
            <AdminArtigosCientificosContent />
        </Suspense>
    );
}
