"use client";

import { useState, useRef } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowLeft, Type, Link as LinkIcon, Calendar, Plus, X, Upload, ChevronDown, Check } from "lucide-react";
import { RichTextEditor } from "@/components/RichTextEditor";
import { ImageSelector } from "@/components/admin/central-noticias/ImageSelector";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useNetworkStatus } from "@/hooks/useNetworkStatus";
import { syncManager } from "@/lib/syncManager";
import { limitWords, cn } from "@/lib/utils";
import { NEWS_CATEGORIES } from "@/lib/constants";
import { AdminListToolbar, AdminToolbarTitle } from "@/components/admin/AdminListToolbar";

// Limite de palavras do resumo/subtítulo: o suficiente para caber em 2 linhas
// no banner de destaque do blog sem cortar o texto a meio.
const MAX_SUBTITLE_WORDS = 36;
import { useEffect } from "react";
import { Spinner } from "@/components/ui/spinner";

interface ArticleFormProps {
    onClose: () => void;
    onSuccess: () => void;
    initialData?: any;
}

export function ArticleForm({ onClose, onSuccess, initialData }: ArticleFormProps) {
    const { isOnline } = useNetworkStatus();
    const [loading, setLoading] = useState(false);
    const [isCategoryOpen, setIsCategoryOpen] = useState(false);
    const [showImageSelector, setShowImageSelector] = useState(false);
    const categoryRef = useRef<HTMLDivElement>(null);
    const [tagInput, setTagInput] = useState("");
    const [formData, setFormData] = useState({
        title: initialData?.title || "",
        subtitle: initialData?.subtitle || "",
        type: initialData?.type || "Notícia",
        categories: (initialData?.categories && initialData.categories.length > 0)
            ? initialData.categories
            : [initialData?.type || "Notícia"],
        tags: (initialData?.tags as string[]) || [],
        content: initialData?.content || "",
        image_url: initialData?.image_url || "",
        source: initialData?.source || "",
        source_url: initialData?.source_url || "",
        date: initialData?.date ? new Date(initialData.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        slug: initialData?.slug || "",
        publish_status: initialData?.publish_status || "published"
    });

    // 1. Recover Draft if New
    useEffect(() => {
        if (!initialData) {
            const draft = localStorage.getItem("agro_article_draft");
            if (draft) {
                try {
                    const parsed = JSON.parse(draft);
                    const mergedData = { ...formData, ...parsed };
                    setFormData(mergedData);
                    toast.info("Rascunho recuperado automaticamente");
                } catch (e) { }
            }
        }
    }, [initialData]);

    // 2. Autosave Draft if New
    useEffect(() => {
        if (!initialData && formData.title) {
            const timer = setTimeout(() => {
                localStorage.setItem("agro_article_draft", JSON.stringify(formData));
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [formData, initialData]);

    // Fecha o dropdown de categorias ao clicar fora dele
    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (categoryRef.current && !categoryRef.current.contains(e.target as Node)) {
                setIsCategoryOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const categories = NEWS_CATEGORIES;

    // Múltiplas categorias por notícia: a primeira selecionada continua a ser
    // gravada em `type` (categoria principal — usada nos badges e filtros
    // antigos), enquanto `categories` guarda o conjunto completo.
    // Selecção múltipla de categorias via checkboxes — nunca deixar o
    // artigo sem nenhuma categoria (a primeira continua a ser gravada em
    // `type`, a categoria principal usada nos badges e filtros antigos).
    const toggleCategory = (cat: string) => {
        setFormData((prev) => {
            const has = prev.categories.includes(cat);
            let next = has
                ? prev.categories.filter((c: string) => c !== cat)
                : [...prev.categories, cat];
            if (next.length === 0) next = [cat];
            return { ...prev, categories: next, type: next[0] };
        });
    };

    // Tags são texto livre (diferente de categorias, que vêm de uma lista
    // fixa) — Enter ou vírgula adiciona a tag actual à lista.
    const addTag = () => {
        const value = tagInput.trim();
        if (!value) return;
        setFormData((prev) => (
            prev.tags.includes(value) ? prev : { ...prev, tags: [...prev.tags, value] }
        ));
        setTagInput("");
    };

    const removeTag = (tag: string) => {
        setFormData((prev) => ({ ...prev, tags: prev.tags.filter((t: string) => t !== tag) }));
    };

    const handleTagInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" || e.key === ",") {
            e.preventDefault();
            addTag();
        } else if (e.key === "Backspace" && !tagInput && formData.tags.length > 0) {
            removeTag(formData.tags[formData.tags.length - 1]);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // If Offline, queue the work
        if (!isOnline) {
            setLoading(true);
            try {
                const payload = { ...formData };
                if (!initialData?.id && !payload.slug) {
                    payload.slug = payload.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
                }

                syncManager.addToQueue({
                    table: 'articles',
                    action: initialData?.id ? 'update' : 'insert',
                    payload: initialData?.id ? { ...payload, id: initialData.id } : payload
                });

                if (!initialData) localStorage.removeItem("agro_article_draft");
                toast.warning("Trabalhando Offline: Alteração guardada localmente. Será sincronizada assim que tiver internet!");
                onSuccess();
                onClose();
            } finally {
                setLoading(false);
            }
            return;
        }

        setLoading(true);

        try {
            const payload = { ...formData };

            // Auto-generate slug from title if new
            if (!initialData?.id && !payload.slug) {
                payload.slug = payload.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
            }

            const res = await fetch('/api/admin/articles', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: initialData?.id, payload }),
            });
            const result = await res.json();
            if (!res.ok) throw new Error(result.error || 'Erro ao guardar o artigo.');

            if (!initialData) localStorage.removeItem("agro_article_draft");
            toast.success(initialData?.id ? "Artigo actualizado!" : "Artigo publicado!");
            onSuccess();
            onClose();
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
                    title={initialData ? "Editar Artigo" : "Novo Artigo"}
                    leading={
                        <button type="button" onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500 shrink-0" title="Voltar">
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                    }
                />
                <div className="flex items-center gap-3 shrink-0">
                    <Button variant="ghost" type="button" onClick={onClose} className="bg-slate-100 hover:bg-slate-200 text-slate-500">
                        Cancelar
                    </Button>
                    <Button type="submit" form="article-form" disabled={loading} className="bg-emerald-600 hover:bg-emerald-700 min-w-[120px]">
                        {initialData ? "Actualizar" : "Publicar"}
                    </Button>
                </div>
            </AdminListToolbar>

            {/* Body */}
            <form id="article-form" onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-[7fr_3fr] gap-6">
                            {/* Main Column — Título e Lide soltos; Conteúdo no seu card */}
                            <div className="space-y-5">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Título Principal</label>
                                    <Input
                                        placeholder="Manchete da notícia..."
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        className="font-bold text-lg h-12 bg-white"
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Lide</label>
                                    <Textarea
                                        placeholder="Uma breve descrição ou lead..."
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
                                        placeholder="Escreva o conteúdo do artigo aqui..."
                                        className="min-h-[600px]"
                                        galleryScope="noticias"
                                        articleId={initialData?.id}
                                    />
                                </div>
                            </div>

                            {/* Sidebar Column */}
                            <div className="space-y-5">
                                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-4">
                                    <h3 className="text-sm font-bold text-slate-800 border-b pb-2 mb-2">Multimédia</h3>

                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase">Imagem de Destaque</label>
                                        <div
                                            onClick={() => setShowImageSelector(true)}
                                            className="relative h-[160px] rounded-xl border border-dashed border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-all cursor-pointer group flex items-center justify-center overflow-hidden"
                                        >
                                            {formData.image_url ? (
                                                <>
                                                    <img src={formData.image_url} alt="Imagem de destaque" className="object-cover w-full h-full transition-transform group-hover:scale-105" />
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
                                    <h3 className="text-sm font-bold text-slate-800 border-b pb-2 mb-2">Meta Dados</h3>

                                    <div className="relative" ref={categoryRef}>
                                        <div className="relative">
                                            <button
                                                type="button"
                                                onClick={() => setIsCategoryOpen(open => !open)}
                                                className="w-full flex items-center justify-between gap-2 border border-slate-300 rounded-[8px] bg-white px-3 h-10 text-sm text-slate-600 hover:border-emerald-500 transition-colors"
                                            >
                                                <span className="truncate text-left">
                                                    {formData.categories.length > 0 ? formData.categories.join(", ") : "Seleccionar categoria"}
                                                </span>
                                                <ChevronDown className={cn("w-4 h-4 text-slate-400 shrink-0 transition-transform", isCategoryOpen && "rotate-180")} />
                                            </button>

                                            {isCategoryOpen && (
                                                <div className="absolute z-20 mt-1.5 w-full max-h-60 overflow-y-auto bg-white border border-slate-200 rounded-lg shadow-lg py-1">
                                                    {categories.map(cat => {
                                                        const checked = formData.categories.includes(cat);
                                                        return (
                                                            <button
                                                                key={cat}
                                                                type="button"
                                                                onClick={() => toggleCategory(cat)}
                                                                className="w-full flex items-center gap-2.5 px-3 py-2 text-[13px] text-slate-600 hover:bg-emerald-50 transition-colors"
                                                            >
                                                                <span className={cn(
                                                                    "w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors",
                                                                    checked ? "bg-emerald-600 border-emerald-600 text-white" : "border-slate-300"
                                                                )}>
                                                                    {checked && <Check className="w-3 h-3" />}
                                                                </span>
                                                                {cat}
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="space-y-1.5">
                                        <div className="flex flex-wrap gap-1.5">
                                            {formData.tags.map((tag: string) => (
                                                <span
                                                    key={tag}
                                                    className="flex items-center gap-1 pl-3 pr-1.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-600"
                                                >
                                                    {tag}
                                                    <button
                                                        type="button"
                                                        onClick={() => removeTag(tag)}
                                                        className="w-4 h-4 flex items-center justify-center rounded-full hover:bg-slate-200 transition-colors"
                                                        title="Remover tag"
                                                    >
                                                        <X className="w-3 h-3" />
                                                    </button>
                                                </span>
                                            ))}
                                        </div>
                                        <div className="flex gap-1.5">
                                            <Input
                                                value={tagInput}
                                                onChange={(e) => setTagInput(e.target.value)}
                                                onKeyDown={handleTagInputKeyDown}
                                                placeholder="Adicionar tags"
                                                className="h-10 text-sm bg-white"
                                            />
                                            <button
                                                type="button"
                                                onClick={addTag}
                                                className="shrink-0 h-10 w-10 flex items-center justify-center rounded-[8px] border border-slate-300 text-slate-500 hover:text-emerald-600 hover:border-emerald-500 transition-colors"
                                                title="Adicionar tag"
                                            >
                                                <Plus className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="space-y-1.5">
                                        <select
                                            value={formData.publish_status}
                                            onChange={(e) => setFormData({ ...formData, publish_status: e.target.value })}
                                            className="w-full border border-slate-300 rounded-[8px] bg-white px-3 h-10 text-sm text-slate-600 outline-none hover:border-emerald-500 focus-visible:border-emerald-500 transition-colors"
                                        >
                                            <option value="published">Publicar</option>
                                            <option value="review">Pendente para revisão</option>
                                            <option value="draft">Rascunho</option>
                                        </select>
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase">Data Publicação</label>
                                        <div className="relative">
                                            <Calendar className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                                            <Input
                                                type="date"
                                                value={formData.date}
                                                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                                className="pl-9 h-10"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-4">
                                    <h3 className="text-sm font-bold text-slate-800 border-b pb-2 mb-2">Fonte (Opcional)</h3>

                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase">Nome da Fonte</label>
                                        <Input
                                            placeholder="Ex: Club of Mozambique"
                                            value={formData.source}
                                            onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase">Link do Documento / Fonte Original</label>
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
