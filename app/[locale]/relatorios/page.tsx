"use client";

import React, { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { PageHeader } from "@/components/PageHeader";
import { FileText, Loader2, ArrowRight, Download, Calendar, User } from "lucide-react";
import Link from "next/link";

export default function RelatoriosPage() {
    const [reports, setReports] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        const fetchReports = async () => {
            const { data, error } = await supabase
                .from('articles')
                .select('*')
                .or('type.eq.Relatório,type.eq.Relatórios')
                .is('deleted_at', null)
                .order('created_at', { ascending: false });

            if (error) {
                console.error("Error fetching reports:", error);
            } else {
                setReports(data || []);
            }
            setLoading(false);
        };

        fetchReports();
    }, [supabase]);

    return (
        <main className="min-h-screen bg-slate-50">
            <PageHeader
                title={<>Relatórios <span className="text-emerald-600">e Publicações</span></>}
                icon={FileText}
                backgroundImage="https://images.unsplash.com/photo-1454165833767-027ffea9e77b?q=80&w=2000&auto=format&fit=crop"
                breadcrumbs={[
                    { label: "Início", href: "/" },
                    { label: "Relatórios", href: undefined }
                ]}
            />

            <div className="container-site py-16">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <Loader2 className="w-10 h-10 animate-spin text-emerald-600 mb-4" />
                        <p className="text-sm font-black uppercase tracking-widest text-slate-400">Carregando relatórios...</p>
                    </div>
                ) : reports.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {reports.map((report) => (
                            <div key={report.id} className="group bg-white rounded-[24px] overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-500 flex flex-col h-full">
                                {/* Thumbnail Area */}
                                <div className="relative aspect-video overflow-hidden bg-emerald-950/10">
                                    {report.image_url ? (
                                        <img
                                            src={report.image_url}
                                            alt={report.title}
                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-emerald-600/20">
                                            <FileText className="w-16 h-16" />
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/40 to-transparent"></div>

                                    <div className="absolute bottom-4 left-4">
                                        <span className="px-3 py-1 bg-emerald-600 text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg">
                                            {report.type}
                                        </span>
                                    </div>
                                </div>

                                {/* Content Area */}
                                <div className="p-6 flex-1 flex flex-col">
                                    <div className="flex items-center gap-4 mb-4 text-[10px] font-black uppercase tracking-widest text-slate-400">
                                        <div className="flex items-center gap-1.5">
                                            <Calendar className="w-3.5 h-3.5" />
                                            {new Date(report.date || report.created_at).toLocaleDateString('pt-PT')}
                                        </div>
                                        <div className="w-1 h-1 rounded-full bg-slate-300"></div>
                                        <div className="flex items-center gap-1.5 line-wrap">
                                            <User className="w-3.5 h-3.5" />
                                            {report.source || "BaseAgro"}
                                        </div>
                                    </div>

                                    <h3 className="text-xl font-bold text-slate-800 mb-3 group-hover:text-emerald-600 transition-colors line-clamp-2 uppercase tracking-tight">
                                        {report.title}
                                    </h3>

                                    <p className="text-sm text-slate-500 leading-relaxed line-clamp-2 mb-6 font-medium">
                                        {report.subtitle || report.description || "Consulte este relatório detalhado sobre as actividades e análises do sector agrário."}
                                    </p>

                                    <div className="mt-auto pt-6 border-t border-slate-50">
                                        {report.source_url ? (
                                            <a
                                                href={report.source_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center justify-between text-xs font-black uppercase tracking-widest text-emerald-600 group/link"
                                            >
                                                <span>Baixar Documento</span>
                                                <Download className="w-4 h-4 transform group-hover/link:translate-y-0.5 transition-transform" />
                                            </a>
                                        ) : (
                                            <Link
                                                href={`/artigos/${report.slug}`}
                                                className="flex items-center justify-between text-xs font-black uppercase tracking-widest text-emerald-600 group/link"
                                            >
                                                <span>Ver Detalhes</span>
                                                <ArrowRight className="w-4 h-4 transform group-hover/link:translate-x-1 transition-transform" />
                                            </Link>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="py-20 text-center max-w-lg mx-auto">
                        <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300">
                            <FileText className="w-10 h-10" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-800 mb-2">Nenhum relatório disponível</h3>
                        <p className="text-slate-500 text-sm leading-relaxed mb-8">
                            Neste momento não existem relatórios públicos disponíveis. Por favor, volte mais tarde para novos conteúdos oficiais e estatísticos.
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
