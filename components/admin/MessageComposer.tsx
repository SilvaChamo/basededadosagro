"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RichTextEditor } from "@/components/RichTextEditor";
import { Checkbox } from "@/components/ui/checkbox";
import { Send, FileText, FileArchive, File as FileIcon, X, LayoutTemplate } from "lucide-react";
import { MultiFileUpload } from "@/components/admin/MultiFileUpload";
import { SenderEmailSelector } from "@/components/admin/SenderEmailSelector";
import { EmailTemplates } from "@/components/admin/EmailTemplates";

const PLANS = [
    "Gratuito",
    "Básico",
    "Premium",
    "Business Vendedor",
    "Parceiro",
    "Profissionais",
    "Subscritores (Newsletter)"
];

interface MessageComposerProps {
    /** Chamado depois de a mensagem ser criada/enviada com sucesso (a página
     *  Campanhas usa-o para fechar o compositor e recarregar a lista). */
    onSent?: () => void;
    /** Quando fornecido, mostra um "Cancelar" no fundo da barra lateral. */
    onCancel?: () => void;
}

// Campos de topo: h-10, fundo branco, SEM cantos e SEM borda própria —
// ficam colados uns aos outros, separados só pela linha (divide-y do pai).
const FIELD = "h-10 rounded-none border-0 bg-white px-3 text-sm";

const parseEmails = (s: string) =>
    s.split(/[\s,;]+/).map((e) => e.trim().toLowerCase()).filter((e) => e.includes("@"));

