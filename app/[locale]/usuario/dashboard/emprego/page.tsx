"use client";

import { Briefcase, MapPin, Building2, Clock, ArrowRight } from "lucide-react";
import { DashboardPageHeader } from "@/components/DashboardPageHeader";

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
        <div className="space-y-8">
            <DashboardPageHeader
                title="Vagas de Emprego"
                description="Encontre oportunidades ou publique vagas para a sua empresa."
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {jobs.map((job, i) => (
                    <div key={i} className="p-6 md:p-8 md:pb-[15px] pb-[15px] rounded-[12px] bg-white border border-slate-200 shadow-lg shadow-slate-200/50 text-left transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl flex flex-col justify-between gap-4 group relative">
                        {/* Job Type Badge - Absolute Top Right */}
                        <span className="absolute top-6 right-6 md:top-8 md:right-8 text-[10px] font-black uppercase bg-slate-100 text-slate-500 px-2 py-1 rounded border border-slate-200">{job.type}</span>

                        <div className="flex flex-col gap-4">
                            <div className="flex items-start gap-4">
                                <div className={`w-14 h-14 rounded-[10px] flex items-center justify-center shrink-0 ${job.iconBg}`}>
                                    <Building2 className={`h-7 w-7 ${job.iconColor}`} />
                                </div>
                                <div className="space-y-3 pr-12">
                                    <h4 className="text-[20px] font-extrabold text-[#3a3f47] group-hover:text-[#f97316] transition-colors capitalize tracking-tight leading-tight">{job.title}</h4>
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
        </div>
    );
}
