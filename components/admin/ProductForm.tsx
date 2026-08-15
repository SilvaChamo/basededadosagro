"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { Loader2, X, ShoppingBag, Tag, DollarSign, Image as ImageIcon } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";

interface ProductFormProps {
    onClose: () => void;
    onSuccess: () => void;
    initialData?: any;
}

export function ProductForm({ onClose, onSuccess, initialData }: ProductFormProps) {
    const supabase = createClient();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        nome: initialData?.nome || "",
        category: initialData?.category || "Sementes",
        preco: initialData?.preco || "",
        description: initialData?.description || "",
        image_url: initialData?.image_url || "",
        empresa_id: initialData?.empresa_id || ""
    });

    const categories = [
        "Sementes", "Mudas", "Matrizes e reprodutores", "Material genético", "Microrganismos", "Inoculantes",
        "Fertilizantes minerais", "Corretivos de solo", "Herbicidas", "Inseticidas", "Fungicidas",
        "Esterco", "Compostagem", "Biofertilizantes", "Adubação verde", "Húmus",
        "Rações", "Suplementos minerais", "Vacinas", "Medicamentos veterinários", "Sal mineral",
        "Tratores", "Arados", "Grades", "Colheitadeiras", "Semeadoras",
        "Sistemas de irrigação", "Sensores agrícolas", "Drones", "GPS agrícola", "Softwares de gestão",
        "Cercas", "Postes", "Galpões", "Estufas", "Currais",
        "Crédito agrícola", "Seguro rural", "Investimentos", "Subsídios", "Linhas de financiamento"
    ];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const payload = {
                ...formData,
                preco: parseFloat(formData.preco.toString()) || 0
            };

            let error;
            if (initialData?.id) {
                const { error: err } = await supabase
                    .from('produtos')
                    .update(payload)
                    .eq('id', initialData.id);
                error = err;
            } else {
                const { error: err } = await supabase
                    .from('produtos')
                    .insert([payload]);
                error = err;
            }

            if (error) throw error;
            onSuccess();
            onClose();
        } catch (error: any) {
            alert("Erro ao salvar produto: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
                <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                    <div>
                        <h2 className="text-xl font-black text-slate-800 tracking-tight">
                            {initialData ? "Editar Produto" : "Novo Produto / Insumo"}
                        </h2>
                        <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Marketplace & Insumos</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
                        <X className="w-5 h-5 text-slate-500" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 space-y-6">
                    <div className="flex flex-col gap-2">
                        <label className="text-xs font-black uppercase text-slate-500 tracking-widest">Nome do Produto</label>
                        <div className="relative">
                            <ShoppingBag className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                required
                                value={formData.nome}
                                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                                placeholder="Ex: Semente de Milho PAN 53"
                                className="pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-emerald-500 outline-none w-full"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-black uppercase text-slate-500 tracking-widest">Categoria</label>
                            <div className="relative">
                                <Tag className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <select
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    className="pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-emerald-500 outline-none w-full appearance-none"
                                >
                                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-black uppercase text-slate-500 tracking-widest">Preço Estimado (MT)</label>
                            <div className="relative">
                                <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    type="number"
                                    value={formData.preco}
                                    onChange={(e) => setFormData({ ...formData, preco: e.target.value })}
                                    placeholder="0.00"
                                    className="pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-emerald-500 outline-none w-full"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-xs font-black uppercase text-slate-500 tracking-widest">URL da Imagem</label>
                        <div className="relative">
                            <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                value={formData.image_url}
                                onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                                placeholder="https://..."
                                className="pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-emerald-500 outline-none w-full"
                            />
                        </div>
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-xs font-black uppercase text-slate-500 tracking-widest">Descrição</label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Especificações técnicas, benefícios e modo de uso..."
                            className="p-4 bg-slate-50 border-none rounded-2xl text-sm font-medium focus:ring-2 focus:ring-emerald-500 outline-none resize-none h-32"
                        />
                    </div>
                </form>

                <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex items-center justify-end gap-3">
                    <Button variant="outline" onClick={onClose} className="px-8 h-12 rounded-xl text-xs font-black text-slate-500 uppercase tracking-widest">
                        Cancelar
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="px-10 h-12 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg"
                    >
                        {(initialData ? "Guardar Alterações" : "Adicionar Produto")}
                    </Button>
                </div>
            </div>
        </div>
    );
}
