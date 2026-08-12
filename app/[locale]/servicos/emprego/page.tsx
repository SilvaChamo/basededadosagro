"use client";

import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { RecruitCTA } from "@/components/RecruitCTA";
import { Briefcase, MapPin, Building2, Clock, ArrowRight, Search } from "lucide-react";
import { ContactCTA } from "@/components/ContactCTA";

export default function EmpregoPage() {
    const jobs = [
        {
            title: "Engenheiro Agrónomo Sénior",
            company: "Agro-Mozambique Lda",
            location: "Nampula",
            type: "Full-time",
            description: "Responsável pela supervisão de culturas de grande escala e implementação de sistemas de rega eficientes.",
            iconBg: "bg-emerald-50",
            iconColor: "text-emerald-500"
        },
        {
            title: "Gestor de Unidade",
            company: "Fazendas do Niassa",
            location: "Lichinga",
            type: "Contrato",
            description: "Gestão operacional de unidade de produção, controle de stocks e liderança de equipas de campo.",
            iconBg: "bg-orange-50",
            iconColor: "text-orange-500"
        },
        {
            title: "Técnico de Extensão",
            company: "ONG Desenvolve Agro",
            location: "Manica",
            type: "Projecto",
            description: "Apoio técnico a pequenos agricultores, formação em práticas sustentáveis e monitoria de resultados.",
            iconBg: "bg-blue-50",
            iconColor: "text-blue-500"
        },
        {
            title: "Técnico de Irrigação",
            company: "Sistemas Hidro-Agro",
            location: "Chókwè, Gaza",
            type: "Full-time",
            description: "Instalação e manutenção de sistemas de rega gota-a-gota e pivot central para grandes produtores.",
            iconBg: "bg-cyan-50",
            iconColor: "text-cyan-500"
        }
    ];

    return (
        <main className="min-h-screen bg-slate-50">
            <PageHeader
                title="Vagas de Emprego"
                icon={Briefcase}
                backgroundImage="https://images.unsplash.com/photo-1590233461421-2e62057398fb?q=80&w=2000&auto=format&fit=crop"
                breadcrumbs={[
                    { label: "Início", href: "/" },
                    { label: "Serviços", href: "/servicos" },
                    { label: "Emprego", href: undefined }
                ]}
            />

            <div className="container-site relative z-20 mt-[50px] pb-24">
                {/* Jobs Grid - On Background */}
                <div className="grid grid-cols-1 gap-6">
                    {jobs.map((job, i) => (
                        <div key={i} className="p-6 md:p-8 rounded-[15px] bg-white border border-slate-200 shadow-lg shadow-slate-200/50 text-left transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-6 group cursor-pointer">
                            {/* Job Type Badge - Absolute Top Right */}
                            <span className="absolute top-6 right-6 md:top-8 md:right-8 text-[10px] font-black uppercase bg-slate-100 text-slate-500 px-2 py-1 rounded border border-slate-200">{job.type}</span>

                            <div className="flex flex-col gap-4">
                                <div className="flex items-start gap-4">
                                    <div className={`w-14 h-14 rounded-[10px] flex items-center justify-center shrink-0 ${job.iconBg}`}>
                                        <Building2 className={`h-7 w-7 ${job.iconColor}`} />
                                    </div>
                                    <div className="space-y-3 pr-12">
                                        <h4 className="text-xl font-bold text-slate-900 group-hover:text-[#f97316] transition-colors uppercase tracking-tight leading-tight">{job.title}</h4>
                                        <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-slate-400">
                                            <div className="flex items-center gap-1.5">
                                                <Building2 className="w-3.5 h-3.5 text-[#f97316]" />
                                                {job.company}
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <MapPin className="w-3.5 h-3.5 text-[#f97316]" />
                                                {job.location}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                {/* Description */}
                                <p className="text-sm text-slate-500 font-medium leading-relaxed pl-4 border-l-2 border-slate-100 line-clamp-2">
                                    {job.description}
                                </p>
                            </div>
                            <div className="flex items-center justify-between border-t border-slate-200 pt-3 mt-2">
                                <span className="flex items-center gap-1.5 text-[10px] font-black text-emerald-500 uppercase tracking-widest">
                                    <Clock className="w-3 h-3" /> há 2 dias
                                </span>
                                <div className="flex items-center gap-2 text-xs font-bold text-slate-400 group-hover:text-emerald-600 transition-colors cursor-pointer">
                                    Ver Detalhes
                                    <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <ContactCTA
                    title="Recrute os melhores talentos"
                    description="A sua empresa precisa de especialistas? Publique as suas vagas na maior base de dados agrária e conecte-se com profissionais qualificados."
                    buttonText="Falar com Especialistas"
                >
                    <RecruitCTA />
                </ContactCTA>
            </div>
        </main>
    );
}
