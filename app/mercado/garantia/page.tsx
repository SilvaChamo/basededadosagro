"use client";

import React from "react";
import { PageHeader } from "@/components/PageHeader";
import { ShieldCheck, Lock, RefreshCcw, Handshake, CheckCircle2, ArrowRight } from "lucide-react";
import Link from "next/link";

const benefits = [
    {
        icon: Lock,
        title: "Pagamentos Seguros",
        description: "O seu dinheiro é mantido em custódia até à confirmação da entrega. Garantimos segurança total nas transações."
    },
    {
        icon: RefreshCcw,
        title: "Política de Reembolso",
        description: "Se o produto não chegar ou for diferente do anunciado, receba o seu dinheiro de volta sem complicações."
    },
    {
        icon: Handshake,
        title: "Mediação de Disputas",
        description: "Equipe especializada para resolver qualquer conflito entre comprador e vendedor de forma justa e rápida."
    }
];

export default function GarantiaPage() {
    return (
        <div className="min-h-screen bg-white font-sans">
            <PageHeader
                title="Garantia de Negócio"
                icon={ShieldCheck}
                backgroundImage="https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?q=80&w=2000&auto=format&fit=crop"
                breadcrumbs={[
                    { label: "Início", href: "/" },
                    { label: "Mercado", href: "/mercado" },
                    { label: "Garantia", href: undefined }
                ]}
            />

            {/* Hero Section */}
            <section className="py-20 bg-slate-50">
                <div className="container-site text-center max-w-4xl mx-auto">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-100 text-orange-600 font-bold text-xs uppercase tracking-widest mb-6">
                        <ShieldCheck className="w-4 h-4" /> Proteção Total
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black text-slate-900 leading-tight mb-6">
                        Compre e venda com <span className="text-orange-500">Confiança Absoluta</span>
                    </h1>
                    <p className="text-lg text-slate-600 text-center max-w-2xl mx-auto mb-10 leading-relaxed">
                        A nossa Garantia de Negócio protege compradores e vendedores desde o pagamento até à entrega, assegurando que cada transação na plataforma seja segura e transparente.
                    </p>
                    <div className="flex justify-center gap-4">
                        <Link href="/mercado" className="px-8 py-4 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl shadow-lg shadow-orange-500/20 transition-all hover:-translate-y-1">
                            Explorar Mercado Seguro
                        </Link>
                    </div>
                </div>
            </section>

            {/* Benefits Grid */}
            <section className="py-24 container-site">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {benefits.map((benefit, index) => (
                        <div key={index} className="p-8 rounded-2xl bg-white border border-slate-100 hover:border-orange-100 shadow-sm hover:shadow-xl hover:shadow-orange-500/5 transition-all group text-center">
                            <div className="w-16 h-16 mx-auto bg-orange-50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                                <benefit.icon className="w-8 h-8 text-orange-500" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-4">{benefit.title}</h3>
                            <p className="text-slate-500 leading-relaxed font-medium">
                                {benefit.description}
                            </p>
                        </div>
                    ))}
                </div>
            </section>

            {/* How It Works */}
            <section className="py-20 bg-slate-900 text-white relative overflow-hidden">
                <div className="container-site relative z-10">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-black mb-4">Como Funciona?</h2>
                        <p className="text-slate-400">Processo simples e transparente para sua segurança.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
                        {/* Connecting Line */}
                        <div className="hidden md:block absolute top-1/2 left-0 w-full h-0.5 bg-slate-800 -z-10 -translate-y-1/2"></div>

                        {[1, 2, 3, 4].map((step) => (
                            <div key={step} className="bg-slate-800 p-6 rounded-xl border border-slate-700 relative text-center">
                                <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center font-bold text-white text-lg mx-auto mb-4 relative z-10 ring-4 ring-slate-900">
                                    {step}
                                </div>
                                <h4 className="font-bold text-lg mb-2">
                                    {step === 1 ? "Negociação" : step === 2 ? "Pagamento Seguro" : step === 3 ? "Entrega e Verificação" : "Liberação de Fundos"}
                                </h4>
                                <p className="text-xs text-slate-400">
                                    {step === 1 ? "Acorde os termos com o vendedor." : step === 2 ? "Fundo retido em conta escrow." : step === 3 ? "Confirme a recepção do produto." : "O vendedor recebe o pagamento."}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-5 bg-[radial-gradient(#f97316_1px,transparent_1px)] [background-size:16px_16px]"></div>
            </section>
        </div>
    );
}
