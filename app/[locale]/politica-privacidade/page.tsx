"use client";

import React from "react";
import { PageHeader } from "@/components/PageHeader";
import { Lock, Eye, ShieldCheck, Database, Bell } from "lucide-react";

export default function PrivacyPolicyPage() {
    const points = [
        {
            icon: Database,
            title: "Recolha de Dados",
            content: "Recolhemos dados básicos como nome, e-mail e informações da empresa estritamente para o funcionamento da plataforma e personalização da experiência do utilizador."
        },
        {
            icon: Lock,
            title: "Segurança da Informação",
            content: "Utilizamos protocolos de encriptação de última geração e Row Level Security (RLS) no nosso banco de dados para garantir que apenas o utilizador autorizado aceda aos seus dados privados."
        },
        {
            icon: Eye,
            title: "Uso de Cookies",
            content: "A nossa plataforma utiliza cookies para manter a sessão do utilizador activa e analisar métricas de tráfego de forma anónima, visando a melhoria contínua da interface."
        },
        {
            icon: Bell,
            title: "Comunicações",
            content: "O utilizador pode optar por receber notificações via SMS ou E-mail sobre actualizações de mercado, podendo estas ser desactivadas a qualquer momento no seu dashboard."
        }
    ];

    return (
        <main className="min-h-screen bg-slate-50">
            <PageHeader
                title={<>Política de <span className="text-emerald-600">Privacidade</span></>}
                icon={ShieldCheck}
                backgroundImage="https://images.unsplash.com/photo-1563986768609-322da13575f3?q=80&w=2000&auto=format&fit=crop"
                breadcrumbs={[
                    { label: "Início", href: "/" },
                    { label: "Privacidade", href: undefined }
                ]}
            />

            <div className="container-site py-20">
                <div className="max-w-5xl mx-auto">
                    {/* Intro Card */}
                    <div className="bg-emerald-950 p-12 md:p-16 rounded-[40px] text-white mb-12 shadow-2xl relative overflow-hidden">
                        <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl"></div>
                        <div className="relative z-10 max-w-2xl">
                            <h2 className="text-3xl md:text-4xl font-black mb-6 leading-tight">A sua privacidade é a nossa <span className="text-emerald-400">prioridade máxima.</span></h2>
                            <p className="text-slate-400 font-medium leading-relaxed">
                                Na Base Agro Data, acreditamos que a transparência é a base de qualquer parceria de sucesso. Esta política descreve como tratamos os seus dados com o maior rigor e respeito às leis de protecção de dados.
                            </p>
                        </div>
                    </div>

                    {/* Policy Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {points.map((point, i) => (
                            <div key={i} className="bg-white p-10 rounded-[30px] border border-slate-100 shadow-sm hover:shadow-md transition-all group">
                                <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-emerald-50 group-hover:scale-110 transition-all text-slate-400 group-hover:text-emerald-600">
                                    <point.icon className="w-7 h-7" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-800 mb-4">{point.title}</h3>
                                <p className="text-slate-500 text-sm leading-relaxed font-medium">
                                    {point.content}
                                </p>
                            </div>
                        ))}
                    </div>

                    {/* Footer Note */}
                    <div className="mt-16 text-center">
                        <p className="text-slate-400 text-xs font-medium max-w-xl mx-auto">
                            Para qualquer questão relacionada com os seus dados, pode contactar o nosso Encarregado de Protecção de Dados através do e-mail: <span className="text-emerald-600 font-bold">privacidade@basededadosagro.com</span>
                        </p>
                    </div>
                </div>
            </div>
        </main>
    );
}
