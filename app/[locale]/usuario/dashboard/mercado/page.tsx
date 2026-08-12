"use client";

import { TrendingUp, Tags, ShieldCheck, ArrowUpRight } from "lucide-react";
import { DashboardPageHeader } from "@/components/DashboardPageHeader";

export default function MercadoPage() {
    const marketInfo = [
        {
            title: "Cotações do Dia",
            description: "Acompanhe os preços médios do milho, feijão e outros produtos nas principais praças nacionais.",
            icon: TrendingUp,
            iconBg: "bg-emerald-50",
            iconColor: "text-emerald-500",
            val: "+5.2%"
        },
        {
            title: "Ofertas de Venda",
            description: "Explore anúncios de produtores que procuram escoar grandes quantidades de produção.",
            icon: Tags,
            iconBg: "bg-orange-50",
            iconColor: "text-orange-500",
            val: "1.2k+"
        },
        {
            title: "Garantia de Negócio",
            description: "Transações seguras e monitoradas para garantir que o pagamento e a entrega ocorram sem falhas.",
            icon: ShieldCheck,
            iconBg: "bg-blue-50",
            iconColor: "text-blue-500",
            val: "100%"
        }
    ];

    return (
        <div className="space-y-8">
            <DashboardPageHeader
                title="Mercado Agrícola"
                description="Plataforma dedicada à comercialização de produtos e serviços agrícolas em Moçambique."
            />

            {/* Market Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {marketInfo.map((item, i) => (
                    <div key={i} className="p-6 md:p-8 rounded-[12px] bg-white border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col gap-4 group cursor-pointer">
                        <div className="flex items-start justify-between">
                            <div className="flex items-start gap-4">
                                <div className={`w-12 h-12 rounded-[10px] flex items-center justify-center shrink-0 ${item.iconBg}`}>
                                    <item.icon className={`h-6 w-6 ${item.iconColor}`} />
                                </div>
                                <div className="space-y-1">
                                    <h3 className="text-lg font-bold leading-tight text-[#3a3f47] group-hover:text-[#f97316] transition-colors">{item.title}</h3>
                                    <span className="text-2xl font-black text-[#3a3f47]">{item.val}</span>
                                </div>
                            </div>
                        </div>
                        <p className="text-sm leading-relaxed text-slate-500 flex-1">{item.description}</p>
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-400 group-hover:text-[#3a3f47] transition-colors pt-4 border-t border-slate-100 mt-2">
                            Aceder <ArrowUpRight className="h-3 w-3" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
