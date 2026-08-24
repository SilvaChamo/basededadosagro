"use client";

import { useState, useEffect, useCallback, memo, Suspense } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useNetworkStatus } from "@/hooks/useNetworkStatus";
import { syncManager } from "@/lib/syncManager";
import { AdminTopBarProvider, AdminTopBar } from "./AdminTopBar";
import { toast } from "sonner";
import {
    Wifi, WifiOff, RefreshCw,
    LayoutDashboard,
    Building2,
    MessageSquare,
    Newspaper,
    FileText,
    BarChart3,
    Target,
    Grid2X2,
    Users,
    PanelLeftClose,
    PanelLeftOpen,
    Menu,
    ShoppingCart,
    Contact,
    MailPlus,
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
    Rss,
    Tag,
    FileEdit,
    Archive,
    Trash2,
    Images,
    Image,
    Video,
    FileType,
    Music,
    Layers,
    BookOpen,
    Scale,
    UserPlus,
} from "lucide-react";

interface AdminShellProps {
    children: React.ReactNode;
    userEmail: string | undefined;
    /** Quando true, mostra apenas a Central de Notícias no menu — usado para
     * as contas de Editor/Contribuidor, que só têm acesso a esse painel. */
    restricted?: boolean;
    roleLabel?: string;
}

export function AdminShell(props: AdminShellProps) {
    // useSearchParams() exige um limite de Suspense — sem isto o Next recusa-se
    // a compilar (a comparação de item activo do submenu precisa da query string).
    return (
        <Suspense fallback={null}>
            <AdminShellInner {...props} />
        </Suspense>
    );
}

