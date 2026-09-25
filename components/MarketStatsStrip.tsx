"use client";

import React, { useEffect, useState } from "react";
import { Building2, Wheat, TrendingUp, Users } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

export function MarketStatsStrip() {
    const [companyCount, setCompanyCount] = useState<string>("950+");

    useEffect(() => {
        const fetchRealCompanyCount = async () => {
            try {
                const { count, error } = await supabase
                    .from('companies')
                    .select('*', { count: 'exact', head: true })
                    .eq('is_archived', false);
                
                if (!error && count && count > 0) {
                    setCompanyCount(count >= 950 ? `${count}+` : "950+");
                }
            } catch (err) {
                console.error("Erro ao carregar contagem de empresas:", err);
            }
        };
        fetchRealCompanyCount();
    }, []);

    const stats = [
        {
            label: "Directório de Empresas",
            value: companyCount,
            sublabel: "Empresas Ativas no Mercado",
            icon: Building2,
            color: "text-emerald-400",
            bg: "bg-emerald-500/20"
        },
        {
            label: "Produção Agrária (2025/26)",
            value: "20M+ Tons",
            sublabel: "Crescimento de +5% este ciclo",
            icon: Wheat,
            color: "text-amber-400",
            bg: "bg-amber-500/20"
        },
        {
            label: "PIB Agrícola (Q2 2025)",
            value: "91.4B MZN",
            sublabel: "24% do PIB Nacional",
            icon: TrendingUp,
            color: "text-orange-400",
            bg: "bg-orange-500/20"
        },
        {
            label: "Emprego Agrícola",
            value: "70%",
            sublabel: "Força Laboral Nacional",
            icon: Users,
            color: "text-blue-400",
            bg: "bg-blue-500/20"
        }
    ];

    return (
        <section className="relative w-full py-[50px] overflow-hidden">
            {/* Background Image & Overlay */}
            <div className="absolute inset-0 z-0">
                <img
                    src="https://images.unsplash.com/photo-1625246333195-bf7d7fb37568?q=80&w=2000&auto=format&fit=crop"
                    alt="Background"
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-slate-900/90 mix-blend-multiply"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-slate-900/50"></div>
            </div>

            <div className="container-site relative z-10 text-white">
                <div className="flex flex-col lg:flex-row justify-between items-center gap-12 lg:gap-8">

                    {/* Header Text */}
                    <div className="lg:max-w-md text-center lg:text-left">
                        <h3 className="text-[28px] md:text-[45px] font-[900] leading-[1.1] tracking-tight mb-4 text-white">
                            Dimensão Atual e <br />
                            <span className="text-[#f97316]">Indicadores do Sector</span>
                        </h3>
                        <p className="text-slate-300 text-base md:text-lg leading-relaxed mb-4">
                            A maior base de dados interativa de Moçambique, ligando a produção nacional, operadores de mercado e dados macroeconómicos em tempo real.
                        </p>
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-white/10 border border-white/15 backdrop-blur-sm text-[11px] font-medium text-emerald-300">
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                            <span>Fontes Oficiais: INE (Contas Nacionais '25), MADER & Catalogação EntreCAMPOS</span>
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="flex-1 w-full grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-4 border-t lg:border-t-0 lg:border-l border-white/10 pt-8 lg:pt-0 lg:pl-12">
                        {stats.map((stat, index) => (
                            <div key={index} className="flex flex-col items-center text-center group">
                                <div className={`w-14 h-14 rounded-full ${stat.bg} backdrop-blur-sm border border-white/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                                    <stat.icon className={`w-7 h-7 ${stat.color}`} />
                                </div>
                                <span className="text-2xl md:text-3xl font-black text-white mb-1 tracking-tight">
                                    {stat.value}
                                </span>
                                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                                    {stat.label}
                                </span>
                                <span className="text-[11px] font-medium text-slate-400">
                                    {stat.sublabel}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}

