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
import { supabase } from "@/lib/supabaseClient";
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';

const EXEMPLARY_CATEGORIES: CategoryCard[] = [
    {
        title: "Turismo rural",
        description: "Notícias e oportunidades de turismo rural e lazer.",
        icon: LucideIcons.Luggage,
        iconBg: "bg-red-50",
        iconColor: "text-red-500",
        href: "/produtos?q=turismo"
    },
    {
        title: "Tecnologias Agrárias",
        description: "Inovações digitais, maquinaria moderna e soluções técnicas.",
        icon: LucideIcons.Cpu,
        dark: true,
        iconColor: "text-white",
        href: "/produtos?q=tecnologia"
    },
    {
        title: "Políticas Agrárias",
        description: "Legislação, regulamentos e diretrizes governamentais para o setor.",
        icon: LucideIcons.Scale,
        iconBg: "bg-blue-50",
        iconColor: "text-blue-500",
        href: "/documentos"
    },
    {
        title: "Insumos Agrários",
        description: "Explore insumos, maquinaria e produtos agrícolas disponíveis.",
        icon: LucideIcons.Leaf,
        dark: true,
        iconColor: "text-white",
        href: "/produtos?q=insumo"
    },
    {
        title: "Financiamento agrário",
        description: "Linhas de crédito, fundos de investimento e seguros agrícolas.",
        icon: LucideIcons.Coins,
        iconBg: "bg-yellow-50",
        iconColor: "text-yellow-500",
        href: "/produtos?q=financiamento"
    },
    {
        title: "Artigos Científicos",
        description: "Resultados de pesquisa e inovações do agronegócio.",
        icon: LucideIcons.BookOpen,
        dark: true,
        iconColor: "text-white",
        href: "/artigos"
    }
];

const RESOURCE_CARDS: CategoryCard[] = [
    {
        title: "Comunicação Massiva",
        description: "Active o sistema de alertas SMS e E-mail para alcançar seus clientes imediatamente.",
        icon: MessageSquare,
        iconBg: "bg-orange-50",
        iconColor: "text-[#f97316]",
        href: "/inovacao/comunicacao-sms"
    },
    {
        title: "Apresentações Visuais",
        description: "Aceda ao editor de slide show para criar catálogos e relatórios profissionais.",
        icon: Presentation,
        dark: true,
        iconColor: "text-white",
        href: "/inovacao/apresentacoes"
    },
    {
        title: "Identidade Digital",
        description: "Crie perfis profissionais e cartões de visita digitais com QR Code integrado.",
        icon: QrCode,
        iconBg: "bg-blue-50",
        iconColor: "text-blue-500",
        href: "/inovacao/perfil-digital"
    },
    {
        title: "AgroBotanica AI",
        description: "Diagnostique pragas e doenças em segundos com nosso scanner inteligente.",
        icon: ScanLine,
        dark: true,
        iconColor: "text-white",
        href: "/inovacao/agrobotanica"
    }
];

type CategoryCard = {
    title: string;
    description: string;
    icon: any;
    dark?: boolean;
    iconBg?: string;
    iconColor?: string;
    href: string;
};

