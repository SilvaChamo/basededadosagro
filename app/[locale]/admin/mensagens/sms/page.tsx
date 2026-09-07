"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageSquare, Send, Inbox, RefreshCw, Loader2, ArrowDownLeft, ArrowUpRight } from "lucide-react";
import { toast } from "sonner";
import { AdminListToolbar, AdminToolbarTitle } from "@/components/admin/AdminListToolbar";
import { useAdminTopBar } from "@/components/admin/AdminTopBar";
import { LogoutButton } from "@/components/LogoutButton";

interface SmsRow {
    id: string;
    direction: "inbound" | "outbound";
    phone: string;
    from_phone: string | null;
    content: string;
    status: string;
    created_at: string;
}

function timeAgo(iso: string) {
    const diff = Date.now() - new Date(iso).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 1) return "agora";
    if (m < 60) return `há ${m} min`;
    const h = Math.floor(m / 60);
    if (h < 24) return `há ${h} h`;
    return new Date(iso).toLocaleDateString("pt-PT", { day: "2-digit", month: "2-digit" });
}

const SEGMENT = 160;

export default function AdminSmsPage() {
    useAdminTopBar("");

    const [mode, setMode] = useState<"subscribers" | "manual">("subscribers");
    const [message, setMessage] = useState("");
    const [province, setProvince] = useState("");
    const [district, setDistrict] = useState("");
    const [numbers, setNumbers] = useState("");
    const [sending, setSending] = useState(false);
    const [lastResult, setLastResult] = useState<{ total: number; sent: number; failed: number; dryRun: boolean } | null>(null);

    const [inbound, setInbound] = useState<SmsRow[]>([]);
    const [outbound, setOutbound] = useState<SmsRow[]>([]);
    const [loadingMsgs, setLoadingMsgs] = useState(true);

    const load = useCallback(async (silent = false) => {
        if (!silent) setLoadingMsgs(true);
        try {
            const [inRes, outRes] = await Promise.all([
                fetch("/api/sms/messages?direction=inbound&limit=50").then((r) => r.json()),
                fetch("/api/sms/messages?direction=outbound&limit=30").then((r) => r.json()),
            ]);
            setInbound(inRes.messages || []);
            setOutbound(outRes.messages || []);
        } catch {
            /* silencioso */
        } finally {
            setLoadingMsgs(false);
        }
    }, []);

    useEffect(() => {
        load();
        const id = setInterval(() => load(true), 20000);
        return () => clearInterval(id);
    }, [load]);

    const send = async () => {
        if (!message.trim()) {
            toast.error("Escreva a mensagem.");
            return;
        }
        setSending(true);
        setLastResult(null);
        try {
            const res = await fetch("/api/sms/send", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    message: message.trim(),
                    mode,
                    province: mode === "subscribers" ? province : undefined,
                    district: mode === "subscribers" ? district : undefined,
                    numbers: mode === "manual" ? numbers : undefined,
                }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Falha no envio.");

            setLastResult(data);
            toast.success(
                data.dryRun
                    ? `Modo de teste: ${data.total} SMS simulados (ver log do servidor).`
                    : `${data.sent} enviados${data.failed ? `, ${data.failed} falharam` : ""}.`,
            );
            if (mode === "manual") setNumbers("");
            setMessage("");
            load(true);
        } catch (e) {
            toast.error(e instanceof Error ? e.message : "Falha no envio.");
        } finally {
            setSending(false);
        }
    };

    const segments = message.length === 0 ? 0 : Math.ceil(message.length / SEGMENT);

    return (
        <div className="w-full max-w-full space-y-8">
            <AdminListToolbar className="flex-nowrap">
                <AdminToolbarTitle title="Enviar SMS" />
                <div className="flex items-center gap-2 shrink-0">
                    <LogoutButton
                        variant="outline"
                        className="h-9 px-4 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-red-600 border-slate-200"
                        showIcon
                        label="Sair"
                    />
                </div>
            </AdminListToolbar>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* ---- Compor ---- */}
                <div className="bg-white rounded-xl border border-slate-100 p-5 shadow-sm space-y-4">
                    <div className="flex items-center gap-2 text-slate-800">
                        <MessageSquare className="w-5 h-5 text-emerald-600" />
                        <h2 className="text-sm font-black uppercase tracking-wider">Compor SMS</h2>
                    </div>

                    {/* destinatários */}
                    <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-lg">
                        <button
                            type="button"
                            onClick={() => setMode("subscribers")}
                            className={`text-[11px] font-bold uppercase tracking-wide py-2 rounded-md transition-all ${mode === "subscribers" ? "bg-white text-emerald-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
                        >
                            Inscritos
                        </button>
                        <button
                            type="button"
                            onClick={() => setMode("manual")}
                            className={`text-[11px] font-bold uppercase tracking-wide py-2 rounded-md transition-all ${mode === "manual" ? "bg-white text-emerald-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
                        >
                            Números manuais
                        </button>
                    </div>

                    {mode === "subscribers" ? (
                        <div className="space-y-2">
                            <p className="text-[11px] text-slate-400">
                                Vai para quem activou alertas SMS no perfil. Filtros opcionais:
                            </p>
                            <div className="grid grid-cols-2 gap-2">
                                <Input placeholder="Província (opcional)" value={province} onChange={(e) => setProvince(e.target.value)} className="h-9 text-[13px]" />
                                <Input placeholder="Distrito (opcional)" value={district} onChange={(e) => setDistrict(e.target.value)} className="h-9 text-[13px]" />
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-1.5">
                            <textarea
                                placeholder="Um número por linha (ex: +258 84 000 0000)"
                                value={numbers}
                                onChange={(e) => setNumbers(e.target.value)}
                                rows={4}
                                className="w-full rounded-lg border border-slate-200 bg-white p-3 text-[13px] text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                            />
                            <p className="text-[11px] text-slate-400">Sem indicativo assume-se +258 (Moçambique).</p>
                        </div>
                    )}

                    {/* mensagem */}
                    <div className="space-y-1.5">
                        <textarea
                            placeholder="Escreva a mensagem..."
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            rows={5}
                            maxLength={700}
                            className="w-full rounded-lg border border-slate-200 bg-white p-3 text-[13px] text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                        />
                        <div className="flex justify-between text-[11px] text-slate-400">
                            <span>{message.length} caracteres</span>
                            <span>{segments} SMS{segments === 1 ? "" : "s"} por destinatário</span>
                        </div>
                    </div>

                    <Button
                        onClick={send}
                        disabled={sending}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white gap-2 text-[11px] font-black uppercase tracking-wider h-10"
                    >
                        {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                        {sending ? "A enviar..." : "Enviar"}
                    </Button>

                    {lastResult && (
                        <div className="text-[12px] text-slate-600 bg-slate-50 border border-slate-100 rounded-lg p-3">
                            {lastResult.dryRun && <span className="font-bold text-orange-600">Modo de teste — </span>}
                            {lastResult.total} destinatário(s): <b className="text-emerald-700">{lastResult.sent}</b> enviados
                            {lastResult.failed > 0 && <>, <b className="text-red-600">{lastResult.failed}</b> falharam</>}.
                        </div>
                    )}

                    {/* últimos envios */}
                    {outbound.length > 0 && (
                        <div className="pt-2 border-t border-slate-100">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Últimos envios</p>
                            <ul className="space-y-1.5 max-h-48 overflow-y-auto">
                                {outbound.map((m) => (
                                    <li key={m.id} className="flex items-start gap-2 text-[12px]">
                                        <ArrowUpRight className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${m.status === "failed" ? "text-red-500" : "text-emerald-500"}`} />
                                        <span className="text-slate-500 shrink-0 w-24 truncate">{m.phone}</span>
                                        <span className="text-slate-700 flex-1 truncate">{m.content}</span>
                                        <span className="text-slate-300 shrink-0">{timeAgo(m.created_at)}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>

                {/* ---- Recebidas ---- */}
                <div className="bg-white rounded-xl border border-slate-100 p-5 shadow-sm space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-slate-800">
                            <Inbox className="w-5 h-5 text-emerald-600" />
                            <h2 className="text-sm font-black uppercase tracking-wider">SMS recebidas</h2>
                        </div>
                        <button
                            onClick={() => load()}
                            className="text-slate-400 hover:text-emerald-600 transition-colors"
                            title="Actualizar"
                        >
                            <RefreshCw className="w-4 h-4" />
                        </button>
                    </div>

                    {loadingMsgs ? (
                        <div className="py-12 flex justify-center"><Loader2 className="w-5 h-5 animate-spin text-slate-300" /></div>
                    ) : inbound.length === 0 ? (
                        <div className="py-12 text-center text-[12px] text-slate-400">
                            Ainda sem SMS recebidas.<br />
                            (É preciso configurar o webhook no httpSMS — ver instruções abaixo.)
                        </div>
                    ) : (
                        <ul className="space-y-2 max-h-[520px] overflow-y-auto">
                            {inbound.map((m) => (
                                <li key={m.id} className="border border-slate-100 rounded-lg p-3">
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="flex items-center gap-1.5 text-[12px] font-bold text-slate-700">
                                            <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-500" />
                                            {m.phone}
                                        </span>
                                        <span className="text-[11px] text-slate-300">{timeAgo(m.created_at)}</span>
                                    </div>
                                    <p className="text-[13px] text-slate-800 whitespace-pre-wrap break-words">{m.content}</p>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
}
