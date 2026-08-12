"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Play, Mic, Users, ArrowRight, ArrowLeft, PlayCircle, Star, Clock } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { useTranslations } from 'next-intl';

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
}

function renderTitleWithGreenEnd(title: string) {
    const words = title.split(' ');
    if (words.length <= 2) {
        return <span className="text-[#f97316]">{title}</span>;
    }
    const mainPart = words.slice(0, -2).join(' ');
    const greenPart = words.slice(-2).join(' ');
    return (<>{mainPart} <span className="text-[#f97316]">{greenPart}</span></>);
}

interface AgroCastSectionProps {
    embedded?: boolean;
}

export function AgroCastSection({ embedded = false }: AgroCastSectionProps) {
    const t = useTranslations('AgroCastSection');
    const [episodes, setEpisodes] = useState<PodcastEpisode[]>([]);
    const [activeEpisode, setActiveEpisode] = useState<PodcastEpisode | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [loading, setLoading] = useState(true);
    const [isTeaserMode, setIsTeaserMode] = useState(false);
    const [featuredEpisode, setFeaturedEpisode] = useState<PodcastEpisode | null>(null);

    useEffect(() => {
        const abortController = new AbortController();

        const fetchPodcasts = async () => {
            const supabase = createClient();
            const { data, error } = await supabase
                .from('podcasts')
                .select('*')
                .eq('is_active', true)
                .order('is_featured', { ascending: false })
                .order('created_at', { ascending: false })
                .limit(3)
                .abortSignal(abortController.signal);

            if (error) {
                // Ignore abort errors (caused by React Strict Mode double-mount)
                if (error.message?.includes('AbortError') || error.code === 'ABORT_ERR') return;
                console.error('Error fetching podcasts:', error.message);
            } else if (data && data.length > 0) {
                setEpisodes(data);
                setActiveEpisode(data[0]);
            }
            setLoading(false);
        };

        fetchPodcasts();

        return () => abortController.abort();
    }, []);

    const Wrapper = embedded ? "div" : "section";
    const wrapperClass = embedded ? "w-full" : "section-agro !pt-[100px] !pb-[100px] bg-white relative overflow-hidden";
    const containerClass = embedded ? "w-full relative z-10" : "container-site relative z-10";

    const handlePlay = () => {
        if (activeEpisode?.video_url) {
            setIsPlaying(true);
        }
    };

    if (loading) {
        return <div className="py-20 text-center">{t('loading')}</div>;
    }

    if (!activeEpisode) {
        return null;
    }

    // Prepare next episode
    const nextEpisode = episodes.length > 1 ? episodes[1] : null;

    return (
        <Wrapper className={wrapperClass} id="agrocast">


            <div className={containerClass}>


                <div className="flex justify-end mb-[30px]">
                    <Link href="/agrocast" className="inline-block">
                        <button className="flex items-center gap-2 text-slate-400 hover:text-emerald-600 transition-colors text-xs font-bold uppercase tracking-widest group">
                            {t('view_all')}
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </button>
                    </Link>
                </div>

                <div className="grid lg:grid-cols-[68fr_32fr] gap-agro items-stretch">
                    {/* TV SCREEN FRAME - Main Video */}
                    <div className="relative group p-3 bg-slate-800 rounded-[15px] border border-slate-700">
                        {/* Physical Bezels - Height Reduced */}
                        <div className="relative overflow-hidden bg-slate-900 h-[500px] border-[10px] border-slate-900 rounded-[10px] shadow-inner">
                            {isPlaying && activeEpisode.video_url ? (
                                <div className="relative w-full h-full">
                                    <iframe
                                        src={`${activeEpisode.video_url}${activeEpisode.video_url.includes('?') ? '&' : '?'}autoplay=1`}
                                        title={activeEpisode.title}
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen
                                        className="absolute inset-0 w-full h-full rounded-[10px]"
                                    />
                                    {isTeaserMode && featuredEpisode && (
                                        <div className="absolute inset-0 z-30 pointer-events-none flex items-start justify-start p-4">
                                            <button
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    setActiveEpisode(featuredEpisode);
                                                    setIsPlaying(false);
                                                    setIsTeaserMode(false);
                                                }}
                                                className="pointer-events-auto bg-black/80 hover:bg-[#f97316] text-white text-xs font-bold px-4 py-2.5 rounded-full flex items-center gap-2 transition-all shadow-xl border border-white/10 backdrop-blur-md"
                                            >
                                                <ArrowLeft className="w-3.5 h-3.5" />
                                                {t('back_to_featured')}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <>
                                    {activeEpisode.thumbnail_url ? (
                                        <Image
                                            src={activeEpisode.thumbnail_url}
                                            alt={activeEpisode.title || t('podcast_label')}
                                            fill
                                            className="object-cover opacity-90 transition-transform duration-700 group-hover:scale-105"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-slate-800 flex items-center justify-center">
                                            <Mic className="w-20 h-20 text-slate-700" />
                                        </div>
                                    )}

                                    {/* Inner Screen Shadow effect */}
                                    <div className="absolute inset-0 shadow-[inset_0_0_100px_rgba(0,0,0,0.5)] pointer-events-none" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent opacity-100" />

                                    {/* Play Button Overlay */}
                                    <div className="absolute inset-0 flex items-center justify-center mb-10">
                                        <button
                                            onClick={handlePlay}
                                            className="group/button w-20 h-20 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/30 hover:scale-110 active:scale-90 transition-all duration-500 cursor-pointer hover:bg-white/30"
                                        >
                                            <div className="w-14 h-14 bg-emerald-600 group-hover/button:bg-[#f97316] transition-colors duration-300 rounded-full flex items-center justify-center shadow-lg shadow-black/20">
                                                <Play className="w-6 h-6 text-white fill-white ml-1" />
                                            </div>
                                        </button>
                                    </div>

                                    {/* THEME LABEL & CONTENT Overlay */}
                                    <div className="absolute bottom-0 left-0 w-full pl-8 py-8 pr-[50px] z-20 flex flex-col items-start gap-2">
                                        <div className="flex items-center gap-3">
                                            <span className="bg-emerald-600 text-white text-[11px] font-black uppercase px-3 py-0.5 rounded-[50px] shadow-sm">
                                                {activeEpisode.category}
                                            </span>
                                            <div className="flex items-center gap-2 text-white/90 bg-slate-900/40 px-3 py-0.5 rounded-[50px] backdrop-blur-sm border border-white/10">
                                                <Mic className="w-3.5 h-3.5 text-[#f97316]" />
                                                <span className="text-[10px] font-bold uppercase tracking-wider">{t('podcast_label')}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-white/90 bg-slate-900/40 px-3 py-0.5 rounded-[50px] backdrop-blur-sm border border-white/10">
                                                <Clock className="w-3.5 h-3.5 text-[#f97316]" />
                                                <span className="text-[10px] font-bold uppercase tracking-wider">{activeEpisode.duration}</span>
                                            </div>
                                        </div>

                                        <div className="space-y-1">
                                            <h3 className="text-xl md:text-[30px] font-black text-white leading-tight max-w-2xl m-0 drop-shadow-lg">
                                                {renderTitleWithGreenEnd(activeEpisode.title)}
                                            </h3>
                                            {activeEpisode.description && activeEpisode.description.trim() !== '' && (
                                                <p className="text-white/80 text-[11px] md:text-[13px] font-medium leading-relaxed max-w-xl mt-0 line-clamp-2">
                                                    {activeEpisode.description}
                                                </p>
                                            )}
                                            <div className="pt-1">
                                                <span className="text-white text-[13px] font-bold">
                                                    {activeEpisode.specialist_name}{activeEpisode.specialist_role ? ` — ${activeEpisode.specialist_role}` : ''}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Sidebar section */}
                    <div className="flex flex-col gap-0 h-full">
                        {/* 1. NEXT VIDEO CARD */}
                        {nextEpisode ? (
                            <div
                                onClick={() => {
                                    setActiveEpisode(nextEpisode);
                                    setIsPlaying(false);
                                }}
                                className="relative group cursor-pointer overflow-hidden shadow-xl flex-1 border-[6px] border-slate-800 rounded-t-[15px] bg-slate-900 border-b-0 active:scale-[0.99] transition-transform"
                            >
                                {nextEpisode.thumbnail_url && (
                                    <Image
                                        src={nextEpisode.thumbnail_url}
                                        alt={nextEpisode.title || t('next_video')}
                                        fill
                                        className="object-cover transition-transform duration-1000 group-hover:scale-110"
                                    />
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent opacity-90" />

                                <div className="absolute inset-0 flex flex-col justify-end p-6 space-y-1">
                                    <div className="flex items-center gap-2">
                                        <span className="bg-[#f97316] text-white text-[10px] font-black uppercase px-2 py-0.5">{t('next_video')}</span>
                                        <span className="text-white/80 text-[10px] font-bold uppercase tracking-widest">{nextEpisode.category}</span>
                                    </div>
                                    <h3
                                        className="text-[18px] font-black text-white leading-tight !mt-[15px] m-0 transition-colors line-clamp-3"
                                    >
                                        {nextEpisode.title}
                                    </h3>
                                    {nextEpisode.description && nextEpisode.description.trim() !== '' && (
                                        <p className="text-white/70 text-[10px] leading-snug mt-0 line-clamp-2">
                                            {nextEpisode.description}
                                        </p>
                                    )}
                                    <div className="pt-1 pb-0">
                                        <span className="text-white text-[11px] font-bold">
                                            {nextEpisode.specialist_name}{nextEpisode.specialist_role ? ` — ${nextEpisode.specialist_role}` : ''}
                                        </span>
                                    </div>
                                    <div
                                        className="pt-1 flex items-center gap-2 text-white/90 group-hover:text-white transition-all text-[10px] font-bold uppercase tracking-widest"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setFeaturedEpisode(activeEpisode);
                                            const baseUrl = nextEpisode.video_url;
                                            const teaserUrl = baseUrl.includes('?')
                                                ? `${baseUrl}&start=0&end=110`
                                                : `${baseUrl}?start=0&end=110`;
                                            setActiveEpisode({ ...nextEpisode, video_url: teaserUrl });
                                            setIsPlaying(true);
                                            setIsTeaserMode(true);
                                        }}
                                    >
                                        <PlayCircle className="w-4 h-4 text-[#f97316]" />
                                        <span>{t('view_teaser')}</span>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="flex-1 bg-slate-900 border-[6px] border-slate-800 border-b-0 rounded-t-[15px] flex items-center justify-center">
                                <span className="text-slate-500 text-xs">{t('no_more_episodes')}</span>
                            </div>
                        )}


                        <div className="bg-emerald-600 p-6 text-white relative overflow-hidden group cursor-pointer rounded-b-[15px] shadow-lg shadow-emerald-500/10">
                            <div className="relative z-10 space-y-2">
                                <p className="text-[10px] text-[#00ff7f] font-black uppercase tracking-widest opacity-100 m-0">{t('interaction.label')}</p>
                                <h4 className="text-base font-black leading-tight text-white m-0">{t('interaction.title')}</h4>
                                <Link href="/contactos" className="inline-block mt-1">
                                    <button className="bg-white text-slate-600 px-5 py-2 rounded-[6px] font-black text-[10px] uppercase tracking-wider hover:bg-[#f97316] hover:text-white active:scale-95 transition-all flex items-center gap-2">
                                        {t('interaction.button')} <ArrowRight className="w-3 h-3" />
                                    </button>
                                </Link>
                            </div>
                            <Mic className="absolute -bottom-6 -right-6 w-24 h-24 text-white/10 -rotate-12 transition-transform group-hover:scale-110 duration-700" />
                        </div>
                    </div>
                </div>
            </div>
        </Wrapper>
    );
}
