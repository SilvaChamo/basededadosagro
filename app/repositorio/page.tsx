"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { SearchSection } from "@/components/SearchSection";
import {
    Search, X, Building2,
    User, LandPlot, ShoppingBag, ArrowRight,
    FileText, BookOpen
} from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { ContactCTA } from "@/components/ContactCTA";

export default function RepositorioPage() {
    const supabase = createClient();
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState("Todos os resultados");
    const [sortOption, setSortOption] = useState("Ordem Alfabética");
    const [counts, setCounts] = useState({
        articles: 0,
        companies: 0,
        products: 0,
        professionals: 0,
        properties: 0,
        documents: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchCounts() {
            try {
                const [
                    articlesCount,
                    companiesCount,
                    productsCount,
                    prosCount,
                    propsCount,
                    docsCount
                ] = await Promise.all([
                    supabase.from('articles').select('*', { count: 'exact', head: true }).eq('type', 'article'),
                    supabase.from('companies').select('*', { count: 'exact', head: true }).eq('is_archived', false),
                    supabase.from('products').select('*', { count: 'exact', head: true }),
                    supabase.from('professionals').select('*', { count: 'exact', head: true }),
                    supabase.from('properties').select('*', { count: 'exact', head: true }),
                    supabase.from('articles').select('*', { count: 'exact', head: true }).or('type.eq.document,type.eq.Relatório')
                ]);

                setCounts({
                    articles: articlesCount.count || 0,
                    companies: companiesCount.count || 0,
                    products: productsCount.count || 0,
                    professionals: prosCount.count || 0,
                    properties: propsCount.count || 0,
                    documents: docsCount.count || 0
                });
            } catch (error) {
                console.error("Error fetching repository counts:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchCounts();
    }, []);

    const items = [
        {
            title: "Artigos Científicos",
            description: "Teses, dissertações, revistas científicas e pesquisas académicas sobre o agronegócio.",
            count: `${counts.articles} Arquivos`,
            icon: BookOpen,
            bg: "bg-cyan-50",
            color: "text-cyan-600",
            border: "border-cyan-100",
            category: "Artigos",
            date: "2023-12-01",
            price: 0,
            relevance: 5,
            href: "/artigos"
        },
        {
            title: "Documentos",
            description: "Legislação, relatórios, planos estratégicos e outros documentos oficiais.",
            count: `${counts.documents} Arquivos`,
            icon: FileText,
            bg: "bg-rose-50",
            color: "text-rose-600",
            border: "border-rose-100",
            category: "Documentos",
            date: "2024-01-15",
            price: 0,
            relevance: 9,
            href: "/documentos"
        },
        {
            title: "Empresas",
            description: "Base de dados de empresas, prestadores de serviços, cooperativas, associações e parceiros do sector.",
            count: `${counts.companies} Arquivos`,
            icon: Building2,
            bg: "bg-blue-50",
            color: "text-blue-600",
            border: "border-blue-100",
            category: "Empresas",
            date: "2023-11-20",
            price: 0,
            relevance: 6,
            href: "/empresas"
        },
        {
            title: "Produtos",
            description: "Insumos, maquinaria agrícolas, equipamentos e material de segurança disponível para venda imediata.",
            count: `${counts.products} Arquivos`,
            icon: ShoppingBag,
            bg: "bg-emerald-50",
            color: "text-emerald-600",
            border: "border-emerald-100",
            category: "Produtos",
            date: "2024-01-20",
            price: 1500,
            relevance: 8,
            href: "/produtos"
        },
        {
            title: "Profissionais",
            description: "Agrónomos, veterinários, técnicos e especialistas, engenheiros e agricultores prontos para atender as suas necessidades.",
            count: `${counts.professionals} Arquivos`,
            icon: User,
            bg: "bg-purple-50",
            color: "text-purple-600",
            border: "border-purple-100",
            category: "Profissionais",
            date: "2023-10-05",
            price: 500,
            relevance: 7,
            href: "/repositorio/profissionais"
        },
        {
            title: "Propriedades",
            description: "Terrenos, machambas, infra-estruturas rurais, campos arráveis e fazendas prontas para investimento.",
            count: `${counts.properties} Arquivos`,
            icon: LandPlot,
            bg: "bg-orange-50",
            color: "text-orange-600",
            border: "border-orange-100",
            category: "Propriedades",
            date: "2023-09-12",
            price: 50000,
            relevance: 3,
            href: "/propriedades"
        }
    ];

    const filteredItems = items.filter((item: any) => {
        if (selectedCategory === "Todos os resultados") return true;
        return item.title.includes(selectedCategory);
    }).sort((a: any, b: any) => {
        if (sortOption === "Mais recentes") {
            return new Date(b.date).getTime() - new Date(a.date).getTime();
        }
        if (sortOption === "Preço: Menor para Maior") {
            return a.price - b.price;
        }
        if (sortOption === "Preço: Maior para Menor") {
            return b.price - a.price;
        }
        if (sortOption === "Relevância") {
            return b.relevance - a.relevance;
        }
        // Default: Ordem Alfabética (A-Z)
        return a.title.localeCompare(b.title);
    });

    return (
        <div className="min-h-screen bg-[#FDFDFD] text-slate-900 font-sans relative">
            <div className="relative">
                <PageHeader
                    title="Repositório"
                    backgroundImage="https://images.unsplash.com/photo-1507842217121-9e871299ee18?q=80&w=2000&auto=format&fit=crop"
                    breadcrumbs={[
                        { label: "Início", href: "/" },
                        { label: "Repositório", href: undefined }
                    ]}
                />

                <div className="absolute bottom-6 w-full z-20 pointer-events-none">
                    <div className="container-site mx-auto flex justify-end">
                        <button
                            onClick={() => setIsSearchOpen(!isSearchOpen)}
                            className={`w-12 h-12 rounded-[7px] flex items-center justify-center transition-all duration-300 shadow-xl pointer-events-auto animate-in fade-in slide-in-from-bottom-8 duration-700 ${isSearchOpen
                                ? "bg-[#f97316] text-white rotate-90 border border-[#f97316]"
                                : "bg-[#22c55e] text-white hover:bg-[#f97316] hover:scale-110"
                                }`}
                        >
                            {isSearchOpen ? <X className="w-6 h-6" /> : <Search className="w-6 h-6" />}
                        </button>
                    </div>
                </div>
            </div>

            <SearchSection isOpen={isSearchOpen} withBottomBorder={true} />

            <main className="container-site py-12">
                <div className="flex flex-col lg:flex-row gap-5">

                    <aside className="w-full lg:w-72 shrink-0">
                        <div className="sticky top-24 space-y-8">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Filtros</h2>
                                <button className="text-xs font-bold text-[#f97316] hover:underline" onClick={() => {
                                    setSelectedCategory("Todos os resultados");
                                    setSortOption("Ordem Alfabética");
                                }}>Limpar tudo</button>
                            </div>

                            <div className="bg-slate-50 p-5 rounded-[15px] space-y-4 border border-slate-100">
                                <h3 className="text-sm font-bold text-slate-900">Categorias</h3>
                                <div className="space-y-3">
                                    {[
                                        "Todos os resultados",
                                        "Produtos",
                                        "Empresas",
                                        "Profissionais",
                                        "Propriedades",
                                        "Artigos Científicos",
                                        "Documentos"
                                    ].map((cat, i) => (
                                        <label key={i} className="flex items-center gap-3 cursor-pointer group">
                                            <input
                                                type="checkbox"
                                                checked={selectedCategory === cat}
                                                onChange={() => setSelectedCategory(cat)}
                                                className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 h-4 w-4"
                                            />
                                            <span className={`text-sm font-medium transition-colors ${selectedCategory === cat ? "text-emerald-600 font-bold" : "text-slate-600 group-hover:text-emerald-600"}`}>
                                                {cat}
                                            </span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-3">
                                <h3 className="text-sm font-bold text-slate-900">Ordenar por</h3>
                                <select
                                    className="w-full bg-white border border-slate-200 rounded-[15px] py-2.5 px-4 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                                    value={sortOption}
                                    onChange={(e) => setSortOption(e.target.value)}
                                >
                                    <option>Ordem Alfabética</option>
                                    <option>Relevância</option>
                                    <option>Mais recentes</option>
                                    <option>Preço: Menor para Maior</option>
                                    <option>Preço: Maior para Menor</option>
                                </select>
                            </div>

                            <div className="bg-emerald-50 border border-emerald-100 p-5 rounded-[15px] space-y-4">
                                <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Dica Pro</p>
                                <p className="text-sm text-emerald-900 font-medium">Registe-se como vendedor para listar os seus produtos gratuitamente.</p>
                                <Link href="/planos">
                                    <button className="w-full py-3 bg-emerald-600 text-white text-xs font-bold rounded-[15px] hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/20">
                                        Tornar-se Vendedor
                                    </button>
                                </Link>
                            </div>
                        </div>
                    </aside>

                    <div className="flex-1 min-h-[400px]">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            {filteredItems.length > 0 ? filteredItems.map((item, i) => (
                                <Link key={i} href={item.href || "#"} className="block h-full">
                                    <div className={`p-5 rounded-[15px] border ${item.border} ${item.bg} shadow-md hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer group flex flex-col items-center text-center h-full gap-5`}>
                                        <div className={`w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm ${item.color} group-hover:scale-110 transition-transform`}>
                                            <item.icon className="w-8 h-8" />
                                        </div>
                                        <div className="space-y-2 w-full">
                                            <h3 className="text-xl font-black text-slate-800 group-hover:text-slate-900 transition-colors uppercase leading-tight">{item.title}</h3>
                                            <p className="text-sm text-slate-500 font-medium leading-relaxed">{item.description}</p>
                                        </div>
                                        <div className="mt-auto pt-2 flex items-center justify-between w-full">
                                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 bg-white px-3 py-1.5 rounded-full shadow-sm border border-slate-100 italic">{loading ? "Carregando..." : item.count}</span>
                                            <div className="flex items-center gap-1 text-xs font-bold text-slate-700 group-hover:text-[#f97316] transition-colors">
                                                Explorar
                                                <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-1" />
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            )) : (
                                <div className="col-span-full py-20 text-center text-gray-400">
                                    <Search className="w-12 h-12 mx-auto mb-4 opacity-20" />
                                    <p>Nenhum resultado encontrado no repositório.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <ContactCTA
                    title="Não encontrou o que procurava?"
                    description="O nosso repositório está em constante crescimento. Se procura algo específico ou quer destacar a sua empresa, entre em contacto."
                    buttonText="Falar com Suporte"
                />
            </main>
        </div>
    );
}
