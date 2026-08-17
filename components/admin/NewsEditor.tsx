"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2, Save, X, Calendar, Link as LinkIcon, Type, Image as ImageIcon, FileText, Share2, Facebook, Linkedin } from "lucide-react";
import { ImageUpload } from "./ImageUpload";
import { RichTextEditor } from "../RichTextEditor";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useNetworkStatus } from "@/hooks/useNetworkStatus";
import { limitWords } from "@/lib/utils";

// Limite de palavras do resumo/subtítulo: o suficiente para caber em 2 linhas
// no banner de destaque do blog sem cortar o texto a meio.
const MAX_SUBTITLE_WORDS = 36;
import { syncManager } from "@/lib/syncManager";
import { shareToFacebook, shareToLinkedin } from "@/app/[locale]/admin/noticias/share-actions";
import { Spinner } from "@/components/ui/spinner";

interface NewsEditorProps {
    initialData?: any;
    isNew?: boolean;
}

export function NewsEditor({ initialData, isNew = false }: NewsEditorProps) {
    const supabase = createClient();
    const router = useRouter();
    const { isOnline } = useNetworkStatus();

    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: initialData?.title || "",
        subtitle: initialData?.subtitle || "",
        type: initialData?.type || "Notícia",
        categories: (initialData?.categories && initialData.categories.length > 0)
            ? initialData.categories
            : [initialData?.type || "Notícia"],
        content: initialData?.content || "",
        image_url: initialData?.image_url || "",
        source: initialData?.source || "",
        source_url: initialData?.source_url || "",
        date: (() => {
            if (!initialData?.date) return new Date().toISOString().split('T')[0];
            const d = new Date(initialData.date);
            return isNaN(d.getTime()) ? new Date().toISOString().split('T')[0] : d.toISOString().split('T')[0];
        })(),
        slug: initialData?.slug || "",
        share_facebook: false,
        share_linkedin: false
    });

    // Recover Draft
    useEffect(() => {
        if (isNew) {
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
    }, [isNew]);

    // Autosave Draft
    useEffect(() => {
        if (isNew && formData.title) {
            const timer = setTimeout(() => {
                localStorage.setItem("agro_article_draft", JSON.stringify(formData));
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [formData, isNew]);

    const categories = ["Notícia", "Mulher Agro", "Artigo Técnico", "Guia", "Relatório", "Legislação", "Documento", "Internacional", "Oportunidade", "Evento", "Recursos", "Política Agrária", "Curiosidade", "Ambiente", "Mercado"];

    // Múltiplas categorias por notícia: a primeira selecionada continua a ser
    // gravada em `type` (categoria principal — usada nos badges e filtros
    // antigos), enquanto `categories` guarda o conjunto completo.
    const toggleCategory = (cat: string) => {
        setFormData((prev) => {
            const has = prev.categories.includes(cat);
            const next = has ? prev.categories.filter((c: string) => c !== cat) : [...prev.categories, cat];
            const safeNext = next.length > 0 ? next : [cat];
            return { ...prev, categories: safeNext, type: safeNext[0] };
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!isOnline) {
            setLoading(true);
            try {
                const payload = { ...formData };
                // Remove internal state fields for DB
                const { share_facebook, share_linkedin, ...dbPayload } = payload as any;

                if (isNew && !dbPayload.slug) {
                    dbPayload.slug = dbPayload.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
                }

                syncManager.addToQueue({
                    table: 'articles',
                    action: isNew ? 'insert' : 'update',
                    payload: isNew ? dbPayload : { ...dbPayload, id: initialData.id }
                });

                if (isNew) localStorage.removeItem("agro_article_draft");
                toast.warning("Offline: Guardado localmente. Será sincronizado quando recuperar conexão.");
                router.push("/admin/noticias");
            } finally {
                setLoading(false);
            }
            return;
        }

        setLoading(true);
        try {
            let error;
            const payload = { ...formData };
            const { share_facebook, share_linkedin, ...dbPayload } = payload as any;

            if (isNew && !dbPayload.slug) {
                dbPayload.slug = dbPayload.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
            }

            if (!isNew && initialData?.id) {
                const { error: err } = await supabase
                    .from('articles')
                    .update(dbPayload)
                    .eq('id', initialData.id);
                error = err;
            } else {
                const { data, error: err } = await supabase
                    .from('articles')
                    .insert([dbPayload])
                    .select()
                    .single();
                error = err;

                if (data && !err) {
                    // Start social sharing if requested
                    if (formData.share_facebook) {
                        shareToFacebook(data.id).then(res => {
                            if (!res.success) toast.error("Facebook: " + res.message);
                            else toast.success("Partilhado no Facebook!");
                        });
                    }
                    if (formData.share_linkedin) {
                        shareToLinkedin(data.id).then(res => {
                            if (!res.success) toast.error("LinkedIn: " + res.message);
                            else toast.success("Partilhado no LinkedIn!");
                        });
                    }
                }
            }

            if (error) throw error;
            if (isNew) localStorage.removeItem("agro_article_draft");
            toast.success(isNew ? "Artigo publicado!" : "Artigo actualizado!");
            router.push("/admin/noticias");
            router.refresh();
        } catch (error: any) {
            toast.error("Erro ao salvar: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white rounded-agro-lg shadow-[0_0_10px_rgba(0,0,0,0.1)] border border-slate-200 flex flex-col h-full">
            {/* Header */}
            <div className="px-6 py-8 border-b border-slate-200 flex items-center justify-between bg-slate-300/40 transition-all shrink-0">
                <div className="flex items-center gap-4 flex-1 min-w-0">
                    <button
                        onClick={() => router.back()}
                        className="p-2 hover:bg-slate-300 rounded-full transition-colors flex-shrink-0 flex items-center justify-center"
                    >
                        <ArrowLeft className="w-5 h-5 text-slate-500" />
                    </button>
                    <div className="flex items-center gap-3 overflow-hidden">
                        <h1 className="text-lg font-black text-slate-800 uppercase tracking-tight whitespace-nowrap leading-none m-0 p-0">
                            {isNew ? "Nova Publicação" : "Editar Publicação"}
                        </h1>
                        {!isNew && (
                            <div className="flex items-center gap-3">
                                <span className="text-slate-300 font-light flex-shrink-0 text-xl leading-none">|</span>
                                <div className="text-sm font-black uppercase tracking-tight truncate flex items-center gap-1.5 leading-none m-0 p-0">
                                    <span className="text-emerald-600">Editando:</span>
                                    <span className="text-slate-500 font-bold">{initialData?.title}</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-3 ml-4 flex-shrink-0">
                    <div className="bg-white px-3 py-1.5 rounded-full border border-slate-200 shadow-sm flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${formData.type === 'Notícia' ? 'bg-blue-500' : 'bg-emerald-500'}`}></span>
                        <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">{formData.type}</span>
                    </div>
                </div>
            </div>

            {/* Body */}
            <form onSubmit={handleSubmit} className="p-10 space-y-8 flex-1 overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

                    {/* Main Content (2 Cols) */}
                    <div className="md:col-span-2 space-y-6">

                        {/* Title Section */}
                        <div className="space-y-4">
                            <h3 className="text-xs font-black uppercase text-emerald-600 tracking-widest border-b border-emerald-100 pb-2 mb-4">Conteúdo Principal</h3>

                            <div className="relative">
                                <FileText className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <Input
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    placeholder="Manchete da Publicação"
                                    className="pl-12 pr-4 py-6 bg-slate-50 border border-slate-200 rounded-lg text-lg font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none w-full transition-all shadow-sm"
                                    required
                                />
                            </div>

                            <div className="relative">
                                <Type className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <Input
                                    value={formData.subtitle}
                                    onChange={(e) => setFormData({ ...formData, subtitle: limitWords(e.target.value, MAX_SUBTITLE_WORDS) })}
                                    placeholder="Subtítulo ou lead... (Opcional)"
                                    className="pl-12 pr-4 py-6 bg-slate-50 border border-slate-200 rounded-lg text-md font-medium text-slate-600 focus:ring-2 focus:ring-emerald-500 outline-none w-full transition-all shadow-sm"
                                />
                            </div>

                            <div className="relative">
                                <RichTextEditor
                                    value={formData.content}
                                    onChange={(val) => setFormData({ ...formData, content: val })}
                                    placeholder="Escreva o conteúdo detalhado da publicação aqui..."
                                    className="bg-slate-50 rounded-lg border border-slate-200 min-h-[500px]"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Sidebar (1 Col) */}
                    <div className="space-y-6">

                        {/* Meta Info Box */}
                        <div className="bg-slate-50 rounded-xl border border-slate-200 p-6 space-y-6 shadow-sm">
                            <h3 className="text-xs font-black uppercase text-slate-800 flex items-center gap-2 border-b border-slate-200 pb-3">
                                <FileText className="w-4 h-4 text-emerald-500" />
                                Detalhes da Publicação
                            </h3>

                            <div className="space-y-4">
                                <div>
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-2 block">Categorias (pode escolher várias)</label>
                                    <div className="flex flex-wrap gap-1.5">
                                        {categories.map(cat => {
                                            const active = formData.categories.includes(cat);
                                            return (
                                                <button
                                                    key={cat}
                                                    type="button"
                                                    onClick={() => toggleCategory(cat)}
                                                    className={`px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wide transition-all border ${active
                                                        ? "bg-emerald-600 text-white border-emerald-600"
                                                        : "bg-white text-slate-500 border-slate-200 hover:border-emerald-300"
                                                        }`}
                                                >
                                                    {cat}
                                                </button>
                                            );
                                        })}
                                    </div>
                                    <p className="text-[10px] text-slate-400 mt-2">Principal: <span className="font-bold text-slate-500">{formData.type}</span> (usada nos badges e no filtro do blog)</p>
                                </div>

                                <div className="relative">
                                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <Input
                                        type="date"
                                        value={formData.date}
                                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                        className="pl-10 bg-white border-slate-200 h-11 font-medium rounded-lg"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Media Box */}
                        <div className="bg-slate-50 rounded-xl border border-slate-200 p-6 space-y-6 shadow-sm">
                            <h3 className="text-xs font-black uppercase text-slate-800 flex items-center gap-2 border-b border-slate-200 pb-3">
                                <ImageIcon className="w-4 h-4 text-emerald-500" />
                                Imagem de Capa
                            </h3>

                            <div className="space-y-4">
                                <ImageUpload
                                    value={formData.image_url}
                                    onChange={(url) => setFormData({ ...formData, image_url: url })}
                                    label="Imagem de Capa"
                                    description="Carregue uma imagem de destaque"
                                    bucket="public-assets"
                                    folder="news"
                                    aspectRatio="video"
                                    recommendedSize="1200x675px"
                                />
                            </div>
                        </div>

                        {/* Social Share Box */}
                        <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-6 shadow-sm overflow-hidden">
                            <h3 className="text-xs font-black uppercase text-slate-800 flex items-center gap-2 border-b border-slate-200 pb-3">
                                <Share2 className="w-4 h-4 text-orange-500" />
                                Partilhar nas Redes
                            </h3>

                            <div className="space-y-4">
                                <div className={`flex items-center justify-between p-3 rounded-lg border ${formData.share_facebook ? 'bg-blue-50 border-blue-200' : 'bg-slate-50 border-slate-200'} transition-all`}>
                                    <div className="flex items-center gap-3">
                                        <Facebook className={`w-5 h-5 ${formData.share_facebook ? 'text-blue-600' : 'text-slate-400'}`} />
                                        <span className={`text-sm font-bold ${formData.share_facebook ? 'text-blue-900' : 'text-slate-500'}`}>Facebook</span>
                                    </div>
                                    <input
                                        type="checkbox"
                                        checked={formData.share_facebook}
                                        onChange={(e) => setFormData({ ...formData, share_facebook: e.target.checked })}
                                        className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                    />
                                </div>
                                {initialData?.shared_on_facebook_at && (
                                    <p className="text-[10px] text-emerald-600 font-bold uppercase text-center">Já partilhado em {new Date(initialData.shared_on_facebook_at).toLocaleDateString()} ✅</p>
                                )}

                                <div className={`flex items-center justify-between p-3 rounded-lg border ${formData.share_linkedin ? 'bg-sky-50 border-sky-200' : 'bg-slate-50 border-slate-200'} transition-all`}>
                                    <div className="flex items-center gap-3">
                                        <Linkedin className={`w-5 h-5 ${formData.share_linkedin ? 'text-sky-700' : 'text-slate-400'}`} />
                                        <span className={`text-sm font-bold ${formData.share_linkedin ? 'text-sky-900' : 'text-slate-500'}`}>LinkedIn</span>
                                    </div>
                                    <input
                                        type="checkbox"
                                        checked={formData.share_linkedin}
                                        onChange={(e) => setFormData({ ...formData, share_linkedin: e.target.checked })}
                                        className="w-5 h-5 rounded border-slate-300 text-sky-700 focus:ring-sky-600"
                                    />
                                </div>
                                {initialData?.shared_on_linkedin_at && (
                                    <p className="text-[10px] text-emerald-600 font-bold uppercase text-center">Já partilhado em {new Date(initialData.shared_on_linkedin_at).toLocaleDateString()} ✅</p>
                                )}
                            </div>

                            {!initialData && (
                                <div className="p-3 bg-amber-50 rounded-lg border border-amber-100">
                                    <p className="text-[10px] text-amber-700 font-medium leading-tight">
                                        A partilha será realizada imediatamente após clicar em "Publicar Artigo".
                                    </p>
                                </div>
                            )}
                        </div>

                    </div>
                </div>

                {/* Footer Buttons */}
                <div className="pt-8 border-t border-slate-100 flex items-center justify-end gap-3">
                    <Button type="button" variant="outline" onClick={() => router.back()} className="px-8 h-10 rounded-lg text-xs font-black text-slate-500 uppercase tracking-widest bg-white hover:bg-slate-50">
                        Cancelar
                    </Button>
                    <Button
                        type="submit"
                        disabled={loading}
                        className="px-10 h-10 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-black uppercase tracking-widest shadow-lg"
                    >
                        {<Save className="w-4 h-4 mr-2" />}
                        {isNew ? "Publicar Artigo" : "Guardar Alterações"}
                    </Button>
                </div>
            </form>
        </div>
    );
}
