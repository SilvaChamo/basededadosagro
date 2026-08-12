"use client";

import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { Truck, Ship, Globe, ShieldCheck, Clock, ArrowRight } from "lucide-react";
import { ContactCTA } from "@/components/ContactCTA";

export default function TransportePage() {
    const features = [
        {
            icon: Truck,
            title: "Transporte Terrestre",
            description: "Frota especializada para o transporte de produtos agrários em grandes quantidades por todo o território nacional.",
            iconBg: "bg-emerald-50",
            iconColor: "text-emerald-500"
        },
        {
            icon: Ship,
            title: "Logística Multimodal",
            description: "Integração eficiente entre transporte rodoviário e marítimo para escoamento de produção para exportação.",
            iconBg: "bg-blue-50",
            iconColor: "text-blue-500"
        },
        {
            icon: ShieldCheck,
            title: "Segurança de Carga",
            description: "Protocolos rigorosos de segurança e monitoramento em tempo real para garantir a integridade dos seus produtos.",
            iconBg: "bg-orange-50",
            iconColor: "text-orange-500"
        }
    ];

    return (
        <main className="min-h-screen bg-slate-50">
            <PageHeader
                title="Logística & Transporte"
                icon={Truck}
                backgroundImage="https://images.unsplash.com/photo-1586528116311-ad86d7c49390?q=80&w=2000&auto=format&fit=crop"
                breadcrumbs={[
                    { label: "Início", href: "/" },
                    { label: "Serviços", href: "/servicos" },
                    { label: "Transporte", href: undefined }
                ]}
            />

            <div className="container-site relative z-20 mt-[50px] pb-24">
                {/* Features Grid - On Background */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {features.map((f, i) => (
                        <div key={i} className="p-6 md:p-8 rounded-[15px] bg-white border border-slate-200 shadow-lg shadow-slate-200/50 text-left transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl flex flex-col gap-4">
                            <div className="flex items-start gap-4">
                                <div className={`w-12 h-12 rounded-[10px] flex items-center justify-center shrink-0 ${f.iconBg}`}>
                                    <f.icon className={`h-6 w-6 ${f.iconColor}`} />
                                </div>
                                <h3 className="text-xl font-bold leading-tight text-slate-900">{f.title}</h3>
                            </div>
                            <p className="text-sm leading-relaxed text-slate-500 flex-1">{f.description}</p>
                        </div>
                    ))}
                </div>

                {/* Bottom CTA */}
                <ContactCTA
                    title="Pronto para transportar grandes volumes?"
                    description="Seja para transporte nacional entre províncias ou para exportação em grandes quantidades, facilitamos a conexão com operadores logísticos certificados."
                    buttonText="Solicitar Cotação"
                />
            </div>
        </main>
    );
}
