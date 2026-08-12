"use client";

import React from "react";
import { BarChart3, Smartphone, Globe, Presentation, FileText, Layout, ArrowRight, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function PresentationsPage() {
    return (
        <main className="min-h-screen bg-white">
            {/* Hero Section */}
            <section className="pt-32 pb-20 bg-emerald-600 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-1/2 h-full bg-emerald-700/50 -skew-x-12 translate-x-1/4 pointer-events-none"></div>
                <div className="container-site relative z-10">
                    <div className="max-w-3xl">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 mb-6">
                            <Presentation className="w-4 h-4 text-white" />
                            <span className="text-xs font-bold uppercase tracking-widest text-emerald-50">Impacto Visual Profissional</span>
                        </div>
                        <h1 className="text-[45px] font-[900] text-white leading-[1.1] mb-8 tracking-tight">
                            Apresentações que <br /> Vendem o <span className="text-lime-400">"seu Negócio"</span>
                        </h1>
                        <p className="text-xl text-emerald-50 leading-relaxed font-medium mb-8">
                            Gere catálogos de produtos, perfis de propriedades e relatórios técnicos profissionais em minutos com o nosso editor inteligente.
                        </p>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-24 container-site">
                <div className="grid lg:grid-cols-[1.2fr_1fr] gap-16 items-center">
                    <div className="relative">
                        {/* Slide Editor Mockup */}
                        <div className="bg-slate-900 rounded-2xl p-4 shadow-2xl border border-slate-800 aspect-video overflow-hidden">
                            <div className="flex items-center gap-2 mb-4 border-b border-slate-800 pb-2">
                                <div className="w-2.5 h-2.5 rounded-full bg-red-500/50"></div>
                                <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/50"></div>
                                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/50"></div>
                            </div>
                            <div className="grid grid-cols-4 h-full gap-4">
                                <div className="col-span-1 space-y-2">
                                    <div className="h-12 bg-slate-800 rounded-lg border border-emerald-500/30"></div>
                                    <div className="h-12 bg-slate-800/50 rounded-lg border border-slate-700/50"></div>
                                    <div className="h-12 bg-slate-800/50 rounded-lg border border-slate-700/50"></div>
                                </div>
                                <div className="col-span-3 bg-slate-800 rounded-lg flex items-center justify-center p-4">
                                    <div className="text-center">
                                        <div className="w-8 h-1 bg-emerald-500 mx-auto mb-2"></div>
                                        <p className="text-white font-black text-sm">Catálogo Agro 2026</p>
                                        <p className="text-slate-400 text-[10px] mt-1">Exportação Instantânea</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/* Floating elements */}
                        <div className="absolute -bottom-6 -right-6 bg-white p-4 rounded-xl shadow-xl border border-slate-100 flex items-center gap-3">
                            <FileText className="w-6 h-6 text-emerald-600" />
                            <span className="text-sm font-bold text-slate-800">Exportar PDF / PPTX</span>
                        </div>
                    </div>
                    <div>
                        <h2 className="text-[40px] font-black text-slate-800/90 mb-3 leading-[1.1] tracking-tight">
                            O Fim das <br /> Apresentações <span className="text-orange-500">Amadoras</span>
                        </h2>
                        <p className="text-slate-600 font-medium text-sm leading-tight mb-5 max-w-xl">
                            Diferencie-se da concorrência com materiais visuais de alta qualidade, prontos para impressionar investidores, bancos e grandes compradores.
                        </p>
                        <div className="space-y-4">
                            {[
                                { title: "Editor Drag-and-Drop", desc: "Crie slides profissionais sem precisar de ser designer. Arraste textos e imagens facilmente.", icon: <Layout className="w-6 h-6 text-[#f97316]" /> },
                                { title: "Multi-dispositivo", desc: "A sua apresentação adapta-se automaticamente a telemóveis, tablets e computadores.", icon: <Smartphone className="w-6 h-6 text-[#f97316]" /> },
                                { title: "Partilha via Link", desc: "Não envie ficheiros pesados. Envie um link profissional que carrega instantaneamente.", icon: <Globe className="w-6 h-6 text-[#f97316]" /> }
                            ].map((item, i) => (
                                <div key={i} className="flex gap-4">
                                    <div className="shrink-0 w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center">
                                        {item.icon}
                                    </div>
                                    <div>
                                        <h4 className="text-base font-bold text-slate-800 mb-0.5 leading-tight">{item.title}</h4>
                                        <p className="text-sm text-slate-500 font-medium leading-relaxed">{item.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Use Cases */}
            <section className="py-24 relative overflow-hidden bg-white">
                <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                        backgroundImage: 'url(/images/markets/choppies_bg.png)',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        opacity: 0.18
                    }}
                ></div>
                <div className="container-site relative z-10">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <h2 className="text-[45px] font-black text-slate-800/90 mb-4 tracking-tight">
                            O que pode <span className="text-emerald-500">"criar?"</span>
                        </h2>
                        <p className="text-slate-600 font-medium text-lg">As possibilidades são infinitas para elevar a imagem da sua organização.</p>
                    </div>
                    <div className="grid md:grid-cols-3 gap-[20px]">
                        {[
                            { title: "Catálogo de Produtos", desc: "Ideal para produtores e distribuidores de insumos que precisam mostrar o seu catálogo actualizado." },
                            { title: "Perfil de Propriedade", desc: "Apresente os seus números, hectares e infraestruturas a potenciais parceiros ou bancos." },
                            { title: "Relatório Técnico", desc: "Documente o progresso das suas culturas com imagens e dados estruturados e visuais." }
                        ].map((item, i) => (
                            <div key={i} className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl border border-slate-200 shadow-sm text-center">
                                <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <FileText className="w-6 h-6" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-800 mb-4">{item.title}</h3>
                                <p className="text-slate-600 font-medium text-lg leading-relaxed">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-24 container-site text-center">
                <h2 className="text-[45px] font-black text-slate-800/90 mb-8">
                    Dê vida às suas <span className="text-emerald-500">ideias</span>
                </h2>
                <div className="flex flex-wrap justify-center gap-4">
                    <Link href="/registar">
                        <Button className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-8 h-12 rounded-xl">
                            Criar Minha Primeira Apresentação
                        </Button>
                    </Link>
                    <Link href="/contactos">
                        <Button variant="outline" className="border-slate-200 text-slate-600 hover:bg-slate-50 font-bold px-8 h-12 rounded-xl">
                            Solicitar Suporte no Design
                        </Button>
                    </Link>
                </div>
            </section>
        </main>
    );
}
