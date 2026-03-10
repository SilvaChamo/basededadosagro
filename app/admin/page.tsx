"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import {
    FileText,
    BarChart3,
    Building2,
    Users,
    ShoppingCart,
    ArrowRight,
    TrendingUp,
    Clock,
    ChevronRight,
    Mail
} from "lucide-react";
import Link from "next/link";
import { LogoutButton } from "@/components/LogoutButton";

export default function AdminDashboardPage() {
    const [stats, setStats] = useState({
        articles: 0,
        companies: 0,
        products: 0,
        professionals: 0,
        statsRows: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchCounts() {
            const counts = await Promise.all([
                supabase.from('articles').select('*', { count: 'exact', head: true }),
                supabase.from('companies').select('*', { count: 'exact', head: true }),
                supabase.from('products').select('*', { count: 'exact', head: true }),
                supabase.from('professionals').select('*', { count: 'exact', head: true }),
                supabase.from('agricultural_stats').select('*', { count: 'exact', head: true })
            ]);

            setStats({
                articles: counts[0].count || 0,
                companies: counts[1].count || 0,
                products: counts[2].count || 0,
                professionals: counts[3].count || 0,
                statsRows: counts[4].count || 0
            });
            setLoading(false);
        }

        fetchCounts();
    }, []);

    const cards = [
        { name: "Artigos Publicados", value: stats.articles, icon: FileText, color: "text-blue-600", bg: "bg-blue-50", href: "/admin/artigos" },
        { name: "Empresas Registadas", value: stats.companies, icon: Building2, color: "text-emerald-600", bg: "bg-emerald-50", href: "/admin/empresas" },
        { name: "Profissionais no Sistema", value: stats.professionals, icon: Users, color: "text-indigo-600", bg: "bg-indigo-50", href: "/admin/profissionais" },
        { name: "Produtos", value: stats.products, icon: ShoppingCart, color: "text-orange-600", bg: "bg-orange-50", href: "/admin/produtos" },
    ];

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Gestão de Conteúdos</h1>
                    <p className="text-slate-500 font-medium">Bem-vindo ao painel administrativo. Monitorize e actualize os dados do site em tempo real.</p>
                </div>
                <div className="flex items-center gap-2">
                    <Link
                        href="/admin/mensagens"
                        className="inline-flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-[#f97316] transition-all shadow-sm active:scale-95 shrink-0"
                    >
                        <Mail className="w-3.5 h-3.5" />
                        Nova Mensagem
                    </Link>
                    <LogoutButton variant="outline" className="h-[36px] px-4 text-[10px] font-black uppercase tracking-widest text-slate-600 hover:text-red-600 border-slate-200" showIcon={true} label="Sair" />
                </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {cards.map((card) => (
                    <Link
                        key={card.name}
                        href={card.href}
                        className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between group hover:shadow-md transition-all cursor-pointer"
                    >
                        <div>
                            <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-1">{card.name}</p>
                            <h3 className="text-2xl font-black text-slate-800">{loading ? "..." : card.value}</h3>
                        </div>
                        <div className={`size-12 rounded-xl ${card.bg} ${card.color} flex items-center justify-center transition-transform group-hover:scale-110`}>
                            <card.icon className="w-6 h-6" />
                        </div>
                    </Link>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* Recent Activity / Quick Actions */}
                <div className="lg:col-span-8 space-y-6">
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-slate-50 flex items-center justify-between">
                            <h2 className="font-black text-sm uppercase tracking-widest text-slate-800 flex items-center gap-2">
                                <TrendingUp className="w-4 h-4 text-emerald-500" />
                                Resumo de Actividade
                            </h2>
                            <span className="text-[10px] font-black uppercase text-slate-400">Total de Dados: {stats.statsRows} linhas</span>
                        </div>
                        <div className="p-10 text-center">
                            <div className="max-w-xs mx-auto space-y-4">
                                <div className="size-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto">
                                    <BarChart3 className="w-10 h-10 text-emerald-500" />
                                </div>
                                <h4 className="font-extrabold text-slate-800">Pronto para novos dados?</h4>
                                <p className="text-xs text-slate-500 leading-relaxed font-medium">As estatísticas agrícolas são a base do nosso site. Comece por adicionar novos indicadores regionais.</p>
                                <Link
                                    href="/admin/estatisticas"
                                    className="inline-flex items-center gap-2 bg-[#f97316] text-white px-6 py-3 rounded-full text-xs font-black uppercase tracking-widest hover:bg-slate-900 transition-all shadow-lg shadow-orange-500/20"
                                >
                                    Adicionar Estatística
                                    <ArrowRight className="w-4 h-4" />
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sidebar Info */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="bg-slate-900 rounded-2xl p-8 text-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <Clock className="w-24 h-24" />
                        </div>
                        <h3 className="text-xl font-black mb-4 relative z-10">Dica de Gestão</h3>
                        <p className="text-sm text-slate-400 font-medium leading-relaxed relative z-10 mb-6">
                            Mantenha o empresas de empresas actualizado para garantir que os utilizadores encontram sempre informações precisas sobre parceiros e fornecedores.
                        </p>
                        <Link
                            href="/admin/empresas"
                            className="text-xs font-black uppercase tracking-widest text-emerald-400 hover:text-white transition-colors flex items-center gap-2 group"
                        >
                            Ver Empresas
                            <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>

                    <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
                        <h3 className="font-black text-xs uppercase tracking-widest text-slate-400 mb-4">Estado do Sistema</h3>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between text-xs font-bold">
                                <span className="text-slate-500">Ligação Supabase</span>
                                <span className="text-emerald-500 flex items-center gap-1.5">
                                    <div className="size-2 bg-emerald-500 rounded-full animate-pulse" />
                                    Activo
                                </span>
                            </div>
                            <div className="flex items-center justify-between text-xs font-bold">
                                <span className="text-slate-500">API de Conteúdos</span>
                                <span className="text-emerald-500 flex items-center gap-1.5">
                                    <div className="size-2 bg-emerald-500 rounded-full" />
                                    Online
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
