"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { Play, Mic, Clock, User, ArrowLeft, X, ChevronRight } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

interface PodcastEpisode {
    id: string;
    title: string;
    specialist_name: string;
    specialist_role?: string;
    duration: string;
    category: string;
    thumbnail_url: string;
    video_url: string;
    description?: string;
    is_active: boolean;
    is_featured: boolean;
    published_at: string;
}

interface PodcastCategory {
    id: string;
    name: string;
    slug: string;
    description?: string;
}

export default function AgroCastPage() {
    const [episodes, setEpisodes] = useState<PodcastEpisode[]>([]);
    const [categories, setCategories] = useState<PodcastCategory[]>([]);
    const [activeCategory, setActiveCategory] = useState<string>("todos");
    const [activeEpisode, setActiveEpisode] = useState<PodcastEpisode | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const abortController = new AbortController();

        const fetchData = async () => {
            const supabase = createClient();

            const [episodesRes, categoriesRes] = await Promise.all([
                supabase
                    .from("podcasts")
                    .select("*")
                    .eq("is_active", true)
                    .order("is_featured", { ascending: false })
                    .order("published_at", { ascending: false })
                    .abortSignal(abortController.signal),
                supabase
                    .from("podcast_categories")
                    .select("*")
                    .eq("is_active", true)
                    .order("name")
                    .abortSignal(abortController.signal),
            ]);

            if (episodesRes.error) {
                if (episodesRes.error.message?.includes("AbortError")) return;
                console.error("Error fetching episodes:", episodesRes.error.message);
            }
            if (categoriesRes.error) {
                if (categoriesRes.error.message?.includes("AbortError")) return;
                console.error("Error fetching categories:", categoriesRes.error.message);
            }

            setEpisodes(episodesRes.data || []);
            setCategories(categoriesRes.data || []);
            setLoading(false);
        };

        fetchData();
        return () => abortController.abort();
    }, []);

    const filteredEpisodes = activeCategory === "todos"
        ? episodes
        : episodes.filter((ep) => ep.category === activeCategory);

    const handlePlayEpisode = useCallback((episode: PodcastEpisode) => {
        setActiveEpisode(episode);
        window.scrollTo({ top: 0, behavior: "smooth" });
    }, []);

    const closePlayer = useCallback(() => {
        setActiveEpisode(null);
    }, []);

    return (
        <main className="min-h-screen bg-[#F8FAFC]">
            {/* Hero / Header */}
            <section className="bg-slate-900 relative overflow-hidden">
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[60%] bg-emerald-500/10 rounded-full blur-[120px]" />
                    <div className="absolute -bottom-[20%] -right-[10%] w-[50%] h-[60%] bg-orange-500/10 rounded-full blur-[120px]" />
                </div>

                <div className="container-site relative z-10 pt-32 pb-12">
                    <a
                        href="/#agrocast"
                        className="inline-flex items-center gap-2 text-white/60 hover:text-white transition-colors text-sm font-medium mb-8"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Voltar ao início
                    </a>

                    <div className="flex items-center gap-4 mb-4">
                        <div className="bg-emerald-600 p-3 rounded-xl">
                            <Mic className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl md:text-4xl font-black text-white m-0">
                                AgroCast
                            </h1>
                            <p className="text-white/60 text-sm font-medium mt-1">
                                Episódios, entrevistas e debates sobre o agronegócio
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Active Episode Player */}
            {activeEpisode && (
                <section className="bg-slate-900 border-t border-slate-800">
                    <div className="container-site py-8">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <span className="bg-emerald-600 text-white text-[10px] font-black uppercase px-3 py-1 rounded-full">
                                    A reproduzir
                                </span>
                                <h2 className="text-white font-bold text-lg m-0 line-clamp-1">
                                    {activeEpisode.title}
                                </h2>
                            </div>
                            <button
                                onClick={closePlayer}
                                className="text-white/60 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-lg"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="relative overflow-hidden bg-black rounded-xl aspect-video max-h-[500px]">
                            <iframe
                                src={`${activeEpisode.video_url}${activeEpisode.video_url.includes("?") ? "&" : "?"}autoplay=1`}
                                title={activeEpisode.title}
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                                className="w-full h-full absolute inset-0"
                            />
                        </div>
                        <div className="mt-4 flex items-center gap-4 text-white/70 text-sm">
                            <div className="flex flex-col">
                                <span className="flex items-center gap-1.5 text-white font-bold">
                                    <User className="w-4 h-4 text-[#f97316]" />
                                    {activeEpisode.specialist_name}
                                </span>
                                {activeEpisode.specialist_role && (
                                    <span className="text-white/50 text-xs ml-[22px]">{activeEpisode.specialist_role}</span>
                                )}
                            </div>
                            <span className="flex items-center gap-1.5">
                                <Clock className="w-4 h-4 text-[#f97316]" />
                                {activeEpisode.duration}
                            </span>
                            <span className="bg-slate-800 text-white/80 text-xs font-bold px-3 py-1 rounded-full">
                                {activeEpisode.category}
                            </span>
                        </div>
                        {activeEpisode.description && activeEpisode.description.trim() !== "" && (
                            <p className="text-white/50 text-sm mt-3 max-w-3xl leading-relaxed">
                                {activeEpisode.description}
                            </p>
                        )}
                    </div>
                </section>
            )}

            {/* Category Tabs + Episodes Grid */}
            <section className="container-site !pt-[50px] !pb-[100px]">
                {/* Category Tabs */}
                <div className="flex items-center gap-2 flex-wrap mb-10">
                    <button
                        onClick={() => setActiveCategory("todos")}
                        className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all duration-200 ${activeCategory === "todos"
                            ? "bg-emerald-600 text-white shadow-lg shadow-emerald-500/20"
                            : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                            }`}
                    >
                        Todos
                    </button>
                    {categories.map((cat) => (
                        <button
                            key={cat.id}
                            onClick={() => setActiveCategory(cat.name)}
                            className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all duration-200 ${activeCategory === cat.name
                                ? "bg-emerald-600 text-white shadow-lg shadow-emerald-500/20"
                                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                                }`}
                        >
                            {cat.name}
                        </button>
                    ))}
                </div>

                {/* Results count */}
                <p className="text-slate-400 text-sm font-medium mb-6">
                    {filteredEpisodes.length} episódio{filteredEpisodes.length !== 1 ? "s" : ""} encontrado{filteredEpisodes.length !== 1 ? "s" : ""}
                    {activeCategory !== "todos" && (
                        <span> em <strong className="text-slate-600">{activeCategory}</strong></span>
                    )}
                </p>

                {/* Loading State */}
                {loading && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <div key={i} className="animate-pulse">
                                <div className="bg-slate-200 rounded-xl aspect-video mb-4" />
                                <div className="bg-slate-200 h-5 rounded w-3/4 mb-2" />
                                <div className="bg-slate-100 h-4 rounded w-1/2" />
                            </div>
                        ))}
                    </div>
                )}

                {/* Episodes Grid */}
                {!loading && filteredEpisodes.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-8">
                        {filteredEpisodes.map((episode) => (
                            <div
                                key={episode.id}
                                onClick={() => handlePlayEpisode(episode)}
                                className="group cursor-pointer bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-xl hover:shadow-[#f97316]/10 hover:border-[#f97316]/60 transition-all duration-300"
                            >
                                {/* Thumbnail */}
                                <div className="relative overflow-hidden aspect-video bg-slate-100">
                                    {episode.thumbnail_url ? (
                                        <Image
                                            src={episode.thumbnail_url}
                                            alt={episode.title}
                                            fill
                                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-slate-800">
                                            <Mic className="w-12 h-12 text-slate-600" />
                                        </div>
                                    )}
                                    {/* Play Overlay */}
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-300 flex items-center justify-center">
                                        <div className="w-14 h-14 bg-white/90 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 scale-75 group-hover:scale-100 transition-all duration-300 shadow-xl">
                                            <Play className="w-6 h-6 text-emerald-600 fill-emerald-600 ml-0.5" />
                                        </div>
                                    </div>
                                    {/* Duration */}
                                    <div className="absolute bottom-2 right-2 bg-black/80 text-white text-[10px] font-bold px-2 py-1 rounded-md flex items-center gap-1">
                                        <Clock className="w-3 h-3" />
                                        {episode.duration}
                                    </div>
                                    {/* Featured Badge */}
                                    {episode.is_featured && (
                                        <div className="absolute top-2 left-2 bg-[#f97316] text-white text-[10px] font-black uppercase px-2 py-0.5 rounded-md">
                                            ★ Destaque
                                        </div>
                                    )}
                                </div>

                                {/* Info */}
                                <div className="p-4 space-y-2">
                                    <span className="text-emerald-600 text-[11px] font-black uppercase tracking-wider">
                                        {episode.category}
                                    </span>
                                    <h3 className="text-base font-bold text-slate-900 leading-snug group-hover:text-emerald-600 transition-colors line-clamp-2 m-0">
                                        {episode.title}
                                    </h3>
                                    {episode.description && episode.description.trim() !== "" && (
                                        <p className="text-slate-500 text-xs leading-relaxed line-clamp-2 m-0">
                                            {episode.description}
                                        </p>
                                    )}
                                    <div className="flex flex-col pt-1 border-t border-slate-100 mt-3">
                                        <span className="text-slate-800 text-xs font-bold">
                                            {episode.specialist_name}
                                        </span>
                                        {episode.specialist_role && (
                                            <span className="text-slate-400 text-[11px]">
                                                {episode.specialist_role}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Empty State */}
                {!loading && filteredEpisodes.length === 0 && (
                    <div className="text-center py-20">
                        <Mic className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-slate-400 mb-2">
                            Nenhum episódio encontrado
                        </h3>
                        <p className="text-slate-400 text-sm">
                            {activeCategory !== "todos"
                                ? `Ainda não há episódios na categoria "${activeCategory}".`
                                : "Ainda não há episódios publicados."}
                        </p>
                        {activeCategory !== "todos" && (
                            <button
                                onClick={() => setActiveCategory("todos")}
                                className="mt-4 text-emerald-600 text-sm font-bold hover:underline"
                            >
                                Ver todos os episódios
                            </button>
                        )}
                    </div>
                )}
            </section>
        </main>
    );
}
