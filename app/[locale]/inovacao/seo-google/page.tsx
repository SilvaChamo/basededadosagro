"use client";

import React from "react";
import { Search, Globe, TrendingUp, BarChart3, CheckCircle2, ArrowRight, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function SEOGooglePage() {
    return (
        <main className="min-h-screen bg-white">
            {/* Hero Section */}
            <section className="pt-32 pb-20 bg-white relative overflow-hidden">
                <div className="absolute top-10 left-10 w-64 h-64 bg-[#4285F4]/10 rounded-full blur-[80px] pointer-events-none animate-pulse"></div>
                <div className="absolute bottom-10 right-10 w-80 h-80 bg-[#34A853]/10 rounded-full blur-[100px] pointer-events-none animate-pulse delay-1000"></div>
                <div className="container-site relative z-10 text-center">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-100 mb-6">
                        <Search className="w-4 h-4 text-emerald-600" />
                        <span className="text-xs font-bold uppercase tracking-widest text-emerald-700">Visibilidade Inteligente</span>
                    </div>
                    <h1 className="text-[45px] font-[900] text-slate-800 mb-6 leading-tight tracking-tight max-w-4xl mx-auto">
                        A Sua Empresa no <br />
                        <span className="inline-flex">
                            <span className="text-[#4285F4]">G</span>
                            <span className="text-[#EA4335]">o</span>
                            <span className="text-[#FBBC05]">o</span>
                            <span className="text-[#4285F4]">g</span>
                            <span className="text-[#34A853]">l</span>
                            <span className="text-[#EA4335]">e</span>
                        </span> em Primeiras Pesquisas
                    </h1>
                    <p className="text-xl text-slate-600 leading-relaxed font-medium mb-8 max-w-2xl mx-auto">
                        Não basta ter um site. É preciso ser encontrado. O nosso sistema de SEO automatizado coloca o seu negócio diante dos olhos de quem procura em Moçambique.
                    </p>
                </div>
            </section>

            {/* How it Works Section */}
            <section className="py-24 bg-slate-50 border-y border-slate-100">
                <div className="container-site grid lg:grid-cols-2 gap-16 items-center">
                    <div className="relative">
                        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xl max-w-md transform hover:scale-105 transition-all duration-500">
                            <div className="flex items-center gap-2 mb-4">
                                <Search className="w-4 h-4 text-slate-400" />
                                <div className="flex-1 bg-slate-100 rounded-full h-8 flex items-center px-3">
                                    <span className="text-xs text-slate-500 font-mono">fornecedor de sementes maputo</span>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div className="font-sans">
                                    <p className="text-[#1a0dab] text-lg hover:underline cursor-pointer">Sementes Express - Base de Dados Agro</p>
                                    <p className="text-[#006621] text-sm">https://www.basededadosagro.com/empresas/sementes-express</p>
                                    <p className="text-slate-600 text-sm mt-1">
                                        Fornecedor líder de sementes certificadas em Moçambique. Entrega em todo o país. Contactos e catálogo...
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="absolute -bottom-10 -right-6 bg-emerald-600 text-white p-6 rounded-2xl shadow-2xl animate-bounce">
                            <TrendingUp className="w-8 h-8" />
                            <p className="text-[10px] font-bold uppercase mt-2 tracking-widest text-emerald-100">Crescimento Orgânico</p>
                        </div>
                    </div>
                    <div>
                        <h2 className="text-[45px] font-black text-slate-800 mb-6 tracking-tight">Otimização Automática</h2>
                        <p className="text-slate-600 font-medium text-lg leading-relaxed mb-8">
                            Ao registar a sua empresa na Base Agro Data, a nossa infra-estrutura técnica encarrega-se do trabalho pesado de indexação.
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            {[
                                { title: "Indexação Google", desc: "Crawling imediato para garantir que o seu perfil aparece no Google.", icon: <Globe className="w-5 h-5 text-emerald-500" /> },
                                { title: "Autoridade de Domínio", desc: "Beneficie do tráfego qualificado de um portal já estabelecido.", icon: <ShieldCheck className="w-5 h-5 text-emerald-500" /> },
                                { title: "Schema Markup", desc: "Dados estruturados para que o Google entenda exatamente o que vende.", icon: <BarChart3 className="w-5 h-5 text-emerald-500" /> },
                                { title: "Otimização Local", desc: "Apareça quando os clientes pesquisam por serviços perto deles.", icon: <CheckCircle2 className="w-5 h-5 text-emerald-500" /> }
                            ].map((item, i) => (
                                <div key={i} className="flex flex-col gap-2">
                                    <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center">
                                        {item.icon}
                                    </div>
                                    <h4 className="font-bold text-slate-800">{item.title}</h4>
                                    <p className="text-sm text-slate-500 font-medium">{item.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Advantages Section */}
            <section className="py-24 container-site">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <h2 className="text-[45px] font-black text-slate-800 mb-4 tracking-tight">Porquê Escolher a Nossa Plataforma?</h2>
                    <p className="text-slate-600 font-medium">Ter uma página na internet não é o mesmo que ter visibilidade. Com a Base Agro Data, você obtém uma vantagem injusta no mercado digital moçambicano.</p>
                </div>
                <div className="grid md:grid-cols-3 gap-8">
                    {[
                        { title: "Redução de Custos", desc: "Não precisa de contratar uma agência de SEO. O sistema já está configurado para si." },
                        { title: "Credibilidade Instantânea", desc: "Aparecer no nosso diretório transmite confiança aos compradores e parceiros." },
                        { title: "Tração de Vendas", desc: "Mais visitas ao seu perfil traducem-se em mais chamadas e pedidos de orçamento." }
                    ].map((item, i) => (
                        <div key={i} className="p-8 bg-white border border-slate-200 rounded-2xl hover:border-emerald-500 transition-colors shadow-sm">
                            <h3 className="text-xl font-bold text-slate-800 mb-4">{item.title}</h3>
                            <p className="text-slate-600 font-medium leading-relaxed">{item.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* CTA */}
            <section className="py-24 bg-emerald-600 text-white">
                <div className="container-site text-center">
                    <h2 className="text-[45px] font-black mb-8">Comece a ser visto agora mesmo</h2>
                    <div className="flex flex-wrap justify-center gap-4">
                        <Link href="/registar">
                            <Button className="bg-white text-emerald-600 hover:bg-slate-100 font-bold px-8 h-12 rounded-xl">
                                Registar Minha Empresa
                            </Button>
                        </Link>
                        <Link href="/contactos">
                            <Button variant="outline" className="border-white text-white hover:bg-white/10 font-bold px-8 h-12 rounded-xl">
                                Consultar Planos de Visibilidade
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>
        </main>
    );
}
