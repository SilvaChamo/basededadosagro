"use client";

import React, { useEffect, useState, useRef } from "react";
import { StandardBlogTemplate } from "@/components/StandardBlogTemplate";
import { BookOpen, Search, ArrowRight, Calendar, User, ChevronDown, Info, Zap, Brain } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/utils/supabase/client";
import { NewsCard } from "@/components/NewsCard";
import { Spinner } from "@/components/ui/spinner";
import { sortArticlesByDateDesc } from "@/lib/utils";

export default function ArticlesArchivePage() {
    const supabase = createClient();
    const [articles, setArticles] = useState<any[]>([]);
    const [localArticles, setLocalArticles] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [visibleCount, setVisibleCount] = useState(3);
    const [isFetchingMore, setIsFetchingMore] = useState(false);
    const [isScanningGlobal, setIsScanningGlobal] = useState(false);
    const [isSearchActive, setIsSearchActive] = useState(false);
    const [searchMode, setSearchMode] = useState<'manual' | 'auto'>('manual');
    const [isModeSelectorOpen, setIsModeSelectorOpen] = useState(false);
    const loaderRef = useRef<HTMLDivElement>(null);

    // Debounced Auto-Search
    useEffect(() => {
        if (searchMode === 'manual') return;

        const timeoutId = setTimeout(() => {
            if (searchQuery.length >= 3) {
                handleSearch(undefined, true);
            }
        }, 800); // 800ms debounce

        return () => clearTimeout(timeoutId);
    }, [searchQuery, searchMode]);

    useEffect(() => {
        async function fetchInitial() {
            setLoading(true);
            try {
                // 1. Fetch Local Verified Content
                const { data, error } = await supabase
                    .from('articles')
                    .select('*')
                    .is('deleted_at', null)
                    .order('date', { ascending: false });

                if (error) {
                    console.error("Error fetching local articles:", error);
                }

                // `date` é texto livre na BD (alguns registos antigos não seguem
                // AAAA-MM-DD), por isso reordena aqui com fallback para created_at
                // em vez de confiar só no `.order('date')` acima.
                const combinedLocal = sortArticlesByDateDesc(data || []);
                setLocalArticles(combinedLocal);
                setArticles(combinedLocal);

                // 2. Auto-Scan Global Scientific Database for Mozambique
                // This fulfills the "national priority" and "auto-reload/scan" request
                const mozPapers = await fetchExternalArticles("Moçambique Agricultura");
                if (mozPapers.length > 0) {
                    setArticles(prev => [...prev, ...mozPapers]);
                }

            } catch (error) {
                console.error("Error fetching initial articles:", error);
                setLocalArticles([]);
                setArticles([]);
            } finally {
                setLoading(false);
                setIsSearchActive(true); // mostrar a grelha de artigos por defeito, sem exigir pesquisa
            }
        }
        fetchInitial();
    }, []);

    const fetchExternalArticles = async (query: string) => {
        if (!query || query.length < 3) return [];
        setIsScanningGlobal(true);
        try {
            // Enhanced Global Search: Try Portuguese query, and if it's a known term or specifically for MOZ, try English too.
            // Semantic Scholar performs significantly better with English keywords.
            const translationMap: Record<string, string> = {
                "mocambique": "Mozambique",
                "agricultura": "Agriculture",
                "milho": "Maize",
                "soja": "Soybean",
                "agro-alimentar": "Agro-food",
                "precisao": "Precision",
                "setor agrario": "Agricultural sector",
                "sector agrario": "Agricultural sector",
                "agroindustria": "Agro-industry"
            };

            let searchQueries = [query];
            const lowerQuery = query.toLowerCase();

            // Add English version if translation exists
            Object.keys(translationMap).forEach(pt => {
                if (lowerQuery.includes(pt)) {
                    searchQueries.push(translationMap[pt]);
                }
            });

            // If query is specifically about Mozambique but in PT, always add Mozambique in EN
            if (lowerQuery.includes("mocambique") && !searchQueries.includes("Mozambique")) {
                searchQueries.push("Mozambique");
            }

            // Execute search with the most robust query (joined for broader coverage)
            const finalQuery = Array.from(new Set(searchQueries)).join(" ");

            const response = await fetch(`/api/articles/search?query=${encodeURIComponent(finalQuery)}&limit=15`);
            const data = await response.json();

            if (data && data.data) {
                return data.data.map((paper: any) => ({
                    id: paper.paperId,
                    title: paper.title,
                    author: paper.authors && paper.authors.length > 0 ? paper.authors[0].name : "Pesquisador Académico",
                    source: paper.venue || "Global Science Database",
                    source_url: paper.url,
                    slug: `ext-${paper.paperId}`,
                    date: `${paper.year || new Date().getFullYear()}-01-01`,
                    type: "external_article",
                    subtitle: paper.abstract ? paper.abstract.substring(0, 160) + "..." : "Documento científico recuperado de base de dados global."
                }));
            }
            return [];
        } catch (err) {
            console.error("Global search error:", err);
            return [];
        } finally {
            setIsScanningGlobal(false);
        }
    };

    const handleSearch = async (e?: React.KeyboardEvent | React.MouseEvent, isAuto = false) => {
        if (e && 'key' in e && e.key !== 'Enter') return;

        // Prevent manual search if auto is on (unless forced or different context) - but here simply allow both
        // If mode is auto, we ignore Enter key to avoid double-firing, UNLESS it's a specific user intent.
        // Actually, Enter should always force a search regardless of mode, confirming the action.

        setIsSearchActive(true);

        const normalize = (text: string) =>
            text ? text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim() : "";

        // Expanded Keyword Mapping for robust search (PT-PT / PT-BR / Typos)
        const KEYWORD_MAP: Record<string, string> = {
            "estencionaista": "extensionista",
            "extensionistas": "extensionista",
            "civicultura": "silvicultura",
            "agropecuario": "agropecuaria",
            "agro-alimentar": "agroalimentar",
            "agro alimentar": "agroalimentar",
            "agro-alimenta": "agroalimentar",
            "agro-industria": "agroindustria",
            "tecnico": "tecnico",
            "tecnica": "tecnica",
            "mocambique": "mocambique",
            "mozambique": "mocambique",
            "reflorestamento": "reflorestacao"
        };

        let rawQuery = searchQuery.toLowerCase().trim();
        let normalizedQuery = normalize(searchQuery);

        Object.keys(KEYWORD_MAP).forEach(key => {
            if (rawQuery.includes(key)) {
                normalizedQuery = normalizedQuery.replace(normalize(key), normalize(KEYWORD_MAP[key]));
            }
        });

        // Split query into keywords for partial matching (Broad search)
        const keywords = normalizedQuery.split(/\s+/).filter(k => k.length > 2);

        const filteredLocal = localArticles.filter(art => {
            const content = normalize(`${art.title} ${art.author} ${art.source} ${art.subtitle}`);

            // If we have keywords, match if ANY keyword is present (OR logic for robustness)
            if (keywords.length > 0) {
                return keywords.some(word => content.includes(word));
            }

            // Fallback to exact-ish match if no significant keywords
            return content.includes(normalizedQuery);
        });

        if (normalizedQuery.length >= 3) {
            setArticles(filteredLocal);
            // Search external with normalized query
            const external = await fetchExternalArticles(normalizedQuery);
            setArticles([...filteredLocal, ...external]);
        } else {
            setArticles(filteredLocal);
        }
        setVisibleCount(3);
    };

    const displayedArticles = articles.slice(0, visibleCount);

    const handleLoadMore = () => {
        if (isFetchingMore) return;
        setIsFetchingMore(true);
        setTimeout(() => {
            setVisibleCount(prev => prev + 3);
            setIsFetchingMore(false);
        }, 500); // Reduced delay for smoother automatic feel
    };

    // Infinite Scroll Observer
    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting && !isFetchingMore && visibleCount < articles.length) {
                handleLoadMore();
            }
        }, { threshold: 0.1 });

        if (loaderRef.current) {
            observer.observe(loaderRef.current);
        }

        return () => observer.disconnect();
    }, [isFetchingMore, visibleCount, articles.length]);

    return (
        <StandardBlogTemplate
            title="Artigos científicos"
            backgroundImage="https://images.unsplash.com/photo-1507842217121-9e871299ee18?q=80&w=2000&auto=format&fit=crop"
            breadcrumbs={[
                { label: "Início", href: "/" },
                { label: "Repositório", href: "/repositorio" },
                { label: "Artigos científicos", href: undefined }
            ]}
            sidebarComponents={
                <div className="space-y-agro">
                    <div className="bg-white p-6 rounded-[15px] border border-slate-100 shadow-sm transition-all duration-300">
                        <div className="flex items-center gap-2 mb-4">
                            {searchMode === 'auto' ? <Zap className="w-4 h-4 text-emerald-500" /> : <Info className="w-4 h-4 text-slate-400" />}
                            <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-0">
                                {searchMode === 'auto' ? 'Modo Automático' : 'Modo Intuitivo'}
                            </h3>
                        </div>
                        <p className="text-sm text-slate-500 leading-relaxed">
                            {searchMode === 'auto'
                                ? "O sistema pesquisa em tempo real enquanto você digita, vasculhando bibliotecas globais instantaneamente."
                                : "A pesquisa é ativada apenas quando você decide, permitindo digitar frases completas com precisão antes de buscar."}
                        </p>
                    </div>
                </div>
            }
        >
            {/* Scientific Search Input - EXACT Home Style + Enter Trigger */}
            <div className="mb-[20px]">
                <div className={`relative bg-white rounded-[15px] shadow-sm h-14 flex items-center border transition-all duration-300 ${isScanningGlobal ? 'border-emerald-300 ring-2 ring-emerald-50' : 'border-gray-200'}`}>
                    <button
                        onClick={() => handleSearch()}
                        className="pl-6 text-gray-400 hover:text-emerald-600 transition-colors"
                        disabled={isScanningGlobal}
                    >
                        {(
                            <Search className="h-5 w-5" />
                        )}
                    </button>
                    <input
                        className="border-none shadow-none focus-visible:ring-0 text-base h-full bg-transparent placeholder:text-gray-400 flex-1 px-4 outline-none"
                        placeholder="Em que podemos te ajudar hoje?"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={handleSearch}
                    />
                    {/* Interactive Mode Selector */}
                    <div className="relative h-full">
                        <button
                            onClick={() => setIsModeSelectorOpen(!isModeSelectorOpen)}
                            className="group flex items-center gap-2 px-6 h-full border-l border-gray-100 bg-gray-50 hover:bg-gray-100 transition-all cursor-pointer relative rounded-r-[15px]"
                        >
                            {isScanningGlobal ? (
                                <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider animate-pulse whitespace-nowrap">
                                    Escaneando...
                                </span>
                            ) : (
                                <>
                                    {searchMode === 'auto' ? <Zap className="w-4 h-4 text-emerald-500" /> : <Brain className="w-4 h-4 text-slate-400" />}
                                    <span className={`text-xs font-bold uppercase tracking-wider hidden sm:block whitespace-nowrap ${searchMode === 'auto' ? 'text-emerald-600' : 'text-slate-500'}`}>
                                        {searchMode === 'auto' ? "Busca Automática" : "Busca Intuitiva"}
                                    </span>
                                    <ChevronDown
                                        className={`w-3 h-3 text-slate-400 ml-1 transition-all duration-300 ${isModeSelectorOpen ? 'rotate-180' : 'group-hover:translate-y-0.5'}`}
                                    />
                                </>
                            )}
                        </button>

                        {/* Dropdown Menu */}
                        {isModeSelectorOpen && (
                            <div className="absolute top-full right-0 mt-2 w-56 bg-white rounded-[10px] shadow-xl border border-slate-100 p-2 z-50 animate-in fade-in slide-in-from-top-2">
                                <div className="space-y-1">
                                    <button
                                        onClick={() => { setSearchMode('manual'); setIsModeSelectorOpen(false); }}
                                        className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors ${searchMode === 'manual' ? 'bg-slate-50 border border-slate-100' : 'hover:bg-slate-50'}`}
                                    >
                                        <div className={`p-2 rounded-md ${searchMode === 'manual' ? 'bg-white shadow-sm text-indigo-500' : 'bg-slate-100 text-slate-400'}`}>
                                            <Brain className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <p className={`text-xs font-bold uppercase tracking-wider ${searchMode === 'manual' ? 'text-slate-800' : 'text-slate-500'}`}>Intuitiva</p>
                                            <p className="text-[10px] text-slate-400 leading-tight">Enter para pesquisar</p>
                                        </div>
                                    </button>

                                    <button
                                        onClick={() => { setSearchMode('auto'); setIsModeSelectorOpen(false); }}
                                        className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors ${searchMode === 'auto' ? 'bg-emerald-50 border border-emerald-100' : 'hover:bg-slate-50'}`}
                                    >
                                        <div className={`p-2 rounded-md ${searchMode === 'auto' ? 'bg-white shadow-sm text-emerald-500' : 'bg-slate-100 text-slate-400'}`}>
                                            <Zap className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <p className={`text-xs font-bold uppercase tracking-wider ${searchMode === 'auto' ? 'text-emerald-700' : 'text-slate-500'}`}>Automática</p>
                                            <p className="text-[10px] text-slate-400 leading-tight">Pesquisa enquanto digita (Web)</p>
                                        </div>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
                {isScanningGlobal && (
                    <p className="text-[11px] text-emerald-600 font-bold mt-2 animate-pulse uppercase tracking-wider pl-1">
                        Varrendo bibliotecas digitais e bases acadêmicas globais...
                    </p>
                )}
            </div>

            <div className="pt-10 border-t border-slate-200">
                {!isSearchActive ? (
                    // ... (Hero section remains same as it's a large banner/ad)
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-1000">
                        <div className="relative group overflow-hidden rounded-[15px] border border-slate-100 shadow-xl bg-white aspect-[21/9] md:aspect-[3/1]">
                            <Image
                                src="/images/scientific-ad-natural-v3.png"
                                alt="AgroCientífico Moçambique"
                                fill
                                className="object-cover transition-transform duration-700 group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-gradient-to-r from-slate-900/90 via-slate-900/40 to-transparent flex flex-col justify-center px-10">
                                <div className="max-w-md space-y-4">
                                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 backdrop-blur-md">
                                        <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400">Destaque Científico</span>
                                    </div>
                                    <h2 className="text-3xl font-black text-white leading-tight uppercase">O FUTURO DO CAMPO É <span className="text-emerald-400">DIGITAL</span></h2>
                                    <p className="text-slate-200 text-sm font-medium leading-relaxed">
                                        Aceda ao maior repositório de inteligência agrícola de Moçambique. Pesquise teses, relatórios e papers globais validados academicamente.
                                    </p>
                                    <Link
                                        href="/repositorio"
                                        className="mt-4 px-8 py-3 bg-emerald-600 hover:bg-[#f97316] text-white rounded-[7px] text-xs font-black uppercase tracking-widest transition-all shadow-lg active:scale-95 flex items-center gap-2 group/btn w-fit"
                                    >
                                        Explorar Repositório
                                        <ArrowRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
                                    </Link>
                                </div>
                            </div>
                        </div>

                        {/* Secondary Scientific Cards / Features */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-10">
                            <div className="bg-emerald-50/50 p-6 rounded-[15px] border border-emerald-100/50 flex gap-4 items-start">
                                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm shrink-0 border border-emerald-100">
                                    <BookOpen className="w-6 h-6 text-emerald-600" />
                                </div>
                                <div>
                                    <h4 className="text-sm font-black text-slate-800 uppercase tracking-wider mb-2">Curadoria Nacional</h4>
                                    <p className="text-xs text-slate-500 font-medium leading-relaxed">Artigos verificados por especialistas do IIAM e UEM focado no solo moçambicano.</p>
                                </div>
                            </div>
                            <div className="bg-orange-50/50 p-6 rounded-[15px] border border-orange-100/50 flex gap-4 items-start">
                                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm shrink-0 border border-orange-100">
                                    <Search className="w-6 h-6 text-[#f97316]" />
                                </div>
                                <div>
                                    <h4 className="text-sm font-black text-slate-800 uppercase tracking-wider mb-2">Varredura Global</h4>
                                    <p className="text-xs text-slate-500 font-medium leading-relaxed">Conexão directa com Semantic Scholar para trazer as últimas inovações do agronegócio mundial.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-10">
                        {loading ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 3xl:grid-cols-5 4xl:grid-cols-6 gap-6">
                                {Array(6).fill(0).map((_, i) => (
                                    <div key={i} className="animate-pulse bg-white rounded-[20px] h-[400px] border border-slate-100 shadow-sm" />
                                ))}
                            </div>
                        ) : (
                            <>
                                {displayedArticles.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 3xl:grid-cols-5 4xl:grid-cols-6 gap-6 px-[30px]">
                                        {displayedArticles.map((article) => (
                                            <NewsCard
                                                key={article.id}
                                                title={article.title}
                                                subtitle={article.subtitle}
                                                category={article.type === 'external_article' ? 'Documento' : (article.type || 'Artigo')}
                                                date={article.date}
                                                image={article.image_url}
                                                slug={article.slug}
                                            />
                                        ))}
                                    </div>
                                ) : (
                                    <div className="py-20 text-center text-slate-400">
                                        Nenhum artigo encontrado para a sua pesquisa.
                                    </div>
                                )}

                                {/* Automatic Load More Sentinel */}
                                
                            </>
                        )}
                    </div>
                )}
            </div>
        </StandardBlogTemplate>
    );
}
