"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";
import { Loader2, Save, Store, MapPin, Phone, Mail, Globe, CloudUpload, Image as ImageIcon, Contact } from "lucide-react";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { Spinner } from "@/components/ui/spinner";

interface StoreData {
    id?: string;
    name: string;
    category: string;
    location: string;
    status: 'Aberto' | 'Fechado' | 'Em Manutenção';
    image_url: string;
    description: string;
    contact: string;
    email: string;
    website: string;
}

interface StoreFormProps {
    initialData?: StoreData;
}

export function StoreForm({ initialData }: StoreFormProps) {
    const router = useRouter();
    const supabase = createClient();
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState<StoreData>(initialData || {
        name: "",
        category: "",
        location: "",
        status: "Aberto",
        image_url: "",
        description: "",
        contact: "",
        email: "",
        website: ""
    });

    const categories = [
        "Insumos Gerais",
        "Sementes",
        "Fertilizantes",
        "Maquinaria",
        "Peças e Manutenção",
        "Serviços Veterinários",
        "Restauração",
        "Diversos"
    ];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);


        try {
            // Transform form data for companies table
            const { status, ...rest } = formData;
            const payload = {
                ...rest,
                is_active: status === 'Aberto',
                type: 'Loja', // Ensure type is set
                // Map description to description (exists)
                // Map contact to contact (exists)
            };

            if (initialData?.id) {
                const { error } = await supabase
                    .from('companies')  // using companies
                    .update(payload)
                    .eq('id', initialData.id);

                if (error) throw error;
                toast.success("Loja atualizada com sucesso!");
            } else {
                const { error } = await supabase
                    .from('companies')  // using companies
                    .insert([payload]);

                if (error) throw error;
                toast.success("Loja criada com sucesso!");
            }
            router.push('/admin/lojas');
            router.refresh();
        } catch (error) {
            console.error('Error saving store:', error);
            toast.error("Erro ao salvar loja.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-5 w-full">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                {/* Left Column: Main Info */}
                <div className="lg:col-span-2 space-y-5">
                    <div className="bg-white p-5 rounded-[8px] shadow-sm border border-slate-200">
                        <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                            <Store className="w-5 h-5 text-orange-500" />
                            Informações Básicas
                        </h2>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Nome da Loja</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-4 py-2 rounded-[8px] border border-slate-300 bg-white text-slate-900 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all"
                                    placeholder="Ex: Agro-Peças Central"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Categoria</label>
                                    <select
                                        required
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                        className="w-full px-4 py-2 rounded-[8px] border border-slate-300 bg-white text-slate-900 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all"
                                    >
                                        <option value="">Selecione...</option>
                                        {categories.map(cat => (
                                            <option key={cat} value={cat}>{cat}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                                    <select
                                        required
                                        value={formData.status}
                                        onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                                        className="w-full px-4 py-2 rounded-[8px] border border-slate-300 bg-white text-slate-900 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all"
                                    >
                                        <option value="Aberto">Aberto</option>
                                        <option value="Fechado">Fechado</option>
                                        <option value="Em Manutenção">Em Manutenção</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Descrição</label>
                                <textarea
                                    rows={4}
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full px-4 py-2 rounded-[8px] border border-slate-300 bg-white text-slate-900 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all resize-none"
                                    placeholder="Descreva os produtos e serviços oferecidos..."
                                />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-5 rounded-[8px] shadow-sm border border-slate-200">
                        <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                            <Contact className="w-5 h-5 text-orange-500" />
                            Contato e Localização
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-slate-700 mb-1">Localização</label>
                                <div className="relative">
                                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input
                                        type="text"
                                        required
                                        value={formData.location}
                                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                        className="w-full pl-10 pr-4 py-2 rounded-[8px] border border-slate-300 bg-white text-slate-900 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all"
                                        placeholder="Cidade, Província"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Telefone</label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input
                                        type="tel"
                                        value={formData.contact}
                                        onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                                        className="w-full pl-10 pr-4 py-2 rounded-[8px] border border-slate-300 bg-white text-slate-900 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all"
                                        placeholder="+258 84 123 4567"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="w-full pl-10 pr-4 py-2 rounded-[8px] border border-slate-300 bg-white text-slate-900 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all"
                                        placeholder="contato@loja.com"
                                    />
                                </div>
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-slate-700 mb-1">Website (Opcional)</label>
                                <div className="relative">
                                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input
                                        type="url"
                                        value={formData.website}
                                        onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                                        className="w-full pl-10 pr-4 py-2 rounded-[8px] border border-slate-300 bg-white text-slate-900 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all"
                                        placeholder="https://..."
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Image & Actions */}
                <div className="space-y-5">
                    <div className="bg-white p-5 rounded-[8px] shadow-sm border border-slate-200">
                        <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                            <ImageIcon className="w-5 h-5 text-orange-500" />
                            Imagem de Capa
                        </h2>

                        <ImageUpload
                            value={formData.image_url}
                            onChange={(url) => setFormData({ ...formData, image_url: url })}
                            label="Imagem de Capa"
                            maxSizeMB={1}
                            bucket="public-assets"
                            folder="lojas"
                            description="Recomendado: Imagens em alta resolução que representem a loja ou produtos. (Máx 1MB)"
                        />
                    </div>

                    <div className="flex gap-4">
                        <button
                            type="button"
                            onClick={() => router.back()}
                            className="flex-1 py-3 px-4 bg-slate-100 hover:bg-orange-50 hover:text-orange-600 font-bold rounded-[8px] transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="flex-[2] py-3 px-4 bg-emerald-500 hover:bg-orange-600 text-white font-bold rounded-[8px] transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {(
                                <Save className="w-5 h-5" />
                            )}
                            Salvar Loja
                        </button>
                    </div>
                </div>
            </div>
        </form>
    );
}
