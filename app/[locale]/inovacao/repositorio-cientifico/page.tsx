"use client";

import React from "react";
import { Library, BookOpen, GraduationCap, Search, Brain, Zap, Globe, ArrowRight, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function ScientificRepositoryPage() {
    return (
        <main className="min-h-screen bg-white">
            {/* Hero Section */}
            <section className="pt-40 pb-32 bg-slate-50 relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('/images/markets/choppies_bg.png')] opacity-10 bg-cover bg-center pointer-events-none"></div>
                <div className="container-site relative z-10 text-left">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-50 border border-orange-100 mb-6">
                        <GraduationCap className="w-4 h-4 text-[#f97316]" />
                        <span className="text-xs font-bold uppercase tracking-widest text-orange-700">Conhecimento de Vanguarda</span>
                    </div>
                    <h1 className="text-[45px] font-[900] text-slate-800/95 mb-6 leading-tight tracking-tight max-w-4xl">
                        Repositório de <br /> <span className="text-emerald-600">Inteligência Científica</span>
                    </h1>
                    <p className="text-xl text-slate-600 leading-relaxed font-medium mb-8 max-w-2xl">
                        Conectamos estudantes, investigadores e agrónomos moçambicanos à maior biblioteca global de artigos científicos, teses e papers técnicos.
                    </p>
                </div>
            </section>

            {/* Semantic Search Section */}
            <section className="py-24 container-site">
                <div className="grid lg:grid-cols-2 gap-16 items-center">
                    <div className="relative lg:order-1 order-2">
                        {/* Mock UI Search */}
                        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xl relative z-10 overflow-hidden">
                            <div className="relative flex items-center bg-slate-50 border border-slate-100 rounded-lg overflow-hidden h-12 mb-4">
                                <Search className="absolute left-4 w-4 h-4 text-slate-400" />
                                <div className="w-full py-3 pl-12 pr-4 text-sm text-slate-400 italic">
                                    Melhoramento genético de culturas tropicais...
                                </div>
                            </div>
                            <div className="space-y-4">
                                {[1, 2, 3, 4].map((i) => (
                                    <div key={i} className="bg-slate-50/50 p-4 rounded-xl border border-slate-100">
                                        <div className="flex gap-3">
                                            <BookOpen className="w-5 h-5 text-emerald-600" />
                                            <div>
                                                <h5 className="text-sm font-bold text-slate-800 leading-tight">Genetic Diversity and Conservation of Local Seed...</h5>
                                                <p className="text-[10px] text-slate-400 uppercase mt-1 font-bold">Publicado em: 2024 • Academic Journal</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        {/* Decor */}
                        <div className="absolute -top-6 -right-6 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl"></div>
                        <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-orange-500/10 rounded-full blur-2xl"></div>
                    </div>
                    <div className="lg:order-2 order-1">
                        <h2 className="text-[45px] font-black text-slate-800/95 mb-6 tracking-tight">O Motor de Pesquisa <span className="text-[#f97316]">"Dinâmica"</span></h2>
                        <p className="text-slate-600 font-medium text-lg leading-relaxed mb-8">
                            Utilizamos tecnologia de <span className="text-slate-900 font-bold">pesquisa semântica</span> que entende o contexto da sua busca, e não apenas as palavras-chave isoladas.
                        </p>
                        <div className="space-y-8">
                            {[
                                { title: "Varredura Global", desc: "Acesso directo ao Semantic Scholar, com milhões de artigos em tempo real.", icon: <Globe className="w-6 h-6 text-[#f97316]" /> },
                                { title: "Busca Dinâmica Por Escrita", desc: "O sistema analisa o seu tema de investigação e sugere artigos relacionados automaticamente.", icon: <Brain className="w-6 h-6 text-[#f97316]" /> }
                            ].map((item, i) => (
                                <div key={i} className="flex gap-4">
                                    <div className="shrink-0 w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center">
                                        {item.icon}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-800 mb-1">{item.title}</h4>
                                        <p className="text-slate-600 font-medium leading-relaxed">{item.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Impact Section */}
            <section className="py-24 bg-slate-900 text-white">
                <div className="container-site">
                    <div className="grid md:grid-cols-3 gap-12">
                        {[
                            { title: "Para Estudantes", desc: "Acesso a referências bibliográficas actualizadas para teses e licenciaturas.", icon: <GraduationCap className="w-8 h-8 text-emerald-400" /> },
                            { title: "Para Investigadores", desc: "Monitorização de avanços científicos em culturas específicas de Moçambique.", icon: <Library className="w-8 h-8 text-emerald-400" /> },
                            { title: "Para Agrónomos", desc: "Consultoria técnica baseada em evidência científica para problemas no campo.", icon: <Brain className="w-8 h-8 text-emerald-400" /> }
                        ].map((item, i) => (
                            <div key={i} className="text-center">
                                <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-white/10">
                                    {item.icon}
                                </div>
                                <h3 className="text-xl font-[900] text-white mb-4">{item.title}</h3>
                                <p className="text-slate-400 font-medium leading-relaxed">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-24 container-site text-center">
                <h2 className="text-[45px] font-black text-slate-800 mb-8 tracking-tight">Comece a sua <span className="text-[#f97316]">"pesquisa"</span> hoje</h2>
                <div className="flex flex-wrap justify-center gap-4">
                    <Link href="/artigos">
                        <Button className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-8 h-12 rounded-xl">
                            Aceder ao Repositório
                        </Button>
                    </Link>
                    <Link href="/ajuda">
                        <Button variant="outline" className="border-slate-200 text-slate-600 hover:bg-slate-50 font-bold px-8 h-12 rounded-xl">
                            Apoio à Investigação
                        </Button>
                    </Link>
                </div>
            </section>
        </main>
    );
}
