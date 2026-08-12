"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { AdminDataTable } from "@/components/admin/AdminDataTable";
import { BadgeCheck, BadgeAlert, LayoutGrid, List, Trash2, RotateCcw, FileText, Trash, Archive, MoreVertical } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { UndoRedoPanel } from "@/components/admin/UndoRedoPanel";
import { toast } from "sonner";
import { ConfirmationModal } from "@/components/ui/ConfirmationModal";
import { NewsCard } from "@/components/NewsCard";
import { Button } from "@/components/ui/button";
import { useUndoRedo } from "@/hooks/useUndoRedo";

import { useRouter } from "next/navigation";

export default function AdminArticlesPage() {
    const router = useRouter();
    const supabase = createClient();
    const [articles, setArticles] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
    const [editingItem, setEditingItem] = useState<any>(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<any>(null);
    const [statusFilter, setStatusFilter] = useState("active"); // active, archived, deleted
    const [showEmptyBinConfirm, setShowEmptyBinConfirm] = useState(false);
    const [activeAdminTab, setActiveAdminTab] = useState("noticias");
    const { addAction, undo, redo, canUndo, canRedo } = useUndoRedo();

    async function fetchArticles() {
        setLoading(true);

        let query = supabase
            .from('articles')
            .select('*')
            .order('created_at', { ascending: false });

        if (statusFilter === 'active') {
            query = query.is('deleted_at', null).or('status.eq.active,status.is.null');
        } else if (statusFilter === 'archived') {
            query = query.is('deleted_at', null).eq('status', 'inactive');
        } else if (statusFilter === 'deleted') {
            query = query.not('deleted_at', 'is', null);
        }

        // ... query modifiers ...
        const { data, error } = await query;

        if (error) {
            if (error.code === '42703') { // Column does not exist
                let fallbackQuery = supabase
                    .from('articles')
                    .select('*')
                    .order('created_at', { ascending: false });

                // Filter based on active admin tab
                if (activeAdminTab === "noticias") {
                    fallbackQuery = fallbackQuery.not('type', 'in', ['Artigo Técnico', 'Estudo', 'Pesquisa', 'Relatório', 'PDF', 'Documento', 'document', 'Artigo Científico']);
                } else {
                    fallbackQuery = fallbackQuery.in('type', ['Artigo Técnico', 'Estudo', 'Pesquisa', 'Relatório', 'PDF', 'Documento', 'document', 'Artigo Científico']);
                }

                if (statusFilter === 'deleted') {
                    fallbackQuery = fallbackQuery.not('deleted_at', 'is', null);
                } else if (statusFilter === 'active') {
                    fallbackQuery = fallbackQuery.is('deleted_at', null);
                } else {
                    // Archived mode - if column missing, we can't have archived items
                    setArticles([]);
                    setLoading(false);
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



        if (error) console.error(error);
        else setArticles(data || []);
        setLoading(false);
    }

    useEffect(() => {
        fetchArticles();
    }, [statusFilter, activeAdminTab]);

    const confirmDelete = async () => {
        if (!itemToDelete) return;


        try {
            if (statusFilter === 'deleted') {
                // Hard Delete (Permanent) for items already in Bin

                const { error: hardDeleteError, count: hardDeleteCount } = await supabase
                    .from('articles')
                    .delete({ count: 'exact' })
                    .eq('id', itemToDelete.id);


                if (hardDeleteError) throw hardDeleteError;
                if (hardDeleteCount === 0) throw new Error("Permissão negada ou item não encontrado.");

                // Add to undo history
                addAction({
                    type: 'delete',
                    tableName: 'articles',
                    data: itemToDelete,
                    description: `Eliminado permanentemente: ${itemToDelete.title}`
                });

                toast.success("Artigo eliminado permanentemente!");
            } else {
                // Soft Delete (Move to Bin) for active items

                const deleteTime = new Date().toISOString();

                const { error: softDeleteError, count: softDeleteCount } = await supabase
                    .from('articles')
                    .update({
                        deleted_at: deleteTime,
                        status: 'deleted'
                    }, { count: 'exact' })
                    .eq('id', itemToDelete.id);

                if (softDeleteError) {
                    if (softDeleteError.code === '42703') {
                        const { error: fallbackError, count: fallbackCount } = await supabase
                            .from('articles')
                            .update({ deleted_at: deleteTime }, { count: 'exact' })
                            .eq('id', itemToDelete.id);
                        if (fallbackError) throw fallbackError;
                    } else {
                        throw softDeleteError;
                    }
                }

                // Add to undo history
                addAction({
                    type: 'delete',
                    tableName: 'articles',
                    data: { ...itemToDelete, deleted_at: null },
                    description: `Movido para lixeira: ${itemToDelete.title}`
                });

                toast.success("Artigo movido para a lixeira!");
            }

            await fetchArticles();
        } catch (error: any) {
            console.error("Delete failed:", error);
            toast.error(error.message || "Erro ao eliminar artigo");
        } finally {
            setShowDeleteConfirm(false);
            setItemToDelete(null);
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

            // Add to undo history
            addAction({
                type: 'restore',
                tableName: 'articles',
                data: article,
                description: `Restaurado: ${article.title}`
            });

            toast.success("Artigo restaurado com sucesso!");
            await fetchArticles();
        } catch (error: any) {
            toast.error(error.message || "Erro ao restaurar artigo");
            console.error("Restore failed:", error);
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
            });

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
                .not('deleted_at', 'is', null);

            if (error) throw error;

            toast.success(`Lixeira esvaziada! ${count} artigo(s) eliminado(s) permanentemente.`);
            await fetchArticles();
        } catch (error: any) {
            toast.error(error.message || "Erro ao esvaziar lixeira");
            console.error("Empty bin failed:", error);
        }
    };

    const handleDelete = (row: any) => {
        setItemToDelete(row);
        setShowDeleteConfirm(true);
    };

    const handleUndo = async (action: any) => {
        try {
            if (action.type === 'delete') {
                // Restore the deleted item
                const { error } = await supabase
                    .from('articles')
                    .insert([action.data]);

                if (error) throw error;
            } else if (action.type === 'restore') {
                // Move back to bin
                const { error } = await supabase
                    .from('articles')
                    .update({ deleted_at: action.data.deleted_at })
                    .eq('id', action.data.id);

                if (error) throw error;
            }

            await fetchArticles();
        } catch (error) {
            console.error("Undo operation failed:", error);
            throw error;
        }
    };

    const handleRedo = async (action: any) => {
        try {
            if (action.type === 'delete') {
                // Delete again
                if (action.data.deleted_at === null) {
                    // Soft delete
                    await supabase
                        .from('articles')
                        .update({ deleted_at: new Date().toISOString() })
                        .eq('id', action.data.id);
                } else {
                    // Hard delete
                    await supabase
                        .from('articles')
                        .delete()
                        .eq('id', action.data.id);
                }
            } else if (action.type === 'restore') {
                // Restore again
                await supabase
                    .from('articles')
                    .update({ deleted_at: null })
                    .eq('id', action.data.id);
            }

            await fetchArticles();
        } catch (error) {
            console.error("Redo operation failed:", error);
            throw error;
        }
    };

    const columns = [
        {
            header: "Título / Resumo",
            key: "title",
            render: (val: string, row: any) => (
                <div className="flex items-center gap-4">
                    {row.image_url && (
                        <div className="size-10 rounded-lg overflow-hidden shrink-0 border border-slate-100">
                            <img src={row.image_url} alt={val} className="w-full h-full object-cover" />
                        </div>
                    )}
                    <div>
                        <p className="font-black text-slate-800 line-clamp-1">{val}</p>
                        <p className="text-[10px] text-slate-400 uppercase tracking-widest">{row.type || 'Sem Categoria'}</p>
                    </div>
                </div>
            )
        },
        { header: "Autor", key: "author" },
        {
            header: "Data",
            key: "date",
            render: (val: string) => <span className="text-slate-400">{val}</span>
        },
        {
            header: "Destaque",
            key: "is_featured",
            render: (val: boolean) => val ? (
                <span className="flex items-center gap-1.5 text-emerald-600">
                    <BadgeCheck className="w-4 h-4" />
                    Sim
                </span>
            ) : (
                <span className="flex items-center gap-1.5 text-slate-300">
                    <BadgeAlert className="w-4 h-4" />
                    Não
                </span>
            )
        }
    ];

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Artigos & Notícias</h1>
                    <p className="text-slate-500 font-medium text-sm">Gerencie o conteúdo editorial do blog e da página inicial.</p>
                </div>
            </div>

            {/* Admin Tabs */}
            <div className="flex gap-2 bg-white p-1 rounded-xl border border-slate-200 shadow-sm w-fit">
                <button
                    onClick={() => setActiveAdminTab("noticias")}
                    className={`flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-bold transition-all ${activeAdminTab === "noticias"
                        ? "bg-emerald-600 text-white shadow-lg"
                        : "text-slate-500 hover:bg-slate-50"
                        }`}
                >
                    <List className="w-4 h-4" />
                    Notícias
                </button>
                <button
                    onClick={() => setActiveAdminTab("artigos")}
                    className={`flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-bold transition-all ${activeAdminTab === "artigos"
                        ? "bg-emerald-600 text-white shadow-lg"
                        : "text-slate-500 hover:bg-slate-50"
                        }`}
                >
                    <FileText className="w-4 h-4" />
                    Artigos & Documentos
                </button>
            </div>

            <div className="flex items-center justify-between gap-4 bg-white p-2 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex gap-2">
                    <div className="flex items-center bg-white p-1 rounded-lg border border-slate-200">
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


                </div>

                <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
                    <button
                        onClick={() => setViewMode('grid')}
                        className={`p-2 rounded-md transition-all ${viewMode === 'grid' ? 'bg-white shadow text-emerald-600' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                        <LayoutGrid className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => setViewMode('list')}
                        className={`p-2 rounded-md transition-all ${viewMode === 'list' ? 'bg-white shadow text-emerald-600' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                        <List className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {articles.map((article) => (
                        <NewsCard
                            key={article.id}
                            title={article.title}
                            subtitle={article.subtitle}
                            category={article.type}
                            date={article.date || article.created_at}
                            image={article.image_url}
                            slug={article.slug}
                            isAdmin={true}
                            isDeleted={statusFilter === 'deleted'}
                            isArchived={statusFilter === 'archived'}
                            onArchive={() => handleArchive(article)}
                            onEdit={() => {
                                const route = activeAdminTab === 'noticias' ? '/admin/noticias' : '/admin/artigos';
                                router.push(`${route}/${article.id}`);
                            }}
                            onDelete={() => handleDelete(article)}
                            onRestore={() => handleRestore(article)}
                        />
                    ))}
                    {articles.length === 0 && !loading && (
                        <div className="col-span-full py-20 text-center text-slate-400">
                            Nenhum conteúdo encontrado.
                        </div>
                    )}
                </div>
            ) : (
                <AdminDataTable
                    title={statusFilter === 'deleted' ? "Lixeira de Artigos & Notícias" : statusFilter === 'archived' ? "Arquivo de Artigos & Notícias" : "Artigos Activos"}
                    columns={columns}
                    data={articles}
                    loading={loading}
                    onAdd={statusFilter === 'active' ? () => {
                        const route = activeAdminTab === 'noticias' ? '/admin/noticias' : '/admin/artigos';
                        router.push(`${route}/novo`);
                    } : undefined}
                    onEdit={statusFilter === 'active' ? (row: any) => {
                        const route = activeAdminTab === 'noticias' ? '/admin/noticias' : '/admin/artigos';
                        router.push(`${route}/${row.id}`);
                    } : undefined}
                    onDelete={handleDelete}
                    headerMenu={
                        (statusFilter === 'deleted' || statusFilter === 'archived') && articles.length > 0 ? (
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
                    customActions={(row: any) => {
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
                                title={statusFilter === 'archived' ? "Desarquivar" : "Arquivar"}
                                onClick={(e) => { e.stopPropagation(); handleArchive(row); }}
                                className="size-7 rounded text-slate-400 flex items-center justify-center hover:bg-amber-50 hover:text-amber-600 transition-all font-bold"
                            >
                                <Archive className="w-3.5 h-3.5" />
                            </button>
                        );
                    }}
                    hideHeader={statusFilter === 'active'}
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
                        ? `Tem a certeza que deseja eliminar PERMANENTEMENTE o artigo "${itemToDelete?.title}"? Esta acção NÃO pode ser desfeita.`
                        : `O artigo "${itemToDelete?.title}" será movido para a lixeira. Poderá restaurá-lo mais tarde.`
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
        </div>
    );
}
