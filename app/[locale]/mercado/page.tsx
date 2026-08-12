"use client";

import React, { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { SearchSection } from "@/components/SearchSection";
import { ShoppingBag, Search, X, TrendingUp, BarChart3, Globe2, ArrowRight, MousePointer2 } from "lucide-react";

import { MarketPriceTable } from "@/components/MarketPriceTable";
import { MarketSidebar } from "@/components/MarketSidebar";
import { SupermarketCarousel } from "@/components/SupermarketCarousel";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { usePlanPermissions } from "@/hooks/usePlanPermissions";

export default function MercadoPage() {
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const router = useRouter();
    const { plan } = usePlanPermissions();

    const handleAnunciarClick = () => {
        if (plan === 'Business Vendedor' || plan === 'Parceiro') {
            router.push('/usuario/dashboard/produtos');
        } else {
            router.push('/planos');
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 font-sans relative">
            <div className="relative">
                <PageHeader
                    title={<>Mercado <span className="text-[#f97316]">Agro</span></>}
                    icon={ShoppingBag}
                    backgroundImage="https://images.unsplash.com/photo-1488459716781-31db52582fe9?q=80&w=2000&auto=format&fit=crop"
                    breadcrumbs={[
                        { label: "Início", href: "/" },
                        { label: "Mercado", href: undefined }
                    ]}
                />

                {/* Botão de Pesquisa Flutuante - Alinhado à Direita do Conteúdo */}
                <div className="absolute bottom-6 w-full z-20 pointer-events-none">
                    <div className="container-site mx-auto flex justify-end">
                        <button
                            onClick={() => setIsSearchOpen(!isSearchOpen)}
                            className={`w-12 h-12 rounded-[7px] flex items-center justify-center transition-all duration-300 shadow-xl pointer-events-auto animate-in fade-in slide-in-from-bottom-8 duration-700 ${isSearchOpen
                                ? "bg-[#f97316] text-white rotate-90 border border-[#f97316]"
                                : "bg-[#22c55e] text-white hover:bg-[#f97316] hover:scale-110"
                                }`}
                        >
                            {isSearchOpen ? <X className="w-6 h-6" /> : <Search className="w-6 h-6" />}
                        </button>
                    </div>
                </div>
            </div>

            <SearchSection isOpen={isSearchOpen} withBottomBorder={true} />

            {/* 1. Secção Principal (Conteúdo em Grid) */}
            <main className="container-site pt-12 pb-20">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    {/* Main Content Area */}
                    <div className="lg:col-span-8 space-y-8">
                        {/* Mercado Digital Carousel */}
                        <section>
                            <SupermarketCarousel />
                        </section>

                        {/* Tabela de Preços (SIMA) */}
                        <section>
                            <MarketPriceTable />
                        </section>
                    </div>

                    {/* Sidebar Area */}
                    <div className="lg:col-span-4">
                        <MarketSidebar />
                    </div>
                </div>
            </main>

            {/* 2. Secção de Impacto (Dark Theme - Premium Style) */}
            <div className="w-full relative py-24 overflow-hidden bg-slate-900">
                {/* Fixed Background Image effect */}
                <div
                    className="absolute inset-0 z-0 bg-fixed bg-cover bg-center opacity-40 mix-blend-multiply"
                    style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=2000&auto=format&fit=crop)' }}
                ></div>
                <div className="absolute inset-0 bg-gradient-to-b from-slate-900/90 via-slate-900/70 to-slate-900/90 z-[1]"></div>

                <div className="container-site relative z-10">
                    <div className="text-center mb-16 max-w-3xl mx-auto">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-white/5 border border-white/10 mb-6">
                            <span className="w-2 h-2 rounded-full bg-[#f97316] animate-pulse"></span>
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/70">Inteligência Estratégica</span>
                        </div>
                        <h2 className="text-white text-[28px] md:text-[45px] font-black leading-tight mb-4 tracking-tight">
                            Acompanhe as <span className="text-[#f97316]">Tendências</span> do Mercado em Tempo Real
                        </h2>
                        <p className="text-slate-400 font-medium leading-relaxed">
                            A nossa plataforma agrega dados de múltiplas fontes para fornecer uma visão clara dos fluxos comerciais, flutuações de preços e oportunidades de negócio.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Glass Card 1 */}
                        <div className="relative bg-white/5 p-8 rounded-2xl border border-white/10 group overflow-hidden transition-all hover:bg-white/10 hover:-translate-y-2 duration-500">
                            <div className="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center mb-6 shadow-lg shadow-emerald-500/20 group-hover:scale-110 transition-transform">
                                <TrendingUp className="w-6 h-6 text-white" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-3">Análise de Preços</h3>
                            <p className="text-slate-400 text-sm leading-relaxed mb-6 font-medium">
                                Algoritmos que identificam variações sazonais e ajudam na tomada de decisão sobre o melhor momento para vender.
                            </p>
                            <div className="flex items-center gap-2 text-[#f97316] text-[11px] font-black uppercase tracking-widest cursor-pointer group/link">
                                Ver Indicadores <ArrowRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
                            </div>
                        </div>

                        {/* Glass Card 2 */}
                        <div className="relative bg-white/5 p-8 rounded-2xl border border-white/10 group overflow-hidden transition-all hover:bg-white/10 hover:-translate-y-2 duration-500">
                            <div className="w-12 h-12 bg-[#f97316] rounded-xl flex items-center justify-center mb-6 shadow-lg shadow-orange-500/20 group-hover:scale-110 transition-transform">
                                <Globe2 className="w-6 h-6 text-white" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-3">Fluxos Comerciais</h3>
                            <p className="text-slate-400 text-sm leading-relaxed mb-6 font-medium">
                                Mapeamento detalhado das rotas de escoamento e principais polos de consumo nas províncias de Moçambique.
                            </p>
                            <div className="flex items-center gap-2 text-[#f97316] text-[11px] font-black uppercase tracking-widest cursor-pointer group/link">
                                Mapa de Fluxos <ArrowRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
                            </div>
                        </div>

                        {/* Glass Card 3 */}
                        <div className="relative bg-white/5 p-8 rounded-2xl border border-white/10 group overflow-hidden transition-all hover:bg-white/10 hover:-translate-y-2 duration-500">
                            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mb-6 shadow-lg shadow-blue-600/20 group-hover:scale-110 transition-transform">
                                <BarChart3 className="w-6 h-6 text-white" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-3">Relatórios SIMA</h3>
                            <p className="text-slate-400 text-sm leading-relaxed mb-6 font-medium">
                                Acesso directo aos boletins informativos do Sistema de Informação de Mercados Agrícolas.
                            </p>
                            <div className="flex items-center gap-2 text-[#f97316] text-[11px] font-black uppercase tracking-widest cursor-pointer group/link">
                                Descarregar PDFs <ArrowRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* 3. Call to Action (Light Theme - Premium Accent) */}
            <div className="w-full bg-white py-20 border-t border-slate-100">
                <div className="container-site">
                    <div className="bg-emerald-50 rounded-[32px] p-8 md:p-16 flex flex-col md:flex-row items-center justify-between gap-10 border border-emerald-100 shadow-sm relative overflow-hidden">
                        {/* Decorative background element */}
                        <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-emerald-100/50 rounded-full blur-3xl pointer-events-none"></div>

                        <div className="max-w-xl relative z-10">
                            <h2 className="text-[28px] md:text-[45px] font-black text-emerald-950 leading-tight mb-4">
                                Quer vender os seus produtos <br />
                                no nosso <span className="text-emerald-600">Mercado Digital?</span>
                            </h2>
                            <p className="text-emerald-800/70 font-medium mb-8">
                                Registe a sua empresa hoje mesmo e comece a ser encontrado por milhares de compradores em todo o país.
                            </p>
                            <div className="flex flex-wrap gap-4">
                                <Link href="/registar">
                                    <button className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-4 rounded-xl font-black uppercase tracking-widest text-xs transition-all shadow-lg shadow-emerald-600/20 flex items-center gap-3">
                                        Registar Empresa <MousePointer2 className="w-4 h-4" />
                                    </button>
                                </Link>
                                <Link
                                    href="/registar"
                                    className="inline-flex items-center justify-center gap-2 bg-[#f97316] hover:bg-[#ea6a0a] text-white font-bold px-8 py-4 rounded-lg transition-all duration-300 hover:scale-105"
                                >
                                    Registar como Produtor
                                    <ArrowRight className="w-5 h-5" />
                                </Link>
                                <Link href="/contactos">
                                    <button className="bg-white hover:bg-slate-50 text-emerald-950 px-8 py-4 rounded-xl font-black uppercase tracking-widest text-xs transition-all border border-emerald-200">
                                        Falar com Consultor
                                    </button>
                                </Link>
                            </div>
                        </div>

                        <div className="relative shrink-0 z-10">
                            <div className="w-48 h-48 md:w-64 md:h-64 bg-white rounded-3xl shadow-2xl flex items-center justify-center p-8 border border-emerald-100 transform rotate-3 hover:rotate-0 transition-transform duration-500">
                                <ShoppingBag className="w-24 h-24 md:w-32 md:h-32 text-emerald-500 opacity-20" strokeWidth={1} />
                                <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
                                    <span className="text-[40px] md:text-[56px] font-black text-emerald-600 leading-none">+250</span>
                                    <span className="text-[10px] md:text-[12px] font-black uppercase tracking-widest text-emerald-900 mt-2">Empresas Activas</span>
                                    <button
                                        onClick={handleAnunciarClick}
                                        className="px-12 py-4 bg-white text-emerald-900 rounded-md font-black uppercase text-sm tracking-widest hover:scale-105 active:scale-95 shadow-xl transition-all"
                                    >
                                        Anunciar Produto
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
