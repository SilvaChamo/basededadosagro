"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { AdminDataTable } from "@/components/admin/AdminDataTable";
import { Button } from "@/components/ui/button";
import { Archive, Trash2, User, Plus, Search, LayoutGrid, List, RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { ConfirmationModal } from "@/components/ui/ConfirmationModal";
import { Spinner } from "@/components/ui/spinner";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

const MOCK_DATA: any[] = [];

export default function AdminProfessionalsPage() {
    const supabase = createClient();
    const router = useRouter();
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [professionFilter, setProfessionFilter] = useState("all");
    const [statusFilter, setStatusFilter] = useState("active"); // active, archived, deleted
    const [itemToDelete, setItemToDelete] = useState<any>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);

    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            setSelectedIds(filteredData.map((item: any) => item.id));
        } else {
            setSelectedIds([]);
        }
    };

    const handleSelectRow = (id: string, checked: boolean) => {
        if (checked) {
            setSelectedIds(prev => [...prev, id]);
        } else {
            setSelectedIds(prev => prev.filter((item: any) => item !== id));
        }
    };

    const handleBulkRestore = async () => {
        if (selectedIds.length === 0) return;

        // Separate logical/db updates
        // For simple MVP we iterate or use 'in' query
        const realIds = selectedIds.filter(id => !id.startsWith('mock-'));

        if (realIds.length > 0) {
            const { error } = await supabase
                .from('professionals')
                .update({ status: 'active' })
                .in('id', realIds);

            if (error) {
                toast.error("Erro ao restaurar itens seleccionados");
                return;
            }
        }

        setData(prev => prev.map((p: any) => selectedIds.includes(p.id) ? { ...p, status: 'active' } : p));
        toast.success(`${selectedIds.length} itens restaurados`);
        setSelectedIds([]);
    };

    const handleRestoreAllArchived = async () => {
        const { error } = await supabase
            .from('professionals')
            .update({ status: 'active' })
            .eq('status', 'inactive'); // archived

        if (error) {
            toast.error("Erro ao restaurar tudo");
            return;
        }

        setData(prev => prev.map((p: any) => p.status === 'inactive' ? { ...p, status: 'active' } : p));
        toast.success("Todos os itens restaurados");
    };

    const handleRefresh = async () => {
        setLoading(true);
        // Clear local storage for this view to prevent stale data
        if (typeof window !== 'undefined') {
            localStorage.removeItem('agro_data_snapshot_Lista de Talentos & Especialistas');
            localStorage.removeItem('agro_data_snapshot_Profissionais Arquivados');
            localStorage.removeItem('agro_data_snapshot_Reciclagem de Profissionais');
        }
        await fetchData();
        toast.success("Dados actualizados da base de dados");
    };

    const fetchData = async () => {
        setLoading(true);
        const { data: dbData, error } = await supabase
            .from('professionals')
            .select('*')
            .order('name', { ascending: true });

        if (error) {
            console.error('Erro ao carregar dados:', error);
            toast.error("Erro ao carregar profissionais da BD");
        } else {
            const normalizedDbData = (dbData || []).map((item: any) => ({
                ...item,
                status: item.status || 'active'
            }));

            console.log('Profissionais carregados:', normalizedDbData.length, 'total');
            setData(normalizedDbData);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Get unique professions for the filter
    const professions = Array.from(new Set(data.map((item: any) => item.profession).filter(Boolean)));

    const filteredData = data.filter((item: any) => {
        const matchesSearch =
            item.name?.toLowerCase().includes(search.toLowerCase()) ||
            item.profession?.toLowerCase().includes(search.toLowerCase()) ||
            item.email?.toLowerCase().includes(search.toLowerCase()) ||
            item.location?.toLowerCase().includes(search.toLowerCase());

        const matchesProfession = professionFilter === "all" || item.profession === professionFilter;

        // Status filter logic
        const matchesStatus = statusFilter === "active"
            ? (item.status === 'active' || !item.status)
            : statusFilter === "archived"
                ? item.status === 'inactive'
                : item.status === 'deleted';

        return matchesSearch && matchesProfession && matchesStatus;
    });

    const handleArchive = async (row: any) => {
        const isMock = row.id.toString().startsWith('mock-');
        const newStatus = row.status === 'inactive' ? 'active' : 'inactive';

        if (!isMock) {
            const { error } = await supabase
                .from('professionals')
                .update({ status: newStatus })
                .eq('id', row.id);

            if (error) {
                console.error("Erro Supabase:", error);
                toast.error(newStatus === 'inactive' ? "Erro ao arquivar" : "Erro ao restaurar");
                return;
            }
        }

        toast.success(newStatus === 'inactive' ? "Profissional arquivado" : "Profissional restaurado");
        setData(prev => prev.map((p: any) => p.id === row.id ? { ...p, status: newStatus } : p));
    };

    const handleRestoreFromTrash = async (row: any) => {
        const isMock = row.id.toString().startsWith('mock-');

        if (!isMock) {
            const { error } = await supabase
                .from('professionals')
                .update({ status: 'active' })
                .eq('id', row.id);

            if (error) {
                toast.error("Erro ao restaurar profissional");
                return;
            }
        }

        toast.success("Profissional restaurado da reciclagem");
        setData(prev => prev.map((p: any) => p.id === row.id ? { ...p, status: 'active' } : p));
    };

    const handleEmptyTrash = async () => {
        // 1. Identify items to delete (excluding mocks if you want to keep them or handle them differently)
        // Actually, we can just delete all non-mock items with status 'deleted' from DB

        const { error } = await supabase
            .from('professionals')
            .delete()
            .eq('status', 'deleted');

        if (error) {
            toast.error("Erro ao esvaziar a reciclagem");
            return;
        }

        // 2. Clear local state (remove all 'deleted' items)
        setData(prev => prev.filter((p: any) => p.status !== 'deleted'));
        toast.success("Reciclagem esvaziada com sucesso");
    };

    const handleDelete = (row: any) => {
        setItemToDelete(row);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!itemToDelete) return;

        const isMock = itemToDelete.id.toString().startsWith('mock-');

        if (itemToDelete.status === 'deleted') {
            // Permanent delete
            if (!isMock) {
                const { error } = await supabase
                    .from('professionals')
                    .delete()
                    .eq('id', itemToDelete.id);

                if (error) {
                    toast.error("Erro ao eliminar permanentemente");
                    return;
                }
            }
            toast.success("Profissional eliminado permanentemente");
            setData(prev => prev.filter((p: any) => p.id !== itemToDelete.id));
        } else {
            // Soft delete
            if (!isMock) {
                const { error } = await supabase
                    .from('professionals')
                    .update({ status: 'deleted' })
                    .eq('id', itemToDelete.id);

                if (error) {
                    console.error("Erro Supabase Delete:", error);
                    toast.error("Erro ao enviar para a reciclagem");
                    return;
                }
            }
            toast.success("Enviado para a reciclagem");
            setData(prev => prev.map((p: any) => p.id === itemToDelete.id ? { ...p, status: 'deleted' } : p));
        }

        setIsDeleteModalOpen(false);
        setItemToDelete(null);
    };

    const columns = [
        {
            header: "Nome",
            key: "name",
            render: (val: string, row: any) => (
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200 shrink-0">
                        {row.photo_url ? (
                            <img src={row.photo_url} alt={val} className="w-full h-full rounded-full object-cover" />
                        ) : (
                            <User className="w-4 h-4 text-slate-400" />
                        )}
                    </div>
                    <span className="font-bold text-slate-800 whitespace-nowrap">{val}</span>
                </div>
            )
        },
        {
            header: "Profissão",
            key: "profession",
            render: (val: string) => <span className="text-xs font-semibold bg-emerald-50 text-emerald-700 px-2 py-1 rounded-full uppercase whitespace-nowrap">{val || "Não inf."}</span>
        },
        { header: "Email", key: "email" },
        { header: "Telefone", key: "phone" },
        { header: "Localização", key: "location" },
    ];

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">Gestão</h1>
                </div>

                <div className="flex items-center flex-wrap gap-2">
                    {/* Profession Filter */}
                    <Select value={professionFilter} onValueChange={setProfessionFilter}>
                        <SelectTrigger className="w-[160px] h-10 bg-white border-slate-200 text-xs font-bold uppercase tracking-wider">
                            <SelectValue placeholder="Profissão" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todas</SelectItem>
                            {professions.map((p: any) => (
                                <SelectItem key={p} value={p}>{p}</SelectItem>
                            ))}
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

                    {/* Refresh Button - Icon Only */}
                    <Button
                        variant="outline"
                        onClick={handleRefresh}
                        className="bg-white hover:bg-slate-50 text-slate-600 h-10 w-10 p-0 rounded-lg border-slate-200"
                        title="Actualizar dados"
                    >
                        <RefreshCw className="w-4 h-4" />
                    </Button>

                    {/* New Button */}
                    <Button
                        onClick={() => router.push('/admin/profissionais/novo')}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold uppercase tracking-widest text-[10px] h-10 px-4 rounded-lg gap-2"
                    >
                        <Plus className="w-4 h-4" />
                        Novo
                    </Button>
                </div>
            </div>

            {viewMode === 'list' ? (
                <AdminDataTable
                    title={statusFilter === 'archived' ? "Profissionais Arquivados" : statusFilter === 'deleted' ? "Reciclagem de Profissionais" : "Lista de Talentos & Especialistas"}
                    columns={columns}
                    data={filteredData}
                    loading={loading}
                    hideSearch={true}
                    onEdit={(row) => router.push(`/admin/profissionais/${row.id}`)}
                    onDelete={handleDelete}
                    // Selection Props
                    selectedIds={selectedIds}
                    onSelectAll={handleSelectAll}
                    onSelectRow={handleSelectRow}
                    // Bulk Actions
                    bulkActions={
                        selectedIds.length > 0 && (statusFilter === 'archived' || statusFilter === 'deleted') ? (
                            <Button
                                onClick={handleBulkRestore}
                                variant="outline"
                                className="bg-white/10 text-white hover:bg-white/20 border-white/20 h-8 text-xs font-bold uppercase tracking-wider gap-2"
                            >
                                <Archive className="w-3.5 h-3.5" />
                                Restaurar ({selectedIds.length})
                            </Button>
                        ) : null
                    }
                    headerMenu={
                        statusFilter === 'deleted' && filteredData.length > 0 ? (
                            <div className="flex flex-col">
                                <button
                                    onClick={handleEmptyTrash}
                                    className="flex items-center gap-2 px-3 py-2 text-sm text-rose-600 hover:bg-rose-50 w-full text-left rounded-sm font-medium transition-colors"
                                >
                                    <Trash2 className="w-4 h-4" />
                                    Esvaziar Reciclagem
                                </button>
                            </div>
                        ) : statusFilter === 'archived' && filteredData.length > 0 ? (
                            <div className="flex flex-col">
                                <button
                                    onClick={handleRestoreAllArchived}
                                    className="flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 w-full text-left rounded-sm font-medium transition-colors"
                                >
                                    <Archive className="w-4 h-4" />
                                    Repor Tudo
                                </button>
                            </div>
                        ) : null
                    }
                    customActions={(row) => {
                        if (statusFilter === 'deleted') {
                            return (
                                <button
                                    onClick={(e) => { e.stopPropagation(); handleRestoreFromTrash(row); }}
                                    className="size-7 rounded text-slate-400 flex items-center justify-center hover:bg-emerald-50 hover:text-emerald-600 transition-all font-bold"
                                    title="Restaurar"
                                >
                                    <Archive className="w-3.5 h-3.5" />
                                </button>
                            );
                        }
                        if (statusFilter === 'archived') {
                            return (
                                <button
                                    onClick={(e) => { e.stopPropagation(); handleArchive(row); }} // handleArchive toggles back to active
                                    className="size-7 rounded text-slate-400 flex items-center justify-center hover:bg-emerald-50 hover:text-emerald-600 transition-all font-bold"
                                    title="Restaurar"
                                >
                                    <Archive className="w-3.5 h-3.5" />
                                </button>
                            );
                        }
                        if (statusFilter === 'active') {
                            return (
                                <button
                                    onClick={(e) => { e.stopPropagation(); handleArchive(row); }}
                                    className="size-7 rounded text-slate-400 flex items-center justify-center hover:bg-amber-50 hover:text-amber-600 transition-all font-bold"
                                    title="Arquivar"
                                >
                                    <Archive className="w-3.5 h-3.5" />
                                </button>
                            );
                        }
                        return null;
                    }}
                />
            ) : (
                /* GRID VIEW */
                loading ? (
                    <div className="flex justify-center py-20">
                        <Spinner className="h-8 w-8" />
                    </div>
                ) : filteredData.length === 0 ? (
                    <div className="text-center py-20 text-slate-400 italic">
                        {statusFilter === 'deleted' ? "A reciclagem está vazia." : "Nenhum profissional encontrado."}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 3xl:grid-cols-5 4xl:grid-cols-6 gap-6">
                        {filteredData.map((item) => (
                            <div
                                key={item.id}
                                className="bg-white rounded-2xl border border-slate-100 hover:shadow-lg transition-all group relative overflow-hidden p-6 flex flex-col items-center text-center cursor-pointer"
                                onClick={() => router.push(`/admin/profissionais/${item.id}`)}
                            >
                                {/* Archive icon - top right (left of delete) */}
                                {item.status !== 'deleted' && (
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleArchive(item); }}
                                        className={`absolute top-4 right-12 p-1.5 transition-colors ${item.status === 'inactive' ? 'text-amber-500 bg-amber-50 rounded-full' : 'text-slate-300 hover:text-amber-500'}`}
                                        title={item.status === 'inactive' ? "Restaurar" : "Arquivar"}
                                    >
                                        <Archive className="w-4 h-4" />
                                    </button>
                                )}

                                {/* Delete icon - top right */}
                                <button
                                    onClick={(e) => { e.stopPropagation(); handleDelete(item); }}
                                    className="absolute top-4 right-4 p-1.5 text-slate-300 hover:text-rose-500 transition-colors"
                                    title={item.status === 'deleted' ? "Eliminar Permanentemente" : "Mover para Reciclagem"}
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>

                                {/* Restore button for deleted items */}
                                {item.status === 'deleted' && (
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleRestoreFromTrash(item); }}
                                        className="absolute top-4 left-4 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-600 rounded-full hover:bg-emerald-100 transition-colors"
                                    >
                                        Restaurar
                                    </button>
                                )}

                                <div className="w-20 h-20 rounded-full bg-slate-50 border-4 border-white shadow-sm flex items-center justify-center mb-4 overflow-hidden shrink-0">
                                    {item.photo_url ? (
                                        <img src={item.photo_url} alt={item.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <User className="w-8 h-8 text-slate-300" />
                                    )}
                                </div>
                                <h3 className="font-bold text-slate-900 text-lg mb-1 leading-tight">{item.name}</h3>
                                <p className="text-[10px] font-black uppercase text-emerald-600 tracking-wider mb-2 bg-emerald-50 px-3 py-1 rounded-full">{item.profession || item.role || "Profissional"}</p>

                                {/* Contact info */}
                                {item.phone && (
                                    <p className="text-xs text-slate-400 font-medium mt-2">{item.phone}</p>
                                )}
                                {item.email && (
                                    <p className="text-xs text-slate-400 font-medium truncate max-w-full">{item.email}</p>
                                )}
                            </div>
                        ))}
                    </div>
                )
            )}

            <ConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={confirmDelete}
                title="Eliminar Profissional"
                description={`Tem a certeza que deseja eliminar o perfil de "${itemToDelete?.name}"? Esta acção não pode ser desfeita.`}
                confirmLabel="Eliminar Permanentemente"
                variant="destructive"
            />
        </div>
    );
}
