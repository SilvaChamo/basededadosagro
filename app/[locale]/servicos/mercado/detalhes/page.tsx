"use client";

import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { ShoppingBag, Users, Shield, TrendingUp, CheckCircle, ArrowRight, Percent } from "lucide-react";

export default function MercadoDetalhesPage() {
    const benefits = [
        {
            title: "Para Produtores",
            icon: Users,
            color: "emerald",
            features: [
                "Acesso directo a compradores",
                "Melhores preços para a sua produção",
                "Pagamentos seguros e rápidos",
                "Visibilidade nacional",
                "Sem intermediários"
            ]
        },
        {
            title: "Para Compradores",
            icon: ShoppingBag,
            color: "blue",
            features: [
                "Produtos frescos directamente do produtor",
                "Preços competitivos",
                "Variedade de fornecedores",
                "Qualidade garantida",
                "Entregas programadas"
            ]
        }
    ];

    const howItWorks = [
        {
            step: "1",
            title: "Registo",
            description: "Crie a sua conta como produtor ou comprador na plataforma."
        },
        {
            step: "2",
            title: "Publicação/Procura",
            description: "Produtores publicam produtos. Compradores procuram o que precisam."
        },
        {
            step: "3",
            title: "Negociação",
            description: "Comuniquem directamente para acordar preços e quantidades."
        },
        {
            step: "4",
            title: "Transacção",
            description: "Finalizem a venda através da nossa plataforma segura."
        },
        {
            step: "5",
            title: "Entrega",
            description: "Coordenem a logística ou usem os nossos parceiros de transporte."
        }
    ];

    return (
        <main className="min-h-screen bg-slate-50">
            <PageHeader
                title="Compra & Venda - Detalhes"
                icon={ShoppingBag}
                backgroundImage="https://images.unsplash.com/photo-1542831371-29b0f74f9713?q=80&w=2000&auto=format&fit=crop"
                breadcrumbs={[
                    { label: "Início", href: "/" },
                    { label: "Serviços", href: "/servicos" },
                    { label: "Mercado", href: "/servicos/mercado" },
                    { label: "Detalhes", href: undefined }
                ]}
            />

            <div className="container-site relative z-20 mt-[50px] pb-24">
                {/* Intro */}
                <div className="bg-white rounded-[15px] shadow-lg shadow-slate-200/50 border border-slate-200 px-8 md:px-10 lg:px-12 py-10 md:py-12 mb-12">
                    <h2 className="text-2xl md:text-[45px] font-heading font-black text-slate-600 tracking-tight leading-[1.2] mb-6">
                        O mercado agrário na palma da <span className="text-[#f97316]">mão</span>
                    </h2>
                    <p className="text-sm text-slate-500 font-medium leading-relaxed">
                        A nossa plataforma de compra e venda conecta produtores directamente com compradores, eliminando intermediários e garantindo melhores preços para ambas as partes. Comercialize produtos agrícolas de forma segura, rápida e transparente.
                    </p>
                </div>

                {/* Benefits */}
                <div className="mb-12">
                    <h3 className="text-2xl md:text-3xl font-black text-slate-900 mb-6">
                        Benefícios para <span className="text-[#f97316]">Todos</span>
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {benefits.map((benefit, i) => (
                            <div key={i} className="p-8 rounded-[15px] bg-white border border-slate-200 shadow-lg shadow-slate-200/50">
                                <div className={`w-12 h-12 rounded-lg bg-${benefit.color}-50 flex items-center justify-center mb-4`}>
                                    <benefit.icon className={`w-6 h-6 text-${benefit.color}-500`} />
                                </div>
                                <h4 className="text-xl font-bold text-slate-900 mb-4">{benefit.title}</h4>
                                <ul className="space-y-3">
                                    {benefit.features.map((feature, j) => (
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

                {/* How It Works */}
                <div className="bg-white rounded-[15px] shadow-lg shadow-slate-200/50 border border-slate-200 p-8 md:p-10 mb-12">
                    <h3 className="text-2xl md:text-3xl font-black text-slate-900 mb-8 text-center">
                        Como <span className="text-[#f97316]">Funciona</span>
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                        {howItWorks.map((item, i) => (
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
                    <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-[15px] p-8 text-center text-white">
                        <Shield className="w-12 h-12 mx-auto mb-3 opacity-80" />
                        <p className="text-xl font-black mb-2">100% Seguro</p>
                        <p className="text-emerald-100 text-sm">Transacções protegidas</p>
                    </div>
                    <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-[15px] p-8 text-center text-white">
                        <TrendingUp className="w-12 h-12 mx-auto mb-3 opacity-80" />
                        <p className="text-xl font-black mb-2">+25%</p>
                        <p className="text-blue-100 text-sm">Aumento médio de lucro</p>
                    </div>
                    <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-[15px] p-8 text-center text-white">
                        <Percent className="w-12 h-12 mx-auto mb-3 opacity-80" />
                        <p className="text-xl font-black mb-2">Apenas 5%</p>
                        <p className="text-amber-100 text-sm">Comissão por transacção</p>
                    </div>
                </div>

                {/* CTA */}
                <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-[15px] p-8 md:p-12 text-center shadow-2xl shadow-slate-900/20">
                    <h3 className="text-2xl md:text-3xl font-black text-white mb-4">
                        Pronto para começar a vender ou comprar?
                    </h3>
                    <p className="text-slate-300 mb-6 max-w-2xl mx-auto">
                        Registe-se gratuitamente e comece a negociar hoje mesmo.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link
                            href="/contactos"
                            className="inline-flex items-center justify-center gap-2 bg-[#f97316] hover:bg-[#ea6a0a] text-white font-bold px-8 py-4 rounded-lg transition-all duration-300 hover:scale-105"
                        >
                            Registar como Produtor
                            <ArrowRight className="w-5 h-5" />
                        </Link>
                        <Link
                            href="/contactos"
                            className="inline-flex items-center justify-center gap-2 bg-white hover:bg-slate-100 text-slate-900 font-bold px-8 py-4 rounded-lg transition-all duration-300 hover:scale-105"
                        >
                            Registar como Comprador
                            <ArrowRight className="w-5 h-5" />
                        </Link>
                    </div>
                </div>
            </div>
        </main>
    );
}
