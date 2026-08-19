"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { AdminDataTable } from "@/components/admin/AdminDataTable";
import { Button } from "@/components/ui/button";
import { Plus, Presentation, Pencil, Trash2, Play, Search, LayoutGrid, List, Archive, ArrowRight, Calendar } from "lucide-react";
import { useAdminTopBar, TOPBAR_NEW_BUTTON_CLASS } from "@/components/admin/AdminTopBar";
import { LogoutButton } from "@/components/LogoutButton";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { ConfirmationModal } from "@/components/ui/ConfirmationModal";
import { useRouter } from "next/navigation";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

export default function AdminApresentacoesPage() {
    const router = useRouter();
    const supabase = createClient();
    const [presentations, setPresentations] = useState<any[]>([]);
    const [deletedPresentations, setDeletedPresentations] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<any>(null);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [statusFilter, setStatusFilter] = useState<'active' | 'archived' | 'deleted'>('active');
    const [categoryFilter, setCategoryFilter] = useState("all");
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);

    // Load both active and deleted presentations
    useEffect(() => {
        let isMounted = true;
        const load = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (isMounted && user) setCurrentUserId(user.id);

            // Load active + deleted presentations via admin route (RLS blocks direct client reads)
            const response = await fetch('/api/admin/list-presentations');
            const result = await response.json();

            if (isMounted) {
                if (!response.ok) {
                    toast.error(result.error || "Erro ao carregar apresentações");
                } else {
                    const normalized = (result.presentations || []).map((item: any) => ({
                        ...item,
                        status: item.status || 'active'
                    }));
                    setPresentations(normalized);
                    setDeletedPresentations(result.deletedPresentations || []);
                }
                setLoading(false);
            }
        };
        load();
        return () => { isMounted = false; };
    }, [supabase]);

    // Archive persistently
    const handleArchive = async (item: any) => {
        const isCurrentlyArchived = item.status === 'archived';
        const newStatus = isCurrentlyArchived ? 'active' : 'archived';

        try {
            const { error } = await supabase
                .from('presentations')
                .update({ status: newStatus })
                .eq('id', item.id);

            if (error) throw error;

            setPresentations(prev => prev.map(p =>
                p.id === item.id ? { ...p, status: newStatus } : p
            ));
            toast.success(isCurrentlyArchived ? "Apresentação restaurada" : "Apresentação arquivada");
        } catch (err: any) {
            toast.error("Erro ao arquivar/restaurar: " + err.message);
        }
    };

    // Move to trash (recycle bin)
    const handleMoveToTrash = (item: any) => {
        setItemToDelete(item);
        setShowDeleteConfirm(true);
    };

    // Restore from recycle bin
    const handleRestoreFromTrash = async (item: any) => {
        try {
            // Re-insert into presentations table
            const { error: insertError } = await supabase
                .from('presentations')
                .insert({
                    id: item.id,
                    title: item.title,
                    description: item.description,
                    slides: item.slides,
                    user_id: item.user_id,
                    created_at: item.original_created_at || item.created_at,
                    updated_at: new Date().toISOString()
                });

            if (insertError) {
                toast.error("Erro ao restaurar: " + insertError.message);
                return;
            }

            // Remove from deleted_presentations
            const { error: deleteError } = await supabase
                .from('deleted_presentations')
                .delete()
                .eq('id', item.id);

            if (deleteError) {
                toast.error("Erro ao limpar reciclagem: " + deleteError.message);
                return;
            }

            // Update state
            setDeletedPresentations(prev => prev.filter(p => p.id !== item.id));
            setPresentations(prev => [...prev, { ...item, status: 'active', created_at: item.original_created_at }]);
            toast.success("Apresentação restaurada!");
        } catch (err: any) {
            toast.error("Erro: " + err.message);
        }
    };

    // Confirm delete (move to trash or permanent delete)
    const handleDelete = async () => {
        if (!itemToDelete) return;

        const isInTrash = statusFilter === 'deleted';

        if (isInTrash) {
            // Permanent delete from recycle bin
            const { error } = await supabase
                .from('deleted_presentations')
                .delete()
                .eq('id', itemToDelete.id);

            if (error) {
                toast.error("Erro ao eliminar permanentemente: " + error.message);
            } else {
                toast.success("Eliminado permanentemente!");
                setDeletedPresentations(prev => prev.filter(p => p.id !== itemToDelete.id));
            }
        } else {
            // Move to recycle bin
            try {
                // Insert into deleted_presentations
                const { error: insertError } = await supabase
                    .from('deleted_presentations')
                    .insert({
                        id: itemToDelete.id,
                        title: itemToDelete.title,
                        description: itemToDelete.description,
                        slides: itemToDelete.slides,
                        user_id: itemToDelete.user_id,
                        original_created_at: itemToDelete.created_at,
                        deleted_at: new Date().toISOString()
                    });

                if (insertError) {
                    // If table doesn't exist, do permanent delete
                    if (insertError.message.includes('does not exist')) {
                        const { error: delError } = await supabase
                            .from('presentations')
                            .delete()
                            .eq('id', itemToDelete.id);

                        if (delError) {
                            toast.error("Erro ao eliminar: " + delError.message);
                        } else {
                            toast.success("Apresentação eliminada! (reciclagem não disponível)");
                            setPresentations(prev => prev.filter(p => p.id !== itemToDelete.id));
                        }
                    } else {
                        toast.error("Erro ao mover para reciclagem: " + insertError.message);
                    }
                } else {
                    // Now delete from presentations
                    const { error: deleteError } = await supabase
                        .from('presentations')
                        .delete()
                        .eq('id', itemToDelete.id);

                    if (deleteError) {
                        toast.error("Erro ao remover: " + deleteError.message);
                    } else {
                        toast.success("Enviado para a reciclagem!");
                        setPresentations(prev => prev.filter(p => p.id !== itemToDelete.id));
                        setDeletedPresentations(prev => [{ ...itemToDelete, deleted_at: new Date().toISOString() }, ...prev]);
                    }
                }
            } catch (err: any) {
                toast.error("Erro: " + err.message);
            }
        }
        setShowDeleteConfirm(false);
        setItemToDelete(null);
    };

    // Get items to display based on filter
    const getDisplayItems = () => {
        let items = statusFilter === 'deleted' ? deletedPresentations : presentations;

        // Apply Search
        items = items.filter(p =>
            p.title.toLowerCase().includes(search.toLowerCase()) ||
            p.description?.toLowerCase().includes(search.toLowerCase())
        );

        // Apply Status Filter (Active/Archived) - only for non-deleted
        if (statusFilter !== 'deleted') {
            items = items.filter(p =>
                statusFilter === 'active'
                    ? (p.status === 'active' || p.status === 'draft' || !p.status)
                    : p.status === 'archived'
            );
        }

        // Apply User Filter (Todas vs Minhas)
        // Todas: Show ALL presentations (no filter)
        // Minhas: Only current user (admin)
        if (currentUserId && categoryFilter === 'mine') {
            items = items.filter(p => p.user_id === currentUserId);
        }

        return items;
    };

    const filtered = getDisplayItems();

    useAdminTopBar("");

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">Apresentações</h1>
                </div>

                <div className="flex items-center flex-wrap gap-2">
                    {/* Category Filter */}
                    <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                        <SelectTrigger className="w-[160px] h-10 bg-white border-slate-200 text-xs font-bold uppercase tracking-wider">
                            <SelectValue placeholder="Todas" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todas</SelectItem>
                            <SelectItem value="mine">Minhas</SelectItem>
                        </SelectContent>
                    </Select>

                    {/* Search Input */}
                    <div className="relative w-72">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                        <Input
                            placeholder="Buscar..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-9 h-10 bg-white border-slate-200 text-sm"
                        />
                    </div>

                    {/* Status Toggles */}
                    <div className="flex items-center bg-white p-1 rounded-lg border border-slate-200 shadow-sm gap-1">
                        <button
                            onClick={() => setStatusFilter(statusFilter === 'archived' ? 'active' : 'archived')}
                            className={`p-2 rounded-md transition-all ${statusFilter === 'archived' ? 'bg-amber-100 text-amber-700' : 'text-slate-400 hover:text-slate-600'}`}
                            title="Arquivados"
                        >
                            <Archive className="w-4 h-4" />
                        </button>

                        <button
                            onClick={() => setStatusFilter(statusFilter === 'deleted' ? 'active' : 'deleted')}
                            className={`p-2 rounded-md transition-all ${statusFilter === 'deleted' ? 'bg-rose-100 text-rose-700' : 'text-slate-400 hover:text-slate-600'}`}
                            title="Reciclagem"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>

                    {/* View Toggles */}
                    <div className="flex items-center bg-white p-1 rounded-lg border border-slate-200 shadow-sm">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`p-2 rounded-md transition-all ${viewMode === 'grid' ? 'bg-slate-100 text-emerald-600' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            <LayoutGrid className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`p-2 rounded-md transition-all ${viewMode === 'list' ? 'bg-slate-100 text-emerald-600' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            <List className="w-4 h-4" />
                        </button>
                    </div>

                    <button
                        type="button"
                        onClick={() => router.push('/admin/apresentacoes/novo')}
                        className={TOPBAR_NEW_BUTTON_CLASS}
                    >
                        <Plus className="w-4 h-4" />
                        Novo
                    </button>
                    <LogoutButton
                        variant="outline"
                        className="h-9 px-4 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-red-600 border-slate-200"
                        showIcon
                        label="Sair"
                    />
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center py-20">
                    <Spinner className="w-8 h-8 animate-spin text-emerald-600" />
                </div>
            ) : filtered.length === 0 ? (
                <div className="bg-white rounded-3xl border-2 border-dashed border-slate-200 p-20 text-center flex flex-col items-center gap-4">
                    <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center">
                        <Presentation className="w-10 h-10 text-slate-300" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-slate-900">
                            {statusFilter === 'deleted' ? "A reciclagem está vazia" : statusFilter === 'archived' ? "Nenhuma apresentação arquivada" : "Nenhuma apresentação encontrada"}
                        </h3>
                        <p className="text-slate-500 max-w-xs mx-auto mt-1">
                            {statusFilter === 'active' && "Comece por criar a sua primeira apresentação profissional para o site."}
                        </p>
                    </div>
                </div>
            ) : viewMode === 'list' ? (
                /* LIST VIEW */
                <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-100">
                        <h2 className="text-sm font-bold text-slate-700">
                            {statusFilter === 'deleted' ? "Reciclagem" : statusFilter === 'archived' ? "Apresentações Arquivadas" : "Lista de Apresentações"}
                            <span className="text-slate-400 font-normal ml-2">({filtered.length})</span>
                        </h2>
                    </div>
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-slate-100 text-left">
                                <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">Título</th>
                                <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">Slides</th>
                                <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">Data</th>
                                <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 text-right">Acções</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((item) => {
                                const slideCount = item.slides?.length || 0;
                                const createdDate = new Date(item.created_at).toLocaleDateString('pt-PT', { day: '2-digit', month: '2-digit', year: 'numeric' });

                                return (
                                    <tr key={item.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <span className="font-bold text-slate-800">{item.title}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="bg-emerald-50 text-emerald-700 text-xs font-bold px-2 py-1 rounded-full">{slideCount}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-slate-400 text-sm">{createdDate}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-end gap-1">
                                                {/* Play */}
                                                <button
                                                    onClick={() => router.push(`/apresentacao/${item.slug || item.id}`)}
                                                    className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-all"
                                                    title="Reproduzir"
                                                >
                                                    <Play className="w-4 h-4 fill-current" />
                                                </button>
                                                {/* Edit */}
                                                <button
                                                    onClick={() => router.push(`/admin/apresentacoes/editor/${item.id}`)}
                                                    className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all"
                                                    title="Editar"
                                                >
                                                    <Pencil className="w-4 h-4" />
                                                </button>
                                                {statusFilter === 'deleted' ? (
                                                    /* Restore from trash */
                                                    <button
                                                        onClick={() => handleRestoreFromTrash(item)}
                                                        className="w-8 h-8 rounded-lg flex items-center justify-center text-emerald-500 hover:text-emerald-700 hover:bg-emerald-50 transition-all"
                                                        title="Restaurar"
                                                    >
                                                        <Archive className="w-4 h-4" />
                                                    </button>
                                                ) : (
                                                    /* Archive */
                                                    <button
                                                        onClick={() => handleArchive(item)}
                                                        className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${item.status === 'archived' ? 'text-amber-500 hover:bg-amber-50' : 'text-slate-400 hover:text-amber-500 hover:bg-amber-50'}`}
                                                        title={item.status === 'archived' ? "Restaurar" : "Arquivar"}
                                                    >
                                                        <Archive className="w-4 h-4" />
                                                    </button>
                                                )}
                                                {/* Delete */}
                                                <button
                                                    onClick={() => handleMoveToTrash(item)}
                                                    className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-all"
                                                    title={statusFilter === 'deleted' ? "Eliminar permanentemente" : "Mover para reciclagem"}
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            ) : (
                /* GRID VIEW */
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 3xl:grid-cols-5 4xl:grid-cols-6 gap-6">
                    {filtered.map((item) => {
                        const slideCount = item.slides?.length || 0;
                        const firstSlideImage = item.slides?.[0]?.image_url;
                        const createdDate = new Date(item.created_at).toLocaleDateString('pt-PT', { day: '2-digit', month: '2-digit', year: 'numeric' });

                        return (
                            <div
                                key={item.id}
                                className="group relative rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300"
                                style={{ aspectRatio: '16/10' }}
                            >
                                {/* Background - Image or Dark Gradient */}
                                <div className="absolute inset-0">
                                    {firstSlideImage ? (
                                        <img
                                            src={firstSlideImage}
                                            alt={item.title}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950" />
                                    )}
                                    {/* Overlay for readability */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                                </div>

                                {/* Content */}
                                <div className="relative h-full flex flex-col justify-between p-5 overflow-hidden">
                                    {/* Top Row - Badge & Actions */}
                                    <div className="flex items-start justify-between">
                                        <span className="bg-emerald-500 text-white text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-wider">
                                            {slideCount} Slides
                                        </span>
                                        {/* Action buttons - slide in from right on hover */}
                                        <div className="flex items-center gap-1 translate-x-20 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300">
                                            {statusFilter === 'deleted' ? (
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleRestoreFromTrash(item); }}
                                                    className="w-9 h-9 rounded-full border-2 border-emerald-400/50 flex items-center justify-center text-emerald-400 hover:border-emerald-400 hover:bg-emerald-400/10 transition-all"
                                                    title="Restaurar"
                                                >
                                                    <Archive className="w-4 h-4" />
                                                </button>
                                            ) : (
                                                <>
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); handleArchive(item); }}
                                                        className={`w-9 h-9 rounded-full border-2 flex items-center justify-center transition-all ${item.status === 'archived' ? 'border-amber-400/50 text-amber-400 hover:border-amber-400' : 'border-white/40 text-white/80 hover:border-amber-400 hover:text-amber-400'}`}
                                                        title={item.status === 'archived' ? "Restaurar" : "Arquivar"}
                                                    >
                                                        <Archive className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); handleMoveToTrash(item); }}
                                                        className="w-9 h-9 rounded-full border-2 border-white/40 flex items-center justify-center text-white/80 hover:border-rose-400 hover:text-rose-400 transition-all"
                                                        title="Mover para reciclagem"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </>
                                            )}
                                            <button
                                                onClick={() => router.push(`/apresentacao/${item.slug || item.id}`)}
                                                className="w-9 h-9 rounded-full border-2 border-white/40 flex items-center justify-center text-white/80 hover:border-white hover:text-white transition-all"
                                                title="Reproduzir"
                                            >
                                                <Play className="w-4 h-4 fill-current ml-0.5" />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Bottom Content */}
                                    <div className="space-y-3">
                                        <div>
                                            <h3 className="text-xl font-bold text-white leading-tight mb-1 transition-colors duration-200 group-hover:text-emerald-400">
                                                {item.title}
                                            </h3>
                                            <p className="text-white/70 text-sm line-clamp-2">
                                                {item.description || "Sem descrição disponível."}
                                            </p>
                                        </div>

                                        {/* Bottom Row - Button & Date */}
                                        <div className="flex items-center justify-between pt-2">
                                            <Button
                                                variant="outline"
                                                onClick={() => router.push(`/admin/apresentacoes/editor/${item.id}`)}
                                                className="bg-transparent border-white/30 text-white text-[10px] font-bold uppercase tracking-widest h-9 px-4 rounded-full hover:bg-white/10 hover:border-white/50 gap-2"
                                            >
                                                Abrir Projecto
                                                <ArrowRight className="w-3 h-3" />
                                            </Button>
                                            <div className="flex items-center gap-1.5 text-white/50 text-xs">
                                                <Calendar className="w-3.5 h-3.5" />
                                                {createdDate}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            <ConfirmationModal
                isOpen={showDeleteConfirm}
                onClose={() => setShowDeleteConfirm(false)}
                onConfirm={handleDelete}
                title="Eliminar Apresentação"
                description={`Tem a certeza que deseja eliminar "${itemToDelete?.title}"? Esta acção não pode ser desfeita.`}
                confirmLabel="Eliminar Agora"
                variant="destructive"
            />
        </div>
    );
}

function Loader2({ className }: { className?: string }) {
    return <RefreshCw className={className + " animate-spin"} />;
}

import { RefreshCw } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
