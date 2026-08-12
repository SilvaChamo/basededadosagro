"use client";

import { BarChart3, TrendingUp, Users, Loader2 } from "lucide-react";
import { DashboardPageHeader } from "@/components/DashboardPageHeader";
import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";

export default function AnalisesPage() {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalViews: 0,
        totalLeads: 0,
        engagementRate: 0,
    });
    const supabase = createClient();

    useEffect(() => {
        async function fetchStats() {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // Fetch Total Views
            const { count: viewCount } = await supabase
                .from('page_views')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', user.id);

            // Fetch Total Leads
            const { count: leadCount } = await supabase
                .from('leads')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', user.id);

            const views = viewCount || 0;
            const leads = leadCount || 0;
            const rate = views > 0 ? (leads / views) * 100 : 0;

            setStats({
                totalViews: views,
                totalLeads: leads,
                engagementRate: rate,
            });
            setLoading(false);
        }

        fetchStats();
    }, []);

    return (
        <div className="space-y-6">
            <DashboardPageHeader
                title="Análise de Desempenho"
                description="Visualize o crescimento e engajamento da sua empresa."
            />

            {loading ? (
                <div className="flex items-center justify-center p-20">
                    <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="p-3 bg-emerald-100 rounded-lg text-emerald-600">
                                <Users className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-sm text-slate-500">Visitantes Totais</p>
                                <h3 className="text-2xl font-bold text-slate-800">{stats.totalViews}</h3>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="p-3 bg-blue-100 rounded-lg text-blue-600">
                                <TrendingUp className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-sm text-slate-500">Interessados (Leads)</p>
                                <h3 className="text-2xl font-bold text-slate-800">{stats.totalLeads}</h3>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="p-3 bg-orange-100 rounded-lg text-orange-600">
                                <BarChart3 className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-sm text-slate-500">Taxa de Conversão</p>
                                <h3 className="text-2xl font-bold text-slate-800">
                                    {stats.engagementRate.toFixed(1)}%
                                </h3>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="bg-white h-64 rounded-xl border border-slate-100 flex items-center justify-center text-slate-400">
                Gráfico Detalhado (Em Breve)
            </div>
        </div>
    );
}
