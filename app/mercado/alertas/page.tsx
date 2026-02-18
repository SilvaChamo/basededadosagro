"use client";

import React from "react";
import { PageHeader } from "@/components/PageHeader";
import { Bell, CloudRain, Bug, TrendingUp, AlertTriangle, ArrowRight, ShieldCheck } from "lucide-react";
import Link from "next/link";

const mockAlerts = [
    {
        id: 1,
        type: "weather",
        title: "Risco de Chuva Forte",
        location: "Manica, Província",
        description: "Previsão de precipitação acima de 50mm nas próximas 24h. Recomendada a suspensão de colheitas.",
        time: "Há 2 horas",
        severity: "high",
        icon: CloudRain
    },
    {
        id: 2,
        type: "pest",
        title: "Alerta de Praga: Lagarta do Funil",
        location: "Sofala, Distrito de Dondo",
        description: "Focos identificados em plantações de milho. Aconselha-se monitoria imediata.",
        time: "Há 5 horas",
        severity: "medium",
        icon: Bug
    },
    {
        id: 3,
        type: "market",
        title: "Alta no Preço do Milho",
        location: "Nacional",
        description: "O preço médio do milho registou uma subida de 5% devido à escassez na região sul.",
        time: "Há 8 horas",
        severity: "low",
        icon: TrendingUp
    }
];

export default function AlertasPage() {
    return (
        <div className="min-h-screen bg-slate-50 font-sans">
            <PageHeader
                title="Alertas de Mercado"
                icon={Bell}
                backgroundImage="https://images.unsplash.com/photo-1595839011500-e902df595304?q=80&w=2000&auto=format&fit=crop"
                breadcrumbs={[
                    { label: "Início", href: "/" },
                    { label: "Mercado", href: "/mercado" },
                    { label: "Alertas", href: undefined }
                ]}
            />

            <div className="container-site py-12">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Alerts Feed */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                            <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                                <AlertTriangle className="w-5 h-5 text-orange-500" />
                                Alertas Recentes
                            </h2>

                            <div className="space-y-4">
                                {mockAlerts.map((alert) => (
                                    <div key={alert.id} className="p-5 rounded-xl border border-slate-100 hover:border-orange-100 hover:shadow-md transition-all bg-white group">
                                        <div className="flex items-start gap-4">
                                            <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${alert.severity === 'high' ? 'bg-red-50 text-red-500' :
                                                    alert.severity === 'medium' ? 'bg-orange-50 text-orange-500' :
                                                        'bg-blue-50 text-blue-500'
                                                }`}>
                                                <alert.icon className="w-6 h-6" />
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex flex-wrap justify-between items-start gap-2 mb-1">
                                                    <h3 className="font-bold text-slate-900 group-hover:text-orange-600 transition-colors">
                                                        {alert.title}
                                                    </h3>
                                                    <span className="text-xs font-medium text-slate-400 bg-slate-100 px-2 py-1 rounded-full">
                                                        {alert.time}
                                                    </span>
                                                </div>
                                                <p className="text-sm font-medium text-slate-500 mb-2">{alert.location}</p>
                                                <p className="text-slate-600 text-sm leading-relaxed">
                                                    {alert.description}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Premium Subscription Card */}
                        <div className="bg-slate-900 rounded-2xl p-8 text-white relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/20 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>

                            <ShieldCheck className="w-10 h-10 text-orange-500 mb-4" />
                            <h3 className="text-xl font-bold mb-2">Alertas Premium</h3>
                            <p className="text-slate-400 text-sm mb-6 leading-relaxed">
                                Receba notificações via SMS e WhatsApp instantaneamente. Não perca nenhuma oportunidade de negócio.
                            </p>

                            <button className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2">
                                Ativar Notificações <Bell className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Quick Links */}
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                            <h3 className="font-bold text-slate-800 mb-4">Links Rápidos</h3>
                            <ul className="space-y-3">
                                <li>
                                    <Link href="/mercado" className="flex items-center justify-between text-slate-600 hover:text-orange-500 transition-colors text-sm font-medium group">
                                        Análise de Mercado
                                        <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/servicos/insumos" className="flex items-center justify-between text-slate-600 hover:text-orange-500 transition-colors text-sm font-medium group">
                                        Comprar Insumos
                                        <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </Link>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
