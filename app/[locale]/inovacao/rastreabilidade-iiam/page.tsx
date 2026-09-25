"use client";

import React, { useState } from "react";
import {
    ScanLine, ShieldCheck, Dna, Sprout, BarChart3, Database,
    CheckCircle2, ArrowRight, Activity, Cpu, Building2, Search,
    Download, AlertCircle, FileCheck, Layers, ExternalLink
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function RastreabilidadeIIAMPage() {
    const [selectedVariety, setSelectedVariety] = useState<string>("IIAM-Milho-Zapor");
    const [activeTab, setActiveTab] = useState<"fluxo" | "telemetria" | "pesquisa">("fluxo");

    const sampleVarieties = [
        { id: "IIAM-Milho-Zapor", name: "Milho Zapor (Tolerante à Seca)", crop: "Milho", testRange: "Sofala, Manica, Tete", adoption: "84%", healthScore: "96/100" },
        { id: "IIAM-Mandioca-Muzalaba", name: "Mandioca Muzalaba (Resistente à Mosaico)", crop: "Mandioca", testRange: "Nampula, Zambézia", adoption: "91%", healthScore: "98/100" },
        { id: "IIAM-Feijao-Nhemba-V2", name: "Feijão Nhemba V2 (Alto Teor Proteico)", crop: "Feijão", testRange: "Gaza, Inhambane", adoption: "78%", healthScore: "92/100" }
    ];

    return (
        <main className="min-h-screen bg-white">
            {/* Hero Section */}
            <section className="pt-32 pb-20 bg-emerald-950 text-white relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=2000&auto=format&fit=crop')] opacity-15 bg-cover bg-center bg-fixed scale-105"></div>
                <div className="container-site relative z-10">
                    <div className="max-w-3xl">
                        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 mb-6 font-sans">
                            <Dna className="w-4 h-4 text-[#f97316]" />
                            <span className="text-xs font-bold uppercase tracking-widest text-[#f97316]">Parceria IIAM & MADER</span>
                        </div>
                        <h1 className="text-[42px] md:text-[52px] font-[900] mb-6 leading-tight tracking-tight text-white">
                            Rastreabilidade & Telemetria de <br />
                            <span className="text-[#f97316]">Variedades Agrárias IIAM</span>
                        </h1>
                        <p className="text-lg md:text-xl text-emerald-100/90 leading-relaxed font-medium mb-8">
                            Acompanhamento em tempo real do desempenho de sementes melhoradas e variedades modificadas pelo IIAM, desde o laboratório até ao resultado real no campo dos produtores.
                        </p>
                        <div className="flex flex-wrap gap-4">
                            <Link href="/iiam">
                                <Button className="bg-[#f97316] hover:bg-orange-600 text-white font-bold px-8 h-12 rounded-xl shadow-lg shadow-orange-500/20">
                                    <ShieldCheck className="w-5 h-5 mr-2" /> Entrar no Painel IIAM
                                </Button>
                            </Link>
                            <Link href="/inovacao/agrobotanica">
                                <Button variant="outline" className="border-emerald-600 text-emerald-100 hover:bg-emerald-900 font-bold px-8 h-12 rounded-xl">
                                    <ScanLine className="w-5 h-5 mr-2 text-emerald-400" /> Experimentar AgroBotanica AI
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Workflow Section */}
            <section className="py-20 container-site">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <span className="text-xs font-bold uppercase tracking-widest text-[#f97316]">Ciclo de Investigação & Resposta de Campo</span>
                    <h2 className="text-[36px] font-black text-slate-800 tracking-tight mt-2">Como Funciona a Rastreabilidade IIAM</h2>
                    <p className="text-slate-600 font-medium text-base mt-3">
                        Uma ponte digital contínua entre a investigação científica agrária nacional e o produtor rural no terreno.
                    </p>
                </div>

                <div className="grid md:grid-cols-4 gap-6 relative">
                    {[
                        {
                            step: "01",
                            title: "Desenvolvimento IIAM",
                            desc: "O IIAM cria ou modifica uma semente melhorada e regista o lote e código genético na plataforma.",
                            icon: <Dna className="w-6 h-6 text-emerald-600" />
                        },
                        {
                            step: "02",
                            title: "Distribuição Agrodealer",
                            desc: "O fornecedor/loja de insumos recebe o lote certificado com QR Code e distribui ao produtor com orientações.",
                            icon: <Building2 className="w-6 h-6 text-emerald-600" />
                        },
                        {
                            step: "03",
                            title: "Scan no Campo (Produtor)",
                            desc: "O produtor utiliza o AgroBotanica AI para scanear a cultura, aferir a saúde foliar e valor nutritivo.",
                            icon: <ScanLine className="w-6 h-6 text-[#f97316]" />
                        },
                        {
                            step: "04",
                            title: "Telemetria para o IIAM",
                            desc: "Os dados de adaptação, resiliência à seca e rendimento caem automaticamente no Painel do MADER/IIAM.",
                            icon: <BarChart3 className="w-6 h-6 text-emerald-600" />
                        }
                    ].map((item, idx) => (
                        <div key={idx} className="bg-slate-50 border border-slate-200/80 rounded-2xl p-6 relative group hover:bg-emerald-50/50 hover:border-emerald-200 transition-all">
                            <div className="flex items-center justify-between mb-4">
                                <div className="w-12 h-12 bg-white rounded-xl shadow-sm border border-slate-200 flex items-center justify-center">
                                    {item.icon}
                                </div>
                                <span className="text-2xl font-black text-slate-300 group-hover:text-emerald-500 transition-colors">{item.step}</span>
                            </div>
                            <h3 className="font-bold text-slate-800 text-lg mb-2">{item.title}</h3>
                            <p className="text-xs text-slate-600 leading-relaxed font-medium">{item.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Interactive Simulation Dashboard */}
            <section className="py-20 bg-slate-900 text-white border-y border-slate-800">
                <div className="container-site">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                        <div>
                            <span className="text-xs font-bold uppercase tracking-widest text-[#f97316]">Painel de Telemetria Científica</span>
                            <h2 className="text-[32px] font-black text-white mt-1">Simulador de Monitorização IIAM / MADER</h2>
                            <p className="text-slate-400 text-sm font-medium">Dados agregados em tempo real provenientes dos scaneamentos no terreno.</p>
                        </div>
                        <div className="flex gap-2">
                            {sampleVarieties.map(v => (
                                <button
                                    key={v.id}
                                    onClick={() => setSelectedVariety(v.id)}
                                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${selectedVariety === v.id ? 'bg-emerald-600 text-white border-emerald-500 shadow-lg' : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'}`}
                                >
                                    {v.crop}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Active Variety Details */}
                    {(() => {
                        const active = sampleVarieties.find(v => v.id === selectedVariety) || sampleVarieties[0];
                        return (
                            <div className="grid lg:grid-cols-3 gap-6">
                                <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-6 lg:col-span-1">
                                    <div className="flex items-center gap-2 mb-4">
                                        <Sprout className="w-5 h-5 text-emerald-400" />
                                        <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Lote Certificado IIAM</span>
                                    </div>
                                    <h3 className="text-xl font-bold text-white mb-2">{active.name}</h3>
                                    <p className="text-xs text-slate-400 mb-6">Região de Teste Activa: <strong className="text-slate-200">{active.testRange}</strong></p>

                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center p-3 bg-slate-900/60 rounded-xl border border-slate-700/50">
                                            <span className="text-xs text-slate-400 font-medium">Taxa de Adaptação</span>
                                            <span className="text-sm font-black text-emerald-400">{active.adoption}</span>
                                        </div>
                                        <div className="flex justify-between items-center p-3 bg-slate-900/60 rounded-xl border border-slate-700/50">
                                            <span className="text-xs text-slate-400 font-medium">Índice de Saúde Foliar</span>
                                            <span className="text-sm font-black text-[#f97316]">{active.healthScore}</span>
                                        </div>
                                        <div className="flex justify-between items-center p-3 bg-slate-900/60 rounded-xl border border-slate-700/50">
                                            <span className="text-xs text-slate-400 font-medium">Status no Mercado</span>
                                            <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded">Aprovado pelo IIAM</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-6 lg:col-span-2 flex flex-col justify-between">
                                    <div>
                                        <h4 className="font-bold text-white text-base mb-4 flex items-center gap-2">
                                            <Activity className="w-5 h-5 text-[#f97316]" />
                                            Relatório de Valor Nutritivo & Resposta Fenológica (AgroBotanica AI)
                                        </h4>
                                        <p className="text-xs text-slate-300 leading-relaxed mb-6 font-medium">
                                            Com base em 1.420 scaneamentos efetuados por produtores em Manica e Sofala durante os últimos 60 dias, a variedade <strong>{active.name}</strong> apresentou um aumento de 14% na resistência ao estresse hídrico e manteve os níveis ideais de azoto e fósforo foliar.
                                        </p>

                                        <div className="grid md:grid-cols-3 gap-4 mb-6">
                                            <div className="p-4 bg-slate-900/80 rounded-xl border border-slate-700 text-center">
                                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Vigor Vegetativo</p>
                                                <p className="text-2xl font-black text-emerald-400 mt-1">94.8%</p>
                                            </div>
                                            <div className="p-4 bg-slate-900/80 rounded-xl border border-slate-700 text-center">
                                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Prevalência de Pragas</p>
                                                <p className="text-2xl font-black text-[#f97316] mt-1">&lt; 2.1%</p>
                                            </div>
                                            <div className="p-4 bg-slate-900/80 rounded-xl border border-slate-700 text-center">
                                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Produtividade Estimada</p>
                                                <p className="text-2xl font-black text-white mt-1">4.2 Ton/ha</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-4 border-t border-slate-700 flex justify-between items-center">
                                        <span className="text-xs text-slate-400 font-medium">Fonte: IIAM / Base de Dados Agro Telemetry Engine</span>
                                        <Button variant="outline" className="border-slate-700 text-slate-200 hover:bg-slate-800 text-xs font-bold">
                                            <Download className="w-4 h-4 mr-2" /> Exportar Dados IIAM
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        );
                    })()}
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 container-site text-center">
                <h2 className="text-[36px] font-black text-slate-800 mb-4 tracking-tight">Pronto para Conectar a Investigação ao Campo?</h2>
                <p className="text-slate-600 max-w-2xl mx-auto font-medium text-base mb-8">
                    Convidamos os técnicos do IIAM e do MADER a integrar a plataforma como administradores de telemetria científica.
                </p>
                <div className="flex justify-center gap-4">
                    <Link href="/iiam">
                        <Button className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-8 h-12 rounded-xl shadow-lg shadow-emerald-600/20">
                            Aceder ao Painel Institucional IIAM
                        </Button>
                    </Link>
                </div>
            </section>
        </main>
    );
}
