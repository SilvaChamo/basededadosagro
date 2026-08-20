"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { StandardBlogTemplate } from "@/components/StandardBlogTemplate";
import { LandPlot, Search, MapPin, ArrowRight, Maximize2, Tag, Building2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/utils/supabase/client";

function PropertiesContent() {
    const supabase = createClient();
    const searchParams = useSearchParams();
    const empresaId = searchParams.get("empresa_id");
    const initialQuery = searchParams.get("q") || "";

    const [properties, setProperties] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState(initialQuery);
    const [contextName, setContextName] = useState<string | null>(null);

    useEffect(() => {
        async function fetchData() {
            setLoading(true);
            try {
                // 1. Handle Context Name
                if (empresaId) {
                    const { data: company } = await supabase
                        .from('companies')
                        .select('name')
                        .eq('id', empresaId)
                        .single();
                    if (company) setContextName(company.name);
                }

                // 2. Fetch Properties
                let query = supabase.from('properties').select('*');

                if (empresaId) {
                    query = query.eq('company_id', empresaId);
                }

                const { data, error } = await query.order('created_at', { ascending: false });

                if (error) throw error;
                setProperties(data || []);
            } catch (error) {
                console.error("Error fetching properties:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, [empresaId]);

    const filteredProperties = properties.filter(p =>
        (p.title || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.location || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.description || "").toLowerCase().includes(searchQuery.toLowerCase())
    );

    const pageTitle = contextName ? `Propriedades de ${contextName}` : "Propriedades e Terras";

    return (
        <StandardBlogTemplate
            title={pageTitle}
            icon={LandPlot}
            backgroundImage="https://images.unsplash.com/photo-1500382017468-9049fee74a62?q=80&w=2000&auto=format&fit=crop"
            breadcrumbs={[
                { label: "Início", href: "/" },
                { label: "Repositório", href: "/repositorio" },
                { label: contextName ? "Propriedades" : "Terras", href: contextName ? "/propriedades" : undefined },
                { label: contextName || "Ver Todas", href: undefined }
            ]}
            sidebarComponents={
                <div className="space-y-agro">
                    <div className="bg-white p-6 rounded-[15px] border border-slate-100 shadow-sm">
                        <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-4">Filtrar</h3>
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Localização ou tipo..."
                                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-[10px] text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        </div>
                    </div>

                    {getSidebarCTA(contextName)}
                </div>
            }
        >
            <div className="grid grid-cols-1 md:grid-cols-3 2xl:grid-cols-4 3xl:grid-cols-5 4xl:grid-cols-6 gap-5">
                {loading ? (
                    Array(4).fill(0).map((_, i) => (
                        <div key={i} className="animate-pulse bg-white rounded-[15px] h-[300px]" />
                    ))
                ) : filteredProperties.length > 0 ? (
                    filteredProperties.map((prop) => (
                        <div key={prop.id} className="group bg-white rounded-[15px] border border-slate-100 shadow-md hover:shadow-xl transition-all overflow-hidden flex flex-col card-interactive">
                            <div className="relative h-56">
                                <Image
                                    src={prop.image_url || "https://images.unsplash.com/photo-1500382017468-9049fee74a62?q=80&w=800"}
                                    alt={prop.title}
                                    fill
                                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                                />
                                <div className="absolute top-4 left-4 px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-[10px] font-black uppercase tracking-widest shadow-lg">
                                    {prop.type || "Fazenda"}
                                </div>
                            </div>
                            <div className="p-6 flex-1 flex flex-col">
                                <div className="flex items-center gap-2 text-slate-400 text-[10px] font-black uppercase tracking-widest mb-2">
                                    <MapPin className="w-3.5 h-3.5 text-rose-500" />
                                    {prop.location || "Moçambique"}
                                </div>
                                <h3 className="text-xl font-black text-slate-800 mb-3 group-hover:text-emerald-600 transition-colors uppercase leading-tight line-clamp-2">{prop.title}</h3>

                                <div className="flex items-center gap-4 mb-6 pt-4 border-t border-slate-50">
                                    <div className="flex items-center gap-2">
                                        <Maximize2 className="w-4 h-4 text-slate-300" />
                                        <span className="text-xs font-bold text-slate-600">{prop.size || "100"} ha</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Tag className="w-4 h-4 text-slate-300" />
                                        <span className="text-xs font-bold text-slate-600">{prop.status || "Venda"}</span>
                                    </div>
                                </div>

                                <div className="mt-auto flex items-center justify-between">
                                    <div className="text-xl font-black text-emerald-600">
                                        {prop.price ? `${prop.price} MT` : "Sob Consulta"}
                                    </div>
                                    <button className="text-xs font-bold text-slate-700 hover:text-[#f97316] flex items-center gap-2 transition-colors">
                                        Mais detalhes <ArrowRight className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="col-span-full py-20 text-center text-slate-400 bg-white rounded-[20px] border border-dashed border-slate-200">
                        <LandPlot className="w-12 h-12 mx-auto mb-4 opacity-20" />
                        <p className="font-medium text-sm">Nenhuma propriedade encontrada nesta categoria.</p>
                    </div>
                )}
            </div>
        </StandardBlogTemplate>
    );
}

function getSidebarCTA(contextName: string | null) {
    if (contextName) {
        return (
            <Link href="/propriedades" className="block p-4 bg-slate-50 border border-slate-200 rounded-[10px] text-center text-xs font-black uppercase text-slate-500 hover:bg-slate-100 transition-colors">
                Ver Todas as Propriedades
            </Link>
        );
    }
    return (
        <div className="bg-orange-50 border border-orange-100 p-5 rounded-[15px] space-y-4">
            <p className="text-[10px] font-black text-orange-600 uppercase tracking-widest leading-none">Anunciar Terras</p>
            <p className="text-sm text-orange-900 font-medium leading-relaxed">Tem uma propriedade para vender ou alugar? Publique agora.</p>
            <button className="w-full py-3 bg-[#111827] text-white text-xs font-bold rounded-[10px] hover:bg-slate-800 transition-all shadow-lg">
                Começar Anúncio
            </button>
        </div>
    );
}

export default function PropertiesPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-slate-50 animate-pulse" />}>
            <PropertiesContent />
        </Suspense>
    );
}
