"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Loader2, X, MapPin, TrendingUp, TrendingDown, AlignLeft } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";

interface IndicatorFormProps {
    onClose: () => void;
    onSuccess: () => void;
    initialData?: any;
}

export function IndicatorForm({ onClose, onSuccess, initialData }: IndicatorFormProps) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        location: initialData?.location || "hero",
        title: initialData?.title || "",
        value: initialData?.value || "",
        trend: initialData?.trend || ""
    });

    const locations = ["hero", "sidebar"];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            let error;
            if (initialData?.id) {
                const { error: err } = await supabase
                    .from('dashboard_indicators')
                    .update(formData)
                    .eq('id', initialData.id);
                error = err;
            } else {
                const { error: err } = await supabase
                    .from('dashboard_indicators')
                    .insert([formData]);
                error = err;
            }

            if (error) throw error;
            onSuccess();
            onClose();
        } catch (error: any) {
            alert("Erro ao salvar indicador: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
                <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                    <div>
                        <h2 className="text-xl font-black text-slate-800 tracking-tight">
                            {initialData ? "Editar Indicador" : "Novo Indicador de Destaque"}
                        </h2>
                        <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Dashboards & Métricas</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
                        <X className="w-5 h-5 text-slate-500" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 space-y-6">
                    <div className="flex flex-col gap-2">
                        <label className="text-xs font-black uppercase text-slate-500 tracking-widest">Localização no Site</label>
                        <select
                            value={formData.location}
                            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                            className="p-4 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-emerald-500 outline-none w-full appearance-none"
                        >
                            {locations.map(l => <option key={l} value={l}>{l.toUpperCase()}</option>)}
                        </select>
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-xs font-black uppercase text-slate-500 tracking-widest">Título do Indicador</label>
                        <div className="relative">
                            <AlignLeft className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                required
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                placeholder="Ex: Produção de Milho"
                                className="pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-emerald-500 outline-none w-full"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-black uppercase text-slate-500 tracking-widest">Valor Actual</label>
                            <input
                                required
                                value={formData.value}
                                onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                                placeholder="Ex: 2.3M Ton"
                                className="p-4 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-emerald-500 outline-none w-full"
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-black uppercase text-slate-500 tracking-widest">Tendência (Simbol.)</label>
                            <div className="relative">
                                <TrendingUp className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500" />
                                <input
                                    value={formData.trend}
                                    onChange={(e) => setFormData({ ...formData, trend: e.target.value })}
                                    placeholder="Ex: +12% ↑"
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
                        {(initialData ? "Actualizar" : "Salvar Indicador")}
                    </Button>
                </div>
            </div>
        </div>
    );
}
