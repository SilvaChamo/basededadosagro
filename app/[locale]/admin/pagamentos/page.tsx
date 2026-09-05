"use client";

import { useEffect, useState, useCallback } from "react";
import { Dialog, DialogClose, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { AdminListToolbar, AdminToolbarTitle } from "@/components/admin/AdminListToolbar";
import { useAdminTopBar } from "@/components/admin/AdminTopBar";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import { Coins, Check, X, FileText, ExternalLink, Building2 } from "lucide-react";
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

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const response = await fetch("/api/admin/payment-proofs", { cache: "no-store" });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || "Erro ao carregar comprovativos.");
            setRows(data.rows || []);
        } catch (err: any) {
            console.error("Erro ao carregar comprovativos:", err);
            toast.error("Erro ao carregar comprovativos.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { load(); }, [load]);

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

    return (
        <div className="flex flex-col gap-5">
            <AdminListToolbar>
                <AdminToolbarTitle title="Pagamentos" />
            </AdminListToolbar>

            <div className="bg-white rounded-[10px] border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-5 border-b border-slate-50 flex items-center justify-between flex-wrap gap-3">
                    <h2 className="font-black text-sm uppercase tracking-widest text-slate-800 flex items-center gap-2">
                        <Coins className="w-4 h-4 text-emerald-500" />
                        Comprovativos de transferência bancária
                    </h2>
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

                {loading ? (
                    <div className="p-16 flex items-center justify-center">
                        <Spinner className="w-8 h-8 text-emerald-600" />
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="p-16 text-center text-slate-400 text-sm font-medium italic">
                        Sem comprovativos {tab === "pending" ? "pendentes" : tab === "completed" ? "aprovados" : "rejeitados"}.
                    </div>
                ) : (
                    <div className="divide-y divide-slate-50">
                        {filtered.map((row) => (
                            <div key={row.id} className="p-5 flex items-center gap-4 flex-wrap">
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
                                    <div className="ml-auto">
                                        <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full ${row.status === "completed" ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-500"}`}>
                                            {row.status === "completed" ? "Aprovado" : "Rejeitado"}
                                        </span>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <Dialog open={Boolean(selectedReceipt)} onOpenChange={(open) => !open && setSelectedReceipt(null)}>
                <DialogContent
                    showCloseButton={false}
                    className="h-[88vh] max-h-[900px] w-[min(92vw,720px)] max-w-none overflow-hidden border-slate-700 bg-slate-950 p-2 shadow-2xl sm:p-3"
                >
                    <DialogTitle className="sr-only">Comprovativo</DialogTitle>
                    <DialogClose
                        aria-label="Fechar"
                        className="absolute right-3 top-3 z-20 flex h-11 w-11 items-center justify-center rounded-full border-2 border-white/80 bg-slate-900 text-white opacity-100 shadow-xl transition-colors hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-white"
                    >
                        <X className="h-6 w-6" />
                    </DialogClose>
                    {selectedReceipt && (
                        isPdf(selectedReceipt) ? (
                            <iframe
                                src={selectedReceipt}
                                title="Comprovativo"
                                className="h-full w-full rounded-lg bg-white"
                            />
                        ) : (
                            <div className="flex h-full w-full items-center justify-center overflow-hidden rounded-lg bg-black/30 p-2 pt-14 sm:p-4 sm:pt-16">
                                <img src={selectedReceipt} alt="Comprovativo" className="max-h-full max-w-full object-contain" />
                            </div>
                        )
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
