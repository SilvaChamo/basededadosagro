"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
    Calendar, ChevronLeft, FileText, ExternalLink, Download,
    FileText as FileTextIcon, FileArchive, File as FileIcon, Link as LinkIcon
} from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { PageHeader } from "@/components/PageHeader";

// Ícone por extensão do ficheiro — mesma lógica do MultiFileUpload (admin),
// para o "Ficheiros disponíveis" desta página coincidir com o que o editor
// mostra ao anexar.
function fileIconFor(url: string) {
    if (/\.pdf$/i.test(url)) return <FileTextIcon className="w-5 h-5 text-red-500" />;
    if (/\.(zip|rar)$/i.test(url)) return <FileArchive className="w-5 h-5 text-amber-600" />;
    return <FileIcon className="w-5 h-5 text-slate-500" />;
}

export default function DocumentReadingPage() {
    const supabase = createClient();
    const params = useParams();
    const slug = params?.slug as string;

    const [doc, setDoc] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDoc = async () => {
            if (!slug) return;
            setLoading(true);
            const { data } = await supabase.from('articles').select('*').eq('slug', slug).single();
            // Documentos em "Rascunho" ou "Pendente para revisão" não são públicos.
            const isPublic = data && data.deleted_at == null && !['draft', 'review'].includes(data.publish_status);
            setDoc(isPublic ? data : null);
            setLoading(false);
        };
        fetchDoc();
    }, [slug]);

    if (loading && !doc) {
        return <div className="min-h-screen bg-background" />;
    }

    if (!doc) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center space-y-6">
                    <h2 className="text-2xl font-black text-slate-800">Documento não encontrado</h2>
                    <Link href="/documentos" className="inline-flex items-center gap-2 text-emerald-600 font-bold hover:underline">
                        <ChevronLeft className="w-4 h-4" /> Voltar para Documentos
                    </Link>
                </div>
            </div>
        );
    }

    // "Nativo" = conteúdo escrito directamente aqui (sem depender só do link
    // externo) — mostra o corpo do texto além da fonte/ficheiros.
    const hasNativeContent = doc.content && doc.content.trim().length > 0;
    const hasSourceOrFiles = doc.source_url || (doc.files && doc.files.length > 0);

    return (
        <div className="min-h-screen bg-background selection:bg-emerald-100 selection:text-emerald-900">
            <PageHeader
                title={doc.type || "Documento"}
                icon={FileText}
                backgroundImage={doc.image_url || "https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?q=80&w=2000&auto=format&fit=crop"}
                breadcrumbs={[
                    { label: "Início", href: "/" },
                    { label: "Documentos", href: "/documentos" },
                    { label: doc.type || "Documento", href: undefined }
                ]}
            />

            <main className="container-site py-16">
                <div className="max-w-3xl mx-auto">
                    <div className="bg-white rounded-[15px] border border-slate-100 shadow-sm overflow-hidden">
                        <div className="p-8 md:p-12">
                            {/* Tipo + Fonte */}
                            <div className="flex flex-wrap items-center gap-2 mb-6">
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-emerald-600/10 border border-emerald-500/20">
                                    <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-700">{doc.type || "Documento"}</span>
                                </div>
                                {doc.source && (
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                                        Fonte: {doc.source}
                                    </span>
                                )}
                            </div>

                            {/* Título */}
                            <h1 className="font-sans text-2xl md:text-4xl font-black text-slate-800 leading-tight mb-4 tracking-tight">
                                {doc.title}
                            </h1>

                            {/* Data */}
                            <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-10 pb-6 border-b border-slate-100">
                                <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                                <span>{new Date(doc.date).toLocaleDateString('pt-PT', { day: '2-digit', month: 'short', year: 'numeric' }).replace(' de ', ' ')}</span>
                            </div>

                            {/* Resumo */}
                            {doc.subtitle && (
                                <div className="mb-10">
                                    <h3 className="text-[11px] font-black text-slate-800 uppercase tracking-[0.2em] mb-3">Resumo</h3>
                                    <p className="text-[17px] leading-[1.7] text-slate-500">{doc.subtitle}</p>
                                </div>
                            )}

                            {/* Conteúdo nativo */}
                            {hasNativeContent && (
                                <div className="mb-10">
                                    <h3 className="text-[11px] font-black text-slate-800 uppercase tracking-[0.2em] mb-3">Conteúdo</h3>
                                    <div className="article-content prose prose-slate max-w-none prose-p:text-[17px] prose-p:leading-[1.7] prose-p:text-slate-500 prose-headings:text-slate-800 prose-headings:font-black prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4 prose-blockquote:border-l-4 prose-blockquote:border-[#f97316] prose-blockquote:bg-orange-50/30 prose-blockquote:p-6 prose-blockquote:rounded-r-[10px] prose-blockquote:italic prose-blockquote:text-lg prose-strong:text-slate-700">
                                        <div dangerouslySetInnerHTML={{ __html: doc.content }} />
                                    </div>
                                </div>
                            )}

                            {/* Fonte & Ficheiros — só aqui, na página de resumo, se acede à
                                fonte real. A listagem /documentos nunca oferece o link directo. */}
                            {hasSourceOrFiles && (
                                <div className="pt-8 border-t border-slate-100">
                                    <h3 className="text-[11px] font-black text-slate-800 uppercase tracking-[0.2em] mb-5">
                                        Fonte &amp; Ficheiros
                                    </h3>
                                    <div className="space-y-3">
                                        {doc.source_url && (
                                            <a
                                                href={doc.source_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center justify-between gap-3 p-4 bg-emerald-50 border border-emerald-100 rounded-xl hover:bg-emerald-100/70 transition-colors group"
                                            >
                                                <div className="flex items-center gap-3 min-w-0">
                                                    <div className="size-9 rounded-lg bg-white shadow-sm flex items-center justify-center shrink-0">
                                                        <ExternalLink className="w-4 h-4 text-emerald-600" />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="text-sm font-bold text-emerald-800 truncate">
                                                            Ver fonte original{doc.source ? ` — ${doc.source}` : ""}
                                                        </p>
                                                        <p className="text-[11px] text-emerald-600/70 truncate">{doc.source_url}</p>
                                                    </div>
                                                </div>
                                            </a>
                                        )}

                                        {doc.files && doc.files.map((url: string, i: number) => (
                                            <a
                                                key={i}
                                                href={url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center justify-between gap-3 p-4 bg-slate-50 border border-slate-100 rounded-xl hover:bg-slate-100 transition-colors group"
                                            >
                                                <div className="flex items-center gap-3 min-w-0">
                                                    <div className="size-9 rounded-lg bg-white shadow-sm flex items-center justify-center shrink-0">
                                                        {fileIconFor(url)}
                                                    </div>
                                                    <p className="text-sm font-bold text-slate-700 truncate">
                                                        {decodeURIComponent(url.split('/').pop() || `Ficheiro ${i + 1}`)}
                                                    </p>
                                                </div>
                                                <Download className="w-4 h-4 text-slate-400 group-hover:text-slate-600 shrink-0" />
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {!hasSourceOrFiles && !hasNativeContent && (
                                <p className="text-sm text-slate-400 italic flex items-center gap-2">
                                    <LinkIcon className="w-4 h-4" /> Sem fonte ou ficheiros disponíveis para este documento.
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="mt-8">
                        <Link href="/documentos" className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-emerald-600 transition-colors">
                            <ChevronLeft className="w-4 h-4" /> Voltar para Documentos
                        </Link>
                    </div>
                </div>
            </main>
        </div>
    );
}
