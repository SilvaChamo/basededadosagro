"use client";

import { Check, Crown, Zap, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { usePlanPermissions } from "@/hooks/usePlanPermissions";
import { PLAN_PRIVILEGES, normalizePlanName } from "@/lib/plan-fields";

export function ActivePlanCard() {
    const { plan, planDisplayName, planExpiresAt, planExpired, loading: permissionsLoading } = usePlanPermissions();
    const router = useRouter();

    // Data real de validade do plano — definida na aprovação do pagamento.
    // Não há renovação automática nem cobrança recorrente: passada a data, o
    // plano volta a Gratuito sozinho (não há nada para "cancelar").
    const validUntil = planExpiresAt
        ? new Date(planExpiresAt).toLocaleDateString('pt-PT', { day: 'numeric', month: 'short', year: 'numeric' })
        : "";

    if (permissionsLoading) return <div className="animate-pulse h-64 bg-slate-100 rounded-[15px]"></div>;

    const isFree = plan === "Gratuito";
    const privileges = PLAN_PRIVILEGES[plan] || [];

    return (
        <div className={`rounded-[15px] p-6 shadow-sm border text-white transition-colors ${isFree ? "bg-slate-800 border-slate-700" : "bg-emerald-950 border-emerald-900"}`}>
            <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">

                {/* Plan Info */}
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <div className={`p-1.5 rounded-md border ${isFree ? "bg-slate-700 border-slate-600" : "bg-orange-500/10 border-orange-500/20"}`}>
                            {isFree ? <AlertCircle className="w-4 h-4 text-slate-400" /> : <Crown className="w-4 h-4 text-orange-400" />}
                        </div>
                        <span className={`text-xs font-bold uppercase tracking-widest ${isFree ? "text-slate-400" : "text-orange-400"}`}>
                            {isFree ? "Estado da Conta" : "Plano Atual"}
                        </span>
                    </div>
                    <h3 className="text-2xl font-black mb-1 text-white">{planDisplayName}</h3>
                    {!isFree ? (
                        <p className="text-emerald-400 text-sm font-medium">
                            {validUntil ? `Válido até ${validUntil}` : "Plano activo"}
                        </p>
                    ) : planExpired ? (
                        <p className="text-orange-300 text-sm font-medium">O seu plano expirou{validUntil ? ` a ${validUntil}` : ""} — renove para reactivar</p>
                    ) : (
                        <p className="text-slate-400 text-sm font-medium">Sem subscrição ativa</p>
                    )}
                </div>

                {/* Capabilities */}
                <div className={`flex-1 w-full md:w-auto rounded-lg p-4 border ${isFree ? "bg-slate-900/50 border-slate-700" : "bg-emerald-900/30 border-emerald-800"}`}>
                    <h4 className="text-sm font-bold text-white mb-3 uppercase tracking-wide flex items-center gap-2">
                        <Zap className={`w-4 h-4 ${isFree ? "text-slate-500" : "text-yellow-400"}`} />
                        {isFree ? "Capacidades Limitadas" : "Suas Capacidades"}
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2">
                        {privileges.slice(0, 4).map((priv, idx) => (
                            <li key={idx} className={`flex items-center gap-2 text-sm ${isFree ? "text-slate-400" : "text-emerald-100"}`}>
                                <Check className={`w-4 h-4 shrink-0 ${isFree ? "text-slate-500" : "text-emerald-400"}`} />
                                <span className="truncate">{priv}</span>
                            </li>
                        ))}
                    </div>
                </div>

                {/* Action */}
                <div className="shrink-0 w-full md:w-auto flex flex-col gap-2">
                    {normalizePlanName(plan) !== 'Parceiro' && (
                        <Button
                            className={`w-full text-white font-bold h-11 px-6 shadow-lg uppercase tracking-wide text-xs transition-all hover:scale-105 ${isFree ? "bg-orange-500 hover:bg-orange-600 shadow-orange-900/20" : "bg-[#f97316] hover:bg-[#ea580c] shadow-orange-900/20"}`}
                            onClick={() => router.push("/planos")}
                        >
                            {isFree ? (planExpired ? "Renovar Plano" : "Fazer Upgrade Agora") : "Mudar de Plano"}
                        </Button>
                    )}
                    {!isFree && (
                        <p className="text-[10px] text-emerald-300/70 text-center leading-relaxed max-w-[160px]">
                            Sem renovação automática. No fim da validade volta a Gratuito.
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}
