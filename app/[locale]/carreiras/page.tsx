"use client";

import React from "react";
import { PageHeader } from "@/components/PageHeader";
import { Briefcase, GraduationCap, Users, Heart, Star, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function CarreirasPage() {
    const opportunities = [
        {
            title: "Técnico Agrícola Sénior",
            location: "Chimoio, Manica",
            type: "Full-time",
            department: "Operações",
            icon: Briefcase
        },
        {
            title: "Desenvolvedor Full-stack (Next.js/Supabase)",
            location: "Remoto / Maputo",
            type: "Full-time",
            department: "Tecnologia",
            icon: Star
        },
        {
            title: "Especialista em Marketing Agrário",
            location: "Maputo",
            type: "Full-time",
            department: "Marketing",
            icon: Users
        }
    ];

    return (
        <main className="min-h-screen bg-slate-50">
            <PageHeader
                title={<>Trabalhe <span className="text-[#f97316]">connosco</span></>}
                icon={Briefcase}
                backgroundImage="https://images.unsplash.com/photo-1521737707317-017637841928?q=80&w=2000&auto=format&fit=crop"
                breadcrumbs={[
                    { label: "Início", href: "/" },
                    { label: "Carreiras", href: undefined }
                ]}
            />

            {/* Core Values / Why Join Us */}
            <section className="py-20 bg-white">
                <div className="container-site">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <h2 className="text-3xl font-black text-slate-800 mb-6 uppercase tracking-tight">Faça parte da revolução tecnológica no campo</h2>
                        <p className="text-slate-500 font-medium leading-relaxed italic">
                            Una-se a uma equipa apaixonada por transformar o sector agrário em Moçambique através de dados e inovação.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            {
                                title: "Causa Real",
                                desc: "Trabalhe em projectos que impactam directamente a vida de milhares de produtores.",
                                icon: Heart,
                                color: "text-red-500",
                                bg: "bg-red-50"
                            },
                            {
                                title: "Inovação Constante",
                                desc: "Utilizamos as tecnologias mais recentes do mercado para resolver desafios complexos.",
                                icon: GraduationCap,
                                color: "text-emerald-500",
                                bg: "bg-emerald-50"
                            },
                            {
                                title: "Crescimento Exponencial",
                                desc: "Ambiente de aprendizagem contínua e oportunidades reais de progressão.",
                                icon: Star,
                                color: "text-amber-500",
                                bg: "bg-amber-50"
                            }
                        ].map((item, i) => (
                            <div key={i} className="p-8 rounded-3xl border border-slate-100 bg-slate-50/30 hover:bg-white hover:shadow-xl transition-all group text-center">
                                <div className={`w-14 h-14 ${item.bg} ${item.color} rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform`}>
                                    <item.icon className="w-7 h-7" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-800 mb-3">{item.title}</h3>
                                <p className="text-slate-500 text-sm leading-relaxed">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Open Positions List */}
            <section className="py-20 bg-slate-50">
                <div className="container-site">
                    <div className="flex items-center justify-between mb-12">
                        <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Vagas em Aberto</h2>
                        <span className="text-xs font-black text-emerald-600 bg-emerald-100 px-3 py-1 rounded-full uppercase tracking-widest">{opportunities.length} Vagas</span>
                    </div>

                    <div className="space-y-4">
                        {opportunities.map((vaga, i) => (
                            <div key={i} className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-emerald-500/50 transition-colors group">
                                <div className="flex items-center gap-5">
                                    <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-emerald-50 group-hover:text-emerald-500 transition-colors">
                                        <vaga.icon className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h4 className="text-lg font-bold text-slate-800">{vaga.title}</h4>
                                        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1">
                                            <span className="text-xs font-medium text-slate-400 flex items-center gap-1">📍 {vaga.location}</span>
                                            <span className="text-xs font-medium text-slate-400 flex items-center gap-1">📂 {vaga.department}</span>
                                            <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest">{vaga.type}</span>
                                        </div>
                                    </div>
                                </div>
                                <Button className="bg-slate-900 hover:bg-[#f97316] text-white rounded-xl h-12 px-8 font-black uppercase text-xs tracking-widest transition-all">
                                    Candidatar-se <ArrowRight className="ml-2 w-4 h-4" />
                                </Button>
                            </div>
                        ))}
                    </div>

                    {/* Spontaneous Application */}
                    <div className="mt-16 bg-emerald-950 rounded-3xl p-10 md:p-16 relative overflow-hidden text-center text-white">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-600/10 blur-[100px]" />
                        <h3 className="text-2xl font-black mb-4 uppercase tracking-tight">Não encontrou a sua vaga?</h3>
                        <p className="text-slate-300 max-w-2xl mx-auto mb-10 font-medium">
                            Estamos sempre à procura de talentos excepcionais. Envie-nos uma candidatura espontânea e entraremos em contacto quando surgir uma oportunidade que se adapte ao seu perfil.
                        </p>
                        <Link href="/contactos">
                            <Button className="bg-[#f97316] hover:bg-white hover:text-slate-900 text-white px-10 h-14 rounded-xl font-black uppercase text-xs tracking-widest transition-all shadow-lg active:scale-95">
                                Candidatura Espontânea
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>
        </main>
    );
}
