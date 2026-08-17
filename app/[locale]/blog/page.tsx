"use client";

import React, { useEffect, useState, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { StandardBlogTemplate } from "@/components/StandardBlogTemplate";
import {
    Calendar, Clock, ArrowRight, Search,
    ChevronRight, Tag, Newspaper,
    ThumbsUp, MessageCircle, FileText, FolderOpen
} from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { WeatherSidebar } from "@/components/WeatherSidebar";
import { NewsletterCard } from "@/components/NewsletterCard";
import { NewsCard } from "@/components/NewsCard";
import { NewsHeroSlider } from "@/components/NewsHeroSlider";
import { Spinner } from "@/components/ui/spinner";

function BlogContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const supabase = createClient();

    const [articles, setArticles] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [activeCategory, setActiveCategory] = useState("Todos");
    const [isSearchOpen, setIsSearchOpen] = useState(false);

    const ITEMS_PER_PAGE = 12;
    const [currentPage, setCurrentPage] = useState(1);

    // Reset page when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, activeCategory]);

    useEffect(() => {
        const cat = searchParams?.get('cat');
        if (cat) {
            setActiveCategory(cat);
        }
    }, [searchParams]);

    const newsTypes = ['Notícia', 'Internacional', 'Guia', 'Evento', 'Oportunidade', 'Curiosidade', 'Recursos', 'Mulher Agro', 'Ambiente', 'Mercado'];

    useEffect(() => {
        const fetchContent = async (isInitialLoad: boolean) => {
            if (isInitialLoad) setLoading(true);
            try {

                // Fetch news articles (explicitly included types)
                const { data: articlesData, error: articlesError } = await supabase
                    .from('articles')
                    // NOTA: 'categories' só pode entrar aqui depois de aplicada a migração
                    // 20260817_add_article_categories.sql (a coluna ainda não existe em
                    // produção) — pedi-la antes disso parte esta query inteira.
                    .select('id, title, subtitle, image_url, date, slug, type')
                    .is('deleted_at', null)
                    .in('type', newsTypes)
                    .order('date', { ascending: false });

                if (articlesError) {
                    console.error("Articles error:", articlesError.message || articlesError.code || JSON.stringify(articlesError));
                    throw articlesError;
                }

                setArticles(articlesData || []);
            } catch (error: any) {
                // Falhas de rede pontuais (ex: servidor de dev a reiniciar) não devem
                // limpar a lista já carregada — mantém o último estado válido.
                console.error("Error fetching content:", error?.message || error);
            } finally {
                if (isInitialLoad) setLoading(false);
            }
        };

        fetchContent(true);

        // Add refresh interval to ensure data is current (background, no loading flash)
        const interval = setInterval(() => fetchContent(false), 30000);

        return () => clearInterval(interval);
    }, []);

    const filteredArticles = articles.filter(article => {
        const matchesSearch = article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            article.subtitle.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesCategory = activeCategory === "Todos" || article.type === activeCategory || (article.categories || []).includes(activeCategory);

        return matchesSearch && matchesCategory;
    });

    const totalPages = Math.ceil(filteredArticles.length / ITEMS_PER_PAGE);
    const displayedArticles = filteredArticles.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    const handleCategoryChange = (cat: string) => {
        setActiveCategory(cat);
        // Update URL without reloading
        const params = new URLSearchParams(window.location.search);
        if (cat === "Todos") params.delete('cat');
        else params.set('cat', cat);
        router.push(`/blog?${params.toString()}`, { scroll: false });
    };

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center pt-20">
                <div className="flex flex-col items-center gap-4">
                    <Spinner className="w-12 h-12" />
                    <p className="text-slate-400 font-black uppercase tracking-widest text-[10px]">Actualizando o Blog do Agro...</p>
                </div>
            </div>
        );
    }

    return (
        <StandardBlogTemplate
            title={<>Blog do <span className="text-[#f97316]">Agro</span></>}
            backgroundImage="https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?q=80&w=2000&auto=format&fit=crop"
            breadcrumbs={[
                { label: "Início", href: "/" },
                { label: "Blog", href: undefined }
            ]}
            hideHeader
            topFullWidthContent={
                <NewsHeroSlider
                    articles={articles}
                    onToggleSearch={() => setIsSearchOpen((o) => !o)}
                    isSearchOpen={isSearchOpen}
                />
            }
            stickyBar={
                <>
                    <div className="sticky top-[70px] md:top-[78px] z-30 bg-emerald-950/95 backdrop-blur-sm border-t border-b border-white/10 shadow-lg">
                        <div className="container-site mx-auto overflow-x-auto no-scrollbar">
                            <div className="flex items-stretch justify-start min-w-max h-11">
                                {["Todos", ...newsTypes].map((cat) => (
                                    <button
                                        key={cat}
                                        type="button"
                                        onClick={() => handleCategoryChange(cat)}
                                        className={`flex items-center px-4 text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all ${activeCategory === cat
                                            ? "bg-[#f97316] text-white"
                                            : "text-emerald-100/70 hover:text-white hover:bg-white/10"
                                            }`}
                                    >
                                        {cat === "Todos" ? "Todas notícias" : cat === "Notícia" ? "Informação" : cat}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                    <section className={`w-full bg-slate-50 overflow-hidden transition-all duration-700 ease-in-out ${isSearchOpen ? "max-h-[300px] opacity-100 py-6" : "max-h-0 opacity-0 py-0"}`}>
                        <div className="container-site">
                            <div className="relative bg-white rounded-[8px] shadow-sm h-12 flex items-center border border-gray-200 overflow-hidden">
                                <div className="pl-6 text-gray-400">
                                    <Search className="h-5 w-5" />
                                </div>
                                <input
                                    type="text"
                                    placeholder="Pesquisar notícias..."
                                    className="border-none shadow-none focus:outline-none focus:ring-0 text-base h-full bg-transparent placeholder:text-gray-400 flex-1 px-4 my-1 ml-2 rounded-[8px]"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    autoFocus={isSearchOpen}
                                />
                            </div>
                        </div>
                    </section>
                </>
            }
            sidebarComponents={
                <div className="space-y-5">
                    {/* 1. Clima */}
                    <WeatherSidebar />

                    {/* 2. Newsletter */}
                    <NewsletterCard />

                    {/* 3. Publicidade */}
                    <div className="relative aspect-[4/5] rounded-[10px] overflow-hidden group shadow-xl border border-emerald-500/20 bg-emerald-600 p-5">
                        <div className="absolute top-0 right-0 size-32 bg-emerald-400/20 blur-3xl rounded-full -mr-16 -mt-16"></div>

                        <div className="absolute inset-0 p-5 flex flex-col justify-end">
                            <p className="text-emerald-100 text-[10px] font-black uppercase tracking-widest mb-2">Publicidade</p>
                            <h4 className="text-white font-black text-xl mb-6 leading-tight">Sua marca aqui em destaque no blog</h4>
                            <Link href="/contactos">
                                <button className="bg-white text-emerald-700 px-8 py-4 rounded-[10px] text-[10px] font-black uppercase tracking-widest hover:bg-emerald-50 transition-all font-bold shadow-lg">Anunciar Agora</button>
                            </Link>
                        </div>
                    </div>
                </div>
            }
        >
            {/* News Articles Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {displayedArticles.map((article, i) => (
                    <NewsCard
                        key={i}
                        title={article.title}
                        category={article.type}
                        date={article.date}
                        image={article.image_url}
                        slug={article.slug}
                    />
                ))}
            </div>

            {/* Empty State */}
            {filteredArticles.length === 0 && (
                <div className="text-center py-20">
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center">
                            <Newspaper className="w-8 h-8 text-slate-400" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-700">
                            Nenhuma notícia encontrada
                        </h3>
                        <p className="text-slate-500 max-w-md">
                            Não há notícias correspondentes aos filtros selecionados.
                        </p>
                    </div>
                </div>
            )}

            {/* Pagination */}
            {filteredArticles.length > ITEMS_PER_PAGE && (
                <div className="flex justify-center items-center gap-2 mt-12">
                    <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:border-emerald-500 hover:text-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                        <ChevronRight className="w-5 h-5 rotate-180" />
                    </button>

                    <span className="text-sm font-bold text-slate-600 px-4">
                        Página {currentPage} de {totalPages}
                    </span>

                    <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:border-emerald-500 hover:text-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </div>
            )}
        </StandardBlogTemplate>
    );
}

export default function BlogListingPage() {
    return (
        <Suspense fallback={<div>Carregando...</div>}>
            <BlogContent />
        </Suspense>
    );
}
