"use client";

import { useState, useEffect, useCallback, memo } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import { useNetworkStatus } from "@/hooks/useNetworkStatus";
import { syncManager } from "@/lib/syncManager";
import { toast } from "sonner";
import {
    Wifi, WifiOff, RefreshCw, Loader2,
    LayoutDashboard,
    Building2,
    MessageSquare,
    Newspaper,
    FileText,
    BarChart3,
    Target,
    Grid2X2,
    Users,
    LogOut,
    PanelLeftClose,
    PanelLeftOpen,
    Menu,
    ShoppingCart,
    Contact,
    Mail,
    GraduationCap,
    LandPlot,
    Database,
    Presentation,
    Share2,
    ChevronRight,
    Store,
    Briefcase,
    Boxes,
    Settings,
} from "lucide-react";

interface AdminShellProps {
    children: React.ReactNode;
    userEmail: string | undefined;
}

export function AdminShell({ children, userEmail }: AdminShellProps) {
    const pathname = usePathname();
    const router = useRouter();
    const supabase = createClient();
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const { isOnline } = useNetworkStatus();
    const [isSyncing, setIsSyncing] = useState(false);
    const [isSigningOut, setIsSigningOut] = useState(false);
    const [pendingCount, setPendingCount] = useState(0);
    const [openSubmenus, setOpenSubmenus] = useState<string[]>(['gestao']);

    const toggleSubmenu = useCallback((menu: string) => {
        setOpenSubmenus(prev =>
            prev.includes(menu) ? [] : [menu]
        );
    }, []);

    const handleSignOut = useCallback(async () => {
        setIsSigningOut(true);
        try {
            await supabase.auth.signOut();
            router.refresh();
            router.push('/login');
            toast.success("Sessão terminada.");
        } catch (error) {
            toast.error("Erro ao sair.");
        } finally {
            setIsSigningOut(false);
        }
    }, [supabase.auth, router]);

    useEffect(() => {
        const checkQueue = () => {
            const queue = syncManager.getQueue();
            setPendingCount(queue.length);
        };
        checkQueue();
        // Reduced frequency to 15s to avoid main thread starvation
        const interval = setInterval(checkQueue, 15000);
        return () => clearInterval(interval);
    }, []);

    // Auto-collapse sidebar on Presentation Editor
    useEffect(() => {
        if (pathname.startsWith('/admin/apresentacoes/editor')) {
            setIsCollapsed(true);
        }
    }, [pathname]);

    const handleSync = useCallback(async () => {
        if (!isOnline) {
            toast.error("Ainda sem conexão...");
            return;
        }
        setIsSyncing(true);
        const res = await syncManager.processQueue();
        setIsSyncing(false);
        if (res.count > 0) {
            toast.success(`${res.count} alterações sincronizadas com sucesso!`);
        } else {
            toast.info("Nada para sincronizar.");
        }
    }, [isOnline]);

    const isActive = (path: string) => {
        if (path === "/admin" && pathname === "/admin") return true;
        if (path !== "/admin" && pathname.startsWith(path)) return true;
        return false;
    };

    const LinkItem = memo(({ href, icon: Icon, label, isSub }: { href: string; icon: any; label: string; isSub?: boolean }) => {
        const active = isActive(href);
        return (
            <Link
                href={href}
                className={`relative flex items-center gap-3 py-1.5 text-[13px] font-medium transition-all group whitespace-nowrap ${active
                    ? "text-orange-600 bg-orange-50"
                    : "text-slate-700 hover:text-slate-900 hover:bg-slate-100"
                    } ${isCollapsed ? "justify-center px-2" : isSub ? "pl-11 pr-6" : "px-6"}`}
                title={isCollapsed ? label : undefined}
            >
                {active && (
                    <div className="absolute right-0 top-0 bottom-0 w-[3px] bg-orange-500" />
                )}
                <Icon
                    className={`w-5 h-5 min-w-[20px] transition-colors ${active ? "text-orange-600" : "text-slate-500 group-hover:text-orange-600"}`}
                />
                {!isCollapsed && (
                    <div className="flex items-center gap-2 flex-1">
                        <span>{label}</span>
                    </div>
                )}
            </Link>
        );
    });
    LinkItem.displayName = "LinkItem";

    return (
        <div className="flex min-h-screen bg-slate-100 font-sans">
            {/* Mobile Header */}
            <header className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-slate-200 z-[60] flex items-center justify-between px-4">
                <Link href="/" className="flex items-center gap-3 overflow-hidden">
                    <img src="/admin-icon.png" alt="Logo" className="w-8 h-8 object-contain" />
                    <span className="font-black text-lg tracking-wider text-slate-900">PAINEL</span>
                </Link>
                <button
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className="p-2 text-slate-600 hover:text-orange-500"
                >
                    <Menu className="w-6 h-6" />
                </button>
            </header>

            {/* Sidebar Overlay (Mobile) */}
            {isMobileMenuOpen && (
                <div
                    className="lg:hidden fixed inset-0 bg-black/60 z-[70]"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            <aside
                className={`fixed inset-y-0 left-0 z-[80] bg-white text-slate-800 transition-all duration-300 transform shadow-xl
                    ${isCollapsed ? "w-24" : "w-72"} 
                    ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
            >
                <div className="flex flex-col h-full">
                    {/* Header */}
                    <div className={`h-20 flex items-center px-6 border-b border-slate-100 bg-white transition-all ${isCollapsed ? "justify-center" : "justify-between"}`}>
                        {!isCollapsed && (
                            <Link href="/" className="flex items-center gap-3 overflow-hidden hover:opacity-80 transition-opacity">
                                <img src="/admin-icon.png" alt="Logo" className="w-10 h-10 object-contain" />
                                <div>
                                    <span className="font-black text-xl tracking-wider text-slate-900 block truncate">PAINEL</span>
                                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest block truncate">Administrativo</span>
                                </div>
                            </Link>
                        )}
                        {/* Collapse Toggle */}
                        <button
                            onClick={() => setIsCollapsed(!isCollapsed)}
                            className={`text-slate-400 hover:text-orange-500 transition-colors p-2 rounded-lg hover:bg-slate-50 ${isCollapsed ? "w-full flex justify-center" : ""}`}
                            title={isCollapsed ? "Expandir" : "Colapsar"}
                        >
                            {isCollapsed ? <PanelLeftOpen className="w-6 h-6" /> : <PanelLeftClose className="w-6 h-6" />}
                        </button>
                    </div>

                    {/* Nav */}
                    <nav className="flex-1 py-2 flex flex-col gap-0 overflow-y-auto">

                        {/* Section 1: Dashboard */}
                        <div className="pt-2">
                            <LinkItem href="/admin" icon={LayoutDashboard} label="Dashboard" />
                        </div>

                        <div className={`my-2 border-b border-slate-100 ${isCollapsed ? "mx-2" : "mx-6"}`}></div>

                        {/* GROUP: GESTÃO */}
                        <div className="flex flex-col gap-0.5">
                            {!isCollapsed && (
                                <button
                                    onClick={() => toggleSubmenu('gestao')}
                                    className="flex items-center justify-between px-6 py-2 text-[13px] font-black uppercase text-slate-500 hover:text-orange-500 transition-colors group w-full text-left tracking-[0.1em]"
                                >
                                    <div className="flex items-center gap-2.5">
                                        <Briefcase className="w-5 h-5" />
                                        <span>Gestão</span>
                                    </div>
                                    <ChevronRight className={`w-4 h-4 transition-transform ${openSubmenus.includes('gestao') ? 'rotate-90' : ''}`} />
                                </button>
                            )}
                            {openSubmenus.includes('gestao') && (
                                <div className="flex flex-col gap-0.5 animate-in slide-in-from-top-1 duration-200 relative">
                                    {!isCollapsed && <div className="absolute left-[30px] top-2 bottom-2 w-[1.5px] bg-slate-100" />}
                                    <LinkItem href="/admin/empresas" icon={Building2} label="Empresas" isSub />
                                    <LinkItem href="/admin/lojas" icon={Store} label="Lojas" isSub />
                                    <LinkItem href="/admin/produtos" icon={ShoppingCart} label="Produtos" isSub />
                                    <LinkItem href="/admin/propriedades" icon={LandPlot} label="Propriedades" isSub />
                                    <LinkItem href="/admin/profissionais" icon={Users} label="Profissionais" isSub />
                                    <LinkItem href="/admin/artigos" icon={Newspaper} label="Artigos" isSub />
                                    <LinkItem href="/admin/noticias" icon={FileText} label="Notícias" isSub />
                                    <LinkItem href="/admin/documentos" icon={FileText} label="Documentos" isSub />
                                    <LinkItem href="/admin/formacao" icon={GraduationCap} label="Formação" isSub />
                                    <LinkItem href="/admin/apresentacoes" icon={Presentation} label="Apresentações" isSub />
                                </div>
                            )}
                        </div>

                        <div className={`my-2 border-b border-slate-100 ${isCollapsed ? "mx-2" : "mx-6"}`}></div>

                        {/* GROUP: INTERAÇÕES */}
                        <div className="flex flex-col gap-0.5">
                            {!isCollapsed && (
                                <button
                                    onClick={() => toggleSubmenu('interactions')}
                                    className="flex items-center justify-between px-6 py-2 text-[13px] font-black uppercase text-slate-500 hover:text-orange-500 transition-colors group w-full text-left tracking-[0.1em]"
                                >
                                    <div className="flex items-center gap-2.5">
                                        <MessageSquare className="w-5 h-5" />
                                        <span>Interações</span>
                                    </div>
                                    <ChevronRight className={`w-4 h-4 transition-transform ${openSubmenus.includes('interactions') ? 'rotate-90' : ''}`} />
                                </button>
                            )}
                            {openSubmenus.includes('interactions') && (
                                <div className="flex flex-col gap-0.5 animate-in slide-in-from-top-1 duration-200 relative">
                                    {!isCollapsed && <div className="absolute left-[30px] top-2 bottom-2 w-[1.5px] bg-slate-100" />}
                                    <LinkItem href="/admin/estatisticas" icon={BarChart3} label="Estatísticas" isSub />
                                    <LinkItem href="/admin/indicadores" icon={Target} label="Indicadores" isSub />

                                    {/* Mensagem Sub-items */}
                                    <LinkItem href="/admin/mensagens" icon={Mail} label="Email" isSub />
                                    <LinkItem href="/admin/mensagens/newsletter" icon={Newspaper} label="Newsletter" isSub />

                                    <LinkItem href="/admin/contactos" icon={Contact} label="Contactos" isSub />
                                </div>
                            )}
                        </div>

                        <div className={`my-2 border-b border-slate-100 ${isCollapsed ? "mx-2" : "mx-6"}`}></div>

                        {/* GROUP: MÓDULOS ESPECIAIS */}
                        <div className="flex flex-col gap-0.5">
                            {!isCollapsed && (
                                <button
                                    onClick={() => toggleSubmenu('modules')}
                                    className="flex items-center justify-between px-6 py-2 text-[13px] font-black uppercase text-slate-500 hover:text-orange-500 transition-colors group w-full text-left tracking-[0.1em]"
                                >
                                    <div className="flex items-center gap-2.5">
                                        <Boxes className="w-5 h-5" />
                                        <span>Módulos</span>
                                    </div>
                                    <ChevronRight className={`w-4 h-4 transition-transform ${openSubmenus.includes('modules') ? 'rotate-90' : ''}`} />
                                </button>
                            )}
                            {openSubmenus.includes('modules') && (
                                <div className="flex flex-col gap-0.5 animate-in slide-in-from-top-1 duration-200 relative">
                                    {!isCollapsed && <div className="absolute left-[30px] top-2 bottom-2 w-[1.5px] bg-slate-100" />}
                                    <LinkItem href="/admin/podcast" icon={Wifi} label="Podcast" isSub />
                                    <LinkItem href="/admin/actividades" icon={LayoutDashboard} label="Actividades" isSub />
                                    <LinkItem href="/admin/servicos" icon={Grid2X2} label="Serviços" isSub />
                                </div>
                            )}
                        </div>

                        <div className={`my-2 border-b border-slate-100 ${isCollapsed ? "mx-2" : "mx-6"}`}></div>

                        {/* GROUP: OPÇÕES */}
                        <div className="flex flex-col gap-0.5 pb-6">
                            {!isCollapsed && (
                                <button
                                    onClick={() => toggleSubmenu('options')}
                                    className="flex items-center justify-between px-6 py-2 text-[13px] font-black uppercase text-slate-500 hover:text-orange-500 transition-colors group w-full text-left tracking-[0.1em]"
                                >
                                    <div className="flex items-center gap-2.5">
                                        <Settings className="w-5 h-5" />
                                        <span>Opções</span>
                                    </div>
                                    <ChevronRight className={`w-4 h-4 transition-transform ${openSubmenus.includes('options') ? 'rotate-90' : ''}`} />
                                </button>
                            )}
                            {openSubmenus.includes('options') && (
                                <div className="flex flex-col gap-1 animate-in slide-in-from-top-1 duration-200 relative">
                                    {!isCollapsed && <div className="absolute left-[30px] top-2 bottom-1 w-[1.5px] bg-slate-100" />}
                                    <LinkItem href="/admin/utilizadores" icon={Users} label="Utilizadores" isSub />
                                    <LinkItem href="/admin/configuracoes" icon={Target} label="Configurações" isSub />
                                    <LinkItem href="/admin/integracoes" icon={Share2} label="Integrações" isSub />
                                </div>
                            )}
                        </div>
                    </nav>

                    {/* Footer - Identificação do Usuário */}
                    <div className="p-4 border-t border-slate-100 bg-slate-50/50">
                        {!isCollapsed && (
                            <div className="flex items-center gap-3 px-2 py-2 overflow-hidden">
                                <div className="w-10 h-10 min-w-[40px] rounded-full bg-slate-200 flex items-center justify-center text-sm font-bold text-slate-600 ring-2 ring-white shadow-sm">
                                    AD
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-bold text-slate-900 truncate">Administrador</p>
                                    <p className="text-[11px] text-slate-500 truncate font-medium">{userEmail}</p>
                                </div>
                            </div>
                        )}
                        {isCollapsed && (
                            <div className="w-10 h-10 mx-auto rounded-full bg-slate-200 flex items-center justify-center text-sm font-bold text-slate-600 ring-2 ring-white shadow-sm" title={userEmail}>
                                AD
                            </div>
                        )}
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className={`flex-1 bg-slate-50 min-h-screen transition-all duration-300 mt-16 lg:mt-0 ${isCollapsed ? "lg:ml-24" : "lg:ml-72"}`}>
                <div className={`mx-auto ${pathname.startsWith('/admin/mensagens/newsletter') || pathname.startsWith('/admin/apresentacoes/editor') ? "p-0 max-w-full" : "p-8 max-w-7xl"}`}>
                    {children}
                </div>
            </main>
        </div>
    );
}
