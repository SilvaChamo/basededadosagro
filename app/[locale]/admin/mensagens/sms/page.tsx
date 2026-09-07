"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { MessageSquare, Send, Loader2, RefreshCw, Trash2, RotateCcw, X } from "lucide-react";
import { toast } from "sonner";
import { AdminListToolbar, AdminToolbarTitle } from "@/components/admin/AdminListToolbar";
import { useAdminTopBar } from "@/components/admin/AdminTopBar";
import { LogoutButton } from "@/components/LogoutButton";
import { normalizePlanName } from "@/lib/plan-fields";
import { PROVINCES } from "@/lib/constants";

interface SmsRow {
    id: string;
    direction: "inbound" | "outbound";
    phone: string;
    from_phone: string | null;
    content: string;
    status: string;
    detail: string | null;
    read_at: string | null;
    deleted_at?: string | null;
    created_at: string;
    name: string | null;
}
interface Subscriber {
    id: string;
    name: string;
    phone: string;
    province: string;
    district: string;
    plan: string;
}

type MsgTab = "recebidas" | "enviadas" | "eliminadas";
const SEGMENT = 160;
// Planos + grupos. Os últimos dois puxam de outras tabelas (source).
const AUDIENCE_OPTIONS = ["Todos", "Gratuito", "Básico", "Premium", "Business Vendedor", "Parceiro", "Profissionais", "Contactos"];
const SOURCE_BY_OPTION: Record<string, string> = { Profissionais: "profissionais", Contactos: "contactos" };
// Checkbox redondo, transparente sem selecção; só o estado activo tem cor.
const CHECKBOX = "appearance-none h-4 w-4 shrink-0 rounded-full border border-slate-300 bg-transparent cursor-pointer transition-colors checked:border-emerald-600 checked:bg-emerald-600 checked:shadow-[inset_0_0_0_3px_#fff] disabled:opacity-40";

