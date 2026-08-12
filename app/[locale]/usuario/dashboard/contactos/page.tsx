"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { ListingCard } from "@/components/ListingCard";
import { DashboardPageHeader } from "@/components/DashboardPageHeader";
import { Loader2, Inbox } from "lucide-react";

export default function ContactosPage() {
    const [leads, setLeads] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        const fetchLeads = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data, error } = await supabase
                .from('leads')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (data) setLeads(data);
            setLoading(false);
        };
        fetchLeads();
    }, [supabase]);

    return (
        <div className="space-y-6">
            <DashboardPageHeader
                title="Contactos e Leads"
                description="Gerencie suas conversas com compradores e parceiros."
            />

            {loading ? (
                <div className="flex justify-center py-12">
                    <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
                </div>
            ) : leads.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
                    <Inbox className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-slate-700">Nenhum contacto ainda</h3>
                    <p className="text-slate-500 text-sm">Assim que alguém entrar em contacto consigo através do seu perfil, as mensagens aparecerão aqui.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {leads.map((lead) => (
                        <ListingCard
                            key={lead.id}
                            title={lead.subject || `Mensagem de ${lead.sender_name}`}
                            description={lead.message}
                            category={lead.source_type === 'product' ? 'Produto' : 'Perfil'}
                            href={`/usuario/dashboard/contactos/${lead.id}`}
                            badgeColor={lead.read ? 'blue' : 'orange'}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
