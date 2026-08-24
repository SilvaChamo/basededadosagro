"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RichTextEditor } from "@/components/RichTextEditor";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, Send, FileText, FileArchive, File as FileIcon, X, LayoutTemplate } from "lucide-react";
import { MultiFileUpload } from "@/components/admin/MultiFileUpload";
import { SenderEmailSelector } from "@/components/admin/SenderEmailSelector";
import { EmailTemplates } from "@/components/admin/EmailTemplates";
import { Spinner } from "@/components/ui/spinner";
import { AdminListToolbar, AdminToolbarTitle } from "@/components/admin/AdminListToolbar";
import { useAdminTopBar } from "@/components/admin/AdminTopBar";
import { LogoutButton } from "@/components/LogoutButton";

const PLANS = [
    "Gratuito",
    "Básico",
    "Premium",
    "Business Vendedor",
    "Parceiro",
    "Profissionais",
    "Subscritores (Newsletter)"
];

export default function AdminMessagesPage() {
    const [subject, setSubject] = useState("");
    const [content, setContent] = useState("");
    const [selectedPlans, setSelectedPlans] = useState<string[]>([]);
    const [senderEmail, setSenderEmail] = useState("admin@basededadosagro.com");
    const [attachments, setAttachments] = useState<string[]>([]);

    const [isSending, setIsSending] = useState(false);
    const [showTemplates, setShowTemplates] = useState(false);

    const handlePlanToggle = (plan: string) => {
        if (selectedPlans.includes(plan)) {
            setSelectedPlans(selectedPlans.filter((p: any) => p !== plan));
        } else {
            setSelectedPlans([...selectedPlans, plan]);
        }
    };

    const handleSend = async () => {
        if (!subject || !content || selectedPlans.length === 0) {
            alert("Por favor, preencha o assunto, conteúdo e selecione pelo menos um grupo de destinatários.");
            return;
        }

        setIsSending(true);

        try {
            // Append attachments to content
            let finalContent = content;
            if (attachments.length > 0) {
                finalContent += `<br/><div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #eee;"><strong>Anexos:</strong><ul style="list-style: none; padding: 0; margin-top: 8px;">`;
                attachments.forEach(url => {
                    const fileName = url.split('/').pop() || "Documento";
                    finalContent += `<li style="margin-bottom: 8px;"><a href="${url}" target="_blank" style="color: #2563eb; text-decoration: underline; display: inline-flex; align-items: center; gap: 4px;">📎 ${fileName}</a></li>`;
                });
                finalContent += `</ul></div>`;
            }

            // 1. Create Message Record
            const { data: msgData, error: msgError } = await supabase
                .from('messages')
                .insert({
                    subject,
                    content: finalContent,
                    sender_email: senderEmail,
                    target_roles: selectedPlans
                })
                .select()
                .single();

            if (msgError) throw msgError;

            // 2. Find Users, Companies and Professionals
            let allRecipients: { id?: string, email: string }[] = [];

            // A. Fetch from Profiles and Companies based on Plans
            // We include "Gratuito" as a special case for "Visitante" too
            const selectedPlanNames = selectedPlans.filter((p: any) => !["Subscritores (Newsletter)", "Profissionais"].includes(p));

            if (selectedPlanNames.length > 0) {
                // Prepare normalized plans for query (case sensitive handling if needed)
                const queryPlanNames = [...selectedPlanNames];
                if (queryPlanNames.includes("Gratuito")) {
                    queryPlanNames.push("Visitante", "free", "Free", "Gratuito", "gratuito");
                }
                if (queryPlanNames.includes("Básico")) {
                    queryPlanNames.push("Basic");
                }

                // Search in Profiles
                const { data: profileUsers, error: profError } = await supabase
                    .from('profiles')
                    .select('id, email')
                    .in('plan', queryPlanNames);

                if (profError) throw profError;
                if (profileUsers) allRecipients = [...allRecipients, ...profileUsers];

                // Search in Companies
                const { data: companyUsers, error: compError } = await supabase
                    .from('companies')
                    .select('user_id, email')
                    .in('plan', queryPlanNames);

                if (compError) throw compError;
                if (companyUsers) {
                    const mappedCompUsers = companyUsers.map((c: any) => ({ id: c.user_id, email: c.email }));
                    allRecipients = [...allRecipients, ...mappedCompUsers];
                }
            }

            // B. Fetch Professionals if selected
            if (selectedPlans.includes("Profissionais")) {
                const { data: professionals, error: extraError } = await supabase
                    .from('professionals')
                    .select('email, user_id');

                if (extraError) throw extraError;
                if (professionals) {
                    const mappedProfs = professionals.map((p: any) => ({ id: p.user_id, email: p.email }));
                    allRecipients = [...allRecipients, ...mappedProfs];
                }
            }

            // C. Fetch Newsletter Subscribers
            if (selectedPlans.includes("Subscritores (Newsletter)")) {
                const { data: subscribers, error: subError } = await supabase
                    .from('newsletter_subscribers')
                    .select('email');

                if (subError) throw subError;
                if (subscribers) {
                    const mappedSubs = subscribers.map((s: any) => ({ email: s.email }));
                    allRecipients = [...allRecipients, ...mappedSubs];
                }
            }

            if (allRecipients.length === 0) {
                alert("Nenhum destinatário encontrado para os grupos selecionados.");
                setIsSending(false);
                return;
            }

            // Remove duplicates (users might be in newsletter too)
            const uniqueEmails = Array.from(new Set(allRecipients.map((r: any) => r.email)));
            const uniqueRecipients = uniqueEmails.map((email: any) => allRecipients.find((r: any) => r.email === email)!);

            // 3. Create Notifications (Only for Registered Users with IDs)
            const registeredUsers = uniqueRecipients.filter((u: any) => u.id);
            if (registeredUsers.length > 0) {
                const notifications = registeredUsers.map((u: any) => ({
                    user_id: u.id,
                    message_id: msgData.id,
                    read: false
                }));

                const { error: notifError } = await supabase
                    .from('notifications')
                    .insert(notifications);

                if (notifError) throw notifError;
            }

            // 4. Send Email via SMTP API
            const emailRecipients = uniqueRecipients.map((u: any) => u.email).filter(Boolean);

            if (emailRecipients.length > 0) {
                const emailResponse = await fetch('/api/messages/send', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        to: emailRecipients,
                        subject: subject,
                        html: finalContent,
                        attachments: attachments,
                        replyTo: senderEmail,
                        targetAudiences: selectedPlans
                    })
                });

                if (!emailResponse.ok) {
                    const errorData = await emailResponse.json();
                    console.error("SMTPSend Error:", errorData);
                    alert(`Mensagem salva, mas erro ao enviar emails: ${errorData.error}`);
                } else {
                    alert(`Mensagem enviada com sucesso para ${uniqueRecipients.length} destinatários!`);
                }
            } else {
                alert(`Mensagem salva. Notificações criadas para ${registeredUsers.length} usuários (Sem emails válidos para envio).`);
            }

            // Reset Form (except sender)
            setSubject("");
            setContent("");
            setSelectedPlans([]);
            setAttachments([]);

        } catch (error: any) {
            console.error(error);
            alert("Erro ao enviar mensagem: " + error.message);
        } finally {
            setIsSending(false);
        }
    };

    useAdminTopBar("");

    return (
        <div className="w-full max-w-full space-y-8 pb-20">
            <AdminListToolbar className="flex-nowrap">
                <AdminToolbarTitle title="Enviar Mensagem" />
                <div className="flex items-center gap-2 shrink-0">
                    <LogoutButton
                        variant="outline"
                        className="h-9 px-4 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-red-600 border-slate-200"
                        showIcon
                        label="Sair"
                    />
                </div>
            </AdminListToolbar>

            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 space-y-6">

                {/* Sender & Targets */}
                <div className="flex flex-col md:flex-row md:items-start gap-4">
                    <div className="space-y-3 w-full md:w-[460px] md:max-w-[460px] shrink-0">
                        <label className="text-xs font-bold text-slate-500 uppercase">Email de Origem</label>
                        <SenderEmailSelector
                            value={senderEmail}
                            onChange={setSenderEmail}
                        />
                    </div>

                    <div className="space-y-3 flex-1 min-w-0">
                        <div className="flex justify-between items-center">
                            <label className="text-xs font-bold text-slate-500 uppercase">Destinatários (Planos)</label>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setSelectedPlans(PLANS)}
                                    className="text-[10px] uppercase font-bold text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 px-2 py-1 rounded"
                                >
                                    Selecionar Todos
                                </button>
                                <button
                                    onClick={() => setSelectedPlans([])}
                                    className="text-[10px] uppercase font-bold text-slate-400 hover:text-slate-600 hover:bg-slate-50 px-2 py-1 rounded"
                                >
                                    Limpar
                                </button>
                            </div>
                        </div>
                        <div className="flex flex-nowrap items-center gap-4 px-4 h-9 bg-slate-50 rounded-[8px] border border-slate-100 overflow-x-auto">
                            {PLANS.map(plan => (
                                <div key={plan} className="flex items-center space-x-2">
                                    <Checkbox
                                        id={`plan-${plan}`}
                                        checked={selectedPlans.includes(plan)}
                                        onChange={() => handlePlanToggle(plan)}
                                        className="data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600"
                                    />
                                    <label
                                        htmlFor={`plan-${plan}`}
                                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer text-slate-700"
                                    >
                                        {plan}
                                    </label>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Subject */}
                <div className="space-y-3">
                    <label className="text-xs font-bold text-slate-500 uppercase">Assunto</label>
                    <Input
                        placeholder="Ex: Novidades na Plataforma"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        className="text-lg font-semibold"
                    />
                </div>

                {/* Attachments */}
                {/* Content & Attachments Combined */}
                <div className="space-y-3">
                    <div className="flex flex-col gap-4">
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                {/* Mini Attachment Button */}
                                <MultiFileUpload
                                    value={attachments}
                                    onChange={setAttachments}
                                    folder="admin-messages"
                                    layout="minimal"
                                    showList={false}
                                />
                                <div className="w-px h-4 bg-slate-200 mx-2"></div>
                                {/* Template Picker */}
                                <button
                                    onClick={() => setShowTemplates(true)}
                                    className="text-[10px] text-white px-4 py-2 rounded-full font-bold uppercase tracking-wider flex items-center gap-2 transition-transform hover:scale-105 shadow-md hover:shadow-lg"
                                    style={{
                                        background: "linear-gradient(90deg, #6366f1, #8b5cf6, #a78bfa)",
                                        backgroundSize: "200% 200%",
                                        animation: "gradient-move 3s ease infinite"
                                    }}
                                >
                                    <LayoutTemplate className="w-3.5 h-3.5" />
                                    <span className="drop-shadow-sm">Templates</span>
                                </button>
                                <div className="w-px h-4 bg-slate-200 mx-2"></div>
                                {/* Newsletter Builder Link */}
                                <a
                                    href="/admin/mensagens/newsletter"
                                    className="text-[10px] text-white px-4 py-2 rounded-full font-bold uppercase tracking-wider flex items-center gap-2 transition-transform hover:scale-105 shadow-md hover:shadow-lg"
                                    style={{
                                        background: "linear-gradient(90deg, #10b981, #f97316, #a3e635)",
                                        backgroundSize: "200% 200%",
                                        animation: "gradient-move 3s ease infinite"
                                    }}
                                >
                                    <span className="drop-shadow-sm">Editor Visual (Newsletter)</span>
                                    <span className="bg-white/20 px-1.5 py-0.5 rounded text-[9px] backdrop-blur-sm">BETA</span>
                                </a>
                            </div>
                            <label className="text-xs font-bold text-slate-500 uppercase">Conteúdo da Mensagem</label>
                        </div>

                        {/* Custom Grid Layout for Attachments */}
                        {attachments.length > 0 && (
                            <div className="grid grid-cols-4 gap-4 animate-in fade-in slide-in-from-top-2">
                                {attachments.map((url, index) => (
                                    <div key={index} className="relative group bg-slate-50 border border-slate-200 rounded-lg p-3 flex flex-col gap-2 hover:border-emerald-500 transition-colors">
                                        <div className="w-full h-24 bg-white rounded border border-slate-100 flex items-center justify-center overflow-hidden">
                                            {url.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                                                <img src={url} alt="thumbnail" className="w-full h-full object-cover" />
                                            ) : url.match(/\.pdf$/i) ? (
                                                <FileText className="w-10 h-10 text-red-500" />
                                            ) : url.match(/\.(zip|rar)$/i) ? (
                                                <FileArchive className="w-10 h-10 text-yellow-600" />
                                            ) : (
                                                <FileIcon className="w-10 h-10 text-slate-500" />
                                            )}
                                        </div>
                                        <div className="flex items-center justify-between gap-2">
                                            <a href={url} target="_blank" rel="noopener noreferrer" className="text-[10px] font-bold text-slate-600 truncate hover:text-blue-600 hover:underline flex-1">
                                                {url.split('/').pop()}
                                            </a>
                                            <button
                                                onClick={() => setAttachments(attachments.filter((a: any) => a !== url))}
                                                className="text-slate-400 hover:text-red-500 transition-colors"
                                                title="Remover anexo"
                                            >
                                                <X className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        <RichTextEditor
                            value={content}
                            onChange={setContent}
                            placeholder="Escreva sua mensagem aqui..."
                            className="min-h-[300px]"
                        />
                    </div>
                </div>

                {/* Actions */}
                <div className="pt-4 flex justify-end">
                    <Button
                        onClick={handleSend}
                        disabled={isSending}
                        className="bg-emerald-600 hover:bg-[#f97316] text-white px-8 h-12 rounded-lg font-bold uppercase tracking-wider shadow-xl shadow-emerald-500/20 transition-all"
                    >
                        {(
                            <>
                                <Send className="w-4 h-4 mr-2" />
                                Enviar Mensagem
                            </>
                        )}
                    </Button>
                </div>

            </div>

            {/* Template Picker Modal */}
            {showTemplates && (
                <EmailTemplates
                    onSelect={(html) => {
                        setContent(html);
                        setShowTemplates(false);
                    }}
                    onClose={() => setShowTemplates(false)}
                />
            )}
        </div>
    );
}
