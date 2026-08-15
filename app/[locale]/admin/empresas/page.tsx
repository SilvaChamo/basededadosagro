"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { AdminDataTable } from "@/components/admin/AdminDataTable";
import { Button } from "@/components/ui/button";
import {
    Building2, Eye, Loader2, ChevronDown, LayoutGrid, List,
    Plus, Search, Filter, MoreHorizontal,
    Edit, Trash2, MapPin, Globe, Phone, Calendar,
    Archive, ArchiveRestore, Pencil, CheckCircle2
} from "lucide-react";
import { SECTORS } from "@/lib/agro-data";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ConfirmationModal } from "@/components/ui/ConfirmationModal";
import { Spinner } from "@/components/ui/spinner";

export default function AdminEmpresasPage() {
    const supabase = createClient();
    const router = useRouter();
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [filter, setFilter] = useState('Todas');
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("Todas");
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 9;
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);
    const [showPremiumConfirm, setShowPremiumConfirm] = useState(false);
    const [itemToProcess, setItemToProcess] = useState<any>(null);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);

    async function fetchData() {
        try {
            setLoading(true);
            let query = supabase.from('companies').select('*');
            const { data: result, error } = await query
                .or('type.neq.Loja,type.is.null') // Show everything except stores, including NULLs
                .order('is_featured', { ascending: false })
                .order('created_at', { ascending: false });

            if (error) {
                console.error(error);
                toast.error("Erro ao carregar dados.");
            } else {
                setData(result || []);
            }
        } catch (err) {
            console.error("fetchData error:", err);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchData();
    }, []);

    // Filter Logic
    const filteredData = data.filter(item => {
        try {
            // Status Filter
            if (item.is_deleted) return false;
            let matchesFilter = true;
            const itemType = item.type || "";
            const itemSector = item.sector || "";
            const itemName = item.name || "";

            if (filter === 'Públicas') matchesFilter = (itemType === 'Empresa Pública' || itemSector.includes('Public')) && !item.is_archived;
            else if (filter === 'Privadas') matchesFilter = (itemType === 'Empresa Privada' || !item.type) && !item.is_archived;
            else if (filter === 'Internacionais') matchesFilter = (itemType === 'ONG Internacional' || itemName.includes('International')) && !item.is_archived;
            else if (filter === 'Associações') matchesFilter = (itemType === 'Associação' || itemType === 'Cooperativa Agrícola' || itemName.includes('Associação')) && !item.is_archived;
            else if (filter === 'Destacadas') matchesFilter = item.is_featured === true && !item.is_archived;
            else if (filter === 'Arquivadas') matchesFilter = item.is_archived === true;
            else if (filter === 'Todas') matchesFilter = !item.is_archived;

            // Category Filter
            const matchesCategory = selectedCategory === "Todas" || (item.category === selectedCategory || item.sector === selectedCategory);

            // Search Filter
            const search = searchTerm.toLowerCase();
            const matchesSearch = itemName.toLowerCase().includes(search) ||
                (item.nuit || "").includes(searchTerm) ||
                (item.email?.toLowerCase() || "").includes(search);

            return matchesFilter && matchesCategory && matchesSearch;
        } catch (e) {
            console.error("Filter error in Empresas:", e);
            return false;
        }
    });

    // Pagination Logic
    const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);
    const paginatedData = filteredData.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    const confirmDelete = async () => {
        if (!itemToProcess) return;
        const previousData = [...data];
        try {
            // Optimistic update
            setData(prev => prev.filter(c => c.id !== itemToProcess.id));

            const { error } = await supabase.rpc('delete_company_as_admin', {
                target_company_id: itemToProcess.id
            });

            if (error) throw error;
            toast.success("Empresa eliminada com sucesso!");
        } catch (error: any) {
            setData(previousData);
            toast.error("Erro ao eliminar: " + (error.message || "Erro de permissão"));
        } finally {
            setShowDeleteConfirm(false);
            setItemToProcess(null);
        }
    };

    const confirmBulkDelete = async () => {
        const previousData = [...data];
        try {
            // Optimistic update
            setData(prev => prev.filter(c => !selectedIds.includes(c.id)));

            const { error } = await supabase
                .from('companies')
                .delete()
                .in('id', selectedIds);

            if (error) throw error;

            toast.success(`${selectedIds.length} empresas eliminadas!`);
            setSelectedIds([]);
        } catch (error: any) {
            setData(previousData);
            toast.error("Erro na eliminação em massa: " + error.message);
        } finally {
            setShowBulkDeleteConfirm(false);
        }
    };

    const handleDelete = (row: any) => {
        setItemToProcess(row);
        setShowDeleteConfirm(true);
    };

    const toggleVerify = async (row: any) => {
        try {
            const { error } = await supabase
                .from('companies')
                .update({ is_verified: !row.is_verified })
                .eq('id', row.id);
            if (error) throw error;
            toast.success(row.is_verified ? "Verificação removida" : "Empresa verificada!");
            fetchData();
        } catch (err: any) {
            toast.error("Erro ao verificar: " + err.message);
        }
    };

    const toggleArchive = async (row: any) => {
        try {
            const { error } = await supabase
                .from('companies')
                .update({ is_archived: !row.is_archived })
                .eq('id', row.id);
            if (error) throw error;
            toast.success(row.is_archived ? "Empresa reposta!" : "Empresa arquivada!");
            fetchData();
        } catch (err: any) {
            toast.error("Erro: " + err.message);
        }
    };

    const toggleFeatured = async (row: any) => {
        try {
            const { error } = await supabase
                .from('companies')
                .update({ is_featured: !row.is_featured })
                .eq('id', row.id);
            if (error) throw error;
            toast.success(row.is_featured ? "Destaque removido" : "Empresa em destaque!");
            fetchData();
        } catch (err: any) {
            toast.error("Erro: " + err.message);
        }
    };

    const confirmPremium = async () => {
        if (!itemToProcess) return;
        try {
            const { error } = await supabase
                .from('companies')
                .update({ plan: 'Premium' })
                .eq('id', itemToProcess.id);
            if (error) throw error;
            toast.success("Plano Premium ativado!");
            fetchData();
        } catch (err: any) {
            toast.error("Erro: " + err.message);
        } finally {
            setShowPremiumConfirm(false);
            setItemToProcess(null);
        }
    };

    const companyColumns = [
        {
            header: "Empresa",
            key: "name",
            render: (val: string, row: any) => (
                <div className="flex items-center gap-3">
                    {row.logo_url ? (
                        <img src={row.logo_url} alt={val} className="size-12 object-contain bg-white rounded-lg border border-slate-100 p-1" />
                    ) : (
                        <div className="size-12 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 border border-slate-100">
                            <Building2 className="w-5 h-5" />
                        </div>
                    )}
                    <span className="font-excep font-black text-slate-800 text-sm">{val}</span>
                </div>
            )
        },
        {
            header: "Tipo",
            key: "type",
            render: (val: string) => <span className="text-xs font-bold text-slate-500">{val || "N/A"}</span>
        },
        {
            header: "Sector",
            key: "category",
            render: (val: string) => val || <span className="text-slate-300 text-xs">Não definido</span>
        },

        {
            header: "Contacto",
            key: "contact",
            render: (val: string, row: any) => {
                const phone = val || row.phone || row.secondary_contact;
                return phone ? (
                    <span className="flex items-center gap-1 text-slate-400">
                        <Phone className="w-3 h-3" />
                        {phone}
                    </span>
                ) : null;
            }
        },
        {
            header: "Website",
            key: "website",
            render: (val: string, row: any) => {
                const url = val || row.activity;
                if (!url) return null;
                return (
                    <a href={url.startsWith('http') ? url : `https://${url}`} target="_blank" rel="noopener noreferrer" className="text-emerald-500 hover:underline flex items-center gap-1">
                        <Globe className="w-3 h-3" />
                        Link
                    </a>
                );
            }
        },
        {
            header: "Estado",
            key: "is_featured",
            render: (val: boolean, row: any) => (
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => toggleVerify(row)}
                        className={`p-1.5 rounded-full transition-colors ${row.is_verified ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-300 hover:bg-slate-200'}`}
                        title="Verificar Empresa"
                    >
                        <CheckCircle2 className="w-4 h-4" />
                    </button>
                    <div className="flex items-center gap-1.5 min-w-[30px]">
                        <button
                            onClick={() => toggleFeatured(row)}
                            className={`w-7 h-3.5 rounded-full relative transition-colors ${row.is_featured ? 'bg-amber-500' : 'bg-slate-200'}`}
                            title={row.is_featured ? "Destacada" : "Não Destacada"}
                        >
                            <div className={`absolute top-0.5 w-2.5 h-2.5 bg-white rounded-full transition-all ${row.is_featured ? 'translate-x-4' : 'translate-x-0.5'}`} />
                        </button>
                    </div>
                </div>
            )
        }
    ];

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">Empresas</h1>
                </div>

                <div className="flex flex-col md:flex-row items-center gap-3 w-full md:w-auto">
                    {/* Search Input */}
                    <div className="relative w-full md:w-64">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg className="h-4 w-4 text-slate-400" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <input
                            type="text"
                            placeholder="Pesquisar empresas..."
                            value={searchTerm}
                            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                            className="pl-10 pr-4 py-2 w-full bg-white border border-slate-200 rounded-lg text-sm outline-none focus:border-emerald-500 transition-colors"
                        />
                    </div>

                    {/* Filter Dropdown (Role/Type) */}
                    <div className="flex items-center gap-2 w-full md:w-auto">
                        <div className="relative flex-1 md:flex-none">
                            <select
                                value={filter}
                                onChange={(e) => { setFilter(e.target.value); setCurrentPage(1); }}
                                className="w-full bg-white border border-slate-200 text-slate-700 text-xs font-bold uppercase tracking-wide rounded-lg pl-4 pr-10 py-2 outline-none focus:border-emerald-500 h-10 appearance-none cursor-pointer"
                            >
                                <option value="Todas">Todos Tipos</option>
                                <option value="Públicas">Públicas</option>
                                <option value="Privadas">Privadas</option>
                                <option value="Internacionais">Internacionais</option>
                                <option value="Associações">Associações</option>
                                <option value="Destacadas">Destacadas</option>
                                <option value="Arquivadas">Arquivadas</option>
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                        </div>

                        {/* Category/Sector Dropdown */}
                        <div className="relative flex-1 md:flex-none">
                            <select
                                value={selectedCategory}
                                onChange={(e) => { setSelectedCategory(e.target.value); setCurrentPage(1); }}
                                className="w-full bg-white border border-slate-200 text-slate-700 text-xs font-bold uppercase tracking-wide rounded-lg pl-4 pr-10 py-2 outline-none focus:border-emerald-500 h-10 appearance-none cursor-pointer min-w-[150px]"
                            >
                                <option value="Todas">Todos Sectores</option>
                                {SECTORS.map(sec => (
                                    <option key={sec} value={sec}>{sec}</option>
                                ))}
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                        </div>

                        {/* Grid/List Toggle */}
                        <div className="flex items-center p-1 rounded-lg gap-1 shrink-0">
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
                            onClick={() => router.push('/admin/empresas/novo')}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold uppercase tracking-widest text-xs h-10 px-6 rounded-lg gap-2 shrink-0"
                        >
                            <Plus className="w-4 h-4" />
                            <span className="hidden md:inline">Nova Empresa</span>
                        </Button>
                    </div>
                </div>
            </div>

            {viewMode === 'list' ? (
                <>
                    <AdminDataTable
                        title={`Empresas (${filteredData.length})`}
                        columns={companyColumns}
                        data={paginatedData}
                        loading={loading}
                        onEdit={(row) => router.push(`/admin/empresas/${row.id}`)}
                        onDelete={handleDelete}
                        selectedIds={selectedIds}
                        onSelectRow={(id, selected) => {
                            if (selected) setSelectedIds(prev => [...prev, id]);
                            else setSelectedIds(prev => prev.filter(i => i !== id));
                        }}
                        onSelectAll={(all) => {
                            if (all) setSelectedIds(paginatedData.map(r => r.id));
                            else setSelectedIds([]);
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
                    />

                    {/* Pagination for List View */}
                    {totalPages > 1 && (
                        <div className="flex justify-center mt-6">
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    disabled={currentPage === 1}
                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                    className="text-xs"
                                >
                                    Anterior
                                </Button>
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                    <button
                                        key={page}
                                        onClick={() => setCurrentPage(page)}
                                        className={`w-8 h-8 flex items-center justify-center rounded-md text-xs font-bold transition-all ${currentPage === page
                                            ? 'bg-emerald-600 text-white shadow-sm'
                                            : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                                            }`}
                                    >
                                        {page}
                                    </button>
                                ))}
                                <Button
                                    variant="outline"
                                    disabled={currentPage === totalPages}
                                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                    className="text-xs"
                                >
                                    Seguinte
                                </Button>
                            </div>
                        </div>
                    )}
                </>
            ) : (
                /* GRID VIEW */
                loading ? (
                    <div className="flex justify-center py-20">
                        <Spinner className="h-8 w-8" />
                    </div>
                ) : filteredData.length === 0 ? (
                    <div className="text-center py-20 bg-slate-50 rounded-lg border-2 border-dashed border-slate-200">
                        <p className="text-slate-400 font-medium">Nenhuma empresa encontrada com estes filtros.</p>
                        <button
                            onClick={() => { setSearchTerm(""); setFilter("Todas"); setSelectedCategory("Todas"); }}
                            className="mt-2 text-emerald-600 text-sm font-bold hover:underline"
                        >
                            Limpar filtros
                        </button>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 3xl:grid-cols-5 4xl:grid-cols-6 gap-6">
                            {paginatedData.map((item) => (
                                <div key={item.id} className="bg-white rounded-lg border border-slate-100 hover:shadow-lg transition-all group relative overflow-hidden flex flex-col">

                                    {/* CARD COVER IMAGE */}
                                    <div
                                        onClick={() => router.push(`/admin/empresas/${item.id}`)}
                                        className="h-40 w-full bg-slate-100 relative cursor-pointer group/image"
                                    >
                                        {item.banner_url ? (
                                            <img src={item.banner_url} alt="Cover" className="w-full h-full object-cover transition-transform duration-500 group-hover/image:scale-105" />
                                        ) : (
                                            <div className="w-full h-full bg-gradient-to-r from-slate-100 to-slate-200 flex items-center justify-center">
                                                <Building2 className="text-slate-300 w-8 h-8" />
                                            </div>
                                        )}

                                        {/* Delete Overlay */}
                                        <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 p-1 rounded-lg shadow-sm z-20">
                                            <button
                                                onClick={(e) => { e.stopPropagation(); toggleArchive(item); }}
                                                className="p-1.5 hover:bg-orange-50 text-orange-600 rounded"
                                                title={item.is_archived ? "Repor" : "Arquivar"}
                                            >
                                                {item.is_archived ? <ArchiveRestore className="w-4 h-4" /> : <Archive className="w-4 h-4" />}
                                            </button>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handleDelete(item); }}
                                                className="p-1.5 hover:bg-rose-50 text-rose-600 rounded"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>

                                    {/* CARD CONTENT */}
                                    <div className="p-6 pt-0 flex-1 flex flex-col">
                                        {/* Avatar */}
                                        <div
                                            onClick={() => router.push(`/admin/empresas/${item.id}`)}
                                            className="-mt-10 mb-3 relative z-10 w-fit cursor-pointer hover:scale-105 transition-transform"
                                        >
                                            {item.logo_url ? (
                                                <img src={item.logo_url} alt={item.name} className="h-14 w-auto min-w-[56px] max-w-[140px] rounded-md object-contain bg-white p-1.5 shadow-sm border border-slate-100" />
                                            ) : (
                                                <div className="size-14 rounded-md bg-white border-4 border-white flex items-center justify-center text-slate-400 shadow-sm">
                                                    <Building2 className="w-6 h-6" />
                                                </div>
                                            )}
                                        </div>

                                        {/* Title & Subtitle */}
                                        <div className="flex items-center gap-3">

                                            <div className="flex-1 min-w-0">
                                                <h3
                                                    onClick={() => router.push(`/admin/empresas/${item.id}`)}
                                                    className="font-bold text-slate-900 line-clamp-1 text-lg cursor-pointer hover:text-emerald-600 transition-colors"
                                                >
                                                    {item.name}
                                                </h3>
                                                <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">
                                                    {item.category || item.activity || "Entidade"}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Info Grid */}
                                        <div className="mt-4 space-y-2 text-xs text-slate-500">
                                            {(item.contact || item.phone || item.secondary_contact) && (
                                                <div className="flex items-center gap-2">
                                                    <Phone className="w-3.5 h-3.5 text-emerald-500" />
                                                    {item.contact || item.phone || item.secondary_contact}
                                                </div>
                                            )}
                                            {(item.district || item.province || item.address) && (
                                                <div className="flex items-center gap-2">
                                                    <MapPin className="w-3.5 h-3.5 text-emerald-500" />
                                                    {[item.district, item.province].filter(Boolean).join(', ') || item.address}
                                                </div>
                                            )}
                                            {/* Show updated_at if the company was edited (different from created_at) */}
                                            {item.updated_at && item.updated_at !== item.created_at && (
                                                <div className="flex items-center gap-2 text-orange-500">
                                                    <Calendar className="w-3.5 h-3.5" />
                                                    <span className="font-medium">Editado: {new Date(item.updated_at).toLocaleDateString('pt-MZ', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                                                </div>
                                            )}
                                            <div className="flex items-center justify-between gap-1 pt-2 border-t border-slate-50 mt-2">
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="w-3.5 h-3.5 text-slate-300" />
                                                    <span className="text-slate-400 text-[10px]">
                                                        Registo: {new Date(item.created_at).toLocaleDateString('pt-MZ')}
                                                    </span>
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    <span className="text-[9px] font-bold text-slate-300 uppercase">Destaque</span>
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); toggleFeatured(item); }}
                                                        className={`w-7 h-4 rounded-full relative transition-colors ${item.is_featured ? 'bg-amber-500' : 'bg-slate-200'}`}
                                                    >
                                                        <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all shadow-sm ${item.is_featured ? 'translate-x-[14px]' : 'translate-x-[2px]'}`} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Footer */}
                                        <div className="mt-auto pt-4 flex items-center justify-between border-t border-slate-50/50">
                                            <div className="flex gap-2 items-center">
                                                <button
                                                    onClick={() => toggleVerify(item)}
                                                    className={`p-1 rounded-full ${item.is_verified ? 'text-emerald-500 bg-emerald-50' : 'text-slate-300 hover:text-emerald-500'}`}
                                                    title="Verificar"
                                                >
                                                    <CheckCircle2 className="w-4 h-4" />
                                                </button>
                                                {item.is_archived && <span className="bg-slate-600 text-white px-2 py-0.5 rounded text-[10px] font-bold">Arquivada</span>}
                                                {(item.plan === 'partner' || item.plan?.toLowerCase() === 'parceiro') && <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded text-[10px] font-bold">Parceiro</span>}
                                                {(item.plan?.toLowerCase() === 'premium' || item.plan?.toLowerCase() === 'profissional') && <span className="bg-orange-100 text-orange-600 px-2 py-0.5 rounded text-[10px] font-bold">Premium</span>}
                                                {item.plan?.toLowerCase() === 'básico' || item.plan?.toLowerCase() === 'basic' && <span className="bg-blue-100 text-blue-600 px-2 py-0.5 rounded text-[10px] font-bold">Básico</span>}
                                                {item.plan?.toLowerCase() === 'free' && <span className="bg-slate-100 text-slate-500 px-2 py-0.5 rounded text-[10px] font-bold">Free</span>}
                                                {(!item.plan || item.plan === '' || item.plan === null) && <span className="bg-slate-50 text-slate-400 px-2 py-0.5 rounded text-[10px] font-bold border border-slate-200">Sem Plano</span>}
                                            </div>

                                            <div className="flex items-center gap-2 ml-auto">
                                                <div className="flex items-center gap-2 mr-2 bg-slate-50 px-2 py-1 rounded-full border border-slate-100">
                                                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Verificado</span>
                                                    <button
                                                        onClick={() => toggleVerify(item)}
                                                        className={`w-7 h-4 rounded-full relative transition-colors ${item.is_verified ? 'bg-emerald-500' : 'bg-slate-200'}`}
                                                    >
                                                        <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all shadow-sm ${item.is_verified ? 'translate-x-[14px]' : 'translate-x-[2px]'}`} />
                                                    </button>
                                                </div>

                                                <button
                                                    onClick={() => router.push(`/admin/empresas/${item.id}`)}
                                                    className="w-8 h-8 flex items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white transition-all shadow-sm border border-emerald-100 hover:border-emerald-600"
                                                    title="Editar Detalhes"
                                                >
                                                    <Pencil className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {/* Add New Card - Only show on first page if space */}
                            {currentPage === 1 && (
                                <button
                                    onClick={() => router.push('/admin/empresas/novo')}
                                    className="bg-slate-50 rounded-lg border-2 border-dashed border-slate-200 flex flex-col items-center justify-center p-6 hover:border-emerald-500 hover:bg-emerald-50/50 transition-all group min-h-[200px]"
                                >
                                    <div className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                        <Plus className="w-6 h-6 text-emerald-500" />
                                    </div>
                                    <span className="font-bold text-slate-400 group-hover:text-emerald-600">
                                        Nova Empresa
                                    </span>
                                </button>
                            )}
                        </div>

                        {/* Pagination Controls */}
                        {totalPages > 1 && (
                            <div className="flex justify-center mt-10">
                                <div className="flex items-center gap-2 bg-white p-2 rounded-xl shadow-sm border border-slate-100">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        disabled={currentPage === 1}
                                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                        className="text-slate-500 hover:text-emerald-600"
                                    >
                                        Anterior
                                    </Button>

                                    <div className="flex items-center gap-1 px-2">
                                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                            <button
                                                key={page}
                                                onClick={() => setCurrentPage(page)}
                                                className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-bold transition-all ${currentPage === page
                                                    ? 'bg-emerald-600 text-white shadow-md scale-105'
                                                    : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'
                                                    }`}
                                            >
                                                {page}
                                            </button>
                                        ))}
                                    </div>

                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        disabled={currentPage === totalPages}
                                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                        className="text-slate-500 hover:text-emerald-600"
                                    >
                                        Seguinte
                                    </Button>
                                </div>
                            </div>
                        )}
                    </>
                )
            )}

            <ConfirmationModal
                isOpen={showDeleteConfirm}
                onClose={() => setShowDeleteConfirm(false)}
                onConfirm={confirmDelete}
                title="Eliminar Empresa"
                description={`Tem a certeza que deseja eliminar a empresa "${itemToProcess?.name}"? Esta ação não pode ser desfeita.`}
                confirmLabel="Eliminar"
                variant="destructive"
            />

            <ConfirmationModal
                isOpen={showPremiumConfirm}
                onClose={() => setShowPremiumConfirm(false)}
                onConfirm={confirmPremium}
                title="Ativar Plano Premium"
                description={`Deseja ativar o plano Premium para "${itemToProcess?.name}"?`}
                confirmLabel="Ativar"
                variant="default"
            />

            <ConfirmationModal
                isOpen={showBulkDeleteConfirm}
                onClose={() => setShowBulkDeleteConfirm(false)}
                onConfirm={confirmBulkDelete}
                title="Eliminar em Massa"
                description={`Tem a certeza que deseja eliminar ${selectedIds.length} empresas? Esta acção não pode ser desfeita.`}
                confirmLabel="Eliminar Todas"
                variant="destructive"
            />
        </div>
    );
}
