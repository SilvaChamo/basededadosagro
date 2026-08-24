"use client";

import { useEffect, useState, Suspense } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { AdminListToolbar } from "@/components/admin/AdminListToolbar";
import { Plus, LayoutGrid, List, Search, FileText, Scale, Calendar, Link as LinkIcon, Pencil, Trash2, Layers, RotateCcw, Archive, MoreVertical } from "lucide-react";
import { AdminDataTable } from "@/components/admin/AdminDataTable";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { ConfirmationModal } from "@/components/ui/ConfirmationModal";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { DocumentCard } from "@/components/admin/DocumentCard";

import { useRouter, useSearchParams } from "next/navigation";
import { Spinner } from "@/components/ui/spinner";
import { getCachedList, setCachedList } from "@/lib/adminListCache";
import { useAdminTopBar, TOPBAR_NEW_BUTTON_CLASS } from "@/components/admin/AdminTopBar";
import { LogoutButton } from "@/components/LogoutButton";

function AdminDocumentosContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const tabParam = searchParams.get('tab');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [activeTab, setActiveTab] = useState(tabParam || 'todos');

    // O menu lateral (grupo "Documentos") liga para /admin/documentos?tab=X —
    // mantém o separador sincronizado se o parâmetro mudar.
    useEffect(() => {
        setActiveTab(tabParam || 'todos');
    }, [tabParam]);
    const [articles, setArticles] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [editingArticle, setEditingArticle] = useState<null | any>(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [docToDelete, setDocToDelete] = useState<any>(null);
    const [statusFilter, setStatusFilter] = useState<'active' | 'archived' | 'deleted'>('active');
    const [showEmptyBinConfirm, setShowEmptyBinConfirm] = useState(false);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);

    const tabs = [
        { id: 'todos', label: 'Todos', icon: Layers, types: [] },
        { id: 'relatorios', label: 'Relatórios', icon: FileText, types: ['Relatório', 'Relatórios'] },
        { id: 'legislacao', label: 'Legislação', icon: Scale, types: ['Legislação', 'Políticas Agrárias'] },
        { id: 'outros', label: 'Outros Documentos', icon: Layers, types: ['Documento', 'document', 'PDF', 'Artigo Técnico'] },
    ];

    // Busca sempre todos os tipos (allTypes) para o statusFilter actual — o
    // separador (activeTab) filtra em memória, por isso não faz parte da chave.
    const documentosCacheKey = `documentos:${statusFilter}`;

    const fetchArticles = async (showLoading = true) => {
        if (showLoading) setLoading(true);
        const allTypes = tabs.flatMap((t: any) => t.types);

        try {
            let query = supabase
                .from('articles')
                .select('*')
                .in('type', allTypes)
                .order('created_at', { ascending: false });

            if (statusFilter === 'active') query = query.eq('status', 'active');
            else if (statusFilter === 'archived') query = query.eq('status', 'archived');
            else if (statusFilter === 'deleted') query = query.eq('status', 'deleted');

            const { data, error } = await query;

            if (error) {
                // Fallback if status column is missing
                if (error.code === '42703') {
                    console.warn("Column 'status' missing, falling back to soft-delete check");
                    let fallbackQuery = supabase
                        .from('articles')
                        .select('*')
                        .in('type', allTypes)
                        .order('created_at', { ascending: false });

                    if (statusFilter === 'deleted') fallbackQuery = fallbackQuery.not('deleted_at', 'is', null);
                    else if (statusFilter === 'active') fallbackQuery = fallbackQuery.is('deleted_at', null);
                    else {
                        // Archived mode - if column missing, we can't have archived items
                        setArticles([]);
                        return;
                    }
                    const { data: fbData, error: fbError } = await fallbackQuery;
                    if (fbError) throw fbError;
                    setArticles(fbData || []);
                    setCachedList(documentosCacheKey, fbData || []);
                } else {
                    throw error;
                }
            } else {
                setArticles(data || []);
                setCachedList(documentosCacheKey, data || []);
            }
        } catch (error) {
            console.error(error);
            toast.error("Erro ao carregar documentos");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const cached = getCachedList<any[]>(documentosCacheKey);
        if (cached) setArticles(cached);
        fetchArticles(!cached);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [statusFilter]);

    const confirmDelete = async () => {
        if (!docToDelete) return;

        try {
            if (statusFilter === 'deleted') {
                // Hard Delete
                const { error } = await supabase.from('articles').delete().eq('id', docToDelete.id);
                if (error) throw error;
                toast.success("Documento eliminado permanentemente!");
            } else {
                // Move to Recycle Bin
                const { error } = await supabase.from('articles').update({ status: 'deleted', deleted_at: new Date().toISOString() }).eq('id', docToDelete.id);
                if (error && error.code === '42703') {
                    // Fallback to purely deleted_at
                    const { error: fbError } = await supabase.from('articles').update({ deleted_at: new Date().toISOString() }).eq('id', docToDelete.id);
                    if (fbError) throw fbError;
                } else if (error) throw error;
                toast.success("Documento movido para a lixeira!");
            }
            fetchArticles();
        } catch (error: any) {
            console.error(error);
            toast.error("Erro ao eliminar documento");
        } finally {
            setShowDeleteConfirm(false);
            setDocToDelete(null);
        }
    };

    const handleArchive = async (doc: any) => {
        const newStatus = statusFilter === 'active' ? 'archived' : 'active';
        try {
            const { error } = await supabase.from('articles').update({ status: newStatus }).eq('id', doc.id);
            if (error) {
                if (error.code === '42703') {
                    toast.error("Funcionalidade de Arquivo requer actualização da base de dados.");
                } else {
                    throw error;
                }
                return;
            }
            toast.success(newStatus === 'archived' ? "Documento arquivado" : "Documento restaurado");
            fetchArticles();
        } catch (error) {
            console.error(error);
            toast.error("Erro ao alterar estado do documento");
        }
    };

    const handleRestoreAll = async () => {
        const allTypes = tabs.flatMap((t: any) => t.types);
        const targetStatus = statusFilter === 'archived' ? 'archived' : 'deleted';
        try {
            let query = supabase.from('articles').update({ status: 'active', deleted_at: null }).in('type', allTypes);
            if (statusFilter === 'archived') query = query.eq('status', 'archived');
            else query = query.eq('status', 'deleted');

            const { error } = await query;
            if (error) throw error;
            toast.success("Todos os itens foram restaurados");
            fetchArticles();
        } catch (error) {
            console.error(error);
            toast.error("Erro ao restaurar todos");
        }
    };

    const handleRestore = async (article: any) => {
        try {
            const { error } = await supabase
                .from('articles')
                .update({ deleted_at: null })
                .eq('id', article.id);

            if (error) throw error;
            toast.success("Documento restaurado com sucesso!");
            await fetchArticles();
        } catch (error: any) {
            toast.error("Erro ao restaurar documento");
        }
    };

    const handleEmptyBin = async () => {
        try {
            const allTypes = tabs.flatMap((t: any) => t.types);
            const { error } = await supabase
                .from('articles')
                .delete()
                .not('deleted_at', 'is', null)
                .in('type', allTypes);

            if (error) throw error;
            toast.success("Lixeira esvaziada com sucesso!");
            await fetchArticles();
        } catch (error: any) {
            toast.error("Erro ao esvaziar lixeira");
        } finally {
            setShowEmptyBinConfirm(false);
        }
    };

    const confirmBulkDelete = async () => {
        const previousArticles = [...articles];
        try {
            // Optimistic update
            setArticles(prev => prev.filter(a => !selectedIds.includes(a.id)));

            const { error } = await supabase
                .from('articles')
                .delete()
                .in('id', selectedIds);

            if (error) throw error;

            toast.success(`${selectedIds.length} documentos eliminados!`);
            setSelectedIds([]);
        } catch (error: any) {
            setArticles(previousArticles);
            toast.error("Erro na eliminação em massa: " + error.message);
        } finally {
            setShowBulkDeleteConfirm(false);
        }
    };

    const handleDelete = (article: any) => {
        setDocToDelete(article);
        setShowDeleteConfirm(true);
    };

    const handleEdit = (article: any) => {
        router.push(`/admin/documentos/${article.id}`);
    };


    const filteredArticles = articles.filter((a: any) => {
        const matchesSearch = a.title.toLowerCase().includes(search.toLowerCase());

        if (activeTab === 'todos') return matchesSearch;

        const activeTabObj = tabs.find((t: any) => t.id === activeTab);
        const matchesType = activeTabObj ? activeTabObj.types.includes(a.type) : false;
        return matchesSearch && matchesType;
    });

    const columns = [
        {
            header: "Documento",
            key: "title",
            render: (val: string, row: any) => (
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-slate-100 overflow-hidden flex-shrink-0 border border-slate-200 flex items-center justify-center">
                        {row.image_url ? (
                            <img src={row.image_url} className="w-full h-full object-cover" alt={val} />
                        ) : (
                            <FileText className="w-4 h-4 text-slate-300" />
                        )}
                    </div>
                    <div className="flex flex-col min-w-0">
                        <span className="font-bold text-slate-800 line-clamp-1 text-sm">{val}</span>
                        {row.subtitle && (
                            <span className="text-[10px] text-slate-500 line-clamp-1">{row.subtitle}</span>
                        )}
                        {row.source && (
                            <span className="text-[9px] font-black text-emerald-600 uppercase tracking-wider mt-0.5">{row.source}</span>
                        )}
                    </div>
                </div>
            )
        },
        {
            header: "Tipo",
            key: "type",
            render: (val: string) => (
                <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded text-[10px] font-black uppercase tracking-wider">
                    {val}
                </span>
            )
        },
        {
            header: "Data",
            key: "date",
            render: (val: string, row: any) => (
                <span className="text-slate-500 font-medium text-xs">
                    {new Date(val || row.created_at).toLocaleDateString()}
                </span>
            )
        }
    ];

    useAdminTopBar("");

    return (
        <div className="space-y-8">
            {/* Header & Controls */}
            <AdminListToolbar>
                <div>
                    <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">Documentos</h1>
                </div>

                <div className="flex flex-col md:flex-row items-center gap-3">
                    <select
                        value={activeTab}
                        onChange={(e) => {
                            setActiveTab(e.target.value);
                            setStatusFilter('active');
                            if (viewMode === 'list') setViewMode('list');
                        }}
                        className="bg-white border border-slate-200 text-slate-600 text-xs font-bold uppercase tracking-wide rounded-lg px-4 py-2 outline-none focus:border-emerald-500 h-10 w-full md:w-40"
                    >
                        {tabs.map(tab => (
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

                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={() => router.push('/admin/documentos/novo')}
                        className={TOPBAR_NEW_BUTTON_CLASS}
                    >
                        <Plus className="w-4 h-4" />
                        Novo Documento
                    </button>
                    <LogoutButton
                        variant="outline"
                        className="h-9 px-4 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-red-600 border-slate-200"
                        showIcon
                        label="Sair"
                    />
                </div>
            </AdminListToolbar>

            {/* Content */}
            <>
                {loading ? (
                    <div className="flex justify-center py-20">
                        <Spinner className="h-8 w-8" />
                    </div>
                ) : filteredArticles.length === 0 ? (
                    <div className="text-center py-20 bg-slate-50/50 rounded-2xl border-2 border-dashed border-slate-100">
                        <div className="mb-4 flex justify-center">
                            <div className="w-16 h-16 bg-white rounded-full shadow-sm flex items-center justify-center">
                                <FileText className="w-8 h-8 text-slate-200" />
                            </div>
                        </div>
                        <h3 className="font-bold text-slate-900 mb-1">
                            {statusFilter === 'deleted' ? "Lixeira vazia" : statusFilter === 'archived' ? "Arquivo vazio" : "Nenhum documento encontrado"}
                        </h3>
                        <p className="text-sm text-slate-400 italic max-w-xs mx-auto">
                            {statusFilter === 'deleted' ? "Não há itens na lixeira." : statusFilter === 'archived' ? "Não há documentos arquivados." : "Comece adicionando um novo documento ou altere os filtros."}
                        </p>
                    </div>
                ) : viewMode === 'grid' ? (
                    // GRID VIEW (Now Stacked for Documents)
                    <div className="flex flex-col gap-4">
                        {filteredArticles.map((article) => (
                            <DocumentCard
                                key={article.id}
                                title={article.title}
                                subtitle={article.subtitle}
                                category={article.type}
                                date={article.date || article.created_at}
                                source={article.source}
                                sourceUrl={article.source_url}
                                slug={article.slug}
                                isDeleted={statusFilter === 'deleted'}
                                onRestore={() => handleRestore(article)}
                                onArchive={() => handleArchive(article)}
                                onEdit={() => handleEdit(article)}
                                onDelete={() => handleDelete(article)}
                            />
                        ))}
                        {/* Add New Card (Only in Active Mode) */}
                        {statusFilter === 'active' && (
                            <button
                                onClick={() => router.push('/admin/documentos/novo')}
                                className="bg-slate-50 rounded-xl border-2 border-dashed border-slate-200 flex flex-row items-center justify-center p-6 gap-3 hover:border-emerald-500 hover:bg-emerald-50/50 transition-all group"
                            >
                                <div className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <Plus className="w-4 h-4 text-emerald-500" />
                                </div>
                                <span className="font-bold text-slate-400 group-hover:text-emerald-600">Adicionar Novo Documento</span>
                            </button>
                        )}
                    </div>
                ) : (
                    // LIST VIEW
                    <AdminDataTable
                        title={statusFilter === 'deleted' ? "Reciclagem de Documentos" : statusFilter === 'archived' ? "Arquivo de Documentos" : (tabs.find((t: any) => t.id === activeTab)?.label || "Documentos")}
                        columns={columns}
                        data={filteredArticles}
                        loading={loading}
                        hideSearch={true}
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
                                    title={statusFilter === 'archived' ? 'Restaurar' : 'Arquivar'}
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
                    key={statusFilter === 'deleted' ? 'perm' : 'soft'}
                    isOpen={showDeleteConfirm}
                    onClose={() => setShowDeleteConfirm(false)}
                    onConfirm={confirmDelete}
                    title={statusFilter === 'deleted' ? "Eliminar Permanentemente" : "Mover para Lixeira"}
                    description={
                        statusFilter === 'deleted'
                            ? `Tem a certeza que deseja eliminar PERMANENTEMENTE o documento "${docToDelete?.title}"? Esta acção NÃO pode ser desfeita.`
                            : `O documento "${docToDelete?.title}" será movido para a lixeira. Poderá restaurá-lo mais tarde.`
                    }
                    confirmLabel={statusFilter === 'deleted' ? "Eliminar de vez" : "Mover para Lixeira"}
                    variant="destructive"
                />

                <ConfirmationModal
                    isOpen={showEmptyBinConfirm}
                    onClose={() => setShowEmptyBinConfirm(false)}
                    onConfirm={handleEmptyBin}
                    title="Esvaziar Lixeira"
                    description="Tem a certeza que deseja eliminar PERMANENTEMENTE todos os documentos na lixeira? Esta acção NÃO pode ser desfeita."
                    confirmLabel="Esvaziar Lixeira"
                    variant="destructive"
                />

                <ConfirmationModal
                    isOpen={showBulkDeleteConfirm}
                    onClose={() => setShowBulkDeleteConfirm(false)}
                    onConfirm={confirmBulkDelete}
                    title={statusFilter === 'deleted' ? "Eliminar Itens" : "Mover para Lixeira"}
                    description={`Tem a certeza que deseja ${statusFilter === 'deleted' ? 'eliminar permanentemente' : 'mover para a lixeira'} os ${selectedIds.length} itens seleccionados?`}
                    confirmLabel={statusFilter === 'deleted' ? "Eliminar tudo" : "Reciclar seleccionados"}
                    variant="destructive"
                />
            </>
        </div >
    );
}

export default function AdminDocumentosPage() {
    return (
        <Suspense fallback={<div className="flex justify-center py-20"><Spinner className="h-8 w-8" /></div>}>
            <AdminDocumentosContent />
        </Suspense>
    );
}
