"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import {
    Cpu, Leaf, BookOpen,
    ArrowRight,
    Scale, TreePalm, Coins,
    ChevronLeft, ChevronRight,
    ScanLine, QrCode, MessageSquare, Presentation
} from "lucide-react";
import * as LucideIcons from "lucide-react";
import { useTranslations, useLocale } from 'next-intl';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';

type CategoryCard = {
    titleKey?: string;
    descKey?: string;
    title?: string;
    description?: string;
    icon: any;
    dark?: boolean;
    iconBg?: string;
    iconColor?: string;
    href: string;
};

const EXEMPLARY_CATEGORIES: CategoryCard[] = [
    {
        titleKey: "exemplary_categories.rural_tourism.title",
        descKey: "exemplary_categories.rural_tourism.description",
        icon: LucideIcons.Luggage,
        iconBg: "bg-red-50",
        iconColor: "text-red-500",
        href: "/produtos?q=turismo"
    },
    {
        titleKey: "exemplary_categories.agri_tech.title",
        descKey: "exemplary_categories.agri_tech.description",
        icon: LucideIcons.Cpu,
        dark: true,
        iconColor: "text-white",
        href: "/produtos?q=tecnologia"
    },
    {
        titleKey: "exemplary_categories.agri_policies.title",
        descKey: "exemplary_categories.agri_policies.description",
        icon: LucideIcons.Scale,
        iconBg: "bg-blue-50",
        iconColor: "text-blue-500",
        href: "/documentos"
    },
    {
        titleKey: "exemplary_categories.agri_inputs.title",
        descKey: "exemplary_categories.agri_inputs.description",
        icon: LucideIcons.Leaf,
        dark: true,
        iconColor: "text-white",
        href: "/produtos?q=insumo"
    },
    {
        titleKey: "exemplary_categories.agri_finance.title",
        descKey: "exemplary_categories.agri_finance.description",
        icon: LucideIcons.Coins,
        iconBg: "bg-yellow-50",
        iconColor: "text-yellow-500",
        href: "/produtos?q=financiamento"
    },
    {
        titleKey: "exemplary_categories.scientific_articles.title",
        descKey: "exemplary_categories.scientific_articles.description",
        icon: LucideIcons.BookOpen,
        dark: true,
        iconColor: "text-white",
        href: "/artigos"
    }
];

const RESOURCE_CARDS: CategoryCard[] = [
    {
        titleKey: "resource_cards.massive_comm.title",
        descKey: "resource_cards.massive_comm.description",
        icon: MessageSquare,
        iconBg: "bg-orange-50",
        iconColor: "text-[#f97316]",
        href: "/inovacao/comunicacao-sms"
    },
    {
        titleKey: "resource_cards.visual_pres.title",
        descKey: "resource_cards.visual_pres.description",
        icon: Presentation,
        dark: true,
        iconColor: "text-white",
        href: "/inovacao/apresentacoes"
    },
    {
        titleKey: "resource_cards.digital_identity.title",
        descKey: "resource_cards.digital_identity.description",
        icon: QrCode,
        iconBg: "bg-blue-50",
        iconColor: "text-blue-500",
        href: "/inovacao/perfil-digital"
    },
    {
        titleKey: "resource_cards.agrobotanica.title",
        descKey: "resource_cards.agrobotanica.description",
        icon: ScanLine,
        dark: true,
        iconColor: "text-white",
        href: "/inovacao/agrobotanica"
    }
];

interface InfoSectionProps {
    initialArticles?: any[];
}

