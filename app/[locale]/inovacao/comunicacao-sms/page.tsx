"use client";

import React from "react";
import { MessageSquare, Zap, Globe, ShieldCheck, Mail, ArrowRight, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function CommunicationSMSPage() {
    return (
        <main className="min-h-screen bg-white">
            {/* Hero Section */}
            <section className="pt-32 pb-20 bg-slate-900 text-white relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1556761175-5973dc0f32e7?q=80&w=2000&auto=format&fit=crop')] opacity-20 bg-cover bg-center bg-fixed mix-blend-overlay scale-110"></div>
                <div className="container-site relative z-10">
                    <div className="max-w-3xl">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-6">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                            <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">Inovação em Comunicação</span>
                        </div>
                        <h1 className="text-[45px] font-[900] mb-6 leading-tight tracking-tight text-white">
                            Comunicação <span className="text-[#f97316]">Massiva e Direta</span>
                        </h1>
                        <p className="text-xl text-slate-300 leading-relaxed font-medium mb-8">
                            Chegue onde os outros não chegam. O nosso sistema de SMS massivo permite comunicar com produtores em tempo real, mesmo sem internet.
                        </p>
                    </div>
                </div>
            </section>

            {/* Advantages Section */}
            <section className="py-24 container-site">
                <div className="grid lg:grid-cols-2 gap-16 items-center">
                    <div>
                        <h2 className="text-[45px] font-black text-slate-800 mb-8 tracking-tight">Vantagens <span className="text-emerald-600">Estratégicas</span></h2>
                        <div className="space-y-8">
                            {[
                                {
                                    title: "Alcance Instantâneo",
                                    desc: "Taxa de abertura de 98% em menos de 3 minutos. O SMS é a ferramenta mais eficaz para alertas urgentes.",
                                    icon: <Zap className="w-6 h-6 text-emerald-600" />
                                },
                                {
                                    title: "Independente de Internet",
                                    desc: "Ideal para o contexto rural de Moçambique, onde o sinal de dados pode ser limitado.",
                                    icon: <Globe className="w-6 h-6 text-emerald-600" />
                                },
                                {
                                    title: "Segmentação Inteligente",
                                    desc: "Envie mensagens apenas para produtores de uma província específica ou de uma determinada cultura.",
                                    icon: <ShieldCheck className="w-6 h-6 text-emerald-600" />
                                }
                            ].map((item, i) => (
                                <div key={i} className="flex gap-4">
                                    <div className="shrink-0 w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center">
                                        {item.icon}
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-slate-800 mb-2">{item.title}</h3>
                                        <p className="text-slate-600 font-medium leading-relaxed">{item.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="bg-slate-50 rounded-[20px] p-8 border border-slate-100 shadow-sm">
                        <div className="space-y-6">
                            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                                <p className="text-xs font-bold text-emerald-600 uppercase mb-2">Caso de Uso: Alerta de Praga</p>
                                <p className="text-slate-700 italic font-mono text-sm leading-relaxed">
                                    "ALERTA: Lagarta do Funil detectada em Manica. Proteja a sua produção de milho. Consulte as técnicas de remediação na Base Agro Data ou fale com o extensionista."
                                </p>
                            </div>
                            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                                <p className="text-xs font-bold text-orange-600 uppercase mb-2">Caso de Uso: Oportunidade de Mercado</p>
                                <p className="text-slate-700 italic font-mono text-sm leading-relaxed">
                                    "COMPRA: Empresa exportadora procura 20 toneladas de soja em Gurué. Entre em contacto pelo +258 84 000 0000 para negociar o preço."
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* How it Works */}
            <section className="py-24 bg-slate-50">
                <div className="container-site">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <h2 className="text-[45px] font-black text-slate-800 mb-4">Como Explorar o <span className="text-emerald-600">Sistema</span></h2>
                        <p className="text-slate-600 font-medium">O nosso painel administrativo permite uma gestão total das suas campanhas de comunicação.</p>
                    </div>
                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            { step: "01", title: "Busca de Parcerias", desc: "Encontre os parceiros certos para expandir o seu alcance no mercado." },
                            { step: "02", title: "Novos Produtos", desc: "Receba notificações sobre novos produtos e oportunidades no mercado." },
                            { step: "03", title: "Analise Resultados", desc: "Veja relatórios de entrega e interacções em tempo real." }
                        ].map((s, i) => (
                            <div key={i} className="bg-white p-8 rounded-2xl border border-slate-200">
                                <span className="text-4xl font-black text-emerald-100 mb-4 block">{s.step}</span>
                                <h3 className="text-xl font-bold text-slate-800 mb-2">{s.title}</h3>
                                <p className="text-slate-600 font-medium">{s.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-24 container-site text-center">
                <div className="bg-gradient-to-b from-emerald-900 to-emerald-950 rounded-[18px] p-12 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                    <h2 className="text-[45px] font-black mb-8 relative z-10 text-white">
                        Impulsione a sua <span className="text-[#f97316]">comunicação</span> hoje
                    </h2>
                    <div className="flex flex-wrap justify-center gap-4 relative z-10">
                        <Link href="/registar">
                            <Button className="bg-white text-[#f97316] hover:bg-slate-100 font-bold px-8 h-12 rounded-xl">
                                Começar Agora
                            </Button>
                        </Link>
                        <Link href="/contactos">
                            <Button variant="ghost" className="border border-white text-white hover:bg-[#f97316]/20 hover:text-white hover:border-[#f97316]/50 font-bold px-8 h-12 rounded-xl transition-all">
                                Falar com Consultor
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>
        </main>
    );
}
