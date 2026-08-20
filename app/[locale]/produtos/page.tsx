"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { StandardBlogTemplate } from "@/components/StandardBlogTemplate";
import { ShoppingBag, Search, ArrowRight, Building2, Sprout, Truck, Droplets, Zap } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/utils/supabase/client";
import { MarketPriceTable } from "@/components/MarketPriceTable";


function ProductsContent() {
    const supabase = createClient();
    const searchParams = useSearchParams();
    const router = useRouter();
    const empresaId = searchParams.get("empresa_id");
    const professionalId = searchParams.get("professional_id");
    const initialQuery = searchParams.get("q") || "";

    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState(initialQuery);
    const [contextName, setContextName] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 12;
    // Persist tab in URL
    const activeTab = searchParams.get("tab") === 'mercado' ? 'Mercado' : 'Empresas';

    const setActiveTab = (tab: 'Empresas' | 'Mercado') => {
        const params = new URLSearchParams(searchParams.toString());
        if (tab === 'Mercado') params.set("tab", "mercado");
        else params.delete("tab");
        router.push(`/produtos?${params.toString()}`);
    };

    const slugify = (text: string) => (text || "").toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '');

    useEffect(() => {
        async function fetchData() {
            setLoading(true);
            try {
                let allItems: any[] = [];
                let cName: string | null = null;

                // 1. Handle Context Name
                if (empresaId) {
                    const { data: company } = await supabase
                        .from('companies')
                        .select('name, slug')
                        .eq('id', empresaId)
                        .single();

                    if (company) {
                        cName = company.name;
                    }
                } else if (professionalId) {
                    const { data: pro } = await supabase
                        .from('professionals')
                        .select('name')
                        .eq('id', professionalId)
                        .single();
                    if (pro) cName = pro.name;
                }

                setContextName(cName);

                // 2. Fetch Products from companies only
                let query = supabase
                    .from('products')
                    .select('*, companies(slug, name)')
                    .not('company_id', 'is', null)
                    .order('created_at', { ascending: false });

                if (empresaId) {
                    query = query.eq('company_id', empresaId);
                } else if (professionalId) {
                    query = query.eq('professional_id', professionalId);
                }

                const { data, error } = await query;
                if (error) throw error;

                if (data) {
                    allItems = data
                        .filter((p: any) => {
                            const cat = (p.category || "").toLowerCase();
                            // Strict filtering: no services in products page
                            return !cat.includes('serviço') &&
                                !cat.includes('consultoria') &&
                                !cat.includes('logística');
                        })
                        .map((p: any) => ({
                            ...p,
                            nome: p.name || p.nome,
                            preco: p.price || p.preco || "Sob Consulta",
                            image_url: p.image_url || p.imagem || "https://images.unsplash.com/photo-1595152248447-c93d5006b00b?q=80&w=400",
                            company_slug: p.companies?.slug,
                            company_name: p.companies?.name
                        }));
                }

                setProducts(allItems);
            } catch (error) {
                console.error("Error fetching products:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, [empresaId, professionalId]);

    // Reset page to 1 when search query changes
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery]);

    const filteredProducts = products.filter((p: any) => {
        const query = searchQuery.toLowerCase();
        // Strict category filtering for main navigation links
        if (query === 'insumo' || query === 'insumos') {
            return (p.category || "").toLowerCase() === 'insumo';
        }
        if (query === 'tecnologia' || query === 'tecnologias') {
            return (p.category || "").toLowerCase() === 'tecnologia';
        }
        if (query === 'financiamento') {
            return (p.category || "").toLowerCase() === 'financiamento';
        }
        if (query === 'turismo') {
            return (p.category || "").toLowerCase() === 'turismo';
        }

        // Default broad search
        return (p.nome || "").toLowerCase().includes(query) ||
            (p.category || "").toLowerCase().includes(query) ||
            (p.description || "").toLowerCase().includes(query);
    });

    // Pagination Logic
    const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedProducts = filteredProducts.slice(startIndex, startIndex + itemsPerPage);

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        window.scrollTo({ top: 300, behavior: 'smooth' });
    };

    const pageTitle = contextName ? `Produtos de ${contextName}` :
        (searchQuery === 'insumo' ? 'Insumos Agrários' :
            searchQuery === 'tecnologia' ? 'Tecnologias Agrárias' :
                searchQuery === 'financiamento' ? 'Financiamento Agrário' :
                    searchQuery === 'turismo' ? 'Turismo Rural' :
                        "Produtos do Repositório");

    return (
        <StandardBlogTemplate
            title={pageTitle}
            icon={ShoppingBag}
            backgroundImage="https://images.unsplash.com/photo-1551754655-cd27e38d2076?q=80&w=2000&auto=format&fit=crop"
            breadcrumbs={[
                { label: "Início", href: "/" },
                { label: "Repositório", href: "/repositorio" },
                { label: contextName ? "Produtos" : "Produtos", href: contextName ? "/produtos" : undefined },
                { label: contextName || "Ver Todos", href: undefined }
            ]}
            sidebarComponents={
                <div className="space-y-agro">
                    <div className="bg-white p-6 rounded-[15px] border border-slate-100 shadow-sm">
                        <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-4">Procurar</h3>
                        <div className="relative">
                            <input
                                type="text"
                                placeholder={activeTab === 'Empresas' ? "Procurar em empresas..." : "Procurar no mercado..."}
                                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-[10px] text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        </div>
                    </div>

                    {activeTab === 'Empresas' && (
                        <div className="bg-white p-6 rounded-[15px] border border-slate-100 shadow-sm">
                            <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-4">Explorar Insumos</h3>
                            <div className="grid grid-cols-1 gap-3">
                                {[
                                    { label: "Sementes", icon: Sprout, color: "bg-emerald-500", text: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-100" },
                                    { label: "Fertilizantes", icon: Zap, color: "bg-[#f97316]", text: "text-orange-700", bg: "bg-orange-50", border: "border-orange-100" },
                                    { label: "Maquinaria", icon: Truck, color: "bg-blue-600", text: "text-blue-700", bg: "bg-blue-50", border: "border-blue-100" },
                                    { label: "Rega", icon: Droplets, color: "bg-cyan-500", text: "text-cyan-700", bg: "bg-cyan-50", border: "border-cyan-100" }
                                ].map((cat, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setSearchQuery(cat.label)}
                                        className={`flex items-center gap-3 p-3 rounded-xl border ${cat.border} ${cat.bg} hover:scale-[1.02] transition-all group text-left`}
                                    >
                                        <div className={`w-8 h-8 ${cat.color} rounded-lg flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform`}>
                                            <cat.icon className="w-4 h-4 text-white" />
                                        </div>
                                        <div>
                                            <p className={`text-[13px] font-bold ${cat.text}`}>{cat.label}</p>
                                            <p className="text-[9px] font-black uppercase tracking-tighter opacity-50">Explorar catálogo</p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {contextName && (
                        <Link href="/produtos" className="block p-4 bg-slate-50 border border-slate-200 rounded-[10px] text-center text-xs font-black uppercase text-slate-500 hover:bg-slate-100 transition-colors">
                            Ver Todos os Produtos
                        </Link>
                    )}
                </div>
            }
        >
            <div className="space-y-10">
                {/* Tab Switcher */}
                <div className="flex p-1 bg-slate-100 rounded-[15px] w-fit border border-slate-200 shadow-inner">
                    <button
                        onClick={() => setActiveTab('Empresas')}
                        className={`px-8 py-3 rounded-[12px] text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'Empresas'
                            ? "bg-white text-emerald-600 shadow-sm"
                            : "text-slate-500 hover:text-slate-700"
                            }`}
                    >
                        Produtos das Empresas
                    </button>
                    <button
                        onClick={() => setActiveTab('Mercado')}
                        className={`px-8 py-3 rounded-[12px] text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'Mercado'
                            ? "bg-white text-emerald-600 shadow-sm"
                            : "text-slate-500 hover:text-slate-700"
                            }`}
                    >
                        Cotações do Mercado
                    </button>
                </div>

                {activeTab === 'Mercado' ? (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <MarketPriceTable />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 3xl:grid-cols-5 4xl:grid-cols-6 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
                        {loading ? (
                            Array(6).fill(0).map((_, i) => (
                                <div key={i} className="animate-pulse bg-white rounded-[15px] h-[300px]" />
                            ))
                        ) : paginatedProducts.length > 0 ? (
                            paginatedProducts.map((product, i) => {
                                const resolvedCompanySlug = product.company_slug;
                                const prodUrl = resolvedCompanySlug
                                    ? `/empresas/${resolvedCompanySlug}/produto/${slugify(product.nome || product.name)}`
                                    : "#";

                                return (
                                    <div
                                        key={product.id || i}
                                        className="group bg-white rounded-agro border border-slate-100 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col h-full"
                                    >
                                        <Link href={prodUrl} className="relative h-48 block overflow-hidden">
                                            <Image
                                                src={product.image_url || product.img || product.photo || "https://images.unsplash.com/photo-1595152248447-c93d5006b00b?q=80&w=400"}
                                                alt={product.nome || "Produto"}
                                                fill
                                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                                className="object-cover group-hover:scale-105 transition-transform duration-700"
                                            />
                                            <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm text-[9px] font-black text-emerald-600 uppercase tracking-widest px-2 py-1 rounded-md shadow-sm">
                                                {product.category || "Insumo"}
                                            </div>
                                        </Link>
                                        <div className="p-5 flex-1 flex flex-col">
                                            <Link
                                                href={`/empresas/${product.company_slug}`}
                                                className="flex items-center gap-1.5 mb-2 bg-slate-50 self-start px-2 py-1 rounded-md border border-slate-100 hover:bg-emerald-50 hover:border-emerald-100 transition-colors"
                                            >
                                                <Building2 className="w-3 h-3 text-emerald-600" />
                                                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest truncate max-w-[150px]">
                                                    {product.company_name || "Agro Empresa"}
                                                </span>
                                            </Link>
                                            <Link href={prodUrl}>
                                                <h3 className="text-[17px] font-black text-slate-800 mb-1 uppercase tracking-tight line-clamp-1 group-hover:text-orange-600 transition-colors duration-300">{product.nome}</h3>
                                            </Link>
                                            <p className="text-xs text-slate-400 font-medium leading-relaxed mb-2 line-clamp-2">
                                                {product.description || "Descrição de alta qualidade para este insumo agrícola."}
                                            </p>

                                            <div>
                                                <div className="text-emerald-600 font-black text-[18px] mb-1.5">
                                                    {product.preco || product.price
                                                        ? `${typeof (product.preco || product.price) === 'number'
                                                            ? (product.preco || product.price).toLocaleString('pt-MZ')
                                                            : (product.preco || product.price)} MT`
                                                        : "Sob Consulta"}
                                                </div>

                                                <div className="pt-2 border-t border-slate-50 flex items-center justify-between">
                                                    <Link
                                                        href={prodUrl}
                                                        className="text-[11px] font-black uppercase tracking-wider text-[#f97316] flex items-center gap-1 hover:gap-2 transition-all"
                                                    >
                                                        DETALHES <ArrowRight className="w-3.5 h-3.5" />
                                                    </Link>

                                                    <div className="flex items-center gap-1.5">
                                                        <div className={`w-1.5 h-1.5 rounded-full ${product.available !== false ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
                                                        <span className={`text-[10px] font-black uppercase tracking-widest ${product.available !== false ? 'text-emerald-500' : 'text-red-500'}`}>
                                                            {product.available !== false ? 'Disponível' : 'Indisponível'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="col-span-full py-20 text-center text-slate-400 bg-white rounded-[20px] border border-dashed border-slate-100">
                                <ShoppingBag className="w-12 h-12 mx-auto mb-4 opacity-20" />
                                <p className="font-medium text-sm">Nenhum produto encontrado nesta categoria.</p>
                            </div>
                        )}
                    </div>
                )}

                {/* Pagination Controls - Only for Empresas tab */}
                {activeTab === 'Empresas' && totalPages > 1 && (
                    <div className="flex justify-center items-center gap-2 pt-8">
                        <button
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-emerald-50 hover:border-emerald-200 disabled:opacity-30 disabled:hover:bg-white transition-all shadow-sm"
                        >
                            <ArrowRight className="w-4 h-4 rotate-180" />
                        </button>

                        <div className="flex items-center gap-1.5">
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                <button
                                    key={page}
                                    onClick={() => handlePageChange(page)}
                                    className={`w-10 h-10 flex items-center justify-center rounded-xl text-xs font-black transition-all shadow-sm ${currentPage === page
                                        ? "bg-emerald-600 text-white border border-emerald-600 shadow-emerald-600/20"
                                        : "bg-white border border-slate-200 text-slate-500 hover:bg-slate-50 hover:border-slate-300"
                                        }`}
                                >
                                    {page}
                                </button>
                            ))}
                        </div>

                        <button
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className="w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-emerald-50 hover:border-emerald-200 disabled:opacity-30 disabled:hover:bg-white transition-all shadow-sm"
                        >
                            <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>
                )}
            </div>
        </StandardBlogTemplate>
    );
}

export default function ProductsPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-slate-50 animate-pulse" />}>
            <ProductsContent />
        </Suspense>
    );
}
