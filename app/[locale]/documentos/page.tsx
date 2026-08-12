"use client";

import React, { useEffect, useState } from "react";
import { StandardBlogTemplate } from "@/components/StandardBlogTemplate";
import { FileText, Search, ArrowDownToLine, Calendar, ExternalLink, Info, Link as LinkIcon } from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { createClient } from "@supabase/supabase-js";

export default function DocumentsArchivePage() {
    const [docs, setDocs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        async function fetchDocs() {
            setLoading(true);
            try {
                const { data, error } = await supabase
                    .from('articles')
                    .select('*')
                    .is('deleted_at', null)
                    .in('type', ['document', 'Relatório', 'Legislação', 'PDF', 'Documento', 'Artigo Técnico'])
                    .order('date', { ascending: false });

                if (error) throw error;
                setDocs(data || []);
            } catch (error) {
                console.error("Error fetching documents:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchDocs();
    }, []);



    const filteredDocs = docs.filter((doc: any) => {
        const normalize = (text: string) => text ? text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase() : "";
        const query = normalize(searchQuery);
        const content = normalize(`${doc.title} ${doc.subtitle || ''} ${doc.source || ''}`);
        return content.includes(query);
    });

    return (
        <StandardBlogTemplate
            title="Documentos e Legislação"
            backgroundImage="https://images.unsplash.com/photo-1450101499163-18848c4e59e9?q=80&w=2000&auto=format&fit=crop"
            breadcrumbs={[
                { label: "Início", href: "/" },
                { label: "Repositório", href: "/repositorio" },
                { label: "Documentos", href: undefined }
            ]}
            sidebarComponents={
                <div className="space-y-agro">
                    <div className="bg-white p-6 rounded-[15px] border border-slate-100 shadow-sm">
                        <div className="flex items-center gap-2 mb-4">
                            <Info className="w-4 h-4 text-emerald-600" />
                            <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-0">Informação</h3>
                        </div>
                        <p className="text-sm text-slate-500 leading-relaxed">
                            Acesse documentos oficiais, legislação e relatórios estratégicos do setor agrário em Moçambique.
                        </p>
                    </div>
                </div>
            }
        >
            <div className="space-y-6">
                {/* Enhanced Search Input */}
                <div className="relative bg-white rounded-[10px] shadow-sm h-12 flex items-center border border-gray-200 transition-all duration-300 overflow-hidden focus-within:border-emerald-500 focus-within:ring-1 focus-within:ring-emerald-500">
                    <div className="pl-6 text-gray-400">
                        <Search className="h-5 w-5" />
                    </div>
                    <input
                        className="border-none shadow-none focus-visible:ring-0 text-base h-full bg-transparent placeholder:text-gray-400 flex-1 px-4 outline-none"
                        placeholder="Pesquisar por título, fonte ou contexto..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <div className="flex items-center gap-2 px-6 h-full border-l border-gray-100 bg-gray-50">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider hidden sm:block whitespace-nowrap">
                            Documentos
                        </span>
                    </div>
                </div>

                {loading ? (
                    Array(4).fill(0).map((_: any, i: any) => (
                        <div key={i} className="animate-pulse bg-white rounded-[15px] h-[100px]" />
                    ))
                ) : filteredDocs.length > 0 ? (
                    filteredDocs.map((doc: any) => (
                        <div key={doc.id} className="bg-white p-6 rounded-[15px] border border-slate-100 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row items-start md:items-center justify-between group gap-4">
                            <div className="flex items-start gap-5">
                                <div className="size-14 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-rose-500 group-hover:text-white transition-all shrink-0">
                                    <FileText className="w-7 h-7" />
                                </div>
                                <div className="space-y-1.5">
                                    <h3 className="text-lg font-bold text-slate-800 group-hover:text-rose-600 transition-colors leading-tight">
                                        <Link href={`/artigos/${doc.slug}`}>
                                            {doc.title}
                                        </Link>
                                    </h3>
                                    {doc.subtitle && (
                                        <p className="text-xs text-slate-500 max-w-2xl truncate">
                                            {doc.subtitle}
                                        </p>
                                    )}
                                    <div className="flex flex-wrap items-center gap-4 mt-1">
                                        <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1">
                                            <Calendar className="w-3 h-3" /> {new Date(doc.date).getFullYear()}
                                        </div>
                                        {doc.source && (
                                            <a
                                                href={doc.source_url || '#'}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-[10px] font-bold uppercase tracking-widest text-emerald-600 hover:underline flex items-center gap-1"
                                                onClick={(e) => !doc.source_url && e.preventDefault()}
                                            >
                                                <LinkIcon className="w-3 h-3" /> Fonte: {doc.source}
                                            </a>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 w-full md:w-auto justify-end">
                                {doc.source_url ? (
                                    <a
                                        href={doc.source_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="bg-slate-50 text-slate-400 p-2.5 rounded-lg hover:bg-emerald-600 hover:text-white transition-all inline-flex items-center justify-center"
                                        title="Baixar Documento"
                                    >
                                        <ArrowDownToLine className="w-5 h-5" />
                                    </a>
                                ) : (
                                    <button className="bg-slate-50 text-slate-400 p-2.5 rounded-lg hover:bg-emerald-600 hover:text-white transition-all opacity-50 cursor-not-allowed" title="Sem link disponível">
                                        <ArrowDownToLine className="w-5 h-5" />
                                    </button>
                                )}
                                <Link href={`/artigos/${doc.slug}`}>
                                    <button className="bg-slate-50 text-slate-400 p-2.5 rounded-lg hover:bg-slate-800 hover:text-white transition-all" title="Ver Detalhes">
                                        <ExternalLink className="w-5 h-5" />
                                    </button>
                                </Link>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="py-20 text-center text-slate-400 bg-white rounded-[20px] border border-dashed border-slate-200">
                        <Search className="w-12 h-12 mx-auto mb-4 opacity-20" />
                        <p>Nenhum documento encontrado para "{searchQuery}".</p>
                    </div>
                )}
            </div>
        </StandardBlogTemplate>
    );
}
