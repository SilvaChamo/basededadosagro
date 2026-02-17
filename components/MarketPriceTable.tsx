"use client";

import React, { useState, useEffect } from "react";
import { ArrowUp, ArrowDown, Minus, Search, Calendar, Info } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

interface MarketItem {
    id: string;
    product: string;
    unit: string;
    price: number;
    prev_price: number;
    location: string;
    category: string;
}

export function MarketPriceTable() {
    const [lastUpdated, setLastUpdated] = useState("");
    const [activeCategory, setActiveCategory] = useState("Todos");
    const [marketData, setMarketData] = useState<MarketItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedProvince, setSelectedProvince] = useState("Todas");

    useEffect(() => {
        // Simulate "Last Updated" as the current date
        const today = new Date();
        const dateString = today.toLocaleDateString('pt-MZ', { day: 'numeric', month: 'long', year: 'numeric' });
        setLastUpdated(dateString);

        fetchPrices();
    }, []);

    const fetchPrices = async () => {
        try {
            const { data, error } = await supabase
                .from('market_prices')
                .select('*')
                .order('product', { ascending: true });

            if (error) throw error;
            if (data) setMarketData(data as MarketItem[]); // Cast data to MarketItem[]
        } catch (error) {
            console.error("Error fetching market prices:", error);
        } finally {
            setLoading(false);
        }
    };

    const categories = ["Todos", "Grãos", "Legumes", "Frutas", "Animais", "Óleos"];

    // Get unique provinces from data
    const provinces = ["Todas", ...Array.from(new Set(marketData.map((item: any) => item.location))).sort()];

    const filteredData = marketData.filter((item: any) => {
        const matchesCategory = activeCategory === "Todos" || item.category === activeCategory;
        const matchesSearch = item.product.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesProvince = selectedProvince === "Todas" || item.location === selectedProvince;
        return matchesCategory && matchesSearch && matchesProvince;
    });

    const getTrendIcon = (current: number, previous: number) => {
        if (current > previous) return <ArrowUp className="w-4 h-4 text-rose-500" />;
        if (current < previous) return <ArrowDown className="w-4 h-4 text-emerald-500" />;
        return <Minus className="w-4 h-4 text-slate-400" />;
    };

    const getTrendText = (current: number, previous: number) => {
        if (current > previous) return <span className="text-rose-500 text-xs font-bold">Subiu</span>;
        if (current < previous) return <span className="text-emerald-500 text-xs font-bold">Desceu</span>;
        return <span className="text-slate-400 text-xs font-bold">Estável</span>;
    };

    if (loading) {
        return (
            <div className="w-full h-64 flex items-center justify-center bg-white rounded-[24px] shadow-sm border border-slate-100">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#f97316]"></div>
            </div>
        );
    }

    return (
        <div className="w-full bg-white rounded-[15px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-200 overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-[#4ade80] flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-emerald-600 relative">
                <div>
                    <h3 className="text-xl font-black text-white flex items-center gap-3">
                        <span className="flex items-center justify-center w-8 h-8 rounded-full bg-white/20 text-white backdrop-blur-sm">
                            <ArrowUp className="w-5 h-5 rotate-45" />
                        </span>
                        Cotações do Dia
                    </h3>
                    <p className="text-emerald-100 text-sm mt-1.5 pl-11 flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-emerald-200" />
                        <span>Actualizado hoje: <span className="font-bold text-white">{lastUpdated}</span></span>
                    </p>
                </div>

                <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
                    {/* Province Filter */}
                    <div className="relative">
                        <select
                            value={selectedProvince}
                            onChange={(e) => setSelectedProvince(e.target.value)}
                            className="appearance-none pl-4 pr-8 py-2.5 rounded-xl bg-emerald-700/50 border border-emerald-500/30 text-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-white/20 cursor-pointer hover:bg-emerald-700 transition-colors w-full md:w-40"
                        >
                            {provinces.map(prov => (
                                <option key={prov} value={prov} className="bg-slate-800 text-white">{prov}</option>
                            ))}
                        </select>
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                            <ArrowDown className="w-4 h-4 text-emerald-200" />
                        </div>
                    </div>

                    {/* Search Input */}
                    <div className="flex items-center gap-3 bg-emerald-700/50 border border-emerald-500/30 rounded-xl px-4 py-2.5 transition-all focus-within:ring-2 focus-within:ring-white/20 focus-within:bg-emerald-700 w-full md:w-64">
                        <Search className="w-4 h-4 text-emerald-200" />
                        <input
                            type="text"
                            placeholder="Pesquisar produto..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="text-sm bg-transparent border-none focus:outline-none text-white placeholder:text-emerald-200/70 w-full font-medium selection:bg-white/30"
                        />
                    </div>
                </div>
            </div>

            {/* Category Tabs */}
            <div className="bg-slate-800 border-b border-slate-700 px-6 flex gap-4 overflow-x-auto scrollbar-hide">
                {categories.map((cat) => (
                    <button
                        key={cat}
                        onClick={() => setActiveCategory(cat)}
                        className={`py-[10.5px] text-sm font-bold whitespace-nowrap transition-all duration-300 ${activeCategory === cat
                            ? "text-[#f97316]"
                            : "text-white/70 hover:text-[#f97316]"
                            }`}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            {/* Table */}
            <div className="overflow-x-auto max-h-[600px] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
                <table className="w-full min-w-[600px] relative">
                    <thead className="bg-slate-50/95 border-b border-slate-200 sticky top-0 z-10 backdrop-blur-sm shadow-sm">
                        <tr>
                            <th className="px-8 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Produto</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Unidade</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Mercado</th>
                            <th className="px-8 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Preço Médio</th>
                            <th className="px-6 py-4 text-center text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                        {filteredData.map((item, index) => (
                            <tr key={index} className="hover:bg-slate-50 transition-all border-b border-slate-200 last:border-none group">
                                <td className="px-8 py-2 whitespace-nowrap">
                                    <span className="font-bold text-slate-700 text-[15px] group-hover:text-[#f97316] transition-colors">{item.product}</span>
                                </td>
                                <td className="px-6 py-2 whitespace-nowrap">
                                    <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md">{item.unit}</span>
                                </td>
                                <td className="px-6 py-2 whitespace-nowrap">
                                    <span className="text-sm font-medium text-slate-500">{item.location}</span>
                                </td>
                                <td className="px-8 py-2 whitespace-nowrap text-right">
                                    <span className="text-base font-black text-slate-800">{item.price.toLocaleString('pt-MZ')} MT</span>
                                </td>
                                <td className="px-6 py-2 whitespace-nowrap text-center">
                                    <div className="flex items-center justify-center gap-2 w-fit mx-auto">
                                        {getTrendIcon(item.price, item.prev_price)}
                                        {getTrendText(item.price, item.prev_price)}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Footer / Source */}
            <div className="bg-slate-800 px-6 py-4 flex items-start gap-3">
                <Info className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
                <p className="text-xs text-slate-400 leading-relaxed">
                    <span className="font-bold text-slate-200">Fonte:</span> Ministério da Agricultura e Desenvolvimento Rural (MADER) - Sistema de Informação de Mercados Agrícolas (SIMA).
                    <br />Os preços são indicativos e representam a média das cotações recolhidas nos principais mercados grossistas nacionais.
                </p>
            </div>
        </div>
    );
}
