"use client";

import { useRef, useState } from "react";
import { Loader2, ShieldCheck, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { compressImage } from "@/lib/utils";

// Envio de comprovativo de transferência bancária. Segue exactamente o
// mesmo caminho do /checkout e do /registo-empresa:
// POST /api/payment/comprovativo -> fica "pending" em payment_transactions
// -> aparece em /admin/pagamentos para aprovação manual. NUNCA confirma
// nada sozinho. Estilo pensado para os painéis escuros (emerald-950) do
// /destaque e do /cadastrar-empresa; o wrapper faz stopPropagation porque
// nessas páginas o cartão inteiro alterna o destaque ao clicar.
export function ReceiptUpload({
    amount,
    planName,
    itemType,
    onSent,
}: {
    amount: number;
    planName: string;
    itemType: "plan" | "highlight" | "both";
    onSent?: () => void;
}) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [file, setFile] = useState<File | null>(null);
    const [sending, setSending] = useState(false);
    const [sentAt, setSentAt] = useState<Date | null>(null);
    const [error, setError] = useState("");

    const pick = (e: React.ChangeEvent<HTMLInputElement>) => {
        const f = e.target.files?.[0];
        if (!f) return;
        if (!f.type.startsWith("image/") && f.type !== "application/pdf") {
            setError("Formato não suportado. Envie uma imagem (JPG, PNG, WebP) ou um PDF.");
            return;
        }
        setError("");
        setFile(f);
        setSentAt(null);
    };

    const send = async () => {
        if (!file) {
            setError("Anexe o comprovativo (imagem ou PDF) primeiro.");
            return;
        }
        setSending(true);
        setError("");
        try {
            let toSend: Blob = file;
            let filename = "comprovativo.pdf";
            if (file.type.startsWith("image/")) {
                toSend = await compressImage(file, { targetSizeKb: 50, maxWidth: 1600, maxHeight: 1600 });
                filename = "comprovativo.webp";
            }
            const form = new FormData();
            form.append("file", toSend, filename);
            form.append("amount", String(amount));
            form.append("planName", planName);
            form.append("itemType", itemType);
            const res = await fetch("/api/payment/comprovativo", { method: "POST", body: form });
            const data = await res.json().catch(() => ({}));
            if (!res.ok || !data.success) {
                setError(
                    data.error ||
                    "O servidor está a demorar a responder. O ficheiro continua anexado — tente enviar novamente."
                );
                return;
            }
            setSentAt(new Date());
            setFile(null);
            if (inputRef.current) inputRef.current.value = "";
            onSent?.();
        } catch {
            setError("O servidor está a demorar a responder. O ficheiro continua anexado — tente enviar novamente.");
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="space-y-2" onClick={(e) => e.stopPropagation()}>
            <input
                ref={inputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,application/pdf"
                className="hidden"
                onChange={pick}
            />
            <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="w-full h-9 px-3 text-xs font-bold text-emerald-100 bg-emerald-900/40 border border-dashed border-emerald-700 hover:border-emerald-500 transition-colors flex items-center justify-center gap-2 rounded-lg"
            >
                <Upload className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">{file ? file.name : "Anexar comprovativo (imagem ou PDF)"}</span>
            </button>
            <Button
                size="sm"
                disabled={sending}
                onClick={send}
                className="w-full h-9 text-xs font-black uppercase text-white bg-[#25D366] hover:bg-[#1ebd59] flex items-center justify-center gap-2"
            >
                {sending ? (
                    <><Loader2 className="w-3.5 h-3.5 animate-spin" /> A enviar...</>
                ) : sentAt ? (
                    "Enviar novo comprovativo"
                ) : (
                    "Enviar Comprovativo"
                )}
            </Button>
            {error && <p className="text-[10px] text-red-300 leading-relaxed">{error}</p>}
            {sentAt && !error && (
                <p className="text-[10px] text-emerald-300 leading-relaxed flex items-start gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                    Comprovativo enviado — a aguardar aprovação da equipa. Pode enviar outro se precisar.
                </p>
            )}
        </div>
    );
}
