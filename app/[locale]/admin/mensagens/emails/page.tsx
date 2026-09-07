"use client";

import { useState, useEffect, useCallback } from "react";
import { Mail, Loader2, RefreshCw, Trash2, RotateCcw, X } from "lucide-react";
import DOMPurify from "isomorphic-dompurify";
import { toast } from "sonner";
import { AdminListToolbar, AdminToolbarTitle } from "@/components/admin/AdminListToolbar";
import { useAdminTopBar } from "@/components/admin/AdminTopBar";
import { LogoutButton } from "@/components/LogoutButton";
import { EmailComposer } from "@/components/admin/EmailComposer";

interface EmailRow {
    id: string;
    direction: "inbound" | "outbound";
    address: string;
    from_address: string | null;
    cc: string | null;
    bcc: string | null;
    subject: string;
    snippet: string | null;
    html?: string | null;
    detail?: string | null;
    attachments?: string[];
    status: string;
    read_at: string | null;
    deleted_at?: string | null;
    created_at: string;
}

type MailTab = "entrada" | "enviados" | "eliminados";
const CHECKBOX = "appearance-none h-4 w-4 shrink-0 rounded-full border border-slate-300 bg-transparent cursor-pointer transition-colors checked:border-emerald-600 checked:bg-emerald-600 checked:shadow-[inset_0_0_0_3px_#fff] disabled:opacity-40";

const STATUS_META: Record<string, { label: string; cls: string }> = {
    sent: { label: "enviado", cls: "bg-blue-50 text-blue-700" },
    failed: { label: "falhou", cls: "bg-red-50 text-red-700" },
    sent_mock: { label: "teste", cls: "bg-slate-100 text-slate-500" },
    received: { label: "recebido", cls: "bg-emerald-50 text-emerald-700" },
};

