"use client";

import { useState, useEffect } from "react";
import { HelpCircle, Mail, MessageCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/utils/supabase/client";
import { DashboardPageHeader } from "@/components/DashboardPageHeader";

export default function AjudaPage() {
    const [user, setUser] = useState<any>(null);
    const [supportMessage, setSupportMessage] = useState("");
    const [sendingSupport, setSendingSupport] = useState(false);
    const supabase = createClient();

    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);
        };
        getUser();
    }, [supabase]);

    const handleSendSupport = async () => {
        if (!supportMessage.trim() || !user) return;
        setSendingSupport(true);

        try {
            const { error } = await supabase
                .from('support_tickets')
                .insert({
                    user_id: user.id,
                    user_email: user.email,
                    subject: "Pedido de Suporte Técnico",
                    message: supportMessage,
                    status: 'pending'
                });

            if (error) throw error;

            alert("Sua mensagem foi enviada para a nossa equipa de suporte. Responderemos em breve para " + user?.email);
            setSupportMessage("");
        } catch (error: any) {
            console.error("Error sending support ticket:", error);
            alert("Erro ao enviar mensagem: " + error.message);
        } finally {
            setSendingSupport(false);
        }
    };

    return (
        <div className="space-y-6">
            <DashboardPageHeader
                title="Ajuda & Suporte"
                description="Central de suporte para esclarecer dúvidas e solicitar assistência."
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white p-8 rounded-[15px] border border-slate-100 text-center space-y-4">
                        <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto text-blue-500">
                            <HelpCircle className="w-8 h-8" />
                        </div>
                        <h3 className="font-bold text-xl text-slate-800">Perguntas Frequentes</h3>
                        <p className="text-slate-500 text-sm">Encontre respostas rápidas para dúvidas comuns.</p>
                        <Button variant="outline" className="w-full">Ver FAQ</Button>
                    </div>

                    <div className="bg-emerald-950 p-8 rounded-[15px] border border-emerald-900 text-center space-y-4">
                        <div className="w-16 h-16 bg-emerald-900 rounded-full flex items-center justify-center mx-auto text-emerald-400">
                            <MessageCircle className="w-8 h-8" />
                        </div>
                        <h3 className="font-bold text-xl text-white">Canais de Apoio</h3>
                        <p className="text-emerald-300 text-xs">Chat ao vivo disponível de Segunda a Sexta, das 8h às 17h.</p>
                        <Button className="w-full bg-emerald-600 hover:bg-emerald-700">Iniciar Chat</Button>
                    </div>
                </div>

                <div className="lg:col-span-2">
                    <div className="bg-white p-8 rounded-[15px] border border-slate-100 shadow-sm h-full">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center text-orange-600">
                                <Mail className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg text-slate-800">Enviar Mensagem</h3>
                                <p className="text-sm text-slate-500">Nossa equipe técnica responderá em até 24 horas úteis.</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Sua Mensagem</label>
                                <textarea
                                    value={supportMessage}
                                    onChange={(e) => setSupportMessage(e.target.value)}
                                    placeholder="Descreva detalhadamente sua dúvida ou problema..."
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm text-slate-800 placeholder:text-slate-400 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none min-h-[200px] transition-all resize-none"
                                />
                            </div>

                            <Button
                                onClick={handleSendSupport}
                                disabled={sendingSupport || !supportMessage.trim()}
                                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold h-12 shadow-lg shadow-orange-500/20 transition-all flex items-center justify-center gap-3 group"
                            >
                                {sendingSupport ? "Enviando Pedido..." : "Enviar para o Suporte Técnico"}
                                {!sendingSupport && <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
                            </Button>

                            <p className="text-[10px] text-slate-400 text-center italic mt-4">
                                Ao enviar, uma cópia desta solicitação será enviada para o seu email de cadastro.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
