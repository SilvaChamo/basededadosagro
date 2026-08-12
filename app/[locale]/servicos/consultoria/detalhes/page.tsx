"use client";

import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { Lightbulb, Target, TrendingUp, Zap, CheckCircle, ArrowRight, Users, Clock, BarChart } from "lucide-react";

export default function ConsultoriaDetalhesPage() {
    const packages = [
        {
            name: "Consultoria Básica",
            price: "A partir de 25.000 MT",
            duration: "1 sessão (4 horas)",
            features: [
                "Avaliação inicial do negócio",
                "Identificação de oportunidades digitais",
                "Plano de acção básico",
                "Relatório de recomendações"
            ],
            icon: Target,
            color: "blue"
        },
        {
            name: "Consultoria Avançada",
            price: "A partir de 75.000 MT",
            duration: "3 sessões (12 horas)",
            features: [
                "Análise profunda de processos",
                "Estratégia digital personalizada",
                "Implementação assistida",
                "Formação da equipa",
                "Acompanhamento mensal (3 meses)"
            ],
            icon: TrendingUp,
            color: "emerald",
            popular: true
        },
        {
            name: "Consultoria Premium",
            price: "Sob consulta",
            duration: "Programa personalizado",
            features: [
                "Transformação digital completa",
                "Consultoria executiva dedicada",
                "Implementação de sistemas",
                "Formação extensiva",
                "Suporte contínuo (12 meses)",
                "Acesso prioritário"
            ],
            icon: Zap,
            color: "amber"
        }
    ];

    const process = [
        {
            step: "1",
            title: "Contacto Inicial",
            description: "Entre em contacto connosco e agende uma reunião de descoberta gratuita."
        },
        {
            step: "2",
            title: "Avaliação",
            description: "Analisamos o seu negócio e identificamos oportunidades de melhoria."
        },
        {
            step: "3",
            title: "Proposta",
            description: "Apresentamos uma proposta personalizada com objectivos claros e cronograma."
        },
        {
            step: "4",
            title: "Implementação",
            description: "Trabalhamos lado a lado com a sua equipa para implementar as soluções."
        },
        {
            step: "5",
            title: "Acompanhamento",
            description: "Monitorizamos os resultados e ajustamos a estratégia conforme necessário."
        }
    ];

    return (
        <main className="min-h-screen bg-slate-50">
            <PageHeader
                title="Consultoria Digital - Detalhes"
                icon={Lightbulb}
                backgroundImage="https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=2000&auto=format&fit=crop"
                breadcrumbs={[
                    { label: "Início", href: "/" },
                    { label: "Serviços", href: "/servicos" },
                    { label: "Consultoria", href: "/servicos/consultoria" },
                    { label: "Detalhes", href: undefined }
                ]}
            />

            <div className="container-site relative z-20 mt-[50px] pb-24">
                {/* Intro */}
                <div className="bg-white rounded-[15px] shadow-lg shadow-slate-200/50 border border-slate-200 px-8 md:px-10 lg:px-12 py-10 md:py-12 mb-12">
                    <h2 className="text-2xl md:text-[45px] font-heading font-black text-slate-600 tracking-tight leading-[1.2] mb-6">
                        Transforme o seu agro-negócio com <span className="text-[#f97316]">consultoria especializada</span>
                    </h2>
                    <p className="text-sm text-slate-500 font-medium leading-relaxed">
                        A nossa consultoria digital oferece soluções personalizadas para modernizar o seu negócio agrícola. Com uma abordagem prática e orientada a resultados, ajudamos empresas a adoptarem tecnologias que aumentam a produtividade e a rentabilidade.
                    </p>
                </div>

                {/* Packages */}
                <div className="mb-12">
                    <h3 className="text-2xl md:text-3xl font-black text-slate-900 mb-6">
                        Pacotes de <span className="text-[#f97316]">Consultoria</span>
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {packages.map((pkg, i) => (
                            <div
                                key={i}
                                className={`p-8 rounded-[15px] bg-white border-2 ${pkg.popular ? 'border-[#f97316] shadow-2xl shadow-orange-200/50' : 'border-slate-200 shadow-lg shadow-slate-200/50'
                                    } transition-all duration-300 hover:-translate-y-1 relative`}
                            >
                                {pkg.popular && (
                                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#f97316] text-white text-xs font-bold px-4 py-1 rounded-full">
                                        MAIS POPULAR
                                    </div>
                                )}
                                <div className={`w-12 h-12 rounded-lg bg-${pkg.color}-50 flex items-center justify-center mb-4`}>
                                    <pkg.icon className={`w-6 h-6 text-${pkg.color}-500`} />
                                </div>
                                <h4 className="text-xl font-bold text-slate-900 mb-2">{pkg.name}</h4>
                                <p className="text-2xl font-black text-[#f97316] mb-1">{pkg.price}</p>
                                <p className="text-sm text-slate-600 mb-6">{pkg.duration}</p>
                                <ul className="space-y-3">
                                    {pkg.features.map((feature, j) => (
                                        <li key={j} className="flex items-start gap-2">
                                            <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                                            <span className="text-sm text-slate-700">{feature}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Process */}
                <div className="bg-white rounded-[15px] shadow-lg shadow-slate-200/50 border border-slate-200 p-8 md:p-10 mb-12">
                    <h3 className="text-2xl md:text-3xl font-black text-slate-900 mb-8 text-center">
                        Como <span className="text-[#f97316]">Funciona</span>
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                        {process.map((item, i) => (
                            <div key={i} className="text-center">
                                <div className="w-16 h-16 rounded-full bg-[#f97316] text-white text-2xl font-black flex items-center justify-center mx-auto mb-4">
                                    {item.step}
                                </div>
                                <h4 className="font-bold text-slate-900 mb-2">{item.title}</h4>
                                <p className="text-sm text-slate-600">{item.description}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-[15px] p-8 text-center text-white">
                        <Users className="w-12 h-12 mx-auto mb-3 opacity-80" />
                        <p className="text-4xl font-black mb-2">50+</p>
                        <p className="text-blue-100">Empresas Atendidas</p>
                    </div>
                    <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-[15px] p-8 text-center text-white">
                        <Clock className="w-12 h-12 mx-auto mb-3 opacity-80" />
                        <p className="text-4xl font-black mb-2">200+</p>
                        <p className="text-emerald-100">Horas de Consultoria</p>
                    </div>
                    <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-[15px] p-8 text-center text-white">
                        <BarChart className="w-12 h-12 mx-auto mb-3 opacity-80" />
                        <p className="text-4xl font-black mb-2">35%</p>
                        <p className="text-amber-100">Aumento Médio de Produtividade</p>
                    </div>
                </div>

                {/* CTA */}
                <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-[15px] p-8 md:p-12 text-center shadow-2xl shadow-slate-900/20">
                    <h3 className="text-2xl md:text-3xl font-black text-white mb-4">
                        Pronto para transformar o seu negócio?
                    </h3>
                    <p className="text-slate-300 mb-6 max-w-2xl mx-auto">
                        Agende uma reunião de descoberta gratuita e descubra como podemos ajudar.
                    </p>
                    <Link
                        href="/contactos"
                        className="inline-flex items-center gap-2 bg-[#f97316] hover:bg-[#ea6a0a] text-white font-bold px-8 py-4 rounded-lg transition-all duration-300 hover:scale-105"
                    >
                        Agendar Reunião Gratuita
                        <ArrowRight className="w-5 h-5" />
                    </Link>
                </div>
            </div>
        </main>
    );
}