function AdminShellInner({ children, userEmail, restricted = false, roleLabel = "Administrador" }: AdminShellProps) {
    const pathname = usePathname();
    // usePathname() devolve o caminho com o prefixo de idioma (ex.: "/pt/admin/galeria"),
    // mas os href do menu não o têm — sem tirar o prefixo, nenhuma comparação batia certo.
    const pathnameWithoutLocale = pathname.replace(/^\/(pt|en)(?=\/|$)/, "") || "/";
    const isFullBleedRoute = pathnameWithoutLocale.startsWith('/admin/mensagens/newsletter') || pathnameWithoutLocale.startsWith('/admin/apresentacoes/editor');
    // Todos os href do menu (ex.: "/admin/empresas") não têm prefixo de idioma.
    // O middleware está em modo "as-needed": o idioma por omissão (pt) navega
    // sem prefixo, só o inglês precisa de "/en" à frente — por isso só se
    // acrescenta o prefixo quando o idioma actual não é o padrão. Acrescentá-lo
    // sempre (incluindo para pt) fazia o middleware redirecionar de volta para
    // a forma sem prefixo em cada clique, duplicando as idas e vindas ao servidor.
    const localeMatch = pathname.match(/^\/(pt|en)(?=\/|$)/);
    const locale = localeMatch ? localeMatch[1] : "pt";
    const withLocale = useCallback((href: string) => locale === "pt" ? href : `/${locale}${href}`, [locale]);
    const searchParams = useSearchParams();
    const currentSearch = searchParams.toString();
    const router = useRouter();
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const { isOnline } = useNetworkStatus();
    const [isSyncing, setIsSyncing] = useState(false);
    const [pendingCount, setPendingCount] = useState(0);
    const [openSubmenus, setOpenSubmenus] = useState<string[]>([]);

    // router.push() só actualiza usePathname()/useSearchParams() quando a
    // navegação real termina (pode haver um atraso visível a ir buscar a
    // rota) — por isso o item clicado marca-se aqui como activo de imediato,
    // sem esperar por isso. Limpa-se sozinho assim que a navegação real
    // chegar ao destino (o efeito abaixo reage à mudança de pathname/query).
    const [optimisticHref, setOptimisticHref] = useState<string | null>(null);

    useEffect(() => {
        setOptimisticHref(null);
    }, [pathnameWithoutLocale, currentSearch]);

    // Clicar no cabeçalho de um grupo abre-o e navega logo para o seu primeiro
    // submenu (em vez de só expandir/colapsar) — mesmo comportamento em todos
    // os grupos da barra lateral.
    const handleGroupClick = useCallback((menu: string, firstHref: string) => {
        setOpenSubmenus([menu]);
        setOptimisticHref(firstHref);
        router.push(withLocale(firstHref));
    }, [router, withLocale]);

    // O chevron é um alvo de clique à parte: só expande/colapsa o grupo,
    // sem navegar — permite fechar um grupo já aberto sem sair da página actual.
    const toggleSubmenuOnly = useCallback((menu: string) => {
        setOpenSubmenus(prev => prev.includes(menu) ? [] : [menu]);
    }, []);

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
        if (pathnameWithoutLocale.startsWith('/admin/apresentacoes/editor')) {
            setIsCollapsed(true);
        }
    }, [pathnameWithoutLocale]);

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

    const isActive = (path: string, exact?: boolean) => {
        // Ver optimisticHref acima: enquanto a navegação real não chega,
        // o item que acabou de ser clicado é que manda no estado activo.
        if (optimisticHref !== null) return path === optimisticHref;

        // Vários submenus (Notícias, Documentos, Multimédia...) usam a mesma
        // rota base com uma query string diferente por item (?tab=Guia,
        // ?tipo=videos...) — usePathname() não inclui a query, por isso sem
        // isto todos os itens do mesmo grupo comparavam contra o mesmo path
        // e só o link "exact" (sem query) ficava sempre activo.
        const [base, query] = path.split('?');

        if (query) {
            if (pathnameWithoutLocale !== base) return false;
            const params = new URLSearchParams(query);
            return Array.from(params.entries()).every(([key, value]) => searchParams.get(key) === value);
        }

        if (exact) return pathnameWithoutLocale === base && currentSearch === '';
        if (base === "/admin" && pathnameWithoutLocale === "/admin") return true;
        if (base !== "/admin" && pathnameWithoutLocale.startsWith(base)) return true;
        return false;
    };

    // Destaca o cabeçalho do grupo a laranja quando a página actual pertence
    // a esse grupo — independentemente de qual dos seus submenus está activo.
    const isGroupActive = (prefixes: string[]) => {
        const current = optimisticHref !== null ? optimisticHref.split('?')[0] : pathnameWithoutLocale;
        return prefixes.some((p) => current === p || current.startsWith(p + "/"));
    };

    const LinkItem = memo(({ href, icon: Icon, label, isSub, isHeader, exact }: { href: string; icon: any; label: string; isSub?: boolean; isHeader?: boolean; exact?: boolean }) => {
        const active = isActive(href, exact);
        const baseStyles = active
            ? "text-orange-600 bg-orange-50"
            : "text-slate-700 hover:text-slate-900 hover:bg-slate-100";
        
        const headerStyles = isHeader 
            ? "font-black uppercase tracking-[0.1em] text-slate-500 hover:text-orange-500" 
            : "font-medium";

        return (
            <Link
                href={withLocale(href)}
                className={`relative flex items-center gap-3 py-1.5 transition-all duration-300 ease-out group whitespace-nowrap ${isHeader ? "text-[15px]" : "text-[14px]"} ${active ? (isHeader ? "text-orange-600 bg-orange-50" : "text-orange-600") : (isHeader ? "text-slate-500 hover:text-orange-500 hover:bg-slate-50" : "text-slate-700 hover:text-orange-600")} ${isHeader ? "font-semibold hover:translate-x-1.5" : "font-medium"} ${isCollapsed ? "justify-center px-2" : isSub ? "pl-11 pr-6" : "px-6"}`}
                title={isCollapsed ? label : undefined}
            >
                {active && (
                    isSub && !isCollapsed ? (
                        // Sobrepõe-se à linha cinza do grupo (left-[30px]), mas só com a
                        // altura do texto do submenu — não a linha inteira do item.
                        <div className="absolute left-[30px] top-1/2 -translate-y-1/2 h-4 w-[2px] bg-orange-500 z-10" />
                    ) : (
                        <div className="absolute top-0 bottom-0 right-0 w-[3px] bg-orange-500 transition-all" />
                    )
                )}
                <Icon
                    className={`${isHeader ? "w-6 h-6 min-w-[24px]" : "w-5 h-5 min-w-[20px]"} transition-colors ${active ? "text-orange-600" : "text-slate-500 group-hover:text-orange-600"}`}
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
            <header className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-slate-200 z-[80] flex items-center justify-between px-4">
                <Link href={withLocale("/")} className="flex items-center gap-3 overflow-hidden">
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
                // z-[80] no mobile: tem de ficar acima do overlay (z-[70]) quando aberta.
                // lg:z-30 no desktop: mais baixo do que a AdminListToolbar de cada página
                // (z-40) para a sombra (shadow-xl, mantida de propósito) não pintar por
                // cima da barra de menu — só a linha divisória (border-l) marca a fronteira.
                className={`fixed inset-y-0 left-0 z-[80] lg:z-30 bg-white text-slate-800 transition-all duration-300 transform shadow-xl
                    ${isCollapsed ? "w-24" : "w-72"}
                    ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
            >
                <div className="flex flex-col h-full">
                    {/* Header */}
                    <div className={`h-20 flex items-center px-6 border-b border-slate-100 bg-white transition-all ${isCollapsed ? "justify-center" : "justify-between"}`}>
                        {!isCollapsed && (
                            <Link href={withLocale("/")} className="flex items-center gap-3 overflow-hidden hover:opacity-80 transition-opacity">
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

                        {restricted ? (
                            <div className="pt-2 flex flex-col gap-0.5">
                                <LinkItem href="/admin/central-noticias" icon={Rss} label="Central de Notícias" isHeader />
                                <LinkItem href="/admin/central-noticias/categorias" icon={Tag} label="Categorias" isSub />
                                <LinkItem href="/admin/central-noticias" icon={FileText} label="Publicadas" isSub exact />
                                <LinkItem href="/admin/central-noticias/rascunho" icon={FileEdit} label="Rascunho" isSub />
                                <LinkItem href="/admin/central-noticias/arquivadas" icon={Archive} label="Arquivadas" isSub />
                                <LinkItem href="/admin/central-noticias/lixo" icon={Trash2} label="Eliminadas" isSub />

                                <div className="my-2 border-b border-slate-100 mx-6"></div>

                                {/* Mesma galeria 100% (mesma página /admin/galeria) do painel
                                    de administrador — só o acesso é que é restrito ao grupo. */}
                                <LinkItem href="/admin/galeria" icon={Images} label="Multimédia" isHeader />
                                <LinkItem href="/admin/galeria" icon={Images} label="Galeria" isSub exact />
                                <LinkItem href="/admin/galeria?tipo=videos" icon={Video} label="Vídeos" isSub />
                                <LinkItem href="/admin/galeria?tipo=documentos" icon={FileText} label="Documentos" isSub />
                                <LinkItem href="/admin/galeria?tipo=pdf" icon={FileType} label="PDF" isSub />
                                <LinkItem href="/admin/galeria?tipo=audio" icon={Music} label="Áudio" isSub />
                            </div>
                        ) : (
                        <>
                        {/* Section 1: Dashboard */}
                        <div className="pt-2">
                            <LinkItem href="/admin" icon={LayoutDashboard} label="Dashboard" isHeader />
                        </div>

                        <div className={`my-2 border-b border-slate-100 ${isCollapsed ? "mx-2" : "mx-6"}`}></div>

                        {/* GROUP: GESTÃO */}
                        <div className="flex flex-col gap-0.5">
                            {!isCollapsed && (
                                <div className={`flex items-center transition-all ${isGroupActive(['/admin/empresas', '/admin/lojas', '/admin/produtos', '/admin/propriedades', '/admin/profissionais', '/admin/central-noticias', '/admin/formacao', '/admin/apresentacoes']) ? 'text-orange-600 bg-orange-50' : 'text-slate-500'}`}>
                                    <button
                                        onClick={() => handleGroupClick('gestao', '/admin/empresas')}
                                        className="flex items-center gap-2.5 flex-1 min-w-0 pl-6 pr-2 py-1.5 text-[15px] font-semibold text-left transition-all duration-300 ease-out hover:translate-x-1.5 hover:text-orange-500"
                                    >
                                        <Briefcase className="w-6 h-6 shrink-0" />
                                        <span>Gestão</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => toggleSubmenuOnly('gestao')}
                                        className="pl-2 pr-6 py-1.5 hover:text-orange-500 transition-colors"
                                        title={openSubmenus.includes('gestao') ? "Colapsar" : "Expandir"}
                                    >
                                        <ChevronRight className={`w-4 h-4 transition-transform ${openSubmenus.includes('gestao') ? 'rotate-90' : ''}`} />
                                    </button>
                                </div>
                            )}
                            {openSubmenus.includes('gestao') && (
                                <div className="flex flex-col gap-0.5 animate-in slide-in-from-top-1 duration-200 relative">
                                    {!isCollapsed && <div className="absolute left-[30px] top-2 bottom-2 w-[1.5px] bg-slate-100" />}
                                    <LinkItem href="/admin/empresas" icon={Building2} label="Empresas" isSub />
                                    <LinkItem href="/admin/lojas" icon={Store} label="Lojas" isSub />
                                    <LinkItem href="/admin/produtos" icon={ShoppingCart} label="Produtos" isSub />
                                    <LinkItem href="/admin/propriedades" icon={LandPlot} label="Propriedades" isSub />
                                    <LinkItem href="/admin/profissionais" icon={Users} label="Profissionais" isSub />
                                    <LinkItem href="/admin/central-noticias" icon={Rss} label="Central de Notícias" isSub />
                                    <LinkItem href="/admin/formacao" icon={GraduationCap} label="Formação" isSub />
                                    <LinkItem href="/admin/apresentacoes" icon={Presentation} label="Apresentações" isSub />
                                </div>
                            )}
                        </div>

                        <div className={`my-2 border-b border-slate-100 ${isCollapsed ? "mx-2" : "mx-6"}`}></div>

                        {/* GROUP: NOTÍCIAS */}
                        <div className="flex flex-col gap-0.5">
                            {!isCollapsed && (
                                <div className={`flex items-center transition-all ${isGroupActive(['/admin/noticias']) ? 'text-orange-600 bg-orange-50' : 'text-slate-500'}`}>
                                    <button
                                        onClick={() => handleGroupClick('noticias', '/admin/noticias')}
                                        className="flex items-center gap-2.5 flex-1 min-w-0 pl-6 pr-2 py-1.5 text-[15px] font-semibold text-left transition-all duration-300 ease-out hover:translate-x-1.5 hover:text-orange-500"
                                    >
                                        <Newspaper className="w-6 h-6 shrink-0" />
                                        <span>Notícias</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => toggleSubmenuOnly('noticias')}
                                        className="pl-2 pr-6 py-1.5 hover:text-orange-500 transition-colors"
                                        title={openSubmenus.includes('noticias') ? "Colapsar" : "Expandir"}
                                    >
                                        <ChevronRight className={`w-4 h-4 transition-transform ${openSubmenus.includes('noticias') ? 'rotate-90' : ''}`} />
                                    </button>
                                </div>
                            )}
                            {openSubmenus.includes('noticias') && (
                                <div className="flex flex-col gap-0.5 animate-in slide-in-from-top-1 duration-200 relative">
                                    {!isCollapsed && <div className="absolute left-[30px] top-2 bottom-2 w-[1.5px] bg-slate-100" />}
                                    <LinkItem href="/admin/noticias" icon={Newspaper} label="Todas as Notícias" isSub exact />
                                    <LinkItem href="/admin/noticias?tab=Guia" icon={GraduationCap} label="Guias" isSub />
                                    <LinkItem href="/admin/noticias?tab=Dicas" icon={Tag} label="Dicas" isSub />
                                    <LinkItem href="/admin/noticias?tab=Internacional" icon={Rss} label="Internacional" isSub />
                                    <LinkItem href="/admin/noticias?tab=Pendentes" icon={Archive} label="Pendentes" isSub />
                                </div>
                            )}
                        </div>

                        <div className={`my-2 border-b border-slate-100 ${isCollapsed ? "mx-2" : "mx-6"}`}></div>

                        {/* GROUP: DOCUMENTOS (funde Artigos científicos + Documentos oficiais —
                            ambos vivem na mesma tabela `articles`, só o `type` muda) */}
                        <div className="flex flex-col gap-0.5">
                            {!isCollapsed && (
                                <div className={`flex items-center transition-all ${isGroupActive(['/admin/documentos', '/admin/artigos']) ? 'text-orange-600 bg-orange-50' : 'text-slate-500'}`}>
                                    <button
                                        onClick={() => handleGroupClick('documentos', '/admin/documentos')}
                                        className="flex items-center gap-2.5 flex-1 min-w-0 pl-6 pr-2 py-1.5 text-[15px] font-semibold text-left transition-all duration-300 ease-out hover:translate-x-1.5 hover:text-orange-500"
                                    >
                                        <FileText className="w-6 h-6 shrink-0" />
                                        <span>Documentos</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => toggleSubmenuOnly('documentos')}
                                        className="pl-2 pr-6 py-1.5 hover:text-orange-500 transition-colors"
                                        title={openSubmenus.includes('documentos') ? "Colapsar" : "Expandir"}
                                    >
                                        <ChevronRight className={`w-4 h-4 transition-transform ${openSubmenus.includes('documentos') ? 'rotate-90' : ''}`} />
                                    </button>
                                </div>
                            )}
                            {openSubmenus.includes('documentos') && (
                                <div className="flex flex-col gap-0.5 animate-in slide-in-from-top-1 duration-200 relative">
                                    {!isCollapsed && <div className="absolute left-[30px] top-2 bottom-2 w-[1.5px] bg-slate-100" />}
                                    <LinkItem href="/admin/documentos" icon={FileText} label="Todos os Documentos" isSub exact />
                                    <LinkItem href="/admin/documentos?tab=relatorios" icon={FileText} label="Relatórios" isSub />
                                    <LinkItem href="/admin/documentos?tab=legislacao" icon={Scale} label="Leis e Regulamentos" isSub />
                                    <LinkItem href="/admin/documentos?tab=outros" icon={Layers} label="Outros Documentos" isSub />
                                    <LinkItem href="/admin/artigos?tab=Artigos" icon={Newspaper} label="Artigos Científicos" isSub />
                                    <LinkItem href="/admin/artigos?tab=Dissertações" icon={GraduationCap} label="Dissertações" isSub />
                                    <LinkItem href="/admin/artigos?tab=Livros" icon={BookOpen} label="Livros & Manuais" isSub />
                                </div>
                            )}
                        </div>

                        <div className={`my-2 border-b border-slate-100 ${isCollapsed ? "mx-2" : "mx-6"}`}></div>

                        {/* GROUP: MULTIMÉDIA */}
                        <div className="flex flex-col gap-0.5">
                            {!isCollapsed && (
                                <div className={`flex items-center transition-all ${isGroupActive(['/admin/galeria']) ? 'text-orange-600 bg-orange-50' : 'text-slate-500'}`}>
                                    <button
                                        onClick={() => handleGroupClick('multimedia', '/admin/galeria')}
                                        className="flex items-center gap-2.5 flex-1 min-w-0 pl-6 pr-2 py-1.5 text-[15px] font-semibold text-left transition-all duration-300 ease-out hover:translate-x-1.5 hover:text-orange-500"
                                    >
                                        <Images className="w-6 h-6 shrink-0" />
                                        <span>Multimédia</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => toggleSubmenuOnly('multimedia')}
                                        className="pl-2 pr-6 py-1.5 hover:text-orange-500 transition-colors"
                                        title={openSubmenus.includes('multimedia') ? "Colapsar" : "Expandir"}
                                    >
                                        <ChevronRight className={`w-4 h-4 transition-transform ${openSubmenus.includes('multimedia') ? 'rotate-90' : ''}`} />
                                    </button>
                                </div>
                            )}
                            {openSubmenus.includes('multimedia') && (
                                <div className="flex flex-col gap-0.5 animate-in slide-in-from-top-1 duration-200 relative">
                                    {!isCollapsed && <div className="absolute left-[30px] top-2 bottom-2 w-[1.5px] bg-slate-100" />}
                                    <LinkItem href="/admin/galeria" icon={Images} label="Galeria" isSub exact />
                                    <LinkItem href="/admin/galeria?tipo=videos" icon={Video} label="Vídeos" isSub />
                                    <LinkItem href="/admin/galeria?tipo=documentos" icon={FileText} label="Documentos" isSub />
                                    <LinkItem href="/admin/galeria?tipo=pdf" icon={FileType} label="PDF" isSub />
                                    <LinkItem href="/admin/galeria?tipo=audio" icon={Music} label="Áudio" isSub />
                                </div>
                            )}
                        </div>

                        <div className={`my-2 border-b border-slate-100 ${isCollapsed ? "mx-2" : "mx-6"}`}></div>

                        {/* GROUP: INTERAÇÕES */}
                        <div className="flex flex-col gap-0.5">
                            {!isCollapsed && (
                                <div className={`flex items-center transition-all ${isGroupActive(['/admin/estatisticas', '/admin/indicadores', '/admin/mensagens', '/admin/contactos']) ? 'text-orange-600 bg-orange-50' : 'text-slate-500'}`}>
                                    <button
                                        onClick={() => handleGroupClick('interactions', '/admin/estatisticas')}
                                        className="flex items-center gap-2.5 flex-1 min-w-0 pl-6 pr-2 py-1.5 text-[15px] font-semibold text-left transition-all duration-300 ease-out hover:translate-x-1.5 hover:text-orange-500"
                                    >
                                        <MessageSquare className="w-6 h-6 shrink-0" />
                                        <span>Interações</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => toggleSubmenuOnly('interactions')}
                                        className="pl-2 pr-6 py-1.5 hover:text-orange-500 transition-colors"
                                        title={openSubmenus.includes('interactions') ? "Colapsar" : "Expandir"}
                                    >
                                        <ChevronRight className={`w-4 h-4 transition-transform ${openSubmenus.includes('interactions') ? 'rotate-90' : ''}`} />
                                    </button>
                                </div>
                            )}
                            {openSubmenus.includes('interactions') && (
                                <div className="flex flex-col gap-0.5 animate-in slide-in-from-top-1 duration-200 relative">
                                    {!isCollapsed && <div className="absolute left-[30px] top-2 bottom-2 w-[1.5px] bg-slate-100" />}
                                    <LinkItem href="/admin/estatisticas" icon={BarChart3} label="Estatísticas" isSub />
                                    <LinkItem href="/admin/indicadores" icon={Target} label="Indicadores" isSub />

                                    {/* Mensagem Sub-items — exact: sem isto, qualquer subpágina
                                        (newsletter/subscritores/campanhas) faz "startsWith('/admin/mensagens')"
                                        bater certo e acender Nova Mensagem também. "Email" foi removido
                                        por duplicar exactamente este mesmo destino (mesma página, sem abas). */}
                                    <LinkItem href="/admin/mensagens" icon={MailPlus} label="Nova Mensagem" isSub exact />
                                    <LinkItem href="/admin/mensagens/newsletter" icon={Newspaper} label="Newsletter" isSub exact />
                                    <LinkItem href="/admin/mensagens/subscritores" icon={Users} label="Subscritores" isSub exact />
                                    <LinkItem href="/admin/mensagens/campanhas" icon={BarChart3} label="Campanhas" isSub exact />

                                    <LinkItem href="/admin/contactos" icon={Contact} label="Contactos" isSub />
                                </div>
                            )}
                        </div>

                        <div className={`my-2 border-b border-slate-100 ${isCollapsed ? "mx-2" : "mx-6"}`}></div>

                        {/* GROUP: MÓDULOS ESPECIAIS */}
                        <div className="flex flex-col gap-0.5">
                            {!isCollapsed && (
                                <div className={`flex items-center transition-all ${isGroupActive(['/admin/podcast', '/admin/actividades', '/admin/servicos']) ? 'text-orange-600 bg-orange-50' : 'text-slate-500'}`}>
                                    <button
                                        onClick={() => handleGroupClick('modules', '/admin/podcast')}
                                        className="flex items-center gap-2.5 flex-1 min-w-0 pl-6 pr-2 py-1.5 text-[15px] font-semibold text-left transition-all duration-300 ease-out hover:translate-x-1.5 hover:text-orange-500"
                                    >
                                        <Boxes className="w-6 h-6 shrink-0" />
                                        <span>Módulos</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => toggleSubmenuOnly('modules')}
                                        className="pl-2 pr-6 py-1.5 hover:text-orange-500 transition-colors"
                                        title={openSubmenus.includes('modules') ? "Colapsar" : "Expandir"}
                                    >
                                        <ChevronRight className={`w-4 h-4 transition-transform ${openSubmenus.includes('modules') ? 'rotate-90' : ''}`} />
                                    </button>
                                </div>
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

                        {/* GROUP: UTILIZADORES (fora de Opções — submenu ao estilo do
                            menu "Utilizadores" do WordPress: lista + adicionar novo) */}
                        <div className="flex flex-col gap-0.5">
                            {!isCollapsed && (
                                <div className={`flex items-center transition-all ${isGroupActive(['/admin/utilizadores']) ? 'text-orange-600 bg-orange-50' : 'text-slate-500'}`}>
                                    <button
                                        onClick={() => handleGroupClick('utilizadores', '/admin/utilizadores')}
                                        className="flex items-center gap-2.5 flex-1 min-w-0 pl-6 pr-2 py-1.5 text-[15px] font-semibold text-left transition-all duration-300 ease-out hover:translate-x-1.5 hover:text-orange-500"
                                    >
                                        <Users className="w-6 h-6 shrink-0" />
                                        <span>Utilizadores</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => toggleSubmenuOnly('utilizadores')}
                                        className="pl-2 pr-6 py-1.5 hover:text-orange-500 transition-colors"
                                        title={openSubmenus.includes('utilizadores') ? "Colapsar" : "Expandir"}
                                    >
                                        <ChevronRight className={`w-4 h-4 transition-transform ${openSubmenus.includes('utilizadores') ? 'rotate-90' : ''}`} />
                                    </button>
                                </div>
                            )}
                            {openSubmenus.includes('utilizadores') && (
                                <div className="flex flex-col gap-0.5 animate-in slide-in-from-top-1 duration-200 relative">
                                    {!isCollapsed && <div className="absolute left-[30px] top-2 bottom-2 w-[1.5px] bg-slate-100" />}
                                    <LinkItem href="/admin/utilizadores" icon={Users} label="Todos os Utilizadores" isSub exact />
                                    <LinkItem href="/admin/utilizadores/novo" icon={UserPlus} label="Adicionar Novo" isSub />
                                </div>
                            )}
                        </div>

                        <div className={`my-2 border-b border-slate-100 ${isCollapsed ? "mx-2" : "mx-6"}`}></div>

                        {/* GROUP: OPÇÕES */}
                        <div className="flex flex-col gap-0.5 pb-6">
                            {!isCollapsed && (
                                <div className={`flex items-center transition-all ${isGroupActive(['/admin/configuracoes', '/admin/integracoes']) ? 'text-orange-600 bg-orange-50' : 'text-slate-500'}`}>
                                    <button
                                        onClick={() => handleGroupClick('options', '/admin/configuracoes')}
                                        className="flex items-center gap-2.5 flex-1 min-w-0 pl-6 pr-2 py-1.5 text-[15px] font-semibold text-left transition-all duration-300 ease-out hover:translate-x-1.5 hover:text-orange-500"
                                    >
                                        <Settings className="w-6 h-6 shrink-0" />
                                        <span>Opções</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => toggleSubmenuOnly('options')}
                                        className="pl-2 pr-6 py-1.5 hover:text-orange-500 transition-colors"
                                        title={openSubmenus.includes('options') ? "Colapsar" : "Expandir"}
                                    >
                                        <ChevronRight className={`w-4 h-4 transition-transform ${openSubmenus.includes('options') ? 'rotate-90' : ''}`} />
                                    </button>
                                </div>
                            )}
                            {openSubmenus.includes('options') && (
                                <div className="flex flex-col gap-1 animate-in slide-in-from-top-1 duration-200 relative">
                                    {!isCollapsed && <div className="absolute left-[30px] top-2 bottom-1 w-[1.5px] bg-slate-100" />}
                                    <LinkItem href="/admin/configuracoes" icon={Target} label="Configurações" isSub />
                                    <LinkItem href="/admin/integracoes" icon={Share2} label="Integrações" isSub />
                                </div>
                            )}
                        </div>
                        </>
                        )}
                    </nav>

                    {/* Footer - Identificação do Usuário */}
                    <div className="p-4 border-t border-slate-100 bg-slate-50/50">
                        {!isCollapsed && (
                            <div className="flex items-center gap-3 px-2 py-2 overflow-hidden">
                                <div className="w-10 h-10 min-w-[40px] rounded-full bg-slate-200 flex items-center justify-center text-sm font-bold text-slate-600 ring-2 ring-white shadow-sm">
                                    AD
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-bold text-slate-900 truncate">{roleLabel}</p>
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
                <AdminTopBarProvider>
                    {/* Rotas de ecrã inteiro (editor, newsletter) controlam o seu
                        próprio espaço — sem a barra genérica nem o padding-padrão. */}
                    {isFullBleedRoute ? (
                        children
                    ) : (
                        <>
                            <AdminTopBar />
                            <div className="p-8 pt-2">
                                {children}
                            </div>
                        </>
                    )}
                </AdminTopBarProvider>
            </main>
        </div>
    );
}
