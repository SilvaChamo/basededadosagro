"use client";

import DOMPurify from "isomorphic-dompurify";
import { useRouter } from "next/navigation";
import {
    ArrowLeft, Pencil, ExternalLink, Download, Calendar,
    FileText as FileTextIcon, FileArchive, File as FileIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { AdminListToolbar, AdminToolbarTitle } from "@/components/admin/AdminListToolbar";
import { useAdminTopBar } from "@/components/admin/AdminTopBar";

// Ícone por extensão — mesma lógica do MultiFileUpload / página pública, para
// a lista "Ficheiros do Documento" coincidir com o que o editor mostra.
function fileIconFor(url: string) {
    if (/\.pdf$/i.test(url)) return <FileTextIcon className="w-5 h-5 text-red-500" />;
    if (/\.(zip|rar)$/i.test(url)) return <FileArchive className="w-5 h-5 text-amber-600" />;
    return <FileIcon className="w-5 h-5 text-slate-500" />;
}

const STATUS: Record<string, { label: string; cls: string }> = {
    published: { label: "Publicado", cls: "bg-emerald-100 text-emerald-700" },
    review: { label: "Pendente para revisão", cls: "bg-amber-100 text-amber-700" },
    draft: { label: "Rascunho", cls: "bg-slate-200 text-slate-600" },
};

export function DocumentView({ document: doc }: { document: any }) {
    const router = useRouter();
    // Suprime a barra "Sair" antiga — esta página traz o seu próprio
    // cabeçalho via AdminListToolbar, como o DocumentForm.
    useAdminTopBar("");

    const categories: string[] = (doc.categories && doc.categories.length > 0)
        ? doc.categories
        : (doc.type ? [doc.type] : []);
    const status = STATUS[doc.publish_status as string] || STATUS.published;
    const hasContent = doc.content && doc.content.trim().length > 0;
    const files: string[] = doc.files || [];

    return (
        <div className="space-y-4">
            <AdminListToolbar>
                <AdminToolbarTitle
                    title={doc.title || "Documento"}
                    leading={
                        <button
                            onClick={() => router.push("/admin/documentos")}
                            className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500 shrink-0"
                            title="Voltar"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                    }
                />
                <div className="flex items-center gap-3 shrink-0">
                    <Button
                        type="button"
                        onClick={() => router.push(`/admin/documentos/${doc.id}`)}
                        className="bg-emerald-600 hover:bg-emerald-700 min-w-[120px] gap-2"
                    >
                        <Pencil className="w-4 h-4" /> Editar
                    </Button>
                </div>
            </AdminListToolbar>

            <div className="grid grid-cols-1 md:grid-cols-[7fr_3fr] gap-6">
                {/* Conteúdo do documento */}
                <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6 md:p-8 space-y-6">
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-emerald-600/10 border border-emerald-500/20 text-[10px] font-bold uppercase tracking-widest text-emerald-700">
                            <span className="w-2 h-2 rounded-full bg-emerald-600" />
                            {doc.type || "Documento"}
                        </span>
                        <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest ${status.cls}`}>
                            {status.label}
                        </span>
                    </div>

                    <h1 className="text-2xl md:text-3xl font-black text-slate-800 leading-tight tracking-tight">
                        {doc.title}
                    </h1>

                    {doc.date && (
                        <div className="flex items-center gap-2 text-[11px] text-slate-400 font-bold uppercase tracking-widest pb-5 border-b border-slate-100">
                            <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                            {new Date(doc.date).toLocaleDateString("pt-PT", { day: "2-digit", month: "short", year: "numeric" }).replace(" de ", " ")}
                        </div>
                    )}

                    {doc.subtitle && (
                        <div>
                            <h3 className="text-[11px] font-black text-slate-800 uppercase tracking-[0.2em] mb-3">Resumo</h3>
                            <p className="text-[16px] leading-[1.7] text-slate-500">{doc.subtitle}</p>
                        </div>
                    )}

                    {hasContent ? (
                        <div>
                            <h3 className="text-[11px] font-black text-slate-800 uppercase tracking-[0.2em] mb-3">Conteúdo</h3>
                            <div
                                className="article-content prose prose-slate max-w-none prose-p:text-[16px] prose-p:leading-[1.7] prose-p:text-slate-500 prose-headings:text-slate-800 prose-headings:font-black prose-h2:text-2xl prose-h2:mt-8 prose-h2:mb-4 prose-strong:text-slate-700"
                                dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(doc.content || "") }}
                            />
                        </div>
                    ) : (
                        <p className="text-sm text-slate-400 italic">
                            Este documento não tem conteúdo nativo — consulte a fonte externa ou os ficheiros na barra lateral.
                        </p>
                    )}
                </div>

                {/* Barra lateral — fonte principal, ficheiros e detalhes */}
                <div className="space-y-5">
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
                        <h3 className="text-sm font-bold text-slate-800 border-b pb-2 mb-2">Fonte Principal</h3>

                        {doc.source && (
                            <div className="space-y-1">
                                <p className="text-[10px] font-bold text-slate-400 uppercase">Nome da fonte</p>
                                <p className="text-sm font-semibold text-slate-700">{doc.source}</p>
                            </div>
                        )}

                        {doc.source_url ? (
                            <a
                                href={doc.source_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-3 p-3 bg-emerald-50 border border-emerald-100 rounded-xl hover:bg-emerald-100/70 transition-colors"
                            >
                                <span className="size-9 rounded-lg bg-white shadow-sm flex items-center justify-center shrink-0">
                                    <ExternalLink className="w-4 h-4 text-emerald-600" />
                                </span>
                                <span className="min-w-0">
                                    <span className="block text-sm font-bold text-emerald-800">Aceder à fonte original</span>
                                    <span className="block text-[11px] text-emerald-600/70 truncate">{doc.source_url}</span>
                                </span>
                            </a>
                        ) : (
                            <p className="text-[11px] text-slate-400">Sem link de fonte externa.</p>
                        )}
                    </div>

                    {files.length > 0 && (
                        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
                            <h3 className="text-sm font-bold text-slate-800 border-b pb-2 mb-2">Ficheiros do Documento</h3>
                            <div className="space-y-2">
                                {files.map((url, i) => (
                                    <a
                                        key={i}
                                        href={url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center justify-between gap-3 p-3 bg-slate-50 border border-slate-100 rounded-xl hover:bg-slate-100 transition-colors"
                                    >
                                        <span className="flex items-center gap-3 min-w-0">
                                            {fileIconFor(url)}
                                            <span className="text-sm font-semibold text-slate-700 truncate">
                                                {decodeURIComponent(url.split("/").pop() || `Ficheiro ${i + 1}`)}
                                            </span>
                                        </span>
                                        <Download className="w-4 h-4 text-slate-400 shrink-0" />
                                    </a>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-4">
                        <h3 className="text-sm font-bold text-slate-800 border-b pb-2 mb-2">Detalhes</h3>

                        <div className="space-y-1.5">
                            <p className="text-[10px] font-bold text-slate-400 uppercase">Categorias</p>
                            <div className="flex flex-wrap gap-1.5">
                                {categories.length > 0 ? (
                                    categories.map((c) => (
                                        <span key={c} className="px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wide bg-emerald-600 text-white">
                                            {c}
                                        </span>
                                    ))
                                ) : (
                                    <span className="text-[11px] text-slate-400">—</span>
                                )}
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <p className="text-[10px] font-bold text-slate-400 uppercase">Estado</p>
                            <span className={`inline-block px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wide ${status.cls}`}>
                                {status.label}
                            </span>
                        </div>

                        <div className="space-y-1.5">
                            <p className="text-[10px] font-bold text-slate-400 uppercase">Data de publicação</p>
                            <p className="text-sm text-slate-600">
                                {doc.date ? new Date(doc.date).toLocaleDateString("pt-PT", { day: "2-digit", month: "long", year: "numeric" }) : "—"}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
