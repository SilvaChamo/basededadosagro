import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { LogoutButton } from "@/components/LogoutButton";
import { canAccessMaderPanel, getRoleLabel } from "@/lib/roles";

// Painel institucional (Ministério da Agricultura). Acesso só-leitura:
// entram os perfis `observador` e `admin`. Não partilha o layout do /admin
// — tem um cabeçalho mínimo próprio, sem barra de navegação do site.
export default async function MaderLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect("/auth/login?next=/mader");
    }

    const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

    const role = profile?.role;

    if (!canAccessMaderPanel(role)) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
                <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-xl text-center border border-slate-100">
                    <div className="mx-auto w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-6">
                        <ShieldCheck className="w-8 h-8 text-slate-400" />
                    </div>
                    <h1 className="text-2xl font-black text-slate-900 mb-2">Acesso Restrito</h1>
                    <p className="text-slate-500 mb-8">
                        Este painel é de acesso institucional reservado. A conta actual
                        ({user.email}) não tem permissão para o consultar.
                    </p>
                    <Link
                        href="/"
                        className="inline-flex items-center justify-center rounded-xl text-sm font-bold bg-slate-100 text-slate-900 hover:bg-slate-200 h-10 px-6 w-full transition-colors"
                    >
                        Voltar ao Início
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-100 font-sans">
            <header className="h-16 bg-white border-b border-slate-200 sticky top-0 z-30">
                <div className="max-w-[1400px] mx-auto h-full px-4 sm:px-6 flex items-center gap-3">
                    <Link href="/" className="flex items-center gap-3 shrink-0 hover:opacity-80 transition-opacity">
                        <img src="/admin-icon.png" alt="" className="w-8 h-8 object-contain" />
                        <span className="hidden sm:flex flex-col leading-tight">
                            <span className="font-black text-slate-900 text-sm tracking-tight">Painel Institucional</span>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                Base de Dados Agrícolas · só-leitura
                            </span>
                        </span>
                    </Link>
                    <div className="ml-auto flex items-center gap-3">
                        <span className="hidden md:inline text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                            {getRoleLabel(role)}
                        </span>
                        <span className="hidden lg:inline text-xs text-slate-400">{user.email}</span>
                        <LogoutButton
                            variant="outline"
                            showIcon
                            label="Sair"
                            className="h-9 px-4 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-red-600 border-slate-200"
                        />
                    </div>
                </div>
            </header>
            <main className="max-w-[1400px] mx-auto px-4 sm:px-6 py-6 sm:py-8">{children}</main>
        </div>
    );
}
