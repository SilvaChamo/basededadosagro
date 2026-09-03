"use client";

import { useState, useEffect } from "react";
import { UserSidebar } from "@/components/UserSidebar";
import { LogOut, Menu, ArrowLeftFromLine, ArrowRightFromLine, Loader2 } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { hasDashboardAccess, normalizePlanName } from "@/lib/plan-fields";
import { Spinner } from "@/components/ui/spinner";
import { isNewsTeamRole } from "@/lib/roles";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const [isSidebarOpen, setSidebarOpen] = useState(true);
    const [checkingAccess, setCheckingAccess] = useState(true);
    const [hasAccess, setHasAccess] = useState(false);
    const supabaseClient = createClient();

    // Check plan access
    useEffect(() => {
        const checkAccess = async () => {
            try {
                const { data: { user } } = await supabaseClient.auth.getUser();

                if (!user) {
                    router.push("/auth/login");
                    return;
                }

                // Check profile plan first (for users without a company)
                const { data: profile } = await supabaseClient
                    .from('profiles')
                    .select('plan, role')
                    .eq('id', user.id)
                    .single();

                // Editor/Contribuidor não têm painel de cliente — o deles é a
                // Central de Notícias. Sem isto, uma conta promovida a estes
                // papéis ficava presa no painel de cliente sempre que chegasse
                // aqui directamente (sessão antiga, marcador, etc.).
                if (isNewsTeamRole(profile?.role)) {
                    router.push("/admin/central-noticias");
                    return;
                }

                // Admins always have access
                if (profile?.role === 'admin') {
                    setHasAccess(true);
                    setCheckingAccess(false);
                    return;
                }

                // Check profile plan
                let plan = normalizePlanName(profile?.plan);

                // If no profile plan, check company plan
                if (!plan || normalizePlanName(plan) === 'Gratuito') {
                    const { data: company } = await supabaseClient
                        .from('companies')
                        .select('plan')
                        .eq('user_id', user.id)
                        .single();

                    if (company?.plan) {
                        plan = normalizePlanName(company.plan);
                    }
                }

                if (hasDashboardAccess(plan)) {
                    setHasAccess(true);
                } else {
                    // This case is now unreachable as hasDashboardAccess returns true
                    setHasAccess(true);
                }
            } catch (error) {
                console.error("Error checking access:", error);
                setHasAccess(true); // Allow access on error to prevent lockout
            } finally {
                setCheckingAccess(false);
            }
        };

        checkAccess();
    }, [pathname, router]);

    const handleLogout = async () => {
        await supabaseClient.auth.signOut();
        router.refresh();
        router.push("/auth/login");
    };

    // Show loading while checking access
    if (checkingAccess) {
        return (
            <div className="flex h-screen bg-slate-50 items-center justify-center">
                <div className="text-center">
                    <Spinner className="w-10 h-10 animate-spin text-orange-500 mx-auto mb-4" />
                    <p className="text-sm font-medium text-slate-500">A verificar acesso...</p>
                </div>
            </div>
        );
    }

    // Don't render if no access (redirect happening)
    if (!hasAccess) {
        return null;
    }

    // Check if we are in the presentation editor
    const isPresentationEditor = pathname?.startsWith('/usuario/dashboard/apresentacoes/editor');

    if (isPresentationEditor) {
        return <>{children}</>;
    }

    return (
        <div className="flex h-screen bg-slate-50 font-sans overflow-hidden">
            {/* Sidebar Fixa (Desktop) / Overlay (Mobile) */}
            <div
                className={`fixed inset-y-0 left-0 z-30 bg-emerald-950 transition-all duration-300 ease-in-out border-r border-emerald-900 overflow-hidden 
                    ${isSidebarOpen ? "w-64 translate-x-0" : "w-[80px] -translate-x-full md:translate-x-0"} 
                    md:relative md:flex-shrink-0`}
            >
                <UserSidebar isCollapsed={!isSidebarOpen} toggleSidebar={() => setSidebarOpen(!isSidebarOpen)} />
            </div>

            {/* Overlay para fechar sidebar em mobile quando aberta */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-20 md:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Área de Conteúdo Principal (Rolável) */}
            <main className="flex-1 flex flex-col overflow-hidden relative">
                {/* Top Header */}
                <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 shrink-0 shadow-sm z-10">
                    <div className="flex items-center gap-4">
                        {/* Mobile Menu Toggle */}
                        <button
                            onClick={() => setSidebarOpen(!isSidebarOpen)}
                            className="md:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-lg"
                        >
                            <Menu className="w-6 h-6" />
                        </button>


                        <Link href="/" className="hover:opacity-80 transition-opacity duration-300">
                            <Image
                                src="/Logo.png"
                                alt="Base Agro Data Logo"
                                width={875}
                                height={491}
                                className="h-10 w-auto object-contain"
                                priority
                            />
                        </Link>
                    </div>

                    {/* Right side - Empty for now since Logout moved left? Or maybe User Profile snippet? 
                        The user asked to swap. Previous logout was big button. I'll leave space or put something generic.
                    */}
                    {/* Right side - Logout Button */}
                    <div className="flex items-center gap-4">
                        <Button
                            onClick={handleLogout}
                            variant="outline"
                            className="bg-slate-50 border-slate-200 text-slate-500 hover:bg-orange-50 hover:text-[#f97316] hover:border-orange-200 font-bold gap-2 transition-all shadow-sm"
                        >
                            <LogOut className="w-4 h-4" />
                            Sair
                        </Button>
                    </div>
                </header>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto p-5 md:p-8">
                    <div className="w-full mx-auto">
                        {children}
                    </div>
                </div>
            </main>
        </div>
    );
}
