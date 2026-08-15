"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowLeft, Type, Link as LinkIcon, Calendar } from "lucide-react";
import { RichTextEditor } from "@/components/RichTextEditor";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useNetworkStatus } from "@/hooks/useNetworkStatus";
import { syncManager } from "@/lib/syncManager";
import { useEffect } from "react";

interface ArticleFormProps {
    onClose: () => void;
    onSuccess: () => void;
    initialData?: any;
}

export function ArticleForm({ onClose, onSuccess, initialData }: ArticleFormProps) {
    const { isOnline } = useNetworkStatus();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: initialData?.title || "",
        subtitle: initialData?.subtitle || "",
        type: initialData?.type || "Notícia",
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

    const categories = ["Notícia", "Artigo Técnico", "Guia", "Relatório", "Legislação", "Documento", "Internacional", "Oportunidade", "Evento", "Recursos", "Política Agrária", "Curiosidade"];

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
            let error;
            const payload = { ...formData };

            // Auto-generate slug from title if new
            if (!initialData?.id && !payload.slug) {
                payload.slug = payload.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
            }

            if (initialData?.id) {
                const { error: err, count } = await supabase
                    .from('articles')
                    .update(payload, { count: 'exact' })
                    .eq('id', initialData.id);

                if (!err && count === 0) {
                    throw new Error("Permissão negada: Não foi possível actualizar o artigo. Verifique as suas permissões.");
                }
                error = err;
            } else {
                const { error: err } = await supabase
                    .from('articles')
                    .insert([payload]);
                error = err;
            }

            if (error) throw error;
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
                        <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mt-0.5">Gestão de Conteúdo</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="ghost" type="button" onClick={onClose}>
                        Cancelar
                    </Button>
                    <Button type="submit" form="article-form" disabled={loading} className="bg-emerald-600 hover:bg-emerald-700 min-w-[120px]">
                        {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
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
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Subtítulo (Opcional)</label>
                                    <Input
                                        placeholder="Uma breve descrição ou lead..."
                                        value={formData.subtitle}
                                        onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
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

                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase">Categoria</label>
                                        <select
                                            value={formData.type}
                                            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                            className="w-full h-9 rounded-md border border-slate-200 bg-white px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-emerald-500"
                                        >
                                            {categories.map(cat => (
                                                <option key={cat} value={cat}>{cat}</option>
                                            ))}
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
