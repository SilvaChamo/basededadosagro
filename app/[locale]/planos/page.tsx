"use client";

import React, { useState } from "react";
import { Check, X, Crown, Zap, Shield, HelpCircle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";

export default function PricingPage() {
    const [isAnnual, setIsAnnual] = useState(false);

    const plans = [
        {
            name: "Gratuito",
            price: "Gratuito",
            description: "Para quem está começando a explorar o mercado.",
            features: [
                "Newsletter",
                "Explorar recursos gratuitos",
                "Notificações sobre eventos",
                "Alertas sobre financiamento",
                "Cadastro simples da empresa",
                "Partilha de perfil da empresa",
                "Suporte via e-mail"
            ],
            notIncluded: [],
            cta: "Registar plano",
            popular: false,
            color: "slate"
        },
        {
            name: "Básico",
            price: isAnnual ? "9 600 MT" : "1 000 MT",
            period: isAnnual ? "/ano" : "/mês",
            description: "Para profissionais e pequenas empresas em crescimento.",
            features: [
                "Tudo do Free",
                "Alertas sobre financiamento",
                "5% descontos nos eventos",
                "Cadastrar básico da empresa",
                "Cadastro limitado de produto",
                "10% Descontos nos serviços",
                "Destacar empresa na plataforma"
            ],
            notIncluded: [],
            cta: "Registar plano",
            popular: true,
            color: "orange"
        },
        {
            name: "Premium",
            price: isAnnual ? "24 000 MT" : "2 500 MT",
            period: isAnnual ? "/ano" : "/mês",
            description: "Para grandes empresas que precisam de visibilidade total.",
            features: [
                "Cobertura gratuita de eventos",
                "Publicar financiamento",
                "10% descontos nos eventos",
                "20% descontos em serviços",
                "Solicitar produtos disponíveis",
                "Cadastrar eventos",
                "Cadastrar vaga de emprego"
            ],
            notIncluded: [],
            cta: "Registar plano",
            popular: false,
            color: "emerald"
        },
        {
            name: "Business Vendedor",
            price: isAnnual ? "48 000 MT" : "5 000 MT",
            period: isAnnual ? "/ano" : "/mês",
            description: "Para vendedores profissionais que desejam escala nacional.",
            features: [
                "Produtos ilimitados",
                "Selo de Vendedor Verificado",
                "Loja personalizada no Mercado",
                "Relatórios de vendas avançados",
                "Destaque premium nos produtos",
                "Uma publicidade por mês",
                "Destaque premium da empresa"
            ],
            notIncluded: [],
            cta: "Registar plano",
            popular: false,
            color: "emerald"
        }
    ];

    return (
        <div className="min-h-screen bg-slate-50 font-sans">
            {/* Header / Navbar Simplificada */}
            <header className="bg-white border-b border-slate-200 py-4">
                <div className="max-w-6xl mx-auto px-4 flex items-center justify-between">
                    <Link href="/usuario/dashboard" className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors font-medium">
                        <ArrowLeft className="w-5 h-5" />
                        Voltar ao Dashboard
                    </Link>
                    <Link href="/">
                        <Image
                            src="/Logo.svg"
                            alt="Base Agro Data"
                            width={140}
                            height={50}
                            className="h-8 w-auto"
                            priority
                        />
                    </Link>
                    <div className="w-[140px] hidden md:block"></div> {/* Spacer for center alignment */}
                </div>
            </header>

            <main className="py-16">
                <div className="container-site">

                    {/* Hero Section */}
                    <div className="text-center mb-16 max-w-3xl mx-auto">
                        <span className="text-orange-600 font-bold tracking-wider uppercase text-sm bg-orange-50 px-3 py-1 rounded-full mb-4 inline-block">
                            Planos Flexíveis
                        </span>
                        <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-6 tracking-tight">
                            Escolha o plano ideal para o seu <span className="text-orange-600">crescimento</span>.
                        </h1>

                        {/* Toggle Anual/Mensal */}
                        <div className="flex items-center justify-center gap-4 mt-10">
                            <span className={`text-sm font-bold ${!isAnnual ? 'text-slate-900' : 'text-slate-400'}`}>Mensal</span>
                            <button
                                onClick={() => setIsAnnual(!isAnnual)}
                                className={`w-16 h-8 rounded-full p-1 transition-colors duration-300 relative ${isAnnual ? 'bg-emerald-600' : 'bg-slate-300'}`}
                            >
                                <div className={`w-6 h-6 bg-white rounded-full shadow-md transform transition-transform duration-300 ${isAnnual ? 'translate-x-8' : 'translate-x-0'}`}></div>
                            </button>
                            <span className={`text-sm font-bold ${isAnnual ? 'text-slate-900' : 'text-slate-400'}`}>
                                Anual <span className="text-emerald-600 text-xs ml-1 bg-emerald-50 px-2 py-0.5 rounded-full">-20% OFF</span>
                            </span>
                        </div>
                    </div>

                    {/* Pricing Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 items-stretch">
                        {plans.map((plan) => (
                            <div
                                key={plan.name}
                                className={`relative bg-white rounded-2xl border hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 flex flex-col ${plan.popular
                                    ? 'border-orange-500 shadow-xl z-10 scale-[1.03] ring-4 ring-orange-500/5'
                                    : 'border-slate-200 shadow-sm'
                                    }`}
                            >
                                {plan.popular && (
                                    <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-[80%] h-10 bg-orange-600 rounded-full z-0 shadow-lg" />
                                )}

                                {/* Header with Dark Background */}
                                <div className="bg-slate-900 p-5 text-center rounded-t-2xl relative z-10">
                                    <h3 className="text-2xl font-[800] text-white mb-2">{plan.name}</h3>
                                    <p className="text-sm text-slate-400 min-h-[40px] leading-relaxed line-clamp-2">{plan.description}</p>
                                </div>

                                {/* Minimalist Orange Line with Badge */}
                                <div className="relative w-full h-[3px] bg-orange-600">
                                    {plan.popular && (
                                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-orange-600 text-white px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider shadow-md whitespace-nowrap border border-white/20 z-20">
                                            Mais Popular
                                        </div>
                                    )}
                                </div>

                                <div className="p-5 bg-slate-50/80">
                                    <div className="mb-1 flex flex-col items-center justify-center">
                                        <div className="flex items-baseline gap-1">
                                            <span className={`text-4xl font-black ${plan.popular ? 'text-orange-600' : 'text-slate-900'}`}>
                                                {plan.price}
                                            </span>
                                            {plan.period && <span className="text-slate-400 font-medium">{plan.period}</span>}
                                        </div>
                                    </div>
                                </div>

                                <div className="w-full h-[1px] bg-slate-300" />

                                <div className="p-5 flex flex-col flex-1">
                                    <div className="space-y-2 w-full mb-6 flex-1">
                                        <ul className="space-y-1.5">
                                            {plan.features.map((feature) => (
                                                <li key={feature} className="flex items-start justify-start gap-2 text-sm text-slate-700 text-left">
                                                    <div className={`p-0.5 mt-0.5 rounded-full shrink-0 ${plan.popular ? 'bg-orange-100 text-orange-600' : 'bg-emerald-100 text-emerald-600'}`}>
                                                        <Check className="w-3 h-3" />
                                                    </div>
                                                    {feature}
                                                </li>
                                            ))}
                                            {plan.notIncluded.map((feature) => (
                                                <li key={feature} className="flex items-start justify-start gap-2 text-sm text-slate-400 text-left">
                                                    <div className="p-0.5 mt-0.5 rounded-full shrink-0 bg-slate-100 text-slate-400">
                                                        <X className="w-3 h-3" />
                                                    </div>
                                                    {feature}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    {/* Minimalist Bottom Button */}
                                    <div className="mt-auto flex justify-start">
                                        <Link
                                            href={`/checkout/registro?plan=${encodeURIComponent(plan.name)}&price=${encodeURIComponent(plan.price)}&period=${encodeURIComponent(plan.period || '')}`}
                                            className="w-fit cursor-pointer"
                                        >
                                            <Button
                                                className={`px-4 h-9 rounded-[8px] font-bold text-sm transition-all hover:text-white w-full cursor-pointer ${plan.popular
                                                    ? 'bg-orange-600 hover:bg-gradient-to-r hover:from-orange-600 hover:to-emerald-600 shadow-lg shadow-orange-600/20 text-white'
                                                    : `hover:bg-orange-600 ${plan.color === 'emerald'
                                                        ? 'bg-emerald-700 text-white'
                                                        : 'bg-slate-800 text-white'
                                                    }`}`}
                                            >
                                                {plan.name === "Gratuito" ? "Activar Grátis" : plan.cta}
                                            </Button>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                </div>
            </main>

            {/* Partner Plan / Support Section with White Background */}
            <section className="bg-white py-16 border-t border-slate-200">
                <div className="container-site text-center">
                    <h4 className="text-2xl font-black text-slate-900 mb-4">Quer assinar o Plano Parceiro?</h4>
                    <p className="text-slate-600 mb-8 max-w-2xl mx-auto">
                        Entre em contacto com a nossa equipe do sector comercial que está pronta para ajudar você a celebrar uma parceria.
                    </p>
                    <Link href="/contactos">
                        <Button variant="outline" className="gap-2 px-[25px] py-[8px] rounded-[7px] font-bold border-slate-300 hover:bg-slate-50 transition-all cursor-pointer">
                            <HelpCircle className="w-5 h-5 text-orange-600" />
                            Falar connossco
                        </Button>
                    </Link>
                </div>
            </section>
        </div>
    );
}
