"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { PageHeader } from "@/components/PageHeader";
import { User, Search, LayoutGrid, List, UserPlus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

// Mock data - mesmo do painel admin
const MOCK_DATA: any[] = [];

export default function RepositorioProfissionaisPage() {
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [data, setData] = useState<any[]>(MOCK_DATA);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [professionFilter, setProfessionFilter] = useState("all");

    useEffect(() => {
        async function fetchData() {
            setLoading(true);
            const { data: dbData, error } = await supabase
                .from('professionals')
                .select('*')
                .neq('status', 'deleted')
                .neq('status', 'inactive')
                .order('name', { ascending: true });

            if (error) {
                console.error('Erro ao carregar dados:', error);
            } else {
                const normalizedDbData = (dbData || []).map((item: any) => ({
                    ...item,
                    status: item.status || 'active'
                }));

                // Combinar mock data com dados reais da BD
                const combinedData = [...MOCK_DATA, ...normalizedDbData]
                    .filter((item: any) => item.status === 'active' || !item.status)
                    .sort((a: any, b: any) => a.name.localeCompare(b.name));

                setData(combinedData);
            }
            setLoading(false);
        }

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

        return matchesSearch && matchesProfession;
    });

    return (
        <div className="min-h-screen bg-slate-50">
            <PageHeader
                title="Profissionais"
                backgroundImage="https://images.unsplash.com/photo-1560493676-04071c5f467b?q=80&w=2000&auto=format&fit=crop"
                breadcrumbs={[
                    { label: "Início", href: "/" },
                    { label: "Repositório", href: "/repositorio" },
                    { label: "Profissionais", href: undefined }
                ]}
            />

            <main className="container-site py-12">
                {/* Header Bar - igual ao admin */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">Gestão de Profissionais</h1>
                    </div>

                    <div className="flex items-center flex-wrap gap-2">
                        {/* Profession Filter */}
                        <Select value={professionFilter} onValueChange={setProfessionFilter}>
                            <SelectTrigger className="w-[160px] h-10 bg-white border-slate-200 text-xs font-bold uppercase tracking-wider">
                                <SelectValue placeholder="Profissão" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todas</SelectItem>
                                {professions.map(p => (
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
                    </div>
                </div>

                {/* Content */}
                {viewMode === 'list' ? (
                    /* LIST VIEW */
                    loading ? (
                        <div className="flex justify-center py-20">
                            <Spinner className="h-8 w-8" />
                        </div>
                    ) : filteredData.length === 0 ? (
                        <div className="text-center py-20 text-slate-400 italic">
                            Nenhum profissional encontrado.
                        </div>
                    ) : (
                        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-slate-50 border-b border-slate-100">
                                        <th className="text-left px-6 py-4 text-xs font-black uppercase tracking-wider text-slate-500">Nome</th>
                                        <th className="text-left px-6 py-4 text-xs font-black uppercase tracking-wider text-slate-500">Profissão</th>
                                        <th className="text-left px-6 py-4 text-xs font-black uppercase tracking-wider text-slate-500 hidden md:table-cell">Email</th>
                                        <th className="text-left px-6 py-4 text-xs font-black uppercase tracking-wider text-slate-500 hidden lg:table-cell">Telefone</th>
                                        <th className="text-left px-6 py-4 text-xs font-black uppercase tracking-wider text-slate-500 hidden lg:table-cell">Localização</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredData.map((item) => (
                                        <tr key={item.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200 shrink-0 overflow-hidden">
                                                        {item.photo_url ? (
                                                            <img src={item.photo_url} alt={item.name} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <User className="w-4 h-4 text-slate-400" />
                                                        )}
                                                    </div>
                                                    <Link href={`/repositorio/profissionais/${item.id}`} className="hover:text-emerald-600 transition-colors">
                                                        <span className="font-bold text-slate-800 whitespace-nowrap">{item.name}</span>
                                                    </Link>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-xs font-semibold bg-emerald-50 text-emerald-700 px-2 py-1 rounded-full uppercase whitespace-nowrap">
                                                    {item.profession || "Não inf."}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-slate-600 hidden md:table-cell">{item.email}</td>
                                            <td className="px-6 py-4 text-sm text-slate-600 hidden lg:table-cell">{item.phone}</td>
                                            <td className="px-6 py-4 text-sm text-slate-600 hidden lg:table-cell">{item.location}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )
                ) : (
                    /* GRID VIEW */
                    loading ? (
                        <div className="flex justify-center py-20">
                            <Spinner className="h-8 w-8" />
                        </div>
                    ) : filteredData.length === 0 ? (
                        <div className="text-center py-20 text-slate-400 italic">
                            Nenhum profissional encontrado.
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 3xl:grid-cols-5 4xl:grid-cols-6 gap-6">
                            {filteredData.map((item) => (
                                <Link
                                    key={item.id}
                                    href={`/repositorio/profissionais/${item.id}`}
                                    className="bg-white rounded-2xl border border-slate-100 hover:shadow-xl hover:border-emerald-100 transition-all group relative overflow-hidden p-6 flex flex-col items-center text-center shadow-sm"
                                >
                                    {/* Avatar */}
                                    <div className="w-20 h-20 rounded-full bg-slate-50 border-4 border-white shadow-sm flex items-center justify-center mb-4 overflow-hidden shrink-0">
                                        {item.photo_url ? (
                                            <img src={item.photo_url} alt={item.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <User className="w-8 h-8 text-slate-300" />
                                        )}
                                    </div>

                                    {/* Name */}
                                    <h3 className="font-bold text-slate-900 text-lg mb-1 leading-tight">{item.name}</h3>

                                    {/* Profession Badge */}
                                    <p className="text-[10px] font-black uppercase text-emerald-600 tracking-wider mb-2 bg-emerald-50 px-3 py-1 rounded-full">
                                        {item.profession || item.role || "Profissional"}
                                    </p>

                                    {/* Contact info */}
                                    {item.phone && (
                                        <p className="text-xs text-slate-400 font-medium mt-2">{item.phone}</p>
                                    )}
                                    {item.email && (
                                        <p className="text-xs text-slate-400 font-medium truncate max-w-full">{item.email}</p>
                                    )}

                                    {/* Action Arrow - visible on hover */}
                                    <div className="mt-4 pt-4 border-t border-slate-50 w-full flex justify-center text-emerald-600 font-bold text-[10px] uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                                        Ver Perfil Completo
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )
                )}

                {/* Banner de Convite para Registo */}
                <div className="mt-12 bg-gradient-to-r from-emerald-800 via-emerald-700 to-emerald-900 rounded-2xl p-8 md:p-10 relative overflow-hidden">
                    {/* Background decoration */}
                    <div className="absolute inset-0 opacity-5">
                        <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full -translate-y-1/2 translate-x-1/3"></div>
                        <div className="absolute bottom-0 left-0 w-64 h-64 bg-white rounded-full translate-y-1/2 -translate-x-1/3"></div>
                    </div>

                    <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                        {/* Text - Left */}
                        <div className="flex-1">
                            <p className="text-emerald-300 text-[10px] font-black uppercase tracking-[0.3em] mb-2">Junte-se à nossa rede</p>
                            <h2 className="text-2xl md:text-3xl font-black text-white mb-2">É profissional do sector agrário?</h2>
                            <p className="text-emerald-200 text-sm md:text-base max-w-lg">
                                Registe-se gratuitamente e conecte-se com empresas, agricultores e oportunidades em todo Moçambique.
                            </p>
                        </div>

                        {/* Button - Right */}
                        <div className="shrink-0">
                            <Link href="/servicos/registo-talento">
                                <Button className="bg-white hover:bg-slate-50 text-emerald-800 font-black uppercase tracking-widest text-xs h-12 px-8 rounded-xl shadow-lg shadow-emerald-950/40 gap-2 w-full md:w-auto">
                                    <UserPlus className="w-4 h-4" />
                                    Registe-se Já
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
