"use client";

import React, { useState } from "react";
import {
    Dna, Sprout, BarChart3, Database, CheckCircle2, ArrowRight,
    Activity, Cpu, Building2, Search, Download, AlertCircle,
    FileCheck, Layers, ExternalLink, ShieldCheck, ScanLine, Filter
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function IIAMPanelPage() {
    const [selectedVariety, setSelectedVariety] = useState<string>("IIAM-Milho-Zapor");

    const sampleVarieties = [
        { id: "IIAM-Milho-Zapor", name: "Milho Zapor (Tolerante à Seca)", crop: "Milho", testRange: "Sofala, Manica, Tete", adoption: "84%", healthScore: "96/100", vigor: "94.8%", pests: "< 2.1%", yieldEst: "4.2 Ton/ha", status: "Aprovado IIAM" },
        { id: "IIAM-Mandioca-Muzalaba", name: "Mandioca Muzalaba (Resistente à Mosaico)", crop: "Mandioca", testRange: "Nampula, Zambézia", adoption: "91%", healthScore: "98/100", vigor: "96.2%", pests: "< 1.5%", yieldEst: "18.5 Ton/ha", status: "Aprovado IIAM" },
        { id: "IIAM-Feijao-Nhemba-V2", name: "Feijão Nhemba V2 (Alto Teor Proteico)", crop: "Feijão", testRange: "Gaza, Inhambane", adoption: "78%", healthScore: "92/100", vigor: "91.0%", pests: "< 3.0%", yieldEst: "2.8 Ton/ha", status: "Aprovado IIAM" }
    ];

    const activeVarietyData = sampleVarieties.find(v => v.id === selectedVariety) || sampleVarieties[0];

    return (
        <main className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-20">
            {/* IIAM Header Bar */}
            <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
                <div className="max-w-[1400px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center">
                            <Dna className="w-6 h-6 text-emerald-600" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="font-black text-slate-900 text-base tracking-tight">PAINEL CIENTÍFICO IIAM</span>
                                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2.5 py-0.5 rounded-full border border-emerald-200">
                                    Instituto de Investigação Agrária de Moçambique
                                </span>
                            </div>
                            <p className="text-[11px] text-slate-500 font-medium">Telemetria & Rastreabilidade de Variedades Agrárias</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <Link href="/inovacao/agrobotanica">
                            <Button variant="outline" className="border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold h-9">
                                <ScanLine className="w-4 h-4 mr-1.5 text-[#f97316]" /> AgroBotanica AI
                            </Button>
                        </Link>
                        <Link href="/inovacao">
                            <Button className="bg-[#f97316] hover:bg-orange-600 text-white font-bold text-xs h-9 px-4 rounded-xl shadow-md shadow-orange-500/20">
                                Voltar à Inovação
                            </Button>
                        </Link>
                    </div>
                </div>
            </header>

            {/* Sub-Header KPI Strip */}
            <section className="bg-white border-b border-slate-200 py-6">
                <div className="max-w-[1400px] mx-auto px-4 sm:px-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-slate-50 border border-slate-200/80 p-4 rounded-2xl">
                        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-1">Lotes Certificados IIAM</span>
                        <span className="text-2xl font-black text-slate-900">48 Lotes</span>
                        <span className="text-[11px] text-emerald-600 font-bold block mt-1">100% Rastreáveis no Terreno</span>
                    </div>
                    <div className="bg-slate-50 border border-slate-200/80 p-4 rounded-2xl">
                        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-1">Províncias em Ensaio</span>
                        <span className="text-2xl font-black text-[#f97316]">10 Províncias</span>
                        <span className="text-[11px] text-slate-500 font-medium block mt-1">Nampula, Zambézia, Sofala...</span>
                    </div>
                    <div className="bg-slate-50 border border-slate-200/80 p-4 rounded-2xl">
                        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-1">Scans AgroBotanica AI</span>
                        <span className="text-2xl font-black text-emerald-600">14.280 Scans</span>
                        <span className="text-[11px] text-emerald-600 font-bold block mt-1">+18% nos últimos 30 dias</span>
                    </div>
                    <div className="bg-slate-50 border border-slate-200/80 p-4 rounded-2xl">
                        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-1">Produtores Monitorizados</span>
                        <span className="text-2xl font-black text-slate-900">8.950 Produtores</span>
                        <span className="text-[11px] text-slate-500 font-medium block mt-1">Cobertura Nacional Ativa</span>
                    </div>
                </div>
            </section>

            {/* Main Interactive Workspace */}
            <section className="max-w-[1400px] mx-auto px-4 sm:px-6 py-8">
                {/* Variety Selector Tabs */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                    <div>
                        <span className="text-[11px] font-bold text-[#f97316] uppercase tracking-widest">Seleção de Variedade Agrária</span>
                        <h2 className="text-xl font-black text-slate-900 mt-0.5">Telemetria Científica de Culturas</h2>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        {sampleVarieties.map(v => (
                            <button
                                key={v.id}
                                onClick={() => setSelectedVariety(v.id)}
                                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                                    selectedVariety === v.id
                                        ? "bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-500/20"
                                        : "bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200"
                                }`}
                            >
                                {v.crop} ({v.name.split(" ")[1]})
                            </button>
                        ))}
                    </div>
                </div>

                {/* Grid Layout */}
                <div className="grid lg:grid-cols-3 gap-6">
                    {/* Left Column: Variety Overview */}
                    <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-6 shadow-sm">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                            <div className="flex items-center gap-2">
                                <Sprout className="w-5 h-5 text-emerald-600" />
                                <h3 className="font-bold text-slate-900 text-base">Ficha Técnica IIAM</h3>
                            </div>
                            <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2.5 py-1 rounded-full border border-emerald-200">
                                {activeVarietyData.status}
                            </span>
                        </div>

                        <div>
                            <h4 className="text-xl font-black text-slate-900 mb-1">{activeVarietyData.name}</h4>
                            <p className="text-xs text-slate-500">Região de Ensaio: <strong className="text-slate-700">{activeVarietyData.testRange}</strong></p>
                        </div>

                        <div className="space-y-3">
                            <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl border border-slate-100">
                                <span className="text-xs text-slate-500 font-medium">Taxa de Adoção Regional</span>
                                <span className="text-sm font-black text-emerald-600">{activeVarietyData.adoption}</span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl border border-slate-100">
                                <span className="text-xs text-slate-500 font-medium">Índice de Vigor Foliar</span>
                                <span className="text-sm font-black text-[#f97316]">{activeVarietyData.healthScore}</span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl border border-slate-100">
                                <span className="text-xs text-slate-500 font-medium">Rendimento Estimado</span>
                                <span className="text-sm font-black text-slate-900">{activeVarietyData.yieldEst}</span>
                            </div>
                        </div>

                        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
                            <div className="flex items-center gap-2 mb-2">
                                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                                <span className="text-xs font-bold text-emerald-800">Chancela Oficial IIAM</span>
                            </div>
                            <p className="text-xs text-emerald-900/80 leading-relaxed font-medium">
                                Variedade testada e certificada pelos laboratórios centrais do IIAM para tolerância às condições climáticas de Moçambique.
                            </p>
                        </div>
                    </div>

                    {/* Right Column: Telemetry & Field Response */}
                    <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 flex flex-col justify-between space-y-6 shadow-sm">
                        <div>
                            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-lg bg-orange-50 border border-orange-100 flex items-center justify-center">
                                        <Activity className="w-5 h-5 text-[#f97316]" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-900 text-base">Telemetria de Campo (AgroBotanica Engine)</h3>
                                        <p className="text-xs text-slate-500">Respostas fenológicas captadas via visão computacional</p>
                                    </div>
                                </div>
                                <span className="text-xs text-slate-400 font-mono">Atualizado há 15 min</span>
                            </div>

                            <p className="text-sm text-slate-600 leading-relaxed mb-6 font-medium">
                                Os ensaios de campo na região de <strong>{activeVarietyData.testRange}</strong> confirmam elevada resiliência biológica da cultura <strong>{activeVarietyData.name}</strong>, mantendo baixíssimos níveis de infestação e retenção hídrica superior em mais de 12% em comparação com sementes convencionais.
                            </p>

                            <div className="grid md:grid-cols-3 gap-4 mb-6">
                                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 text-center">
                                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Vigor Vegetativo</span>
                                    <p className="text-2xl font-black text-emerald-600 mt-1">{activeVarietyData.vigor}</p>
                                </div>
                                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 text-center">
                                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Incidência de Pragas</span>
                                    <p className="text-2xl font-black text-[#f97316] mt-1">{activeVarietyData.pests}</p>
                                </div>
                                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 text-center">
                                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Produtividade Esperada</span>
                                    <p className="text-2xl font-black text-slate-900 mt-1">{activeVarietyData.yieldEst}</p>
                                </div>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                            <span className="text-xs text-slate-400 font-medium">Base de Dados Agro · IIAM Scientific Telemetry Engine</span>
                            <div className="flex items-center gap-3">
                                <Button variant="outline" className="border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold">
                                    <Download className="w-4 h-4 mr-2" /> Exportar Dados IIAM
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
}