export function InfoSection({ initialArticles = [] }: InfoSectionProps) {
    const t = useTranslations('InfoSection');
    const locale = useLocale();
    const [activeTab, setActiveTab] = useState("informacoes");
    const bgRef = useRef<HTMLImageElement>(null);

    // Categorias são sempre as mesmas (EXEMPLARY_CATEGORIES) — não há
    // necessidade de as ir buscar ao Supabase.
    const categoryCards = EXEMPLARY_CATEGORIES;
    // Artigos/notícias já vêm pré-carregados do servidor (page.tsx), evitando
    // um pedido lento a partir do browser do visitante que deixava esta
    // secção presa em "A carregar informações..." por vários segundos.
    const articlesData = initialArticles;

    useEffect(() => {
        const handleScroll = () => {
            if (bgRef.current) {
                const section = bgRef.current.parentElement;
                if (!section) return;

                const rect = section.getBoundingClientRect();
                const scrolled = window.scrollY;
                const offsetTop = rect.top + scrolled;

                const distance = scrolled - offsetTop;
                bgRef.current.style.transform = `translateY(${distance * 0.3}px)`;
            }
        };

        window.addEventListener("scroll", handleScroll, { passive: true });
        handleScroll();

        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const [emblaRef, emblaApi] = useEmblaCarousel(
        { loop: true, align: 'start', skipSnaps: false },
        [Autoplay({ delay: 5000, stopOnInteraction: true, stopOnMouseEnter: true })]
    );

    const [selectedIndex, setSelectedIndex] = useState(0);
    const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);

    const scrollPrev = React.useCallback(() => emblaApi && emblaApi.scrollPrev(), [emblaApi]);
    const scrollNext = React.useCallback(() => emblaApi && emblaApi.scrollNext(), [emblaApi]);
    const scrollTo = React.useCallback((index: number) => emblaApi && emblaApi.scrollTo(index), [emblaApi]);

    const onSelect = React.useCallback(() => {
        if (!emblaApi) return;
        setSelectedIndex(emblaApi.selectedScrollSnap());
    }, [emblaApi, setSelectedIndex]);

    useEffect(() => {
        if (!emblaApi) return;
        onSelect();
        setScrollSnaps(emblaApi.scrollSnapList());
        emblaApi.on('select', onSelect);
        emblaApi.on('reInit', onSelect);
    }, [emblaApi, setScrollSnaps, onSelect]);


    return (
        <section className="w-full bg-transparent relative" id="informacao">
            <div className="w-full bg-[#111827] relative h-[320px] overflow-hidden flex items-center">
                {/* Dynamic Glowing Blobs for Premium Feel */}
                <div className="absolute inset-0 z-0 overflow-hidden">
                    <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[80%] bg-[#f97316]/20 rounded-full blur-[120px] animate-pulse-slow" />
                    <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[90%] bg-emerald-500/10 rounded-full blur-[120px] animate-pulse-delayed" />
                    <div className="absolute top-[30%] left-[30%] w-[40%] h-[40%] bg-blue-500/5 rounded-full blur-[100px] animate-pulse" />
                </div>

                <img
                    ref={bgRef}
                    src="https://images.unsplash.com/photo-1592982537447-7440770cbfc9?q=80&w=2672&auto=format&fit=crop"
                    alt="Background"
                    className="absolute inset-x-0 top-0 w-full h-[150%] object-cover z-0 opacity-40 pointer-events-none transition-transform duration-100 ease-out"
                />

                <div className="absolute inset-0 bg-gradient-to-b from-[#111827]/90 via-[#111827]/40 to-[#111827]/90 z-[1]" />

                <div className="container-site text-center space-y-4 relative z-10">
                    <div className="space-y-4 max-w-4xl mx-auto">
                        <div className="flex items-center justify-center gap-4">
                            <span className="w-[20px] h-[1px] bg-white opacity-60"></span>
                            <span className="text-[#f97316] text-xs font-black uppercase tracking-[0.3em] shadow-sm">
                                {t('badge')}
                            </span>
                            <span className="w-[20px] h-[1px] bg-white opacity-60"></span>
                        </div>
                        <h2 className="text-[28px] md:text-[45px] font-black text-white tracking-tight mt-3">
                            {t('title')}
                        </h2>
                        <p className="text-slate-200 text-sm leading-tight max-w-3xl mx-auto font-medium">
                            {t('description')}
                        </p>
                    </div>

                    <div className="inline-flex items-center gap-4 flex-wrap justify-center mt-[25px]">
                        <button
                            onClick={() => setActiveTab("informacoes")}
                            className={`px-8 py-[8.5px] rounded-[7px] text-sm font-medium transition-all backdrop-blur-md border transition-all duration-300 ${activeTab === "informacoes"
                                ? "bg-[#f97316] border-[#f97316] text-white shadow-[0_0_20px_rgba(249,115,22,0.4)]"
                                : "bg-white/10 border-white/20 text-white hover:bg-white/20 hover:border-[#f97316]"
                                }`}
                        >
                            {t('tabs.info')}
                        </button>
                        <button
                            onClick={() => setActiveTab("recursos")}
                            className={`px-8 py-[8.5px] rounded-[7px] text-sm font-medium transition-all backdrop-blur-md border transition-all duration-300 ${activeTab === "recursos"
                                ? "bg-[#f97316] border-[#f97316] text-white shadow-[0_0_20px_rgba(249,115,22,0.4)]"
                                : "bg-white/10 border-white/20 text-white hover:bg-white/20 hover:border-[#f97316]"
                                }`}
                        >
                            {t('tabs.resources')}
                        </button>
                        <button
                            onClick={() => setActiveTab("categorias")}
                            className={`px-8 py-[8.5px] rounded-[7px] text-sm font-medium transition-all backdrop-blur-md border transition-all duration-300 ${activeTab === "categorias"
                                ? "bg-[#f97316] border-[#f97316] text-white shadow-[0_0_20px_rgba(249,115,22,0.4)]"
                                : "bg-white/10 border-white/20 text-white hover:bg-white/20 hover:border-[#f97316]"
                                }`}
                        >
                            {t('tabs.categories')}
                        </button>
                    </div>
                </div>
            </div>

            <div className="container-site relative z-20 mt-[40px] pb-24">
                <div className="animate-in fade-in duration-700 slide-in-from-bottom-8">
                    <>
                            {activeTab === "categorias" && (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-agro px-[40px]">
                                    {categoryCards.map((card: any, idx: number) => {
                                        const title = card.titleKey ? t(card.titleKey) : card.title;
                                        const description = card.descKey ? t(card.descKey) : card.description;

                                        return (
                                            <Link
                                                key={idx}
                                                href={card.href || "#"}
                                                className={`p-[15px] rounded-agro text-left transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl flex flex-col gap-[15px] group cursor-pointer border h-full ${card.dark
                                                    ? "bg-[#374151] text-white border-slate-600 shadow-xl shadow-slate-900/20"
                                                    : "bg-white text-[#3a3f47] border-slate-200 shadow-lg shadow-slate-200/50"
                                                    }`}
                                            >
                                                <div className={`w-14 h-14 rounded-[5px] flex items-center justify-center shrink-0 ${card.dark ? "bg-transparent border border-white/20" : "bg-slate-200"} ${title.toLowerCase().includes('visibilidade') ||
                                                    title.toLowerCase().includes('crescimento') ||
                                                    title.toLowerCase().includes('scanner') ||
                                                    title.toLowerCase().includes('doctor')
                                                    ? "border-2 border-[#f97316]"
                                                    : ""
                                                    } ${card.iconBg || ""}`}>
                                                    <card.icon className={`h-7 w-7 ${card.dark ? card.iconColor : "text-slate-600"}`} />
                                                </div>
                                                <div className="flex flex-col gap-1 h-full">
                                                    <h3 className={`text-xl font-black leading-tight first-letter:uppercase lowercase ${card.dark ? "text-white" : "text-[#3a3f47]"}`} suppressHydrationWarning>
                                                        <span>{title}</span>
                                                    </h3>
                                                    <p className={`text-base leading-tight ${card.dark ? "text-slate-300" : "text-slate-500"} line-clamp-4`}>
                                                        {description}
                                                    </p>
                                                    <div className={`mt-auto pt-2 flex items-center gap-2 text-xs font-bold tracking-wide ${card.dark ? "text-white/70" : "text-slate-400"} group-hover:text-[#f97316] transition-colors`}>
                                                        {t('view_details')}
                                                        <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                                                    </div>
                                                </div>
                                            </Link>
                                        );
                                    })}
                                </div>
                            )}

                            {activeTab === "recursos" && (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-agro px-[20px]">
                                    {RESOURCE_CARDS.map((card: any, idx: number) => {
                                        const title = card.titleKey ? t(card.titleKey) : card.title;
                                        const description = card.descKey ? t(card.descKey) : card.description;

                                        return (
                                            <Link
                                                key={idx}
                                                href={card.href || "#"}
                                                className={`p-[20px] rounded-agro text-left transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl flex flex-col gap-[15px] group cursor-pointer border h-full ${card.dark
                                                    ? "bg-[#374151] text-white border-slate-600 shadow-xl shadow-slate-900/20"
                                                    : "bg-white text-[#3a3f47] border-slate-200 shadow-lg shadow-slate-200/50"
                                                    }`}
                                            >
                                                <div className={`w-14 h-14 rounded-[8px] flex items-center justify-center shrink-0 ${card.dark ? "bg-emerald-600/20 border border-white/10" : "bg-slate-100 border border-slate-200"} ${card.iconBg || ""}`}>
                                                    <card.icon className={`h-7 w-7 ${card.dark ? card.iconColor : "text-slate-600"} ${card.iconColor || ""}`} />
                                                </div>
                                                <div className="flex flex-col gap-1 h-full">
                                                    <h3 className={`text-lg font-black leading-tight ${card.dark ? "text-white" : "text-slate-800"}`}>
                                                        {title}
                                                    </h3>
                                                    <p className={`text-xs leading-snug ${card.dark ? "text-slate-300" : "text-slate-500"}`}>
                                                        {description}
                                                    </p>
                                                    <div className={`mt-auto pt-2 flex items-center gap-2 text-[10px] font-black uppercase tracking-wider ${card.dark ? "text-white/60" : "text-slate-400"} group-hover:text-[#f97316] transition-colors`}>
                                                        {t('access_now')}
                                                        <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-1" />
                                                    </div>
                                                </div>
                                            </Link>
                                        );
                                    })}
                                </div>
                            )}

                            {activeTab === "informacoes" && (
                                <div className="space-y-6">
                                    <div className="flex items-center justify-between px-4 md:px-[10px] mb-4">
                                        <div className="flex items-center gap-3">
                                            <button
                                                onClick={scrollPrev}
                                                className="w-10 h-10 rounded-full bg-white shadow-md border border-slate-100 flex items-center justify-center text-[#f97316] hover:bg-[#f97316] hover:text-white transition-all"
                                                aria-label={t('aria.prev_news')}
                                            >
                                                <ChevronLeft className="h-6 w-6" />
                                            </button>
                                            <button
                                                onClick={scrollNext}
                                                className="w-10 h-10 rounded-full bg-white shadow-md border border-slate-100 flex items-center justify-center text-[#f97316] hover:bg-[#f97316] hover:text-white transition-all"
                                                aria-label={t('aria.next_news')}
                                            >
                                                <ChevronRight className="h-6 w-6" />
                                            </button>
                                        </div>
                                        <Link href="/blog" className="inline-flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-[#f97316] transition-colors group">
                                            {t('view_more_news')}
                                            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                                        </Link>
                                    </div>
                                    <div className="relative group/embla">
                                        <div className="overflow-hidden" ref={emblaRef}>
                                            <div className="flex -mr-[20px]">
                                                {articlesData.map((news: any, i: number) => (
                                                    <div key={i} className="flex-[0_0_100%] md:flex-[0_0_33.33%] min-w-0 pr-[20px]">
                                                        <Link
                                                            href={news.slug ? `/artigos/${news.slug}` : "#"}
                                                            className="bg-white rounded-[12px] shadow-lg border border-slate-100 flex flex-col group cursor-pointer hover:border-[#f97316] transition-all overflow-hidden h-full"
                                                        >
                                                            <div className="relative h-48 w-full overflow-hidden border-b-4 border-[#f97316]">
                                                                <Image
                                                                    src={news.image_url || "https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?q=80&w=800&auto=format&fit=crop"}
                                                                    alt={news.title || t('aria.next_news')}
                                                                    fill
                                                                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 33vw"
                                                                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                                                                />
                                                                <div className="absolute top-4 left-4 bg-[#f97316] text-white text-[10px] font-black uppercase px-3 py-1 rounded-[5px]">
                                                                    {news.type || "Artigo"}
                                                                </div>
                                                            </div>
                                                            <div className="p-5 flex flex-col flex-1">
                                                                <div className="space-y-2">
                                                                    <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400">
                                                                        <span>{new Date(news.date).toLocaleDateString(locale === 'en' ? 'en-US' : 'pt-PT', { day: '2-digit', month: 'short', year: 'numeric' }).replace('.', '').replace(' de ', ' ')}</span>
                                                                    </div>
                                                                    <h3 className="text-lg font-black text-slate-600 group-hover:text-[#f97316] transition-colors line-clamp-2 first-letter:uppercase lowercase my-0 mb-[10px]" suppressHydrationWarning>
                                                                        <span>{news.title}</span>
                                                                    </h3>
                                                                    <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">
                                                                        {news.subtitle || news.description}
                                                                    </p>
                                                                </div>
                                                                <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 group-hover:text-[#f97316] transition-colors mt-auto pt-[15px]">
                                                                    {t('view_details')} <ArrowRight className="h-3 w-3" />
                                                                </div>
                                                            </div>
                                                        </Link>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                    </div>

                                    <div className="flex justify-center gap-2 mt-10">
                                        {scrollSnaps.map((_: any, index: number) => (
                                            <button
                                                key={index}
                                                onClick={() => scrollTo(index)}
                                                className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${index === selectedIndex
                                                    ? "bg-[#f97316] w-12"
                                                    : "bg-slate-300 hover:bg-slate-400"
                                                    }`}
                                                aria-label={t('aria.go_to_news', { index: index + 1 })}
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}
                        </>
                </div>
            </div>
        </section >
    );
}
