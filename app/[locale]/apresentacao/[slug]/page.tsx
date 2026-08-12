"use client";

import { useEffect, useState, useCallback, use } from "react";
import { Loader2, ChevronLeft, ChevronRight, Maximize2, X, Clock, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

export default function PresentationViewerPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = use(params);
    const router = useRouter();
    const [presentation, setPresentation] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);


    useEffect(() => {
        let isMounted = true;
        const loadPresentation = async () => {
            try {
                const response = await fetch(`/api/presentations/${encodeURIComponent(slug)}`);
                const result = await response.json();
                if (isMounted && response.ok && result.presentation) {
                    setPresentation(result.presentation);
                }
            } catch (error) {
                console.error("Error loading presentation:", error);
            } finally {
                if (isMounted) setLoading(false);
            }
        };
        loadPresentation();
        return () => { isMounted = false; };
    }, [slug]);




    const toggleFullscreen = useCallback(async () => {
        const element = document.getElementById("presentation-root");
        if (!element) return;

        try {
            if (!document.fullscreenElement) {
                await element.requestFullscreen();
                setIsFullscreen(true);
            } else {
                if (document.exitFullscreen) {
                    await document.exitFullscreen();
                    setIsFullscreen(false);
                }
            }
        } catch (err) {
            console.error(`Error attempting to toggle full-screen mode: ${err}`);
        }
    }, []);

    // Auto-fullscreen logic
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        if (params.get('fullscreen') === 'true') {
            const timer = setTimeout(() => {
                toggleFullscreen().catch(() => {
                    // Auto-fullscreen failed (likely due to no user gesture). 
                    // We can show a UI hint or just let the user click the maximize button.
                    console.log("Auto-fullscreen blocked by browser policy");
                });
            }, 500); // Small delay to ensure render
            return () => clearTimeout(timer);
        }
    }, [toggleFullscreen]);

    // Navigation logic
    const nextSlide = useCallback(() => {
        if (!presentation?.slides) return;
        setCurrentIndex((prev) => Math.min(prev + 1, presentation.slides.length - 1));
    }, [presentation]);

    const prevSlide = useCallback(() => {
        setCurrentIndex((prev) => Math.max(prev - 1, 0));
    }, []);

    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "ArrowRight" || e.key === "ArrowDown" || e.key === " ") {
                e.preventDefault();
                nextSlide();
            }
            if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
                e.preventDefault();
                prevSlide();
            }
            if (e.key === "Escape" && isFullscreen) {
                toggleFullscreen();
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isFullscreen, toggleFullscreen, nextSlide, prevSlide]);

    if (loading) {
        return (
            <div className="fixed inset-0 bg-slate-950 flex items-center justify-center">
                <Loader2 className="w-10 h-10 animate-spin text-orange-500" />
            </div>
        );
    }

    if (!presentation || !presentation.slides || presentation.slides.length === 0) {
        return (
            <div className="fixed inset-0 bg-slate-950 flex flex-col items-center justify-center text-white p-6">
                <h1 className="text-2xl font-bold mb-4">Apresentação não encontrada</h1>
                <Button onClick={() => router.back()} variant="outline" className="text-white border-white/20 hover:bg-white/10">
                    Voltar
                </Button>
            </div>
        );
    }

    const slides = presentation.slides;

    // Helper to get animation class
    const getAnimationClass = (animation: string | undefined): string => {
        if (!animation || animation === 'none') return '';
        return `animate-presentation-${animation}`;
    };

    return (
        <div
            id="presentation-root"
            className={`fixed inset-0 bg-slate-950 text-white overflow-hidden transition-all duration-700 z-[9999] font-sans`}
        >
            {/* Top Right: Actions & Timer */}
            <div className="absolute top-10 right-10 z-[100] flex items-center gap-4 pointer-events-auto">
                <div className="flex items-center gap-6 px-8 py-3 bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl">
                    <div className="flex items-center gap-2 text-white/50">
                        <Maximize2
                            className={`w-4 h-4 cursor-pointer hover:text-orange-500 transition-colors ${isFullscreen ? 'text-orange-500' : ''}`}
                            onClick={toggleFullscreen}
                        />
                    </div>
                    <div className="w-px h-6 bg-white/10"></div>
                    <button
                        onClick={() => {
                            if (document.fullscreenElement) document.exitFullscreen();
                            if (window.history.length > 1) {
                                router.back();
                            } else {
                                router.push('/');
                            }
                        }}
                        className="flex items-center gap-2 text-red-400 font-black uppercase tracking-[0.2em] text-[8px] hover:text-red-300 transition-colors group"
                    >
                        <X className="w-3 h-3 group-hover:rotate-90 transition-transform duration-300" />
                        Sair
                    </button>
                </div>
            </div>

            {/* Header Hint (Optional) */}

            {/* Slides Container - DISSOLVE EFFECT */}
            <div className="h-full relative overflow-hidden">
                <div className="h-full flex">
                    {slides.map((slide: any, index: number) => {
                        const isActive = index === currentIndex;
                        return (
                            <div
                                key={index}
                                className={`h-full absolute inset-0 pt-0 pb-[40px] px-0 flex items-center justify-center transition-all duration-[1000ms] ease-in-out ${isActive ? 'opacity-100 z-10 scale-100' : 'opacity-0 z-0 scale-[1.02] pointer-events-none'}`}
                                style={{ minWidth: '100%' }}
                            >

                                {/* Background */}
                                {slide.image_url ? (
                                    <>
                                        <img
                                            src={slide.image_url}
                                            alt=""
                                            className={cn(
                                                "absolute inset-0 w-full h-full object-cover scale-105 blur-[2px] transition-opacity duration-1000",
                                                slide.image_disabled ? "opacity-40" : "opacity-30"
                                            )}
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-slate-950/80"></div>
                                    </>
                                ) : (
                                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-slate-900 to-slate-950"></div>
                                )}

                                <div className="relative z-10 max-w-full w-full h-full">
                                    {/* Universal Slide Layout: Title Top Left + Subtitle + 2 Columns (Photo | Text) */}
                                    <div className="w-full h-full flex flex-col items-center text-center animate-in fade-in duration-700 gap-[10px] mx-auto">

                                        {/* Header: Title & Subtitle */}
                                        <div className="w-full text-center px-[40px] py-[35px] mb-[30px] border-b border-white/20 bg-emerald-600/10 backdrop-blur-sm">
                                            <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-white uppercase leading-none mb-1">
                                                {presentation.title}
                                            </h1>
                                            <div className="flex items-center gap-[15px] justify-center">
                                                <p className="text-orange-500 font-bold text-[18px]">
                                                    {presentation.description || (index === 0 ? "introdução" : `slide ${index + 1}`)}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Content Area - centered vertically in remaining space */}
                                        <div className="flex-1 w-full flex flex-col justify-center py-4">
                                            {slide.image_disabled ? (
                                                /* Centered Layout - No Image */
                                                <div
                                                    key={`text-centered-${index}-${currentIndex}`}
                                                    className={cn(
                                                        "w-full max-w-4xl px-[40px] text-center mx-auto flex flex-col items-center",
                                                        isActive && getAnimationClass(slide.animation_text)
                                                    )}>
                                                    {slide.antetitulo && (
                                                        <div
                                                            className="flex items-center gap-4 mb-[20px] w-full"
                                                            style={{
                                                                justifyContent: slide.antetitulo_align === 'left' ? 'flex-start' : slide.antetitulo_align === 'right' ? 'flex-end' : 'center'
                                                            }}
                                                        >
                                                            {(slide.antetitulo_align === 'center' || (slide.antetitulo_align || 'center') === 'left') && (
                                                                <div className="w-[45px] h-[2px] bg-orange-500/50"></div>
                                                            )}
                                                            <span className="text-orange-500 font-bold uppercase tracking-widest text-[16px]">
                                                                {slide.antetitulo}
                                                            </span>
                                                            {(slide.antetitulo_align === 'center' || slide.antetitulo_align === 'right') && (
                                                                <div className="w-[45px] h-[2px] bg-orange-500/50"></div>
                                                            )}
                                                        </div>
                                                    )}
                                                    {slide.title && (
                                                        <div className="mb-[15px] w-full" style={{ textAlign: (slide.title_align as any) || 'center' }}>
                                                            <span
                                                                className="text-white font-bold first-letter:uppercase tracking-tight leading-[1.1] block"
                                                                style={{ fontSize: `${slide.title_size || 52}px` }}
                                                            >
                                                                {slide.title}
                                                            </span>
                                                        </div>
                                                    )}
                                                    <div className="prose prose-invert max-w-none text-center mx-auto
                                                            prose-p:text-[22px] prose-p:font-medium
                                                            prose-h5:text-[28px] prose-h5:font-normal prose-h5:text-white prose-h5:leading-[1.4]
                                                            prose-strong:text-orange-500 prose-strong:font-black
                                                            prose-ul:list-disc prose-ul:pl-10 prose-ul:space-y-4 prose-ul:text-left prose-ul:inline-block
                                                            prose-ol:list-decimal prose-ol:pl-10 prose-ol:space-y-4 prose-ol:text-left prose-ol:inline-block
                                                            prose-li:text-slate-300 prose-li:marker:text-orange-500
                                                            prose-blockquote:border-l-4 prose-blockquote:border-orange-500 prose-blockquote:pl-6 prose-blockquote:italic"
                                                        style={{ lineHeight: slide.line_height || 1.6 }}
                                                        dangerouslySetInnerHTML={{ __html: slide.content }}>
                                                    </div>

                                                    {/* CTA Button (Only if NOT centered image) */}
                                                    {slide.image_side !== 'center' && slide.cta_text && slide.cta_link && (
                                                        <div
                                                            className="mt-8 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300 w-full"
                                                            style={{ textAlign: (slide.cta_align as any) || 'center' }}
                                                        >
                                                            <a
                                                                href={slide.cta_link}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="inline-flex items-center gap-2 px-8 py-[9px] bg-emerald-500 hover:bg-orange-500 text-white font-bold rounded-full transition-all hover:scale-105 hover:shadow-lg hover:shadow-orange-500/20 text-sm uppercase tracking-wider group/btn"
                                                            >
                                                                {slide.cta_text}
                                                                <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                                                            </a>
                                                        </div>
                                                    )}
                                                </div>
                                            ) : (
                                                /* Two Column Layout - With Image */
                                                <div className={cn(
                                                    "w-full max-w-7xl mx-auto px-[40px] grid grid-cols-1 gap-[40px] items-center",
                                                    slide.image_side === 'center' ? "lg:grid-cols-1" : (slide.image_side === 'right' ? "lg:grid-cols-[1fr_500px]" : "lg:grid-cols-[500px_1fr]")
                                                )}>

                                                    {/* Column 1: Photo + Footer */}
                                                    <div className={cn(
                                                        "flex flex-col items-center w-full",
                                                        slide.image_side === 'center' ? "lg:items-center" : (slide.image_side === 'right' ? "lg:items-end lg:order-last" : "lg:items-start lg:order-first")
                                                    )}>
                                                        <div className="relative group w-full">
                                                            <div className="absolute -inset-4 bg-orange-500/5 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                                            {slide.image_url ? (
                                                                <div
                                                                    key={`img-${index}-${currentIndex}`}
                                                                    className={cn(
                                                                        "relative w-full rounded-[20px] overflow-hidden border border-white/10 shadow-2xl bg-slate-900/50",
                                                                        slide.image_side === 'center' ? "h-auto aspect-video" : "",
                                                                        isActive && getAnimationClass(slide.animation_image)
                                                                    )}
                                                                    style={slide.image_side !== 'center' ? { height: `${slide.image_height || 550}px` } : {}}
                                                                >
                                                                    <img
                                                                        src={slide.image_url}
                                                                        alt=""
                                                                        className={cn(
                                                                            "w-full h-full",
                                                                            slide.image_side === 'center' ? "object-contain" : "object-cover"
                                                                        )}
                                                                    />
                                                                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent flex items-end p-6 pointer-events-none">
                                                                        <span className="text-[10px] font-bold uppercase tracking-wider text-white/40">recurso visual • slide {index + 1}</span>
                                                                    </div>
                                                                </div>
                                                            ) : (
                                                                <div
                                                                    className="relative w-full rounded-[20px] bg-white/5 border border-dashed border-white/10 flex items-center justify-center"
                                                                    style={{ height: `${slide.image_height || 550}px` }}
                                                                >
                                                                    <div className="text-center">
                                                                        <Loader2 className="w-8 h-8 text-white/10 animate-spin mx-auto mb-3" />
                                                                        <p className="text-[10px] font-bold text-white/10 uppercase tracking-widest">Sem recurso visual</p>
                                                                    </div>
                                                                </div>
                                                            )}

                                                            {/* OVERLAY CTA for Centered Image */}
                                                            {slide.image_side === 'center' && slide.cta_text && slide.cta_link && (
                                                                <div
                                                                    className="absolute bottom-10 left-0 right-0 z-20 flex px-10 pointer-events-none animate-in fade-in slide-in-from-bottom-4 duration-700 delay-500"
                                                                    style={{ justifyContent: (slide.cta_align === 'left' ? 'flex-start' : slide.cta_align === 'right' ? 'flex-end' : 'center') }}
                                                                >
                                                                    <a
                                                                        href={slide.cta_link}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="pointer-events-auto inline-flex items-center gap-2 px-8 py-[9px] bg-emerald-500 hover:bg-orange-500 text-white font-bold rounded-full transition-all hover:scale-105 hover:shadow-lg hover:shadow-orange-500/20 text-sm uppercase tracking-wider group/btn shadow-xl shadow-black/20 backdrop-blur-md border border-white/10"
                                                                    >
                                                                        {slide.cta_text}
                                                                        <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                                                                    </a>
                                                                </div>
                                                            )}
                                                        </div>

                                                        {/* Footer line for the slide */}
                                                        <div className="pt-4 flex items-center justify-center gap-4 w-full max-w-[500px] text-slate-300/60 lowercase font-medium text-[10px] tracking-tight">
                                                            <span>basededadosagro</span>
                                                            <span className="opacity-20">•</span>
                                                            <span>estratégia digital</span>
                                                            <span className="opacity-20">•</span>
                                                            <span className="font-bold border border-white/5 px-2 py-0.5 rounded">acesso reservado</span>
                                                        </div>
                                                    </div>

                                                    {/* Column 2: Description */}
                                                    <div
                                                        key={`text-${index}-${currentIndex}`}
                                                        className={cn(
                                                            "flex flex-col",
                                                            slide.image_side === 'center' ? "text-center items-center" : "lg:text-left items-start",
                                                            isActive && getAnimationClass(slide.animation_text)
                                                        )}>
                                                        {slide.antetitulo && (
                                                            <div
                                                                className="flex items-center gap-4 mb-[20px] w-full"
                                                                style={{
                                                                    justifyContent: slide.antetitulo_align === 'left' ? 'flex-start' : slide.antetitulo_align === 'right' ? 'flex-end' : 'center'
                                                                }}
                                                            >
                                                                {(slide.antetitulo_align === 'center' || (slide.antetitulo_align || 'center') === 'left') && (
                                                                    <div className="w-[45px] h-[2px] bg-orange-500/50"></div>
                                                                )}
                                                                <span className="text-orange-500 font-bold uppercase tracking-widest text-[16px]">
                                                                    {slide.antetitulo}
                                                                </span>
                                                                {(slide.antetitulo_align === 'center' || slide.antetitulo_align === 'right') && (
                                                                    <div className="w-[45px] h-[2px] bg-orange-500/50"></div>
                                                                )}
                                                            </div>
                                                        )}
                                                        {slide.title && (
                                                            <div className="mb-[15px] w-full" style={{ textAlign: (slide.title_align as any) || (slide.image_side === 'center' ? 'center' : 'left') }}>
                                                                <span
                                                                    className="text-white font-bold first-letter:uppercase tracking-tight leading-[1.1] block"
                                                                    style={{ fontSize: `${slide.title_size || 52}px` }}
                                                                >
                                                                    {slide.title}
                                                                </span>
                                                            </div>
                                                        )}
                                                        <div className="prose prose-invert max-w-none
                                                        prose-p:text-[22px] prose-p:text-white prose-p:font-medium
                                                        prose-h5:text-[28px] prose-h5:font-normal prose-h5:text-white prose-h5:leading-[1.4]
                                                        prose-strong:text-orange-500 prose-strong:font-black
                                                        prose-ul:list-disc prose-ul:pl-10 prose-ul:space-y-4
                                                        prose-ol:list-decimal prose-ol:pl-10 prose-ol:space-y-4
                                                        prose-li:text-white prose-li:marker:text-orange-500
                                                        prose-blockquote:border-l-4 prose-blockquote:border-orange-500 prose-blockquote:pl-6 prose-blockquote:italic
                                                        [&_img.content-image]:block [&_img.content-image]:w-full [&_img.content-image]:aspect-video [&_img.content-image]:object-cover [&_img.content-image]:my-4 [&_img.content-image]:rounded-xl [&_img.content-image]:shadow-lg
                                                        [&_img[style*='width: 100%']]:w-full [&_img[style*='width: 100%']]:block [&_img[style*='width: 100%']]:m-[20px_0]"
                                                            style={{ lineHeight: slide.line_height || 1.6 }}
                                                            dangerouslySetInnerHTML={{ __html: slide.content }}>
                                                        </div>

                                                        {/* CTA Button */}
                                                        {slide.image_side !== 'center' && slide.cta_text && slide.cta_link && (
                                                            <div
                                                                className="mt-8 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300 w-full"
                                                                style={{ textAlign: (slide.cta_align as any) || 'left' }}
                                                            >
                                                                <a
                                                                    href={slide.cta_link}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="inline-flex items-center gap-2 px-8 py-[9px] bg-emerald-500 hover:bg-orange-500 text-white font-bold rounded-full transition-all hover:scale-105 hover:shadow-lg hover:shadow-orange-500/20 text-sm uppercase tracking-wider group/btn"
                                                                >
                                                                    {slide.cta_text}
                                                                    <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                                                                </a>
                                                            </div>
                                                        )}

                                                    </div>

                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Bottom Right Navigation Controls */}
            <div className="absolute bottom-8 right-8 z-[100] flex items-center gap-4 pointer-events-auto">
                <button
                    type="button"
                    onClick={(e) => {
                        e.stopPropagation();
                        prevSlide();
                    }}
                    disabled={currentIndex === 0}
                    className="p-2 text-white/50 hover:text-orange-500 disabled:opacity-0 transition-all hover:scale-110 cursor-pointer"
                >
                    <ChevronLeft className="w-5 h-5" />
                </button>
                <div className="w-px h-4 bg-white/10"></div>
                <button
                    type="button"
                    onClick={(e) => {
                        e.stopPropagation();
                        nextSlide();
                    }}
                    disabled={currentIndex === slides.length - 1}
                    className="p-2 text-white/50 hover:text-orange-500 disabled:opacity-0 transition-all hover:scale-110 cursor-pointer"
                >
                    <ChevronRight className="w-5 h-5" />
                </button>
            </div>

            {/* Progress Bar */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-emerald-500/50 z-50">
                <div
                    className="h-full bg-orange-600 transition-all duration-300 shadow-[0_0_10px_#ea580c]"
                    style={{ width: `${((currentIndex + 1) / slides.length) * 100}%` }}
                ></div>
            </div>

        </div >
    );
}
