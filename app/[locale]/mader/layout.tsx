import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import { ShieldCheck, LogIn, Eye } from "lucide-react";
import { LogoutButton } from "@/components/LogoutButton";
import { canAccessMaderPanel } from "@/lib/roles";

// Painel institucional (Ministério da Agricultura & IIAM).
// Acesso direto ativado para demonstração / apresentação pública.
export default async function MaderLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    let profile: any = null;
    if (user) {
        const { data } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", user.id)
            .maybeSingle();
        profile = data;
    }

    return (
        <div className="min-h-screen bg-slate-100 font-sans">
            <header className="h-16 bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
                <div className="max-w-[1400px] mx-auto h-full px-4 sm:px-6 flex items-center gap-3">
                    <Link href="/" className="flex items-center gap-3 shrink-0 hover:opacity-80 transition-opacity">
                        <img src="/admin-icon.png" alt="" className="w-8 h-8 object-contain" />
                        <span className="hidden sm:flex flex-col leading-tight">
                            <span className="font-black text-slate-900 text-sm tracking-tight">Painel Institucional MADER / IIAM</span>
                            <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest flex items-center gap-1">
                                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                                Base de Dados Agrícolas · Acesso de Demonstração & Telemetria
                            </span>
                        </span>
                    </Link>
                    <div className="ml-auto flex items-center gap-3">
                        {!user ? (
                            <div className="flex items-center gap-2">
                                <span className="hidden md:inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 border border-amber-200 text-amber-700 text-xs font-bold rounded-lg">
                                    <Eye className="w-3.5 h-3.5 text-amber-600" /> Modo Apresentação Ativo
                                </span>
                                <Link
                                    href="/auth/login?next=/mader"
                                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-sm"
                                >
                                    <LogIn className="w-4 h-4" /> Entrar com Conta MADER
                                </Link>
                            </div>
                        ) : (
                            <LogoutButton
                                variant="outline"
                                showIcon
                                label="Sair"
                                className="h-9 px-4 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-red-600 border-slate-200"
                            />
                        )}
                    </div>
                </div>
            </header>
            <main className="max-w-[1400px] mx-auto px-4 sm:px-6 py-6 sm:py-8">{children}</main>
        </div>
    );
}
