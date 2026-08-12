"use client";

import { useMemo, useState, useEffect } from "react";
import {
    Info, ArrowRight, CheckCircle2, Zap, Globe2,
    Target, Eye, Gem, TrendingUp, Database,
    Sprout, Building2
} from "lucide-react";
import Link from "next/link";

export default function SobrePage() {
    return (
        <main className="min-h-screen overflow-x-hidden">

            {/* 1. Introdução Premium (Redesigned - Left Image) */}
            <div className="w-full relative bg-transparent overflow-hidden pt-[100px]">
                {/* Background Image Overlay */}
                <div
                    className="absolute inset-0 z-0 opacity-[0.15] pointer-events-none bg-center bg-cover bg-no-repeat"
                    style={{ backgroundImage: "url('/assets/cta-gradient-bg.webp')" }}
                />
                <div className="absolute top-0 left-0 w-[48%] h-full hidden lg:block">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src="/assets/Agrotec.webp"
                        alt="Background Tech"
                        className="w-full h-full object-cover"
                        style={{ clipPath: "polygon(0 0, 100% 0, 88% 100%, 0% 100%)" }}
                    />
                </div>

                <div className="container-site relative z-10 py-12 md:py-20 flex justify-start lg:ml-[45%]">
                    <div className="max-w-xl">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-emerald-600/10 border border-emerald-500/20 mb-6">
                            <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                            <span className="text-xs font-bold uppercase tracking-widest text-emerald-700">Nossa Identidade é:</span>
                        </div>

                        <h2 className="text-[45px] font-black leading-tight">
                            Impulsionando o <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#f97316] to-orange-600">futuro da agricultura</span> <br />
                            <span className="text-slate-700">moçambicana</span>
                        </h2>

                        <div className="space-y-6 text-slate-600 font-medium border-l-4 border-emerald-500 pl-6">
                            <p className="text-[20px] leading-tight">
                                A <strong>Base de Dados Agrícola</strong> é mais do que uma plataforma; somos o motor digital que conecta produtores rurais aos mercados globais.
                            </p>
                            <p className="text-[12px] leading-relaxed">
                                Utilizamos tecnologia de ponta para democratizar o acesso à informação, transformar dados brutos em inteligência de mercado e criar um ecossistema onde o pequeno produtor e a grande indústria crescem juntos.
                            </p>
                        </div>

                        <div className="mt-10 flex flex-wrap gap-4">
                            <div className="flex items-center gap-2 px-5 py-2.5 bg-white/70 backdrop-blur-sm rounded-[7px] border border-slate-200/50 shadow-sm">
                                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                                <span className="font-bold text-slate-600 text-sm">Dados Oficiais</span>
                            </div>
                            <div className="flex items-center gap-2 px-5 py-2.5 bg-white/70 backdrop-blur-sm rounded-[7px] border border-slate-200/50 shadow-sm">
                                <Zap className="w-5 h-5 text-emerald-500" />
                                <span className="font-bold text-slate-600 text-sm">Inovação</span>
                            </div>
                            <div className="flex items-center gap-2 px-5 py-2.5 bg-white/70 backdrop-blur-sm rounded-[7px] border border-slate-200/50 shadow-sm">
                                <Globe2 className="w-5 h-5 text-emerald-500" />
                                <span className="font-bold text-slate-600 text-sm">Tecnologia de Ponta</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* 2. Propósito Corporativo (Dark Theme with Particles + Hover Effects) */}
            <div className="w-full relative py-24 overflow-hidden bg-slate-900">
                {/* Fixed Background Image for this section too */}
                <div
                    className="absolute inset-0 z-0 bg-fixed bg-cover bg-center opacity-30 mix-blend-multiply"
                    style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1625246333195-58197bd47d26?q=80&w=2000&auto=format&fit=crop)' }}
                ></div>
                <div className="absolute inset-0 bg-gradient-to-b from-slate-900/90 via-slate-900/80 to-slate-900/90 z-[1]"></div>

                {/* Floating Particles Effect */}
                <div className="absolute inset-0 z-[2] overflow-hidden pointer-events-none">
                    {[...Array(6)].map((_, i) => (
                        <div
                            key={i}
                            className="absolute rounded-full bg-emerald-500/20 blur-3xl animate-pulse"
                            style={{
                                width: `${(i * 50 + 100) % 300 + 100}px`,
                                height: `${(i * 70 + 120) % 300 + 100}px`,
                                top: `${(i * 17) % 100}%`,
                                left: `${(i * 23) % 100}%`,
                                animationDelay: `${i * 0.8}s`,
                                animationDuration: `${i + 7}s`
                            }}
                        />
                    ))}
                </div>

                <div className="container-site relative z-10">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                        {/* Missão Card */}
                        <div className="relative bg-white/5 p-5 rounded-lg border border-white/10 transition-all duration-500 group overflow-hidden flex items-start gap-4 hover:bg-white/10">
                            {/* Animated Shimmer Bar */}
                            <div className="absolute top-0 -left-[100%] w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-[-25deg] transition-all duration-1000 group-hover:left-[100%] pointer-events-none z-20"></div>

                            <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center shrink-0 shadow-lg shadow-emerald-500/30 group-hover:scale-110 transition-transform duration-500 relative z-10">
                                <Target className="w-5 h-5 text-white" />
                            </div>
                            <div className="relative z-10">
                                <h3 className="text-xl font-bold text-white mb-2">Nossa Missão</h3>
                                <p className="text-[14px] text-slate-300 leading-relaxed font-medium transition-colors">
                                    Potencializar o agronegócio através da inclusão digital e transações transparentes em toda a cadeia de valor.
                                </p>
                            </div>
                        </div>

                        {/* Visão Card */}
                        <div className="relative bg-white/5 p-5 rounded-lg border border-white/10 transition-all duration-500 group overflow-hidden flex items-start gap-4 hover:bg-white/10">
                            {/* Animated Shimmer Bar */}
                            <div className="absolute top-0 -left-[100%] w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-[-25deg] transition-all duration-1000 group-hover:left-[100%] pointer-events-none z-20"></div>

                            <div className="w-10 h-10 bg-[#f97316] rounded-xl flex items-center justify-center shrink-0 shadow-lg shadow-orange-500/30 group-hover:scale-110 transition-transform duration-500 relative z-10">
                                <Eye className="w-5 h-5 text-white" />
                            </div>
                            <div className="relative z-10">
                                <h3 className="text-xl font-bold text-white mb-2">Nossa Visão</h3>
                                <p className="text-[14px] text-slate-300 leading-relaxed font-medium transition-colors">
                                    Ser a referência digital do sector agrário na África Austral.
                                </p>
                            </div>
                        </div>

                        {/* Valores Card */}
                        <div className="relative bg-white/5 p-agro rounded-lg border border-white/10 transition-all duration-500 group overflow-hidden flex items-start gap-4 hover:bg-white/10">
                            {/* Animated Shimmer Bar */}
                            <div className="absolute top-0 -left-[100%] w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-[-25deg] transition-all duration-1000 group-hover:left-[100%] pointer-events-none z-20"></div>

                            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shrink-0 shadow-lg shadow-blue-600/30 group-hover:scale-110 transition-transform duration-500 relative z-10">
                                <Gem className="w-5 h-5 text-white" />
                            </div>
                            <div className="relative z-10">
                                <h3 className="text-xl font-bold text-white mb-2">Nossos Valores</h3>
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {[
                                        "Transparência", "Inovação", "Impacto"
                                    ].map((val, i) => (
                                        <span key={i} className="px-3 py-1 bg-white/5 text-slate-300 text-[10px] font-bold uppercase tracking-wider rounded-md border border-white/10 hover:border-white/30 transition-colors">
                                            {val}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* 3. Dados e Monitoria (SECÇÃO DE CIMA - TRANSPARENTE) */}
            <div className="w-full py-24 border-b border-slate-200">
                <div className="container-site">
                    <div className="text-center mb-16">
                        <div className="flex items-center justify-center gap-4 mb-3">
                            <div className="w-10 h-[1.5px] bg-[#f97316]"></div>
                            <span className="text-[#f97316] font-bold text-sm uppercase tracking-[0.3em]">nas nossas actividades</span>
                            <div className="w-10 h-[1.5px] bg-[#f97316]"></div>
                        </div>
                        <h2 className="text-[45px] font-black text-slate-700 leading-tight">
                            O Que <span className="text-emerald-600">Monitoramos?</span>
                        </h2>
                        <p className="text-slate-500 max-w-2xl mx-auto mt-4 font-medium leading-relaxed">
                            Agregamos indicadores vitais de múltiplas fontes oficiais para oferecer uma visão 360º do sector agrário em Moçambique.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-agro">
                        {[
                            { icon: TrendingUp, label: "Cotações de Mercado", desc: "Actualização do preços diariários dos principais produtos nos mercados grossistas (SIMA)." },
                            { icon: Database, label: "Censo Agro-Pecuário", desc: "Dados estruturais do INE sobre explorações, efectivo pecuário e uso da terra." },
                            { icon: Sprout, label: "Produção e Colheitas", desc: "Estatísticas de produção por província e previsões para as próximas campanhas." },
                            { icon: Building2, label: "Empresas Comercial", desc: "Base de dados verificada de fornecedores, compradores e prestadores de serviços." }
                        ].map((item, idx) => (
                            <div key={idx} className="bg-white p-agro rounded-lg border border-slate-200 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group flex flex-col h-full">
                                <div className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center shadow-sm mb-4 text-slate-400 group-hover:text-[#f97316] group-hover:scale-110 transition-all shrink-0">
                                    <item.icon className="w-5 h-5" />
                                </div>
                                <h4 className="text-base font-black text-slate-700 mb-2">{item.label}</h4>
                                <p className="text-[13px] text-slate-500 leading-relaxed font-medium flex-1">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* 4. Conectando Moçambique (SECÇÃO DO MEIO - ESCURA COM FIXO) */}
            <div className="w-full relative min-h-[600px] flex items-center overflow-hidden bg-slate-900 border-y border-white/5">
                {/* Background Fixed Cover */}
                <div
                    className="absolute inset-0 z-0 bg-fixed bg-cover bg-center opacity-50 mix-blend-luminosity"
                    style={{ backgroundImage: 'url(/bg.png)' }}
                ></div>
                <div className="absolute inset-0 bg-gradient-to-r from-slate-900/90 via-slate-900/60 to-slate-900/30 z-[1]"></div>

                <div className="container-site relative z-10 w-full py-[100px]">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        <div className="max-w-3xl">


                            <h1 className="text-[45px] font-black text-white mb-2 leading-tight">
                                Conectando o agro-negócio ao <span className="text-[#f97316]">mercado nacional</span>
                            </h1>
                            <h3 className="text-[20px] font-heading font-normal text-slate-300 leading-relaxed mb-8">
                                Infra-estrutura que Impulsiona o Desenvolvimento
                            </h3>

                            <p className="text-slate-300 text-[14px] leading-relaxed mb-10 font-medium max-w-2xl border-l-2 border-[#f97316] pl-4">
                                Com uma infra-estrutura de dados robusta e actualizada, a Base de dados agrícolas desempenha um papel fundamental no desenvolvimento do sector agrário em Moçambique.
                            </p>

                            <Link href="/sobre-nos/historial">
                                <button className="btn-accent rounded-full shadow-lg shadow-orange-900/20">
                                    Saiba mais sobre nosso historial
                                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </button>
                            </Link>
                        </div>

                        {/* Right Column: Image Card */}
                        <div className="relative group/img animate-in fade-in slide-in-from-right-8 duration-1000">
                            <div className="absolute -inset-4 bg-[#f97316]/20 rounded-[24px] blur-2xl group-hover/img:bg-[#f97316]/30 transition-colors pointer-events-none"></div>
                            <div className="relative h-[450px] rounded-[20px] overflow-hidden border border-white/10 shadow-2xl">
                                <img
                                    src="/assets/Mercado.webp"
                                    alt="Mercado Agrário"
                                    className="w-full h-full object-cover transform group-hover/img:scale-105 transition-transform duration-700"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent"></div>
                                <div className="absolute bottom-6 left-6">
                                    <div className="text-white text-xs font-black uppercase tracking-widest mb-1 opacity-80">Sector Agro-Industrial</div>
                                    <div className="text-white text-xl font-bold">Mercado Digital Integrado</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* 5. Impacto em Números (SECÇÃO DE BAIXO - BRANCA) */}
            <div className="w-full bg-white py-24 border-t border-slate-100">
                <div className="container-site">
                    <div className="grid grid-cols-1 lg:grid-cols-[0.9fr_1.1fr] gap-16 items-center">
                        <div className="space-y-8">
                            <h2 className="text-[45px] font-black text-slate-700 leading-[1.1] tracking-tight mb-6">
                                Uma base de dados em <span className="text-emerald-600">crescimento</span>
                            </h2>
                            <p className="text-slate-500 text-[14px] leading-relaxed font-medium">
                                A nossa plataforma não é apenas um arquivo estático. É um organismo vivo alimentado diariamente por milhares de pontos de dados vindos de todas as províncias de Moçambique.
                            </p>

                            <div className="space-y-6 pt-4">
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center shrink-0 text-emerald-600 font-bold">
                                        01
                                    </div>
                                    <div>
                                        <h4 className="text-xl font-bold text-slate-600">Confiabilidade</h4>
                                        <p className="text-slate-400 text-sm mt-1">Dados validados e cruzados com fontes oficiais (MADER, INE).</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center shrink-0 text-[#f97316] font-bold">
                                        02
                                    </div>
                                    <div>
                                        <h4 className="text-xl font-bold text-slate-600">Acessibilidade</h4>
                                        <p className="text-slate-400 text-sm mt-1">Informação complexa transformada em gráficos simples para todos.</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Big Numbers Grid */}
                        <div className="grid grid-cols-2 gap-5 px-0 md:px-20">
                            <div className="bg-slate-50 p-5 rounded-2xl text-center border border-slate-100">
                                <p className="text-4xl md:text-5xl font-black text-[#f97316] mb-2">+12</p>
                                <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Anos de Experiência</p>
                            </div>
                            <div className="bg-slate-50 p-5 rounded-2xl text-center border border-slate-100">
                                <p className="text-4xl md:text-5xl font-black text-emerald-600 mb-2">100%</p>
                                <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Cobertura Nacional</p>
                            </div>
                            <div className="bg-slate-50 p-5 rounded-2xl text-center border border-slate-100">
                                <p className="text-4xl md:text-5xl font-black text-blue-600 mb-2">+1500</p>
                                <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Parceiros Activos</p>
                            </div>
                            <div className="bg-slate-50 p-5 rounded-2xl text-center border border-slate-100">
                                <p className="text-4xl md:text-5xl font-black text-slate-700 mb-2">24h</p>
                                <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Actualização Diária</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
