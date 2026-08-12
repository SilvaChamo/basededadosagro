"use client";

import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { PenTool, Share2, Video, BarChart2, ArrowRight } from "lucide-react";
import { ContactCTA } from "@/components/ContactCTA";

export default function ConteudoPage() {
    const services = [
        {
            title: "Escrita Têcnica & Blog",
            description: "Criação de artigos e newsletters voltadas para o público agrário, garantindo relevância.",
            icon: PenTool,
            iconBg: "bg-blue-50",
            iconColor: "text-blue-500"
        },
        {
            title: "Gestão de Redes Sociais",
            description: "Estratégias personalizadas para Instagram, Facebook e LinkedIn do seu agro-negócio.",
            icon: Share2,
            iconBg: "bg-emerald-50",
            iconColor: "text-emerald-500"
        },
        {
            title: "Produção de Media",
            description: "Fotografia e vídeo profissional para documentar fazendas e projectos rurais.",
            icon: Video,
            iconBg: "bg-orange-50",
            iconColor: "text-orange-500"
        }
    ];

    return (
        <main className="min-h-screen bg-slate-50">
            <PageHeader
                title="Criação & Gestão de Conteúdo"
                icon={PenTool}
                backgroundImage="https://images.unsplash.com/photo-1499750310107-5fef28a66643?q=80&w=2000&auto=format&fit=crop"
                breadcrumbs={[
                    { label: "Início", href: "/" },
                    { label: "Serviços", href: "/servicos" },
                    { label: "Conteúdo", href: undefined }
                ]}
            />

            <div className="container-site relative z-20 mt-[50px] pb-24">
                {/* Services Grid - On Background */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {services.map((s, i) => (
                        <div key={i} className="p-6 md:p-8 rounded-[15px] bg-white border border-slate-200 shadow-lg shadow-slate-200/50 text-left transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl flex flex-col gap-4 group">
                            <div className="flex items-start gap-4">
                                <div className={`w-12 h-12 rounded-[10px] flex items-center justify-center shrink-0 ${s.iconBg}`}>
                                    <s.icon className={`h-6 w-6 ${s.iconColor}`} />
                                </div>
                                <h3 className="text-xl font-bold leading-tight text-slate-900 group-hover:text-blue-600 transition-colors">{s.title}</h3>
                            </div>
                            <p className="text-sm leading-relaxed text-slate-500 flex-1">{s.description}</p>
                            <div className="flex items-center gap-2 text-xs font-bold text-slate-400 group-hover:text-slate-900 transition-colors pt-4">
                                Saber Mais <ArrowRight className="h-3 w-3" />
                            </div>
                        </div>
                    ))}
                </div>

                <ContactCTA
                    title="Quer uma estratégia digital completa?"
                    description="Não basta apenas publicar, é necessário estratégia. Criamos o tom de voz ideal para a sua marca agro no digital."
                    buttonText="Solicitar Proposta"
                />
            </div>
        </main>
    );
}
