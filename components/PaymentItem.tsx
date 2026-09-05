"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { Loader2, ShieldCheck, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { compressImage } from "@/lib/utils";

// Um item de cobrança independente (plano, destaque, ou os dois juntos) —
// M-Pesa confirma-se sozinho (com polling a /status, nunca no "pending"
// imediato); transferência/Visa NUNCA se auto-confirma, fica pendente até
// um admin aprovar em /admin/pagamentos — por isso o botão de enviar
// comprovativo fica sempre disponível (pode reenviar), nunca desaparece
// sozinho, só ao mudar de método. Partilhado entre /registo-empresa e
// /checkout para os dois terem exactamente o mesmo comportamento.
export function PaymentItem({
    label,
    amount,
    planName,
    itemType,
    onPaid,
}: {
    label: string;
    amount: number;
    planName: string;
    itemType: 'plan' | 'highlight' | 'both';
    onPaid: (method: 'mpesa' | 'visa') => void;
}) {
    const [method, setMethod] = useState<'mpesa' | 'visa' | null>(null);
    const [phone, setPhone] = useState("");
    const [processing, setProcessing] = useState(false);
    // O pedido ao M-Pesa demora até ~110s (é síncrono, espera o cliente
    // meter o PIN) e pode voltar "pendente" sem ter sido recusado nem
    // confirmado. NUNCA se pode tratar isso como pago — só entra aqui
    // quando o /status confirmar mesmo "completed" a seguir a perguntar
    // directamente ao M-Pesa. Sem isto, qualquer timeout era lido como
    // pagamento feito sem o cliente ter autorizado nada.
    const [waitingPin, setWaitingPin] = useState(false);
    const [confirmed, setConfirmed] = useState(false);
    const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

    useEffect(() => () => { if (pollRef.current) clearInterval(pollRef.current); }, []);

    const pollStatus = (reference: string) => {
        let attempts = 0;
        const MAX_ATTEMPTS = 40; // ~40 × 4s ≈ 2m40 — cobre a espera do backend (110s) com folga
        pollRef.current = setInterval(async () => {
            attempts++;
            try {
                const res = await fetch(`/api/payment/mpesa/status?reference=${encodeURIComponent(reference)}`);
                const data = await res.json();
                if (data.status === 'completed') {
                    if (pollRef.current) clearInterval(pollRef.current);
                    setWaitingPin(false);
                    setConfirmed(true);
                    onPaid('mpesa');
                } else if (data.status === 'failed') {
                    if (pollRef.current) clearInterval(pollRef.current);
                    setWaitingPin(false);
                    alert("O pagamento não foi confirmado (recusado ou cancelado no telemóvel). Pode tentar novamente.");
                } else if (attempts >= MAX_ATTEMPTS) {
                    if (pollRef.current) clearInterval(pollRef.current);
                    setWaitingPin(false);
                    alert("Ainda não recebemos a confirmação do M-Pesa. Se já autorizou no telemóvel, aguarde um pouco e tente pagar de novo para verificarmos o estado; caso contrário, tente outra vez.");
                }
            } catch {
                // Falha a consultar o estado não é o mesmo que o pagamento ter
                // falhado — tenta de novo no próximo ciclo.
            }
        }, 4000);
    };

    const handleMpesa = async () => {
        if (phone.length < 9) { alert("Insira um número de M-Pesa válido."); return; }
        setProcessing(true);
        try {
            const res = await fetch('/api/payment/mpesa', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    phoneNumber: phone.startsWith('258') ? phone : `258${phone}`,
                    amount: String(amount),
                    planName,
                })
            });
            const data = await res.json();
            if (!data.success) {
                alert(data.message || data.error || "Erro ao processar pagamento.");
                return;
            }
            if (data.pending) {
                // Pedido enviado mas ainda por confirmar (o IPG demorou a
                // responder, ou está mesmo à espera do PIN) — fica a
                // consultar o estado real; só marca como pago quando o
                // /status confirmar "completed".
                if (!data.reference) {
                    alert("Não foi possível confirmar o pagamento. Tente novamente.");
                    return;
                }
                setWaitingPin(true);
                pollStatus(data.reference);
            } else {
                // INS-0 imediato ou modo simulado (sem credenciais M-Pesa
                // configuradas) — já é uma confirmação real, não uma suposição.
                setConfirmed(true);
                onPaid('mpesa');
            }
        } catch {
            alert("Erro de conexão.");
        } finally {
            setProcessing(false);
        }
    };

    // Transferência bancária/Visa — ao contrário do M-Pesa, isto NUNCA se
    // auto-confirma: fica pendente até um humano aprovar em
    // /admin/pagamentos. Por isso este bloco nunca chama onPaid nem
    // "confirmed" — o botão fica sempre disponível (pode enviar de novo se
    // precisar), só desaparece se se mudar para o M-Pesa ao lado.
    const receiptInputRef = useRef<HTMLInputElement>(null);
    const [receiptFile, setReceiptFile] = useState<File | null>(null);
    const [submittingReceipt, setSubmittingReceipt] = useState(false);
    const [receiptSentAt, setReceiptSentAt] = useState<Date | null>(null);

    const handleReceiptSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const f = e.target.files?.[0];
        if (!f) return;
        if (!f.type.startsWith('image/') && f.type !== 'application/pdf') {
            alert("Formato não suportado. Envie uma imagem (JPG, PNG, WebP) ou um PDF.");
            return;
        }
        setReceiptFile(f);
        setReceiptSentAt(null);
    };

    const handleSendReceipt = async () => {
        if (!receiptFile) { alert("Anexe o comprovativo (imagem ou PDF) primeiro."); return; }
        setSubmittingReceipt(true);
        try {
            let toSend: Blob = receiptFile;
            let filename = "comprovativo";
            if (receiptFile.type.startsWith('image/')) {
                // Mesma compressão de sempre (<50kb) — um PDF não passa por
                // aqui, não há como comprimi-lo da mesma forma.
                toSend = await compressImage(receiptFile, { targetSizeKb: 50, maxWidth: 1600, maxHeight: 1600 });
                filename = "comprovativo.webp";
            } else {
                filename = "comprovativo.pdf";
            }
            const form = new FormData();
            form.append('file', toSend, filename);
            form.append('amount', String(amount));
            form.append('planName', planName);
            form.append('itemType', itemType);
            const res = await fetch('/api/payment/comprovativo', { method: 'POST', body: form });
            const data = await res.json();
            if (!data.success) {
                alert(data.error || "Erro ao enviar comprovativo.");
                return;
            }
            setReceiptSentAt(new Date());
            setReceiptFile(null);
            if (receiptInputRef.current) receiptInputRef.current.value = "";
        } catch {
            alert("Erro de conexão ao enviar o comprovativo.");
        } finally {
            setSubmittingReceipt(false);
        }
    };

    if (confirmed) {
        return (
            <div className="flex items-center justify-between gap-2 p-3 bg-emerald-500/20 border border-emerald-500/30" style={{ borderRadius: '8px' }}>
                <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-bold text-emerald-300">{label} — pago</span>
                </div>
                <span className="text-xs font-black text-emerald-300">{amount.toLocaleString()} Mt</span>
            </div>
        );
    }

    return (
        <div className="space-y-2 bg-emerald-950/20 p-3 border border-emerald-800" style={{ borderRadius: '8px' }}>
            <span className="text-xs font-bold text-white">{label}</span>
            <div className="flex items-center justify-between gap-3">
                <div className="flex gap-2 shrink-0">
                    <div onClick={() => setMethod('mpesa')}
                        className={`bg-white p-0 border flex items-center justify-center h-7 w-[42px] cursor-pointer overflow-hidden relative transition-all ${method === 'mpesa' ? 'border-[#E60000] ring-2 ring-[#E60000]/30' : 'border-slate-200 hover:border-[#E60000]'}`}>
                        <Image src="/assets/Mpesa.png" alt="M-Pesa" fill className="object-cover" />
                    </div>
                    <div onClick={() => setMethod('visa')}
                        className={`bg-white px-1.5 border flex items-center justify-center h-7 cursor-pointer overflow-hidden transition-all ${method === 'visa' ? 'border-[#1A1F71] ring-2 ring-[#1A1F71]/30' : 'border-slate-200 hover:border-[#1A1F71]'}`}>
                        <Image src="/assets/Visa.webp" alt="Visa" width={42} height={21} className="h-full w-auto object-contain" />
                    </div>
                </div>
                <span className="text-sm font-black text-white">{amount.toLocaleString()} Mt</span>
            </div>

            {method === 'mpesa' && (
                <div className="pt-2 space-y-2 border-t border-emerald-800/60">
                    <Input placeholder="258 84/85 xxx xxxx"
                        value={phone}
                        onChange={e => setPhone(e.target.value)}
                        disabled={waitingPin}
                        className="h-9 bg-emerald-900/50 border-emerald-800 text-white placeholder:text-emerald-600 text-xs font-mono" />
                    <Button size="sm" disabled={processing || waitingPin} onClick={handleMpesa}
                        className="w-full h-9 text-xs font-black uppercase text-white bg-[#E60000] hover:bg-[#cc0000] flex items-center justify-center gap-2">
                        {waitingPin ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> A aguardar PIN no telemóvel...</>
                            : processing ? 'A enviar pedido...'
                                : `Pagar ${amount.toLocaleString()} Mt`}
                    </Button>
                    {waitingPin && (
                        <p className="text-[10px] text-emerald-300 leading-relaxed">
                            Enviámos o pedido para {phone}. Confirme com o seu PIN M-Pesa no telemóvel — isto só fica pago depois de autorizar aí, pode demorar até 2 minutos.
                        </p>
                    )}
                </div>
            )}

            {method === 'visa' && (
                <div className="pt-2 space-y-2 border-t border-emerald-800/60">
                    <div className="text-[11px] text-emerald-100 bg-emerald-900/40 p-2 border border-emerald-500/20 space-y-1 font-mono" style={{ borderRadius: '8px' }}>
                        <div className="flex justify-between"><span className="text-emerald-400">NIB:</span><span className="select-all">003400000544672210195</span></div>
                        <div className="flex justify-between"><span className="text-emerald-400">Titular:</span><span>Visual Design</span></div>
                    </div>
                    <input ref={receiptInputRef} type="file" accept="image/jpeg,image/png,image/webp,application/pdf" className="hidden" onChange={handleReceiptSelect} />
                    <button type="button" onClick={() => receiptInputRef.current?.click()}
                        className="w-full h-9 px-3 text-xs font-bold text-emerald-100 bg-emerald-900/40 border border-dashed border-emerald-700 hover:border-emerald-500 transition-colors flex items-center justify-center gap-2"
                        style={{ borderRadius: '8px' }}>
                        <Upload className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">{receiptFile ? receiptFile.name : "Anexar comprovativo (imagem ou PDF)"}</span>
                    </button>
                    <Button size="sm" disabled={submittingReceipt} onClick={handleSendReceipt}
                        className="w-full h-9 text-xs font-black uppercase text-white bg-[#25D366] hover:bg-[#1ebd59] flex items-center justify-center gap-2">
                        {submittingReceipt ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> A enviar...</> : "Enviar Comprovativo"}
                    </Button>
                    {receiptSentAt && (
                        <p className="text-[10px] text-emerald-300 leading-relaxed flex items-start gap-1.5">
                            <ShieldCheck className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                            Comprovativo enviado — a aguardar aprovação da equipa. Pode enviar outro se precisar.
                        </p>
                    )}
                </div>
            )}
        </div>
    );
}
