"use client";

import React, { useState } from "react";
import { X, CheckCircle, Handshake, Loader2, Send } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface PartnerInterestModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const PROVINCES = [
    "Cabo Delgado", "Gaza", "Inhambane", "Manica",
    "Maputo Cidade", "Maputo Província", "Nampula",
    "Niassa", "Sofala", "Tete", "Zambézia"
];

export function PartnerInterestModal({ isOpen, onClose }: PartnerInterestModalProps) {
    const supabase = createClient();
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const [formData, setFormData] = useState({
        fullName: "",
        companyName: "",
        email: "",
        phone: "+258 ",
        province: "Maputo Província",
        activitySector: "",
        message: ""
    });

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { error } = await supabase
                .from('partner_interests')
                .insert({
                    full_name: formData.fullName,
                    company_name: formData.companyName,
                    email: formData.email,
                    phone: formData.phone,
                    province: formData.province,
                    activity_sector: formData.activitySector,
                    message: formData.message,
                    status: 'pendente'
                });

            if (error) {
                console.error("Error submitting partner interest:", error);
                toast.error("Ocorreu um erro ao submeter o pedido. Tente novamente.");
                return;
            }

            setSuccess(true);
            toast.success("Manifestação de interesse enviada com sucesso!");
        } catch (err) {
            console.error("Unexpected error:", err);
            toast.error("Erro inesperado. Tente novamente.");
        } finally {
            setLoading(false);
        }
    };

    const handleResetAndClose = () => {
        setSuccess(false);
        setFormData({
            fullName: "",
            companyName: "",
            email: "",
            phone: "+258 ",
            province: "Maputo Província",
            activitySector: "",
            message: ""
        });
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-100 overflow-hidden relative animate-in zoom-in-95 duration-200">
                {/* Header with Centered Text */}
                <div className="bg-slate-900 p-4 sm:px-6 sm:py-5 text-white text-center relative border-b-4 border-orange-500">
                    <button
                        onClick={handleResetAndClose}
                        className="absolute top-3.5 right-3.5 p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-full transition-colors z-10"
                        title="Fechar"
                    >
                        <X className="w-5 h-5 text-white" />
                    </button>
                    <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-orange-500/20 text-orange-400 text-[11px] font-black uppercase tracking-wider border border-orange-500/40 mb-1.5 mx-auto">
                        <Handshake className="w-3.5 h-3.5 text-orange-400" />
                        Plano Parceiro
                    </div>
                    <h3 className="text-2xl sm:text-3xl font-black font-heading leading-tight text-emerald-400 tracking-tight drop-shadow-sm">
                        Manifestação de Interesse
                    </h3>
                    <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-lg mx-auto leading-snug font-medium">
                        Preencha o formulário abaixo. A nossa equipa comercial entrará em contacto para apresentar as vantagens exclusivas e formalizar a parceria.
                    </p>
                </div>

                {/* Content Area */}
                <div className="p-6 sm:p-8 max-h-[75vh] overflow-y-auto bg-slate-50/50">
                    {success ? (
                        <div className="text-center py-8 space-y-4">
                            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                                <CheckCircle className="w-10 h-10" />
                            </div>
                            <h4 className="text-2xl font-black text-slate-900">Proposta Enviada com Sucesso!</h4>
                            <p className="text-slate-600 text-sm max-w-md mx-auto leading-relaxed">
                                Agradecemos o seu interesse no **Plano Parceiro** da Base Agro Data. O nosso departamento comercial já recebeu os seus dados e entrará em contacto muito em breve.
                            </p>
                            <Button
                                onClick={handleResetAndClose}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-8 h-11 rounded-xl shadow-lg mt-4"
                            >
                                Concluir
                            </Button>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-5 text-left">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                <div className="space-y-1.5 text-left">
                                    <label className="text-xs font-extrabold text-slate-800 uppercase tracking-wider block text-left">
                                        Nome Completo <span className="text-rose-500">*</span>
                                    </label>
                                    <Input
                                        type="text"
                                        required
                                        placeholder="Ex: João Mabunda"
                                        className="h-11 text-sm font-medium border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:border-orange-500 focus:ring-1 focus:ring-orange-500/20 shadow-sm rounded-[8px]"
                                        value={formData.fullName}
                                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                    />
                                </div>

                                <div className="space-y-1.5 text-left">
                                    <label className="text-xs font-extrabold text-slate-800 uppercase tracking-wider block text-left">
                                        Nome da Empresa / Entidade <span className="text-rose-500">*</span>
                                    </label>
                                    <Input
                                        type="text"
                                        required
                                        placeholder="Ex: Agro-Indústria do Limpopo"
                                        className="h-11 text-sm font-medium border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:border-orange-500 focus:ring-1 focus:ring-orange-500/20 shadow-sm rounded-[8px]"
                                        value={formData.companyName}
                                        onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                <div className="space-y-1.5 text-left">
                                    <label className="text-xs font-extrabold text-slate-800 uppercase tracking-wider block text-left">
                                        E-mail Corporativo <span className="text-rose-500">*</span>
                                    </label>
                                    <Input
                                        type="email"
                                        required
                                        placeholder="contacto@empresa.co.mz"
                                        className="h-11 text-sm font-medium border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:border-orange-500 focus:ring-1 focus:ring-orange-500/20 shadow-sm rounded-[8px]"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    />
                                </div>

                                <div className="space-y-1.5 text-left">
                                    <label className="text-xs font-extrabold text-slate-800 uppercase tracking-wider block text-left">
                                        Telefone / WhatsApp <span className="text-rose-500">*</span>
                                    </label>
                                    <Input
                                        type="tel"
                                        required
                                        placeholder="+258 84 000 0000"
                                        className="h-11 text-sm font-medium border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:border-orange-500 focus:ring-1 focus:ring-orange-500/20 shadow-sm rounded-[8px]"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                <div className="space-y-1.5 text-left">
                                    <label className="text-xs font-extrabold text-slate-800 uppercase tracking-wider block text-left">
                                        Província <span className="text-rose-500">*</span>
                                    </label>
                                    <select
                                        required
                                        className="w-full h-11 px-3 bg-white border border-slate-300 rounded-[8px] text-sm font-medium text-slate-900 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/20 shadow-sm"
                                        value={formData.province}
                                        onChange={(e) => setFormData({ ...formData, province: e.target.value })}
                                    >
                                        {PROVINCES.map((prov) => (
                                            <option key={prov} value={prov}>{prov}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="space-y-1.5 text-left">
                                    <label className="text-xs font-extrabold text-slate-800 uppercase tracking-wider block text-left">
                                        Sector de Actividade <span className="text-rose-500">*</span>
                                    </label>
                                    <Input
                                        type="text"
                                        required
                                        placeholder="Ex: Produção de Cereais, Processamento, Logística..."
                                        className="h-11 text-sm font-medium border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:border-orange-500 focus:ring-1 focus:ring-orange-500/20 shadow-sm rounded-[8px]"
                                        value={formData.activitySector}
                                        onChange={(e) => setFormData({ ...formData, activitySector: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5 text-left">
                                <label className="text-xs font-extrabold text-slate-800 uppercase tracking-wider block text-left">
                                    Objectivos da Parceria / Mensagem <span className="text-rose-500">*</span>
                                </label>
                                <Textarea
                                    required
                                    rows={4}
                                    placeholder="Descreva brevemente a sua actuação e de que forma pretende colaborar..."
                                    className="text-sm font-medium border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:border-orange-500 focus:ring-1 focus:ring-orange-500/20 shadow-sm rounded-[8px]"
                                    value={formData.message}
                                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                />
                            </div>

                            <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-200 mt-6">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={handleResetAndClose}
                                    className="h-11 border border-slate-300 text-slate-700 hover:bg-slate-100 font-bold px-5 rounded-[8px]"
                                >
                                    Cancelar
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={loading}
                                    className="h-11 bg-orange-600 hover:bg-orange-700 text-white font-bold px-8 rounded-[8px] shadow-md gap-2"
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            A enviar...
                                        </>
                                    ) : (
                                        <>
                                            <Send className="w-4 h-4" />
                                            Submeter Proposta
                                        </>
                                    )}
                                </Button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
