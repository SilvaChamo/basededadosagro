"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RichTextEditor } from "@/components/RichTextEditor";
import { Send, FileText, FileArchive, File as FileIcon, X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { MultiFileUpload } from "@/components/admin/MultiFileUpload";
import { SenderEmailSelector } from "@/components/admin/SenderEmailSelector";

// Compositor de e-mail INDIVIDUAL (Painel -> Interações -> E-mails). Envia
// um-a-um com Para / Assunto / CC / BCC, sem criar campanha. As campanhas
// por grupos de planos continuam em Campanhas (MessageComposer).

const FIELD = "h-10 rounded-none border-0 bg-white px-3 text-sm";

interface EmailComposerProps {
    onSent?: () => void;
    onCancel?: () => void;
    initialTo?: string;
    initialSubject?: string;
    initialContent?: string;
    submitLabel?: string;
}

export function EmailComposer({ onSent, onCancel, initialTo = "", initialSubject = "", initialContent = "", submitLabel = "Enviar" }: EmailComposerProps) {
    const [to, setTo] = useState(initialTo);
    const [subject, setSubject] = useState(initialSubject);
    const [content, setContent] = useState(initialContent);
    const [cc, setCc] = useState("");
    const [bcc, setBcc] = useState("");
    const [showCc, setShowCc] = useState(false);
    const [showBcc, setShowBcc] = useState(false);
    const [senderEmail, setSenderEmail] = useState("admin@basededadosagro.com");
    const [attachments, setAttachments] = useState<string[]>([]);
    const [isSending, setIsSending] = useState(false);
    // O RichTextEditor só lê o value uma vez (ao montar); mudar a key força
    // um remonte para limpar o corpo depois de enviar.
    const [editorKey, setEditorKey] = useState(0);

    const buildHtml = () => {
        let out = content;
        if (attachments.length > 0) {
            out += `<br/><div style="margin-top:20px;padding-top:20px;border-top:1px solid #eee;"><strong>Anexos:</strong><ul style="list-style:none;padding:0;margin-top:8px;">`;
            attachments.forEach((url) => {
                const fileName = url.split("/").pop() || "Documento";
                out += `<li style="margin-bottom:8px;"><a href="${url}" target="_blank" style="color:#2563eb;text-decoration:underline;">📎 ${fileName}</a></li>`;
            });
            out += `</ul></div>`;
        }
        return out;
    };

    const handleSend = async () => {
        if (!to.trim() && !cc.trim() && !bcc.trim()) {
            toast.error("Indica pelo menos um destinatário (Para, CC ou BCC).");
            return;
        }
        if (!subject.trim()) return toast.error("Escreve o assunto.");
        if (!content.trim()) return toast.error("Escreve a mensagem.");

        setIsSending(true);
        try {
            const res = await fetch("/api/emails/send", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    to, cc, bcc,
                    subject: subject.trim(),
                    html: buildHtml(),
                    attachments,
                    replyTo: senderEmail,
                }),
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error(data.error || "Falha no envio.");
            toast.success("E-mail enviado.");
            setTo(""); setSubject(""); setContent(""); setCc(""); setBcc("");
            setAttachments([]); setShowCc(false); setShowBcc(false);
            setEditorKey((k) => k + 1);
            onSent?.();
        } catch (e) {
            toast.error(e instanceof Error ? e.message : "Falha no envio.");
        } finally {
            setIsSending(false);
        }
    };

    return (
        <div className="flex flex-col gap-4">
            {/* Campos colados, separados só pela linha */}
            <div className="bg-white rounded-[8px] shadow-sm border border-slate-200 overflow-hidden divide-y divide-slate-200">
                <SenderEmailSelector value={senderEmail} onChange={setSenderEmail} />
                <Input placeholder="Para (separar por vírgulas)" value={to} onChange={(e) => setTo(e.target.value)} className={FIELD} />
                {showCc && (
                    <Input placeholder="CC (separar por vírgulas)" value={cc} onChange={(e) => setCc(e.target.value)} className={FIELD} />
                )}
                {showBcc && (
                    <Input placeholder="BCC (separar por vírgulas)" value={bcc} onChange={(e) => setBcc(e.target.value)} className={FIELD} />
                )}
                <div className="relative bg-white">
                    <Input placeholder="Assunto" value={subject} onChange={(e) => setSubject(e.target.value)} className={FIELD + " pr-[92px]"} />
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                        <button type="button" onClick={() => setShowCc((v) => !v)} className={`text-[11px] font-bold uppercase px-1.5 py-0.5 rounded-[8px] transition-colors ${showCc ? "text-emerald-600 bg-emerald-50" : "text-slate-400 hover:text-slate-600"}`}>Cc</button>
                        <button type="button" onClick={() => setShowBcc((v) => !v)} className={`text-[11px] font-bold uppercase px-1.5 py-0.5 rounded-[8px] transition-colors ${showBcc ? "text-emerald-600 bg-emerald-50" : "text-slate-400 hover:text-slate-600"}`}>Bcc</button>
                    </div>
                </div>
            </div>

            {/* Linha de acções */}
            <div className="flex flex-wrap items-center gap-2 w-full">
                <MultiFileUpload
                    value={attachments}
                    onChange={setAttachments}
                    folder="admin-emails"
                    layout="minimal"
                    showList={false}
                    className="!space-y-0"
                />
                <div className="w-full sm:w-auto sm:ml-auto flex items-center gap-2">
                    {onCancel && (
                        <button
                            type="button"
                            onClick={onCancel}
                            className="px-4 py-[10px] rounded-[4px] text-[11px] font-bold uppercase tracking-wider text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                        >
                            Cancelar
                        </button>
                    )}
                    <Button
                        onClick={handleSend}
                        disabled={isSending}
                        className="flex-1 sm:flex-none justify-center py-[10px] px-6 rounded-[4px] bg-emerald-600 hover:bg-emerald-700 text-white font-bold uppercase tracking-wider text-[11px]"
                    >
                        {isSending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
                        {isSending ? "A enviar..." : submitLabel}
                    </Button>
                </div>
            </div>

            {/* Compositor — barra de ferramentas encostada às bordas (sem padding). */}
            <div className="bg-white rounded-[8px] shadow-sm border border-slate-100 overflow-hidden">
                {attachments.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3 p-3 border-b border-slate-100">
                        {attachments.map((url, index) => (
                            <div key={index} className="relative group bg-slate-50 border border-slate-200 rounded-[8px] p-3 flex flex-col gap-2 hover:border-emerald-500 transition-colors">
                                <div className="w-full h-24 bg-white rounded border border-slate-100 flex items-center justify-center overflow-hidden">
                                    {url.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img src={url} alt="anexo" className="w-full h-full object-cover" />
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
                                        {url.split("/").pop()}
                                    </a>
                                    <button onClick={() => setAttachments(attachments.filter((a) => a !== url))} className="text-slate-400 hover:text-red-500 transition-colors" title="Remover anexo">
                                        <X className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                <RichTextEditor key={editorKey} value={content} onChange={setContent} placeholder="Escreva a mensagem aqui..." className="min-h-[400px]" toolbarNoWrap />
            </div>
        </div>
    );
}
