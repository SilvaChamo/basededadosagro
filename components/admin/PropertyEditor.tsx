"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { ImageUpload } from "./ImageUpload";
import { Loader2, MapPin, Tag, Ruler, Coins, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { Spinner } from "@/components/ui/spinner";
import { useAdminTopBar } from "@/components/admin/AdminTopBar";

interface PropertyEditorProps {
    initialData?: any;
    isNew?: boolean;
}

export function PropertyEditor({ initialData, isNew = false }: PropertyEditorProps) {
    const supabase = createClient();
    const router = useRouter();
    useAdminTopBar("");
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: initialData?.title || "",
        type: initialData?.type || "Fazenda",
        location: initialData?.location || "",
        price: initialData?.price || "",
        size: initialData?.size || "",
        status: initialData?.status || "Venda",
        ownership_type: initialData?.ownership_type || "Privada",
        description: initialData?.description || "",
        image_url: initialData?.image_url || "",
    });

    const types = ["Fazenda", "Terreno", "Armazém", "Agro-Indústria", "Outro"];
    const statuses = ["Venda", "Arrendamento", "Parceria"];
    const ownershipTypes = ["Publica", "Privada", "Particular"];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            let error;
            const dataToSave = {
                ...formData,
                price: formData.price ? parseFloat(formData.price.toString().replace(/[^0-9.]/g, '')) : null
            };

            if (!isNew && initialData?.id) {
                const { error: err } = await supabase
                    .from('properties')
                    .update(dataToSave)
                    .eq('id', initialData.id);
                error = err;
            } else {
                const { error: err } = await supabase
                    .from('properties')
                    .insert([dataToSave]);
                error = err;
            }

            if (error) throw error;
            // Redirect to the properties list (which might be /admin/empresas?view=properties or /admin/propriedades once I make it)
            // For now, I'll assume I'm making a dedicated list page or redirecting to the shared one.
            // Since I plan to make /admin/propriedades/page.tsx, I'll redirect there.
            router.push('/admin/propriedades');
            router.refresh();
        } catch (error: any) {
            alert("Erro ao salvar propriedade: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white rounded-agro-lg shadow-[0_0_10px_rgba(0,0,0,0.1)] border border-slate-200 flex flex-col h-full">
            {/* Header */}
            <div className="px-6 h-20 border-b border-slate-200 flex items-center justify-between bg-white shrink-0">
                <div className="flex items-center gap-4 flex-1 min-w-0">
                    <button
                        onClick={() => router.back()}
                        className="p-2 hover:bg-slate-100 rounded-full transition-colors flex-shrink-0 flex items-center justify-center"
                    >
                        <ArrowLeft className="w-5 h-5 text-slate-500" />
                    </button>
                    <div className="flex items-center gap-3 overflow-hidden">
                        <h1 className="text-lg font-black text-slate-800 uppercase tracking-tight whitespace-nowrap leading-none m-0 p-0">
                            {isNew ? "Adicionar Propriedade" : "Editar Propriedade"}
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
                        <span className={`w-2 h-2 rounded-full ${formData.status === 'Venda' ? 'bg-emerald-500' : 'bg-blue-500'}`}></span>
                        <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">{formData.type}</span>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="flex-1 p-10 space-y-8 overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

                    {/* Main Content (2 Cols) */}
                    <div className="md:col-span-2 space-y-6">

                        {/* Title Section */}
                        <div className="space-y-4">
                            <h3 className="text-xs font-black uppercase text-emerald-600 tracking-widest border-b border-emerald-100 pb-2 mb-4">Informação da Propriedade</h3>

                            <div className="relative">
                                <Tag className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    required
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    placeholder="Título da Propriedade (Ex: Fazenda no Chókwè)"
                                    className="pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-lg text-lg font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none w-full transition-all shadow-sm"
                                />
                            </div>

                            <div className="relative">
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Descrição detalhada e características..."
                                    className="p-4 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-emerald-500 outline-none resize-none h-32 w-full transition-all shadow-sm"
                                />
                            </div>
                        </div>

                        {/* Details Section */}
                        <div className="space-y-4">
                            <h3 className="text-xs font-black uppercase text-emerald-600 tracking-widest border-b border-emerald-100 pb-2 mb-4">Detalhes & Características</h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="relative">
                                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input
                                        value={formData.location}
                                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                        placeholder="Localização (Distrito, Província)"
                                        className="pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold text-slate-700 focus:ring-2 focus:ring-emerald-500 outline-none w-full transition-all shadow-sm"
                                    />
                                </div>
                                <div className="relative">
                                    <Ruler className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input
                                        value={formData.size}
                                        onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                                        placeholder="Tamanho (Ex: 50 hectares)"
                                        className="pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold text-slate-700 focus:ring-2 focus:ring-emerald-500 outline-none w-full transition-all shadow-sm"
                                    />
                                </div>
                                <div className="relative">
                                    <Coins className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input
                                        type="number"
                                        value={formData.price}
                                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                        placeholder="Preço (MT)"
                                        className="pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold text-slate-700 focus:ring-2 focus:ring-emerald-500 outline-none w-full transition-all shadow-sm"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar (1 Col) */}
                    <div className="space-y-6">

                        {/* Classification Box */}
                        <div className="bg-slate-50 rounded-xl border border-slate-200 p-6 space-y-6 shadow-sm">
                            <h3 className="text-xs font-black uppercase text-slate-800 flex items-center gap-2 border-b border-slate-200 pb-3">
                                <Tag className="w-4 h-4 text-emerald-500" />
                                Classificação
                            </h3>

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Tipo de Propriedade</label>
                                    <select
                                        value={formData.type}
                                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                        className="w-full h-11 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium shadow-sm outline-none focus:ring-2 focus:ring-emerald-500"
                                    >
                                        {types.map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Finalidade</label>
                                    <select
                                        value={formData.status}
                                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                        className="w-full h-11 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium shadow-sm outline-none focus:ring-2 focus:ring-emerald-500"
                                    >
                                        {statuses.map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Tipo de Posse</label>
                                    <select
                                        value={formData.ownership_type}
                                        onChange={(e) => setFormData({ ...formData, ownership_type: e.target.value })}
                                        className="w-full h-11 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium shadow-sm outline-none focus:ring-2 focus:ring-emerald-500"
                                    >
                                        {ownershipTypes.map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Image Box */}
                        <div className="bg-slate-50 rounded-xl border border-slate-200 p-6 space-y-6 shadow-sm">
                            <h3 className="text-xs font-black uppercase text-slate-800 flex items-center gap-2 border-b border-slate-200 pb-3">
                                <MapPin className="w-4 h-4 text-emerald-500" />
                                Imagem de Capa
                            </h3>

                            <div className="space-y-4">
                                <ImageUpload
                                    label="Imagem de Capa"
                                    value={formData.image_url}
                                    onChange={(url) => setFormData({ ...formData, image_url: url })}
                                    recommendedSize="1200x675px"
                                    maxSizeMB={1}
                                    bucket="public-assets"
                                    folder="properties"
                                    aspectRatio="video"
                                    imageClassName="w-full h-full object-cover rounded-lg"
                                    showRecommendedBadge={false}
                                    maxWidth={1200}
                                    maxHeight={675}
                                />
                            </div>
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
                        {(isNew ? <Tag className="w-4 h-4 mr-2" /> : <Tag className="w-4 h-4 mr-2" />)}
                        {isNew ? "Adicionar Propriedade" : "Guardar Alterações"}
                    </Button>
                </div>
            </form>
        </div>
    );
}
