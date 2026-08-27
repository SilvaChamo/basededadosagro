"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Search, Building2, ShoppingBag, Users, FileText, LandPlot, ChevronDown, Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { createClient } from "@/utils/supabase/client";
import { useTranslations } from 'next-intl';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { DOCUMENT_TYPES } from "@/lib/constants";

export interface ExtraSearchItem {
    title: string;
    sub?: string;
    href?: string;
    image?: string;
}

export interface ExtraSearchCategory {
    id: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    items: ExtraSearchItem[];
}

interface SearchSectionProps {
    isOpen: boolean;
    withBottomBorder?: boolean;
    /** Conteúdo específico da página onde este componente está montado (ex:
     * cotações do Mercado, eventos da página de Eventos) — sem isto, a
     * pesquisa só cobre o índice geral do site (empresas/produtos/
     * profissionais/propriedades/artigos), que não inclui o conteúdo
     * próprio de páginas como o Mercado. */
    extraCategory?: ExtraSearchCategory;
}

export function SearchSection({ isOpen, withBottomBorder = false, extraCategory }: SearchSectionProps) {
    const supabase = createClient();
    const t = useTranslations('SearchSection');
    const [searchQuery, setSearchQuery] = useState("");
    const [activeCategory, setActiveCategory] = useState<string>("all");
    const [isCategoryOpen, setIsCategoryOpen] = useState(false);

    // Estado para guardar os dados da BD
    const [dbData, setDbData] = useState<{
        empresas: any[];
        produtos: any[];
        profissionais: any[];
        propriedades: any[];
        artigos: any[];
    }>({
        empresas: [],
        produtos: [],
        profissionais: [],
        propriedades: [],
        artigos: []
    });

    // Buscar todos os dados no início
    useEffect(() => {
        const fetchAll = async () => {
            const [companies, globalProducts, pros, props, arts] = await Promise.all([
                supabase.from('companies').select('id, name, slug, category, description, logo_url, products'),
                supabase.from('products').select('id, name, category, image_url'),
                supabase.from('professionals').select('*'),
                supabase.from('properties').select('*'),
                supabase.from('articles').select('*').or('publish_status.is.null,publish_status.not.in.(draft,review)')
            ]);

            // Formatar Empresas
            const empresasMapped = (companies.data || []).map((c: any) => ({
                ...c,
                title: c.name,
                sub: c.category || c.description,
                logo: c.logo_url,
                icon: Building2,
                type: 'company'
            }));

            // Formatar Produtos (Global + Nested)
            const productsList: any[] = [];

            // 1. Produtos Globais (se existirem e tiverem vínculo, ou como genéricos)
            if (globalProducts.data) {
                globalProducts.data.forEach((p: any) => {
                    productsList.push({
                        ...p,
                        title: p.name,
                        sub: p.category,
                        image: p.image_url,
                        icon: ShoppingBag,
                        type: 'product',
                        // Se não tem company_slug, redireciona para um padrão ou fica inativo
                        company_slug: 'geral'
                    });
                });
            }

            // 2. Produtos embutidos nas Empresas (JSONB)
            if (companies.data) {
                companies.data.forEach((c: any) => {
                    if (c.products && Array.isArray(c.products)) {
                        c.products.forEach((p: any) => {
                            productsList.push({
                                title: p.name,
                                sub: p.category || c.name, // Fallback para nome da empresa
                                image: p.img || p.photo || p.image_url || "/images/Prototipo/caju.webp",
                                icon: ShoppingBag,
                                type: 'product',
                                slug: p.slug || p.name.toLowerCase().replace(/ /g, '-'),
                                company_slug: c.slug
                            });
                        });
                    }
                });
            }

            setDbData({
                empresas: empresasMapped,
                produtos: productsList,
                profissionais: (pros.data || []).map((p: any) => ({ ...p, title: p.name, sub: p.role, image: p.image_url, icon: Users, type: 'professional' })),
                propriedades: (props.data || []).map((p: any) => ({ ...p, title: p.name, sub: p.description, image: p.image_url, icon: LandPlot, type: 'property' })),
                // Documentos/Legislação/Relatórios têm a sua própria página de resumo
                // (/documentos/[slug]) — não podem ir parar ao template de Notícias.
                artigos: (arts.data || []).map((a: any) => ({ ...a, title: a.title, sub: a.subtitle || a.type, image: a.image_url, icon: FileText, type: DOCUMENT_TYPES.includes(a.type) ? 'document' : 'article' }))
            });
        };
        fetchAll();
    }, []);

    const categories = [
        { id: "all", label: t("categories.all"), icon: Search },
        ...(extraCategory ? [{ id: extraCategory.id, label: extraCategory.label, icon: extraCategory.icon }] : []),
        { id: "empresas", label: t("categories.empresas"), icon: Building2 },
        { id: "produtos", label: t("categories.produtos"), icon: ShoppingBag },
        { id: "profissionais", label: t("categories.profissionais"), icon: Users },
        { id: "propriedades", label: t("categories.propriedades"), icon: LandPlot },
        { id: "artigos", label: t("categories.artigos"), icon: FileText },
    ];

    const currentCat = categories.find(c => c.id === activeCategory) || categories[0];

    const filteredResults = React.useMemo(() => {
        if (!searchQuery) return null;
        const query = searchQuery.toLowerCase();

        const filterData = (data: any[]) => data ? data.filter(item =>
            (item.title && item.title.toLowerCase().includes(query)) ||
            (item.sub && item.sub.toLowerCase().includes(query)) ||
            (item.description && item.description.toLowerCase().includes(query)) ||
            (item.category && item.category.toLowerCase().includes(query))
        ) : [];

        const result: any = {
            produtos: activeCategory === "all" || activeCategory === "produtos" ? filterData(dbData.produtos) : [],
            profissionais: activeCategory === "all" || activeCategory === "profissionais" ? filterData(dbData.profissionais) : [],
            empresas: activeCategory === "all" || activeCategory === "empresas" ? filterData(dbData.empresas) : [],
            artigos: activeCategory === "all" || activeCategory === "artigos" ? filterData(dbData.artigos) : [],
            propriedades: activeCategory === "all" || activeCategory === "propriedades" ? filterData(dbData.propriedades) : [],
            extra: extraCategory && (activeCategory === "all" || activeCategory === extraCategory.id)
                ? filterData(extraCategory.items)
                : []
        };

        const totalCount = result.produtos.length + result.profissionais.length + result.empresas.length + result.artigos.length + result.propriedades.length + result.extra.length;
        return totalCount > 0 ? result : null;
    }, [searchQuery, activeCategory, dbData, extraCategory]);

    return (
        <section className={`w-full bg-slate-50 relative overflow-hidden transition-all duration-700 ease-in-out ${isOpen ? "max-h-[2000px] opacity-100 py-6" : "max-h-0 opacity-0 py-0"}`}>
            <div className={`transition-all duration-700 delay-100 ${isOpen ? "translate-y-0 opacity-100" : "-translate-y-10 opacity-0"}`}>
                {/* Search Bar Container - Google Style Refined */}
                <div className="container-site">
                    <div className="max-w-3xl mx-auto relative z-20">
                        <div className="relative">
                            <div className="relative bg-white rounded-[5px] shadow-sm h-12 flex items-center border border-gray-200 transition-all duration-300 overflow-hidden my-[15px]">

                                <div className="pl-6 text-gray-400">
                                    <Search className="h-5 w-5" />
                                </div>

                                <Input
                                    className="border-none shadow-none focus-visible:ring-0 text-base h-full bg-transparent placeholder:text-gray-400 flex-1 px-4 my-1 ml-2 rounded-[5px]"
                                    placeholder={t("placeholder")}
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />

                                {/* Category Selector inside Search Bar (RIGHT SIDE) */}
                                <Popover open={isCategoryOpen} onOpenChange={setIsCategoryOpen}>
                                    <PopoverTrigger asChild>
                                        <button
                                            className="flex items-center gap-2 px-6 h-full border-l border-gray-100 bg-gray-100 hover:bg-gray-200 transition-colors rounded-r-[5px] group"
                                            suppressHydrationWarning
                                        >
                                            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider hidden sm:block whitespace-nowrap">
                                                {currentCat.label}
                                            </span>
                                            <ChevronDown className="h-4 w-4 text-gray-400 group-hover:text-emerald-600 transition-colors" />
                                        </button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-56 p-2 rounded-2xl shadow-2xl border-gray-100" align="end">
                                        <div className="space-y-1">
                                            {categories.map((cat) => (
                                                <button
                                                    key={cat.id}
                                                    onClick={() => {
                                                        setActiveCategory(cat.id);
                                                        setIsCategoryOpen(false);
                                                    }}
                                                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${activeCategory === cat.id
                                                        ? "bg-emerald-50 text-emerald-700"
                                                        : "text-gray-500 hover:bg-gray-50"
                                                        }`}
                                                >
                                                    <div className="flex items-center gap-2">
                                                        <cat.icon className="h-4 w-4" />
                                                        {cat.label}
                                                    </div>
                                                    {activeCategory === cat.id && <Check className="h-3 w-3" />}
                                                </button>
                                            ))}
                                        </div>
                                    </PopoverContent>
                                </Popover>
                            </div>
                        </div>
                    </div>
                </div>

                {searchQuery && (
                    <div className="container-site animate-in slide-in-from-bottom-4 duration-700 pb-12 mt-8">


                        {!filteredResults ? (
                            <div className="text-center py-20 text-gray-400">
                                <p className="text-xl">{t("no_results")}</p>
                            </div>
                        ) : (
                            <div className="space-y-16">
                                {filteredResults.extra.length > 0 && (
                                    <div className="space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 3xl:grid-cols-5 4xl:grid-cols-6 gap-5">
                                            {filteredResults.extra.map((item: any, i: number) => (
                                                <SearchResultCard key={i} item={{ ...item, icon: extraCategory?.icon }} colorClass="bg-orange-50 text-[#f97316]" />
                                            ))}
                                        </div>
                                    </div>
                                )}
                                {filteredResults.empresas.length > 0 && (
                                    <div className="space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 3xl:grid-cols-5 4xl:grid-cols-6 gap-5">
                                            {filteredResults.empresas.map((item: any, i: number) => (
                                                <SearchResultCard key={i} item={item} colorClass="bg-emerald-50 text-emerald-600" />
                                            ))}
                                        </div>
                                    </div>
                                )}
                                {filteredResults.propriedades.length > 0 && (
                                    <div className="space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 3xl:grid-cols-5 4xl:grid-cols-6 gap-5">
                                            {filteredResults.propriedades.map((item: any, i: number) => (
                                                <SearchResultCard key={i} item={item} colorClass="bg-emerald-50 text-emerald-600" />
                                            ))}
                                        </div>
                                    </div>
                                )}
                                {filteredResults.produtos.length > 0 && (
                                    <div className="space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 3xl:grid-cols-5 4xl:grid-cols-6 gap-5">
                                            {filteredResults.produtos.map((item: any, i: number) => (
                                                <SearchResultCard key={i} item={item} colorClass="bg-orange-50 text-[#f97316]" />
                                            ))}
                                        </div>
                                    </div>
                                )}
                                {filteredResults.profissionais.length > 0 && (
                                    <div className="space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 3xl:grid-cols-5 4xl:grid-cols-6 gap-5">
                                            {filteredResults.profissionais.map((item: any, i: number) => (
                                                <SearchResultCard key={i} item={item} colorClass="bg-orange-50 text-[#f97316]" isRound={true} />
                                            ))}
                                        </div>
                                    </div>
                                )}
                                {filteredResults.artigos.length > 0 && (
                                    <div className="space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 3xl:grid-cols-5 4xl:grid-cols-6 gap-5">
                                            {filteredResults.artigos.map((item: any, i: number) => (
                                                <SearchResultCard key={i} item={item} colorClass="bg-emerald-50 text-emerald-600" />
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Full Width Bottom Border */}
            {withBottomBorder && isOpen && (
                <div className="absolute bottom-0 w-full left-0 border-b border-gray-200" />
            )}
        </section>
    );
}

function SearchResultCard({ item, colorClass, isRound = false }: { item: any, colorClass: string, isRound?: boolean }) {
    const Icon = item.icon || Search; // Fallback

    // Determine the link based on category or item type.
    // There is no generic /detalhes/[id] page in this app, so items without a
    // real destination fall back to the closest listing page instead of a dead link.
    let href: string | null = item.href || null;

    if (href) {
        // já vem com destino definido (categorias específicas de página)
    } else if (item.type === 'company' && item.slug) {
        href = `/empresas/${item.slug}`;
    } else if (item.type === 'product' && item.slug && item.company_slug && item.company_slug !== 'geral') {
        href = `/empresas/${item.company_slug}/produto/${item.slug}`;
    } else if (item.type === 'product') {
        href = `/produtos`;
    } else if (item.type === 'article' && item.slug) {
        href = `/artigos/${item.slug}`;
    } else if (item.type === 'document' && item.slug) {
        href = `/documentos/${item.slug}`;
    } else if (item.type === 'professional' && item.id) {
        href = `/repositorio/profissionais/${item.id}`;
    } else if (item.type === 'property') {
        href = `/propriedades`;
    }

    if (!href) {
        return (
            <div className="bg-white border border-gray-100 p-5 rounded-agro shadow-sm flex items-center gap-agro opacity-60 cursor-default">
                <SearchResultCardBody item={item} colorClass={colorClass} isRound={isRound} Icon={Icon} />
            </div>
        );
    }

    return (
        <Link href={href} className="block">
            <div className="bg-white border border-gray-100 p-5 rounded-agro shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex items-center gap-agro group">
                <SearchResultCardBody item={item} colorClass={colorClass} isRound={isRound} Icon={Icon} />
            </div>
        </Link>
    );
}

function SearchResultCardBody({ item, colorClass, isRound, Icon }: { item: any, colorClass: string, isRound: boolean, Icon: any }) {
    return (
        <>
            {/* Image or Icon Container */}
            <div className="shrink-0">
                {item.logo ? (
                    <div className="w-12 h-12 rounded-[5px] overflow-hidden border border-gray-100 relative bg-white">
                        <img src={item.logo} alt={item.title} className="w-full h-full object-contain p-1" />
                    </div>
                ) : item.image ? (
                    <div className={`w-12 h-12 overflow-hidden border border-gray-100 relative ${isRound ? 'rounded-full' : 'rounded-[5px]'}`}>
                        <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                    </div>
                ) : (
                    <div className={`w-12 h-12 rounded-[5px] flex items-center justify-center transition-colors duration-300 ${colorClass} group-hover:bg-gray-900 group-hover:text-white`}>
                        <Icon className="w-6 h-6" />
                    </div>
                )}
            </div>

            <div className="flex-1 min-w-0">
                <h4 className="font-bold text-slate-600 text-sm md:text-base leading-tight group-hover:text-[#f97316] transition-colors truncate">{item.title}</h4>
                <p className="text-[10px] text-gray-400 uppercase tracking-wider font-bold mt-1 line-clamp-2">{item.sub}</p>
            </div>
        </>
    );
}
