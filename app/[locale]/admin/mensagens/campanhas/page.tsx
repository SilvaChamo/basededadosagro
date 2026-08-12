"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    BarChart3, ArrowLeft, Search, Loader2, Send, CheckCircle2,
    XCircle, Clock, ChevronDown, ChevronUp, Users, Mail
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

interface Campaign {
    id: string;
    subject: string;
    sender_email: string;
    target_audiences: string[];
    recipient_count: number;
    status: string;
    sent_at: string;
    created_at: string;
}

interface CampaignLog {
    id: string;
    email: string;
    status: string;
    error: string | null;
    created_at: string;
}

export default function CampaignsPage() {
    const supabase = createClient();
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [logs, setLogs] = useState<CampaignLog[]>([]);
    const [logsLoading, setLogsLoading] = useState(false);

    const fetchCampaigns = useCallback(async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('email_campaigns')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error(error);
            toast.error("Erro ao carregar campanhas.");
        } else {
            setCampaigns(data || []);
        }
        setLoading(false);
    }, [supabase]);

    useEffect(() => {
        fetchCampaigns();
    }, [fetchCampaigns]);

    const handleExpand = async (campaignId: string) => {
        if (expandedId === campaignId) {
            setExpandedId(null);
            return;
        }

        setExpandedId(campaignId);
        setLogsLoading(true);

        const { data, error } = await supabase
            .from('email_campaign_logs')
            .select('*')
            .eq('campaign_id', campaignId)
            .order('created_at', { ascending: true });

        if (error) {
            toast.error("Erro ao carregar logs.");
        } else {
            setLogs(data || []);
        }
        setLogsLoading(false);
    };

    const getStatusBadge = (status: string) => {
        const styles: Record<string, string> = {
            enviada: 'bg-emerald-50 text-emerald-700',
            falhada: 'bg-red-50 text-red-600',
            agendada: 'bg-amber-50 text-amber-700',
            enviando: 'bg-blue-50 text-blue-600',
            rascunho: 'bg-slate-100 text-slate-500',
        };
        const icons: Record<string, React.ReactNode> = {
            enviada: <CheckCircle2 className="w-3 h-3" />,
            falhada: <XCircle className="w-3 h-3" />,
            agendada: <Clock className="w-3 h-3" />,
            enviando: <Loader2 className="w-3 h-3 animate-spin" />,
            rascunho: <Mail className="w-3 h-3" />,
        };
        return (
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${styles[status] || styles.rascunho}`}>
                {icons[status] || icons.rascunho}
                {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
        );
    };

    const filteredCampaigns = campaigns.filter(c =>
        c.subject.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Stats
    const totalSent = campaigns.reduce((acc, c) => acc + (c.recipient_count || 0), 0);
    const successCount = campaigns.filter(c => c.status === 'enviada').length;

    return (
        <div className="w-full max-w-full px-6 space-y-6 pb-20">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/admin/mensagens" className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                        <ArrowLeft className="w-5 h-5 text-slate-500" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Campanhas</h1>
                        <p className="text-sm text-slate-500">Histórico de envios de email marketing.</p>
                    </div>
                </div>
                <Link href="/admin/mensagens">
                    <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2 text-xs font-bold uppercase">
                        <Send className="w-4 h-4" /> Nova Campanha
                    </Button>
                </Link>
            </div>

            {/* Stats Strip */}
            <div className="grid grid-cols-3 gap-4">
                <div className="bg-white rounded-xl border border-slate-100 p-4 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center">
                            <BarChart3 className="w-5 h-5 text-indigo-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-black text-slate-900">{campaigns.length}</p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Campanhas</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl border border-slate-100 p-4 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center">
                            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-black text-slate-900">{successCount}</p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Enviadas</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl border border-slate-100 p-4 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center">
                            <Users className="w-5 h-5 text-orange-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-black text-slate-900">{totalSent.toLocaleString()}</p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Emails Enviados</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Search */}
            <div className="relative w-full max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                    placeholder="Pesquisar campanhas..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                />
            </div>

            {/* Campaign List */}
            <div className="space-y-3">
                {loading ? (
                    <div className="bg-white rounded-xl p-12 flex items-center justify-center border border-slate-100">
                        <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
                    </div>
                ) : filteredCampaigns.length === 0 ? (
                    <div className="bg-white rounded-xl p-12 text-center border border-slate-100">
                        <BarChart3 className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                        <p className="text-sm text-slate-400 font-medium">Nenhuma campanha encontrada.</p>
                        <p className="text-xs text-slate-400 mt-1">Envie a sua primeira mensagem a partir do painel de Email.</p>
                    </div>
                ) : filteredCampaigns.map((campaign) => (
                    <div key={campaign.id} className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden transition-all">
                        {/* Campaign Row */}
                        <button
                            onClick={() => handleExpand(campaign.id)}
                            className="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-50/50 transition-colors text-left"
                        >
                            <div className="flex items-center gap-4 flex-1 min-w-0">
                                <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center text-slate-500 shrink-0">
                                    <Mail className="w-5 h-5" />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="text-sm font-bold text-slate-800 truncate">{campaign.subject}</p>
                                    <div className="flex items-center gap-3 mt-1">
                                        <span className="text-[10px] text-slate-400 font-medium">
                                            {new Date(campaign.sent_at || campaign.created_at).toLocaleDateString('pt-PT', {
                                                day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                                            })}
                                        </span>
                                        <span className="text-[10px] text-slate-300">•</span>
                                        <span className="text-[10px] text-slate-400 font-bold">
                                            {campaign.recipient_count} destinatários
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 shrink-0">
                                {campaign.target_audiences?.length > 0 && (
                                    <div className="hidden md:flex items-center gap-1.5">
                                        {campaign.target_audiences.slice(0, 2).map(a => (
                                            <span key={a} className="px-2 py-0.5 bg-slate-100 text-slate-500 text-[9px] font-bold uppercase rounded-full">
                                                {a}
                                            </span>
                                        ))}
                                        {campaign.target_audiences.length > 2 && (
                                            <span className="text-[9px] text-slate-400 font-bold">+{campaign.target_audiences.length - 2}</span>
                                        )}
                                    </div>
                                )}
                                {getStatusBadge(campaign.status)}
                                {expandedId === campaign.id ? (
                                    <ChevronUp className="w-4 h-4 text-slate-400" />
                                ) : (
                                    <ChevronDown className="w-4 h-4 text-slate-400" />
                                )}
                            </div>
                        </button>

                        {/* Expanded Detail */}
                        {expandedId === campaign.id && (
                            <div className="border-t border-slate-100 bg-slate-50/50 px-6 py-4 animate-in slide-in-from-top-1 duration-200">
                                <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-wider mb-3">Log de Entrega</h4>
                                {logsLoading ? (
                                    <div className="p-6 flex items-center justify-center">
                                        <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
                                    </div>
                                ) : logs.length === 0 ? (
                                    <p className="text-xs text-slate-400 italic py-4">Sem registos de entrega detalhados para esta campanha.</p>
                                ) : (
                                    <div className="max-h-60 overflow-y-auto rounded-lg border border-slate-200 bg-white">
                                        <table className="w-full">
                                            <thead>
                                                <tr className="border-b border-slate-100">
                                                    <th className="text-left px-4 py-2 text-[10px] font-black uppercase text-slate-400">Email</th>
                                                    <th className="text-left px-4 py-2 text-[10px] font-black uppercase text-slate-400">Estado</th>
                                                    <th className="text-left px-4 py-2 text-[10px] font-black uppercase text-slate-400">Erro</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {logs.map((log) => (
                                                    <tr key={log.id} className="border-b border-slate-50">
                                                        <td className="px-4 py-2 text-xs text-slate-700 font-medium">{log.email}</td>
                                                        <td className="px-4 py-2">
                                                            <span className={`text-[10px] font-bold uppercase ${log.status === 'enviado' ? 'text-emerald-600' : 'text-red-500'}`}>
                                                                {log.status}
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-2 text-[10px] text-slate-400 italic">{log.error || '—'}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