export function MessageComposer({ onSent, onCancel }: MessageComposerProps) {
    const [subject, setSubject] = useState("");
    const [content, setContent] = useState("");
    const [cc, setCc] = useState("");
    const [bcc, setBcc] = useState("");
    const [showCc, setShowCc] = useState(false);
    const [showBcc, setShowBcc] = useState(false);
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

    // Conteúdo + lista de anexos no fim.
    const buildHtml = () => {
        let out = content;
        if (attachments.length > 0) {
            out += `<br/><div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #eee;"><strong>Anexos:</strong><ul style="list-style: none; padding: 0; margin-top: 8px;">`;
            attachments.forEach(url => {
                const fileName = url.split('/').pop() || "Documento";
                out += `<li style="margin-bottom: 8px;"><a href="${url}" target="_blank" style="color: #2563eb; text-decoration: underline; display: inline-flex; align-items: center; gap: 4px;">📎 ${fileName}</a></li>`;
            });
            out += `</ul></div>`;
        }
        return out;
    };

    const handleSend = async () => {
        const ccList = parseEmails(cc);
        const bccList = parseEmails(bcc);
        const hasPlans = selectedPlans.length > 0;
        const hasManual = ccList.length > 0 || bccList.length > 0;

        if (!subject || !content || (!hasPlans && !hasManual)) {
            alert("Preenche o assunto, o conteúdo e pelo menos um destino (grupos de planos, ou CC/BCC).");
            return;
        }

        setIsSending(true);

        try {
            const finalContent = buildHtml();

            // Modo "webmail": sem planos, só CC/BCC -> um envio único, sem
            // criar campanha nem registos por destinatário.
            if (!hasPlans) {
                const res = await fetch('/api/messages/send', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        cc: ccList,
                        bcc: bccList,
                        subject,
                        html: finalContent,
                        attachments,
                        replyTo: senderEmail,
                    }),
                });
                const data = await res.json().catch(() => ({}));
                if (!res.ok) throw new Error(data.error || "Falha no envio");
                alert(`Email enviado para ${ccList.length + bccList.length} endereço(s) em CC/BCC.`);
                setSubject(""); setContent(""); setCc(""); setBcc(""); setAttachments([]);
                onSent?.();
                return;
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
                        cc: ccList,
                        bcc: bccList,
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
                    alert(`Campanha criada para ${uniqueRecipients.length} destinatários. O envio é um-a-um e está a decorrer — acompanha o progresso e as entregas na lista de Campanhas.`);
                }
            } else {
                alert(`Mensagem salva. Notificações criadas para ${registeredUsers.length} usuários (Sem emails válidos para envio).`);
            }

            // Reset Form (except sender)
            setSubject("");
            setContent("");
            setCc("");
            setBcc("");
            setSelectedPlans([]);
            setAttachments([]);

            onSent?.();

        } catch (error: any) {
            console.error(error);
            alert("Erro ao enviar mensagem: " + error.message);
        } finally {
            setIsSending(false);
        }
    };

    return (
        <div className="flex flex-col lg:flex-row gap-6 pb-20">
            {/* Coluna principal — TRÊS contentores separados:
                (1) campos  ·  (2) botões/ferramentas  ·  (3) compositor */}
            <div className="flex-1 min-w-0 space-y-4">

                {/* (1) Contentor dos campos. Remetente e Assunto sempre visíveis;
                    CC e BCC aparecem/escondem nos toggles "Cc"/"Bcc" do Assunto.
                    Campos colados (fundo branco), separados só pela linha. */}
                <div className="bg-white rounded-[10px] shadow-sm border border-slate-200 overflow-hidden divide-y divide-slate-200">
                    <SenderEmailSelector
                        value={senderEmail}
                        onChange={setSenderEmail}
                    />
                    {showCc && (
                        <Input
                            placeholder="CC (separar por vírgulas)"
                            value={cc}
                            onChange={(e) => setCc(e.target.value)}
                            className={FIELD}
                        />
                    )}
                    {showBcc && (
                        <Input
                            placeholder="BCC (separar por vírgulas)"
                            value={bcc}
                            onChange={(e) => setBcc(e.target.value)}
                            className={FIELD}
                        />
                    )}
                    <div className="relative bg-white">
                        <Input
                            placeholder="Assunto"
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                            className={FIELD + " pr-[92px]"}
                        />
                        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                            <button
                                type="button"
                                onClick={() => setShowCc((v) => !v)}
                                className={`text-[11px] font-bold uppercase px-1.5 py-0.5 rounded transition-colors ${showCc ? "text-emerald-600 bg-emerald-50" : "text-slate-400 hover:text-slate-600"}`}
                            >
                                Cc
                            </button>
                            <button
                                type="button"
                                onClick={() => setShowBcc((v) => !v)}
                                className={`text-[11px] font-bold uppercase px-1.5 py-0.5 rounded transition-colors ${showBcc ? "text-emerald-600 bg-emerald-50" : "text-slate-400 hover:text-slate-600"}`}
                            >
                                Bcc
                            </button>
                        </div>
                    </div>
                </div>

                {/* (2) Contentor dos botões / ferramentas — flush ao contentor,
                    sem padding lateral nem superior. O "Enviar" vive nesta linha,
                    encostado à direita. */}
                <div className="bg-white rounded-[10px] shadow-sm border border-slate-100 overflow-hidden">
                    <div className="flex flex-wrap items-center gap-2 w-full">
                        <MultiFileUpload
                            value={attachments}
                            onChange={setAttachments}
                            folder="admin-messages"
                            layout="minimal"
                            showList={false}
                            className="!space-y-0"
                        />
                        <div className="w-px h-4 bg-slate-200"></div>
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
                        <div className="w-px h-4 bg-slate-200"></div>
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
                        <Button
                            onClick={handleSend}
                            disabled={isSending}
                            className="ml-auto py-[10px] px-6 rounded-[5px] bg-emerald-600 hover:bg-[#f97316] text-white font-bold uppercase tracking-wider text-[11px] shadow-sm transition-all"
                        >
                            <Send className="w-4 h-4 mr-2" />
                            {isSending ? "A enviar..." : "Enviar"}
                        </Button>
                    </div>
                </div>

                {/* (3) Contentor do compositor — sozinho */}
                <div className="bg-white rounded-[10px] shadow-sm border border-slate-100 p-3 space-y-3">
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
                        className="min-h-[500px]"
                    />
                </div>
            </div>

            {/* Barra lateral direita — destinatários (planos) e envio.
                Largura dinâmica: mais estreita em ecrãs médios, cresce nos grandes. */}
            <aside className="w-full lg:w-[280px] xl:w-[320px] lg:shrink-0 lg:sticky lg:top-4 self-start space-y-4">
                <div className="bg-white p-5 rounded-[10px] shadow-sm border border-slate-100 space-y-4">
                    <div className="flex justify-between items-center">
                        <label className="text-xs font-bold text-slate-500 uppercase">Destinatários (Planos)</label>
                        <div className="flex gap-1">
                            <button
                                onClick={() => setSelectedPlans(PLANS)}
                                className="text-[10px] uppercase font-bold text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 px-2 py-1 rounded"
                            >
                                Todos
                            </button>
                            <button
                                onClick={() => setSelectedPlans([])}
                                className="text-[10px] uppercase font-bold text-slate-400 hover:text-slate-600 hover:bg-slate-50 px-2 py-1 rounded"
                            >
                                Limpar
                            </button>
                        </div>
                    </div>

                    <div className="flex flex-col gap-1 rounded-[8px] border border-slate-100 bg-slate-50 p-2">
                        {PLANS.map(plan => (
                            <label
                                key={plan}
                                htmlFor={`plan-${plan}`}
                                className="flex items-center gap-2.5 px-2 py-1.5 rounded-md hover:bg-white cursor-pointer transition-colors"
                            >
                                <Checkbox
                                    id={`plan-${plan}`}
                                    checked={selectedPlans.includes(plan)}
                                    onChange={() => handlePlanToggle(plan)}
                                    className="data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600"
                                />
                                <span className="text-sm font-medium leading-none text-slate-700">{plan}</span>
                            </label>
                        ))}
                    </div>

                    <p className="text-[11px] text-slate-400 font-medium">
                        {selectedPlans.length === 0
                            ? "Sem grupos — usa CC/BCC para um envio simples"
                            : `${selectedPlans.length} grupo(s) selecionado(s)`}
                    </p>

                    {onCancel && (
                        <button
                            onClick={onCancel}
                            className="w-full text-center text-[11px] font-bold uppercase tracking-wider text-slate-400 hover:text-slate-600 py-1"
                        >
                            Cancelar
                        </button>
                    )}
                </div>
            </aside>

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
