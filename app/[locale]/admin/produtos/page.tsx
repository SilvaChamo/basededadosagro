"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { AdminDataTable } from "@/components/admin/AdminDataTable";
import { Button } from "@/components/ui/button";
import { MarketProductForm } from "@/components/admin/MarketProductForm";
import { ShoppingCart, LayoutGrid, List, Pencil, Trash2, Plus, Tag, Building2, Package, FileText, RotateCcw, Archive, ExternalLink, Search, MoreVertical } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { ConfirmationModal } from "@/components/ui/ConfirmationModal";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Spinner } from "@/components/ui/spinner";

export default function AdminProductsPage() {
    const router = useRouter();
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'empresas' | 'mercado' | 'servicos' | 'outros'>('empresas');
    const [statusFilter, setStatusFilter] = useState("active"); // active, archived, deleted
    const [search, setSearch] = useState("");

    const [showMarketForm, setShowMarketForm] = useState(false);
    const [editingItem, setEditingItem] = useState<any>(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);
    const [showEmptyBinConfirm, setShowEmptyBinConfirm] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<any>(null);

    // Selection state
    const [selectedIds, setSelectedIds] = useState<string[]>([]);

    async function fetchData() {
        setLoading(true);

        const table = activeTab === "mercado" ? 'market_prices' : 'products';
        const selectQuery = activeTab === "mercado" ? '*' : '*, companies(id, name)';

        try {
            // Attempt query with status filter
            let query = supabase.from(table).select(selectQuery);

            if (statusFilter === 'active') query = query.eq('status', 'active');
            else if (statusFilter === 'archived') query = query.eq('status', 'inactive');
            else if (statusFilter === 'deleted') query = query.eq('status', 'deleted');

            if (activeTab === "mercado") {
                query = query.order('product', { ascending: true });
            } else {
                query = query.order('created_at', { ascending: false });
            }

            const { data, error } = await query;

            if (error) {
                // If it's a "column does not exist" error, fallback to unfiltered
                if (error.code === '42703') {
                    console.warn(`Column "status" not found in table "${table}". Falling back to unfiltered data.`);
                    let fallbackQuery = supabase.from(table).select(selectQuery);
                    if (activeTab === "mercado") {
                        fallbackQuery = fallbackQuery.order('product', { ascending: true });
                    } else {
                        fallbackQuery = fallbackQuery.order('created_at', { ascending: false });
                    }

                    if (statusFilter === 'deleted') {
                        // We rely on status column for deleted too in this fallback, but maybe we should use deleted_at if available
                        // For now keep it consistent with the user's request: if column missing, Archive is empty.
                        setData([]);
                        setLoading(false);
                        return;
                    } else if (statusFilter === 'archived') {
                        setData([]);
                        setLoading(false);
                        return;
                    }
                    const { data: fallbackData, error: fallbackError } = await fallbackQuery;
                    if (fallbackError) throw fallbackError;
                    processData(fallbackData || []);
                } else {
                    throw error;
                }
            } else {
                processData(data || []);
            }
        } catch (error) {
            console.error(error);
            toast.error("Erro ao carregar dados. Verifique a base de dados.");
            setData([]);
        } finally {
            setLoading(false);
        }
    }

    function processData(rawData: any[]) {
        let filtered = rawData;
        if (search) {
            const lowerSearch = search.toLowerCase();
            filtered = filtered.filter(item =>
                (item.name && item.name.toLowerCase().includes(lowerSearch)) ||
                (item.product && item.product.toLowerCase().includes(lowerSearch)) ||
                (item.category && item.category.toLowerCase().includes(lowerSearch))
            );
        }
        setData(filtered);
    }

    useEffect(() => {
        fetchData();
    }, [activeTab, statusFilter, search]);

    // Handlers
    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            setSelectedIds(data.map(item => item.id));
        } else {
            setSelectedIds([]);
        }
    };

    const handleSelectRow = (id: string, checked: boolean) => {
        if (checked) {
            setSelectedIds(prev => [...prev, id]);
        } else {
            setSelectedIds(prev => prev.filter(item => item !== id));
        }
    };

    const handleArchive = async (row: any) => {
        const table = activeTab === 'mercado' ? 'market_prices' : 'products';
        const newStatus = statusFilter === 'active' ? 'inactive' : 'active';

        try {
            const { error } = await supabase
                .from(table)
                .update({ status: newStatus })
                .eq('id', row.id);

            if (error) {
                if (error.code === '42703') {
                    toast.error("Funcionalidade de Arquivo requer actualização da base de dados (coluna 'status' em falta).");
                } else {
                    throw error;
                }
                return;
            }

            toast.success(newStatus === 'inactive' ? "Item arquivado" : "Item restaurado");
            setData(prev => prev.filter(p => p.id !== row.id));
        } catch (error) {
            console.error(error);
            toast.error("Erro ao actualizar estado");
        }
    };

    const handleDelete = (row: any) => {
        setItemToDelete(row);
        setShowDeleteConfirm(true);
    };

    const confirmDelete = async () => {
        if (!itemToDelete) return;
        const table = activeTab === 'mercado' ? 'market_prices' : 'products';

        try {
            if (statusFilter === 'deleted') {
                // Hard Delete
                const { error } = await supabase.from(table).delete().eq('id', itemToDelete.id);
                if (error) throw error;
                toast.success("Eliminado para sempre");
                setData(prev => prev.filter(p => p.id !== itemToDelete.id));
            } else {
                // Move to Recycle Bin (status: deleted)
                const { error } = await supabase.from(table).update({ status: 'deleted' }).eq('id', itemToDelete.id);
                if (error) {
                    if (error.code === '42703') {
                        toast.error("Reciclagem requer actualização da base de dados (coluna 'status' em falta).");
                    } else {
                        throw error;
                    }
                } else {
                    toast.success("Movido para reciclagem");
                    setData(prev => prev.filter(p => p.id !== itemToDelete.id));
                }
            }
        } catch (error) {
            console.error(error);
            toast.error("Erro ao eliminar");
        } finally {
            setShowDeleteConfirm(false);
            setItemToDelete(null);
        }
    };

    const handleRestoreFromTrash = async (row: any) => {
        const table = activeTab === 'mercado' ? 'market_prices' : 'products';
        try {
            const { error } = await supabase
                .from(table)
                .update({ status: 'active' })
                .eq('id', row.id);

            if (error) {
                if (error.code === '42703') {
                    toast.error("Restauro requer actualização da base de dados.");
                } else {
                    throw error;
                }
                return;
            }

            toast.success("Restaurado da reciclagem");
            setData(prev => prev.filter(p => p.id !== row.id));
        } catch (error) {
            console.error(error);
            toast.error("Erro ao restaurar");
        }
    };

    const handleEmptyBin = async () => {
        const table = activeTab === 'mercado' ? 'market_prices' : 'products';
        try {
            const { error } = await supabase.from(table).delete().eq('status', 'deleted');
            if (error) {
                if (error.code === '42703') {
                    toast.error("Limpeza da reciclagem requer actualização da base de dados.");
                } else {
                    throw error;
                }
                return;
            }
            toast.success("Reciclagem esvaziada");
            setData([]);
        } catch (error) {
            console.error(error);
            toast.error("Erro ao esvaziar reciclagem");
        }
        setShowEmptyBinConfirm(false);
    };

    const handleBulkRestore = async () => {
        if (selectedIds.length === 0) return;
        const table = activeTab === 'mercado' ? 'market_prices' : 'products';

        try {
            const { error } = await supabase
                .from(table)
                .update({ status: 'active' })
                .in('id', selectedIds);

            if (error) {
                if (error.code === '42703') {
                    toast.error("Restauro em massa requer actualização da base de dados.");
                } else {
                    throw error;
                }
                return;
            }

            toast.success(`${selectedIds.length} itens restaurados`);
            setData(prev => prev.filter(p => !selectedIds.includes(p.id)));
            setSelectedIds([]);
        } catch (error) {
            console.error(error);
            toast.error("Erro no restauro em massa");
        }
    };

    const confirmBulkDelete = async () => {
        const table = activeTab === 'mercado' ? 'market_prices' : 'products';
        if (selectedIds.length === 0) return;

        try {
            if (statusFilter === 'deleted') {
                // Hard Delete
                const { error } = await supabase.from(table).delete().in('id', selectedIds);
                if (error) throw error;
                toast.success(`${selectedIds.length} itens eliminados permanentemente`);
            } else {
                // Soft Delete (move to recycling)
                const { error } = await supabase.from(table).update({ status: 'deleted' }).in('id', selectedIds);
                if (error) throw error;
                toast.success(`${selectedIds.length} itens movidos para reciclagem`);
            }
            // Refresh
            setData(prev => prev.filter(p => !selectedIds.includes(p.id)));
            setSelectedIds([]);
        } catch (error) {
            console.error(error);
            toast.error("Erro na eliminação em massa");
        }
        setShowBulkDeleteConfirm(false);
    };

    const handleEdit = (row: any) => {
        if (activeTab === "mercado") {
            setEditingItem(row);
            setShowMarketForm(true);
        } else {
            router.push(`/admin/produtos/${row.id}`);
        }
    };

    const handleAdd = () => {
        if (activeTab === "mercado") {
            setEditingItem(null);
            setShowMarketForm(true);
        } else if (activeTab === "servicos") {
            router.push('/admin/produtos/novo?type=servico');
        } else {
            router.push('/admin/produtos/novo');
        }
    };

    const marketColumns = [
        { header: "Produto", key: "product", render: (val: string) => <span className="font-black text-slate-800">{val}</span> },
        { header: "Categoria", key: "category" },
        { header: "Unidade", key: "unit", render: (val: string) => <span className="text-xs font-semibold bg-slate-100 px-2 py-1 rounded">{val}</span> },
        { header: "Mercado", key: "location" },
        {
            header: "Preço",
            key: "price",
            render: (val: number) => <span className="text-emerald-600 font-bold">{val?.toLocaleString()} MT</span>
        }
    ];

    const productColumns = [
        { header: "Produto", key: "name", render: (val: string) => <span className="font-black text-slate-800">{val}</span> },
        { header: "Categoria", key: "category" },
        {
            header: "Preço",
            key: "price",
            render: (val: number) => <span className="text-emerald-600 font-bold">{val?.toLocaleString()} MT</span>
        },
        {
            header: "Empresa",
            key: "companies",
            render: (val: any) => val?.name ? <span className="text-xs font-bold text-slate-500">{val.name}</span> : null
        }
    ];

    return (
        <div className="space-y-8">
            {/* Header & Controls */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">Produtos</h1>
                </div>

                <div className="flex flex-col md:flex-row items-center gap-3">
                    {/* Context Filter (Active Tab) */}
                    <select
                        value={activeTab}
                        onChange={(e) => {
                            const val = e.target.value as any;
                            setActiveTab(val);
                            if (val === 'mercado') {
                                setViewMode('list');
                            }
                        }}
                        className="bg-white border border-slate-200 text-slate-600 text-xs font-bold uppercase tracking-wide rounded-lg px-4 py-2 outline-none focus:border-emerald-500 h-10 w-full md:w-32"
                    >
                        <option value="empresas">Empresas</option>
                        <option value="mercado">Cotações</option>
                    </select>

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


                    <Button
                        onClick={handleAdd}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold uppercase tracking-widest text-[10px] h-10 px-4 rounded-lg gap-2"
                    >
                        <Plus className="w-4 h-4" />
                        {activeTab === "mercado" ? "Nova Cotação" : "Novo Item"}
                    </Button>
                </div>
            </div>

            {viewMode === 'list' ? (
                <AdminDataTable
                    title={statusFilter === 'deleted' ? (activeTab === "mercado" ? "Reciclagem de Cotações" : "Reciclagem de Produtos") : statusFilter === 'archived' ? (activeTab === "mercado" ? "Arquivo de Cotações" : "Arquivo de Produtos") : (activeTab === "mercado" ? "Cotações" : "Empresas")}
                    columns={activeTab === "mercado" ? marketColumns : productColumns}
                    data={data}
                    loading={loading}
                    hideSearch={true}
                    onEdit={handleEdit}
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
                        (statusFilter === 'deleted' || statusFilter === 'archived') && data.length > 0 ? (
                            <div className="flex flex-col">
                                <button
                                    onClick={handleBulkRestore}
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
                                        Esvaziar Reciclagem
                                    </button>
                                )}
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
                />
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
                                {activeTab === 'empresas' ? <Package className="w-8 h-8 text-slate-200" /> : <Tag className="text-slate-200 w-8 h-8" />}
                            </div>
                        </div>
                        <h3 className="font-bold text-slate-900 mb-1">
                            {activeTab === 'empresas' ? "Nenhum produto de empresa" : "Nenhuma cotação encontrada"}
                        </h3>
                        <p className="text-sm text-slate-400 italic max-w-xs mx-auto">
                            {activeTab === 'empresas'
                                ? "Não há produtos físicos registados no momento. Adicione um novo produto para começar."
                                : "A base de dados de cotações do mercado está vazia."}
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 3xl:grid-cols-5 4xl:grid-cols-6 gap-6">
                        {data.map((item) => (
                            <div key={item.id} className="bg-white rounded-2xl border border-slate-100 hover:shadow-lg transition-all group relative overflow-hidden flex flex-col">

                                {/* CARD COVER IMAGE */}
                                <div className="h-48 w-full bg-slate-100 relative">
                                    {activeTab !== 'mercado' && item.image_url ? (
                                        <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                                    ) : activeTab === 'mercado' ? (
                                        // Market prices - no image, show icon
                                        <div className="w-full h-full bg-emerald-50/50 flex flex-col items-center justify-center gap-2 p-4 text-center border-b border-emerald-100/50">
                                            <div className="bg-white p-2 rounded-full shadow-sm mb-1">
                                                <Tag className="text-emerald-500 w-5 h-5" />
                                            </div>
                                            <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{item.category || 'Cotação'}</span>
                                        </div>
                                    ) : (
                                        <div className="w-full h-full bg-emerald-50/50 flex flex-col items-center justify-center gap-2 p-4 text-center border-b border-emerald-100/50">
                                            <div className="bg-white p-2 rounded-full shadow-sm mb-1">
                                                <ShoppingCart className="text-emerald-500 w-5 h-5" />
                                            </div>
                                            <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{item.category}</span>
                                        </div>
                                    )}

                                    {/* Edit/Delete Overlay */}
                                    <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 p-1 rounded-lg shadow-sm">
                                        <button
                                            onClick={() => statusFilter === 'deleted' ? handleRestoreFromTrash(item) : handleArchive(item)}
                                            className={`p-1.5 rounded ${statusFilter === 'deleted' ? 'hover:bg-emerald-50 text-emerald-600' : 'hover:bg-amber-50 text-amber-600'}`}
                                            title={statusFilter === 'deleted' ? "Restaurar" : statusFilter === 'archived' ? "Desarquivar" : "Arquivar"}
                                        >
                                            {statusFilter === 'deleted' ? <RotateCcw className="w-4 h-4" /> : <Archive className="w-4 h-4" />}
                                        </button>
                                        <button onClick={() => handleDelete(item)} className="p-1.5 hover:bg-rose-50 text-rose-600 rounded" title={statusFilter === 'deleted' ? "Eliminar Permanentemente" : "Mover para Lixeira"}>
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>

                                {/* CARD CONTENT */}
                                <div className="p-6 pt-0 flex-1 flex flex-col">
                                    {/* Title & Subtitle */}
                                    <div className="mt-4">
                                        <h3 className="font-bold text-slate-900 line-clamp-1 text-lg mb-1">{item.name || item.product}</h3>
                                        <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">{item.category + (item.unit ? ` • ${item.unit}` : '')}</p>
                                    </div>

                                    {/* Info Grid */}
                                    <div className="mt-4 space-y-2 text-xs text-slate-500">
                                        {/* Price Display */}
                                        {(item.price || item.preco || item.price === 0 || item.preco === 0) && (
                                            <div className="mt-2 flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-emerald-600 font-black text-xl">
                                                        {(item.price || item.preco)?.toLocaleString()} MT
                                                    </span>
                                                    {item.unit && <span className="text-slate-400 font-medium text-[10px] uppercase">/ {item.unit}</span>}
                                                </div>
                                                {statusFilter === 'active' && activeTab !== 'mercado' && (
                                                    <button onClick={() => handleEdit(item)} className="p-1.5 hover:bg-slate-100 text-slate-400 hover:text-emerald-600 rounded-full transition-colors" title="Editar">
                                                        <Pencil className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                        {/* Company Name if Product */}
                                        {activeTab === 'empresas' && item.companies && (
                                            <div className="mt-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                                                <Building2 className="w-3 h-3" />
                                                <Link href={`/admin/empresas/${item.companies.id}`} className="hover:text-emerald-600 hover:underline transition-colors">
                                                    {item.companies.name}
                                                </Link>
                                            </div>
                                        )}

                                        {/* Market Location for Market Prices */}
                                        {activeTab === 'mercado' && item.location && (
                                            <div className="mt-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                                                <ShoppingCart className="w-3 h-3" />
                                                {item.location}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )
            )}

            {showMarketForm && (
                <MarketProductForm
                    initialData={editingItem}
                    onClose={() => setShowMarketForm(false)}
                    onSuccess={() => {
                        fetchData();
                        setShowMarketForm(false);
                    }}
                />
            )}

            <ConfirmationModal
                key={statusFilter}
                isOpen={showDeleteConfirm}
                onClose={() => setShowDeleteConfirm(false)}
                onConfirm={confirmDelete}
                title={statusFilter === 'deleted' ? "Eliminar Permanentemente" : "Mover para Reciclagem"}
                description={
                    statusFilter === 'deleted'
                        ? `Tem a certeza que deseja eliminar PERMANENTEMENTE este item? Esta acção NÃO pode ser desfeita.`
                        : `O item será movido para a reciclagem. Poderá restaurá-lo mais tarde.`
                }
                confirmLabel={statusFilter === 'deleted' ? "Eliminar de vez" : "Mover para Lixeira"}
                variant="destructive"
            />

            <ConfirmationModal
                isOpen={showBulkDeleteConfirm}
                onClose={() => setShowBulkDeleteConfirm(false)}
                onConfirm={confirmBulkDelete}
                title="Eliminar em Massa"
                description={`Tem a certeza que deseja eliminar ${selectedIds.length} itens seleccionados? Esta acção não pode ser desfeita.`}
                confirmLabel="Eliminar Todos"
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
        </div>
    );
}
