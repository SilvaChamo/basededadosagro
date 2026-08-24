"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Users, Plus, Download, Trash2, Search, Loader2, Mail,
    CheckCircle2, XCircle, Upload
} from "lucide-react";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";
import { AdminListToolbar, AdminToolbarTitle } from "@/components/admin/AdminListToolbar";
import { useAdminTopBar } from "@/components/admin/AdminTopBar";
import { LogoutButton } from "@/components/LogoutButton";

interface Subscriber {
    id: string;
    email: string;
    status: string;
    created_at: string;
}

export default function SubscribersPage() {
    const supabase = createClient();
    const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [newEmail, setNewEmail] = useState("");
    const [adding, setAdding] = useState(false);
    const [bulkEmails, setBulkEmails] = useState("");
    const [showBulkImport, setShowBulkImport] = useState(false);

    const fetchSubscribers = useCallback(async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('newsletter_subscribers')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error(error);
            toast.error("Erro ao carregar subscritores.");
        } else {
            setSubscribers(data || []);
        }
        setLoading(false);
    }, [supabase]);

    useEffect(() => {
        fetchSubscribers();
    }, [fetchSubscribers]);

    const handleAddSubscriber = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newEmail) return;
        setAdding(true);

        const { error } = await supabase
            .from('newsletter_subscribers')
            .insert({ email: newEmail.toLowerCase().trim(), status: 'active' });

        if (error) {
            if (error.code === '23505') {
                toast.error("Este email já está inscrito.");
            } else {
                toast.error("Erro ao adicionar: " + error.message);
            }
        } else {
            toast.success("Subscritor adicionado!");
            setNewEmail("");
            fetchSubscribers();
        }
        setAdding(false);
    };

    const handleBulkImport = async () => {
        const emails = bulkEmails
            .split(/[\n,;]+/)
            .map(e => e.trim().toLowerCase())
            .filter(e => e && e.includes('@'));

        if (emails.length === 0) {
            toast.error("Nenhum email válido encontrado.");
            return;
        }

        setAdding(true);
        let added = 0;
        let skipped = 0;

        for (const email of emails) {
            const { error } = await supabase
                .from('newsletter_subscribers')
                .insert({ email, status: 'active' });

            if (error) {
                skipped++;
            } else {
                added++;
            }
        }

        toast.success(`${added} adicionados, ${skipped} duplicados/ignorados.`);
        setBulkEmails("");
        setShowBulkImport(false);
        fetchSubscribers();
        setAdding(false);
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Remover este subscritor?")) return;
        const { error } = await supabase
            .from('newsletter_subscribers')
            .delete()
            .eq('id', id);

        if (error) {
            toast.error("Erro ao remover.");
        } else {
            toast.success("Subscritor removido.");
            setSubscribers(prev => prev.filter(s => s.id !== id));
        }
    };

    const handleToggleStatus = async (id: string, currentStatus: string) => {
        const newStatus = currentStatus === 'active' ? 'unsubscribed' : 'active';
        const { error } = await supabase
            .from('newsletter_subscribers')
            .update({ status: newStatus })
            .eq('id', id);

        if (error) {
            toast.error("Erro ao atualizar estado.");
        } else {
            setSubscribers(prev => prev.map(s => s.id === id ? { ...s, status: newStatus } : s));
            toast.success(newStatus === 'active' ? "Reativado!" : "Desinscrito.");
        }
    };

    const handleExportCSV = () => {
        const csv = "email,status,data_inscricao\n" +
            subscribers.map(s =>
                `${s.email},${s.status},${new Date(s.created_at).toLocaleDateString('pt-PT')}`
            ).join('\n');

        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `subscritores_newsletter_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);
        toast.success("CSV exportado!");
    };

    const filteredSubscribers = subscribers.filter(s =>
        s.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const activeCount = subscribers.filter(s => s.status === 'active').length;
    const unsubscribedCount = subscribers.filter(s => s.status === 'unsubscribed').length;

    useAdminTopBar("");

    return (
        <div className="w-full max-w-full space-y-6 pb-20">
            <AdminListToolbar className="flex-nowrap">
                <AdminToolbarTitle title="Subscritores" />
                <div className="flex items-center gap-2 shrink-0">
                    <Button variant="outline" size="sm" onClick={() => setShowBulkImport(!showBulkImport)} className="gap-2 text-xs font-bold uppercase h-9">
                        <Upload className="w-4 h-4" /> Importar
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleExportCSV} className="gap-2 text-xs font-bold uppercase h-9">
                        <Download className="w-4 h-4" /> Exportar CSV
                    </Button>
                    <LogoutButton
                        variant="outline"
                        className="h-9 px-4 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-red-600 border-slate-200"
                        showIcon
                        label="Sair"
                    />
                </div>
            </AdminListToolbar>

            {/* Stats Strip */}
            <div className="grid grid-cols-3 gap-4">
                <div className="bg-white rounded-xl border border-slate-100 p-4 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center">
                            <Users className="w-5 h-5 text-emerald-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-black text-slate-900">{subscribers.length}</p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl border border-slate-100 p-4 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                            <CheckCircle2 className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-black text-slate-900">{activeCount}</p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Activos</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl border border-slate-100 p-4 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center">
                            <XCircle className="w-5 h-5 text-red-500" />
                        </div>
                        <div>
                            <p className="text-2xl font-black text-slate-900">{unsubscribedCount}</p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Desinscritos</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bulk Import Panel */}
            {showBulkImport && (
                <div className="bg-white rounded-xl border border-slate-100 p-6 shadow-sm space-y-4 animate-in slide-in-from-top-2">
                    <h3 className="text-xs font-black uppercase text-slate-500 tracking-wider">Importação em Massa</h3>
                    <p className="text-xs text-slate-400">Cole os emails separados por vírgulas, ponto e vírgulas ou linhas.</p>
                    <textarea
                        value={bulkEmails}
                        onChange={(e) => setBulkEmails(e.target.value)}
                        placeholder={"email1@exemplo.com\nemail2@exemplo.com\nemail3@exemplo.com"}
                        className="w-full h-32 border border-slate-200 rounded-lg px-4 py-3 text-sm font-mono resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                    <div className="flex justify-end gap-3">
                        <Button variant="outline" size="sm" onClick={() => setShowBulkImport(false)}>Cancelar</Button>
                        <Button size="sm" onClick={handleBulkImport} disabled={adding} className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2">
                            {<Plus className="w-4 h-4" />}
                            Importar Emails
                        </Button>
                    </div>
                </div>
            )}

            {/* Add & Search */}
            <div className="flex gap-4">
                <form onSubmit={handleAddSubscriber} className="flex gap-2 flex-1">
                    <div className="relative flex-1">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input
                            type="email"
                            placeholder="Adicionar email..."
                            value={newEmail}
                            onChange={(e) => setNewEmail(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                    <Button type="submit" disabled={adding} className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2 text-xs font-bold uppercase">
                        {<Plus className="w-4 h-4" />}
                        Adicionar
                    </Button>
                </form>
                <div className="relative w-72">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                        placeholder="Pesquisar..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                    />
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
                {filteredSubscribers.length === 0 ? (
                    <div className="p-12 text-center">
                        <Users className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                        <p className="text-sm text-slate-400 font-medium">Nenhum subscritor encontrado.</p>
                    </div>
                ) : (
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-slate-100 bg-slate-50/50">
                                <th className="text-left px-6 py-3 text-[10px] font-black uppercase text-slate-400 tracking-wider">Email</th>
                                <th className="text-left px-6 py-3 text-[10px] font-black uppercase text-slate-400 tracking-wider">Estado</th>
                                <th className="text-left px-6 py-3 text-[10px] font-black uppercase text-slate-400 tracking-wider">Data de Inscrição</th>
                                <th className="text-right px-6 py-3 text-[10px] font-black uppercase text-slate-400 tracking-wider">Acções</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredSubscribers.map((sub) => (
                                <tr key={sub.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                                    <td className="px-6 py-3">
                                        <span className="text-sm font-medium text-slate-800">{sub.email}</span>
                                    </td>
                                    <td className="px-6 py-3">
                                        <button
                                            onClick={() => handleToggleStatus(sub.id, sub.status)}
                                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider cursor-pointer transition-colors ${sub.status === 'active'
                                                    ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                                                    : 'bg-red-50 text-red-600 hover:bg-red-100'
                                                }`}
                                        >
                                            {sub.status === 'active' ? (
                                                <><CheckCircle2 className="w-3 h-3" /> Activo</>
                                            ) : (
                                                <><XCircle className="w-3 h-3" /> Desinscrito</>
                                            )}
                                        </button>
                                    </td>
                                    <td className="px-6 py-3">
                                        <span className="text-xs text-slate-500">
                                            {new Date(sub.created_at).toLocaleDateString('pt-PT', {
                                                day: '2-digit', month: 'short', year: 'numeric'
                                            })}
                                        </span>
                                    </td>
                                    <td className="px-6 py-3 text-right">
                                        <button
                                            onClick={() => handleDelete(sub.id)}
                                            className="text-slate-400 hover:text-red-500 transition-colors p-1.5 rounded-lg hover:bg-red-50"
                                            title="Remover"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
