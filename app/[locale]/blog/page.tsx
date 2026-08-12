"use client";

import React, { useEffect, useState, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { StandardBlogTemplate } from "@/components/StandardBlogTemplate";
import {
    Calendar, Clock, ArrowRight, Search,
    Filter, ChevronRight, Tag, Newspaper,
    ThumbsUp, MessageCircle, RefreshCw, FileText, FolderOpen
} from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { WeatherSidebar } from "@/components/WeatherSidebar";
import { NewsletterCard } from "@/components/NewsletterCard";
import { NewsCard } from "@/components/NewsCard";

function BlogContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const supabase = createClient();

    const [articles, setArticles] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [activeCategory, setActiveCategory] = useState("Todos");
    const [refreshing, setRefreshing] = useState(false);

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

    const newsTypes = ['Internacional', 'Guia', 'Evento', 'Oportunidade', 'Curiosidade', 'Recursos', 'Mulher Agro'];

    useEffect(() => {
        const fetchContent = async () => {
            setLoading(true);
            try {

                // Fetch news articles (explicitly included types)
                const { data: articlesData, error: articlesError } = await supabase
                    .from('articles')
                    .select('id, title, subtitle, image_url, date, slug, type')
                    .is('deleted_at', null)
                    .in('type', newsTypes)
                    .order('date', { ascending: false });

                if (articlesError) {
                    console.error("Articles error:", articlesError);
                    throw articlesError;
                }

                setArticles(articlesData || []);
            } catch (error) {
                console.error("Error fetching content:", error);
            } finally {
                setLoading(false);
                setRefreshing(false);
            }
        };

        fetchContent();

        // Add refresh interval to ensure data is current
        const interval = setInterval(fetchContent, 30000); // Refresh every 30 seconds

        return () => clearInterval(interval);
    }, []);

    const manualRefresh = async () => {
        setRefreshing(true);
        try {

            // Refresh articles
            const { data: articlesData, error: articlesError } = await supabase
                .from('articles')
                .select('id, title, subtitle, image_url, date, slug, type')
                .is('deleted_at', null)
                .in('type', newsTypes)
                .order('date', { ascending: false })
                .abortSignal(new AbortController().signal);

            if (articlesError) {
                console.error("Manual refresh articles error:", articlesError);
                throw articlesError;
            }

            setArticles(articlesData || []);
        } catch (error) {
            console.error("Manual refresh failed:", error);
        } finally {
            setRefreshing(false);
        }
    };

    const filteredArticles = articles.filter(article => {
        const matchesSearch = article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            article.subtitle.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesCategory = activeCategory === "Todos" || article.type === activeCategory;

        return matchesSearch && matchesCategory;
    });

    const totalPages = Math.ceil(filteredArticles.length / ITEMS_PER_PAGE);
    const displayedArticles = filteredArticles.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const cat = e.target.value;
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
                    <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
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
            sidebarComponents={
                <div className="space-y-5">
                    {/* 2. Clima */}
                    <WeatherSidebar />

                    {/* 3. Newsletter */}
                    <NewsletterCard />

                    {/* 4. Publicidade */}
                    <div className="relative aspect-[4/5] rounded-[10px] overflow-hidden group shadow-xl border border-emerald-500/20 bg-emerald-600 p-5">
                        <div className="absolute inset-0 opacity-20 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
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
            <div className="flex flex-col md:flex-row gap-4 mb-10 items-center justify-between">

                <div className="flex flex-1 w-full gap-4">
                    <div className="relative flex-1 group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-[#f97316] transition-colors" />
                        <input
                            type="text"
                            placeholder="Pesquisar notícias..."
                            className="w-full bg-white border border-slate-200 rounded-[10px] pl-12 pr-4 py-3 text-sm focus:outline-none focus:border-[#f97316] focus:ring-1 focus:ring-[#f97316] shadow-sm transition-all"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <div className="relative w-full md:w-64">
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                            <Filter className="w-4 h-4" />
                        </div>
                        <select
                            value={activeCategory}
                            onChange={handleCategoryChange}
                            className="w-full appearance-none bg-white border border-slate-200 rounded-[10px] pl-4 pr-10 py-3 text-sm focus:outline-none focus:border-[#f97316] focus:ring-1 focus:ring-[#f97316] shadow-sm transition-all text-slate-600 font-medium cursor-pointer"
                        >
                            <option value="Todos">Todas as Categorias</option>
                            {newsTypes.map((type) => (
                                <option key={type} value={type}>{type}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="hidden md:flex gap-3 items-center">
                    <button
                        onClick={manualRefresh}
                        disabled={refreshing}
                        className="bg-white border border-slate-200 rounded-[8px] p-3 text-slate-500 hover:border-[#f97316] hover:text-[#f97316] transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Atualizar conteúdo"
                    >
                        <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                    </button>
                </div>
            </div>

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