function timeAgo(iso: string) {
    const diff = Date.now() - new Date(iso).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 1) return "agora";
    if (m < 60) return `${m} min`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h} h`;
    return new Date(iso).toLocaleDateString("pt-PT", { day: "2-digit", month: "2-digit" });
}

export default function AdminEmailsPage() {
    useAdminTopBar("");

    const [tab, setTab] = useState<MailTab>("enviados");
    const [msgs, setMsgs] = useState<EmailRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [sel, setSel] = useState<Set<string>>(new Set());

    const [open, setOpen] = useState(false);
    const [detailLoading, setDetailLoading] = useState(false);
    const [detail, setDetail] = useState<EmailRow | null>(null);

    const load = useCallback(async (silent = false) => {
        if (!silent) setLoading(true);
        try {
            const r = await fetch(`/api/emails/messages?tab=${tab}&limit=150`).then((x) => x.json());
            setMsgs(r.messages || []);
            setSel(new Set());
        } catch {
            /* silencioso */
        } finally {
            setLoading(false);
        }
    }, [tab]);

    useEffect(() => {
        load();
        const id = setInterval(() => load(true), 30000);
        return () => clearInterval(id);
    }, [load]);

    const allSel = msgs.length > 0 && msgs.every((m) => sel.has(m.id));
    const toggleAll = () => setSel(allSel ? new Set() : new Set(msgs.map((m) => m.id)));
    const toggle = (id: string) => {
        const next = new Set(sel);
        next.has(id) ? next.delete(id) : next.add(id);
        setSel(next);
    };

    const openMsg = async (m: EmailRow) => {
        setOpen(true);
        setDetail(null);
        setDetailLoading(true);
        try {
            const r = await fetch(`/api/emails/message?id=${m.id}`).then((x) => x.json());
            if (r.error) throw new Error(r.error);
            setDetail(r.message);
            if (m.direction === "inbound" && !m.read_at) {
                setMsgs((cur) => cur.map((x) => (x.id === m.id ? { ...x, read_at: new Date().toISOString() } : x)));
            }
        } catch (e) {
            toast.error(e instanceof Error ? e.message : "Não foi possível abrir.");
            setOpen(false);
        } finally {
            setDetailLoading(false);
        }
    };
    const close = () => { setOpen(false); setDetail(null); };

    const applyDelete = async (mode: "soft" | "hard" | "restore") => {
        if (sel.size === 0) return;
        const verb = mode === "soft" ? "eliminar" : mode === "hard" ? "eliminar definitivamente" : "restaurar";
        if (mode !== "restore" && !confirm(`Tens a certeza que queres ${verb} ${sel.size} e-mail(s)?`)) return;
        try {
            const res = await fetch("/api/emails/messages/delete", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ids: [...sel], mode }),
            });
            if (!res.ok) throw new Error((await res.json()).error || "Falhou.");
            toast.success(`${sel.size} e-mail(s): ${verb}.`);
            load(true);
        } catch (e) {
            toast.error(e instanceof Error ? e.message : "Falhou.");
        }
    };

    const TAB_BTN = (t: MailTab, label: string) => (
        <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-3 py-1.5 text-[11px] font-bold uppercase tracking-wide rounded-[8px] transition-all ${tab === t ? "bg-white text-emerald-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
        >
            {label}
        </button>
    );

    return (
        <div className="w-full max-w-full space-y-8">
            <AdminListToolbar className="flex-nowrap">
                <AdminToolbarTitle title="E-mails" />
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
                {/* ESQUERDA — compor */}
                <div className="bg-white rounded-xl border border-slate-100 p-5 shadow-sm space-y-4">
                    <div className="flex items-center gap-2 text-slate-800">
                        <Mail className="w-5 h-5 text-emerald-600" />
                        <h2 className="text-sm font-black uppercase tracking-wider">Escrever e-mail</h2>
                    </div>
                    <EmailComposer onSent={() => { setTab("enviados"); load(true); }} />
                </div>

                {/* DIREITA — caixas */}
                <div className="bg-white rounded-xl border border-slate-100 p-5 shadow-sm space-y-3">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-[8px]">
                            {TAB_BTN("entrada", "Entrada")}
                            {TAB_BTN("enviados", "Enviados")}
                            {TAB_BTN("eliminados", "Eliminados")}
                        </div>
                        <button onClick={() => load()} className="text-slate-400 hover:text-emerald-600 transition-colors" title="Actualizar">
                            <RefreshCw className="w-4 h-4" />
                        </button>
                    </div>

                    <div className="flex items-center gap-3 text-[12px]">
                        {tab === "eliminados" ? (
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
                        {sel.size > 0 && <span className="text-slate-400">{sel.size} selecionado(s)</span>}
                        <div className="flex-1" />
                        <input type="checkbox" checked={allSel} onChange={toggleAll} disabled={msgs.length === 0} className={CHECKBOX} title="Selecionar tudo" />
                    </div>

                    {loading ? (
                        <div className="py-12 flex justify-center"><Loader2 className="w-5 h-5 animate-spin text-slate-300" /></div>
                    ) : msgs.length === 0 ? (
                        <div className="py-12 text-center text-[12px] text-slate-400">
                            {tab === "entrada" ? "Sem e-mails recebidos." : tab === "eliminados" ? "Nada eliminado." : "Sem e-mails enviados."}
                        </div>
                    ) : (
                        <ul className="divide-y divide-slate-100 max-h-[560px] overflow-y-auto">
                            {msgs.map((m) => {
                                const meta = STATUS_META[m.status];
                                const unread = m.direction === "inbound" && !m.read_at;
                                return (
                                    <li key={m.id} className="flex items-start gap-2 py-2.5">
                                        <button onClick={() => openMsg(m)} className="min-w-0 flex-1 text-left">
                                            <div className="flex items-center gap-2">
                                                <span className={`truncate text-[13px] ${unread ? "font-bold text-slate-900" : "font-semibold text-slate-700"}`}>{m.address}</span>
                                                {meta && <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded shrink-0 ${meta.cls}`}>{meta.label}</span>}
                                                <span className="ml-auto text-[11px] text-slate-300 shrink-0">{timeAgo(m.created_at)}</span>
                                            </div>
                                            <div className={`truncate text-[12px] mt-0.5 ${unread ? "font-semibold text-slate-700" : "text-slate-500"}`}>{m.subject}</div>
                                            {m.snippet && <div className="truncate text-[11px] mt-0.5 text-slate-400">{m.snippet}</div>}
                                        </button>
                                        <input type="checkbox" checked={sel.has(m.id)} onChange={() => toggle(m.id)} className={`${CHECKBOX} mt-1`} />
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                </div>
            </div>

            {/* Popup — e-mail completo */}
            {open && (
                <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/40 p-4" onClick={close}>
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl h-[80vh] max-h-[88vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-start justify-between px-5 py-4 border-b border-slate-100 gap-3">
                            <div className="min-w-0">
                                <p className="text-base font-black text-slate-800 truncate">{detail?.subject || "(sem assunto)"}</p>
                                <p className="text-[12px] text-slate-400 truncate">
                                    {detail ? (detail.direction === "inbound" ? `De ${detail.address}` : `Para ${detail.address}`) : ""}
                                    {detail?.cc ? ` · Cc ${detail.cc}` : ""}
                                </p>
                                {detail && <p className="text-[11px] text-slate-300 mt-0.5">{new Date(detail.created_at).toLocaleString("pt-PT")}</p>}
                            </div>
                            <button onClick={close} className="text-slate-400 hover:text-slate-700 shrink-0"><X className="w-5 h-5" /></button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-5 bg-white">
                            {detailLoading ? (
                                <div className="py-12 flex justify-center"><Loader2 className="w-5 h-5 animate-spin text-slate-300" /></div>
                            ) : detail ? (
                                <>
                                    {detail.detail && <p className="mb-3 text-[12px] text-red-500">{detail.detail}</p>}
                                    <div className="prose prose-sm max-w-none text-slate-800" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(detail.html || "<p style='color:#94a3b8'>(sem corpo)</p>") }} />
                                </>
                            ) : null}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