function timeAgo(iso: string) {
    const diff = Date.now() - new Date(iso).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 1) return "agora";
    if (m < 60) return `${m} min`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h} h`;
    return new Date(iso).toLocaleDateString("pt-PT", { day: "2-digit", month: "2-digit" });
}

const STATUS_META: Record<string, { label: string; cls: string }> = {
    pending: { label: "pendente", cls: "bg-amber-50 text-amber-700" },
    sent: { label: "enviado", cls: "bg-blue-50 text-blue-700" },
    delivered: { label: "entregue", cls: "bg-emerald-50 text-emerald-700" },
    failed: { label: "falhou", cls: "bg-red-50 text-red-700" },
    expired: { label: "expirou", cls: "bg-slate-100 text-slate-500" },
    sent_mock: { label: "teste", cls: "bg-slate-100 text-slate-500" },
};

export default function AdminSmsPage() {
    useAdminTopBar("");

    // ---- Compor ----
    const [audience, setAudience] = useState<"subscribers" | "manual">("subscribers");
    const [message, setMessage] = useState("");
    const [numbers, setNumbers] = useState("");
    const [province, setProvince] = useState("");
    const [plan, setPlan] = useState("Todos");
    const [sending, setSending] = useState(false);

    const [subs, setSubs] = useState<Subscriber[]>([]);
    const [subsLoading, setSubsLoading] = useState(false);

    const source = SOURCE_BY_OPTION[plan]; // "profissionais" | "contactos" | undefined (=planos)

    const loadSubs = useCallback(async () => {
        setSubsLoading(true);
        try {
            const qs = new URLSearchParams();
            if (province) qs.set("province", province);
            if (source) qs.set("source", source);
            const r = await fetch(`/api/sms/subscribers?${qs}`).then((x) => x.json());
            setSubs(r.subscribers || []);
        } catch {
            toast.error("Não foi possível carregar a lista.");
        } finally {
            setSubsLoading(false);
        }
    }, [province, source]);

    useEffect(() => {
        if (audience === "subscribers") loadSubs();
    }, [audience, loadSubs]);

    const filteredSubs = useMemo(() => {
        // Grupos (Profissionais/Contactos) já vêm filtrados do servidor.
        if (source || plan === "Todos") return subs;
        return subs.filter((s) => normalizePlanName(s.plan) === plan);
    }, [subs, plan, source]);

    const segments = message.length === 0 ? 0 : Math.ceil(message.length / SEGMENT);

    const send = async () => {
        if (!message.trim()) return toast.error("Escreva a mensagem.");
        setSending(true);
        try {
            let payload: Record<string, unknown>;
            if (audience === "manual") {
                payload = { message: message.trim(), mode: "manual", numbers };
            } else {
                // Destinatários = filtro acima (plano/grupo + província), sem escolha individual.
                const phones = filteredSubs.map((s) => s.phone).filter(Boolean);
                if (phones.length === 0) {
                    toast.error("Nenhum contacto neste filtro.");
                    setSending(false);
                    return;
                }
                payload = { message: message.trim(), mode: "selected", phones };
            }
            const res = await fetch("/api/sms/send", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Falha no envio.");
            toast.success(
                data.dryRun
                    ? `Modo de teste: ${data.total} SMS simulados (ver log do servidor).`
                    : `${data.sent} aceites${data.failed ? `, ${data.failed} rejeitados` : ""}. Estado real nas Enviadas.`,
            );
            setMessage("");
            if (audience === "manual") setNumbers("");
            setTab("enviadas");
            loadMsgs(true);
        } catch (e) {
            toast.error(e instanceof Error ? e.message : "Falha no envio.");
        } finally {
            setSending(false);
        }
    };

    // ---- Mensagens ----
    const [tab, setTab] = useState<MsgTab>("enviadas");
    const [msgs, setMsgs] = useState<SmsRow[]>([]);
    const [msgsLoading, setMsgsLoading] = useState(true);
    const [sel, setSel] = useState<Set<string>>(new Set());

    // Popup com o histórico de conversa de um contacto
    const [threadOpen, setThreadOpen] = useState(false);
    const [threadLoading, setThreadLoading] = useState(false);
    const [thread, setThread] = useState<{ name: string | null; phone: string; messages: SmsRow[] } | null>(null);
    const [reply, setReply] = useState("");
    const [replying, setReplying] = useState(false);

    const loadMsgs = useCallback(async (silent = false) => {
        if (!silent) setMsgsLoading(true);
        try {
            const r = await fetch(`/api/sms/messages?tab=${tab}&limit=150`).then((x) => x.json());
            setMsgs(r.messages || []);
            setSel(new Set());
        } catch {
            /* silencioso */
        } finally {
            setMsgsLoading(false);
        }
    }, [tab]);

    useEffect(() => {
        loadMsgs();
        const id = setInterval(() => loadMsgs(true), 20000);
        return () => clearInterval(id);
    }, [loadMsgs]);

    const allMsgsSel = msgs.length > 0 && msgs.every((m) => sel.has(m.id));
    const toggleAllMsgs = () => setSel(allMsgsSel ? new Set() : new Set(msgs.map((m) => m.id)));
    const toggleMsg = (id: string) => {
        const next = new Set(sel);
        next.has(id) ? next.delete(id) : next.add(id);
        setSel(next);
    };

    const fetchThread = async (phone: string, markRead = true) => {
        const r = await fetch(`/api/sms/thread?phone=${encodeURIComponent(phone)}`).then((x) => x.json());
        if (r.error) throw new Error(r.error);
        setThread(r);
        if (markRead) {
            const unread = (r.messages || []).filter((x: SmsRow) => x.direction === "inbound" && !x.read_at).map((x: SmsRow) => x.id);
            if (unread.length) {
                fetch("/api/sms/messages/read", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ ids: unread }),
                }).catch(() => {});
                setMsgs((cur) => cur.map((x) => (unread.includes(x.id) ? { ...x, read_at: new Date().toISOString() } : x)));
            }
        }
    };

    const openThread = async (m: SmsRow) => {
        setThreadOpen(true);
        setThread(null);
        setReply("");
        setThreadLoading(true);
        try {
            await fetchThread(m.phone);
        } catch (e) {
            toast.error(e instanceof Error ? e.message : "Não foi possível abrir a conversa.");
            setThreadOpen(false);
        } finally {
            setThreadLoading(false);
        }
    };
    const closeThread = () => { setThreadOpen(false); setThread(null); setReply(""); };

    const sendReply = async () => {
        if (!reply.trim() || !thread) return;
        setReplying(true);
        try {
            const res = await fetch("/api/sms/send", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: reply.trim(), mode: "manual", numbers: thread.phone }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Falha no envio.");
            toast.success(data.dryRun ? "Modo de teste (ver log do servidor)." : "Resposta enviada.");
            setReply("");
            await fetchThread(thread.phone, false);
            loadMsgs(true);
        } catch (e) {
            toast.error(e instanceof Error ? e.message : "Falha no envio.");
        } finally {
            setReplying(false);
        }
    };

    const applyDelete = async (mode: "soft" | "hard" | "restore") => {
        if (sel.size === 0) return;
        const verb = mode === "soft" ? "eliminar" : mode === "hard" ? "eliminar definitivamente" : "restaurar";
        if (mode !== "restore" && !confirm(`Tens a certeza que queres ${verb} ${sel.size} mensagem(ns)?`)) return;
        try {
            const res = await fetch("/api/sms/messages/delete", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ids: [...sel], mode }),
            });
            if (!res.ok) throw new Error((await res.json()).error || "Falhou.");
            toast.success(`${sel.size} mensagem(ns): ${verb}.`);
            loadMsgs(true);
        } catch (e) {
            toast.error(e instanceof Error ? e.message : "Falhou.");
        }
    };

    const TAB_BTN = (t: MsgTab, label: string) => (
        <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-3 py-1.5 text-[11px] font-bold uppercase tracking-wide rounded-md transition-all ${tab === t ? "bg-white text-emerald-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
        >
            {label}
        </button>
    );

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
                {/* ================= ESQUERDA — compor ================= */}
                <div className="bg-white rounded-xl border border-slate-100 p-5 shadow-sm space-y-4">
                    <div className="flex items-center gap-2 text-slate-800">
                        <MessageSquare className="w-5 h-5 text-emerald-600" />
                        <h2 className="text-sm font-black uppercase tracking-wider">Compor SMS</h2>
                    </div>

                    <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-[8px]">
                        <button type="button" onClick={() => setAudience("subscribers")} className={`text-[11px] font-bold uppercase tracking-wide py-2 rounded-[8px] transition-all ${audience === "subscribers" ? "bg-white text-emerald-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>Inscritos</button>
                        <button type="button" onClick={() => setAudience("manual")} className={`text-[11px] font-bold uppercase tracking-wide py-2 rounded-[8px] transition-all ${audience === "manual" ? "bg-white text-emerald-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>Números manuais</button>
                    </div>

                    {audience === "subscribers" ? (
                        <div className="space-y-2">
                            <div className="grid grid-cols-2 gap-2">
                                <select
                                    value={plan}
                                    onChange={(e) => setPlan(e.target.value)}
                                    className="h-9 rounded-[8px] border border-slate-200 bg-white px-2 text-[13px] text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                                >
                                    {AUDIENCE_OPTIONS.map((p) => (
                                        <option key={p} value={p}>{p === "Todos" ? "Todos os contactos" : p}</option>
                                    ))}
                                </select>
                                <select
                                    value={province}
                                    onChange={(e) => setProvince(e.target.value)}
                                    className="h-9 rounded-[8px] border border-slate-200 bg-white px-2 text-[13px] text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                                >
                                    <option value="">Todas as províncias</option>
                                    {PROVINCES.map((p) => <option key={p} value={p}>{p}</option>)}
                                </select>
                            </div>
                            <div className="rounded-[8px] border border-slate-200 bg-slate-50 px-3 py-2.5 text-[12px] text-slate-600 flex items-center gap-2">
                                {subsLoading ? (
                                    <><Loader2 className="w-3.5 h-3.5 animate-spin text-slate-300" /> A calcular…</>
                                ) : (
                                    <>
                                        <span className="font-black text-slate-800">{filteredSubs.length}</span>
                                        contacto(s) vão receber a mensagem
                                        {filteredSubs.length > 300 && <span className="text-amber-600 font-semibold">· máx. 300 por envio</span>}
                                    </>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-1.5">
                            <textarea placeholder="Um número por linha (ex: +258 84 000 0000)" value={numbers} onChange={(e) => setNumbers(e.target.value)} rows={4} className="w-full rounded-[8px] border border-slate-200 bg-white p-3 text-[13px] text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30" />
                            <p className="text-[11px] text-slate-400">Sem indicativo assume-se +258 (Moçambique).</p>
                        </div>
                    )}

                    <div className="space-y-1.5">
                        <textarea placeholder="Escreva a mensagem..." value={message} onChange={(e) => setMessage(e.target.value)} maxLength={700} className="w-full min-h-[400px] resize-y rounded-[8px] border border-slate-200 bg-white p-3 text-[13px] text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30" />
                        <div className="flex justify-between text-[11px] text-slate-400">
                            <span>{message.length} caracteres</span>
                            <span>{segments} SMS{segments === 1 ? "" : "s"} por destinatário</span>
                        </div>
                    </div>

                    <div className="flex">
                        <Button onClick={send} disabled={sending} className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2 text-[11px] font-black uppercase tracking-wider h-10 px-8 rounded-[8px]">
                            {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                            {sending ? "A enviar..." : "Enviar"}
                        </Button>
                    </div>
                </div>

                {/* ================= DIREITA — mensagens ================= */}
                <div className="bg-white rounded-xl border border-slate-100 p-5 shadow-sm space-y-3">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
                            {TAB_BTN("recebidas", "Recebidas")}
                            {TAB_BTN("enviadas", "Enviadas")}
                            {TAB_BTN("eliminadas", "Eliminadas")}
                        </div>
                        <button onClick={() => loadMsgs()} className="text-slate-400 hover:text-emerald-600 transition-colors" title="Actualizar">
                            <RefreshCw className="w-4 h-4" />
                        </button>
                    </div>

                    {/* barra de gestão: botões primeiro, checkbox (só o checkbox) no fim */}
                    <div className="flex items-center gap-3 text-[12px]">
                        {tab === "eliminadas" ? (
                            <>
                                <button onClick={() => applyDelete("restore")} disabled={sel.size === 0} className="flex items-center gap-1 text-emerald-600 disabled:text-slate-300 font-bold">
                                    <RotateCcw className="w-3.5 h-3.5" /> Restaurar
                                </button>
                                <button onClick={() => applyDelete("hard")} disabled={sel.size === 0} className="flex items-center gap-1 text-red-600 disabled:text-slate-300 font-bold">
                                    <Trash2 className="w-3.5 h-3.5" /> Eliminar definitivamente
                                </button>
                            </>
                        ) : (
                            <button onClick={() => applyDelete("soft")} disabled={sel.size === 0} className="flex items-center gap-1 text-red-600 disabled:text-slate-300 font-bold">
                                <Trash2 className="w-3.5 h-3.5" /> Eliminar
                            </button>
                        )}
                        {sel.size > 0 && <span className="text-slate-400">{sel.size} selecionada(s)</span>}
                        <div className="flex-1" />
                        <input type="checkbox" checked={allMsgsSel} onChange={toggleAllMsgs} disabled={msgs.length === 0} className={CHECKBOX} title="Selecionar tudo" />
                    </div>

                    {msgsLoading ? (
                        <div className="py-12 flex justify-center"><Loader2 className="w-5 h-5 animate-spin text-slate-300" /></div>
                    ) : msgs.length === 0 ? (
                        <div className="py-12 text-center text-[12px] text-slate-400">
                            {tab === "recebidas" ? "Sem SMS recebidas." : tab === "eliminadas" ? "Nada eliminado." : "Sem SMS enviadas."}
                        </div>
                    ) : (
                        <ul className="divide-y divide-slate-100 max-h-[560px] overflow-y-auto">
                            {msgs.map((m) => {
                                const meta = STATUS_META[m.status];
                                const unread = m.direction === "inbound" && !m.read_at;
                                const who = m.name || m.phone;
                                return (
                                    <li key={m.id} className="flex items-start gap-2 py-2.5">
                                        <button onClick={() => openThread(m)} className="min-w-0 flex-1 text-left">
                                            <div className="flex items-center gap-2">
                                                <span className={`truncate text-[13px] ${unread ? "font-bold text-slate-900" : "font-semibold text-slate-700"}`}>{who}</span>
                                                {meta && (
                                                    <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded shrink-0 ${meta.cls}`}>{meta.label}</span>
                                                )}
                                                <span className="ml-auto text-[11px] text-slate-300 shrink-0">{timeAgo(m.created_at)}</span>
                                            </div>
                                            <div className={`truncate text-[12px] mt-0.5 ${unread ? "font-semibold text-slate-700" : "text-slate-400"}`}>{m.content}</div>
                                        </button>
                                        <input type="checkbox" checked={sel.has(m.id)} onChange={() => toggleMsg(m.id)} className={`${CHECKBOX} mt-1`} />
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                </div>
            </div>

            {/* ===== Popup: conversa com o contacto (ver + responder) ===== */}
            {threadOpen && (
                <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/40 p-4" onClick={closeThread}>
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-xl h-[75vh] max-h-[85vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
                            <div className="min-w-0">
                                <p className="text-base font-black text-slate-800 truncate">{thread?.name || thread?.phone || "Contacto"}</p>
                                <p className="text-[12px] text-slate-400">{thread?.name ? thread.phone : "Conversa"}</p>
                            </div>
                            <button onClick={closeThread} className="text-slate-400 hover:text-slate-700 shrink-0"><X className="w-5 h-5" /></button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-5 space-y-2 bg-slate-50">
                            {threadLoading ? (
                                <div className="py-12 flex justify-center"><Loader2 className="w-5 h-5 animate-spin text-slate-300" /></div>
                            ) : (thread?.messages || []).length === 0 ? (
                                <p className="text-center text-[13px] text-slate-400 py-12">Sem mensagens ainda. Escreve abaixo para começar.</p>
                            ) : (
                                thread!.messages.map((t) => {
                                    const mine = t.direction === "outbound";
                                    const tm = STATUS_META[t.status];
                                    return (
                                        <div key={t.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                                            <div className={`max-w-[78%] rounded-2xl px-3.5 py-2 text-[13px] whitespace-pre-wrap break-words shadow-sm ${mine ? "bg-emerald-600 text-white rounded-br-sm" : "bg-white border border-slate-200 text-slate-800 rounded-bl-sm"} ${t.deleted_at ? "opacity-50" : ""}`}>
                                                {t.content}
                                                <div className={`mt-1 text-[10px] ${mine ? "text-emerald-100" : "text-slate-400"}`}>
                                                    {new Date(t.created_at).toLocaleString("pt-PT", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}
                                                    {mine && tm ? ` · ${tm.label}` : ""}
                                                    {t.deleted_at ? " · eliminada" : ""}
                                                </div>
                                                {t.detail && <div className={`text-[10px] mt-0.5 ${mine ? "text-red-100" : "text-red-500"}`}>{t.detail}</div>}
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>

                        {/* responder à mesma pessoa */}
                        <div className="border-t border-slate-100 p-3 flex items-end gap-2">
                            <textarea
                                placeholder={`Responder a ${thread?.name || thread?.phone || ""}...`}
                                value={reply}
                                onChange={(e) => setReply(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendReply(); }
                                }}
                                rows={1}
                                maxLength={700}
                                className="flex-1 resize-none rounded-lg border border-slate-200 bg-white px-3 py-2 text-[13px] text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 max-h-28"
                            />
                            <Button
                                onClick={sendReply}
                                disabled={replying || !reply.trim()}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white h-10 px-4 shrink-0"
                            >
                                {replying ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