export function InfoSection() {
    const [activeTab, setActiveTab] = useState("informacoes");
    const bgRef = useRef<HTMLImageElement>(null);

    const [categoryCards, setCategoryCards] = useState<CategoryCard[]>([]);
    const [statsData, setStatsData] = useState<any[]>([]);
    const [articlesData, setArticlesData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

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

        const fetchData = async () => {
            const [cats, stats, arts] = await Promise.all([
                supabase.from('info_categories').select('*'),
                supabase.from('agricultural_stats').select('*').limit(3),
                supabase.from('articles').select('id, title, subtitle, image_url, date, slug, type')
                    .is('deleted_at', null)
                    .in('type', ['Notícia', 'Internacional', 'Artigo', 'Artigo Técnico', 'Comunicado', 'Evento', 'Oportunidade', 'Curiosidade', 'Guia'])
                    .order('created_at', { ascending: false })
                    .limit(5)
            ]);

            if (cats.data) {
                const formattedCats = cats.data.map((c: any) => {
                    // @ts-expect-error: LucideIcons dynamic indexing
                    const Icon = LucideIcons[c.icon_name] || LucideIcons.TreePalm;
                    return {
                        title: c.title,
                        description: c.description,
                        icon: Icon,
                        dark: c.is_dark,
                        iconBg: c.bg_color,
                        iconColor: c.text_color,
                        href: c.href
                    };
                });

                // Combine with exemplary to ensure all are present, then filter to the 6 we want
                const allCats = [...EXEMPLARY_CATEGORIES];
                setCategoryCards(allCats.slice(0, 6));
            } else {
                setCategoryCards(EXEMPLARY_CATEGORIES);
            }

            if (stats.data) {
                setStatsData(stats.data.map((s: any) => ({
                    label: s.label || s.category,
                    val: s.variation ? `${s.variation > 0 ? '+' : ''}${s.variation}%` : `${s.value}`,
                    color: s.variation && s.variation < 0 ? "text-red-500" : "text-emerald-500"
                })));
            }

            if (arts.data) {
                setArticlesData(arts.data);
            }

            setLoading(false);
        };

        fetchData();

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
                                Inovação e Crescimento
                            </span>
                            <span className="w-[20px] h-[1px] bg-white opacity-60"></span>
                        </div>
                        <h2 className="text-[28px] md:text-[45px] font-black text-white tracking-tight mt-3">
                            Mantenha-se informado
                        </h2>
                        <p className="text-slate-200 text-sm leading-tight max-w-3xl mx-auto font-medium">
                            Oferecemos serviços dinâmicos para facilitar suas actividades com vista a melhorar a produção. Fornecemos auxílio na busca por soluções assertivas de forma eficiente. Explore as categorias disponíveis abaixo
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
                            Informações
                        </button>
                        <button
                            onClick={() => setActiveTab("recursos")}
                            className={`px-8 py-[8.5px] rounded-[7px] text-sm font-medium transition-all backdrop-blur-md border transition-all duration-300 ${activeTab === "recursos"
                                ? "bg-[#f97316] border-[#f97316] text-white shadow-[0_0_20px_rgba(249,115,22,0.4)]"
                                : "bg-white/10 border-white/20 text-white hover:bg-white/20 hover:border-[#f97316]"
                                }`}
                        >
                            Recursos
                        </button>
                        <button
                            onClick={() => setActiveTab("categorias")}
                            className={`px-8 py-[8.5px] rounded-[7px] text-sm font-medium transition-all backdrop-blur-md border transition-all duration-300 ${activeTab === "categorias"
                                ? "bg-[#f97316] border-[#f97316] text-white shadow-[0_0_20px_rgba(249,115,22,0.4)]"
                                : "bg-white/10 border-white/20 text-white hover:bg-white/20 hover:border-[#f97316]"
                                }`}
                        >
                            Categorias
                        </button>
                    </div>
                </div>
            </div>

            <div className="container-site relative z-20 mt-[40px] pb-24">
                <div className="animate-in fade-in duration-700 slide-in-from-bottom-8">
                    {loading ? (
                        <div className="bg-white p-12 rounded-[4px] shadow-lg text-center text-gray-400 border border-slate-100">
                            A carregar informações...
                        </div>
                    ) : (
                        <>
                            {activeTab === "categorias" && (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-agro px-[40px]">
                                    {categoryCards.map((card: any, idx: number) => (
                                        <Link
                                            key={idx}
                                            href={card.href || "#"}
                                            className={`p-[15px] rounded-agro text-left transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl flex flex-col gap-[15px] group cursor-pointer border h-full ${card.dark
                                                ? "bg-[#374151] text-white border-slate-600 shadow-xl shadow-slate-900/20"
                                                : "bg-white text-[#3a3f47] border-slate-200 shadow-lg shadow-slate-200/50"
                                                }`}
                                        >
                                            <div className={`w-14 h-14 rounded-[5px] flex items-center justify-center shrink-0 ${card.dark ? "bg-transparent border border-white/20" : "bg-slate-200"} ${card.title.toLowerCase().includes('visibilidade') ||
                                                card.title.toLowerCase().includes('crescimento') ||
                                                card.title.toLowerCase().includes('scanner') ||
                                                card.title.toLowerCase().includes('doctor')
                                                ? "border-2 border-[#f97316]"
                                                : ""
                                                } ${card.iconBg || ""}`}>
                                                <card.icon className={`h-7 w-7 ${card.dark ? card.iconColor : "text-slate-600"}`} />
                                            </div>
                                            <div className="flex flex-col gap-1 h-full">
                                                <h3 className={`text-xl font-black leading-tight first-letter:uppercase lowercase ${card.dark ? "text-white" : "text-[#3a3f47]"}`} suppressHydrationWarning>
                                                    <span>{card.title}</span>
                                                </h3>
                                                <p className={`text-base leading-tight ${card.dark ? "text-slate-300" : "text-slate-500"} line-clamp-4`}>
                                                    {card.description}
                                                </p>
                                                <div className={`mt-auto pt-2 flex items-center gap-2 text-xs font-bold tracking-wide ${card.dark ? "text-white/70" : "text-slate-400"} group-hover:text-[#f97316] transition-colors`}>
                                                    Ver detalhes
                                                    <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            )}

                            {activeTab === "recursos" && (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-agro px-[20px]">
                                    {RESOURCE_CARDS.map((card: any, idx: number) => (
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
                                                    {card.title}
                                                </h3>
                                                <p className={`text-xs leading-snug ${card.dark ? "text-slate-300" : "text-slate-500"}`}>
                                                    {card.description}
                                                </p>
                                                <div className={`mt-auto pt-2 flex items-center gap-2 text-[10px] font-black uppercase tracking-wider ${card.dark ? "text-white/60" : "text-slate-400"} group-hover:text-[#f97316] transition-colors`}>
                                                    Aceder agora
                                                    <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-1" />
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            )}

                            {activeTab === "informacoes" && (
                                <div className="space-y-6">
                                    <div className="flex items-center justify-between px-4 md:px-[10px] mb-4">
                                        <div className="flex items-center gap-3">
                                            <button
                                                onClick={scrollPrev}
                                                className="w-10 h-10 rounded-full bg-white shadow-md border border-slate-100 flex items-center justify-center text-[#f97316] hover:bg-[#f97316] hover:text-white transition-all"
                                                aria-label="Notícia anterior"
                                            >
                                                <ChevronLeft className="h-6 w-6" />
                                            </button>
                                            <button
                                                onClick={scrollNext}
                                                className="w-10 h-10 rounded-full bg-white shadow-md border border-slate-100 flex items-center justify-center text-[#f97316] hover:bg-[#f97316] hover:text-white transition-all"
                                                aria-label="Próxima notícia"
                                            >
                                                <ChevronRight className="h-6 w-6" />
                                            </button>
                                        </div>
                                        <Link href="/blog" className="inline-flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-[#f97316] transition-colors group">
                                            Ver mais notícias
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
                                                                    alt={news.title || "Notícia"}
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
                                                                        <span>{new Date(news.date).toLocaleDateString('pt-PT', { day: '2-digit', month: 'short', year: 'numeric' }).replace('.', '').replace(' de ', ' ')}</span>
                                                                    </div>
                                                                    <h3 className="text-lg font-black text-slate-600 group-hover:text-[#f97316] transition-colors line-clamp-2 first-letter:uppercase lowercase my-0 mb-[10px]" suppressHydrationWarning>
                                                                        <span>{news.title}</span>
                                                                    </h3>
                                                                    <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">
                                                                        {news.subtitle || news.description}
                                                                    </p>
                                                                </div>
                                                                <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 group-hover:text-[#f97316] transition-colors mt-auto pt-[15px]">
                                                                    Explorar <ArrowRight className="h-3 w-3" />
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
                                                aria-label={`Ir para notícia ${index + 1}`}
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </section >
    );
}
