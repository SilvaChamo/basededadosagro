"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Link as LinkIcon, Calendar, Plus, X, Upload } from "lucide-react";
import { RichTextEditor } from "@/components/RichTextEditor";
import { ImageSelector } from "@/components/admin/central-noticias/ImageSelector";
import { MultiFileUpload } from "@/components/admin/MultiFileUpload";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { limitWords } from "@/lib/utils";
import { DOCUMENT_CATEGORIES } from "@/lib/constants";
import { AdminListToolbar, AdminToolbarTitle } from "@/components/admin/AdminListToolbar";
import { useAdminTopBar } from "@/components/admin/AdminTopBar";

const MAX_SUBTITLE_WORDS = 36;

interface DocumentFormProps {
    initialData?: any;
    isNew?: boolean;
}

export function DocumentForm({ initialData, isNew = false }: DocumentFormProps) {
    const supabase = createClient();
    const router = useRouter();
    // Suprime a barra "Sair" antiga (AdminShell/AdminTopBar) — este formulário
    // já traz o seu próprio cabeçalho via AdminListToolbar abaixo, como o
    // ArticleForm faz para Notícias.
    useAdminTopBar("");
    const [loading, setLoading] = useState(false);
    const [isCategoryOpen, setIsCategoryOpen] = useState(false);
    const [showImageSelector, setShowImageSelector] = useState(false);
    const categoryRef = useRef<HTMLDivElement>(null);

    const [formData, setFormData] = useState({
        title: initialData?.title || "",
        subtitle: initialData?.subtitle || "",
        type: initialData?.type || DOCUMENT_CATEGORIES[0],
        categories: (initialData?.categories && initialData.categories.length > 0)
            ? initialData.categories
            : [initialData?.type || DOCUMENT_CATEGORIES[0]],
        content: initialData?.content || "",
        image_url: initialData?.image_url || "",
        files: (initialData?.files as string[]) || [],
        source: initialData?.source || "",
        source_url: initialData?.source_url || "",
        date: initialData?.date ? new Date(initialData.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        slug: initialData?.slug || "",
    });

    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (categoryRef.current && !categoryRef.current.contains(e.target as Node)) {
                setIsCategoryOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const addCategory = (cat: string) => {
        setFormData((prev) => {
            if (prev.categories.includes(cat)) return prev;
            const next = [...prev.categories, cat];
            return { ...prev, categories: next, type: next[0] };
        });
        setIsCategoryOpen(false);
    };

    const removeCategory = (cat: string) => {
        setFormData((prev) => {
            const next = prev.categories.filter((c: string) => c !== cat);
            const safeNext = next.length > 0 ? next : [cat];
            return { ...prev, categories: safeNext, type: safeNext[0] };
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const payload = { ...formData };
            if (!initialData?.id && !payload.slug) {
                payload.slug = payload.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
            }

            const res = await fetch('/api/admin/articles', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: initialData?.id, payload }),
            });
            const result = await res.json();
            if (!res.ok) throw new Error(result.error || 'Erro ao guardar o documento.');

            toast.success(initialData?.id ? "Documento actualizado!" : "Documento publicado!");
            router.push("/admin/documentos");
            router.refresh();
        } catch (err: any) {
            toast.error("Erro ao salvar: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-4">
            <AdminListToolbar>
                <AdminToolbarTitle
                    title={initialData ? "Editar Documento" : "Novo Documento"}
                    leading={
                        <button onClick={() => router.back()} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500 shrink-0" title="Voltar">
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                    }
                />
                <div className="flex items-center gap-3 shrink-0">
                    <Button variant="ghost" type="button" onClick={() => router.back()} className="bg-slate-100 hover:bg-slate-200 text-slate-500">
                        Cancelar
                    </Button>
                    <Button type="submit" form="document-form" disabled={loading} className="bg-emerald-600 hover:bg-emerald-700 min-w-[120px]">
                        {initialData ? "Actualizar" : "Publicar"}
                    </Button>
                </div>
            </AdminListToolbar>

            <form id="document-form" onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-[7fr_3fr] gap-6">
                {/* Main Content — Título e Resumo soltos; Conteúdo no seu card */}
                <div className="space-y-5">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Título</label>
                        <Input
                            placeholder="Título do documento..."
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            className="font-bold text-lg h-12 bg-white"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Resumo</label>
                        <Textarea
                            placeholder="Um breve resumo do documento..."
                            value={formData.subtitle}
                            onChange={(e) => setFormData({ ...formData, subtitle: limitWords(e.target.value, MAX_SUBTITLE_WORDS) })}
                            rows={3}
                            className="resize-y bg-white"
                        />
                    </div>

                    <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
                        <RichTextEditor
                            value={formData.content}
                            onChange={(val) => setFormData({ ...formData, content: val })}
                            placeholder="Escreva o conteúdo do documento aqui (documentos nativos)..."
                            className="min-h-[600px]"
                            galleryScope="documentos"
                            articleId={initialData?.id}
                        />
                    </div>
                </div>

                {/* Sidebar — colunas próprias, sem card partilhado com o conteúdo */}
                <div className="space-y-5">
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-4">
                        <h3 className="text-sm font-bold text-slate-800 border-b pb-2 mb-2">Meta Dados</h3>

                        <div className="space-y-1.5" ref={categoryRef}>
                            <label className="text-[10px] font-bold text-slate-400 uppercase">Categorias</label>

                            <div className="flex flex-wrap gap-1.5">
                                {formData.categories.map((cat: string) => (
                                    <span
                                        key={cat}
                                        className="flex items-center gap-1 pl-3 pr-1.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wide bg-emerald-600 text-white"
                                    >
                                        {cat}
                                        {formData.categories.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => removeCategory(cat)}
                                                className="w-4 h-4 flex items-center justify-center rounded-full hover:bg-white/20 transition-colors"
                                                title="Remover categoria"
                                            >
                                                <X className="w-3 h-3" />
                                            </button>
                                        )}
                                    </span>
                                ))}
                            </div>

                            <div className="relative">
                                <button
                                    type="button"
                                    onClick={() => setIsCategoryOpen(open => !open)}
                                    className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-600 hover:text-emerald-700 transition-colors mt-1"
                                >
                                    <Plus className="w-3.5 h-3.5" /> Adicionar categoria
                                </button>

                                {isCategoryOpen && (
                                    <div className="absolute z-10 mt-1.5 w-56 max-h-56 overflow-y-auto bg-white border border-slate-200 rounded-lg shadow-lg py-1">
                                        {DOCUMENT_CATEGORIES.filter(cat => !formData.categories.includes(cat)).length === 0 ? (
                                            <p className="px-3 py-2 text-[11px] text-slate-400">Todas as categorias já foram adicionadas.</p>
                                        ) : (
                                            DOCUMENT_CATEGORIES
                                                .filter(cat => !formData.categories.includes(cat))
                                                .map(cat => (
                                                    <button
                                                        key={cat}
                                                        type="button"
                                                        onClick={() => addCategory(cat)}
                                                        className="w-full text-left px-3 py-1.5 text-[12px] text-slate-600 hover:bg-emerald-50 hover:text-emerald-700 transition-colors"
                                                    >
                                                        {cat}
                                                    </button>
                                                ))
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-400 uppercase">Data Publicação</label>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                                <Input
                                    type="date"
                                    value={formData.date}
                                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                    className="pl-9"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-4">
                        <h3 className="text-sm font-bold text-slate-800 border-b pb-2 mb-2">Imagem de Capa</h3>

                        <div className="space-y-1.5">
                            <div
                                onClick={() => setShowImageSelector(true)}
                                className="relative h-[160px] rounded-xl border border-dashed border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-all cursor-pointer group flex items-center justify-center overflow-hidden"
                            >
                                {formData.image_url ? (
                                    <>
                                        <img src={formData.image_url} alt="Imagem de capa" className="object-cover w-full h-full transition-transform group-hover:scale-105" />
                                        <button
                                            type="button"
                                            onClick={(e) => { e.stopPropagation(); setFormData({ ...formData, image_url: "" }); }}
                                            className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                                            title="Remover"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </>
                                ) : (
                                    <div className="flex flex-col items-center gap-2 p-4 text-center">
                                        <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm border border-slate-100 group-hover:scale-110 transition-transform">
                                            <Upload className="w-5 h-5 text-slate-400 group-hover:text-emerald-500" />
                                        </div>
                                        <p className="text-xs font-bold text-slate-600">Clique para escolher</p>
                                        <p className="text-[10px] text-emerald-600 font-bold tracking-tight">recomendado: 1200x630</p>
                                    </div>
                                )}
                            </div>
                            {showImageSelector && (
                                <ImageSelector
                                    onSelect={(url) => setFormData({ ...formData, image_url: url })}
                                    onClose={() => setShowImageSelector(false)}
                                />
                            )}
                        </div>
                    </div>

                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-4">
                        <h3 className="text-sm font-bold text-slate-800 border-b pb-2 mb-2">Ficheiros do Documento</h3>
                        <p className="text-[10px] text-slate-400">
                            Para um documento nativo (sem fonte externa), carregue aqui o(s) ficheiro(s) — qualquer formato — disponibilizados para download na página pública.
                        </p>
                        <MultiFileUpload
                            value={formData.files}
                            onChange={(files) => setFormData({ ...formData, files })}
                            label="ficheiros"
                            description="Qualquer formato (PDF, Word, etc.)"
                            folder="documentos"
                            layout="minimal"
                        />
                    </div>

                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-4">
                        <h3 className="text-sm font-bold text-slate-800 border-b pb-2 mb-2">Fonte Externa (Opcional)</h3>

                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-400 uppercase">Nome da Fonte</label>
                            <Input
                                placeholder="Ex: MASA, INE, Boletim da República"
                                value={formData.source}
                                onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-400 uppercase">Link da Fonte Original</label>
                            <div className="relative">
                                <LinkIcon className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                                <Input
                                    placeholder="https://..."
                                    value={formData.source_url}
                                    onChange={(e) => setFormData({ ...formData, source_url: e.target.value })}
                                    className="pl-9"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
}
