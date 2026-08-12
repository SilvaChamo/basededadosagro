"use client";

import React from "react";
import { ArrowLeft, BookOpen, ScrollText, History, Target, Users, Quote } from "lucide-react";
import Link from "next/link";

export default function HistorialPage() {
    return (
        <main className="min-h-screen bg-slate-50">
            {/* Header / Breadcrumbs */}
            <div className="bg-white border-b border-slate-200 py-4">
                <div className="container-site flex items-center justify-between">
                    <Link href="/sobre-nos" className="flex items-center gap-2 text-slate-500 hover:text-emerald-600 transition-colors group">
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        <span className="text-sm font-bold uppercase tracking-widest">Voltar para Sobre Nós</span>
                    </Link>
                    <div className="hidden md:flex items-center gap-3">
                        <History className="w-5 h-5 text-[#f97316]" />
                        <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Nosso Historial</span>
                    </div>
                </div>
            </div>

            <div className="container-site flex flex-col md:flex-row min-h-[calc(100vh-65px)]">

                {/* Left Column (Menu / Identity) */}
                <aside className="w-full md:w-[350px] bg-white border-b md:border-b-0 md:border-r border-slate-200 p-[25px] space-y-8 md:sticky md:top-[80px] md:self-start md:h-[calc(100vh-80px)] overflow-y-auto">
                    <div className="space-y-2.5">
                        <div>
                            <h2 className="text-2xl font-black text-slate-800 leading-tight">Base de Dados <br /><span className="text-emerald-600">Agrícola</span></h2>
                        </div>
                        <p className="text-[15px] text-slate-500 leading-relaxed font-medium">
                            A força motriz da inovação agrária no país, unindo o legado da comunicação à precisão da tecnologia de dados.
                        </p>
                    </div>

                    <nav className="space-y-[15px]">
                        {[
                            { icon: BookOpen, label: "A origem", active: true },
                            { icon: ScrollText, label: "O jornal agrícola", active: false },
                            { icon: Target, label: "A evolução digital", active: false },
                            { icon: Users, label: "Impacto comunitário", active: false }
                        ].map((item, i) => (
                            <div
                                key={i}
                                className={`flex items-center gap-4 py-2 px-4 rounded-[8px] transition-all cursor-pointer border ${item.active ? 'bg-emerald-50 text-emerald-700 shadow-sm border-emerald-400 font-semibold' : 'text-slate-500 border-slate-200 hover:bg-slate-50 hover:text-slate-700 font-medium'}`}
                            >
                                <item.icon className={`w-5 h-5 ${item.active ? 'text-emerald-600' : 'text-slate-400'}`} />
                                <span className="text-[15px] tracking-tight">{item.label}</span>
                            </div>
                        ))}
                    </nav>

                    <div className="pt-10 pb-12 border-t border-slate-300">
                        <div className="bg-orange-100 rounded-[10px] p-8 border border-orange-400 shadow-md">
                            <p className="text-[11px] font-black text-orange-600 uppercase tracking-widest mb-3">Próximo capítulo</p>
                            <p className="text-[14px] font-bold text-slate-700 leading-relaxed italic">
                                "Não paramos no diagnóstico; agora estamos a construir o futuro da robótica no campo."
                            </p>
                        </div>
                    </div>
                </aside>

                {/* Right Column (The History Content) */}
                <section className="flex-1 bg-white md:bg-transparent py-8 md:py-16 lg:py-24 md:pl-16 lg:pl-24 pb-32">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-emerald-600/10 border border-emerald-500/20 mb-6">
                            <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                            <span className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">Trajectória de Inovação</span>
                        </div>

                        <h1 className="text-[28px] md:text-[45px] font-[900] text-slate-800/80 leading-[1.1] mb-6 tracking-tight">
                            O nosso <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#f97316] to-orange-600">Historial</span>
                        </h1>

                        <p className="text-[18px] text-slate-500 font-medium leading-relaxed max-w-2xl mb-20">
                            A nossa jornada é marcada pela adaptação constante e pelo compromisso inabalável com o sector agrário. Explore os marcos fundamentais que transformaram a nossa visão em realidade tecnológica.
                        </p>

                        {/* Timeline Container */}
                        <div className="relative space-y-20">
                            {/* Vertical Journey Line */}
                            <div className="absolute left-[27px] top-6 bottom-0 w-[2px] bg-gradient-to-b from-slate-200 via-emerald-500/30 to-orange-500/30 hidden md:block"></div>

                            {/* Section 1 */}
                            <div className="relative group transition-all duration-500">
                                {/* Marker Circle */}
                                <div className="absolute left-0 md:left-[27px] top-8 md:-translate-x-1/2 z-20 hidden md:block">
                                    <span className="w-14 h-14 rounded-full bg-slate-900 text-white flex items-center justify-center text-[22px] font-black shrink-0 shadow-xl shadow-slate-900/20 group-hover:scale-110 transition-transform">01</span>
                                </div>

                                {/* Content Card */}
                                <div className="md:ml-[80px] bg-white p-8 md:p-10 rounded-[20px] border border-slate-300 shadow-[0_10px_40px_-15px_rgba(0,0,0,0.05)] hover:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] transition-all duration-500 relative">
                                    <div className="md:hidden mb-6">
                                        <span className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-slate-900 text-white text-lg font-black">01</span>
                                    </div>
                                    <h3 className="text-2xl font-black text-slate-800/90 mb-6">
                                        A Raiz: O Jornal Agrícola
                                    </h3>
                                    <div className="space-y-2.5">
                                        <p className="text-[19px] text-slate-600 leading-tight font-medium">
                                            Tudo começou com o **O Jornal EntreCCAMPOS — Jornal Agrícola**, uma iniciativa registada pelo GABINFO em 2015, como um Orgão de comunicação destinada à divulgação de informações relacionadas com a Agricultura e Desenvolvimento Comunitário, criação e gestão de projectos para o desenvolvimento das comunidades a nível nacional.
                                        </p>
                                        <div className="w-full h-[1.5px] bg-slate-100"></div>
                                        <p className="text-[15px] text-slate-500 leading-relaxed font-medium">
                                            Durante anos, o jornal foi a voz do campo, reportando notícias e desafios enfrentados pelos agricultores. No entanto, percebemos que reportar os factos era apenas o início. Para realmente transformar a vida no campo, era necessário entregar **soluções tangíveis**, é dái que surge a ideia de criar a base de dados agrícolas.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Section 2 */}
                            <div className="relative group transition-all duration-500">
                                {/* Marker Circle */}
                                <div className="absolute left-0 md:left-[27px] top-8 md:-translate-x-1/2 z-20 hidden md:block">
                                    <span className="w-14 h-14 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[22px] font-black shrink-0 shadow-xl shadow-emerald-600/20 group-hover:scale-110 transition-transform">02</span>
                                </div>

                                {/* Content Card */}
                                <div className="md:ml-[80px] bg-white p-8 md:p-10 rounded-[20px] border border-slate-300 shadow-[0_10px_40px_-15px_rgba(0,0,0,0.05)] hover:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] transition-all duration-500 relative">
                                    <div className="md:hidden mb-6">
                                        <span className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-emerald-600 text-white text-lg font-black">02</span>
                                    </div>
                                    <h3 className="text-2xl font-black text-slate-800/90 mb-6">
                                        A Metamorfose Tecnológica
                                    </h3>
                                    <div className="space-y-2.5">
                                        <p className="text-[19px] text-slate-600 leading-tight font-medium">
                                            Identificamos que a maior barreira para o crescimento não era a falta de vontade, mas a **falta de dados estruturados** e a dificuldade de conexão directa entre os actores da cadeia de valor.
                                        </p>
                                        <div className="w-full h-[1.5px] bg-slate-100"></div>
                                        <p className="text-[15px] text-slate-500 leading-relaxed font-medium">
                                            Foi então que tomamos uma decisão estratégica: o Jornal Agrícola deixaria de ser apenas um meio impresso para se tornar o coração de uma infra-estrutura digital. Assim nasceu a **Base de Dados Agrícola de Moçambique**.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Section 3 */}
                            <div className="relative group transition-all duration-500">
                                {/* Marker Circle */}
                                <div className="absolute left-0 md:left-[27px] top-8 md:-translate-x-1/2 z-20 hidden md:block">
                                    <span className="w-14 h-14 rounded-full bg-[#f97316] text-white flex items-center justify-center text-[22px] font-black shrink-0 shadow-xl shadow-orange-600/20 group-hover:scale-110 transition-transform">03</span>
                                </div>

                                {/* Content Card */}
                                <div className="md:ml-[80px] bg-white p-8 md:p-10 rounded-[20px] border border-slate-300 shadow-[0_10px_40px_-15px_rgba(0,0,0,0.05)] hover:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] transition-all duration-500 relative">
                                    <div className="md:hidden mb-6">
                                        <span className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#f97316] text-white text-lg font-black">03</span>
                                    </div>
                                    <h3 className="text-2xl font-black text-slate-800/90 mb-6">
                                        O Presente e o Futuro
                                    </h3>
                                    <div className="space-y-2.5">
                                        <p className="text-[19px] text-slate-600 leading-tight font-medium">
                                            Hoje, a base de dados é muito mais do que um arquivo — é o motor propulsor que alimenta o aplicativo **Botânica**, monitora cotações de mercado e conecta fornecedores a clientes.
                                        </p>
                                        <div className="w-full h-[1.5px] bg-slate-100"></div>
                                        <p className="text-[15px] text-slate-500 leading-relaxed font-medium">
                                            Esquecemos a banca para focar no terreno. A nossa historia está a ser escrita agora, linha a linha de código, transação a transação, hectare a hectare. Somos a evolução digital da comunicação agrária em Moçambique.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Quote Section (Final Milestone) - Adjusted to stay within content bounds */}
                            <div className="pt-12">
                                <div className="bg-gradient-to-br from-emerald-950 via-emerald-900 to-slate-900 rounded-[20px] py-10 px-12 md:py-12 md:px-16 text-left relative overflow-hidden group border border-emerald-800/30">
                                    <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 blur-[100px] rounded-full"></div>
                                    <div className="relative z-10 max-w-3xl">
                                        <h4 className="text-emerald-400 text-[32px] font-[900] tracking-tight mb-8">Para produzir soluções tangíveis</h4>
                                        <div className="flex items-start gap-6">
                                            <div className="flex flex-col items-center shrink-0 mt-1.5 gap-4">
                                                <div className="relative">
                                                    <Quote className="w-6 h-6 text-emerald-400 opacity-80 fill-emerald-400/20" />
                                                    <div className="absolute inset-0 w-6 h-6 bg-emerald-500/20 blur-md rounded-full"></div>
                                                </div>
                                                <div className="w-[3px] h-16 bg-orange-500 rounded-full"></div>
                                            </div>
                                            <p className="text-[20px] md:text-[24px] font-normal text-white leading-relaxed tracking-tight">
                                                Transformamos o jornal em tecnologia, para que o agricultor não apenas leia sobre a mudança, mas a sinta no seu rendimento final.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

            </div>
        </main>
    );
}
