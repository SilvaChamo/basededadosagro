"use client";

import React from "react";
import {
    ShieldCheck, CheckCircle2, FileCheck, MapPin, Eye, Lock,
    AlertTriangle, Server, Award, ArrowRight, Building2, UserCheck, ShieldAlert
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function SegurancaValidacaoPage() {
    return (
        <main className="min-h-screen bg-white">
            {/* Hero Section */}
            <section className="pt-32 pb-20 bg-slate-900 text-white relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?q=80&w=2000&auto=format&fit=crop')] opacity-10 bg-cover bg-center bg-fixed scale-105"></div>
                <div className="container-site relative z-10">
                    <div className="max-w-3xl">
                        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 mb-6 font-sans">
                            <ShieldCheck className="w-4 h-4 text-emerald-400" />
                            <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">Segurança & Governação de Dados</span>
                        </div>
                        <h1 className="text-[42px] md:text-[52px] font-[900] mb-6 leading-tight tracking-tight text-white">
                            Protocolo Anti-Fraude & <br />
                            <span className="text-[#f97316]">Validação de Empresas em 3 Camadas</span>
                        </h1>
                        <p className="text-lg md:text-xl text-slate-300 leading-relaxed font-medium mb-8">
                            Protegemos o ecossistema agrícola contra empresas fantasmas, fake news e fraude comercial através de auditoria documental, chancela institucional do MADER e validação por extensionistas no terreno.
                        </p>
                    </div>
                </div>
            </section>

            {/* 3-Tier Verification Architecture */}
            <section className="py-24 container-site">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <span className="text-xs font-bold uppercase tracking-widest text-[#f97316]">Segurança do Mercado Agrário</span>
                    <h2 className="text-[36px] font-black text-slate-800 tracking-tight mt-2">Como Garantimos Dados Reais e Confiáveis</h2>
                    <p className="text-slate-600 font-medium text-base mt-3">
                        Nenhuma empresa não auditada pode operar ou publicar ofertas públicas sem passar pelo nosso triplo filtro de segurança.
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    {/* Layer 1 */}
                    <div className="bg-slate-50 border-2 border-slate-200 rounded-3xl p-8 relative hover:border-emerald-500 transition-all group shadow-sm">
                        <div className="w-14 h-14 bg-emerald-100 rounded-2xl flex items-center justify-center mb-6 text-emerald-700 font-black text-xl group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                            01
                        </div>
                        <h3 className="text-xl font-bold text-slate-800 mb-3 flex items-center gap-2">
                            <FileCheck className="w-5 h-5 text-emerald-600" />
                            Auditoria Documental & NUIT
                        </h3>
                        <p className="text-xs text-slate-600 leading-relaxed font-medium mb-6">
                            Cruzamento automático do NUIT, Certidão de Registo Comercial e Licença de Actividade com as bases do IPEME, Baú Único e CTA.
                        </p>
                        <ul className="space-y-2.5 text-xs text-slate-600 font-medium">
                            <li className="flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" /> Confirmação NUIT activo
                            </li>
                            <li className="flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" /> Verificação do Objecto Social agrícola
                            </li>
                        </ul>
                    </div>

                    {/* Layer 2 */}
                    <div className="bg-emerald-950 text-white border-2 border-emerald-800 rounded-3xl p-8 relative shadow-xl transform scale-[1.03]">
                        <div className="w-14 h-14 bg-[#f97316] rounded-2xl flex items-center justify-center mb-6 text-white font-black text-xl">
                            02
                        </div>
                        <div className="inline-block px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-[10px] font-bold text-emerald-400 uppercase tracking-widest mb-3">
                            Chancela Oficial
                        </div>
                        <h3 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
                            <Award className="w-5 h-5 text-[#f97316]" />
                            Selo MADER / DPAP
                        </h3>
                        <p className="text-xs text-emerald-100/80 leading-relaxed font-medium mb-6">
                            Validação institucional pelas Direcções Provinciais da Agricultura (DPAP). Atribuição do **Selo Oficial de Conformidade**.
                        </p>
                        <ul className="space-y-2.5 text-xs text-emerald-200/90 font-medium">
                            <li className="flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4 text-[#f97316] shrink-0" /> Licenciamento de sementes e insumos
                            </li>
                            <li className="flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4 text-[#f97316] shrink-0" /> Elegibilidade para Fomento/FAR, IP
                            </li>
                        </ul>
                    </div>

                    {/* Layer 3 */}
                    <div className="bg-slate-50 border-2 border-slate-200 rounded-3xl p-8 relative hover:border-emerald-500 transition-all group shadow-sm">
                        <div className="w-14 h-14 bg-emerald-100 rounded-2xl flex items-center justify-center mb-6 text-emerald-700 font-black text-xl group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                            03
                        </div>
                        <h3 className="text-xl font-bold text-slate-800 mb-3 flex items-center gap-2">
                            <UserCheck className="w-5 h-5 text-emerald-600" />
                            Validação por Extensionistas
                        </h3>
                        <p className="text-xs text-slate-600 leading-relaxed font-medium mb-6">
                            Confirmação presencial e física pelos extensionistas de campo do MADER nos distritos através de geotagging GPS no local.
                        </p>
                        <ul className="space-y-2.5 text-xs text-slate-600 font-medium">
                            <li className="flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" /> Mapeamento GPS verificado
                            </li>
                            <li className="flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" /> Protecção contra empresas fantasmas
                            </li>
                        </ul>
                    </div>
                </div>
            </section>

            {/* Anti-Fake News & Fact Checking */}
            <section className="py-20 bg-slate-50 border-t border-slate-200">
                <div className="container-site">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        <div>
                            <span className="text-xs font-bold uppercase tracking-widest text-[#f97316]">Filtro de Informação & Notícias</span>
                            <h2 className="text-[34px] font-black text-slate-800 tracking-tight mt-2">Combate a Fake News & Informações Falsas</h2>
                            <p className="text-slate-600 font-medium text-sm leading-relaxed mt-4">
                                Para evitar especulação de preços, avisos sanitários falsos ou desinformação no agronegócio, implementámos um rigoroso motor de curadoria e moderação de conteúdos.
                            </p>
                            <div className="mt-8 space-y-4">
                                <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm flex items-start gap-4">
                                    <ShieldAlert className="w-6 h-6 text-[#f97316] shrink-0 mt-1" />
                                    <div>
                                        <h4 className="font-bold text-slate-800 text-sm">Cruzamento com Fontes Oficiais</h4>
                                        <p className="text-xs text-slate-500 font-medium mt-0.5">Todas as cotações e avisos fitossanitários são validados com dados do INE, SIMA, IIAM e MADER antes da publicação.</p>
                                    </div>
                                </div>
                                <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm flex items-start gap-4">
                                    <Eye className="w-6 h-6 text-emerald-600 shrink-0 mt-1" />
                                    <div>
                                        <h4 className="font-bold text-slate-800 text-sm">Moderação com Inteligência Artificial</h4>
                                        <p className="text-xs text-slate-500 font-medium mt-0.5">Algoritmos de NLP analisam publicações de utilizadores para detetar conteúdo fraudulento ou inconsistências comerciais.</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-emerald-950 p-8 rounded-3xl text-white relative overflow-hidden border border-emerald-800 shadow-2xl">
                            <div className="flex items-center gap-3 mb-6">
                                <Award className="w-8 h-8 text-[#f97316]" />
                                <div>
                                    <h3 className="font-bold text-lg text-white">Selo de Qualidade BDAgro</h3>
                                    <p className="text-xs text-emerald-300">Empresas 100% Verificadas</p>
                                </div>
                            </div>

                            <p className="text-xs text-emerald-100/90 leading-relaxed font-medium mb-6">
                                As empresas que concluem o protocolo de 3 camadas recebem o distintivo público de **"Empresa Auditada e Verificada"**, aumentando a sua credibilidade perante compradores e parceiros internacionais.
                            </p>

                            <Link href="/empresas">
                                <Button className="w-full bg-[#f97316] hover:bg-orange-600 text-white font-bold h-12 rounded-xl">
                                    Ver Directório de Empresas Auditadas
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
}
