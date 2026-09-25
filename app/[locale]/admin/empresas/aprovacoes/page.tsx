"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { AdminListToolbar, AdminToolbarTitle } from "@/components/admin/AdminListToolbar";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import Link from "next/link";
import {
    ShieldCheck, Building2, CheckCircle2, RefreshCw, ExternalLink,
    MapPin, Phone, Mail, Globe, Search, AlertCircle, FileCheck
} from "lucide-react";

export default function AdminEmpresasAprovacoesPage() {
    const supabase = createClient();
    const [companies, setCompanies] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatus, setFilterStatus] = useState<"pending" | "verified" | "all">("pending");

    async function fetchCompanies() {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from("companies")
                .select("*")
                .eq("is_archived", false)
                .order("created_at", { ascending: false });

            if (error) throw error;
            setCompanies(data || []);
        } catch (err: any) {
            console.error("Error fetching companies:", err);
            toast.error("Erro ao carregar empresas para autorização.");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchCompanies();
    }, []);

    const handleToggleVerification = async (company: any) => {
        const newStatus = !company.is_verified;
        try {
            const { error } = await supabase
                .from("companies")
                .update({
                    is_verified: newStatus,
                    updated_at: new Date().toISOString()
                })
                .eq("id", company.id);

            if (error) throw error;

            toast.success(
                newStatus
                    ? `Empresa ${company.name} certificada e autorizada com sucesso!`
                    : `Autorização da empresa ${company.name} revogada.`
            );

            setCompanies(prev =>
                prev.map(c => (c.id === company.id ? { ...c, is_verified: newStatus } : c))
            );
        } catch (err: any) {
            toast.error("Erro ao atualizar veracidade: " + err.message);
        }
    };

    const filteredCompanies = companies.filter(c => {
        const matchesSearch =
            (c.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
            (c.nuit || "").includes(searchTerm) ||
            (c.province || "").toLowerCase().includes(searchTerm.toLowerCase());

        if (filterStatus === "pending") return !c.is_verified && matchesSearch;
        if (filterStatus === "verified") return c.is_verified && matchesSearch;
        return matchesSearch;
    });

    const pendingCount = companies.filter(c => !c.is_verified).length;
    const verifiedCount = companies.filter(c => c.is_verified).length;

    return (
        <div className="space-y-6">
            <AdminListToolbar>
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center">
                        <ShieldCheck className="w-5 h-5 text-[#f97316]" />
                    </div>
                    <div>
                        <AdminToolbarTitle title="Autorização & Certificação de Empresas Gratuitas" />
                        <p className="text-xs text-slate-500 font-medium">
                            Verificação de veracidade das empresas registadas gratuitamente antes da chancela oficial
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3 ml-auto">
                    <Button
                        variant="outline"
                        onClick={fetchCompanies}
                        className="h-9 px-3 text-xs font-bold border-slate-200"
                    >
                        <RefreshCw className="w-3.5 h-3.5 mr-1.5" /> Atualizar Lista
                    </Button>
                </div>
            </AdminListToolbar>

            {/* Filter Tabs & Search Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setFilterStatus("pending")}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                            filterStatus === "pending"
                                ? "bg-[#f97316] text-white shadow-md shadow-orange-500/20"
                                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                        }`}
                    >
                        <AlertCircle className="w-3.5 h-3.5" /> Por Autorizar ({pendingCount})
                    </button>
                    <button
                        onClick={() => setFilterStatus("verified")}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                            filterStatus === "verified"
                                ? "bg-emerald-600 text-white shadow-md shadow-emerald-500/20"
                                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                        }`}
                    >
                        <FileCheck className="w-3.5 h-3.5" /> Certificadas ({verifiedCount})
                    </button>
                    <button
                        onClick={() => setFilterStatus("all")}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                            filterStatus === "all"
                                ? "bg-slate-800 text-white shadow-sm"
                                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                        }`}
                    >
                        Todas ({companies.length})
                    </button>
                </div>

                <div className="relative w-full sm:w-72">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Pesquisar empresa, NUIT ou província..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                </div>
            </div>

            {/* List of Companies */}
            {loading ? (
                <div className="py-20 text-center text-slate-400 text-sm font-medium bg-white rounded-2xl border border-slate-200">
                    A carregar empresas para certificar...
                </div>
            ) : filteredCompanies.length === 0 ? (
                <div className="py-20 text-center bg-white rounded-2xl border border-slate-200">
                    <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-3" />
                    <p className="font-bold text-slate-700 text-base">Nenhuma empresa registada nesta categoria.</p>
                    <p className="text-xs text-slate-400 mt-1">Todas as empresas submetidas já se encontram autorizadas ou não correspondem ao filtro.</p>
                </div>
            ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredCompanies.map(c => (
                        <div
                            key={c.id}
                            className={`bg-white rounded-2xl border p-5 shadow-sm transition-all flex flex-col justify-between ${
                                c.is_verified ? "border-emerald-200 bg-emerald-50/10" : "border-slate-200 hover:border-orange-300"
                            }`}
                        >
                            <div>
                                <div className="flex items-start justify-between gap-3 mb-3">
                                    <div className="flex items-center gap-3">
                                        {c.logo_url ? (
                                            <img
                                                src={c.logo_url}
                                                alt={c.name}
                                                className="w-12 h-12 rounded-xl object-contain bg-white border border-slate-100 p-1 shadow-xs"
                                            />
                                        ) : (
                                            <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-600 text-sm">
                                                <Building2 className="w-6 h-6 text-slate-400" />
                                            </div>
                                        )}
                                        <div>
                                            <h4 className="font-bold text-slate-900 text-base leading-snug line-clamp-1">{c.name}</h4>
                                            <span className="text-[10px] font-mono text-slate-500 uppercase">NUIT: {c.nuit || "Não informado"}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-1.5 text-xs text-slate-600 mb-4 bg-slate-50 p-3 rounded-xl border border-slate-100">
                                    <p className="flex items-center gap-2 truncate">
                                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                        <span>{c.province || "Província n/d"}, {c.district || "Distrito n/d"}</span>
                                    </p>
                                    <p className="flex items-center gap-2 truncate">
                                        <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                        <span>{c.phone || c.contact || "Sem telefone"}</span>
                                    </p>
                                    <p className="flex items-center gap-2 truncate">
                                        <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                        <span>{c.email || "Sem e-mail"}</span>
                                    </p>
                                </div>
                            </div>

                            <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
                                <Link
                                    href={`/empresas/${c.slug || c.id}`}
                                    target="_blank"
                                    className="text-xs font-bold text-slate-600 hover:text-emerald-600 flex items-center gap-1"
                                >
                                    Ver Detalhes <ExternalLink className="w-3 h-3" />
                                </Link>

                                <Button
                                    onClick={() => handleToggleVerification(c)}
                                    className={`h-9 px-4 text-xs font-bold rounded-xl transition-all shadow-sm ${
                                        c.is_verified
                                            ? "bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200"
                                            : "bg-[#f97316] hover:bg-orange-600 text-white shadow-orange-500/20"
                                    }`}
                                >
                                    {c.is_verified ? (
                                        <>
                                            <CheckCircle2 className="w-3.5 h-3.5 mr-1.5 text-emerald-600" /> Autorizada
                                        </>
                                    ) : (
                                        <>
                                            <ShieldCheck className="w-3.5 h-3.5 mr-1.5" /> Certificar & Autorizar
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
