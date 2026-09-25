import React from "react";
import { PageHeader } from "@/components/PageHeader";
import { MarketStatsStrip } from "@/components/MarketStatsStrip";
import { Building2, Wheat, TrendingUp, Users, ArrowRight, BarChart3 } from "lucide-react";
import Link from "next/link";
import { setRequestLocale } from "next-intl/server";

export default async function StatisticsHubPage({
    params,
}: {
    params: Promise<{ locale: string }>;
}) {
    const { locale } = await params;
    setRequestLocale(locale);

    return (
        <main className="min-h-screen bg-slate-50 pb-20">
            <PageHeader
                title={<>Indicadores e Estatísticas do <span className="text-[#f97316]">Sector Agrário</span></>}
                icon={BarChart3}
                backgroundImage="https://images.unsplash.com/photo-1625246333195-bf7d7fb37568?q=80&w=2000&auto=format&fit=crop"
                breadcrumbs={[
                    { label: "Início", href: "/" },
                    { label: "Estatísticas do Sector", href: undefined }
                ]}
            />

            {/* Strip de Estatísticas Macroeconómicas Reais */}
            <MarketStatsStrip />

            {/* Secção Detalhada das 4 Temáticas Principais */}
            <section className="container-site py-16 space-y-12">
                <div className="text-center max-w-3xl mx-auto space-y-4">
                    <span className="text-[#f97316] font-bold text-xs uppercase tracking-widest bg-orange-100/80 px-3 py-1 rounded-full">
                        Dados Oficiais Moçambique 2025/2026
                    </span>
                    <h2 className="text-3xl md:text-4xl font-heading font-black text-slate-800">
                        Dimensão Atual e Desempenho Macroeconómico
                    </h2>
                    <p className="text-slate-600 text-base leading-relaxed">
                        Consolidação de indicadores estratégicos da produção, contributo para o PIB, empregabilidade e densidade do tecido empresarial agrícola nacional.
                    </p>
                </div>

                {/* Grid dos 4 Pilares Reais */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

                    {/* Pilar 1: Directório de Empresas */}
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group">
                        <div className="space-y-4">
                            <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold">
                                <Building2 className="w-6 h-6" />
                            </div>
                            <div>
                                <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">Directório de Empresas</span>
                                <h3 className="text-3xl font-heading font-black text-slate-800 mt-1">950+</h3>
                                <p className="text-slate-500 text-xs font-semibold mt-1">Empresas Ativas no Mercado</p>
                            </div>
                            <p className="text-slate-600 text-sm leading-relaxed">
                                Registo unificado abrangendo insumos agrícolas, tecnologia agrária, consultoria, agro-processamento e serviços conexos.
                            </p>
                        </div>
                        <div className="pt-6 border-t border-slate-100 mt-6">
                            <Link href="/estatisticas/empresas" className="inline-flex items-center text-xs font-bold text-emerald-600 group-hover:text-emerald-700 gap-1">
                                Ver Análise de Empresas <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                            </Link>
                        </div>
                    </div>

                    {/* Pilar 2: Produção Agrária */}
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group">
                        <div className="space-y-4">
                            <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center font-bold">
                                <Wheat className="w-6 h-6" />
                            </div>
                            <div>
                                <span className="text-xs font-bold uppercase tracking-wider text-amber-600">Produção Agrária 2025/26</span>
                                <h3 className="text-3xl font-heading font-black text-slate-800 mt-1">20M+ Tons</h3>
                                <p className="text-slate-500 text-xs font-semibold mt-1">Crescimento de 5% este ano</p>
                            </div>
                            <p className="text-slate-600 text-sm leading-relaxed">
                                Produção nacional fixada acima de 20 milhões de toneladas, impulsionada por culturas alimentares e de rendimento.
                            </p>
                        </div>
                        <div className="pt-6 border-t border-slate-100 mt-6">
                            <Link href="/estatisticas/producao" className="inline-flex items-center text-xs font-bold text-amber-600 group-hover:text-amber-700 gap-1">
                                Ver Dados de Produção <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                            </Link>
                        </div>
                    </div>

                    {/* Pilar 3: PIB Agrícola */}
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group">
                        <div className="space-y-4">
                            <div className="w-12 h-12 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center font-bold">
                                <TrendingUp className="w-6 h-6" />
                            </div>
                            <div>
                                <span className="text-xs font-bold uppercase tracking-wider text-orange-600">PIB Agrícola (Q2 2025)</span>
                                <h3 className="text-3xl font-heading font-black text-slate-800 mt-1">91.4B MZN</h3>
                                <p className="text-slate-500 text-xs font-semibold mt-1">24% do PIB Nacional</p>
                            </div>
                            <p className="text-slate-600 text-sm leading-relaxed">
                                O sector agrícola continua a ser um dos pilares económicos mais sólidos, gerando 91.4 mil milhões de MZN.
                            </p>
                        </div>
                        <div className="pt-6 border-t border-slate-100 mt-6">
                            <Link href="/estatisticas/economia" className="inline-flex items-center text-xs font-bold text-orange-600 group-hover:text-orange-700 gap-1">
                                Ver Desempenho Económico <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                            </Link>
                        </div>
                    </div>

                    {/* Pilar 4: Emprego Agrícola */}
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group">
                        <div className="space-y-4">
                            <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                                <Users className="w-6 h-6" />
                            </div>
                            <div>
                                <span className="text-xs font-bold uppercase tracking-wider text-blue-600">Emprego Agrícola</span>
                                <h3 className="text-3xl font-heading font-black text-slate-800 mt-1">70%</h3>
                                <p className="text-slate-500 text-xs font-semibold mt-1">Da Força Laboral Nacional</p>
                            </div>
                            <p className="text-slate-600 text-sm leading-relaxed">
                                Base de sustento, rendimento e segurança alimentar direta para a maioria esmagadora da população moçambicana.
                            </p>
                        </div>
                        <div className="pt-6 border-t border-slate-100 mt-6">
                            <Link href="/estatisticas/emprego" className="inline-flex items-center text-xs font-bold text-blue-600 group-hover:text-blue-700 gap-1">
                                Ver Dados de Emprego <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                            </Link>
                        </div>
                    </div>

                </div>
            </section>
        </main>
    );
}
