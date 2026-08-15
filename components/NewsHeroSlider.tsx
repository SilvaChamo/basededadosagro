"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";

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
}

export function NewsHeroSlider({ articles }: NewsHeroSliderProps) {
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
            className="relative w-full h-[420px] md:h-[480px] overflow-hidden bg-slate-900"
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

            <div className="relative z-20 h-full container-site flex flex-col justify-end pb-14">
                <div className="max-w-2xl">
                    <div className="flex items-center gap-2 mb-4">
                        <span className="bg-[#f97316] text-white text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-[6px]">
                            {active.type || "Notícia"}
                        </span>
                        <span className="bg-emerald-600 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-[6px]">
                            Destaque
                        </span>
                    </div>

                    <Link href={`/artigos/${active.slug}`}>
                        <h2 className="text-white text-2xl md:text-4xl font-black leading-tight mb-3 hover:text-[#f97316] transition-colors line-clamp-3">
                            {active.title}
                        </h2>
                    </Link>

                    {active.subtitle && (
                        <p className="hidden md:block text-slate-200 text-sm mb-4 line-clamp-2">
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

            {slides.length > 1 && (
                <div className="absolute z-20 bottom-6 right-6 flex items-center gap-3">
                    <button
                        type="button"
                        onClick={() => setCurrent((prev) => (prev - 1 + slides.length) % slides.length)}
                        className="w-9 h-9 bg-white/15 hover:bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center transition-colors"
                        aria-label="Notícia anterior"
                    >
                        <ChevronLeft className="w-4 h-4 text-white" />
                    </button>

                    <div className="flex gap-1.5">
                        {slides.map((slide, i) => (
                            <button
                                key={slide.id}
                                type="button"
                                onClick={() => setCurrent(i)}
                                aria-label={`Ir para notícia ${i + 1}`}
                                className={`h-1.5 rounded-full transition-all ${i === current ? "w-6 bg-[#f97316]" : "w-1.5 bg-white/50 hover:bg-white/80"}`}
                            />
                        ))}
                    </div>

                    <button
                        type="button"
                        onClick={() => setCurrent((prev) => (prev + 1) % slides.length)}
                        className="w-9 h-9 bg-white/15 hover:bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center transition-colors"
                        aria-label="Próxima notícia"
                    >
                        <ChevronRight className="w-4 h-4 text-white" />
                    </button>
                </div>
            )}
        </div>
    );
}
