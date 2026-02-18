"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";
import {
    Store, Plus, Search, Filter, MoreHorizontal,
    Edit, Trash2, MapPin, Eye, Loader2, ChevronDown,
    Archive, ArchiveRestore
} from "lucide-react";
import { STORE_CATEGORIES } from "@/lib/agro-data";

export default function AdminLojasPage() {
    const [stores, setStores] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("Todas");
    const [viewState, setViewState] = useState<'active' | 'archived' | 'trash'>('active');
    const supabase = createClient();

    const fetchStores = async () => {
        try {
            setIsLoading(true);
            let query = supabase
                .from('companies')
                .select('*')
                .eq('type', 'Loja');

            if (viewState === 'trash') {
                query = query.eq('is_deleted', true);
            } else if (viewState === 'archived') {
                query = query.eq('is_archived', true).eq('is_deleted', false);
            } else {
                query = query.eq('is_archived', false).eq('is_deleted', false);
            }

            const { data, error } = await query.order('created_at', { ascending: false });

            if (error) {
                console.error('Error fetching stores:', error);
                toast.error("Erro ao carregar lojas.");
            } else {
                setStores(data || []);
            }
        } catch (err) {
            console.error('Exception in fetchStores:', err);
            toast.error("Ocorreu um erro inesperado.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchStores();

        // Safety timeout: if it takes more than 10s, stop loading
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 10000);

        return () => clearTimeout(timer);
    }, []);

    const handleDelete = async (id: string) => {
        if (viewState === 'trash') {
            if (!confirm("Tem certeza que deseja excluir PERMANENTEMENTE esta loja? Esta ação não pode ser desfeita.")) return;
            const { error } = await supabase.from('companies').delete().eq('id', id);
            if (error) toast.error("Erro ao excluir permanentemente.");
            else { toast.success("Loja excluída permanentemente."); fetchStores(); }
        } else {
            if (!confirm("Tem certeza que deseja enviar esta loja para a lixeira?")) return;
            const { error } = await supabase.from('companies').update({ is_deleted: true }).eq('id', id);
            if (error) toast.error("Erro ao enviar para a lixeira.");
            else { toast.success("Loja enviada para a lixeira."); fetchStores(); }
        }
    };

    const restoreItem = async (id: string) => {
        const { error } = await supabase
            .from('companies')
            .update({ is_deleted: false, is_archived: false })
            .eq('id', id);

        if (error) toast.error("Erro ao restaurar loja.");
        else { toast.success("Loja restaurada com sucesso."); fetchStores(); }
    };

    const toggleArchive = async (row: any) => {
        try {
            const { error } = await supabase
                .from('companies')
                .update({ is_archived: !row.is_archived })
                .eq('id', row.id);

            if (error) throw error;

            toast.success(row.is_archived ? "Loja reposta com sucesso!" : "Loja arquivada com sucesso!");
            fetchStores();
        } catch (err: any) {
            console.error('Error toggling archive:', err);
            toast.error("Erro ao alterar estado de arquivamento.");
        }
    };

    const toggleStatus = async (row: any) => {
        try {
            const { error } = await supabase
                .from('companies')
                .update({ is_active: !row.is_active })
                .eq('id', row.id);

            if (error) throw error;

            toast.success(row.is_active ? "Loja fechada com sucesso!" : "Loja aberta com sucesso!");
            fetchStores();
        } catch (err: any) {
            console.error('Error toggling status:', err);
            toast.error("Erro ao alterar estado da loja.");
        }
    };

    const filteredStores = stores.filter(store => {
        try {
            const search = searchTerm.toLowerCase();
            const matchesSearch = (
                (store.name?.toLowerCase() || "").includes(search) ||
                (store.category?.toLowerCase() || "").includes(search) ||
                (store.location?.toLowerCase() || "").includes(search)
            );

            const matchesCategory = selectedCategory === "Todas" || store.category === selectedCategory;

            return matchesSearch && matchesCategory;
        } catch (e) {
            console.error("Filter error:", e);
            return false;
        }
    });

    return (
        <div className="space-y-8">
            {/* Top Bar: Search, Filter and Actions */}
            <div className="bg-white p-2 rounded-lg shadow-sm border border-slate-200 flex flex-col md:flex-row gap-2 items-center">
                <div className="flex-1 relative w-full">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Buscar por nome, categoria ou local..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-11 pr-4 py-2 text-sm bg-white rounded-lg border border-slate-200 focus:ring-2 focus:ring-orange-500/10 focus:border-orange-500 outline-none transition-all placeholder:text-slate-400"
                    />
                </div>

                <div className="relative min-w-[200px] w-full md:w-auto">
                    <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="w-full pl-4 pr-10 py-2 text-sm bg-white rounded-lg border border-slate-200 focus:ring-2 focus:ring-orange-500/10 focus:border-orange-500 outline-none transition-all appearance-none cursor-pointer font-medium text-slate-700"
                    >
                        <option value="Todas">Todas categorias</option>
                        {STORE_CATEGORIES.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                </div>

                <div className="flex items-center bg-slate-100 p-1 rounded-lg gap-1">
                    <button
                        onClick={() => setViewState('active')}
                        className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${viewState === 'active' ? 'bg-white text-orange-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        Ativas
                    </button>
                    <button
                        onClick={() => setViewState('archived')}
                        className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${viewState === 'archived' ? 'bg-white text-orange-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        Arquivadas
                    </button>
                    <button
                        onClick={() => setViewState('trash')}
                        className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${viewState === 'trash' ? 'bg-white text-red-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        Lixeira
                    </button>
                </div>

                <button className="px-4 py-2 border border-slate-200 rounded-lg text-slate-600 hover:text-orange-500 hover:border-orange-200 transition-all flex items-center justify-center gap-2 font-bold text-xs uppercase tracking-wider w-full md:w-auto">
                    <Filter className="w-4 h-4" />
                    <span>Filtros</span>
                </button>

                <Link
                    href="/admin/lojas/novo"
                    className="flex items-center justify-center gap-2 px-6 py-2 bg-emerald-600 hover:bg-orange-500 text-white font-bold rounded-lg transition-all shadow-lg shadow-emerald-500/10 w-full md:w-auto whitespace-nowrap"
                >
                    <Plus className="w-4 h-4" />
                    Nova Loja
                </Link>
            </div>

            {/* Content */}
            {isLoading ? (
                <div className="flex justify-center py-20">
                    <Loader2 className="w-10 h-10 animate-spin text-orange-500" />
                </div>
            ) : filteredStores.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-300">
                    <Store className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-slate-700 mb-2">Nenhuma loja encontrada</h3>
                    <p className="text-slate-500 mb-6 max-w-sm mx-auto">
                        Comece adicionando a primeira loja parceira à plataforma.
                    </p>
                    <Link
                        href="/admin/lojas/novo"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-all"
                    >
                        <Plus className="w-4 h-4" />
                        Adicionar Loja
                    </Link>
                </div>
            ) : (
                <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 border-b border-slate-100">
                                <tr>
                                    <th className="px-6 py-4 text-xs font-black uppercase tracking-wider text-slate-500">Loja</th>
                                    <th className="px-6 py-4 text-xs font-black uppercase tracking-wider text-slate-500">Categoria</th>
                                    <th className="px-6 py-4 text-xs font-black uppercase tracking-wider text-slate-500">Localização</th>
                                    <th className="px-6 py-4 text-xs font-black uppercase tracking-wider text-slate-500">Status</th>
                                    <th className="px-6 py-4 text-xs font-black uppercase tracking-wider text-slate-500 text-right">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredStores.map((store) => (
                                    <tr key={store.id} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-lg bg-orange-50 border border-orange-100 flex items-center justify-center shrink-0 overflow-hidden">
                                                    {store.image_url || store.logo_url ? (
                                                        <img src={store.image_url || store.logo_url} alt="" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <Store className="w-5 h-5 text-orange-500" />
                                                    )}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-slate-900 group-hover:text-orange-600 transition-colors">{store.name || "Sem nome"}</div>
                                                    <div className="text-xs text-slate-400 font-medium">
                                                        Criado em {store.created_at ? new Date(store.created_at).toLocaleDateString() : "Data n/a"}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-bold whitespace-nowrap">
                                                {store.category}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 text-sm text-slate-500">
                                                <MapPin className="w-4 h-4 text-slate-400" />
                                                {store.location}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <button
                                                onClick={() => toggleStatus(store)}
                                                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border transition-all hover:scale-105 ${store.is_active
                                                    ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                                                    : 'bg-red-50 text-red-600 border-red-100'
                                                    }`}
                                            >
                                                <span className={`w-1.5 h-1.5 rounded-full ${store.is_active ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
                                                {store.is_active ? 'Aberto' : 'Fechado'}
                                            </button>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                {viewState === 'active' ? (
                                                    <>
                                                        <Link
                                                            href={`/admin/lojas/${store.id}`}
                                                            className="p-2 text-slate-400 hover:text-orange-500 hover:bg-orange-50 rounded-lg transition-all"
                                                            title="Editar"
                                                        >
                                                            <Edit className="w-4 h-4" />
                                                        </Link>
                                                        <button
                                                            onClick={() => toggleArchive(store)}
                                                            className="p-2 text-slate-400 hover:text-orange-500 hover:bg-orange-50 rounded-lg transition-all"
                                                            title="Arquivar"
                                                        >
                                                            <Archive className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(store.id)}
                                                            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                                            title="Excluir"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </>
                                                ) : (
                                                    <>
                                                        <button
                                                            onClick={() => restoreItem(store.id)}
                                                            className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all flex items-center gap-1 text-xs font-bold"
                                                            title="Restaurar"
                                                        >
                                                            <ArchiveRestore className="w-4 h-4" />
                                                            Restaurar
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(store.id)}
                                                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                                            title="Excluir Permanentemente"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
