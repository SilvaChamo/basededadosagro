"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { AdminDataTable } from "@/components/admin/AdminDataTable";
import { Button } from "@/components/ui/button";
import { GraduationCap, Plus, Search, LayoutGrid, List, Layers, Briefcase, TrendingUp, Factory, BarChart3, Clock, MapPin, Tag, Trash2, User, Calendar, Laptop, Pencil, RotateCcw, Archive, MoreVertical } from "lucide-react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { ConfirmationModal } from "@/components/ui/ConfirmationModal";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export default function AdminFormacaoPage() {
    const router = useRouter();
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [activeTab, setActiveTab] = useState('Todos');

    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);

    // Deletion State
    const [itemToDelete, setItemToDelete] = useState<any>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [statusFilter, setStatusFilter] = useState<'active' | 'archived' | 'deleted'>('active');
    const [showEmptyBinConfirm, setShowEmptyBinConfirm] = useState(false);

    const tabs = [
        { id: 'Todos', label: 'Todos', icon: Layers },
        { id: 'Tecnologia', label: 'Tecnologia', icon: GraduationCap },
        { id: 'Gestão', label: 'Gestão', icon: Briefcase },
        { id: 'Marketing', label: 'Marketing', icon: TrendingUp },
        { id: 'Produção', label: 'Produção', icon: Factory },
        { id: 'Financeiro', label: 'Financeiro', icon: BarChart3 },
        { id: 'Eventos', label: 'Eventos', icon: Calendar },
        { id: 'Workshop', label: 'Workshop', icon: Laptop },
    ];

    async function fetchData() {
        setLoading(true);
        try {
            let query = supabase
                .from('trainings')
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
                // Se a coluna 'status' não existir (erro 42703), usar o fallback de 'deleted_at'
                if (error.code === '42703') {
                    let fallbackQuery = supabase
                        .from('trainings')
                        .select('*')
                        .order('created_at', { ascending: false });

                    if (statusFilter === 'deleted') {
                        fallbackQuery = fallbackQuery.not('deleted_at', 'is', null);
                    } else if (statusFilter === 'archived') {
                        // Archived mode - if column missing, we can't have archived items
                        setData([]);
                        setLoading(false);
                        return;
                    } else if (statusFilter === 'active') {
                        fallbackQuery = fallbackQuery.is('deleted_at', null);
                    }

                    const { data: fallbackData, error: fallbackError } = await fallbackQuery;
                    if (fallbackError) throw fallbackError;
                    setData(fallbackData || []);
                } else {
                    throw error;
                }
            } else {
                setData(data || []);
            }
        } catch (error: any) {
            console.error(error);
            toast.error("Erro ao carregar formações");
        }
        setLoading(false);
    }

    useEffect(() => {
        fetchData();
    }, [statusFilter]);

    const filteredData = data.filter(item => {
        const instructorName = typeof item.instructor === 'object' ? item.instructor?.name : item.instructor;
        const matchesSearch = (item.title?.toLowerCase() || "").includes(search.toLowerCase()) ||
            (instructorName?.toLowerCase() || "").includes(search.toLowerCase());
        const matchesCategory = activeTab === 'Todos' || item.category === activeTab;
        return matchesSearch && matchesCategory;
    });

    const handleDelete = (row: any) => {
        setItemToDelete(row);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!itemToDelete) return;

        try {
            if (statusFilter === 'deleted') {
                // Hard Delete
                const { error } = await supabase
                    .from('trainings')
                    .delete()
                    .eq('id', itemToDelete.id);
                if (error) throw error;
                toast.success("Formação eliminada permanentemente");
            } else {
                // Soft delete / Move to bin
                const { error } = await supabase
                    .from('trainings')
                    .update({
                        status: 'deleted',
                        deleted_at: new Date().toISOString()
                    })
                    .eq('id', itemToDelete.id);

                if (error && error.code === '42703') {
                    // Fallback se não existir coluna status
                    const { error: fallbackError } = await supabase
                        .from('trainings')
                        .update({ deleted_at: new Date().toISOString() })
                        .eq('id', itemToDelete.id);
                    if (fallbackError) throw fallbackError;
                } else if (error) throw error;

                toast.success("Formação movida para a lixeira");
            }
            await fetchData();
        } catch (error: any) {
            toast.error("Erro ao eliminar formação");
        } finally {
            setIsDeleteModalOpen(false);
            setItemToDelete(null);
        }
    };

    const confirmBulkDelete = async () => {
        const previousData = [...data];
        try {
            if (statusFilter === 'deleted') {
                const { error } = await supabase
                    .from('trainings')
                    .delete()
                    .in('id', selectedIds);
                if (error) throw error;
                toast.success(`${selectedIds.length} formações eliminadas permanentemente!`);
            } else {
                const { error } = await supabase
                    .from('trainings')
                    .update({
                        status: 'deleted',
                        deleted_at: new Date().toISOString()
                    })
                    .in('id', selectedIds);

                if (error && error.code === '42703') {
                    const { error: fallbackError } = await supabase
                        .from('trainings')
                        .update({ deleted_at: new Date().toISOString() })
                        .in('id', selectedIds);
                    if (fallbackError) throw fallbackError;
                } else if (error) throw error;

                toast.success(`${selectedIds.length} formações movidas para a lixeira!`);
            }
            setSelectedIds([]);
            await fetchData();
        } catch (error: any) {
            setData(previousData);
            toast.error("Erro na acção em massa: " + error.message);
        } finally {
            setShowBulkDeleteConfirm(false);
        }
    };

    const handleRestore = async (item: any) => {
        try {
            const { error } = await supabase
                .from('trainings')
                .update({
                    status: 'active',
                    deleted_at: null
                })
                .eq('id', item.id);

            if (error && error.code === '42703') {
                const { error: fallbackError } = await supabase
                    .from('trainings')
                    .update({ deleted_at: null })
                    .eq('id', item.id);
                if (fallbackError) throw fallbackError;
            } else if (error) throw error;

            toast.success("Formação restaurada com sucesso");
            await fetchData();
        } catch (error: any) {
            toast.error("Erro ao restaurar formação");
        }
    };

    const handleArchive = async (item: any) => {
        try {
            const newStatus = statusFilter === 'archived' ? 'active' : 'archived';
            const { error } = await supabase
                .from('trainings')
                .update({ status: newStatus })
                .eq('id', item.id);

            if (error) {
                if (error.code === '42703') {
                    toast.error("A funcionalidade de arquivo requer uma actualização na base de dados.");
                    return;
                }
                throw error;
            }

            toast.success(newStatus === 'archived' ? "Formação arquivada" : "Formação restaurada para activos");
            await fetchData();
        } catch (error: any) {
            toast.error("Erro ao arquivar formação");
        }
    };

    const handleRestoreAll = async () => {
        try {
            const { error } = await supabase
                .from('trainings')
                .update({
                    status: 'active',
                    deleted_at: null
                })
                .not('deleted_at', 'is', null);

            if (error && error.code === '42703') {
                const { error: fallbackError } = await supabase
                    .from('trainings')
                    .update({ deleted_at: null })
                    .not('deleted_at', 'is', null);
                if (fallbackError) throw fallbackError;
            } else if (error) throw error;

            toast.success("Todos os itens foram restaurados");
            await fetchData();
        } catch (error: any) {
            toast.error("Erro ao restaurar todos os itens");
        }
    };

    const handleEmptyBin = async () => {
        try {
            const { error } = await supabase
                .from('trainings')
                .delete()
                .not('deleted_at', 'is', null);

            if (error) throw error;
            toast.success("Lixeira esvaziada com sucesso");
            await fetchData();
        } catch (error: any) {
            toast.error("Erro ao esvaziar lixeira");
        } finally {
            setShowEmptyBinConfirm(false);
        }
    };

    const columns = [
        { header: "Título da Formação", key: "title" },
        {
            header: "Categoria",
            key: "category",
            render: (val: string) => (
                <span className="text-[10px] font-black uppercase tracking-wider bg-slate-100 text-slate-600 px-2 py-1 rounded-md">
                    {val}
                </span>
            )
        },
        {
            header: "Formador",
            key: "instructor",
            render: (val: any) => {
                const name = typeof val === 'object' ? val.name : val;
                return (
                    <div className="flex items-center gap-2">
                        <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="font-bold text-slate-700 truncate max-w-[120px]">
                            {name || 'Base Agro'}
                        </span>
                    </div>
                );
            }
        },
        {
            header: "Início",
            key: "date",
            render: (val: string) => <span className="font-bold text-slate-600 text-xs">{val}</span>
        },
        {
            header: "Preço",
            key: "price",
            render: (val: string) => <span className="text-emerald-600 font-bold text-xs">{val}</span>
        },
        {
            header: "Vagas",
            key: "spots_total",
            render: (val: any) => <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded text-[10px] font-black">{val} vagas</span>
        }
    ];

    return (
        <div className="space-y-8">
            {/* Header & Controls */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">Formações</h1>
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
                        {tabs.map(tab => (
                            <option key={tab.id} value={tab.id}>{tab.label}</option>
                        ))}
                    </select>

                    {/* Search Input */}
                    <div className="relative w-72">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                        <Input
                            placeholder="Buscar formações..."
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



                    {/* View mode toggle */}
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

                    <Button
                        onClick={() => router.push('/admin/formacao/novo')}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold uppercase tracking-widest text-[10px] h-10 px-4 rounded-lg gap-2"
                    >
                        <Plus className="w-4 h-4" />
                        Nova Formação
                    </Button>
                </div>
            </div>

            {/* Content */}
            {loading ? (
                <div className="flex justify-center py-20">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
                </div>
            ) : filteredData.length === 0 ? (
                <div className="text-center py-20 bg-slate-50/50 rounded-2xl border-2 border-dashed border-slate-100">
                    <div className="mb-4 flex justify-center">
                        <div className="w-16 h-16 bg-white rounded-full shadow-sm flex items-center justify-center">
                            <GraduationCap className="w-8 h-8 text-slate-200" />
                        </div>
                    </div>
                    <h3 className="font-bold text-slate-900 mb-1">
                        {statusFilter === 'deleted' ? "Lixeira vazia" : statusFilter === 'archived' ? "Arquivo vazio" : "Nenhuma formação encontrada"}
                    </h3>
                    <p className="text-sm text-slate-400 italic max-w-xs mx-auto">
                        {statusFilter === 'deleted' ? "Não há itens na lixeira." : statusFilter === 'archived' ? "Não há formações arquivadas." : "Comece adicionando uma nova formação ou altere os filtros."}
                    </p>
                </div>
            ) : viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredData.map((item) => (
                        <div key={item.id} className="bg-white rounded-2xl border border-slate-100 hover:shadow-md transition-all group flex flex-col overflow-hidden">
                            <div className="p-6 flex flex-col flex-1">
                                <div className="flex items-start justify-between gap-4 mb-4">
                                    <h3 className="font-bold text-slate-900 text-base line-clamp-2 leading-tight flex-1">{item.title}</h3>
                                    <span className="shrink-0 bg-slate-50 text-slate-500 text-[9px] font-black uppercase px-2 py-1 rounded-md border border-slate-100">
                                        {item.category}
                                    </span>
                                </div>

                                <div className="space-y-2 mb-4">
                                    <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                                        <User className="w-3.5 h-3.5 text-slate-400" />
                                        <span className="truncate">Formador: {typeof item.instructor === 'object' ? item.instructor?.name : item.instructor || 'Base Agro'}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                                        <span>Inicia em: {item.date}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                                        <Tag className="w-3.5 h-3.5 text-slate-400" />
                                        <span className="text-emerald-600 font-black">{item.price}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-slate-400 pt-1">
                                        <div className="flex-1 h-1 bg-slate-100 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-emerald-500 rounded-full"
                                                style={{ width: `${Math.min(100, (item.spots_filled || 0) / (item.spots_total || 1) * 100)}%` }}
                                            />
                                        </div>
                                        <span className="font-bold text-[10px] uppercase">{(item.spots_available || item.spots_total) || 0} Vagas</span>
                                    </div>
                                </div>

                                <div className="mt-auto flex items-center justify-end gap-1">
                                    {statusFilter === 'deleted' ? (
                                        <Button
                                            onClick={() => handleRestore(item)}
                                            size="sm"
                                            className="flex-1 rounded-lg text-[10px] font-black uppercase tracking-widest h-8 bg-emerald-600 hover:bg-emerald-700 text-white"
                                        >
                                            Restaurar
                                        </Button>
                                    ) : (
                                        <>
                                            <Button
                                                onClick={() => handleArchive(item)}
                                                variant="ghost"
                                                size="sm"
                                                className={`size-8 rounded-lg ${statusFilter === 'archived' ? 'text-emerald-600 bg-emerald-50' : 'text-slate-400 hover:text-amber-600 hover:bg-amber-50'} p-0`}
                                                title={statusFilter === 'archived' ? 'Desarquivar' : 'Arquivar'}
                                            >
                                                <Archive className="w-4 h-4" />
                                            </Button>
                                            <Button
                                                onClick={() => router.push(`/admin/formacao/${item.id}`)}
                                                variant="ghost"
                                                size="sm"
                                                className="size-8 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 p-0"
                                            >
                                                <Pencil className="w-4 h-4" />
                                            </Button>
                                            <Button
                                                onClick={() => handleDelete(item)}
                                                variant="ghost"
                                                size="sm"
                                                className="size-8 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 p-0"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                    {/* Add New Card (Only in Active Mode) */}
                    {statusFilter === 'active' && (
                        <button
                            onClick={() => router.push('/admin/formacao/novo')}
                            className="bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center p-6 hover:border-emerald-500 hover:bg-emerald-50/50 transition-all group min-h-[250px]"
                        >
                            <div className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                <Plus className="w-6 h-6 text-emerald-500" />
                            </div>
                            <span className="font-bold text-slate-400 group-hover:text-emerald-600">Nova Formação</span>
                        </button>
                    )}
                </div>
            ) : (
                <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden">
                    <AdminDataTable
                        title={statusFilter === 'deleted' ? "Reciclagem de Formações" : statusFilter === 'archived' ? "Arquivo de Formações" : (activeTab === 'Todos' ? 'Todas Formações' : `Formações em ${activeTab}`)}
                        columns={columns}
                        data={filteredData}
                        loading={loading}
                        hideSearch={true}
                        onEdit={(item) => router.push(`/admin/formacao/${item.id}`)}
                        onDelete={handleDelete}
                        selectedIds={selectedIds}
                        onSelectRow={(id: string, selected: boolean) => {
                            if (selected) setSelectedIds(prev => [...prev, id]);
                            else setSelectedIds(prev => prev.filter(i => i !== id));
                        }}
                        onSelectAll={(all: boolean) => {
                            if (all) {
                                setSelectedIds(filteredData.map(r => r.id));
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
                            (statusFilter === 'deleted' || statusFilter === 'archived') && filteredData.length > 0 ? (
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
                    />
                </div>
            )}

            <ConfirmationModal
                key={statusFilter === 'deleted' ? 'perm' : 'soft'}
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={confirmDelete}
                title={statusFilter === 'deleted' ? "Eliminar Permanentemente" : "Mover para Lixeira"}
                description={
                    statusFilter === 'deleted'
                        ? `Tem a certeza que deseja eliminar PERMANENTEMENTE a formação "${itemToDelete?.title}"? Esta acção NÃO pode ser desfeita.`
                        : `A formação "${itemToDelete?.title}" será movida para a lixeira. Poderá restaurá-lo mais tarde.`
                }
                confirmLabel={statusFilter === 'deleted' ? "Eliminar de vez" : "Mover para Lixeira"}
                variant="destructive"
            />

            <ConfirmationModal
                isOpen={showEmptyBinConfirm}
                onClose={() => setShowEmptyBinConfirm(false)}
                onConfirm={handleEmptyBin}
                title="Esvaziar Lixeira"
                description="Tem a certeza que deseja eliminar PERMANENTEMENTE todos os itens na lixeira? Esta acção NÃO pode ser desfeita."
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
        </div>
    );
}
