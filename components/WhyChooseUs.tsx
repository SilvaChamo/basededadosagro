"use client";

import React, { useEffect, useState } from "react";
import { TrendingUp, Users, Eye, Building2, Tractor, ShoppingBag, ArrowRight } from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { useTranslations } from 'next-intl';

export function WhyChooseUs() {
    const t = useTranslations('WhyChooseUs');
    const [counts, setCounts] = useState({
        empresas: 0,
        profissionais: 0,
        propriedades: 0,
        produtos: 0
    });

    useEffect(() => {
        const fetchCounts = async () => {
            const [c, p, prop, prod] = await Promise.all([
                supabase.from('companies').select('*', { count: 'exact', head: true }),
                supabase.from('professionals').select('*', { count: 'exact', head: true }),
                supabase.from('properties').select('*', { count: 'exact', head: true }),
                supabase.from('products').select('*', { count: 'exact', head: true })
            ]);

            setCounts({
                empresas: c.count || 0,
                profissionais: p.count || 0,
                propriedades: prop.count || 0,
                produtos: prod.count || 0
            });
        };
        fetchCounts();
    }, []);

    const richHandlers = {
        br: () => <br />,
        highlight: (chunks: React.ReactNode) => <span className="text-[#f97316]">{chunks}</span>
    };

    return (

        <section className="bg-transparent py-10 md:py-[100px] overflow-hidden relative">
            {/* Transparent Background Image */}
            <div
                className="absolute inset-0 z-0 opacity-[0.2] pointer-events-none bg-center bg-cover bg-no-repeat"
                style={{ backgroundImage: "url('/assets/cta-gradient-bg.webp')" }}
            />

            <div className="container-site grid lg:grid-cols-2 gap-16 lg:gap-12 items-start">
                {/* Text Content — desktop: right column */}
                <div className="space-y-8 animate-in fade-in slide-in-from-left-8 duration-700 sticky top-24 lg:order-2">
                    <div className="space-y-4">
                        <h2 className="text-[28px] md:text-[45px] font-heading font-black text-slate-600 leading-[1.1] tracking-tight">
                            {t.rich('title', richHandlers)}
                        </h2>
                        <p className="text-slate-500 text-sm leading-relaxed">
                            {t('description')}
                        </p>
                    </div>

                    <div className="space-y-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            <div className="flex gap-3 group sm:border-r sm:border-slate-200 sm:pr-5">
                                <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center shrink-0 transition-transform group-hover:scale-110 duration-300">
                                    <Eye className="w-5 h-5 text-[#f97316]" />
                                </div>
                                <div>
                                    <h3 className="text-base font-bold text-slate-600">{t('features.visibility.title')}</h3>
                                    <p className="text-slate-500 text-sm mt-0.5">{t('features.visibility.description')}</p>
                                </div>
                            </div>

                            <div className="flex gap-3 group">
                                <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center shrink-0 transition-transform group-hover:scale-110 duration-300">
                                    <TrendingUp className="w-5 h-5 text-emerald-600" />
                                </div>
                                <div>
                                    <h3 className="text-base font-bold text-slate-600">{t('features.growth.title')}</h3>
                                    <p className="text-slate-500 text-sm mt-0.5">{t('features.growth.description')}</p>
                                </div>
                            </div>
                        </div>

                        {/* Button Positioned at Bottom */}
                        <Link
                            href="/servicos/registo-talento"
                            className="inline-flex items-center gap-2 bg-emerald-700 hover:bg-[#f97316] text-white px-8 py-[10px] rounded-[7px] font-bold text-lg transition-all duration-300 shadow-lg hover:shadow-orange-500/30 hover:-translate-y-1 group"
                        >
                            {t('professional_button')}
                            <ArrowRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
                        </Link>
                    </div>
                </div>

                {/* Cards — desktop: left column */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 relative lg:order-1">
                    {/* Column 1 */}
                    <div className="space-y-5">
                        {/* Card 1: Companies */}
                        <Link
                            href="/empresas"
                            className="bg-emerald-600 text-white p-6 rounded-[16px] shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group cursor-pointer relative overflow-hidden flex flex-col gap-2 bg-[url('https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=1770&auto=format&fit=crop')] bg-cover bg-center before:absolute before:inset-0 before:bg-emerald-600/90 before:z-0 min-h-[180px]"
                        >
                            <div className="relative z-10 flex flex-col items-start gap-3">
                                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
                                    <Building2 className="w-5 h-5 text-white" />
                                </div>
                                <div className="space-y-1">
                                    <h4 className="font-black text-lg leading-tight text-white tracking-normal" suppressHydrationWarning>
                                        <span>{counts.empresas > 0 ? `${counts.empresas} ` : ''}</span>
                                        {t.rich('cards.companies.title', richHandlers)}
                                    </h4>
                                    <p className="text-emerald-50 text-[10px] uppercase font-bold tracking-wider flex items-center gap-2 group-hover:gap-3 transition-all">
                                        {t('cards.companies.link')} <ArrowRight className="w-3 h-3" />
                                    </p>
                                </div>
                            </div>
                            <div className="absolute right-0 bottom-0 opacity-10 group-hover:scale-125 transition-transform duration-500 z-0">
                                <Building2 className="w-24 h-24 text-white" />
                            </div>
                        </Link>

                        {/* Card 3: Professionals */}
                        <Link
                            href="/repositorio/profissionais"
                            className="bg-white p-6 rounded-[16px] shadow-md border border-slate-100 hover:border-[#f97316]/30 transition-all duration-300 hover:-translate-y-1 group cursor-pointer flex flex-col gap-2 min-h-[180px]"
                        >
                            <div className="relative z-10 flex flex-col items-start gap-3">
                                <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center mb-3 transition-transform group-hover:rotate-12">
                                    <Users className="w-5 h-5 text-[#f97316]" />
                                </div>
                                <div className="space-y-1">
                                    <h4 className="font-black text-slate-600 text-lg leading-tight tracking-normal" suppressHydrationWarning>
                                        <span>{counts.profissionais > 0 ? `${counts.profissionais} ` : ''}</span>
                                        {t.rich('cards.professionals.title', richHandlers)}
                                    </h4>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider group-hover:text-[#f97316] transition-colors flex items-center gap-2">
                                        {t('cards.professionals.link')} <ArrowRight className="w-3 h-3" />
                                    </p>
                                </div>
                            </div>
                        </Link>
                    </div>

                    {/* Column 2 - Normal alignment */}
                    <div className="space-y-5">
                        {/* Card 2: Properties */}
                        <Link
                            href="/propriedades"
                            className="bg-white p-6 rounded-[16px] shadow-md border border-slate-100 hover:border-[#f97316]/30 transition-all duration-300 hover:-translate-y-1 group cursor-pointer flex flex-col gap-2 min-h-[180px]"
                        >
                            <div className="relative z-10 flex flex-col items-start gap-3">
                                <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center mb-3 transition-transform group-hover:rotate-12">
                                    <Tractor className="w-5 h-5 text-[#f97316]" />
                                </div>
                                <div className="space-y-1">
                                    <h4 className="font-black text-slate-600 text-lg leading-tight tracking-normal" suppressHydrationWarning>
                                        <span>{counts.propriedades > 0 ? `${counts.propriedades} ` : ''}</span>
                                        {t.rich('cards.properties.title', richHandlers)}
                                    </h4>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider group-hover:text-[#f97316] transition-colors flex items-center gap-2">
                                        {t('cards.properties.link')} <ArrowRight className="w-3 h-3" />
                                    </p>
                                </div>
                            </div>
                        </Link>

                        {/* Card 4: Products */}
                        <Link
                            href="/produtos"
                            className="bg-[#f97316] text-white p-6 rounded-[16px] shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group cursor-pointer relative overflow-hidden flex flex-col gap-2 bg-[url('https://images.unsplash.com/photo-1625246333195-bf791369018e?q=80&w=1770&auto=format&fit=crop')] bg-cover bg-center before:absolute before:inset-0 before:bg-[#f97316]/90 before:z-0 min-h-[180px]"
                        >
                            <div className="relative z-10 flex flex-col items-start gap-3">
                                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
                                    <ShoppingBag className="w-5 h-5 text-white" />
                                </div>
                                <div className="space-y-1">
                                    <h4 className="font-black text-lg leading-tight text-white tracking-normal" suppressHydrationWarning>
                                        <span>{counts.produtos > 0 ? `${counts.produtos} ` : ''}</span>
                                        {t.rich('cards.products.title', richHandlers)}
                                    </h4>
                                    <p className="text-orange-50 text-[10px] uppercase font-bold tracking-wider flex items-center gap-2 group-hover:gap-3 transition-all">
                                        {t('cards.products.link')} <ArrowRight className="w-3 h-3" />
                                    </p>
                                </div>
                            </div>
                            <div className="absolute right-0 bottom-0 opacity-10 group-hover:rotate-12 transition-transform duration-500 z-0">
                                <ShoppingBag className="w-24 h-24 text-white" />
                            </div>
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
}
