"use client";

import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { Monitor, Settings, Headphones, Rocket, ArrowRight } from "lucide-react";
import { ContactCTA } from "@/components/ContactCTA";

export default function AssistenciaPage() {
    const services = [
        {
            title: "Criação de Portais",
            description: "Desenvolvimento de sites institucionais, blogs e catálogos para projectos agrários.",
            icon: Rocket,
            iconBg: "bg-emerald-50",
            iconColor: "text-emerald-500"
        },
        {
            title: "Apoio Técnico TI",
            description: "Soluções e assistência para a modernização das suas ferramentas de gestão digital.",
            icon: Settings,
            iconBg: "bg-blue-50",
            iconColor: "text-blue-500"
        },
        {
            title: "Suporte Online",
            description: "Equipa dedicada para garantir a manutenção e operacionalidade das suas plataformas.",
            icon: Headphones,
            iconBg: "bg-orange-50",
            iconColor: "text-orange-500"
        }
    ];

    return (
        <main className="min-h-screen bg-slate-50">
            <PageHeader
                title="Assistência Digital"
                icon={Monitor}
                backgroundImage="https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2000&auto=format&fit=crop"
                breadcrumbs={[
                    { label: "Início", href: "/" },
                    { label: "Serviços", href: "/servicos" },
                    { label: "Assistência", href: undefined }
                ]}
            />

            <div className="container-site relative z-20 mt-[50px] pb-24">


                {/* Services Grid - On Background */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {services.map((service, i) => (
                        <div key={i} className="p-6 md:p-8 rounded-[15px] bg-white border border-slate-200 shadow-lg shadow-slate-200/50 text-left transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl flex flex-col gap-4 group">
                            <div className="flex items-start gap-4">
                                <div className={`w-12 h-12 rounded-[10px] flex items-center justify-center shrink-0 ${service.iconBg}`}>
                                    <service.icon className={`h-6 w-6 ${service.iconColor}`} />
                                </div>
                                <h3 className="text-xl font-bold leading-tight text-slate-900 group-hover:text-emerald-600 transition-colors">
                                    {service.title}
                                </h3>
                            </div>
                            <p className="text-sm leading-relaxed text-slate-500 flex-1">
                                {service.description}
                            </p>
                            <div className="flex items-center gap-2 text-xs font-bold text-slate-400 group-hover:text-slate-900 transition-colors pt-4">
                                Saber Mais <ArrowRight className="h-3 w-3" />
                            </div>
                        </div>
                    ))}
                </div>

                {/* Bottom CTA */}
                <ContactCTA
                    title="Pronto para digitalizar o seu negócio?"
                    description="Oferecemos consultoria tecnológica especializada para modernizar a sua presença online no sector agrário."
                    buttonText="Falar com Especialistas"
                />
            </div>
        </main>
    );
}
