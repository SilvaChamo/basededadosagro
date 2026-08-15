"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { AdminDataTable } from "@/components/admin/AdminDataTable";
import { Button } from "@/components/ui/button";
import { Plus, LayoutGrid, List, Pencil, Trash2, Calendar, Link as LinkIcon, Search, FileText, Globe, BookOpen, Lightbulb, RotateCcw, Trash, Bot, ExternalLink, CheckCircle2 } from "lucide-react";
import { ArticleForm } from "@/components/admin/ArticleForm";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { ConfirmationModal } from "@/components/ui/ConfirmationModal";
import { NewsCard } from "@/components/NewsCard";

export default function AdminNoticiasPage() {
    const supabase = createClient();
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [activeTab, setActiveTab] = useState('Todas');
    const [articles, setArticles] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingArticle, setEditingArticle] = useState<null | any>(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);
    const [articleToDelete, setArticleToDelete] = useState<any>(null);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [showBin, setShowBin] = useState(false);
    const [showEmptyBinConfirm, setShowEmptyBinConfirm] = useState(false);
    const [pendingArticles, setPendingArticles] = useState<any[]>([]);
    const [pendingLoading, setPendingLoading] = useState(true);
    const [publishingFromPendingId, setPublishingFromPendingId] = useState<string | null>(null);
    const [pendingToDiscard, setPendingToDiscard] = useState<any>(null);

    const tabs = [
        { id: 'Todas', label: 'Todas', icon: List },
        { id: 'Notícia', label: 'Notícias', icon: FileText },
        { id: 'Guia', label: 'Guias', icon: BookOpen },
        { id: 'Dicas', label: 'Dicas', icon: Lightbulb },
        { id: 'Internacional', label: 'Internacional', icon: Globe },
        { id: 'Pendentes', label: `Pendentes do Robô${pendingArticles.length > 0 ? ` (${pendingArticles.length})` : ''}`, icon: Bot },
    ];

    const fetchPending = async () => {
        setPendingLoading(true);
        const { data } = await supabase
            .from('articles_pending')
            .select('*')
            .order('created_at', { ascending: false });
        setPendingArticles(data || []);
        setPendingLoading(false);
    };

    useEffect(() => {
        fetchPending();
    }, []);

    const handleReviewPending = (pending: any) => {
        setPublishingFromPendingId(pending.id);
        setEditingArticle({
            title: pending.title,
            subtitle: pending.snippet || '',
            type: pending.category || 'Notícia',
            content: pending.snippet || '',
            image_url: pending.image_url || '',
            source: pending.source || '',
            source_url: pending.source_url || '',
            date: pending.date || new Date().toISOString().split('T')[0],
        });
        setIsFormOpen(true);
    };

    const handleDiscardPending = async () => {
        if (!pendingToDiscard) return;
        try {
            const { error } = await supabase.from('articles_pending').delete().eq('id', pendingToDiscard.id);
            if (error) throw error;
            toast.success('Notícia descartada.');
            await fetchPending();
        } catch (error: any) {
            toast.error(error.message || 'Erro ao descartar');
        } finally {
            setPendingToDiscard(null);
        }
    };

    const fetchArticles = async () => {
        setLoading(true);
        let query = supabase
            .from('articles')
            .select('*')
            .order('created_at', { ascending: false });

        if (showBin) {
            query = query.not('deleted_at', 'is', null);
        } else {
            query = query.is('deleted_at', null);
        }

        const { data, error } = await query;

        if (data) setArticles(data);
        setLoading(false);
    };

    useEffect(() => {
        fetchArticles();
    }, [showBin]);

    const confirmDelete = async () => {
        if (!articleToDelete) return;

        try {
            if (showBin) {
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
                    .update({ deleted_at: new Date().toISOString() }, { count: 'exact' })
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
                .update({ deleted_at: null }, { count: 'exact' })
                .eq('id', article.id);

            if (error) throw error;
            if (count === 0) throw new Error("Permissão negada ou item não encontrado.");

            toast.success("Artigo restaurado com sucesso!");
            await fetchArticles();
        } catch (error: any) {
            toast.error(error.message || "Erro ao restaurar artigo");
        }
    };

    const handleEmptyBin = async () => {
        try {
            const { error, count } = await supabase
                .from('articles')
                .delete({ count: 'exact' })
                .not('deleted_at', 'is', null);

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

            toast.success(`${selectedIds.length} artigos eliminados!`);
            setSelectedIds([]);
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
        setEditingArticle(article);
        setPublishingFromPendingId(null);
        setIsFormOpen(true);
    };

    const handleSuccess = async () => {
        await fetchArticles();
        if (publishingFromPendingId) {
            await supabase.from('articles_pending').delete().eq('id', publishingFromPendingId);
            setPublishingFromPendingId(null);
            await fetchPending();
        }
        setEditingArticle(null);
    };

    const filteredArticles = articles.filter((a: any) => {
        const matchesSearch = a.title.toLowerCase().includes(search.toLowerCase()) ||
            a.type?.toLowerCase().includes(search.toLowerCase());
        const matchesType = activeTab === 'Todas'
            ? true
            : activeTab === 'Notícia'
                ? (a.type === 'Notícia' || !a.type) // Default to Notícia if null
                : a.type === activeTab;

        return matchesSearch && matchesType;
    });

    const columns = [
        {
            header: "Artigo",
            key: "title",
            render: (val: string, row: any) => (
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-slate-100 overflow-hidden flex-shrink-0 border border-slate-200">
                        {row.image_url && <img src={row.image_url} className="w-full h-full object-cover" />}
                    </div>
                    <span className="font-semibold text-slate-700 line-clamp-1">{val}</span>
                </div>
            )
        },
        {
            header: "Categoria",
            key: "type",
            render: (val: string) => (
                <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded text-[10px] font-bold uppercase">
                    {val || 'Geral'}
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
        <div className="space-y-4">
            {/* Header - Single Line */}
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">Gestão de Notícias</h1>
                <Button onClick={() => { setEditingArticle(null); setPublishingFromPendingId(null); setIsFormOpen(true); }} className="bg-emerald-600 hover:bg-emerald-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Novo Artigo
                </Button>
            </div>

            {/* Menu Bar - All Controls */}
            <div className="flex items-center gap-4 bg-white rounded-lg border border-slate-200 shadow-sm">
                {/* Left Side - Categories */}
                <div className="flex items-center gap-1 bg-emerald-50 p-1 rounded-md border border-emerald-200">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => {
                                setActiveTab(tab.id);
                                setShowBin(false);
                            }}
                            className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-xs font-bold uppercase tracking-wider transition-all ${activeTab === tab.id
                                ? 'bg-emerald-600 text-white shadow-sm'
                                : 'text-slate-600 hover:bg-[#f97316] hover:text-white'
                                }`}
                        >
                            <tab.icon className="w-3.5 h-3.5" />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Right Side - Search + View Mode + Bin */}
                <div className="flex items-center gap-2 ml-auto">
                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-slate-400" />
                        <Input
                            placeholder={`Pesquisar...`}
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-8 border-none bg-slate-50 focus-visible:ring-0 text-sm w-48"
                        />
                    </div>

                    {/* View Mode */}
                    <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-md">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`p-1.5 rounded transition-all ${viewMode === 'grid' ? 'bg-white shadow text-emerald-600' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            <LayoutGrid className="w-3.5 h-3.5" />
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`p-1.5 rounded transition-all ${viewMode === 'list' ? 'bg-white shadow text-emerald-600' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            <List className="w-3.5 h-3.5" />
                        </button>
                    </div>

                    {/* Bin Button - Last on right */}
                    <div className="relative">
                        <button
                            onClick={() => setShowBin(!showBin)}
                            className={`px-4 py-2.5 rounded-md text-xs font-bold transition-all flex items-center gap-2 ${showBin ? 'bg-rose-50 text-rose-600 ring-1 ring-rose-200' : 'text-slate-500 hover:bg-slate-50'}`}
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Bin Actions - Show when bin is active */}
            {showBin && (
                <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Trash2 className="w-4 h-4 text-rose-600" />
                            <span className="text-sm font-semibold text-slate-700">Lixeira Activada</span>
                            <span className="text-xs text-slate-500">({filteredArticles.length} itens)</span>
                        </div>
                        <button
                            onClick={() => setShowEmptyBinConfirm(true)}
                            className="px-3 py-1.5 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-md border border-red-200 transition-all flex items-center gap-1.5"
                        >
                            <Trash className="w-3.5 h-3.5" />
                            Esvaziar Lixeira
                        </button>
                    </div>
                </div>
            )}

            {/* Content - with 40px margin from menu */}
            <div className="pt-10">
                {activeTab === 'Pendentes' ? (
                    pendingLoading ? (
                        <div className="flex justify-center py-20">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
                        </div>
                    ) : pendingArticles.length === 0 ? (
                        <div className="text-center py-20 text-slate-400">
                            <Bot className="w-10 h-10 mx-auto mb-3 text-slate-300" />
                            Sem notícias pendentes de momento. O robô procura novidades automaticamente.
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                            {pendingArticles.map((pending: any) => (
                                <div key={pending.id} className="bg-white rounded-[10px] shadow-md border border-slate-100 p-5 flex flex-col gap-3">
                                    <div className="flex items-center justify-between">
                                        <span className="bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded text-[10px] font-black uppercase tracking-wider">
                                            {pending.category || 'Notícia'}
                                        </span>
                                        <span className="text-[10px] text-slate-400 font-bold">
                                            {pending.date ? new Date(pending.date).toLocaleDateString() : ''}
                                        </span>
                                    </div>
                                    <h3 className="font-black text-slate-800 text-sm leading-snug line-clamp-3">
                                        {pending.title}
                                    </h3>
                                    {pending.snippet && (
                                        <p className="text-xs text-slate-500 leading-relaxed line-clamp-3">
                                            {pending.snippet}
                                        </p>
                                    )}
                                    {pending.source_url && (
                                        <a
                                            href={pending.source_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 hover:text-emerald-600 transition-colors"
                                        >
                                            <ExternalLink className="w-3 h-3" />
                                            {pending.source || 'Ver fonte original'}
                                        </a>
                                    )}
                                    <div className="mt-auto pt-3 border-t border-slate-50 flex items-center gap-2">
                                        <button
                                            onClick={() => handleReviewPending(pending)}
                                            className="flex-1 flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-2 rounded-lg transition-all"
                                        >
                                            <CheckCircle2 className="w-3.5 h-3.5" />
                                            Rever e Publicar
                                        </button>
                                        <button
                                            onClick={() => setPendingToDiscard(pending)}
                                            className="w-9 h-9 flex items-center justify-center rounded-lg bg-slate-50 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-all border border-slate-100"
                                            title="Descartar"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )
                ) : loading ? (
                    <div className="flex justify-center py-20">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
                    </div>
                ) : filteredArticles.length === 0 ? (
                    <div className="text-center py-20 text-slate-400">
                        Nenhum conteúdo encontrado nesta categoria.
                    </div>
                ) : viewMode === 'grid' ? (
                    // Grid View
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 3xl:grid-cols-5 4xl:grid-cols-6 gap-6">
                        {filteredArticles.map((article: any) => (
                            <NewsCard
                                key={article.id}
                                title={article.title}
                                subtitle={article.subtitle}
                                category={article.type}
                                date={article.date || article.created_at}
                                image={article.image_url}
                                slug={article.slug}
                                isAdmin={true}
                                isDeleted={showBin}
                                onEdit={() => handleEdit(article)}
                                onDelete={() => handleDelete(article)}
                                onRestore={() => handleRestore(article)}
                            />
                        ))}
                    </div>
                ) : (
                    // List View
                    <AdminDataTable
                        title={activeTab}
                        columns={columns}
                        data={filteredArticles}
                        loading={loading}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        selectedIds={selectedIds}
                        onSelectRow={(id: string, selected: boolean) => {
                            if (selected) setSelectedIds(prev => [...prev, id]);
                            else setSelectedIds(prev => prev.filter((i: any) => i !== id));
                        }}
                        onSelectAll={(all: boolean) => {
                            if (all) {
                                setSelectedIds(filteredArticles.map((r: any) => r.id));
                            } else {
                                setSelectedIds([]);
                            }
                        }}
                        bulkActions={
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setShowBulkDeleteConfirm(true)}
                                    className="p-2 hover:bg-white/10 rounded-full transition-colors text-white"
                                    title="Eliminar seleccionados"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            </div>
                        }
                        hideHeader={true}
                        pageSize={50}
                    />
                )}

                {/* Modal */}
                {isFormOpen && (
                    <ArticleForm
                        onClose={() => { setIsFormOpen(false); setPublishingFromPendingId(null); }}
                        onSuccess={handleSuccess}
                        initialData={editingArticle}
                    />
                )}

                <ConfirmationModal
                    isOpen={showDeleteConfirm}
                    onClose={() => setShowDeleteConfirm(false)}
                    onConfirm={confirmDelete}
                    title={showBin ? "Eliminar Permanentemente" : "Mover para Lixeira"}
                    description={
                        showBin
                            ? `Tem a certeza que deseja eliminar PERMANENTEMENTE o artigo "${articleToDelete?.title}"? Esta acção NÃO pode ser desfeita.`
                            : `O artigo "${articleToDelete?.title}" será movido para a lixeira. Poderá restaurá-lo mais tarde.`
                    }
                    confirmLabel={showBin ? "Eliminar de vez" : "Mover para Lixeira"}
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
                    description={`Tem a certeza que deseja eliminar ${selectedIds.length} artigos? Esta acção não pode ser desfeita.`}
                    confirmLabel="Eliminar Todos"
                    variant="destructive"
                />

                <ConfirmationModal
                    isOpen={!!pendingToDiscard}
                    onClose={() => setPendingToDiscard(null)}
                    onConfirm={handleDiscardPending}
                    title="Descartar Notícia Pendente"
                    description={`A notícia "${pendingToDiscard?.title}" será removida da lista de pendentes. Esta acção não pode ser desfeita.`}
                    confirmLabel="Descartar"
                    variant="destructive"
                />
            </div>
        </div>
    );
}
