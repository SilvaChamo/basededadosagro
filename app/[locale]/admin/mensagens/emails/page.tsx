"use client";

import { useState, useEffect, useCallback } from "react";
import { Mail, Loader2, RefreshCw, Trash2, RotateCcw, ArrowLeft, Reply, Forward, Archive } from "lucide-react";
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

const stripReplyPrefix = (s: string) => String(s || "").replace(/^\s*((re|fw|fwd)\s*:\s*)+/i, "").trim();
const escHtml = (s: string) =>
    String(s || "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c] as string));

export default function AdminEmailsPage() {
    useAdminTopBar("");

    const [tab, setTab] = useState<MailTab>("enviados");
    const [msgs, setMsgs] = useState<EmailRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [sel, setSel] = useState<Set<string>>(new Set());

    // Leitura de um e-mail: ocupa toda a área (substitui as caixas).
    const [openId, setOpenId] = useState<string | null>(null);
    const [detail, setDetail] = useState<EmailRow | null>(null);
    const [detailLoading, setDetailLoading] = useState(false);
    const [replyMode, setReplyMode] = useState<"reply" | "forward" | null>(null);
    const [busy, setBusy] = useState(false);

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
        const id = setInterval(() => { if (!openId) load(true); }, 30000);
        return () => clearInterval(id);
    }, [load, openId]);

    const allSel = msgs.length > 0 && msgs.every((m) => sel.has(m.id));
    const toggleAll = () => setSel(allSel ? new Set() : new Set(msgs.map((m) => m.id)));
    const toggle = (id: string) => {
        const next = new Set(sel);
        next.has(id) ? next.delete(id) : next.add(id);
        setSel(next);
    };

    const openMsg = async (m: EmailRow) => {
        setOpenId(m.id);
        setDetail(null);
        setReplyMode(null);
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
            setOpenId(null);
        } finally {
            setDetailLoading(false);
        }
    };

    const backToList = () => {
        setOpenId(null);
        setDetail(null);
        setReplyMode(null);
        load(true);
    };

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

    // Acções sobre o e-mail aberto.
    const act = async (kind: "unread" | "delete" | "archive") => {
        if (!openId || busy) return;
        setBusy(true);
        try {
            const [url, body, msg] =
                kind === "delete"
                    ? ["/api/emails/messages/delete", { ids: [openId], mode: "soft" }, "E-mail eliminado."]
                    : kind === "archive"
                        ? ["/api/emails/messages/state", { ids: [openId], archived: true }, "E-mail arquivado."]
                        : ["/api/emails/messages/state", { ids: [openId], read: false }, "Marcado como não lido."];
            const res = await fetch(url as string, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });
            if (!res.ok) throw new Error((await res.json()).error || "Falhou.");
            toast.success(msg as string);
            backToList();
        } catch (e) {
            toast.error(e instanceof Error ? e.message : "Falhou.");
        } finally {
            setBusy(false);
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

    const ACTION_BTN = "inline-flex items-center gap-1.5 h-9 px-3 rounded-[6px] text-[11px] font-bold uppercase tracking-wide border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition-colors";

    // ---------------- Leitura de um e-mail (ecrã inteiro) ----------------
    if (openId) {
        const forwardBody = detail
            ? `<br/><br/><blockquote style="border-left:3px solid #e2e8f0;margin:0;padding-left:12px;color:#475569">` +
              `--- Mensagem reencaminhada ---<br/>` +
              `De: ${escHtml(detail.from_address || detail.address)}<br/>` +
              `Data: ${escHtml(new Date(detail.created_at).toLocaleString("pt-PT"))}<br/>` +
              `Assunto: ${escHtml(detail.subject)}<br/><br/>` +
              `${DOMPurify.sanitize(detail.html || "")}</blockquote>`
            : "";

        return (
            <div className="w-full max-w-full space-y-6">
                <AdminListToolbar className="flex-nowrap">
                    <button onClick={backToList} className="inline-flex items-center gap-2 text-[12px] font-bold uppercase tracking-wide text-slate-500 hover:text-emerald-600 transition-colors">
                        <ArrowLeft className="w-4 h-4" /> Voltar aos e-mails
                    </button>
                    <div className="flex items-center gap-2 shrink-0">
                        <LogoutButton variant="outline" className="h-9 px-4 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-red-600 border-slate-200" showIcon label="Sair" />
                    </div>
                </AdminListToolbar>

                <div className="bg-white rounded-xl border border-slate-100 p-6 shadow-sm space-y-5">
                    {detailLoading || !detail ? (
                        <div className="py-16 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-slate-300" /></div>
                    ) : (
                        <>
                            <div>
                                <h2 className="text-lg font-black text-slate-900">{detail.subject || "(sem assunto)"}</h2>
                                <p className="text-[12px] text-slate-500 mt-1">
                                    {detail.direction === "inbound" ? "De " : "Para "}
                                    <span className="font-semibold text-slate-700">{detail.address}</span>
                                    {detail.cc ? ` · Cc ${detail.cc}` : ""}
                                </p>
                                <p className="text-[11px] text-slate-400 mt-0.5">{new Date(detail.created_at).toLocaleString("pt-PT")}</p>
                            </div>

                            <div className="flex flex-wrap items-center gap-2">
                                <button className={ACTION_BTN} disabled={busy} onClick={() => setReplyMode("reply")}>
                                    <Reply className="w-3.5 h-3.5" /> Responder
                                </button>
                                <button className={ACTION_BTN} disabled={busy} onClick={() => setReplyMode("forward")}>
                                    <Forward className="w-3.5 h-3.5" /> Reencaminhar
                                </button>
                                <button className={ACTION_BTN} disabled={busy} onClick={() => act("unread")}>
                                    <Mail className="w-3.5 h-3.5" /> Marcar como não lido
                                </button>
                                <button className={ACTION_BTN} disabled={busy} onClick={() => act("archive")}>
                                    <Archive className="w-3.5 h-3.5" /> Arquivar
                                </button>
                                <button className={`${ACTION_BTN} !text-red-600 hover:!bg-red-50`} disabled={busy} onClick={() => act("delete")}>
                                    <Trash2 className="w-3.5 h-3.5" /> Eliminar
                                </button>
                            </div>

                            {detail.detail && <p className="text-[12px] text-red-500">{detail.detail}</p>}

                            <div className="border-t border-slate-100 pt-5">
                                <div
                                    className="prose prose-sm max-w-none text-slate-800"
                                    dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(detail.html || "<p style='color:#94a3b8'>(sem corpo)</p>") }}
                                />
                            </div>

                            {replyMode && (
                                <div className="border-t border-slate-100 pt-5">
                                    <p className="text-[11px] font-black uppercase tracking-wider text-slate-400 mb-3">
                                        {replyMode === "reply" ? "Responder" : "Reencaminhar"}
                                    </p>
                                    <EmailComposer
                                        key={replyMode}
                                        initialTo={replyMode === "reply" ? detail.address : ""}
                                        initialSubject={`${replyMode === "reply" ? "Re: " : "Fwd: "}${stripReplyPrefix(detail.subject)}`}
                                        initialContent={replyMode === "forward" ? forwardBody : ""}
                                        submitLabel={replyMode === "reply" ? "Responder" : "Reencaminhar"}
                                        onCancel={() => setReplyMode(null)}
                                        onSent={() => { toast.success("Enviado."); backToList(); }}
                                    />
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        );
    }

    // ---------------- Lista (compor + caixas) ----------------
    return (
        <div className="w-full max-w-full space-y-8">
            <AdminListToolbar className="flex-nowrap">
                <AdminToolbarTitle title="E-mails" />
                <div className="flex items-center gap-2 shrink-0">
                    <LogoutButton variant="outline" className="h-9 px-4 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-red-600 border-slate-200" showIcon label="Sair" />
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
                        <ul className="divide-y divide-slate-100 max-h-[520px] overflow-y-auto">
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
        </div>
    );
}
