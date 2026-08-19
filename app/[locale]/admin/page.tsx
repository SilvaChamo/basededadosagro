"use client";

import { useEffect, useState } from "react";
import {
    getCachedDashboardStats, fetchAndCacheDashboardStats,
    getCachedDashboardExtra, fetchAndCacheDashboardExtra, type RecentItem,
} from "@/lib/adminDashboardCache";
import { supabase } from "@/lib/supabaseClient";
import {
    Activity,
    MessageSquare,
    Plus,
    Video,
    Clock,
    TrendingUp,
    Newspaper,
    Images,
    Bot,
} from "lucide-react";
import Link from "next/link";

export default function AdminDashboardPage() {
    const [stats, setStats] = useState({
        articles: 0,
        companies: 0,
        products: 0,
        professionals: 0,
        statsRows: 0
    });
    const [loading, setLoading] = useState(true);
    const [userName, setUserName] = useState("");
    const [pendingCount, setPendingCount] = useState(0);
    const [weeklyArticlesCount, setWeeklyArticlesCount] = useState(0);
    const [recentItems, setRecentItems] = useState<RecentItem[]>([]);
    const [recentLoading, setRecentLoading] = useState(true);

    useEffect(() => {
        // Dados prontos em cache (ex: pré-carregados no login) aparecem de imediato,
        // sem espera nem "..." — cache válido por 8 horas, ver lib/adminDashboardCache.ts.
        const cached = getCachedDashboardStats();
        if (cached) {
            setStats(cached);
            setLoading(false);
        } else {
            fetchAndCacheDashboardStats().then((data) => {
                setStats(data);
                setLoading(false);
            });
        }

        async function fetchUserName() {
            const { data } = await supabase.auth.getUser();
            if (!data.user) return;
            const { data: profile } = await supabase.from('profiles').select('full_name').eq('id', data.user.id).single();
            setUserName(profile?.full_name || data.user.email || "");
        }
        fetchUserName();

        function applyExtra(data: { pendingCount: number; weeklyArticlesCount: number; recentItems: RecentItem[] }) {
            setPendingCount(data.pendingCount);
            setWeeklyArticlesCount(data.weeklyArticlesCount);
            setRecentItems(data.recentItems);
            setRecentLoading(false);
        }

        // Pendentes/notícias-da-semana/actividade recente: em cache (5 min),
        // aparecem de imediato ao navegar de volta ao dashboard dentro da mesma
        // sessão — sem isso, cada clique voltava a disparar 6 pedidos ao
        // Supabase e a mostrar "A carregar..." outra vez. Mesmo com cache
        // válido, actualiza-se sempre em segundo plano (stale-while-revalidate)
        // para nunca ficar preso a um número desactualizado.
        const cachedExtra = getCachedDashboardExtra();
        if (cachedExtra) applyExtra(cachedExtra);
        fetchAndCacheDashboardExtra().then(applyExtra);
    }, []);

    const tiles = [
        { label: "Ver Notícias", value: loading ? "..." : stats.articles, valueColor: "text-slate-800", icon: Newspaper, color: "text-blue-600", bg: "bg-blue-50", href: "/admin/noticias" },
        { label: "Nova Notícia", value: loading ? "..." : weeklyArticlesCount, valueColor: "text-emerald-600", icon: Plus, color: "text-emerald-600", bg: "bg-emerald-50", href: "/admin/noticias" },
        { label: "Galeria", value: "→", valueColor: "text-slate-800", icon: Images, color: "text-purple-600", bg: "bg-purple-50", href: "/admin/galeria" },
        { label: "Pendentes", value: loading ? "..." : pendingCount, valueColor: "text-slate-800", icon: Bot, color: "text-orange-600", bg: "bg-orange-50", href: "/admin/noticias?tab=Pendentes" },
    ];

    const formatDateTime = (value: string) => {
        const date = new Date(value);
        const day = date.toLocaleDateString('pt-PT', { day: 'numeric', month: 'long' });
        const time = date.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' });
        return `${day} às ${time}`;
    };

    return (
        <div className="space-y-5">
            {/* Bem-vindo - o Sair agora vive só na mini-barra partilhada, acima */}
            <div className="bg-white rounded-[10px] border border-slate-100 shadow-sm p-6">
                <div>
                    <h2 className="text-xl font-black text-slate-900 leading-tight">Bem-vindo ao painel de administração</h2>
                    <p className="text-slate-500 font-medium text-sm leading-tight mt-0">
                        Olá{userName ? `, ${userName}` : ""}. Este é o seu painel de gestão.
                    </p>
                </div>

                <div className="border-t border-slate-100 mt-6 pt-6 grid grid-cols-1 lg:grid-cols-4 gap-5">
                    <div>
                        <h3 className="text-xs font-black uppercase tracking-widest text-slate-800 mb-3">Introdução</h3>
                        <p className="text-sm text-slate-500 mb-3">Veja todas as notícias ou</p>
                        <Link
                            href="/admin/noticias"
                            className="inline-flex items-center gap-2 bg-emerald-600 text-white px-4 py-3 rounded-[8px] text-[10px] font-black uppercase tracking-widest hover:bg-[#f97316] transition-all shadow-sm active:scale-95"
                        >
                            Adicionar Nova Notícia
                        </Link>
                    </div>

                    <div>
                        <h3 className="text-xs font-black uppercase tracking-widest text-slate-800 mb-3">Próximos passos</h3>
                        <div className="space-y-2.5">
                            <Link href="/" className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-emerald-600 transition-colors">
                                <Activity className="w-4 h-4 text-slate-400" />
                                Ver o seu site
                            </Link>
                            <Link href="/admin/mensagens" className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-emerald-600 transition-colors">
                                <MessageSquare className="w-4 h-4 text-slate-400" />
                                Gerir mensagens
                            </Link>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-xs font-black uppercase tracking-widest text-slate-800 mb-3">Mais acções</h3>
                        <div className="space-y-2.5">
                            <Link href="/admin/galeria" className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-emerald-600 transition-colors">
                                <Plus className="w-4 h-4 text-slate-400" />
                                Adicionar multimédia
                            </Link>
                            <Link href="/admin/galeria?tipo=videos" className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-emerald-600 transition-colors">
                                <Video className="w-4 h-4 text-slate-400" />
                                Gerir vídeos
                            </Link>
                        </div>
                    </div>

                    <div>
                        <h3 className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-800 mb-3">
                            <Clock className="w-3.5 h-3.5 text-emerald-500" />
                            Resumo do Site
                        </h3>
                        <div className="space-y-2.5">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-slate-500 font-medium">Empresas</span>
                                <span className="font-black text-slate-800">{loading ? "..." : stats.companies}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-slate-500 font-medium">Profissionais</span>
                                <span className="font-black text-slate-800">{loading ? "..." : stats.professionals}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Actividades Recentes + Acções Rápidas */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                <div className="lg:col-span-5">
                    <div className="bg-white rounded-[10px] border border-slate-100 shadow-sm overflow-hidden h-full">
                        <div className="p-6 border-b border-slate-50">
                            <h2 className="font-black text-sm uppercase tracking-widest text-slate-800 flex items-center gap-2">
                                <TrendingUp className="w-4 h-4 text-emerald-500" />
                                Actividades Recentes
                            </h2>
                        </div>
                        {recentLoading ? (
                            <div className="p-10 text-center text-slate-400 text-xs font-bold italic">A carregar...</div>
                        ) : recentItems.length === 0 ? (
                            <div className="p-10 text-center text-slate-400 text-xs font-bold italic">Sem actividade recente.</div>
                        ) : (
                            <div className="px-6 divide-y divide-slate-100">
                                {recentItems.map((item) => (
                                    <div key={`${item.type}-${item.id}`} className="py-3">
                                        <p className="text-xs text-slate-400 font-medium mb-1">{formatDateTime(item.created_at)}</p>
                                        <Link href={item.href} className="text-sm font-bold text-blue-600 hover:underline">
                                            {item.name}
                                        </Link>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div className="lg:col-span-7">
                    <div className="grid grid-cols-2 gap-5">
                        {tiles.map((tile) => (
                            <Link
                                key={tile.label}
                                href={tile.href}
                                className="bg-white rounded-[10px] border border-slate-100 shadow-sm px-6 py-4 flex flex-col items-center justify-center text-center gap-3 hover:shadow-md transition-all group"
                            >
                                <div className={`size-12 rounded-full ${tile.bg} ${tile.color} flex items-center justify-center transition-transform group-hover:scale-110`}>
                                    <tile.icon className="w-6 h-6" />
                                </div>
                                <p className={`text-2xl font-black ${tile.valueColor}`}>{tile.value}</p>
                                <p className="text-xs font-black uppercase tracking-widest text-slate-800">{tile.label}</p>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
