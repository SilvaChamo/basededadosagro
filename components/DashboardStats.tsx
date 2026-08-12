import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { Calendar, Download, TrendingUp, TrendingDown, Eye, MousePointerClick, MessageSquare, Percent, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DashboardPageHeader } from "@/components/DashboardPageHeader";

interface DashboardStatsProps {
    welcomeTitle?: string;
    welcomeSubtitle?: string;
    titleStyle?: React.CSSProperties;
    subtitleStyle?: React.CSSProperties;
    cardTitleStyle?: React.CSSProperties;
}

export function DashboardStats({
    welcomeTitle,
    welcomeSubtitle,
    titleStyle,
    subtitleStyle,
    cardTitleStyle
}: DashboardStatsProps) {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        impressions: 0,
        clicks: 0,
        leads: 0,
        ctr: 0
    });
    const supabase = createClient();

    useEffect(() => {
        const fetchRealStats = async () => {
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) return;

                // page_views/leads RLS blocks direct client reads even for the row owner,
                // so this goes through a server route that scopes the query to the caller.
                const response = await fetch('/api/dashboard/stats');
                if (!response.ok) throw new Error((await response.json()).error);
                const result = await response.json();

                setStats({
                    impressions: result.impressions,
                    clicks: result.clicks,
                    leads: result.leads,
                    ctr: result.ctr
                });
            } catch (err) {
                console.error("Error fetching real dashboard stats:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchRealStats();

        // Optional: Real-time subscription for leads
        const channel = supabase.channel('leads-updates')
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'leads' },
                () => {
                    fetchRealStats();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    return (
        <div className="space-y-5 mb-5">
            {/* Header Section */}
            <DashboardPageHeader
                title={welcomeTitle || "Estatística de Pesquisa"}
                description={welcomeSubtitle || "Acompanhe a visibilidade da sua empresa e produtos no Agro Data Moz."}
                titleStyle={titleStyle}
                descriptionStyle={subtitleStyle}
            >
                <div className="flex items-center justify-center px-4 h-10 gap-2 bg-white border border-slate-200 text-slate-600 font-semibold rounded-md shadow-sm cursor-default">
                    <Calendar className="w-4 h-4" />
                    Últimos 30 dias
                </div>
                <Button className="bg-[#22c55e] hover:bg-[#16a34a] text-white font-bold h-10 gap-2 shadow-lg shadow-green-500/20">
                    <Download className="w-4 h-4" />
                    Exportar Relatório
                </Button>
            </DashboardPageHeader>

            {/* KPIs Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                {/* KPI 1 - Impressões */}
                <div className="bg-white p-6 rounded-[15px] border border-slate-100 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
                    <div className="flex justify-between items-start mb-2">
                        <p className="text-sm font-semibold text-slate-500" style={cardTitleStyle}>Total de Impressões</p>
                        <div className="p-2 bg-emerald-50 rounded-[10px] text-emerald-600 group-hover:scale-110 transition-transform">
                            <Eye className="w-4 h-4" />
                        </div>
                    </div>
                    <div className="flex items-baseline gap-2">
                        <h3 className="text-3xl font-black text-slate-800">{loading ? "..." : stats.impressions.toLocaleString()}</h3>
                        <span className="text-xs font-bold text-emerald-500 flex items-center gap-0.5 bg-emerald-50 px-1.5 py-0.5 rounded-full">
                            <ShieldCheck className="w-3 h-3" /> Real
                        </span>
                    </div>
                </div>

                {/* KPI 2 - Cliques */}
                <div className="bg-white p-6 rounded-[15px] border border-slate-100 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
                    <div className="flex justify-between items-start mb-2">
                        <p className="text-sm font-semibold text-slate-500" style={cardTitleStyle}>Cliques no Perfil</p>
                        <div className="p-2 bg-blue-50 rounded-[10px] text-blue-600 group-hover:scale-110 transition-transform">
                            <MousePointerClick className="w-4 h-4" />
                        </div>
                    </div>
                    <div className="flex items-baseline gap-2">
                        <h3 className="text-3xl font-black text-slate-800">{loading ? "..." : stats.clicks.toLocaleString()}</h3>
                        <span className="text-xs font-bold text-emerald-500 flex items-center gap-0.5 bg-emerald-50 px-1.5 py-0.5 rounded-full">
                            <ShieldCheck className="w-3 h-3" /> Real
                        </span>
                    </div>
                </div>

                {/* KPI 3 - Leads */}
                <div className="bg-white p-6 rounded-[15px] border border-slate-100 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
                    <div className="flex justify-between items-start mb-2">
                        <p className="text-sm font-semibold text-slate-500" style={cardTitleStyle}>Total de Leads</p>
                        <div className="p-2 bg-orange-50 rounded-[10px] text-orange-600 group-hover:scale-110 transition-transform">
                            <MessageSquare className="w-4 h-4" />
                        </div>
                    </div>
                    <div className="flex items-baseline gap-2">
                        <h3 className="text-3xl font-black text-slate-800">{loading ? "..." : stats.leads}</h3>
                        <span className="text-xs font-bold text-orange-500 flex items-center gap-0.5 bg-orange-50 px-1.5 py-0.5 rounded-full">
                            <TrendingUp className="w-3 h-3" /> Real
                        </span>
                    </div>
                </div>

                {/* KPI 4 - CTR */}
                <div className="bg-white p-6 rounded-[15px] border border-slate-100 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
                    <div className="flex justify-between items-start mb-2">
                        <p className="text-sm font-semibold text-slate-500" style={cardTitleStyle}>CTR Médio</p>
                        <div className="p-2 bg-purple-50 rounded-[10px] text-purple-600 group-hover:scale-110 transition-transform">
                            <Percent className="w-4 h-4" />
                        </div>
                    </div>
                    <div className="flex items-baseline gap-2">
                        <h3 className="text-3xl font-black text-slate-800">{loading ? "..." : stats.ctr}%</h3>
                        <span className="text-xs font-bold text-emerald-500 flex items-center gap-0.5 bg-emerald-50 px-1.5 py-0.5 rounded-full">
                            <ShieldCheck className="w-3 h-3" /> Real
                        </span>
                    </div>
                </div>
            </div>

        </div>
    );
}
