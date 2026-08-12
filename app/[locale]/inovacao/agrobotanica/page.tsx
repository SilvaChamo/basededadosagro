"use client";

import {
    Smartphone, Scan, Zap, Globe, ShieldCheck,
    BarChart3, CloudOff, MousePointer2
} from "lucide-react";
import { useState } from "react";

export default function AgroBotanicaPage() {
    const [isOfflineModalOpen, setIsOfflineModalOpen] = useState(false);

    return (
        <main className="min-h-screen overflow-x-hidden bg-white">
            {/* 1. Hero Section - Based on Image 2 */}
            <section className="pt-32 pb-20 relative overflow-hidden bg-white">
                <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                        backgroundImage: 'url(/images/markets/choppies_bg.png)',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        opacity: 0.18
                    }}
                ></div>
                {/* Background Decor - Subtle Overlay for Readability if needed */}
                <div className="absolute inset-0 bg-white/40 pointer-events-none"></div>

                {/* Subtle Blobs */}
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-emerald-500/5 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/4 pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-orange-500/5 blur-[100px] rounded-full translate-y-1/2 -translate-x-1/4 pointer-events-none"></div>

                <div className="container-site relative z-10">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <div>
                            {/* Badge */}
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-orange-50 border border-orange-100 mb-8">
                                <span className="w-2 h-2 rounded-full bg-[#f97316]"></span>
                                <span className="text-[11px] font-bold uppercase tracking-wider text-orange-700">Inovação Tecnológica de Ponta</span>
                            </div>

                            {/* Title */}
                            <h1 className="text-[45px] font-[900] text-slate-800 leading-[1.1] mb-8 tracking-tight">
                                Transformamos o seu smartphone num <span className="text-emerald-600">Engenheiro Agrónomo pessoal</span>
                            </h1>

                            {/* Quote */}
                            <p className="text-slate-500 text-lg leading-relaxed mb-10 font-medium italic border-l-4 border-[#f97316] pl-6 max-w-2xl">
                                "Democratizamos o conhecimento técnico para o pequeno e médio agricultor moçambicano, fornecendo inteligência artificial no bolso de cada produtor."
                            </p>

                            {/* Feature Cards */}
                            <div className="grid sm:grid-cols-2 gap-4">
                                <div className="bg-emerald-50/60 p-6 rounded-2xl border border-emerald-100 flex items-start gap-4 shadow-sm">
                                    <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center shrink-0">
                                        <Zap className="w-6 h-6 text-emerald-600" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-700">Diagnóstico Instantâneo</h4>
                                        <p className="text-xs text-slate-500 mt-1 leading-snug">Identifique pragas e doenças em segundos via IA.</p>
                                    </div>
                                </div>
                                <div
                                    onClick={() => setIsOfflineModalOpen(true)}
                                    className="bg-slate-50 p-6 rounded-2xl border border-slate-100 flex items-start gap-4 cursor-pointer hover:bg-slate-100 transition-all relative group shadow-sm"
                                >
                                    <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                                        <CloudOff className="w-6 h-6 text-orange-600" />
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-bold text-slate-700 group-hover:text-[#f97316] transition-colors">
                                            Funciona Offline
                                        </h4>
                                        <p className="text-xs text-slate-500 mt-1 leading-snug">Consultas críticas disponíveis sem internet no terreno.</p>
                                    </div>
                                    <div className="absolute bottom-3 right-5 flex items-center gap-1">
                                        <span className="text-[9px] font-black text-orange-600 uppercase tracking-widest">Leia mais</span>
                                        <MousePointer2 className="w-3 h-3 text-orange-600" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Column: Hero Mockup */}
                        <div className="relative flex justify-center lg:justify-end">
                            <div className="relative group">
                                {/* Glow Effect Removed as per "tirar sobreposição" */}
                                <div className="absolute inset-0 bg-transparent scale-110 opacity-0 transition-opacity"></div>

                                {/* Realistic Phone Mockup */}
                                <div className="relative z-10 w-[240px] md:w-[320px] bg-slate-900 rounded-[32px] p-[6px] shadow-2xl ring-1 ring-white/10 transform rotate-[1deg] transition-transform duration-700">
                                    <div className="relative w-full h-full bg-black rounded-[28px] overflow-hidden border-[2px] border-slate-800">
                                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[90px] h-[24px] bg-black z-20 rounded-b-[16px]"></div>
                                        <img
                                            src="/assets/botanica.webp"
                                            alt="AgroBotanica App"
                                            className="w-full h-auto object-cover opacity-100"
                                        />
                                    </div>

                                    {/* Side Buttons */}
                                    {/* Right Side: Power Button */}
                                    <div className="absolute top-32 -right-[2px] w-[3px] h-12 bg-black rounded-r-md shadow-sm border-r border-slate-900"></div>

                                    {/* Left Side: Volume Buttons */}
                                    <div className="absolute top-24 -left-[2px] w-[3px] h-10 bg-black rounded-l-md shadow-sm border-l border-slate-900"></div>
                                    <div className="absolute top-36 -left-[2px] w-[3px] h-10 bg-black rounded-l-md shadow-sm border-l border-slate-900"></div>
                                </div>

                                {/* Floating Badge */}
                                <div className="absolute bottom-8 -left-[164px] bg-[#f97316] p-4 rounded-2xl shadow-2xl transform rotate-[-6deg] z-20 shadow-orange-500/30 animate-float">
                                    <p className="text-white font-black text-[10px] uppercase tracking-tighter mb-0.5">Diagnóstico</p>
                                    <p className="text-white font-[900] text-lg">EM SEGUNDOS</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 2. Capacidades Técnicas - Based on Image 3 */}
            <section className="py-24 relative overflow-hidden bg-white">
                <div className="container-site relative z-10">
                    <div className="grid lg:grid-cols-[1.2fr_1fr] gap-0 items-center">
                        {/* Main Image */}
                        <div className="relative rounded-[20px] overflow-hidden shadow-2xl group border-8 border-white">
                            <img
                                src="/images/scientific-ad-natural.png"
                                alt="Tecnologia Agrária"
                                className="w-full aspect-[4/3] object-cover group-hover:scale-105 transition-transform duration-700"
                            />
                        </div>

                        {/* Content */}
                        <div className="lg:pl-8">
                            <h2 className="text-[45px] font-[900] text-slate-800 leading-tight mb-3">
                                Capacidades <span className="text-orange-500">Técnicas</span>
                            </h2>
                            <p className="text-slate-500 text-sm leading-tight font-medium mb-5 max-w-xl">
                                O nosso aplicativo integra ferramentas profissionais de última geração que levam o seu negócio a um novo patamar no setor agrícola, fornecendo inteligência e precisão em cada etapa da produção.
                            </p>

                            <div className="space-y-4">
                                {[
                                    {
                                        title: "Diagnóstico e Tratamento",
                                        desc: "Detecta pragas e doenças das plantas e sugere o tipo de tratamento adequado.",
                                        icon: ShieldCheck,
                                        color: "bg-blue-50 text-blue-500"
                                    },
                                    {
                                        title: "Scanner de Nutrientes",
                                        desc: "Revela o valor nutricional de plantas silvestres e cultivadas instantaneamente.",
                                        icon: BarChart3,
                                        color: "bg-orange-50 text-orange-500"
                                    },
                                    {
                                        title: "Mercado integrado",
                                        desc: "Localiza as lojas mais próximas na região com o insumo e pesticidas para tratar a doença detectada.",
                                        icon: Globe,
                                        color: "bg-emerald-50 text-emerald-500"
                                    }
                                ].map((item, i) => (
                                    <div key={i} className="flex items-center gap-4 bg-white p-4 rounded-[10px] border border-slate-100 shadow-sm hover:translate-x-3 transition-all duration-300">
                                        <div className={`w-12 h-12 ${item.color} rounded-md flex items-center justify-center shrink-0 shadow-sm`}>
                                            <item.icon className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h4 className="text-lg font-black text-slate-800 leading-[1.1] mb-0.5">{item.title}</h4>
                                            <p className="text-slate-500 text-sm leading-snug font-medium">{item.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 3. CTA Dark Banner - Based on Image 1 */}
            <div className="bg-[#111e26] md:py-20 py-16 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-1/3 h-full bg-emerald-500/5 -skew-x-12 translate-x-1/2"></div>
                <div className="container-site relative z-10 flex flex-col md:flex-row items-center justify-between gap-10">
                    <div className="text-center md:text-left">
                        <h3 className="text-white text-3xl md:text-[40px] font-black mb-4 uppercase tracking-tight leading-tight">
                            PRONTO PARA <span className="text-[#f97316]">DIGITALIZAR</span> O SEU CAMPO?
                        </h3>
                        <p className="text-slate-400 text-lg font-medium opacity-80">
                            Disponível para todos os produtores de Moçambique nas lojas de aplicativos.
                        </p>
                    </div>
                    <div className="flex flex-wrap justify-center gap-4 shrink-0">
                        <button className="px-10 py-4 bg-emerald-600 shadow-lg shadow-emerald-500/20 text-white font-black uppercase text-[13px] tracking-widest rounded-full hover:bg-emerald-500 transition-all active:scale-95">
                            Baixar Aplicativo
                        </button>
                        <a
                            href="https://botanicamoz.vercel.app"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-10 py-4 bg-white/5 border border-white/20 text-white font-black uppercase text-[13px] tracking-widest rounded-full hover:bg-white/10 transition-all active:scale-95 flex items-center justify-center"
                        >
                            Ver Demonstração
                        </a>
                    </div>
                </div>
            </div>

            {/* 4. R&D Green Card - Based on Image 1 */}
            <section className="py-24 bg-white relative">
                <div className="container-site">
                    <div className="bg-emerald-100 rounded-[20px] p-5 border border-emerald-200/50 relative overflow-hidden shadow-2xl shadow-emerald-900/10">
                        <div className="relative z-10 grid lg:grid-cols-[auto_1fr] gap-[15px] items-center">
                            <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-xl text-emerald-500 shrink-0">
                                <Zap className="w-10 h-10 animate-pulse" />
                            </div>
                            <div>
                                <h4 className="text-[12px] font-black uppercase text-emerald-600 tracking-[0.4em] mb-4">Pesquisa & Desenvolvimento</h4>
                                <h3 className="text-2xl md:text-[38px] font-[900] text-emerald-900 mb-6 leading-[1.1] tracking-tight">
                                    🚀 Inovação em Campo: <span className="text-emerald-700">Unidade Robótica Móvel</span>
                                </h3>
                                <p className="text-emerald-800/80 text-lg md:text-xl font-medium leading-relaxed max-w-5xl">
                                    Estamos a desenhar a futura unidade robótica móvel controlada remotamente, capaz de aplicar tratamentos localizados directamente nas plantas. Esta inovação visa reduzir drasticamente o desperdício de pesticidas e aumentar a precisão no tratamento de cada cultura individualmente.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Bottom Orange Divider */}
            <div className="w-full h-1.5 bg-[#f97316] shadow-sm"></div>

            {/* Offline Modal Overlay - Preserved Logic */}
            {isOfflineModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div
                        className="absolute inset-0 bg-slate-900/60 backdrop-blur-md transition-opacity"
                        onClick={() => setIsOfflineModalOpen(false)}
                    ></div>

                    <div className="relative bg-white w-full max-w-xl rounded-[32px] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
                        <div className="bg-emerald-600 p-10 text-white relative">
                            <div className="flex items-center gap-6">
                                <div className="w-20 h-20 bg-white/10 rounded-2xl backdrop-blur-md flex items-center justify-center border border-white/20">
                                    <CloudOff className="w-10 h-10 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-black text-white">Longe de tudo <br /> perto do conhecimento</h3>
                                    <p className="text-emerald-100/70 text-base font-medium mt-2">Produtividade total mesmo nas zonas mais remotas.</p>
                                </div>
                            </div>
                        </div>
                        <div className="w-full h-1.5 bg-orange-500"></div>
                        <div className="p-10 space-y-8">
                            <p className="text-slate-500 text-base leading-relaxed font-medium">
                                A conectividade em Moçambique é um desafio real. Por isso, a nossa arquitetura offline assegura que tenha as ferramentas de um engenheiro agrónomo sempre disponíveis no seu bolso.
                            </p>

                            <div className="space-y-8">
                                {[
                                    { title: "IA Local", desc: "O diagnóstico é feito no seu smartphone. Sem gastos de dados ou sinal.", icon: Zap, color: "bg-emerald-50 text-emerald-600" },
                                    { title: "Base de Dados", desc: "Fichas técnicas e dosagens ficam disponíveis offline para consulta.", icon: ShieldCheck, color: "bg-orange-50 text-orange-600" },
                                    { title: "Sincronização", desc: "Registe ocorrências offline e o App atualiza assim que encontrar Wi-Fi.", icon: Globe, color: "bg-blue-50 text-blue-600" }
                                ].map((item, i) => (
                                    <div key={i} className="flex gap-6">
                                        <div className={`w-12 h-12 rounded-2xl ${item.color} flex items-center justify-center shrink-0`}>
                                            <item.icon className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-slate-800 mb-1">{item.title}</h4>
                                            <p className="text-sm text-slate-500 leading-relaxed">{item.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <button
                                onClick={() => setIsOfflineModalOpen(false)}
                                className="w-full h-16 bg-slate-900 text-white rounded-2xl font-bold hover:bg-[#f97316] transition-all active:scale-95 shadow-lg mt-4"
                            >
                                Entendi, obrigado!
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}
