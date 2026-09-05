"use client";

import React, { useEffect, useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Presentation, Loader2, ArrowRight, Play, Calendar, User } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Spinner } from "@/components/ui/spinner";

export default function PresentationsGalleryPage() {
    const [presentations, setPresentations] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPresentations = async () => {
            try {
                const response = await fetch('/api/presentations/list');
                const result = await response.json();
                if (!response.ok) throw new Error(result.error);
                setPresentations(result.presentations || []);
            } catch (error) {
                console.error("Error fetching presentations:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchPresentations();
    }, []);

    return (
        <main className="min-h-screen bg-slate-50">
            <PageHeader
                title={<>Galeria de <span className="text-emerald-600">Apresentações</span></>}
                icon={Presentation}
                backgroundImage="https://images.unsplash.com/photo-1557804506-669a67965ba0?q=80&w=2000&auto=format&fit=crop"
                breadcrumbs={[
                    { label: "Início", href: "/" },
                    { label: "Apresentações", href: undefined }
                ]}
            />

            <div className="container-site py-16">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <Spinner className="w-10 h-10 animate-spin text-emerald-600 mb-4" />
                        <p className="text-sm font-black uppercase tracking-widest text-slate-400">Carregando conteúdos...</p>
                    </div>
                ) : presentations.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-8">
                        {presentations.map((item) => {
                            const slideCount = item.slides?.length || 0;
                            const firstSlideImage = item.slides?.[0]?.image_url;

                            return (
                                <div key={item.id} className="group relative h-[250px] rounded-[15px] overflow-hidden bg-slate-900 border border-white/5 shadow-2xl hover:shadow-emerald-900/20 transition-all duration-700 flex flex-col">
                                    {/* Full Background Image */}
                                    <div className="absolute inset-0 z-0">
                                        {firstSlideImage ? (
                                            <img
                                                src={firstSlideImage}
                                                alt={item.title}
                                                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 opacity-60 group-hover:opacity-40"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center opacity-10">
                                                <Presentation className="w-20 h-20 text-white" />
                                            </div>
                                        )}
                                        {/* Gradient Overlays */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent z-10"></div>
                                        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/20 to-transparent z-10"></div>
                                    </div>

                                    {/* Content Overlay */}
                                    <div className="relative z-20 p-5 h-full flex flex-col">
                                        {/* Header Info */}
                                        <div className="flex items-center justify-between mb-auto">
                                            <span className="px-4 py-1.5 bg-white/10 backdrop-blur-md border border-white/20 text-white text-[10px] font-black uppercase tracking-widest rounded-full">
                                                {slideCount} Slides
                                            </span>
                                            <Play className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 transform translate-x-4 group-hover:translate-x-0 transition-all duration-500" />
                                        </div>

                                        {/* Main Text */}
                                        <div className="space-y-2">

                                            <h3 className="text-xl font-bold text-white leading-tight tracking-tight group-hover:text-emerald-400 transition-colors duration-300 first-letter:uppercase">
                                                {item.title.toLowerCase()}
                                            </h3>

                                            <p className="text-xs text-slate-300 leading-relaxed font-medium line-clamp-2 transition-all duration-500">
                                                {item.description || "Explora conteúdo interactivo e dados actualizados sobre o sector agro-pecuário em Moçambique."}
                                            </p>

                                            <div className="pt-4 flex items-center justify-between">
                                                <Link
                                                    href={`/apresentacao/${item.slug || item.id}`}
                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white text-slate-950 rounded-full text-[9px] font-black uppercase tracking-widest hover:bg-emerald-500 hover:text-white transition-all duration-300"
                                                >
                                                    Abrir Projecto
                                                    <ArrowRight className="w-3 h-3" />
                                                </Link>
                                                <div className="flex items-center gap-2 text-[9px] font-bold text-white/40 uppercase tracking-widest">
                                                    <Calendar className="w-3 h-3" />
                                                    {new Date(item.created_at).toLocaleDateString('pt-PT')}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Invisible full-card link for convenience */}
                                    <Link href={`/apresentacao/${item.slug || item.id}`} className="absolute inset-0 z-30"></Link>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="py-20 text-center max-w-lg mx-auto">
                        <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300">
                            <Presentation className="w-10 h-10" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-800 mb-2">Nenhuma apresentação disponível</h3>
                        <p className="text-slate-500 text-sm leading-relaxed mb-8">
                            Neste momento não existem apresentações públicas no nosso repositório. Por favor, volte mais tarde para novos conteúdos.
                        </p>
                        <Link href="/">
                            <button className="px-8 py-3 bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-emerald-600 transition-all">
                                Voltar ao Início
                            </button>
                        </Link>
                    </div>
                )}
            </div>
        </main>
    );
}
