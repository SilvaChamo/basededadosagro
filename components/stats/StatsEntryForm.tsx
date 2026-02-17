"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";

export function StatsEntryForm() {
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);

    const [honeypot, setHoneypot] = useState("");
    const [formLoadTime] = useState(Date.now());

    const [formData, setFormData] = useState({
        category: "producao",
        province: "Todas",
        year: "2025",
        label: "",
        value: "",
        variation: ""
    });

    const provinces = ["Todas", "Maputo", "Gaza", "Inhambane", "Sofala", "Manica", "Tete", "Zambézia", "Nampula", "Cabo Delgado", "Niassa"];
    const categories = [
        { id: "producao", label: "Produção Agrícola" },
        { id: "economia", label: "Economia (PIB)" },
        { id: "empresas", label: "Empresas" },
        { id: "mercado", label: "Mercado e Preços" },
        { id: "emprego", label: "Emprego e Força Laboral" }
    ];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Anti-spam checks
        if (honeypot) {
            console.warn("Spam detected: honeypot filled");
            return;
        }

        const timeTaken = Date.now() - formLoadTime;
        if (timeTaken < 5000) {
            console.warn("Spam detected: submitted too quickly", timeTaken);
            setStatus({ type: 'error', message: 'Por favor, aguarde o tempo necessário para processar os dados.' });
            return;
        }

        setLoading(true);
        setStatus(null);

        try {
            const { error } = await supabase
                .from('agricultural_stats')
                .insert([
                    {
                        category: formData.category,
                        province: formData.province,
                        year: formData.year,
                        label: formData.label,
                        value: parseFloat(formData.value),
                        variation: formData.variation ? parseFloat(formData.variation) : null
                    }
                ]);

            if (error) throw error;

            setStatus({ type: 'success', message: 'Dados inseridos com sucesso!' });
            setFormData({ ...formData, label: "", value: "", variation: "" }); // Reset text fields
        } catch (error: any) {
            console.error("Error inserting data:", error);
            setStatus({ type: 'error', message: 'Erro ao inserir dados: ' + error.message });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <div className="w-2 h-8 bg-[#f97316] rounded-full" />
                Cadastro Manual de Estatísticas
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Honeypot field - hidden from users, visible to bots */}
                <div className="absolute -left-[9999px] opacity-0 pointer-events-none" aria-hidden="true">
                    <label htmlFor="website_url">Website</label>
                    <input
                        type="text"
                        id="website_url"
                        name="website_url"
                        tabIndex={-1}
                        autoComplete="off"
                        value={honeypot}
                        onChange={(e) => setHoneypot(e.target.value)}
                    />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Categoria */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-semibold text-gray-700">Categoria</label>
                        <select
                            required
                            value={formData.category}
                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                            className="p-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#22c55e] bg-white text-gray-900 outline-none"
                        >
                            {categories.map(cat => (
                                <option key={cat.id} value={cat.id}>{cat.label}</option>
                            ))}
                        </select>
                    </div>

                    {/* Província */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-semibold text-gray-700">Província</label>
                        <select
                            required
                            value={formData.province}
                            onChange={(e) => setFormData({ ...formData, province: e.target.value })}
                            className="p-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#22c55e] bg-white text-gray-900 outline-none"
                        >
                            {provinces.map(p => (
                                <option key={p} value={p}>{p}</option>
                            ))}
                        </select>
                    </div>

                    {/* Ano */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-semibold text-gray-700">Ano de Referência</label>
                        <input
                            type="text"
                            required
                            value={formData.year}
                            onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                            placeholder="Ex: 2025"
                            className="p-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#22c55e] bg-white text-gray-900 outline-none"
                        />
                    </div>

                    {/* Etiqueta / Produto */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-semibold text-gray-700">Etiq/Prod/Mês</label>
                        <input
                            type="text"
                            required
                            value={formData.label}
                            onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                            placeholder="Ex: Milho, Jan, Setor A"
                            className="p-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#22c55e] bg-white text-gray-900 outline-none"
                        />
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-semibold text-gray-700">Valor Numérico</label>
                        <input
                            type="number"
                            step="any"
                            required
                            value={formData.value}
                            onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                            placeholder="Ex: 4500"
                            className="p-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#22c55e] bg-white text-gray-900 outline-none"
                        />
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-semibold text-gray-700">Variação (%)</label>
                        <input
                            type="number"
                            step="0.1"
                            value={formData.variation}
                            onChange={(e) => setFormData({ ...formData, variation: e.target.value })}
                            placeholder="Ex: 5.2 ou -1.5"
                            className="p-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#22c55e] bg-white text-gray-900 outline-none"
                        />
                    </div>
                </div>

                {status && (
                    <div className={`p-4 rounded-xl flex items-center gap-3 text-sm ${status.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'
                        }`}>
                        {status.type === 'success' ? <CheckCircle2 className="w-5 h-5 flex-shrink-0" /> : <AlertCircle className="w-5 h-5 flex-shrink-0" />}
                        {status.message}
                    </div>
                )}

                <Button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-[#22c55e] hover:bg-[#16a34a] text-white font-bold py-6 rounded-xl transition-all shadow-md shadow-green-200"
                >
                    {loading ? (
                        <>
                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                            A Gravar...
                        </>
                    ) : (
                        "Registar Dados Estatísticos"
                    )}
                </Button>
            </form>
        </div>
    );
}
