"use client";

import { useEffect, useState, useCallback } from "react";
import { Dialog, DialogClose, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { AdminListToolbar, AdminToolbarTitle } from "@/components/admin/AdminListToolbar";
import { useAdminTopBar } from "@/components/admin/AdminTopBar";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Coins, Check, X, FileText, ExternalLink, Building2, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface ProofRow {
    id: string;
    user_id: string;
    reference: string;
    plan_name: string;
    amount: number;
    status: "pending" | "completed" | "failed";
    item_type: "plan" | "highlight" | null;
    receipt_url: string | null;
    created_at: string;
    completed_at: string | null;
    userName: string;
    companyName: string;
}

const ITEM_LABEL: Record<string, string> = {
    plan: "Plano",
    highlight: "Destaque",
    both: "Plano + Destaque",
};

export default function AdminPagamentosPage() {
    const [rows, setRows] = useState<ProofRow[]>([]);
    const [selectedReceipt, setSelectedReceipt] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [busyId, setBusyId] = useState<string | null>(null);
    const [tab, setTab] = useState<"pending" | "completed" | "failed">("pending");
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [deleting, setDeleting] = useState(false);
    const [loadError, setLoadError] = useState(false);

    // O Supabase deste projecto fica atrás da Cloudflare e, sob carga, chega
    // a estourar o timeout do fetch — tenta 3 vezes com pausa antes de dar
    // erro, e mostra um botão de repetir em vez de só um toast que passa.
    const load = useCallback(async () => {
        setLoading(true);
        setLoadError(false);
        let lastErr: unknown;
        for (let attempt = 0; attempt < 3; attempt++) {
            try {
                const response = await fetch("/api/admin/payment-proofs", { cache: "no-store" });
                const data = await response.json().catch(() => ({}));
                if (!response.ok) throw new Error(data.error || "Erro ao carregar comprovativos.");
                setRows(data.rows || []);
                setLoading(false);
                return;
            } catch (err) {
                lastErr = err;
                if (attempt < 2) await new Promise((r) => setTimeout(r, 1200 * (attempt + 1)));
            }
        }
        console.error("Erro ao carregar comprovativos:", lastErr);
        setLoadError(true);
        setLoading(false);
    }, []);

    useEffect(() => { load(); }, [load]);
    useEffect(() => { setSelectedIds(new Set()); }, [tab]);

    const handleAction = async (id: string, action: "approve" | "reject") => {
        setBusyId(id);
        try {
            const res = await fetch(`/api/admin/payment-proofs/${id}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Erro ao processar.");
            toast.success(action === "approve" ? "Pagamento aprovado — plano já activo na conta." : "Comprovativo rejeitado.");
            await load();
            if (action === "approve") setTab("completed");
        } catch (err: any) {
            toast.error(err.message || "Erro ao processar.");
        } finally {
            setBusyId(null);
        }
    };

    useAdminTopBar("");

    const filtered = rows.filter((r) => r.status === tab);
    const pendingCount = rows.filter((r) => r.status === "pending").length;
    const completedCount = rows.filter((r) => r.status === "completed").length;
    const failedCount = rows.filter((r) => r.status === "failed").length;

    const isPdf = (url: string) => url.toLowerCase().endsWith(".pdf");

    const toggleSelect = (id: string) => {
        setSelectedIds((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id); else next.add(id);
            return next;
        });
    };

    const toggleSelectAll = () => {
        setSelectedIds((prev) =>
            prev.size === filtered.length ? new Set() : new Set(filtered.map((r) => r.id))
        );
    };

    const deleteRows = async (ids: string[]) => {
        if (ids.length === 0) return;
        const label = ids.length === 1 ? "este comprovativo" : `estes ${ids.length} comprovativos`;
        if (!confirm(`Eliminar ${label} permanentemente? Esta acção não pode ser desfeita.`)) return;

        setDeleting(true);
        try {
            const res = await fetch("/api/admin/payment-proofs", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ids }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Erro ao eliminar.");
            toast.success(ids.length === 1 ? "Comprovativo eliminado." : `${ids.length} comprovativos eliminados.`);
            setSelectedIds((prev) => {
                const next = new Set(prev);
                ids.forEach((id) => next.delete(id));
                return next;
            });
            await load();
        } catch (err: any) {
            toast.error(err.message || "Erro ao eliminar.");
        } finally {
            setDeleting(false);
        }
    };

    return (
        <div className="flex flex-col gap-5">
            <AdminListToolbar>
                <AdminToolbarTitle title="Pagamentos" />
            </AdminListToolbar>

            <div className="bg-white rounded-[10px] border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-5 border-b border-slate-50 flex items-center justify-between flex-wrap gap-3">
                    <div className="flex items-center gap-3 flex-wrap">
                        <h2 className="font-black text-sm uppercase tracking-widest text-slate-800 flex items-center gap-2">
                            <Coins className="w-4 h-4 text-emerald-500" />
                            Comprovativos de transferência bancária
                        </h2>
                        {selectedIds.size > 0 && (
                            <Button
                                size="sm"
                                variant="outline"
                                disabled={deleting}
                                onClick={() => deleteRows(Array.from(selectedIds))}
                                className="border-red-200 text-red-500 hover:bg-red-50 hover:text-red-600"
                            >
                                <Trash2 className="w-3.5 h-3.5 mr-1" /> Eliminar selecionados ({selectedIds.size})
                            </Button>
                        )}
                    </div>
                    <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-lg">
                        {(["pending", "completed", "failed"] as const).map((t) => (
                            <button
                                key={t}
                                onClick={() => setTab(t)}
                                className={`px-3 py-1.5 rounded-md text-[11px] font-black uppercase tracking-widest transition-all ${tab === t ? "bg-white text-emerald-600 shadow-sm" : "text-slate-400 hover:text-slate-600"}`}
                            >
                                {t === "pending" ? `Pendentes (${pendingCount})` : t === "completed" ? `Aprovados (${completedCount})` : `Rejeitados (${failedCount})`}
                            </button>
                        ))}
                    </div>
                </div>

                {!loading && !loadError && filtered.length > 0 && (
                    <div className="px-5 py-2.5 border-b border-slate-50 flex items-center gap-3 bg-slate-50/60">
                        <Checkbox
                            checked={selectedIds.size === filtered.length && filtered.length > 0}
                            onChange={toggleSelectAll}
                        />
                        <span className={selectedIds.size > 0 ? "text-xs font-bold text-slate-600" : "text-xs font-medium text-slate-400"}>
                            {selectedIds.size > 0
                                ? `${selectedIds.size} selecionado${selectedIds.size > 1 ? "s" : ""}`
                                : "Selecionar tudo"}
                        </span>
                    </div>
                )}

                {loading ? (
                    <div className="p-16 flex items-center justify-center">
                        <Spinner className="w-8 h-8 text-emerald-600" />
                    </div>
                ) : loadError ? (
                    <div className="p-16 text-center">
                        <p className="text-sm font-bold text-red-500">Não foi possível carregar os comprovativos.</p>
                        <p className="text-xs text-slate-400 mt-1 mb-4">O servidor pode estar lento neste momento. Tente novamente.</p>
                        <Button size="sm" onClick={load} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                            Tentar novamente
                        </Button>
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="p-16 text-center text-slate-400 text-sm font-medium italic">
                        Sem comprovativos {tab === "pending" ? "pendentes" : tab === "completed" ? "aprovados" : "rejeitados"}.
                    </div>
                ) : (
                    <div className="divide-y divide-slate-50">
                        {filtered.map((row) => (
                            <div key={row.id} className="p-5 flex items-center gap-4 flex-wrap">
                                <Checkbox
                                    checked={selectedIds.has(row.id)}
                                    onChange={() => toggleSelect(row.id)}
                                />

                                {/* Miniatura do comprovativo */}
                                {row.receipt_url ? (
                                    isPdf(row.receipt_url) ? (
                                        <button
                                            type="button"
                                            onClick={() => setSelectedReceipt(row.receipt_url)}
                                            className="w-16 h-16 shrink-0 rounded-lg border border-slate-200 bg-slate-50 flex flex-col items-center justify-center text-slate-400 hover:text-emerald-600 hover:border-emerald-200 transition-colors"
                                        >
                                            <FileText className="w-6 h-6" />
                                            <span className="text-[8px] font-black uppercase mt-0.5">PDF</span>
                                        </button>
                                    ) : (
                                        <button type="button" onClick={() => setSelectedReceipt(row.receipt_url)} className="w-16 h-16 shrink-0 rounded-lg overflow-hidden border border-slate-200 block group relative">
                                            <img src={row.receipt_url} alt="Comprovativo" className="w-full h-full object-cover" />
                                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 flex items-center justify-center transition-colors">
                                                <ExternalLink className="w-4 h-4 text-white opacity-0 group-hover:opacity-100" />
                                            </div>
                                        </button>
                                    )
                                ) : (
                                    <div className="w-16 h-16 shrink-0 rounded-lg border border-dashed border-slate-200 flex items-center justify-center text-slate-300">
                                        <FileText className="w-6 h-6" />
                                    </div>
                                )}

                                {/* Dados */}
                                <div className="flex-1 min-w-[220px]">
                                    <p className="font-black text-sm text-slate-800">{row.userName}</p>
                                    <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                                        <Building2 className="w-3.5 h-3.5 text-slate-300" /> {row.companyName}
                                    </p>
                                    <p className="text-[10px] text-slate-400 font-mono mt-1">{row.reference}</p>
                                </div>

                                <div className="text-center px-3">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{ITEM_LABEL[row.item_type || ""] || "—"}</p>
                                    <p className="text-sm font-bold text-slate-700">{row.plan_name}</p>
                                </div>

                                <div className="text-center px-3">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Valor</p>
                                    <p className="text-base font-black text-emerald-600">{Number(row.amount).toLocaleString("pt-PT")} MT</p>
                                </div>

                                <div className="text-center px-3 hidden md:block">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Enviado</p>
                                    <p className="text-xs font-medium text-slate-500">{new Date(row.created_at).toLocaleDateString("pt-PT", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}</p>
                                </div>

                                {row.status === "pending" ? (
                                    <div className="flex items-center gap-2 ml-auto">
                                        <Button
                                            size="sm"
                                            disabled={busyId === row.id}
                                            onClick={() => handleAction(row.id, "reject")}
                                            variant="outline"
                                            className="border-red-200 text-red-500 hover:bg-red-50 hover:text-red-600"
                                        >
                                            <X className="w-4 h-4 mr-1" /> Rejeitar
                                        </Button>
                                        <Button
                                            size="sm"
                                            disabled={busyId === row.id}
                                            onClick={() => handleAction(row.id, "approve")}
                                            className="bg-emerald-600 hover:bg-emerald-700 text-white"
                                        >
                                            <Check className="w-4 h-4 mr-1" /> Aprovar
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="ml-auto flex items-center gap-3">
                                        <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full ${row.status === "completed" ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-500"}`}>
                                            {row.status === "completed" ? "Aprovado" : "Rejeitado"}
                                        </span>
                                    </div>
                                )}

                                <button
                                    type="button"
                                    disabled={deleting}
                                    onClick={() => deleteRows([row.id])}
                                    title="Eliminar"
                                    className="shrink-0 w-8 h-8 flex items-center justify-center rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 transition-colors"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <Dialog open={Boolean(selectedReceipt)} onOpenChange={(open) => !open && setSelectedReceipt(null)}>
                <DialogContent
                    showCloseButton={false}
                    onClick={(e) => { if (e.target === e.currentTarget) setSelectedReceipt(null); }}
                    style={{ margin: 0, transform: "none" }}
                    className="fixed inset-0 left-0 top-0 z-50 flex max-w-none translate-x-0 translate-y-0 items-center justify-center border-0 bg-transparent p-4 shadow-none sm:max-w-none"
                >
                    <DialogTitle className="sr-only">Comprovativo</DialogTitle>

                    {/* Linha: a folha e, à direita dela, o botão de fechar
                        (alinhado ao topo) — perto da imagem, do lado direito,
                        nunca por cima nem perdido no canto do ecrã. */}
                    {selectedReceipt && (
                        <div
                            onClick={(e) => { if (e.target === e.currentTarget) setSelectedReceipt(null); }}
                            className="flex items-start gap-3"
                        >
                            {/* A "folha": sem cor de fundo, só a moldura A4
                                (210 × 297 mm). A largura é o menor valor entre
                                "cabe na largura do ecrã (menos o espaço do
                                botão à direita)" e "a altura A4 respectiva cabe
                                na altura do ecrã" — a proporção nunca se perde.
                                A imagem/PDF encaixa sempre lá dentro
                                (object-contain), nunca é cortada nem transborda. */}
                            <div
                                style={{
                                    width: "min(calc(100vw - 5rem), calc((100vh - 2rem) * 210 / 297))",
                                    aspectRatio: "210 / 297",
                                    maxHeight: "calc(100vh - 2rem)",
                                }}
                                className="flex items-center justify-center"
                            >
                                {isPdf(selectedReceipt) ? (
                                    <iframe
                                        src={selectedReceipt}
                                        title="Comprovativo"
                                        className="h-full w-full rounded-lg border-0 bg-white shadow-2xl"
                                    />
                                ) : (
                                    <img
                                        src={selectedReceipt}
                                        alt="Comprovativo"
                                        className="max-h-full max-w-full rounded-lg object-contain shadow-2xl"
                                    />
                                )}
                            </div>

                            <DialogClose
                                aria-label="Fechar"
                                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-900/85 text-white shadow-lg backdrop-blur-sm transition-colors hover:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-white"
                            >
                                <X className="h-5 w-5" />
                            </DialogClose>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
