"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { AdminListToolbar, AdminToolbarTitle } from "@/components/admin/AdminListToolbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import Link from "next/link";
import {
    ShieldCheck, Users, Plus, UserCheck, ExternalLink, Dna,
    Mail, Lock, KeyRound, Building2, CheckCircle2, RefreshCw
} from "lucide-react";
import { MADER_ROLES, getRoleLabel } from "@/lib/roles";

export default function AdminMaderGestaoPage() {
    const supabase = createClient();
    const [profiles, setProfiles] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // New user form state
    const [email, setEmail] = useState("");
    const [fullName, setFullName] = useState("");
    const [role, setRole] = useState("admin_mader");
    const [password, setPassword] = useState("");

    async function fetchMaderProfiles() {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from("profiles")
                .select("*")
                .in("role", ["observador", "admin_mader", "admin-mader", "mader_tecnico", "mader_assistente", "admin"])
                .order("created_at", { ascending: false });

            if (error) throw error;
            setProfiles(data || []);
        } catch (err: any) {
            console.error("Error fetching MADER profiles:", err);
            toast.error("Erro ao carregar contas MADER");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchMaderProfiles();
    }, []);

    const handleRoleChange = async (profileId: string, newRole: string) => {
        try {
            const { error } = await supabase
                .from("profiles")
                .update({ role: newRole })
                .eq("id", profileId);

            if (error) throw error;
            toast.success("Perfil atualizado com sucesso!");
            fetchMaderProfiles();
        } catch (err: any) {
            toast.error("Erro ao atualizar perfil: " + err.message);
        }
    };

    const handleCreateMaderAccount = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || !password) {
            toast.error("Preencha o e-mail e a palavra-passe.");
            return;
        }

        try {
            setSaving(true);
            // Sign up the user via Supabase Auth
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: fullName,
                        role: role
                    }
                }
            });

            if (authError) throw authError;

            if (authData.user) {
                // Update profile role explicitly
                await supabase
                    .from("profiles")
                    .upsert({
                        id: authData.user.id,
                        full_name: fullName,
                        role: role,
                        updated_at: new Date().toISOString()
                    });
            }

            toast.success(`Conta MADER (${role}) criada com sucesso!`);
            setEmail("");
            setFullName("");
            setPassword("");
            fetchMaderProfiles();
        } catch (err: any) {
            console.error(err);
            toast.error("Erro ao criar conta: " + err.message);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Top Toolbar */}
            <AdminListToolbar>
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center">
                        <Dna className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                        <AdminToolbarTitle title="Gestão de Contas MADER / IIAM" />
                        <p className="text-xs text-slate-500 font-medium">
                            Atribuição de perfis institucionais (Admin-MADER, Técnico, Assistente) e ligação direta ao painel
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3 ml-auto">
                    <Link
                        href="/mader"
                        target="_blank"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all"
                    >
                        <ExternalLink className="w-4 h-4" /> Ir para o Painel MADER
                    </Link>
                    <Button
                        variant="outline"
                        onClick={fetchMaderProfiles}
                        className="h-9 px-3 text-xs font-bold border-slate-200"
                    >
                        <RefreshCw className="w-3.5 h-3.5 mr-1.5" /> Atualizar
                    </Button>
                </div>
            </AdminListToolbar>

            <div className="grid lg:grid-cols-3 gap-6">
                {/* Left Column: Create Form */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                    <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                        <Plus className="w-5 h-5 text-[#f97316]" />
                        <h3 className="font-bold text-slate-800 text-base">Nova Conta MADER / IIAM</h3>
                    </div>

                    <form onSubmit={handleCreateMaderAccount} className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                                Nome Completo / Cargo
                            </label>
                            <Input
                                type="text"
                                placeholder="ex.: Eng. João Silva (Técnico IIAM)"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                className="h-10"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                                E-mail Institucional
                            </label>
                            <Input
                                type="email"
                                placeholder="ex.: tecnico@mader.gov.mz"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="h-10"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                                Palavra-passe
                            </label>
                            <Input
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="h-10"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                                Nível / Perfil de Acesso
                            </label>
                            <select
                                value={role}
                                onChange={(e) => setRole(e.target.value)}
                                className="w-full h-10 px-3 rounded-lg border border-slate-200 text-sm font-medium bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            >
                                <option value="admin_mader">Admin-MADER (Administrador do Painel MADER)</option>
                                <option value="mader_tecnico">Técnico MADER / IIAM (Telemetria & Dados)</option>
                                <option value="mader_assistente">Assistente MADER (Consulta & Validação)</option>
                                <option value="observador">Acesso Institucional Geral (Observador)</option>
                            </select>
                        </div>

                        <Button
                            type="submit"
                            disabled={saving}
                            className="w-full h-11 bg-[#f97316] hover:bg-orange-600 text-white font-bold rounded-xl transition-all shadow-md shadow-orange-500/20"
                        >
                            {saving ? "A criar conta..." : "Criar Conta Institucional MADER"}
                        </Button>
                    </form>
                </div>

                {/* Right Column: Existing MADER Accounts List */}
                <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                        <div className="flex items-center gap-2">
                            <Users className="w-5 h-5 text-emerald-600" />
                            <h3 className="font-bold text-slate-800 text-base">Contas Institucionais Registadas</h3>
                        </div>
                        <span className="text-xs font-bold bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full border border-emerald-200">
                            {profiles.length} Contas
                        </span>
                    </div>

                    {loading ? (
                        <div className="py-12 text-center text-slate-400 text-sm font-medium">
                            A carregar contas MADER...
                        </div>
                    ) : profiles.length === 0 ? (
                        <div className="py-12 text-center text-slate-400 text-sm font-medium">
                            Nenhuma conta MADER registada até ao momento.
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-100">
                            {profiles.map((prof) => (
                                <div key={prof.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-700 text-xs">
                                            {prof.full_name?.charAt(0) || prof.email?.charAt(0) || "M"}
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-800 text-sm">{prof.full_name || "Sem Nome"}</p>
                                            <p className="text-xs text-slate-500 font-mono">{prof.email || prof.id}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <select
                                            value={prof.role || "observador"}
                                            onChange={(e) => handleRoleChange(prof.id, e.target.value)}
                                            className="h-8 px-2.5 rounded-md border border-slate-200 text-xs font-bold bg-slate-50 text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                        >
                                            <option value="admin_mader">Admin-MADER</option>
                                            <option value="mader_tecnico">Técnico MADER</option>
                                            <option value="mader_assistente">Assistente MADER</option>
                                            <option value="observador">Acesso Institucional</option>
                                            <option value="admin">Administrador Global</option>
                                        </select>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
