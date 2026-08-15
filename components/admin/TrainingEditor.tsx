"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { ImageUpload } from "./ImageUpload";
import {
    Loader2, GraduationCap, Calendar, Clock,
    MapPin, Users, DollarSign, Plus, Trash2,
    CheckCircle, Notebook, Info, ArrowLeft
} from "lucide-react";
import { useRouter } from "next/navigation";
import { Spinner } from "@/components/ui/spinner";

interface TrainingEditorProps {
    initialData?: any;
    isNew?: boolean;
    isPage?: boolean;
    onClose?: () => void;
    onSuccess?: () => void;
}

export function TrainingEditor({ initialData, isNew = false, isPage = false, onClose, onSuccess }: TrainingEditorProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: initialData?.title || "",
        category: initialData?.category || "Tecnologia",
        description: initialData?.description || "",
        date: initialData?.date || "",
        duration: initialData?.duration || "",
        location: initialData?.location || "",
        venue: initialData?.venue || "",
        price: initialData?.price || "",
        spots_total: initialData?.spots_total || 20,
        spots_available: initialData?.spots_available || initialData?.spots_total || 20,
        instructor: {
            name: initialData?.instructor?.name || "",
            title: initialData?.instructor?.title || "",
            bio: initialData?.instructor?.bio || "",
            image: initialData?.instructor?.image || ""
        },
        topics: initialData?.topics || [""],
        requirements: initialData?.requirements || [""],
        includes: initialData?.includes || [""]
    });

    const categories = ["Tecnologia", "Gestão", "Marketing", "Produção", "Financeiro"];

    const handleListChange = (list: "topics" | "requirements" | "includes", index: number, value: string) => {
        const newList = [...formData[list]];
        newList[index] = value;
        setFormData({ ...formData, [list]: newList });
    };

    const addListItem = (list: "topics" | "requirements" | "includes") => {
        setFormData({ ...formData, [list]: [...formData[list], ""] });
    };

    const removeListItem = (list: "topics" | "requirements" | "includes", index: number) => {
        const newList = formData[list].filter((_: any, i: number) => i !== index);
        setFormData({ ...formData, [list]: newList });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Filter out empty items from lists
            const payload = {
                ...formData,
                topics: (formData.topics as string[]).filter(t => t.trim() !== ""),
                requirements: (formData.requirements as string[]).filter(r => r.trim() !== ""),
                includes: (formData.includes as string[]).filter(i => i.trim() !== ""),
                spots_total: parseInt(formData.spots_total.toString()),
                spots_available: parseInt(formData.spots_available.toString())
            };

            let error;
            if (!isNew && initialData?.id) {
                const { error: err } = await supabase
                    .from('trainings')
                    .update(payload)
                    .eq('id', initialData.id);
                error = err;
            } else {
                const { error: err } = await supabase
                    .from('trainings')
                    .insert([payload]);
                error = err;
            }

            if (error) throw error;

            if (onSuccess) {
                onSuccess();
            } else {
                router.push('/admin/formacao');
                router.refresh();
            }
        } catch (error: any) {
            console.error(error);
            alert("Erro ao salvar formação: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        if (onClose) {
            onClose();
        } else {
            router.back();
        }
    };

    return (
        <div className="bg-white rounded-agro-lg shadow-[0_0_10px_rgba(0,0,0,0.1)] border border-slate-200 flex flex-col">
            <div className="px-6 py-8 border-b border-slate-200 flex items-center justify-between bg-slate-300/40 transition-all shrink-0">
                <div className="flex items-center gap-4 flex-1 min-w-0">
                    <button
                        onClick={handleCancel}
                        className="p-2 hover:bg-slate-300 rounded-full transition-colors flex-shrink-0 flex items-center justify-center"
                    >
                        <ArrowLeft className="w-5 h-5 text-slate-500" />
                    </button>
                    <div className="flex items-center gap-3 overflow-hidden">
                        <h1 className="text-lg font-black text-slate-800 uppercase tracking-tight whitespace-nowrap leading-none m-0 p-0">
                            {isNew ? "Adicionar Formação" : "Editar Formação"}
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
                        <span className={`w-2 h-2 rounded-full ${formData.category ? 'bg-emerald-500' : 'bg-slate-300'}`}></span>
                        <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">{formData.category}</span>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="p-10 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="md:col-span-2 space-y-8">
                        {/* Section 1: General Info */}
                        <div className="space-y-4">
                            <h3 className="text-xs font-black uppercase text-emerald-600 tracking-widest border-b border-emerald-100 pb-2 mb-4">Informações Básicas</h3>

                            <div className="flex flex-col gap-2">
                                <div className="relative">
                                    <GraduationCap className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input
                                        required
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        className="pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-lg text-lg font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none w-full transition-all shadow-sm"
                                        placeholder="Título da Formação (Ex: Gestão de Culturas)"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="relative">
                                    <CheckCircle className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <select
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                        className="pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold text-slate-700 focus:ring-2 focus:ring-emerald-500 outline-none w-full appearance-none shadow-sm"
                                    >
                                        {categories.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>
                                <div className="relative">
                                    <Users className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input
                                        type="number"
                                        value={formData.spots_total}
                                        onChange={(e) => setFormData({ ...formData, spots_total: parseInt(e.target.value) })}
                                        className="pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold text-slate-700 focus:ring-2 focus:ring-emerald-500 outline-none w-full transition-all shadow-sm"
                                        placeholder="Vagas Totais"
                                    />
                                </div>
                            </div>

                            <div className="relative">
                                <textarea
                                    required
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="p-4 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-emerald-500 outline-none h-24 resize-none w-full transition-all shadow-sm"
                                    placeholder="Descreva os objetivos e o público-alvo da formação..."
                                />
                            </div>
                        </div>

                        {/* Section 2: Logistics */}
                        <div className="space-y-4">
                            <h3 className="text-xs font-black uppercase text-emerald-600 tracking-widest border-b border-emerald-100 pb-2 mb-4">Logística & Data</h3>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="relative">
                                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input
                                        value={formData.date}
                                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                        className="pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold text-slate-700 focus:ring-2 focus:ring-emerald-500 outline-none w-full transition-all shadow-sm"
                                        placeholder="15-17 Fev 2025"
                                    />
                                </div>
                                <div className="relative">
                                    <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input
                                        value={formData.duration}
                                        onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                                        className="pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold text-slate-700 focus:ring-2 focus:ring-emerald-500 outline-none w-full transition-all shadow-sm"
                                        placeholder="Duração (Ex: 3 dias)"
                                    />
                                </div>
                                <div className="relative">
                                    <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input
                                        value={formData.price}
                                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                        className="pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold text-slate-700 focus:ring-2 focus:ring-emerald-500 outline-none w-full transition-all shadow-sm"
                                        placeholder="Preço (MT)"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="relative">
                                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input
                                        value={formData.location}
                                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                        className="pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold text-slate-700 focus:ring-2 focus:ring-emerald-500 outline-none w-full transition-all shadow-sm"
                                        placeholder="Cidade, Província"
                                    />
                                </div>
                                <div className="relative">
                                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input
                                        value={formData.venue}
                                        onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                                        className="pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold text-slate-700 focus:ring-2 focus:ring-emerald-500 outline-none w-full transition-all shadow-sm"
                                        placeholder="Localização Exacta (Venue)"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Section 4: Dynamic Lists */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Topics */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                                    <div className="flex items-center gap-2">
                                        <Notebook className="w-4 h-4 text-orange-500" />
                                        <h4 className="text-xs font-black uppercase text-slate-800">Cúrrículo (Tópicos)</h4>
                                    </div>
                                    <button type="button" onClick={() => addListItem("topics")} className="p-1.5 bg-orange-50 text-orange-500 rounded-lg hover:bg-orange-100 transition-colors">
                                        <Plus className="w-4 h-4" />
                                    </button>
                                </div>
                                <div className="space-y-3">
                                    {formData.topics.map((topic: string, i: number) => (
                                        <div key={i} className="flex gap-2">
                                            <input
                                                value={topic}
                                                onChange={(e) => handleListChange("topics", i, e.target.value)}
                                                className="flex-1 px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium shadow-sm outline-none focus:ring-2 focus:ring-orange-500 w-full"
                                                placeholder="Novo tópico..."
                                            />
                                            {formData.topics.length > 1 && (
                                                <button type="button" onClick={() => removeListItem("topics", i)} className="p-2 text-slate-400 hover:text-red-500 transition-colors">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Includes */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                                    <div className="flex items-center gap-2">
                                        <CheckCircle className="w-4 h-4 text-emerald-500" />
                                        <h4 className="text-xs font-black uppercase text-slate-800">Inclui</h4>
                                    </div>
                                    <button type="button" onClick={() => addListItem("includes")} className="p-1.5 bg-emerald-50 text-emerald-500 rounded-lg hover:bg-emerald-100 transition-colors">
                                        <Plus className="w-4 h-4" />
                                    </button>
                                </div>
                                <div className="space-y-3">
                                    {formData.includes.map((item: string, i: number) => (
                                        <div key={i} className="flex gap-2">
                                            <input
                                                value={item}
                                                onChange={(e) => handleListChange("includes", i, e.target.value)}
                                                className="flex-1 px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium shadow-sm outline-none focus:ring-2 focus:ring-emerald-500 w-full"
                                                placeholder="Ex: Certificado"
                                            />
                                            {formData.includes.length > 1 && (
                                                <button type="button" onClick={() => removeListItem("includes", i)} className="p-2 text-slate-400 hover:text-red-500 transition-colors">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        <div className="bg-slate-50 rounded-xl border border-slate-200 p-6 space-y-6 shadow-sm">
                            <h3 className="text-xs font-black uppercase text-slate-800 flex items-center gap-2 border-b border-slate-200 pb-3">
                                <Users className="w-4 h-4 text-emerald-500" />
                                Formador
                            </h3>

                            <div className="space-y-4">
                                <div className="flex flex-col gap-2">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Nome do Formador</label>
                                    <input
                                        value={formData.instructor.name}
                                        onChange={(e) => setFormData({
                                            ...formData,
                                            instructor: { ...formData.instructor, name: e.target.value }
                                        })}
                                        className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-emerald-500"
                                        placeholder="Nome Completo"
                                    />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Título Funcional</label>
                                    <input
                                        value={formData.instructor.title}
                                        onChange={(e) => setFormData({
                                            ...formData,
                                            instructor: { ...formData.instructor, title: e.target.value }
                                        })}
                                        className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-emerald-500"
                                        placeholder="Ex: Eng. Agrónomo"
                                    />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Foto do Formador</label>
                                    {/* Instructor Image Upload */}
                                    <ImageUpload
                                        value={formData.instructor.image}
                                        onChange={(url) => setFormData({
                                            ...formData,
                                            instructor: { ...formData.instructor, image: url }
                                        })}
                                        label="Foto"
                                        bucket="public-assets"
                                        folder="professionals"
                                        aspectRatio="square"
                                        recommendedSize="400x400px"
                                        className="aspect-square w-32 h-32 mx-auto"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="pt-8 border-t border-slate-100 flex items-center justify-end gap-3">
                    <Button type="button" variant="outline" onClick={handleCancel} className="px-8 h-10 rounded-lg text-xs font-black text-slate-500 uppercase tracking-widest bg-white hover:bg-slate-50">
                        Cancelar
                    </Button>
                    <Button
                        type="submit"
                        disabled={loading}
                        className="px-10 h-10 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-black uppercase tracking-widest shadow-lg"
                    >
                        {(isNew ? "Adicionar Formação" : "Guardar Alterações")}
                    </Button>
                </div>
            </form>
        </div>
    );
}
