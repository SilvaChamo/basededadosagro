"use client"; // Triggering rebuild to verify stability after cache clear

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, ChevronLeft, ChevronDown, Facebook, Instagram, Linkedin, Twitter, Loader2, CheckCircle, Building2, User, Home, ShieldCheck, Globe, TrendingUp, ArrowRight, Star, Zap, QrCode, Presentation, Library, ScanLine, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Sheet,
    SheetContent,
    SheetTitle,
    SheetTrigger,
    SheetClose,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { createClient } from "@/utils/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { ServicesMegaMenu } from "./ServicesMegaMenu";
import { MarketMegaMenu } from "./MarketMegaMenu";
import { getPostLoginPath } from "@/lib/roles";

export function Navbar() {
    const supabase = createClient();
    const pathname = usePathname();
    const { language, toggleLanguage, t } = useLanguage();
    const [view, setView] = useState<"menu" | "auth">("menu");

    // Form States
    const [contactForm, setContactForm] = useState({ name: "", email: "", message: "" });
    const [registerForm, setRegisterForm] = useState({ name: "", category: "", email: "" });

    const [loading, setLoading] = useState<{ contact: boolean; register: boolean }>({ contact: false, register: false });
    const [success, setSuccess] = useState<{ contact: boolean; register: boolean }>({ contact: false, register: false });

    const [user, setUser] = useState<any>(null);
    const [activeMenu, setActiveMenu] = useState<string | null>(null);
    const headerRef = React.useRef<HTMLElement>(null);

    // Radix generates the Sheet trigger's aria-controls id via useId(), which can
    // land on a different value between the SSR pass and the client hydration pass
    // in this tree, producing a harmless but noisy hydration mismatch warning.
    // Mounting the interactive Sheet only after hydration avoids the SSR/client diff entirely.
    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);

    const toggleMenu = (menu: string) => {
        setActiveMenu(prev => prev === menu ? null : menu);
    };

    const closeAllMenus = () => setActiveMenu(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (headerRef.current && !headerRef.current.contains(event.target as Node)) {
                closeAllMenus();
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        // Verificar usuário inicial
        supabase.auth.getUser().then(({ data: { user } }: { data: { user: any } }) => setUser(user));

        // Escutar mudanças de auth
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: any, session: any) => {
            setUser(session?.user ?? null);
        });

        return () => subscription.unsubscribe();
    }, []);

    // Botão "Painel": volta sempre ao painel certo consoante o perfil (admin,
    // equipa de notícias ou utilizador normal) — mesma lógica de
    // getPostLoginPath usada logo a seguir ao login.
    const [panelPath, setPanelPath] = useState<string | null>(null);
    useEffect(() => {
        if (!user) {
            setPanelPath(null);
            return;
        }
        let cancelled = false;
        supabase
            .from("profiles")
            .select("role")
            .eq("id", user.id)
            .single()
            .then(({ data }: { data: any }) => {
                if (!cancelled) setPanelPath(getPostLoginPath(data?.role));
            });
        return () => { cancelled = true; };
    }, [user]);

    const handleContactSubmit = async () => {
        if (!contactForm.name || !contactForm.message) return;
        setLoading(prev => ({ ...prev, contact: true }));
        try {
            await supabase.from('contact_messages').insert([{
                name: contactForm.name,
                email: contactForm.email,
                message: contactForm.message
            }]);
            setSuccess(prev => ({ ...prev, contact: true }));
            setContactForm({ name: "", email: "", message: "" });
            setTimeout(() => setSuccess(prev => ({ ...prev, contact: false })), 3000);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(prev => ({ ...prev, contact: false }));
        }
    };

    const handleRegisterSubmit = async () => {
        if (!registerForm.name || !registerForm.category) return;
        setLoading(prev => ({ ...prev, register: true }));
        try {
            await supabase.from('companies').insert([{
                name: registerForm.name,
                category: registerForm.category,
                description: `Registo Simplificado. Contacto: ${registerForm.email}`,
                image_url: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=1000&auto=format&fit=crop",
            }]);
            setSuccess(prev => ({ ...prev, register: true }));
            setRegisterForm({ name: "", category: "", email: "" });
            setTimeout(() => setSuccess(prev => ({ ...prev, register: false })), 3000);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(prev => ({ ...prev, register: false }));
        }
    };

    const menuItems = [
        { label: t("navbar.services"), link: "/servicos" },
        { label: t("navbar.repository"), link: "/repositorio" },
        { label: t("navbar.innovation"), link: "/inovacao" },
        { label: t("navbar.market"), link: "/mercado" },
        { label: t("navbar.forum"), link: "/forum" },
        { label: t("navbar.news"), link: "/blog" },
    ];

    const baseItems = [
        { label: t("navbar.about"), link: "/sobre-nos" },
        { label: t("navbar.history"), link: "/sobre-nos/historial" },
    ];

    const innovationSections = [
        {
            key: 'presence',
            items: [
                { key: 'registration', icon: Star },
                { key: 'identity', icon: QrCode }
            ]
        },
        {
            key: 'tools',
            items: [
                { key: 'communication', icon: MessageSquare },
                { key: 'presentations', icon: Presentation }
            ]
        },
        {
            key: 'science',
            items: [
                { key: 'scientific', icon: Library },
                { key: 'agrobotanica', icon: ScanLine }
            ]
        }
    ];

    return (
        <header ref={headerRef} className="w-full fixed top-0 left-0 z-50 bg-white shadow-md">
            {/* Identification Bar for Deployment Cleanup */}
            <div className="h-[6px] w-full bg-emerald-600" />
            <div className="container-site py-3 flex items-center justify-between flex-nowrap gap-4">
                {/* Logo Section */}
                <div className="flex items-center flex-shrink-0">
                    <Link href="/">
                        <div className="group">
                            <Image
                                src="/Logo.png"
                                alt="Base Agro Data Logo"
                                width={875}
                                height={491}
                                className="h-10 md:h-12 w-auto object-contain transition-transform duration-300 group-hover:scale-110"
                                priority
                            />
                        </div>
                    </Link>
                </div>

                {/* Desktop Navigation */}
                <nav className="hidden md:flex items-center gap-3 lg:gap-4 xl:gap-6 flex-1 justify-center">
                    {/* Base Dropdown */}
                    <div
                        className="relative py-2"
                        onMouseEnter={() => setActiveMenu('base')}
                        onMouseLeave={closeAllMenus}
                    >
                        <Link
                            href="/"
                            onClick={closeAllMenus}
                            className={`flex items-center gap-1.5 text-[13px] lg:text-[15px] font-medium transition-colors whitespace-nowrap tracking-tight font-sans cursor-pointer ${pathname === "/" || activeMenu === 'base' ? "text-[#f97316]" : "text-gray-600 hover:text-[#f97316]"
                                }`}
                        >
                            <span className="leading-none">{t("navbar.base")}</span>
                            <ChevronDown className={`w-3.5 h-3.5 opacity-70 transition-transform duration-300 ${activeMenu === 'base' ? 'rotate-180' : ''}`} />
                        </Link>

                        {/* Dropdown Content */}
                        <div className={`absolute left-1/2 -translate-x-1/2 top-[calc(100%-10px)] pt-4 transition-all duration-300 z-50 ${activeMenu === 'base' ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible translate-y-2'}`}>
                            <div className="bg-white border border-slate-200 rounded-lg shadow-[0_10px_40px_rgba(0,0,0,0.06)] py-1.5 min-w-[160px] overflow-hidden">
                                {baseItems.map((item, i) => (
                                    <Link
                                        key={i}
                                        href={item.link}
                                        onClick={closeAllMenus}
                                        className="block px-4 py-1.5 text-[14px] font-medium text-slate-600 hover:text-[#f97316] hover:bg-slate-50 transition-all"
                                    >
                                        {item.label}
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </div>

                    {menuItems.map((item, i) => {
                        const isActive = pathname === item.link || (item.link !== '/' && pathname.startsWith(item.link));

                        if (item.link === '/servicos') {
                            const isOpen = activeMenu === 'servicos';
                            return (
                                <div
                                    key={i}
                                    className="py-0.5"
                                    onMouseEnter={() => setActiveMenu('servicos')}
                                    onMouseLeave={closeAllMenus}
                                >
                                    <div
                                        className={`flex items-center gap-1.5 text-[13px] lg:text-[15px] font-medium transition-colors whitespace-nowrap tracking-tight font-sans cursor-pointer ${isActive || isOpen ? "text-[#f97316]" : "text-gray-600 hover:text-[#f97316]"}`}
                                    >
                                        <span className="leading-none">{item.label}</span>
                                        <ChevronDown className={`w-3.5 h-3.5 opacity-70 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
                                    </div>
                                    <div className={`absolute left-0 w-full top-full transition-all duration-300 z-50 ${isOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'}`}>
                                        <ServicesMegaMenu isOpen={isOpen} onClose={closeAllMenus} />
                                    </div>
                                </div>
                            );
                        }

                        if (item.link === '/mercado') {
                            const isOpen = activeMenu === 'mercado';
                            return (
                                <div
                                    key={i}
                                    className="py-0.5"
                                    onMouseEnter={() => setActiveMenu('mercado')}
                                    onMouseLeave={closeAllMenus}
                                >
                                    <div
                                        className={`flex items-center gap-1.5 text-[13px] lg:text-[15px] font-medium transition-colors whitespace-nowrap tracking-tight font-sans cursor-pointer ${isActive || isOpen ? "text-[#f97316]" : "text-gray-600 hover:text-[#f97316]"}`}
                                    >
                                        <span className="leading-none">{item.label}</span>
                                        <ChevronDown className={`w-3.5 h-3.5 opacity-70 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
                                    </div>
                                    <div className={`absolute left-0 w-full top-full transition-all duration-300 z-50 ${isOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'}`}>
                                        <MarketMegaMenu isOpen={isOpen} onClose={closeAllMenus} />
                                    </div>
                                </div>
                            );
                        }

                        if (item.link === '/inovacao') {
                            const isOpen = activeMenu === 'inovacao';
                            return (
                                <div
                                    key={i}
                                    className="py-0.5"
                                    onMouseEnter={() => setActiveMenu('inovacao')}
                                    onMouseLeave={closeAllMenus}
                                >
                                    <div
                                        className={`flex items-center gap-1.5 text-[13px] lg:text-[15px] font-medium transition-colors whitespace-nowrap tracking-tight font-sans cursor-pointer ${isActive || isOpen ? "text-[#f97316]" : "text-gray-600 hover:text-[#f97316]"}`}>
                                        <span className="leading-none">{item.label}</span>
                                        <ChevronDown className={`w-3.5 h-3.5 opacity-70 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
                                    </div>
                                    <div className={`absolute left-0 w-full top-full transition-all duration-300 z-50 ${isOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'}`}>
                                        <div className="absolute top-[-25px] left-0 w-full h-[25px] bg-transparent" />
                                        <div className="bg-white border-y border-slate-200 rounded-none shadow-[0_40px_80px_rgba(0,0,0,0.1)] overflow-hidden">
                                            <div className="container-site py-12">
                                                <div className="grid grid-cols-3 gap-x-16">
                                                    {innovationSections.map((section, idx) => (
                                                        <div key={idx} className="space-y-8">
                                                            <div className="flex flex-col gap-1">
                                                                <div className="h-[1px] w-full bg-orange-100/50 mb-6" />
                                                                <div className="space-y-4">
                                                                    {section.items.map((subItem, si) => {
                                                                        const title = t(`navbar.innovation_menu.${subItem.key}.title`);
                                                                        const description = t(`navbar.innovation_menu.${subItem.key}.description`);
                                                                        const link = t(`navbar.innovation_menu.${subItem.key}.link`);
                                                                        const Icon = subItem.icon;
                                                                        return (
                                                                            <Link key={si} href={link} onClick={closeAllMenus} className="flex items-start gap-4 p-3 -mx-3 rounded-xl hover:bg-slate-50 transition-all group/item">
                                                                                <div className="w-11 h-11 rounded-lg bg-orange-50 flex items-center justify-center shrink-0 group-hover/item:bg-[#f97316] group-hover/item:text-white transition-colors">
                                                                                    <Icon className="w-6 h-6 text-[#f97316] group-hover/item:text-white" />
                                                                                </div>
                                                                                <div>
                                                                                    <h4 className="font-bold text-slate-800 text-[15px] mb-0.5 group-hover/item:text-[#f97316] transition-colors">{title}</h4>
                                                                                    <p className="text-[13px] text-slate-500 leading-tight font-medium line-clamp-2">{description}</p>
                                                                                </div>
                                                                            </Link>
                                                                        );
                                                                    })}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                                <div className="mt-12 pt-8 border-t border-slate-100 flex items-center justify-between">
                                                    <div className="flex items-center gap-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                                        <span className="flex items-center gap-2"><ShieldCheck className="w-4 h-4" /> Segurança Garantida</span>
                                                        <span className="flex items-center gap-2"><Globe className="w-4 h-4 text-emerald-600/50" /> Disponibilidade Nacional</span>
                                                        <span className="flex items-center gap-2"><TrendingUp className="w-4 h-4 text-orange-600/50" /> Alta Performance</span>
                                                    </div>
                                                    <Link href="/inovacao" onClick={closeAllMenus} className="text-[14px] font-bold text-[#f97316] hover:text-emerald-600 transition-colors flex items-center gap-2">
                                                        Ver Visão Geral do Módulo <ArrowRight className="w-4 h-4" />
                                                    </Link>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        }

                        return (
                            <Link
                                key={i}
                                href={item.link}
                                className={`text-[13px] lg:text-[15px] font-medium transition-colors whitespace-nowrap tracking-tight font-sans ${isActive ? "text-[#f97316]" : "text-gray-600 hover:text-[#f97316]"}`}
                            >
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>

                {/* Right Actions Section */}
                <div className="flex items-center gap-2 md:gap-3 flex-shrink-0">
                    <button onClick={toggleLanguage} className="notranslate w-9 h-9 flex items-center justify-center rounded-[8px] bg-[#f97316]/10 font-medium text-[13px] text-[#f97316] hover:bg-[#f97316]/20 transition-all uppercase tracking-tight shadow-sm">
                        {language === "PT" ? "EN" : "PT"}
                    </button>
                    {user ? (
                        <Link href={panelPath || "/usuario/dashboard"} className="hidden sm:block">
                            <Button className="notranslate bg-emerald-600 hover:bg-[#f97316] text-white text-[12px] font-bold px-5 h-9 rounded-[8px] transition-all shadow-sm border-none">
                                Painel
                            </Button>
                        </Link>
                    ) : (
                        <Link href="/auth/login" className="hidden sm:block">
                            <Button className="notranslate bg-emerald-600 hover:bg-[#f97316] text-white text-[12px] font-bold px-5 h-9 rounded-[8px] transition-all shadow-sm border-none">
                                {t("common.login")}
                            </Button>
                        </Link>
                    )}

                    {/* Mobile Menu Trigger */}
                    {!mounted ? (
                        <Button variant="ghost" size="icon" className="md:hidden text-gray-600" aria-label="Menu">
                            <Menu className="w-6 h-6" />
                        </Button>
                    ) : (
                    <Sheet>
                        <SheetTrigger asChild>
                            <Button variant="ghost" size="icon" className="md:hidden text-gray-600">
                                <Menu className="w-6 h-6" />
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="right" className="w-[300px] sm:w-[350px] p-0 border-l border-slate-100">
                            <div className="flex flex-col h-full bg-white">
                                <div className="p-6 border-b border-slate-50 flex items-center justify-between">
                                    <SheetTitle className="text-xl font-black text-slate-800">{t("common.menu")}</SheetTitle>
                                    <SheetClose asChild>
                                        <Button variant="ghost" size="icon" className="text-slate-400">
                                            <ChevronLeft className="w-5 h-5 rotate-180" />
                                        </Button>
                                    </SheetClose>
                                </div>
                                <div className="flex-1 overflow-y-auto py-4">
                                    <div className="px-6 mb-8">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Acesso Rápido</p>
                                        <div className="space-y-1">
                                            <Link href="/" className="flex items-center gap-3 py-3 text-slate-700 font-bold hover:text-emerald-600 border-b border-slate-50">
                                                <Home className="w-4 h-4 text-emerald-500" />
                                                Home
                                            </Link>
                                            {baseItems.map((item, i) => (
                                                <Link key={i} href={item.link} className="flex items-center gap-3 py-3 text-slate-600 font-medium hover:text-emerald-600 pl-4">
                                                    <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                                                    {item.label}
                                                </Link>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="px-6 mb-8">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Módulo de Inovação</p>
                                        <div className="space-y-6">
                                            {innovationSections.map((section, idx) => (
                                                <div key={idx} className="space-y-2">
                                                    <div className="space-y-1">
                                                        {section.items.map((subItem, si) => {
                                                            const title = t(`navbar.innovation_menu.${subItem.key}.title`);
                                                            const link = t(`navbar.innovation_menu.${subItem.key}.link`);
                                                            return (
                                                                <Link key={si} href={link} className={`flex items-center gap-3 py-2 text-slate-600 font-medium hover:text-emerald-600 pl-4 ${pathname === link ? "text-emerald-600" : ""}`}>
                                                                    <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                                                                    {title}
                                                                </Link>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="px-6 mb-8">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Outros Serviços</p>
                                        <div className="space-y-1">
                                            {menuItems.filter(item => item.link !== '/inovacao').map((item, i) => {
                                                const isActive = pathname === item.link || (item.link !== '/' && pathname.startsWith(item.link));
                                                return (
                                                    <Link key={i} href={item.link} className={`block py-3 text-slate-700 font-bold border-b border-slate-50 ${isActive ? "text-emerald-600" : ""}`}>
                                                        {item.label}
                                                    </Link>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                                <div className="p-6 border-t border-slate-50 space-y-4">
                                    {user ? (
                                        <Link href={panelPath || "/usuario/dashboard"} className="block w-full">
                                            <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-12 rounded-[12px]">
                                                Painel
                                            </Button>
                                        </Link>
                                    ) : (
                                        <Link href="/auth/login" className="block w-full">
                                            <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-12 rounded-[12px]">
                                                {t("common.login")}
                                            </Button>
                                        </Link>
                                    )}
                                </div>
                            </div>
                        </SheetContent>
                    </Sheet>
                    )}
                </div>
            </div>
        </header>
    );
}
