"use client";

import { useState, useRef } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowLeft, Type, Link as LinkIcon, Calendar, Plus, X } from "lucide-react";
import { RichTextEditor } from "@/components/RichTextEditor";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useNetworkStatus } from "@/hooks/useNetworkStatus";
import { syncManager } from "@/lib/syncManager";
import { limitWords } from "@/lib/utils";
import { NEWS_CATEGORIES } from "@/lib/constants";

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
        slug: initialData?.slug || ""
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
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500" title="Voltar">
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                            {initialData ? "Editar Artigo" : "Novo Artigo"}
                        </h1>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="ghost" type="button" onClick={onClose}>
                        Cancelar
                    </Button>
                    <Button type="submit" form="article-form" disabled={loading} className="bg-emerald-600 hover:bg-emerald-700 min-w-[120px]">

                        {initialData ? "Actualizar" : "Publicar"}
                    </Button>
                </div>
            </div>

            {/* Body */}
            <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6">
                    <form id="article-form" onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Main Column */}
                            <div className="md:col-span-2 space-y-5">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Título Principal</label>
                                    <Input
                                        placeholder="Manchete da notícia..."
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        className="font-bold text-lg h-12"
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
                                        className="resize-y"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Conteúdo</label>
                                    <RichTextEditor
                                        value={formData.content}
                                        onChange={(val) => setFormData({ ...formData, content: val })}
                                        placeholder="Escreva o conteúdo do artigo aqui..."
                                        className="min-h-[300px]"
                                    />
                                </div>
                            </div>

                            {/* Sidebar Column */}
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
                                                    {categories.filter(cat => !formData.categories.includes(cat)).length === 0 ? (
                                                        <p className="px-3 py-2 text-[11px] text-slate-400">Todas as categorias já foram adicionadas.</p>
                                                    ) : (
                                                        categories
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
                                        <label className="text-[10px] font-bold text-slate-400 uppercase">Tags</label>
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
                                                placeholder="Escreva e prima Enter..."
                                                className="h-8 text-[12px]"
                                            />
                                            <button
                                                type="button"
                                                onClick={addTag}
                                                className="shrink-0 px-2.5 rounded-md border border-slate-200 text-slate-500 hover:text-emerald-600 hover:border-emerald-300 transition-colors"
                                                title="Adicionar tag"
                                            >
                                                <Plus className="w-3.5 h-3.5" />
                                            </button>
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
                                    <h3 className="text-sm font-bold text-slate-800 border-b pb-2 mb-2">Multimédia</h3>

                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase">Imagem de Destaque</label>
                                        <div className="h-[160px]">
                                            <ImageUpload
                                                label="Imagem de Destaque"
                                                value={formData.image_url}
                                                onChange={(url) => setFormData({ ...formData, image_url: url })}
                                                recommendedSize="1200x630"
                                                maxWidth={1200}
                                                maxHeight={630}
                                                hardCapMB={0.3}
                                                bucket="public-assets"
                                                folder="artigos"
                                                imageClassName="object-cover w-full h-full"
                                                showRecommendedBadge={false}
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
                        </div>
                    </form>
            </div>
        </div>
    );
}
