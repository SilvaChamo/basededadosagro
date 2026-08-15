"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { ImageUpload } from "./ImageUpload";
import { Loader2, User, Briefcase, Award, MapPin, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { Spinner } from "@/components/ui/spinner";

interface ProfessionalEditorProps {
    initialData?: any;
    isNew?: boolean;
}

export function ProfessionalEditor({ initialData, isNew = false }: ProfessionalEditorProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: initialData?.name || "",
        specialty: initialData?.specialty || "Agrónomo",
        location: initialData?.location || "",
        bio: initialData?.bio || "",
        experience: initialData?.experience || "",
        photo_url: initialData?.photo_url || ""
    });

    const specialties = ["Agrónomo", "Veterinário", "Engenheiro Rural", "Consultor Agrícola", "Gestor de Projectos", "Especialista em Rega"];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            let error;
            if (!isNew && initialData?.id) {
                const { error: err } = await supabase
                    .from('professionals')
                    .update(formData)
                    .eq('id', initialData.id);
                error = err;
            } else {
                const { error: err } = await supabase
                    .from('professionals')
                    .insert([formData]);
                error = err;
            }

            if (error) throw error;
            router.push('/admin/profissionais');
            router.refresh();
        } catch (error: any) {
            alert("Erro ao salvar profissional: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white rounded-agro-lg shadow-[0_0_10px_rgba(0,0,0,0.1)] border border-slate-200 flex flex-col h-full">
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
                            {isNew ? "Registar Profissional" : "Editar Profissional"}
                        </h1>
                        {!isNew && (
                            <div className="flex items-center gap-3">
                                <span className="text-slate-300 font-light flex-shrink-0 text-xl leading-none">|</span>
                                <div className="text-sm font-black uppercase tracking-tight truncate flex items-center gap-1.5 leading-none m-0 p-0">
                                    <span className="text-emerald-600">Editando:</span>
                                    <span className="text-slate-500 font-bold">{initialData?.name}</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-3 ml-4 flex-shrink-0">
                    <div className="bg-white px-3 py-1.5 rounded-full border border-slate-200 shadow-sm flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${formData.specialty ? 'bg-emerald-500' : 'bg-slate-300'}`}></span>
                        <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">{formData.specialty}</span>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="flex-1 p-10 space-y-8 overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="md:col-span-2 space-y-6">
                        <div className="space-y-4">
                            <h3 className="text-xs font-black uppercase text-emerald-600 tracking-widest border-b border-emerald-100 pb-2 mb-4">Dados do Profissional</h3>

                            <div className="relative">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="Nome do Profissional"
                                    className="pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-lg text-lg font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none w-full transition-all shadow-sm"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="relative">
                                    <Award className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <select
                                        value={formData.specialty}
                                        onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                                        className="pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold text-slate-700 focus:ring-2 focus:ring-emerald-500 outline-none w-full appearance-none shadow-sm"
                                    >
                                        {specialties.map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </div>
                                <div className="relative">
                                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input
                                        value={formData.location}
                                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                        placeholder="Cidade, Província"
                                        className="pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold text-slate-700 focus:ring-2 focus:ring-emerald-500 outline-none w-full transition-all shadow-sm"
                                    />
                                </div>
                            </div>

                            <div className="relative">
                                <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    value={formData.experience}
                                    onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                                    placeholder="Ex: 5 anos de experiência em Manica"
                                    className="pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold text-slate-700 focus:ring-2 focus:ring-emerald-500 outline-none w-full transition-all shadow-sm"
                                />
                            </div>

                            <div className="relative">
                                <textarea
                                    value={formData.bio}
                                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                    placeholder="Breve descrição do percurso profissional..."
                                    className="p-4 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-emerald-500 outline-none resize-none h-32 w-full transition-all shadow-sm"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        <div className="bg-slate-50 rounded-xl border border-slate-200 p-6 space-y-6 shadow-sm">
                            <h3 className="text-xs font-black uppercase text-slate-800 flex items-center gap-2 border-b border-slate-200 pb-3">
                                <User className="w-4 h-4 text-emerald-500" />
                                Fotografia
                            </h3>
                            <div className="space-y-4">
                                <ImageUpload
                                    value={formData.photo_url}
                                    onChange={(url) => setFormData({ ...formData, photo_url: url })}
                                    label="Foto de Perfil"
                                    bucket="public-assets"
                                    folder="professionals"
                                    aspectRatio="square"
                                    recommendedSize="500x500px"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="pt-8 border-t border-slate-100 flex items-center justify-end gap-3">
                    <Button type="button" variant="outline" onClick={() => router.back()} className="px-8 h-10 rounded-lg text-xs font-black text-slate-500 uppercase tracking-widest bg-white hover:bg-slate-50">
                        Cancelar
                    </Button>
                    <Button
                        type="submit"
                        disabled={loading}
                        className="px-10 h-10 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-black uppercase tracking-widest shadow-lg"
                    >
                        {(isNew ? "Adicionar Profissional" : "Guardar Alterações")}
                    </Button>
                </div>
            </form>
        </div>
    );
}
