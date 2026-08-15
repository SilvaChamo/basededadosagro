"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Loader2, X, ShoppingBag, MapPin } from "lucide-react";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";

interface MarketProductFormProps {
    onClose: () => void;
    onSuccess: () => void;
    initialData?: any;
}

export function MarketProductForm({ onClose, onSuccess, initialData }: MarketProductFormProps) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        product: initialData?.product || "",
        category: initialData?.category || "Grãos",
        unit: initialData?.unit || "Kg",
        price: initialData?.price || "",
        location: initialData?.location || "Maputo",
    });

    const categories = ["Grãos", "Legumes", "Frutas", "Animais", "Óleos", "Tubérculos"];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            let error;
            let variation = 0;
            const newPrice = parseFloat(formData.price);
            const oldPrice = initialData?.price ? parseFloat(initialData.price) : null;

            if (oldPrice && oldPrice > 0) {
                variation = Math.round(((newPrice - oldPrice) / oldPrice) * 100);
            }

            if (initialData?.id) {
                // Ao actualizar, guardamos o preço anterior para histórico no próprio registo
                const { error: err } = await supabase
                    .from('market_prices')
                    .update({
                        ...formData,
                        prev_price: initialData.price,
                        updated_at: new Date().toISOString()
                    })
                    .eq('id', initialData.id);
                error = err;
            } else {
                const { error: err } = await supabase
                    .from('market_prices')
                    .insert([formData]);
                error = err;
            }

            if (error) throw error;

            // Trigger SMS notification for price updates/new products in this location
            fetch('/api/sms/notify-new-product', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    product: formData.product,
                    price: formData.price,
                    location: formData.location,
                    type: 'market',
                    variation: initialData?.id ? variation : null
                })
            }).catch(err => console.error("Error triggering SMS:", err));

            toast.success(initialData?.id ? "Cotação actualizada!" : "Cotação adicionada!");
            onSuccess();
            onClose();
        } catch (error: any) {
            toast.error("Erro ao salvar cotação: " + error.message);
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
                            {initialData ? "Editar Cotação" : "Nova Cotação de Mercado"}
                        </h2>
                        <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">SIMA / Mercado</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
                        <X className="w-5 h-5 text-slate-500" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 space-y-6">
                    <div className="flex flex-col gap-2">
                        <label className="text-xs font-black uppercase text-slate-500 tracking-widest">Produto</label>
                        <div className="relative">
                            <ShoppingBag className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                required
                                value={formData.product}
                                onChange={(e) => setFormData({ ...formData, product: e.target.value })}
                                placeholder="Ex: Milho Branco"
                                className="pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-emerald-500 outline-none w-full"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-black uppercase text-slate-500 tracking-widest">Categoria</label>
                            <select
                                value={formData.category}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                className="p-4 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-emerald-500 outline-none w-full"
                            >
                                {categories.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-black uppercase text-slate-500 tracking-widest">Preço (MT)</label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-black text-slate-400">MT</span>
                                <input
                                    type="number"
                                    required
                                    value={formData.price}
                                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                    placeholder="0.00"
                                    className="pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-emerald-500 outline-none w-full"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-black uppercase text-slate-500 tracking-widest">Unidade</label>
                            <input
                                value={formData.unit}
                                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                                placeholder="Ex: Kg, Saco 25kg"
                                className="p-4 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-emerald-500 outline-none w-full"
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-black uppercase text-slate-500 tracking-widest">Mercado / Local</label>
                            <div className="relative">
                                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    value={formData.location}
                                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                    placeholder="Ex: Mercado Zimpeto"
                                    className="pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-emerald-500 outline-none w-full"
                                />
                            </div>
                        </div>
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
                        {(initialData ? "Guardar" : "Adicionar")}
                    </Button>
                </div>
            </div>
        </div>
    );
}
