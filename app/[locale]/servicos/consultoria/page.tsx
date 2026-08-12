"use client";

import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { Lightbulb, Target, TrendingUp, Zap, ArrowRight } from "lucide-react";
import { ContactCTA } from "@/components/ContactCTA";

export default function ConsultoriaPage() {
    const services = [
        {
            title: "Estratégia Digital",
            description: "Desenvolvimento de planos estratégicos para transformação digital do seu agro-negócio.",
            icon: Target,
            iconBg: "bg-blue-50",
            iconColor: "text-blue-500"
        },
        {
            title: "Otimização de Processos",
            description: "Análise e melhoria de processos operacionais através de soluções tecnológicas.",
            icon: TrendingUp,
            iconBg: "bg-emerald-50",
            iconColor: "text-emerald-500"
        },
        {
            title: "Implementação Tecnológica",
            description: "Suporte na adoção e integração de novas tecnologias agrícolas.",
            icon: Zap,
            iconBg: "bg-amber-50",
            iconColor: "text-amber-500"
        }
    ];

    return (
        <main className="min-h-screen bg-slate-50">
            <PageHeader
                title="Consultoria Digital"
                icon={Lightbulb}
                backgroundImage="https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=2000&auto=format&fit=crop"
                breadcrumbs={[
                    { label: "Início", href: "/" },
                    { label: "Serviços", href: "/servicos" },
                    { label: "Consultoria", href: undefined }
                ]}
            />

            <div className="container-site relative z-20 mt-[50px] pb-24">
                {/* Services Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    {services.map((service, i) => (
                        <div
                            key={i}
                            className="p-6 md:p-8 rounded-[15px] bg-white border border-slate-200 shadow-lg shadow-slate-200/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl flex flex-col gap-4"
                        >
                            <div className="flex items-center gap-4">
                                <div className={`w-12 h-12 rounded-[10px] flex items-center justify-center shrink-0 ${service.iconBg}`}>
                                    <service.icon className={`h-6 w-6 ${service.iconColor}`} />
                                </div>
                                <h3 className="text-xl font-bold leading-tight text-slate-900">{service.title}</h3>
                            </div>
                            <p className="text-sm leading-relaxed text-slate-500">
                                {service.description}
                            </p>
                        </div>
                    ))}
                </div>

                <ContactCTA
                    title="Pronto para transformar o seu agro-negócio?"
                    description="Entre em contacto connosco e descubra como a nossa consultoria estratégica pode impulsionar os seus resultados digitais."
                    buttonText="Solicitar Consultoria"
                />
            </div>
        </main>
    );
}
