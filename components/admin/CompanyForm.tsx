"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Loader2, X, Globe, Phone, Mail, MapPin, Building2, FileText, Target, Eye, Heart, List } from "lucide-react";
import { MOZ_DATA, SECTORS, SECTOR_CATEGORIES, VALUE_CHAINS, COMPANY_DESIGNATIONS, COMPANY_SIZES } from "@/lib/agro-data";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";

interface CompanyFormProps {
    onClose: () => void;
    onSuccess: () => void;
    initialData?: any;
}

export function CompanyForm({ onClose, onSuccess, initialData }: CompanyFormProps) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: initialData?.name || "",
        nuit: initialData?.nuit || "",
        email: initialData?.email || "",
        contact: initialData?.contact || initialData?.phone || "", // Fallback for phone
        website: initialData?.website || "",
        address: initialData?.address || "",
        province: initialData?.province || "",
        district: initialData?.district || "",
        category: initialData?.category || initialData?.sector || "", // Fallback for sector
        value_chain: initialData?.value_chain || "",
        type: initialData?.type || "",
        logo_url: initialData?.logo_url || "",
        portfolio_url: initialData?.portfolio_url || "",
        banner_url: initialData?.banner_url || "",
        description: initialData?.description || "",
        mission: initialData?.mission || "",
        vision: initialData?.vision || "",
        values: initialData?.values || "",
        sub_category: initialData?.sub_category || "",
        size: initialData?.size || "",
        services: Array.isArray(initialData?.services) ? initialData.services : [] as string[]
    });

    // Handle province change to reset district
    useEffect(() => {
        if (formData.province && !MOZ_DATA[formData.province]?.includes(formData.district)) {
            setFormData(prev => ({ ...prev, district: "" }));
        }
    }, [formData.province]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Prepare data for submission - map friendly names to DB columns if needed
            // Currently assuming DB columns match state keys based on User Dashboard
            const submissionData = {
                ...formData,
                // Ensure sector/category consistency if needed. User dashboard uses 'category'.
                // If 'sector' is deprecated in favor of 'category', we just send 'category'.
                // If the DB has both, we might need to verify. Assuming 'category' is the main one now.
            };

            let error;
            if (initialData?.id) {
                const { error: err } = await supabase
                    .from('companies')
                    .update(submissionData)
                    .eq('id', initialData.id);
                error = err;
            } else {
                const { error: err } = await supabase
                    .from('companies')
                    .insert([submissionData]);
                error = err;
            }

            if (error) throw error;
            toast.success(initialData?.id ? "Empresa actualizada!" : "Empresa adicionada!");
            onSuccess();
            onClose();
        } catch (error: any) {
            toast.error("Erro ao salvar empresa: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    const addService = () => {
        setFormData(prev => ({ ...prev, services: [...prev.services, ""] }));
    };

    const updateService = (index: number, value: string) => {
        const newServices = [...formData.services];
        newServices[index] = value;
        setFormData(prev => ({ ...prev, services: newServices }));
    };

    const removeService = (index: number) => {
        const newServices = formData.services.filter((_: any, i: number) => i !== index);
        setFormData(prev => ({ ...prev, services: newServices }));
    };

    const handlePortfolioUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.type !== "application/pdf") {
            toast.error("Por favor, suba um ficheiro PDF.");
            return;
        }

        if (file.size > 1024 * 1024) {
            toast.error("O ficheiro deve ter menos de 1MB.");
            return;
        }

        setLoading(true);
        try {
            const fileName = `portfolio_${Math.random().toString(36).substring(2)}_${Date.now()}.pdf`;
            const filePath = `portfolios/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('Baseagrodata files')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('Baseagrodata files')
                .getPublicUrl(filePath);

            setFormData(prev => ({ ...prev, portfolio_url: publicUrl }));
            toast.success("Portfólio carregado!");
        } catch (error: any) {
            console.error(error);
            toast.error("Erro no upload: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
                <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                    <div>
                        <h2 className="text-xl font-black text-slate-800 tracking-tight">
                            {initialData ? "Editar Empresa" : "Registar Empresa"}
                        </h2>
                        <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Directório Profissional</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
                        <X className="w-5 h-5 text-slate-500" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 space-y-8">

                    {/* Basic Info Section */}
                    <div className="space-y-4">
                        <h3 className="text-xs font-black uppercase text-emerald-600 tracking-widest border-b border-emerald-100 pb-2 mb-4">Informação Básica</h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex flex-col gap-2">
                                <label className="text-xs font-black uppercase text-slate-500 tracking-widest">Nome da Empresa</label>
                                <div className="relative">
                                    <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input
                                        required
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="Ex: AgroMoz Lda"
                                        className="pl-12 pr-4 py-3 bg-slate-50 border-none rounded-xl text-sm font-bold focus:ring-2 focus:ring-emerald-500 outline-none w-full"
                                    />
                                </div>
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-xs font-black uppercase text-slate-500 tracking-widest">NUIT</label>
                                <div className="relative">
                                    <FileText className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input
                                        value={formData.nuit}
                                        onChange={(e) => setFormData({ ...formData, nuit: e.target.value })}
                                        placeholder="Número Unificado de Imposto"
                                        className="pl-12 pr-4 py-3 bg-slate-50 border-none rounded-xl text-sm font-bold focus:ring-2 focus:ring-emerald-500 outline-none w-full"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex flex-col gap-2">
                                <label className="text-xs font-black uppercase text-slate-500 tracking-widest">Designação (Tipo)</label>
                                <select
                                    value={formData.type}
                                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                    className="p-3 bg-slate-50 border-none rounded-xl text-sm font-bold focus:ring-2 focus:ring-emerald-500 outline-none w-full"
                                >
                                    <option value="">Selecione...</option>
                                    {COMPANY_DESIGNATIONS.map(d => <option key={d} value={d}>{d}</option>)}
                                </select>
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-xs font-black uppercase text-slate-500 tracking-widest">Cadeia de Valor</label>
                                <select
                                    value={formData.value_chain}
                                    onChange={(e) => setFormData({ ...formData, value_chain: e.target.value })}
                                    className="p-3 bg-slate-50 border-none rounded-xl text-sm font-bold focus:ring-2 focus:ring-emerald-500 outline-none w-full"
                                >
                                    <option value="">Selecione...</option>
                                    {VALUE_CHAINS.map(vc => <option key={vc} value={vc}>{vc}</option>)}
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex flex-col gap-2">
                                <label className="text-xs font-black uppercase text-slate-500 tracking-widest text-emerald-600">Sector de Actividade</label>
                                <select
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value, sub_category: "" })}
                                    className="p-3 bg-slate-50 border-none rounded-xl text-sm font-bold focus:ring-2 focus:ring-emerald-500 outline-none w-full"
                                >
                                    <option value="">Selecione o Sector...</option>
                                    {SECTORS.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className="text-xs font-black uppercase text-slate-500 tracking-widest text-[#f97316]">Dimensão da Empresa</label>
                                <select
                                    value={formData.size}
                                    onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                                    className="p-3 bg-slate-50 border-none rounded-xl text-sm font-bold focus:ring-2 focus:ring-[#f97316] outline-none w-full"
                                >
                                    <option value="">Selecione a Dimensão...</option>
                                    {COMPANY_SIZES.map(sz => <option key={sz} value={sz}>{sz}</option>)}
                                </select>
                            </div>
                        </div>

                        {formData.category && SECTOR_CATEGORIES[formData.category] && (
                            <div className="flex flex-col gap-2 animate-in fade-in slide-in-from-top-2">
                                <label className="text-[10px] font-black uppercase text-emerald-600 tracking-widest">Categoria Específica ({formData.category})</label>
                                <div className="relative">
                                    <select
                                        value={formData.sub_category}
                                        onChange={(e) => setFormData({ ...formData, sub_category: e.target.value })}
                                        className="p-3 bg-emerald-50 border-2 border-emerald-100/50 rounded-xl text-sm font-bold focus:ring-2 focus:ring-emerald-500 outline-none w-full"
                                    >
                                        <option value="">Escolha uma categoria...</option>
                                        {SECTOR_CATEGORIES[formData.category].map(cat => (
                                            <option key={cat} value={cat}>{cat}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Contact & Location */}
                    <div className="space-y-4">
                        <h3 className="text-xs font-black uppercase text-emerald-600 tracking-widest border-b border-emerald-100 pb-2 mb-4">Contactos e Localização</h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex flex-col gap-2">
                                <label className="text-xs font-black uppercase text-slate-500 tracking-widest">Telefone</label>
                                <div className="relative">
                                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input
                                        value={formData.contact}
                                        onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                                        placeholder="+258 ..."
                                        className="pl-12 pr-4 py-3 bg-slate-50 border-none rounded-xl text-sm font-bold focus:ring-2 focus:ring-emerald-500 outline-none w-full"
                                    />
                                </div>
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-xs font-black uppercase text-slate-500 tracking-widest">Email</label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        placeholder="email@empresa.com"
                                        className="pl-12 pr-4 py-3 bg-slate-50 border-none rounded-xl text-sm font-bold focus:ring-2 focus:ring-emerald-500 outline-none w-full"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex flex-col gap-2">
                                <label className="text-xs font-black uppercase text-slate-500 tracking-widest">Província</label>
                                <select
                                    value={formData.province}
                                    onChange={(e) => setFormData({ ...formData, province: e.target.value })}
                                    className="p-3 bg-slate-50 border-none rounded-xl text-sm font-bold focus:ring-2 focus:ring-emerald-500 outline-none w-full"
                                >
                                    <option value="">Selecione...</option>
                                    {Object.keys(MOZ_DATA).map(p => <option key={p} value={p}>{p}</option>)}
                                </select>
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-xs font-black uppercase text-slate-500 tracking-widest">Distrito</label>
                                <select
                                    value={formData.district}
                                    onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                                    disabled={!formData.province}
                                    className="p-3 bg-slate-50 border-none rounded-xl text-sm font-bold focus:ring-2 focus:ring-emerald-500 outline-none w-full disabled:opacity-50"
                                >
                                    <option value="">Selecione...</option>
                                    {formData.province && MOZ_DATA[formData.province]?.map(d => <option key={d} value={d}>{d}</option>)}
                                </select>
                            </div>
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-black uppercase text-slate-500 tracking-widest">Endereço Físico</label>
                            <div className="relative">
                                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    value={formData.address}
                                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                    placeholder="Av., Rua, Nº..."
                                    className="pl-12 pr-4 py-3 bg-slate-50 border-none rounded-xl text-sm font-bold focus:ring-2 focus:ring-emerald-500 outline-none w-full"
                                />
                            </div>
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-black uppercase text-slate-500 tracking-widest">Website</label>
                            <div className="relative">
                                <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    value={formData.website}
                                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                                    placeholder="www.empresa.co.mz"
                                    className="pl-12 pr-4 py-3 bg-slate-50 border-none rounded-xl text-sm font-bold focus:ring-2 focus:ring-emerald-500 outline-none w-full"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Branding & Media */}
                    <div className="space-y-4">
                        <h3 className="text-xs font-black uppercase text-emerald-600 tracking-widest border-b border-emerald-100 pb-2 mb-4">Mídia e Branding</h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex flex-col gap-2">
                                <label className="text-xs font-black uppercase text-slate-500 tracking-widest">URL do Logo</label>
                                <input
                                    value={formData.logo_url}
                                    onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
                                    placeholder="https://..."
                                    className="p-3 bg-slate-50 border-none rounded-xl text-sm font-bold focus:ring-2 focus:ring-emerald-500 outline-none w-full"
                                />
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-xs font-black uppercase text-slate-500 tracking-widest">URL do Banner</label>
                                <input
                                    value={formData.banner_url}
                                    onChange={(e) => setFormData({ ...formData, banner_url: e.target.value })}
                                    placeholder="https://..."
                                    className="p-3 bg-slate-50 border-none rounded-xl text-sm font-bold focus:ring-2 focus:ring-emerald-500 outline-none w-full"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Corporate Profile */}
                    <div className="space-y-4">
                        <h3 className="text-xs font-black uppercase text-emerald-600 tracking-widest border-b border-emerald-100 pb-2 mb-4">Perfil Corporativo</h3>

                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-black uppercase text-slate-500 tracking-widest">Descrição geral da empresa</label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Descreva os objectivos, história e actuação da empresa..."
                                className="p-4 bg-slate-50 border-none rounded-xl text-sm font-medium focus:ring-2 focus:ring-emerald-500 outline-none resize-none h-32"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="flex flex-col gap-2">
                                <label className="text-xs font-black uppercase text-slate-500 tracking-widest flex items-center gap-1">
                                    <Target className="w-3 h-3" /> Missão
                                </label>
                                <textarea
                                    value={formData.mission}
                                    onChange={(e) => setFormData({ ...formData, mission: e.target.value })}
                                    placeholder="Missão da empresa..."
                                    className="p-3 bg-slate-50 border-none rounded-xl text-sm font-medium focus:ring-2 focus:ring-emerald-500 outline-none resize-none h-24"
                                />
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-xs font-black uppercase text-slate-500 tracking-widest flex items-center gap-1">
                                    <Eye className="w-3 h-3" /> Visão
                                </label>
                                <textarea
                                    value={formData.vision}
                                    onChange={(e) => setFormData({ ...formData, vision: e.target.value })}
                                    placeholder="Visão da empresa..."
                                    className="p-3 bg-slate-50 border-none rounded-xl text-sm font-medium focus:ring-2 focus:ring-emerald-500 outline-none resize-none h-24"
                                />
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-xs font-black uppercase text-slate-500 tracking-widest flex items-center gap-1">
                                    <Heart className="w-3 h-3" /> Valores
                                </label>
                                <textarea
                                    value={formData.values}
                                    onChange={(e) => setFormData({ ...formData, values: e.target.value })}
                                    placeholder="Valores da empresa..."
                                    className="p-3 bg-slate-50 border-none rounded-xl text-sm font-medium focus:ring-2 focus:ring-emerald-500 outline-none resize-none h-24"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Services */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between border-b border-emerald-100 pb-2 mb-4">
                            <h3 className="text-xs font-black uppercase text-emerald-600 tracking-widest">Portfólio de Serviços</h3>
                            <div className="flex items-center gap-2">
                                <label className="cursor-pointer text-[10px] font-black uppercase text-white bg-orange-500 hover:bg-orange-600 px-3 py-1 rounded-full transition-colors flex items-center gap-1">
                                    <FileText className="w-3 h-3" />
                                    {formData.portfolio_url ? "Alterar PDF" : "Subir PDF (Portfólio)"}
                                    <input
                                        type="file"
                                        accept=".pdf"
                                        onChange={handlePortfolioUpload}
                                        className="hidden"
                                    />
                                </label>
                                <button
                                    type="button"
                                    onClick={addService}
                                    className="text-[10px] font-black uppercase text-emerald-600 hover:text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full transition-colors"
                                >
                                    + Adicionar Serviço
                                </button>
                            </div>
                        </div>

                        {formData.portfolio_url && (
                            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100 flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2">
                                    <FileText className="w-4 h-4 text-emerald-600" />
                                    <span className="text-xs font-bold text-emerald-700">PDF do Portfólio carregado</span>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setFormData(prev => ({ ...prev, portfolio_url: "" }))}
                                    className="p-1 hover:bg-emerald-100 rounded-full text-emerald-600"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {formData.services.map((service: string, index: number) => (
                                <div key={index} className="flex items-center gap-2">
                                    <div className="relative flex-1">
                                        <List className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        <input
                                            value={service}
                                            onChange={(e) => updateService(index, e.target.value)}
                                            placeholder="Descreva o serviço..."
                                            className="pl-10 pr-4 py-3 bg-slate-50 border-none rounded-xl text-sm font-bold focus:ring-2 focus:ring-emerald-500 outline-none w-full"
                                        />
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => removeService(index)}
                                        className="p-3 bg-red-50 text-red-500 hover:bg-red-100 rounded-xl transition-colors"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                            {formData.services.length === 0 && (
                                <p className="col-span-full text-center text-slate-400 text-xs italic py-4">
                                    Nenhum serviço adicionado.
                                </p>
                            )}
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
                        {(initialData ? "Guardar Alterações" : "Adicionar Empresa")}
                    </Button>
                </div>
            </div>
        </div>
    );
}
