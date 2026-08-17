"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Calendar, ChevronLeft, ChevronRight, Search, X, ArrowRight } from "lucide-react";

interface HeroArticle {
    id: string;
    title: string;
    subtitle?: string;
    type?: string;
    date?: string;
    image_url?: string;
    slug: string;
}

interface NewsHeroSliderProps {
    articles: HeroArticle[];
    onToggleSearch?: () => void;
    isSearchOpen?: boolean;
}

export function NewsHeroSlider({
    articles,
    onToggleSearch,
    isSearchOpen = false,
}: NewsHeroSliderProps) {
    const slides = articles.filter((a) => a.image_url).slice(0, 5);
    const [current, setCurrent] = useState(0);
    const [paused, setPaused] = useState(false);

    useEffect(() => {
        if (slides.length <= 1 || paused) return;
        const interval = setInterval(() => {
            setCurrent((prev) => (prev + 1) % slides.length);
        }, 6000);
        return () => clearInterval(interval);
    }, [slides.length, paused]);

    if (slides.length === 0) return null;

    const active = slides[current];

    return (
        <div
            className="relative w-full h-[600px] md:h-[650px] overflow-hidden bg-slate-900"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
        >
            {slides.map((slide, i) => (
                <div
                    key={slide.id}
                    className={`absolute inset-0 transition-opacity duration-700 ${i === current ? "opacity-100 z-10" : "opacity-0 z-0"}`}
                >
                    <Image
                        src={slide.image_url!}
                        alt={slide.title}
                        fill
                        priority={i === 0}
                        sizes="100vw"
                        className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/10" />
                </div>
            ))}

            <div className="relative z-20 h-full container-site flex flex-col justify-center pt-28 pb-20 md:pt-32">
                <div className="max-w-2xl">
                    <div className="flex items-center gap-2 mb-4">
                        <span className="bg-[#f97316] text-white text-xs font-black uppercase tracking-widest px-3.5 py-2 rounded-[6px]">
                            {active.type || "Notícia"}
                        </span>
                        <span className="bg-emerald-600 text-white text-xs font-black uppercase tracking-widest px-3.5 py-2 rounded-[6px]">
                            Destaque
                        </span>
                    </div>

                    <Link href={`/artigos/${active.slug}`}>
                        <h2 className="text-white text-2xl md:text-[42px] font-black leading-tight mb-3 hover:text-[#f97316] transition-colors">
                            {active.title}
                        </h2>
                    </Link>

                    {active.subtitle && (
                        <p className="hidden md:block text-slate-200 text-base mb-4 line-clamp-2">
                            {active.subtitle}
                        </p>
                    )}

                    <div className="flex items-center gap-2 text-slate-300 text-xs font-bold uppercase tracking-wider">
                        <Calendar className="w-3.5 h-3.5 text-[#f97316]" />
                        {new Date(active.date || Date.now()).toLocaleDateString("pt-PT", {
                            day: "2-digit",
                            month: "long",
                            year: "numeric",
                        })}
                    </div>
                </div>
            </div>

            {/* Explorar artigo + navegação do slide + botão de pesquisa: mesma linha, fixa no fundo do banner em todas as notícias */}
            <div className="absolute bottom-6 inset-x-0 w-full z-20 pointer-events-none">
                <div className="container-site mx-auto flex items-center justify-between gap-3">
                    <Link
                        href={`/artigos/${active.slug}`}
                        className="flex items-center gap-2 text-sm font-bold text-emerald-600 hover:text-[#f97316] transition-colors pointer-events-auto"
                    >
                        Explorar artigo <ArrowRight className="h-4 w-4" />
                    </Link>

                    <div className="flex items-center gap-[22px]">
                        {slides.length > 1 && (
                            <div className="flex items-center gap-2 pointer-events-auto">
                                <button
                                    type="button"
                                    onClick={() => setCurrent((prev) => (prev - 1 + slides.length) % slides.length)}
                                    className="w-10 h-10 bg-black/40 hover:bg-black/60 backdrop-blur-md border border-white/30 shadow-lg rounded-full flex items-center justify-center transition-colors"
                                    aria-label="Notícia anterior"
                                >
                                    <ChevronLeft className="w-5 h-5 text-white" />
                                </button>

                                <div className="flex items-center gap-1.5">
                                    {slides.map((slide, i) => (
                                        <button
                                            key={slide.id}
                                            type="button"
                                            onClick={() => setCurrent(i)}
                                            aria-label={`Ir para notícia ${i + 1}`}
                                            className={`h-2 rounded-full transition-all ${i === current ? "w-7 bg-[#f97316]" : "w-2 bg-white/50 hover:bg-white/80"}`}
                                        />
                                    ))}
                                </div>

                                <button
                                    type="button"
                                    onClick={() => setCurrent((prev) => (prev + 1) % slides.length)}
                                    className="w-10 h-10 bg-black/40 hover:bg-black/60 backdrop-blur-md border border-white/30 shadow-lg rounded-full flex items-center justify-center transition-colors"
                                    aria-label="Próxima notícia"
                                >
                                    <ChevronRight className="w-5 h-5 text-white" />
                                </button>
                            </div>
                        )}

                        {onToggleSearch && (
                            <button
                                type="button"
                                onClick={onToggleSearch}
                                className={`w-12 h-12 rounded-[7px] flex items-center justify-center transition-all duration-300 shadow-xl pointer-events-auto animate-in fade-in slide-in-from-bottom-8 duration-700 ${isSearchOpen
                                    ? "bg-transparent text-[#f97316] rotate-90 border-0 shadow-none"
                                    : "bg-[#22c55e] text-white hover:bg-[#f97316] hover:scale-110"
                                    }`}
                                aria-label={isSearchOpen ? "Fechar pesquisa" : "Abrir pesquisa"}
                            >
                                {isSearchOpen ? <X className="w-6 h-6" /> : <Search className="w-6 h-6" />}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
