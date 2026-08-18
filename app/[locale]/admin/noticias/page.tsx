"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { AdminDataTable } from "@/components/admin/AdminDataTable";
import { Button } from "@/components/ui/button";
import { Plus, LayoutGrid, List, Pencil, Trash2, Calendar, Link as LinkIcon, Search, RotateCcw, Trash, X, Archive } from "lucide-react";
import { ArticleForm } from "@/components/admin/ArticleForm";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { ConfirmationModal } from "@/components/ui/ConfirmationModal";
import { NewsCard } from "@/components/NewsCard";
import { Spinner } from "@/components/ui/spinner";

function AdminNoticiasContent() {
    const supabase = createClient();
    const searchParams = useSearchParams();
    const tabParam = searchParams.get('tab');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [activeTab, setActiveTab] = useState(tabParam || 'Todas');

    // O menu lateral (grupo "Notícias") liga para /admin/noticias?tab=X —
    // mantém o separador sincronizado se o parâmetro mudar.
    useEffect(() => {
        setActiveTab(tabParam || 'Todas');
    }, [tabParam]);
    const [articles, setArticles] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingArticle, setEditingArticle] = useState<null | any>(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);
    const [articleToDelete, setArticleToDelete] = useState<any>(null);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [statusFilter, setStatusFilter] = useState<'active' | 'archived' | 'deleted'>('active');
    const [showEmptyBinConfirm, setShowEmptyBinConfirm] = useState(false);
    const [pendingArticles, setPendingArticles] = useState<any[]>([]);
    const [pendingLoading, setPendingLoading] = useState(true);
    const [publishingFromPendingId, setPublishingFromPendingId] = useState<string | null>(null);
    const [pendingToDiscard, setPendingToDiscard] = useState<any>(null);
    const [pendingCategoryFilter, setPendingCategoryFilter] = useState('Todas');
    const [selectedPendingIds, setSelectedPendingIds] = useState<string[]>([]);
    const [showBulkDiscardConfirm, setShowBulkDiscardConfirm] = useState(false);

    const pendingCategories = ['Todas', ...Array.from(new Set(pendingArticles.map((p: any) => p.category || 'Notícia')))];
    const filteredPending = pendingCategoryFilter === 'Todas'
        ? pendingArticles
        : pendingArticles.filter((p: any) => (p.category || 'Notícia') === pendingCategoryFilter);

    const fetchPending = async () => {
        setPendingLoading(true);
        const { data } = await supabase
            .from('articles_pending')
            .select('*')
            .order('date', { ascending: false, nullsFirst: false });
        // Relatórios pertencem à secção Documentos, nunca à fila de pendentes de Notícias.
        const withoutReports = (data || []).filter((p: any) => p.category !== 'Relatório' && p.category !== 'Relatórios');
        setPendingArticles(withoutReports);
        setPendingLoading(false);
    };

    useEffect(() => {
        fetchPending();
    }, []);

    // O robô guarda o corpo do artigo como texto simples (parágrafos
    // separados por linha em branco) — o editor espera HTML, por isso sem
    // isto o texto entrava tudo junto, sem parágrafos nem espaçamento.
    const snippetToHtml = (snippet: string) => {
        const escapeHtml = (s: string) => s
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
        return snippet
            .split(/\n\s*\n/)
            .map((p) => p.trim())
            .filter(Boolean)
            .map((p) => `<p>${escapeHtml(p)}</p>`)
            .join('');
    };

    const handleReviewPending = (pending: any) => {
        setPublishingFromPendingId(pending.id);
        setEditingArticle({
            title: pending.title,
            subtitle: '',
            type: pending.category || 'Notícia',
            content: pending.snippet ? snippetToHtml(pending.snippet) : '',
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

    const togglePendingSelect = (id: string) => {
        setSelectedPendingIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    };

    const confirmBulkDiscard = async () => {
        const previousPending = [...pendingArticles];
        try {
            setPendingArticles(prev => prev.filter((p: any) => !selectedPendingIds.includes(p.id)));

            const { error } = await supabase.from('articles_pending').delete().in('id', selectedPendingIds);
            if (error) throw error;

            toast.success(`${selectedPendingIds.length} notícias descartadas!`);
            setSelectedPendingIds([]);
        } catch (error: any) {
            setPendingArticles(previousPending);
            toast.error("Erro ao descartar em massa: " + error.message);
        } finally {
            setShowBulkDiscardConfirm(false);
        }
    };

    const fetchArticles = async () => {
        setLoading(true);
        try {
            let query = supabase.from('articles').select('*').order('created_at', { ascending: false });

            // "Eliminado" continua a basear-se em deleted_at (como antes); "arquivado"
            // é um eixo independente via `status`, e "activo" mostra tudo o que não
            // está eliminado nem arquivado (trata status nulo como activo, para não
            // esconder artigos antigos criados antes desta coluna existir).
            if (statusFilter === 'deleted') query = query.not('deleted_at', 'is', null);
            else if (statusFilter === 'archived') query = query.eq('status', 'archived').is('deleted_at', null);
            else query = query.is('deleted_at', null).or('status.is.null,status.neq.archived');

            const { data, error } = await query;

            if (error) {
                // Fallback if 'status' column doesn't exist yet on this database
                if (error.code === '42703') {
                    let fallbackQuery = supabase.from('articles').select('*').order('created_at', { ascending: false });
                    if (statusFilter === 'deleted') fallbackQuery = fallbackQuery.not('deleted_at', 'is', null);
                    else if (statusFilter === 'active') fallbackQuery = fallbackQuery.is('deleted_at', null);
                    else {
                        setArticles([]);
                        setLoading(false);
                        return;
                    }
                    const { data: fbData, error: fbError } = await fallbackQuery;
                    if (fbError) throw fbError;
                    setArticles(fbData || []);
                } else {
                    throw error;
                }
            } else {
                setArticles(data || []);
            }
        } catch (error) {
            console.error(error);
            toast.error("Erro ao carregar artigos");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchArticles();
    }, [statusFilter]);

    const handleArchive = async (article: any) => {
        const newStatus = statusFilter === 'archived' ? 'active' : 'archived';
        try {
            const { error } = await supabase.from('articles').update({ status: newStatus }).eq('id', article.id);
            if (error) {
                if (error.code === '42703') {
                    toast.error("Funcionalidade de Arquivo requer actualização da base de dados.");
                } else {
                    throw error;
                }
                return;
            }
            toast.success(newStatus === 'archived' ? "Artigo arquivado" : "Artigo restaurado");
            fetchArticles();
        } catch (error) {
            console.error(error);
            toast.error("Erro ao alterar estado do artigo");
        }
    };

    const confirmDelete = async () => {
        if (!articleToDelete) return;

        try {
            if (statusFilter === 'deleted') {
                // Hard Delete (Permanent) for items already in Bin
                const res = await fetch('/api/admin/articles', {
                    method: 'DELETE',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ ids: [articleToDelete.id] }),
                });
                const result = await res.json();
                if (!res.ok) throw new Error(result.error || "Erro ao eliminar.");

                toast.success("Artigo eliminado permanentemente!");
            } else {
                // Soft Delete (Move to Bin) for active items
                const res = await fetch('/api/admin/articles', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id: articleToDelete.id, payload: { deleted_at: new Date().toISOString() } }),
                });
                const result = await res.json();
                if (!res.ok) throw new Error(result.error || "Erro ao mover para a lixeira.");

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
            const res = await fetch('/api/admin/articles', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: article.id, payload: { deleted_at: null } }),
            });
            const result = await res.json();
            if (!res.ok) throw new Error(result.error || "Erro ao restaurar.");

            toast.success("Artigo restaurado com sucesso!");
            await fetchArticles();
        } catch (error: any) {
            toast.error(error.message || "Erro ao restaurar artigo");
        }
    };

    const handleEmptyBin = async () => {
        try {
            const binIds = articles.filter((a: any) => a.deleted_at).map((a: any) => a.id);
            if (binIds.length === 0) return;

            const res = await fetch('/api/admin/articles', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ids: binIds }),
            });
            const result = await res.json();
            if (!res.ok) throw new Error(result.error || "Erro ao esvaziar lixeira.");

            toast.success(`Lixeira esvaziada! ${result.count} artigo(s) eliminado(s) permanentemente.`);
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

            const res = await fetch('/api/admin/articles', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ids: selectedIds }),
            });
            const result = await res.json();
            if (!res.ok) throw new Error(result.error || "Erro na eliminação em massa.");

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
        // Relatórios pertencem à secção Documentos, nunca à Gestão de Notícias.
        if (a.type === 'Relatório' || a.type === 'Relatórios') return false;

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

    if (isFormOpen) {
        return (
            <ArticleForm
                onClose={() => { setIsFormOpen(false); setPublishingFromPendingId(null); }}
                onSuccess={handleSuccess}
                initialData={editingArticle}
            />
        );
    }

    return (
        <div className="space-y-4">
            {/* Barra de gestão - a navegação por categoria já vive no menu lateral
                "Notícias", por isso aqui só ficam: em "Pendentes", os filtros da
                fila (não existem no menu lateral) à esquerda; nas restantes vistas,
                a pesquisa; e à direita os botões de gestão (grelha/lista, arquivo,
                lixeira, novo artigo), tudo na mesma linha. */}
            <div className="flex items-center gap-4">
                {activeTab === 'Pendentes' ? (
                    !pendingLoading && pendingArticles.length > 0 && (
                        <div className="flex items-center gap-1 bg-emerald-50 p-1 rounded-[8px] border border-emerald-200 flex-wrap">
                            {pendingCategories.map((cat) => (
                                <button
                                    key={cat}
                                    onClick={() => setPendingCategoryFilter(cat)}
                                    className={`px-3 py-2 rounded-[8px] text-xs font-bold uppercase tracking-wider transition-all ${pendingCategoryFilter === cat
                                        ? 'bg-emerald-600 text-white shadow-sm'
                                        : 'text-slate-600 hover:bg-[#f97316] hover:text-white'
                                        }`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    )
                ) : (
                    <div className="relative">
                        <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-slate-400" />
                        <Input
                            placeholder={`Pesquisar...`}
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-8 border-none bg-slate-50 focus-visible:ring-0 text-sm w-48"
                        />
                    </div>
                )}

                <div className="flex items-center gap-2 ml-auto">
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

                    <div className="flex items-center gap-0.5">
                        {/* Archived Button */}
                        <button
                            onClick={() => setStatusFilter(statusFilter === 'archived' ? 'active' : 'archived')}
                            className={`px-4 py-2.5 rounded-md text-xs font-bold transition-all flex items-center gap-2 ${statusFilter === 'archived' ? 'bg-amber-50 text-amber-600 ring-1 ring-amber-200' : 'text-slate-500 hover:bg-slate-50'}`}
                            title="Arquivados"
                        >
                            <Archive className="w-4 h-4" />
                        </button>

                        {/* Bin Button */}
                        <button
                            onClick={() => setStatusFilter(statusFilter === 'deleted' ? 'active' : 'deleted')}
                            className={`px-4 py-2.5 rounded-md text-xs font-bold transition-all flex items-center gap-2 ${statusFilter === 'deleted' ? 'bg-rose-50 text-rose-600 ring-1 ring-rose-200' : 'text-slate-500 hover:bg-slate-50'}`}
                            title="Lixeira"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>

                    <Button onClick={() => { setEditingArticle(null); setPublishingFromPendingId(null); setIsFormOpen(true); }} className="bg-emerald-600 hover:bg-emerald-700">
                        <Plus className="w-4 h-4 mr-2" />
                        Novo Artigo
                    </Button>
                </div>
            </div>

            {/* Bin Actions - Show when bin is active */}
            {statusFilter === 'deleted' && (
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
                            <Spinner className="h-8 w-8" />
                        </div>
                    ) : pendingArticles.length === 0 ? (
                        <div className="text-center py-20 text-slate-400">
                            Sem notícias pendentes de momento.
                        </div>
                    ) : (
                        <>
                            {selectedPendingIds.length > 0 && (
                                <div className="mb-4 flex items-center justify-between bg-emerald-600 text-white rounded-[8px] px-4 py-3">
                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={() => setSelectedPendingIds([])}
                                            className="p-1 hover:bg-white/10 rounded transition-colors"
                                            title="Limpar selecção"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                        <span className="text-sm font-black tracking-tight">
                                            {selectedPendingIds.length} {selectedPendingIds.length === 1 ? 'seleccionado' : 'seleccionados'}
                                        </span>
                                    </div>
                                    <button
                                        onClick={() => setShowBulkDiscardConfirm(true)}
                                        className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider bg-white/10 hover:bg-white/20 px-3 py-2 rounded-md transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                        Descartar seleccionados
                                    </button>
                                </div>
                            )}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 3xl:grid-cols-5 4xl:grid-cols-6 gap-6">
                                {filteredPending.map((pending: any) => (
                                    <NewsCard
                                        key={pending.id}
                                        title={pending.title}
                                        category={pending.category}
                                        date={pending.date || pending.created_at}
                                        image={pending.image_url || undefined}
                                        slug={pending.id}
                                        isAdmin={true}
                                        onEdit={() => handleReviewPending(pending)}
                                        onDelete={() => setPendingToDiscard(pending)}
                                        ctaLabel="Rever e Publicar"
                                        onCtaClick={() => handleReviewPending(pending)}
                                        sourceUrl={pending.source_url}
                                        sourceLabel={pending.source ? `Fonte: ${pending.source}` : undefined}
                                        selectable
                                        selected={selectedPendingIds.includes(pending.id)}
                                        onToggleSelect={() => togglePendingSelect(pending.id)}
                                    />
                                ))}
                            </div>
                        </>
                    )
                ) : loading ? (
                    <div className="flex justify-center py-20">
                        <Spinner className="h-8 w-8" />
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
                                categories={article.categories}
                                date={article.date || article.created_at}
                                image={article.image_url}
                                slug={article.slug}
                                isAdmin={true}
                                isDeleted={statusFilter === 'deleted'}
                                isArchived={statusFilter === 'archived'}
                                onEdit={() => handleEdit(article)}
                                onDelete={() => handleDelete(article)}
                                onRestore={() => handleRestore(article)}
                                onArchive={() => handleArchive(article)}
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

                <ConfirmationModal
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

                <ConfirmationModal
                    isOpen={showBulkDiscardConfirm}
                    onClose={() => setShowBulkDiscardConfirm(false)}
                    onConfirm={confirmBulkDiscard}
                    title="Descartar Notícias Pendentes"
                    description={`Tem a certeza que deseja descartar ${selectedPendingIds.length} notícias pendentes? Esta acção não pode ser desfeita.`}
                    confirmLabel="Descartar Todas"
                    variant="destructive"
                />
            </div>
        </div>
    );
}

export default function AdminNoticiasPage() {
    return (
        <Suspense fallback={<div className="flex justify-center py-20"><Spinner className="h-8 w-8" /></div>}>
            <AdminNoticiasContent />
        </Suspense>
    );
}
