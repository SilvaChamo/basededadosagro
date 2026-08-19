"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { AdminDataTable } from "@/components/admin/AdminDataTable";
import { Button } from "@/components/ui/button";
import { MapPin, LayoutGrid, List, Pencil, Trash2, Plus, Ruler, Coins, Archive, RotateCcw, MoreVertical, Layers } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ConfirmationModal } from "@/components/ui/ConfirmationModal";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Spinner } from "@/components/ui/spinner";
import { getCachedList, setCachedList } from "@/lib/adminListCache";
import { useAdminTopBar, TOPBAR_NEW_BUTTON_CLASS } from "@/components/admin/AdminTopBar";
import { LogoutButton } from "@/components/LogoutButton";

export default function AdminPropertiesPage() {
    const supabase = createClient();
    const router = useRouter();
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
    const [filter, setFilter] = useState('Todas');
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState<'active' | 'archived' | 'deleted'>('active');
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [itemToDelete, setItemToDelete] = useState<any>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [showEmptyBinConfirm, setShowEmptyBinConfirm] = useState(false);
    const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);

    const propriedadesCacheKey = `propriedades:${statusFilter}`;

    async function fetchData(showLoading = true) {
        if (showLoading) setLoading(true);
        try {
            let query = supabase
                .from('properties')
                .select('*')
                .order('created_at', { ascending: false });

            if (statusFilter === 'active') {
                query = query.eq('status', 'active');
            } else if (statusFilter === 'archived') {
                query = query.eq('status', 'archived');
            } else if (statusFilter === 'deleted') {
                query = query.eq('status', 'deleted');
            }

            const { data, error } = await query;

            if (error) {
                if (error.code === '42703') {
                    let fallbackQuery = supabase
                        .from('properties')
                        .select('*')
                        .order('created_at', { ascending: false });

                    if (statusFilter === 'deleted') {
                        fallbackQuery = fallbackQuery.not('deleted_at', 'is', null);
                    } else if (statusFilter === 'archived') {
                        setData([]);
                        setLoading(false);
                        return;
                    } else if (statusFilter === 'active') {
                        fallbackQuery = fallbackQuery.is('deleted_at', null);
                    }

                    const { data: fallbackData, error: fallbackError } = await fallbackQuery;
                    if (fallbackError) throw fallbackError;
                    setData(fallbackData || []);
                    setCachedList(propriedadesCacheKey, fallbackData || []);
                } else {
                    throw error;
                }
            } else {
                setData(data || []);
                setCachedList(propriedadesCacheKey, data || []);
            }
        } catch (error: any) {
            console.error(error);
            toast.error("Erro ao carregar propriedades");
        }
        setLoading(false);
    }

    useEffect(() => {
        const cached = getCachedList<any[]>(propriedadesCacheKey);
        if (cached) setData(cached);
        fetchData(!cached);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [statusFilter]);

    const handleDelete = (row: any) => {
        setItemToDelete(row);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!itemToDelete) return;
        try {
            if (statusFilter === 'deleted') {
                const { error } = await supabase.from('properties').delete().eq('id', itemToDelete.id);
                if (error) throw error;
                toast.success("Propriedade eliminada permanentemente");
            } else {
                const { error } = await supabase.from('properties').update({
                    status: 'deleted',
                    deleted_at: new Date().toISOString()
                }).eq('id', itemToDelete.id);

                if (error && error.code === '42703') {
                    await supabase.from('properties').update({ deleted_at: new Date().toISOString() }).eq('id', itemToDelete.id);
                } else if (error) throw error;
                toast.success("Propriedade movida para a lixeira");
            }
            fetchData();
        } catch (error: any) {
            toast.error("Erro ao eliminar: " + error.message);
        } finally {
            setIsDeleteModalOpen(false);
            setItemToDelete(null);
        }
    };

    const handleRestore = async (item: any) => {
        try {
            const { error } = await supabase.from('properties').update({
                status: 'active',
                deleted_at: null
            }).eq('id', item.id);
            if (error && error.code === '42703') {
                await supabase.from('properties').update({ deleted_at: null }).eq('id', item.id);
            } else if (error) throw error;
            toast.success("Propriedade restaurada");
            fetchData();
        } catch (error) {
            toast.error("Erro ao restaurar");
        }
    };

    const handleArchive = async (item: any) => {
        try {
            const newStatus = statusFilter === 'archived' ? 'active' : 'archived';
            const { error } = await supabase.from('properties').update({ status: newStatus }).eq('id', item.id);
            if (error) throw error;
            toast.success(newStatus === 'archived' ? "Propriedade arquivada" : "Propriedade restaurada");
            fetchData();
        } catch (error) {
            toast.error("Erro ao arquivar");
        }
    };

    const handleRestoreAll = async () => {
        try {
            const { error } = await supabase.from('properties').update({ status: 'active', deleted_at: null }).not('deleted_at', 'is', null);
            if (error && error.code === '42703') {
                await supabase.from('properties').update({ deleted_at: null }).not('deleted_at', 'is', null);
            } else if (error) throw error;
            toast.success("Tudo restaurado");
            fetchData();
        } catch (error) {
            toast.error("Erro ao restaurar");
        }
    };

    const handleEmptyBin = async () => {
        try {
            const { error } = await supabase.from('properties').delete().not('deleted_at', 'is', null);
            if (error) throw error;
            toast.success("Lixeira esvaziada");
            fetchData();
        } catch (error) {
            toast.error("Erro ao esvaziar");
        } finally {
            setShowEmptyBinConfirm(false);
        }
    };

    const confirmBulkDelete = async () => {
        try {
            if (statusFilter === 'deleted') {
                await supabase.from('properties').delete().in('id', selectedIds);
            } else {
                await supabase.from('properties').update({ status: 'deleted', deleted_at: new Date().toISOString() }).in('id', selectedIds);
            }
            setSelectedIds([]);
            fetchData();
            toast.success("Acção em massa concluída");
        } catch (error) {
            toast.error("Erro na acção em massa");
        } finally {
            setShowBulkDeleteConfirm(false);
        }
    };

    const propertyColumns = [
        {
            header: "Propriedade",
            key: "image_url",
            render: (val: string, row: any) => (
                <div className="flex items-center gap-3">
                    <div className="size-10 rounded-lg bg-slate-100 overflow-hidden shrink-0 border border-slate-200">
                        {val ? (
                            <img src={val} alt="" className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center">
                                <MapPin className="w-4 h-4 text-slate-300" />
                            </div>
                        )}
                    </div>
                    <span className="font-black text-slate-800 line-clamp-1">{row.name || row.title}</span>
                </div>
            )
        },
        {
            header: "Tipo",
            key: "type",
            render: (val: string) => <span className="text-slate-500 font-medium">{val || '-'}</span>
        },
        {
            header: "Localização",
            key: "location",
            render: (val: string) => val ? <span className="flex items-center gap-1 text-slate-400 text-xs"><MapPin className="w-3 h-3" />{val}</span> : <span className="text-slate-300">-</span>
        },
        {
            header: "Tamanho",
            key: "size",
            render: (val: string) => <span className="text-slate-500">{val || '-'}</span>
        },
        {
            header: "Posse",
            key: "ownership_type",
            render: (val: string) => val ? <span className="text-[10px] font-black bg-slate-100 px-2 py-1 rounded-md uppercase text-slate-500">{val}</span> : <span className="text-slate-300">-</span>
        },
        {
            header: "Preço",
            key: "price",
            render: (val: number) => <span className="text-emerald-600 font-black text-xs">{val ? `${Number(val).toLocaleString()} MT` : 'Sob Consulta'}</span>
        }
    ];

    useAdminTopBar("");

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">Gestão de Propriedades</h1>
                </div>

                <div className="flex flex-wrap items-center gap-3">
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

                    {/* Grid/List Toggle */}
                    <div className="flex items-center bg-white p-1 rounded-lg border border-slate-200 shadow-sm">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`p-2 rounded-md transition-all ${viewMode === 'grid' ? 'bg-slate-100 text-emerald-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                            title="Vista de Grelha"
                        >
                            <LayoutGrid className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`p-2 rounded-md transition-all ${viewMode === 'list' ? 'bg-slate-100 text-emerald-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                            title="Vista de Lista"
                        >
                            <List className="w-4 h-4" />
                        </button>
                    </div>

                    <button
                        type="button"
                        onClick={() => router.push('/admin/propriedades/novo')}
                        className={TOPBAR_NEW_BUTTON_CLASS}
                    >
                        <Plus className="w-4 h-4" />
                        Nova Propriedade
                    </button>
                    <LogoutButton
                        variant="outline"
                        className="h-9 px-4 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-red-600 border-slate-200"
                        showIcon
                        label="Sair"
                    />
                </div>
            </div>

            {viewMode === 'list' ? (
                <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden">
                    <AdminDataTable
                        title={statusFilter === 'deleted' ? "Reciclagem de Propriedades" : statusFilter === 'archived' ? "Arquivo de Propriedades" : "Propriedades Registadas"}
                        columns={propertyColumns}
                        data={data}
                        loading={loading}
                        hideSearch={true}
                        onEdit={(row) => router.push(`/admin/propriedades/${row.id}`)}
                        onDelete={handleDelete}
                        selectedIds={selectedIds}
                        onSelectRow={(id, selected) => {
                            if (selected) setSelectedIds(prev => [...prev, id]);
                            else setSelectedIds(prev => prev.filter(i => i !== id));
                        }}
                        onSelectAll={(all) => {
                            if (all) setSelectedIds(data.map(r => r.id));
                            else setSelectedIds([]);
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
                            (statusFilter === 'deleted' || statusFilter === 'archived') && data.length > 0 ? (
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
                                    <button onClick={(e) => { e.stopPropagation(); handleRestore(row); }} className="size-7 rounded text-slate-400 flex items-center justify-center hover:bg-emerald-50 hover:text-emerald-600 transition-all font-bold" title="Restaurar">
                                        <RotateCcw className="w-3.5 h-3.5" />
                                    </button>
                                );
                            }
                            return (
                                <button onClick={(e) => { e.stopPropagation(); handleArchive(row); }} className="size-7 rounded text-slate-400 flex items-center justify-center hover:bg-amber-50 hover:text-amber-600 transition-all font-bold" title={statusFilter === 'archived' ? 'Restaurar' : 'Arquivar'}>
                                    <Archive className="w-3.5 h-2.5" />
                                </button>
                            );
                        }}
                        hideHeader={statusFilter === 'active'}
                    />
                </div>
            ) : (
                /* GRID VIEW */
                loading ? (
                    <div className="flex justify-center py-20">
                        <Spinner className="h-8 w-8" />
                    </div>
                ) : data.length === 0 ? (
                    <div className="text-center py-20 bg-slate-50/50 rounded-2xl border-2 border-dashed border-slate-100">
                        <div className="mb-4 flex justify-center">
                            <div className="w-16 h-16 bg-white rounded-full shadow-sm flex items-center justify-center">
                                <LayoutGrid className="w-8 h-8 text-slate-200" />
                            </div>
                        </div>
                        <h3 className="font-bold text-slate-900 mb-1">
                            {statusFilter === 'deleted' ? "Lixeira vazia" : statusFilter === 'archived' ? "Arquivo vazio" : "Nenhuma propriedade encontrada"}
                        </h3>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 3xl:grid-cols-5 4xl:grid-cols-6 gap-6">
                        {data.map((item) => (
                            <div key={item.id} className="bg-white rounded-2xl border border-slate-100 hover:shadow-lg transition-all group relative overflow-hidden flex flex-col">
                                {/* CARD COVER IMAGE */}
                                <div className="h-48 w-full bg-slate-100 relative">
                                    {item.image_url ? (
                                        <img src={item.image_url} alt={item.name || item.title} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full bg-slate-100 flex items-center justify-center">
                                            <MapPin className="text-slate-300 w-8 h-8" />
                                        </div>
                                    )}

                                    {/* Edit/Delete Overlay */}
                                    <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 p-1 rounded-lg shadow-sm">
                                        {statusFilter === 'deleted' ? (
                                            <button onClick={() => handleRestore(item)} className="p-1.5 hover:bg-emerald-50 text-emerald-600 rounded">
                                                <RotateCcw className="w-4 h-4" />
                                            </button>
                                        ) : (
                                            <button onClick={() => handleArchive(item)} className="p-1.5 hover:bg-amber-50 text-amber-600 rounded">
                                                <Archive className="w-4 h-4" />
                                            </button>
                                        )}
                                        <button onClick={() => router.push(`/admin/propriedades/${item.id}`)} className="p-1.5 hover:bg-emerald-50 text-emerald-600 rounded">
                                            <Pencil className="w-4 h-4" />
                                        </button>
                                        <button onClick={() => handleDelete(item)} className="p-1.5 hover:bg-rose-50 text-rose-600 rounded">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>

                                {/* CARD CONTENT */}
                                <div className="p-6 flex-1 flex flex-col">
                                    <h3 className="font-bold text-slate-900 line-clamp-1 text-lg mb-1">{item.name || item.title}</h3>
                                    <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">
                                        {item.type || 'Tipo não definido'}
                                    </p>

                                    {/* Info Grid */}
                                    <div className="mt-4 space-y-2 text-xs text-slate-500">
                                        {item.location && (
                                            <div className="flex items-center gap-2">
                                                <MapPin className="w-3.5 h-3.5 text-emerald-500" />
                                                {item.location}
                                            </div>
                                        )}
                                        {item.size && (
                                            <div className="flex items-center gap-2">
                                                <Ruler className="w-3.5 h-3.5 text-emerald-500" />
                                                {item.size}
                                            </div>
                                        )}
                                        {item.price && (
                                            <div className="mt-2 flex items-center gap-2">
                                                <span className="text-emerald-600 font-black text-xl">
                                                    {Number(item.price).toLocaleString()} MT
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                        {/* Add New Card (Only in Active Mode) */}
                        {statusFilter === 'active' && (
                            <button
                                onClick={() => router.push('/admin/propriedades/novo')}
                                className="bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center p-6 hover:border-emerald-500 hover:bg-emerald-50/50 transition-all group min-h-[300px]"
                            >
                                <div className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                    <Plus className="w-6 h-6 text-emerald-500" />
                                </div>
                                <span className="font-bold text-slate-400 group-hover:text-emerald-600">
                                    Nova Propriedade
                                </span>
                            </button>
                        )}
                    </div>
                )
            )}

            <ConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={confirmDelete}
                title={statusFilter === 'deleted' ? "Eliminar Permanentemente" : "Mover para Lixeira"}
                description={statusFilter === 'deleted' ? "Tem a certeza que deseja eliminar PERMANENTEMENTE esta propriedade? Esta acção NÃO pode ser desfeita." : "A propriedade será movida para a lixeira."}
                variant="destructive"
            />

            <ConfirmationModal
                isOpen={showEmptyBinConfirm}
                onClose={() => setShowEmptyBinConfirm(false)}
                onConfirm={handleEmptyBin}
                title="Esvaziar Lixeira"
                description="Tem a certeza que deseja eliminar PERMANENTEMENTE todos os itens na lixeira?"
                variant="destructive"
            />

            <ConfirmationModal
                isOpen={showBulkDeleteConfirm}
                onClose={() => setShowBulkDeleteConfirm(false)}
                onConfirm={confirmBulkDelete}
                title={statusFilter === 'deleted' ? "Eliminar Itens" : "Mover para Lixeira"}
                description={`Tem a certeza que deseja processar os ${selectedIds.length} itens seleccionados?`}
                variant="destructive"
            />
        </div>
    );
}
