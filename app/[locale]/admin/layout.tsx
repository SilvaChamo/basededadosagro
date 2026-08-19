import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import Link from "next/link";
import { Shield } from "lucide-react";
import { AdminShell } from "@/components/admin/AdminShell";
import { LogoutButton } from "@/components/LogoutButton";
import { isAdminRole, isNewsTeamRole, getRoleLabel } from "@/lib/roles";

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect("/auth/login");
    }

    // Check role in profiles table
    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

    const role = profile?.role;

    if (!profile || (!isAdminRole(role) && !isNewsTeamRole(role))) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
                <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-xl text-center border border-slate-100">
                    <div className="mx-auto w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mb-6">
                        <Shield className="w-8 h-8 text-rose-600" />
                    </div>
                    <h1 className="text-2xl font-black text-slate-900 mb-2">Acesso Restrito</h1>
                    <p className="text-slate-500 mb-8">
                        Esta área é exclusiva para administradores. A sua conta actual ({user.email}) não tem permissão de acesso.
                    </p>
                    <div className="bg-slate-50 p-4 rounded-lg text-left mb-8 border border-slate-200">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Dev Debug (SQL Correto):</p>
                        <code className="text-[10px] sm:text-xs text-slate-600 block bg-slate-100 p-2 rounded break-all font-mono whitespace-pre-wrap">
                            INSERT INTO profiles (id, email, role, full_name)
                            VALUES ('{user.id}', '{user.email}', 'admin', '{user.email}')
                            ON CONFLICT (id) DO UPDATE SET role = 'admin';
                        </code>
                    </div>
                    <div className="flex flex-col gap-3">
                        <Link href="/" className="inline-flex items-center justify-center rounded-xl text-sm font-bold ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-slate-100 text-slate-900 hover:bg-slate-200 h-10 px-4 py-2 w-full">
                            Voltar ao Início
                        </Link>

                        <div className="grid grid-cols-2 gap-3">
                            <LogoutButton variant="outline" className="h-10 rounded-xl font-bold" />
                            <Link href="/auth/login" className="inline-flex items-center justify-center rounded-xl text-sm font-bold border border-slate-200 bg-white text-slate-900 hover:bg-slate-50 h-10 px-4 py-2">
                                Trocar Conta
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (isNewsTeamRole(role)) {
        const pathname = (await headers()).get('x-pathname') || '';
        // Além da Central de Notícias, editor/contribuidor têm acesso à mesma
        // Galeria 100% do painel de administrador (ver AdminShell "restricted").
        if (!pathname.includes('/admin/central-noticias') && !pathname.includes('/admin/galeria')) {
            // Modo "as-needed": pt (padrão) não leva prefixo, só en. Redirigir
            // sempre com prefixo (incluindo pt) fazia o middleware saltar outra
            // vez para a forma sem prefixo — dobrava os saltos neste papel, que
            // já é o mais afectado por isto.
            const localeMatch = pathname.match(/^\/(pt|en)(?=\/|$)/);
            const locale = localeMatch ? localeMatch[1] : "pt";
            redirect(locale === "pt" ? "/admin/central-noticias" : `/${locale}/admin/central-noticias`);
        }

        return (
            <AdminShell userEmail={user.email} restricted roleLabel={getRoleLabel(role)}>
                {children}
            </AdminShell>
        );
    }

    return (
        <AdminShell userEmail={user.email} roleLabel={getRoleLabel(role)}>
            {children}
        </AdminShell>
    );
}
