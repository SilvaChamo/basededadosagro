"use client";

import { useState } from "react";
import { X, CheckCircle2, Loader2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { supabase } from "@/lib/supabaseClient";
import { Spinner } from "@/components/ui/spinner";

interface TrainingEnrollmentFormProps {
    trainingId: string;
    trainingTitle: string;
    onClose: () => void;
}

export function TrainingEnrollmentForm({ trainingId, trainingTitle, onClose }: TrainingEnrollmentFormProps) {
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [formData, setFormData] = useState({
        full_name: "",
        email: "",
        phone: "",
        company: "",
        notes: ""
    });

    const [honeypot, setHoneypot] = useState("");
    const [formLoadTime] = useState(Date.now());

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
            toast.error("Por favor, preencha o formulário com mais atenção.");
            return;
        }

        setLoading(true);

        try {
            const { error } = await supabase
                .from('enrollments')
                .insert([
                    {
                        training_id: trainingId,
                        training_title: trainingTitle,
                        ...formData
                    }
                ]);

            if (error) throw error;

            setSubmitted(true);
            toast.success("Inscrição enviada com sucesso!");
        } catch (error: any) {
            console.error("Enrollment error:", error);
            toast.error("Erro ao enviar inscrição. Por favor, tente novamente.");
        } finally {
            setLoading(false);
        }
    };

    if (submitted) {
        return (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
                <div className="bg-white rounded-3xl p-8 max-w-md w-full text-center shadow-2xl relative">
                    <button
                        onClick={onClose}
                        className="absolute right-6 top-6 p-2 hover:bg-slate-100 rounded-full transition-colors"
                    >
                        <X className="w-5 h-5 text-slate-400" />
                    </button>

                    <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle2 className="w-10 h-10 text-emerald-600" />
                    </div>

                    <h3 className="text-2xl font-black text-slate-800 mb-2">Inscrição Recebida!</h3>
                    <p className="text-slate-500 mb-8">
                        Agradecemos o seu interesse na formação <b>{trainingTitle}</b>.
                        Entraremos em contacto brevemente para confirmar a sua vaga e detalhes de pagamento.
                    </p>

                    <Button
                        onClick={onClose}
                        className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold h-12 rounded-xl"
                    >
                        Fechar
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl relative flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="p-8 pb-4 flex items-start justify-between">
                    <div>
                        <h2 className="text-2xl font-black text-slate-800 leading-tight">Inscrever-se na Formação</h2>
                        <p className="text-slate-500 font-medium mt-1">{trainingTitle}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-100 rounded-full transition-colors -mr-2"
                    >
                        <X className="w-5 h-5 text-slate-400" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-8 pt-4 space-y-5 overflow-y-auto">
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
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-black uppercase tracking-wider text-slate-400 ml-1">Nome Completo</label>
                                <Input
                                    required
                                    value={formData.full_name}
                                    onChange={e => setFormData({ ...formData, full_name: e.target.value })}
                                    placeholder="Ex: João Silva"
                                    className="h-12 bg-slate-50 border-transparent focus:border-slate-200 rounded-xl"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-black uppercase tracking-wider text-slate-400 ml-1">Email</label>
                                <Input
                                    required
                                    type="email"
                                    value={formData.email}
                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                    placeholder="joao@exemplo.com"
                                    className="h-12 bg-slate-50 border-transparent focus:border-slate-200 rounded-xl"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-black uppercase tracking-wider text-slate-400 ml-1">Telefone / WhatsApp</label>
                                <Input
                                    required
                                    value={formData.phone}
                                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                    placeholder="+258 8X XXX XXXX"
                                    className="h-12 bg-slate-50 border-transparent focus:border-slate-200 rounded-xl"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-black uppercase tracking-wider text-slate-400 ml-1">Empresa / Organização</label>
                                <Input
                                    value={formData.company}
                                    onChange={e => setFormData({ ...formData, company: e.target.value })}
                                    placeholder="Opcional"
                                    className="h-12 bg-slate-50 border-transparent focus:border-slate-200 rounded-xl"
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-black uppercase tracking-wider text-slate-400 ml-1">Notas ou Perguntas</label>
                            <Textarea
                                value={formData.notes}
                                onChange={e => setFormData({ ...formData, notes: e.target.value })}
                                placeholder="Deseja deixar alguma nota adicional?"
                                className="min-h-[100px] bg-slate-50 border-transparent focus:border-slate-200 rounded-xl resize-none"
                            />
                        </div>
                    </div>

                    <div className="pt-4">
                        <Button
                            type="submit"
                            disabled={loading}
                            className="w-full h-14 bg-[#f97316] hover:bg-[#ea6a0a] text-white font-black text-lg rounded-xl shadow-lg shadow-orange-200 transition-all flex items-center justify-center gap-2 group"
                        >
                            {(
                                <>
                                    Confirmar Inscrição
                                    <Send className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                                </>
                            )}
                        </Button>
                        <p className="text-[10px] text-center text-slate-400 mt-4 leading-relaxed font-medium">
                            Ao confirmar, autoriza o processamento dos seus dados para efeitos de inscrição nesta formação específica.
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
}
