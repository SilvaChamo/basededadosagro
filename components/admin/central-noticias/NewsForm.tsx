"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { RichTextEditor } from "@/components/RichTextEditor";
import { ImageSelector } from "./ImageSelector";
import { useNewsCategories } from "./useNewsCategories";
import { Key, Eye, Calendar, ChevronUp } from "lucide-react";

interface NewsFormProps {
    initialData?: any;
    isEdit?: boolean;
}

const STATUS_LABELS: Record<string, string> = {
    draft: "Rascunho",
    active: "Publicado",
    inactive: "Arquivado",
};

const inputClass =
    "w-full bg-white text-[#2c3338] border border-[#8c8f94] rounded-[4px] outline-none focus:border-[#2271b1] focus:ring-1 focus:ring-[#2271b1] shadow-[inset_0_1px_2px_rgba(0,0,0,0.07)]";

function toDateInputValue(value: any): string {
    const parsed = value ? new Date(value) : null;
    if (parsed && !Number.isNaN(parsed.getTime())) {
        return parsed.toISOString().split("T")[0];
    }
    return new Date().toISOString().split("T")[0];
}

export function NewsForm({ initialData, isEdit = false }: NewsFormProps) {
    const router = useRouter();
    const categories = useNewsCategories();
    const [loading, setLoading] = useState(false);
    const [isImageSelectorOpen, setIsImageSelectorOpen] = useState(false);
    const [lineHeight, setLineHeight] = useState(1.6);
    const [paragraphSpacing, setParagraphSpacing] = useState(0.5);

    const [formData, setFormData] = useState({
        title: initialData?.title || "",
        slug: initialData?.slug || "",
        content: initialData?.content || "",
        subtitle: initialData?.subtitle || "",
        type: initialData?.type || "Notícia",
        categories: (initialData?.categories && initialData.categories.length > 0)
            ? initialData.categories
            : [initialData?.type || "Notícia"],
        image_url: initialData?.image_url || "",
        source: initialData?.source || "",
        source_url: initialData?.source_url || "",
        status: initialData?.status || "active",
        date: toDateInputValue(initialData?.date),
    });

    // Gerar slug automaticamente a partir do título (só ao criar, não ao editar)
    useEffect(() => {
        if (!isEdit && !formData.slug && formData.title) {
            const generatedSlug = formData.title
                .toLowerCase()
                .normalize("NFD")
                .replace(/[̀-ͯ]/g, "")
                .replace(/[^\w\s-]/g, "")
                .replace(/\s+/g, "-")
                .replace(/-+/g, "-");
            setFormData((prev) => ({ ...prev, slug: generatedSlug }));
        }
    }, [formData.title, isEdit, formData.slug]);

    const submitArticle = async (status: string) => {
        setLoading(true);
        try {
            const res = await fetch("/api/admin/articles", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id: isEdit ? initialData?.id : undefined, payload: { ...formData, status } }),
            });
            const result = await res.json();
            if (!res.ok) throw new Error(result.error || "Erro ao guardar.");

            toast.success(status === "draft" ? "Rascunho guardado!" : isEdit ? "Notícia actualizada!" : "Notícia publicada!");
            router.push("/admin/central-noticias");
        } catch (err: any) {
            toast.error("Erro ao guardar: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        submitArticle("active");
    };

    const handleSaveDraft = () => {
        submitArticle("draft");
    };

    // Múltiplas categorias por notícia: a primeira selecionada continua a ser
    // gravada em `type` (categoria principal — usada nos badges e filtros
    // antigos), enquanto `categories` guarda o conjunto completo.
    const toggleCategory = (name: string) => {
        setFormData((prev) => {
            const has = prev.categories.includes(name);
            const next = has ? prev.categories.filter((c: string) => c !== name) : [...prev.categories, name];
            const safeNext = next.length > 0 ? next : [name];
            return { ...prev, categories: safeNext, type: safeNext[0] };
        });
    };

    return (
        <div className="text-[#2c3338] w-full">
            <div className="flex items-center gap-2 mb-4">
                <h1 className="text-[23px] font-normal text-[#1d2327]">{isEdit ? "Editar notícia" : "Adicionar notícia"}</h1>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col lg:flex-row gap-5">
                <div className="flex-1 space-y-5 min-w-0">
                    <input
                        type="text"
                        placeholder="Adicionar título"
                        required
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        className={`${inputClass} h-[50px] px-3 text-[1.4rem]`}
                    />

                    <div className="bg-white border border-[#ccd0d4] rounded-[8px] overflow-hidden shadow-sm">
                        <div className="p-3 border-b border-[#ccd0d4] bg-white flex justify-between items-center">
                            <h2 className="font-semibold text-[14px] text-[#1d2327]">Subtítulo (Resumo)</h2>
                            <ChevronUp className="w-4 h-4 text-gray-500" />
                        </div>
                        <div className="p-4 bg-white">
                            <textarea
                                rows={3}
                                required
                                value={formData.subtitle}
                                onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                                className={`${inputClass} p-3 text-[14px]`}
                            />
                        </div>
                    </div>

                    <div className="bg-white border border-[#ccd0d4] rounded-[8px] overflow-hidden">
                        <RichTextEditor
                            value={formData.content}
                            onChange={(val) => setFormData({ ...formData, content: val })}
                            placeholder="Escreva o conteúdo da notícia..."
                            style={{ minHeight: 400 }}
                            lineHeight={lineHeight}
                            onLineHeightChange={setLineHeight}
                            paragraphSpacing={paragraphSpacing}
                            onParagraphSpacingChange={setParagraphSpacing}
                            galleryScope="noticias"
                            articleId={initialData?.id}
                        />
                    </div>

                    <div className="bg-white border border-[#ccd0d4] rounded-[8px] overflow-hidden shadow-sm">
                        <div className="p-3 border-b border-[#ccd0d4] bg-white flex justify-between items-center">
                            <h2 className="font-semibold text-[14px] text-[#1d2327]">Fonte (opcional)</h2>
                        </div>
                        <div className="p-4 bg-white grid grid-cols-1 md:grid-cols-2 gap-3">
                            <input
                                type="text"
                                placeholder="Nome da fonte"
                                value={formData.source}
                                onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                                className={`${inputClass} h-9 px-3 text-sm`}
                            />
                            <input
                                type="url"
                                placeholder="URL da fonte"
                                value={formData.source_url}
                                onChange={(e) => setFormData({ ...formData, source_url: e.target.value })}
                                className={`${inputClass} h-9 px-3 text-sm`}
                            />
                        </div>
                    </div>
                </div>

                <div className="w-full lg:w-[280px] space-y-5 shrink-0">
                    <div className="bg-white border border-[#ccd0d4] rounded-[8px] overflow-hidden shadow-sm">
                        <div className="p-2.5 border-b border-[#ccd0d4] bg-white flex justify-between items-center">
                            <h2 className="font-semibold text-[14px] text-[#1d2327]">Imagem de destaque</h2>
                            <ChevronUp className="w-4 h-4 text-gray-500" />
                        </div>
                        <div className="p-3">
                            {formData.image_url ? (
                                <div className="space-y-3">
                                    <img src={formData.image_url} className="w-full h-auto border border-[#ccd0d4]" alt="" />
                                    <button type="button" onClick={() => setIsImageSelectorOpen(true)} className="text-[#2271b1] text-[13px] hover:underline underline-offset-2">
                                        Substituir imagem
                                    </button>
                                    <br />
                                    <button type="button" onClick={() => setFormData({ ...formData, image_url: "" })} className="text-[#d63638] text-[13px] hover:underline underline-offset-2">
                                        Remover imagem
                                    </button>
                                </div>
                            ) : (
                                <button type="button" onClick={() => setIsImageSelectorOpen(true)} className="text-[#2271b1] text-[13px] hover:text-[#135e96] underline underline-offset-2 text-left">
                                    Definir imagem de destaque
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="bg-white border border-[#ccd0d4] rounded-[8px] overflow-hidden shadow-sm">
                        <div className="p-2.5 border-b border-[#ccd0d4] bg-white flex justify-between items-center">
                            <h2 className="font-semibold text-[14px] text-[#1d2327]">Publicar</h2>
                            <ChevronUp className="w-4 h-4 text-gray-500" />
                        </div>
                        <div className="p-3 bg-white">
                            <div className="space-y-2.5 text-[13px] text-[#50575e] mb-4">
                                <div className="flex items-center gap-2">
                                    <Key className="w-4 h-4 text-gray-400" />
                                    <span>Estado: <strong>{STATUS_LABELS[formData.status] || "Publicado"}</strong></span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Eye className="w-4 h-4 text-gray-400" />
                                    <span>Visibilidade: <strong>Público</strong></span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Calendar className="w-4 h-4 text-gray-400" />
                                    <input
                                        type="date"
                                        value={formData.date}
                                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                        className="h-7 px-1.5 bg-white border border-[#8c8f94] rounded text-[13px] outline-none focus:border-[#2271b1]"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="p-3 bg-[#f6f7f7] flex items-center justify-between gap-2 border-t border-[#ccd0d4]">
                            <button
                                type="button"
                                onClick={handleSaveDraft}
                                disabled={loading}
                                className="px-4 py-2 bg-white border border-[#8c8f94] text-[#2c3338] text-[13px] font-medium rounded-[4px] hover:bg-[#f0f0f1] disabled:opacity-50"
                            >
                                Guardar rascunho
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="px-6 py-2 bg-[#2271b1] text-white text-[14px] font-medium rounded-[4px] hover:bg-[#135e96] disabled:opacity-50"
                            >
                                {loading ? "A guardar..." : isEdit ? "Atualizar" : "Publicar"}
                            </button>
                        </div>
                    </div>

                    <div className="bg-white border border-[#ccd0d4] rounded-[8px] overflow-hidden shadow-sm">
                        <div className="p-2.5 border-b border-[#ccd0d4] bg-white flex justify-between items-center">
                            <h2 className="font-semibold text-[14px] text-[#1d2327]">Categorias</h2>
                            <ChevronUp className="w-4 h-4 text-gray-500" />
                        </div>
                        <div className="p-3 bg-white max-h-48 overflow-y-auto">
                            <div className="space-y-1.5">
                                {categories.map((cat) => (
                                    <label key={cat.id} className="flex items-start gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            className="mt-0.5 rounded border-[#8c8f94] text-[#2271b1] focus:ring-[#2271b1]"
                                            checked={formData.categories.includes(cat.name)}
                                            onChange={() => toggleCategory(cat.name)}
                                        />
                                        <span className="text-[#2c3338]">{cat.name}</span>
                                    </label>
                                ))}
                            </div>
                            <p className="text-[11px] text-[#787c82] mt-2 pt-2 border-t border-[#f0f0f1]">Principal: <strong>{formData.type}</strong></p>
                        </div>
                    </div>
                </div>
            </form>

            {isImageSelectorOpen && (
                <ImageSelector
                    onClose={() => setIsImageSelectorOpen(false)}
                    onSelect={(url) => {
                        setFormData((prev) => ({ ...prev, image_url: url }));
                        setIsImageSelectorOpen(false);
                    }}
                />
            )}
        </div>
    );
}
