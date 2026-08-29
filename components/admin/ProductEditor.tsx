"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { ImageUpload } from "./ImageUpload";
import { Loader2, ShoppingBag, Tag, DollarSign, Image as ImageIcon, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { Spinner } from "@/components/ui/spinner";
import { useAdminTopBar } from "@/components/admin/AdminTopBar";

interface ProductEditorProps {
    initialData?: any;
    isNew?: boolean;
}

export function ProductEditor({ initialData, isNew = false }: ProductEditorProps) {
    const router = useRouter();
    useAdminTopBar("");
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: initialData?.name || initialData?.nome || "",
        category: initialData?.category || "Sementes",
        price: initialData?.price || initialData?.preco || "",
        description: initialData?.description || "",
        image_url: initialData?.image_url || "",
        company_id: initialData?.company_id || initialData?.empresa_id || ""
    });

    const categories = ["Sementes", "Fertilizantes", "Ferramentas", "Maquinaria", "Pesticidas", "Sistemas de Rega"];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const payload = {
                ...formData,
                price: parseFloat(formData.price.toString()) || 0
            };

            let error;
            if (!isNew && initialData?.id) {
                const { error: err } = await supabase
                    .from('products')
                    .update(payload)
                    .eq('id', initialData.id);
                error = err;
            } else {
                const { error: err } = await supabase
                    .from('products')
                    .insert([payload]);
                error = err;
            }

            if (error) throw error;
            router.push('/admin/produtos');
            router.refresh();
        } catch (error: any) {
            alert("Erro ao salvar produto: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white rounded-agro-lg shadow-[0_0_10px_rgba(0,0,0,0.1)] border border-slate-200 flex flex-col h-full">
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
                            {isNew ? "Adicionar Produto" : "Editar Produto"}
                        </h1>
                        {!isNew && (
                            <div className="flex items-center gap-3">
                                <span className="text-slate-300 font-light flex-shrink-0 text-xl leading-none">|</span>
                                <div className="text-sm font-black uppercase tracking-tight truncate flex items-center gap-1.5 leading-none m-0 p-0">
                                    <span className="text-emerald-600">Editando:</span>
                                    <span className="text-slate-500 font-bold">{initialData?.name || initialData?.nome}</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-3 ml-4 flex-shrink-0">
                    <div className="bg-white px-3 py-1.5 rounded-full border border-slate-200 shadow-sm flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                        <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">{formData.category}</span>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="flex-1 p-10 space-y-8 overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="md:col-span-2 space-y-6">
                        <div className="space-y-4">
                            <h3 className="text-xs font-black uppercase text-emerald-600 tracking-widest border-b border-emerald-100 pb-2 mb-4">Informação do Produto</h3>
                            <div className="relative">
                                <ShoppingBag className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="Nome do Produto (Ex: Semente de Milho PAN 53)"
                                    className="pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-lg text-lg font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none w-full transition-all shadow-sm"
                                />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="flex flex-col gap-2">
                                    <div className="relative">
                                        <Tag className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        <select
                                            value={formData.category}
                                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                            className="pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold text-slate-700 focus:ring-2 focus:ring-emerald-500 outline-none w-full appearance-none shadow-sm"
                                        >
                                            {categories.map(c => <option key={c} value={c}>{c}</option>)}
                                        </select>
                                    </div>
                                </div>
                                <div className="flex flex-col gap-2">
                                    <div className="relative">
                                        <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        <input
                                            type="number"
                                            value={formData.price}
                                            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                            placeholder="Preço Estimado (MT)"
                                            className="pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold text-slate-700 focus:ring-2 focus:ring-emerald-500 outline-none w-full transition-all shadow-sm"
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="relative">
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Especificações técnicas, benefícios e modo de uso..."
                                    className="p-4 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-emerald-500 outline-none resize-none h-32 w-full transition-all shadow-sm"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        <div className="bg-slate-50 rounded-xl border border-slate-200 p-6 space-y-6 shadow-sm">
                            <h3 className="text-xs font-black uppercase text-slate-800 flex items-center gap-2 border-b border-slate-200 pb-3">
                                <ImageIcon className="w-4 h-4 text-emerald-500" />
                                Imagem do Produto
                            </h3>
                            <div className="space-y-4">
                                <ImageUpload
                                    value={formData.image_url}
                                    onChange={(url) => setFormData({ ...formData, image_url: url })}
                                    label="Foto do Produto"
                                    bucket="public-assets"
                                    folder="products"
                                    aspectRatio="square"
                                    recommendedSize="800x800px"
                                />
                            </div>
                        </div>

                        <div className="bg-slate-50 rounded-xl border border-slate-200 p-6 space-y-6 shadow-sm">
                            <h3 className="text-xs font-black uppercase text-slate-800 flex items-center gap-2 border-b border-slate-200 pb-3">
                                <Tag className="w-4 h-4 text-emerald-500" />
                                Associação
                            </h3>
                            <div className="space-y-4">
                                <div className="relative">
                                    <input
                                        value={formData.company_id}
                                        onChange={(e) => setFormData({ ...formData, company_id: e.target.value })}
                                        placeholder="ID da Empresa (UUID)"
                                        className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg text-xs font-mono text-slate-600 focus:ring-2 focus:ring-emerald-500 outline-none shadow-sm"
                                    />
                                    <p className="text-[10px] text-slate-400 mt-1">Copie o ID da empresa na lista de empresas.</p>
                                </div>
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
                        {<ShoppingBag className="w-4 h-4 mr-2" />}
                        {isNew ? "Adicionar Produto" : "Guardar Alterações"}
                    </Button>
                </div>
            </form>
        </div>
    );
}
