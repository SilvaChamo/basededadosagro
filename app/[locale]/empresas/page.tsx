"use client";

import React, { useEffect, useState } from "react";
import { StandardBlogTemplate } from "@/components/StandardBlogTemplate";
import { Building2, MapPin, CheckCircle2, ArrowRight, Search, ShieldCheck } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import { SECTORS, SECTOR_CATEGORIES, COMPANY_SIZES, MOZ_DATA } from "@/lib/agro-data";
import { CompanyCard } from "@/components/CompanyCard";

export default function EmpresasPage() {
    const supabase = createClient();
    const [companies, setCompanies] = useState<any[]>([]);
    const [filteredCompanies, setFilteredCompanies] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Filter states
    const [selectedSector, setSelectedSector] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("");
    const [selectedSize, setSelectedSize] = useState("");
    const [selectedProvince, setSelectedProvince] = useState("");
    const [showFeaturedOnly, setShowFeaturedOnly] = useState(false);

    useEffect(() => {
        async function fetchCompanies() {
            try {
                const { data, error } = await supabase
                    .from('companies')
                    .select('*')
                    .eq('is_archived', false)
                    .order('created_at', { ascending: false });

                if (error) throw error;
                setCompanies(data || []);
                setFilteredCompanies(data || []);
            } catch (err) {
                console.error("Error fetching companies:", err);
            } finally {
                setLoading(false);
            }
        }
        fetchCompanies();
    }, []);

    const handleApplyFilters = () => {
        let filtered = [...companies];

        if (selectedSector) {
            filtered = filtered.filter((c: any) => c.category === selectedSector);
        }
        if (selectedCategory) {
            filtered = filtered.filter((c: any) => c.sub_category === selectedCategory);
        }
        if (selectedSize) {
            filtered = filtered.filter((c: any) => c.size === selectedSize);
        }
        if (selectedProvince) {
            filtered = filtered.filter((c: any) => c.province === selectedProvince);
        }
        if (showFeaturedOnly) {
            filtered = filtered.filter((c: any) => c.is_featured || c.plan === 'Parceiro' || c.plan === 'Partner');
        }

        setFilteredCompanies(filtered);
    };

    return (
        <StandardBlogTemplate
            title="Repositório de Empresas"
            breadcrumbs={[
                { label: "Início", href: "/" },
                { label: "Repositório", href: "/repositorio" },
                { label: "Empresas", href: undefined }
            ]}
            sidebarComponents={
                <div className="space-y-agro">
                    {/* Filters Card */}
                    <div className="card-agro-static bg-white border-2 border-emerald-500/15 shadow-[0_20px_50px_rgba(0,0,0,0.08)] ring-1 ring-slate-200/50">
                        <h4 className="flex items-center gap-2 mb-6 text-slate-800 font-black uppercase text-xs tracking-tighter">
                            <Search className="w-4 h-4 text-[#f97316]" />
                            Filtrar por Sectores
                        </h4>

                        <div className="space-y-5">
                            {/* Featured Toggle */}
                            <div className="flex items-center justify-between bg-slate-50 p-3 rounded-lg border border-slate-100 shadow-inner">
                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                    <CheckCircle2 className="w-3 h-3 text-[#f97316]" />
                                    Apenas Destaques
                                </span>
                                <button
                                    onClick={() => setShowFeaturedOnly(!showFeaturedOnly)}
                                    className={`w-8 h-4 rounded-full relative transition-colors ${showFeaturedOnly ? 'bg-[#f97316]' : 'bg-slate-300'}`}
                                >
                                    <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all shadow-sm ${showFeaturedOnly ? 'translate-x-[18px]' : 'translate-x-[2px]'}`} />
                                </button>
                            </div>

                            {/* 1. Sector (Chapéu) */}
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Sector Principal</label>
                                <select
                                    value={selectedSector}
                                    onChange={(e) => {
                                        setSelectedSector(e.target.value);
                                        setSelectedCategory(""); // Reset sub-category
                                    }}
                                    className="w-full h-10 rounded-lg border border-slate-100 text-[13px] font-bold text-slate-700 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all outline-none px-3 bg-slate-50 shadow-inner"
                                >
                                    <option value="">Todos os Sectores</option>
                                    {SECTORS.map((s: any) => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>

                            {/* 2. Categoria (Específica) - Activa apenas se houver sector */}
                            {selectedSector && SECTOR_CATEGORIES[selectedSector] && (
                                <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                                    <label className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-2 block animate-pulse">Especifique a Categoria</label>
                                    <select
                                        value={selectedCategory}
                                        onChange={(e) => setSelectedCategory(e.target.value)}
                                        className="w-full h-10 rounded-lg border-2 border-emerald-100/50 text-[13px] font-bold text-slate-700 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all outline-none px-3 bg-emerald-50/30"
                                    >
                                        <option value="">Todas de {selectedSector}</option>
                                        {SECTOR_CATEGORIES[selectedSector].map((cat: any) => (
                                            <option key={cat} value={cat}>{cat}</option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            {/* 3. Província */}
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Província</label>
                                <select
                                    value={selectedProvince}
                                    onChange={(e) => setSelectedProvince(e.target.value)}
                                    className="w-full h-10 rounded-lg border border-slate-100 text-[13px] font-bold text-slate-700 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all outline-none px-3 bg-slate-50 shadow-inner"
                                >
                                    <option value="">Todas as Províncias</option>
                                    {Object.keys(MOZ_DATA).map((p: any) => <option key={p} value={p}>{p}</option>)}
                                </select>
                            </div>

                            {/* 4. Dimensão */}
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Dimensão (Tamanho)</label>
                                <select
                                    value={selectedSize}
                                    onChange={(e) => setSelectedSize(e.target.value)}
                                    className="w-full h-10 rounded-lg border border-slate-100 text-[13px] font-bold text-slate-700 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all outline-none px-3 bg-slate-50 shadow-inner"
                                >
                                    <option value="">Qualquer Dimensão</option>
                                    {COMPANY_SIZES.map((sz: any) => <option key={sz} value={sz}>{sz}</option>)}
                                </select>
                            </div>

                            <button
                                onClick={handleApplyFilters}
                                className="group relative w-full h-11 bg-emerald-600 border-none rounded-md overflow-hidden transition-all hover:bg-[#f97316] active:scale-95 shadow-lg shadow-emerald-100"
                            >
                                <span className="relative z-10 text-xs font-black text-white uppercase tracking-widest flex items-center justify-center gap-2">
                                    Aplicar Filtros
                                </span>
                            </button>
                        </div>
                    </div>

                    {/* Stats Card */}
                    <div className="card-agro-static bg-gradient-to-br from-emerald-600 to-emerald-800 text-center py-5 border-none shadow-xl shadow-emerald-200/50">
                        <p className="text-4xl font-black text-white tracking-tighter mb-1">
                            {loading ? "..." : filteredCompanies.length}
                        </p>
                        <p className="text-[9px] font-black text-white/60 uppercase tracking-widest">
                            Empresas Encontradas
                        </p>
                    </div>
                </div>
            }
        >
            <div className="space-y-8 pb-10">
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 3xl:grid-cols-5 4xl:grid-cols-6 gap-agro">
                        {[1, 2, 3, 4, 5, 6].map((i: any) => (
                            <div key={i} className="h-[280px] bg-slate-50 animate-pulse rounded-agro border border-slate-100" />
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 3xl:grid-cols-5 4xl:grid-cols-6 gap-agro">
                        {filteredCompanies.map((company: any) => (
                            <CompanyCard
                                key={company.id}
                                company={{
                                    id: company.id,
                                    slug: company.slug,
                                    name: company.name,
                                    tag: company.sub_category || company.category,
                                    description: company.activity || company.bio || "",
                                    logoUrl: company.logo_url || "",
                                    type: company.type || "Empresa",
                                    image: company.banner_url || "",
                                    isVerified: company.is_verified || company.is_featured || company.plan === 'Parceiro' || company.plan === 'Partner',
                                    province: company.province,
                                    valueChain: company.value_chain
                                }}
                            />
                        ))}
                        {filteredCompanies.length === 0 && (
                            <div className="col-span-full py-20 text-center">
                                <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-dashed border-slate-200">
                                    <Search className="w-8 h-8 text-slate-300" />
                                </div>
                                <h3 className="text-lg font-bold text-slate-800">Nenhuma empresa encontrada</h3>
                                <p className="text-slate-500 text-sm">Tente ajustar os seus filtros de pesquisa.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </StandardBlogTemplate>
    );
}
