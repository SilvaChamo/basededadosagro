"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";
import { RefreshCw, Send, Trash2, AlertTriangle, ArrowLeft, FileEdit } from "lucide-react";
import { ConfirmationModal } from "@/components/ui/ConfirmationModal";
import { AdminListToolbar } from "@/components/admin/AdminListToolbar";
import { useAdminTopBar } from "@/components/admin/AdminTopBar";
import { LogoutButton } from "@/components/LogoutButton";

interface NewsItem {
    id: string;
    title: string;
    type: string | null;
    date: string | null;
    created_at: string;
    image_url: string | null;
}

export default function RascunhoPage() {
    const supabase = createClient();
    const [news, setNews] = useState<NewsItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [confirmAction, setConfirmAction] = useState<null | { kind: "publish" | "trash"; ids: string[] }>(null);

    const loadNews = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from("articles")
            .select("id, title, type, date, created_at, image_url")
            .eq("status", "draft")
            .is("deleted_at", null)
            .order("date", { ascending: false });
        if (!error) setNews(data || []);
        setLoading(false);
    };

    useEffect(() => { loadNews(); }, []);

    const toggleSelect = (id: string) => {
        const next = new Set(selectedIds);
        next.has(id) ? next.delete(id) : next.add(id);
        setSelectedIds(next);
    };

    const toggleAll = () => {
        setSelectedIds(selectedIds.size === news.length ? new Set() : new Set(news.map((n) => n.id)));
    };

    const runConfirmedAction = async () => {
        if (!confirmAction) return;
        const { kind, ids } = confirmAction;
        try {
            const res = await fetch("/api/admin/articles", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ids,
                    payload: kind === "publish" ? { status: "active" } : { deleted_at: new Date().toISOString() },
                }),
            });
            if (!res.ok) throw new Error((await res.json()).error);
            toast.success(kind === "publish" ? `${ids.length} notícia(s) publicada(s).` : `${ids.length} notícia(s) movida(s) para o lixo.`);
            setNews((prev) => prev.filter((n) => !ids.includes(n.id)));
            setSelectedIds(new Set());
        } catch (err: any) {
            toast.error(err.message || "Erro ao processar a acção.");
        } finally {
            setConfirmAction(null);
        }
    };

    useAdminTopBar("");

    return (
        <div className="text-[#2c3338]">
            <AdminListToolbar className="flex-nowrap">
                <div className="flex items-center gap-4 shrink-0">
                    <Link href="/admin/central-noticias" className="text-slate-400 hover:text-slate-600 shrink-0">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight shrink-0 leading-none flex items-center gap-2">
                        <FileEdit className="w-5 h-5 text-gray-500" /> Rascunho
                    </h1>
                    <span className="text-sm text-gray-400 shrink-0">({news.length} itens)</span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                    <LogoutButton
                        variant="outline"
                        className="h-9 px-4 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-red-600 border-slate-200"
                        showIcon
                        label="Sair"
                    />
                </div>
            </AdminListToolbar>

            <div className="mt-4">
            {selectedIds.size > 0 && (
                <div className="flex items-center gap-3 mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                    <span className="text-sm font-medium text-blue-700">{selectedIds.size} selecionado(s)</span>
                    <button
                        onClick={() => setConfirmAction({ kind: "publish", ids: Array.from(selectedIds) })}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-[#00a651] text-white text-sm rounded-md hover:bg-[#008f46]"
                    >
                        <Send className="w-3.5 h-3.5" /> Publicar
                    </button>
                    <button
                        onClick={() => setConfirmAction({ kind: "trash", ids: Array.from(selectedIds) })}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-[#d63638] text-white text-sm rounded-md hover:bg-[#b32d2e]"
                    >
                        <Trash2 className="w-3.5 h-3.5" /> Mover para o lixo
                    </button>
                    <button onClick={() => setSelectedIds(new Set())} className="text-sm text-gray-500 hover:text-gray-700">Cancelar</button>
                </div>
            )}

            <div className="bg-white border border-[#ccd0d4] rounded-md overflow-hidden overflow-x-auto">
                <table className="w-full border-collapse text-[13px]">
                    <thead>
                        <tr className="bg-white text-left font-bold border-b border-[#ccd0d4] text-[#2c3338]">
                            <th className="p-3 w-10 text-center"><input type="checkbox" checked={selectedIds.size === news.length && news.length > 0} onChange={toggleAll} /></th>
                            <th className="p-3">Título</th>
                            <th className="p-3 w-40">Categoria</th>
                            <th className="p-3 w-44">Data</th>
                            <th className="p-3 w-52 text-center">Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={5} className="p-10 text-center"><RefreshCw className="w-6 h-6 animate-spin mx-auto text-[#2271b1]" /></td></tr>
                        ) : news.length === 0 ? (
                            <tr><td colSpan={5} className="p-10 text-center text-gray-400">Sem rascunhos.</td></tr>
                        ) : news.map((item, idx) => (
                            <tr key={item.id} className={`group border-b border-[#f0f0f1] hover:bg-[#f6f7f7] ${idx % 2 === 0 ? "bg-white" : "bg-[#f9f9f9]"} ${selectedIds.has(item.id) ? "bg-blue-50" : ""}`}>
                                <td className="p-3 text-center"><input type="checkbox" checked={selectedIds.has(item.id)} onChange={() => toggleSelect(item.id)} /></td>
                                <td className="p-3">
                                    <div className="flex items-center gap-3">
                                        {item.image_url ? (
                                            <img src={item.image_url} className="w-10 h-10 object-cover border border-[#ccd0d4] flex-shrink-0" alt="" />
                                        ) : (
                                            <div className="w-10 h-10 bg-gray-100 border border-dashed border-gray-300 flex items-center justify-center flex-shrink-0">
                                                <AlertTriangle className="w-4 h-4 text-gray-300" />
                                            </div>
                                        )}
                                        <Link href={`/admin/central-noticias/editar/${item.id}`} className="font-medium text-[#2271b1] hover:text-[#135e96]">{item.title || "(sem título)"}</Link>
                                    </div>
                                </td>
                                <td className="p-3 text-[#50575e] capitalize">{item.type || "Notícia"}</td>
                                <td className="p-3 text-[#50575e]">{new Date(item.date || item.created_at).toLocaleDateString("pt-PT")}</td>
                                <td className="p-3 text-center">
                                    <div className="flex items-center justify-center gap-2">
                                        <button
                                            onClick={() => setConfirmAction({ kind: "publish", ids: [item.id] })}
                                            className="flex items-center gap-1 px-2 py-1 text-[11px] font-semibold bg-[#00a651] text-white rounded hover:bg-[#008f46]"
                                        >
                                            <Send className="w-3 h-3" /> Publicar
                                        </button>
                                        <button
                                            onClick={() => setConfirmAction({ kind: "trash", ids: [item.id] })}
                                            className="flex items-center gap-1 px-2 py-1 text-[11px] font-semibold bg-white border border-[#d63638] text-[#d63638] rounded hover:bg-red-50"
                                        >
                                            <Trash2 className="w-3 h-3" /> Lixo
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <ConfirmationModal
                isOpen={!!confirmAction}
                onClose={() => setConfirmAction(null)}
                onConfirm={runConfirmedAction}
                title={confirmAction?.kind === "publish" ? "Publicar Notícia" : "Mover para o Lixo"}
                description={
                    confirmAction?.kind === "publish"
                        ? `Publicar ${confirmAction.ids.length} notícia(s)?`
                        : `Mover ${confirmAction?.ids.length} notícia(s) para o lixo?`
                }
                confirmLabel={confirmAction?.kind === "publish" ? "Publicar" : "Mover para o Lixo"}
                variant={confirmAction?.kind === "publish" ? "default" : "destructive"}
            />
            </div>
        </div>
    );
}
