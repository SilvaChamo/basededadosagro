"use client";

import { PageHeader } from "@/components/PageHeader";
import { MarketStatsStrip } from "@/components/MarketStatsStrip";
import { Handshake, TrendingUp, Eye, Globe, Target, Briefcase, Building2, Mail, Phone, User } from "lucide-react";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import { useLanguage } from "@/contexts/LanguageContext";
import { useState } from "react";

export default function ParceriaPage() {
    const { t } = useLanguage();
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Anti-spam states
    const [honeypot, setHoneypot] = useState("");
    const [formLoadTime] = useState(Date.now());

    const handleSubmit = (e: React.FormEvent) => {
        // Anti-spam checks
        if (honeypot) {
            e.preventDefault();
            console.warn("Spam detected: honeypot filled");
            return;
        }

        const timeTaken = Date.now() - formLoadTime;
        if (timeTaken < 5000) {
            e.preventDefault();
            console.warn("Spam detected: submitted too quickly", timeTaken);
            alert("Por favor, preencha o formulário com calma.");
            return;
        }

        if (isSubmitting) {
            e.preventDefault();
            return;
        }
        setIsSubmitting(true);
        // Anti-rebound: disable for 3 seconds
        setTimeout(() => setIsSubmitting(false), 3000);
    };

    return (
        <main className="min-h-screen bg-slate-50">
            <PageHeader
                title={<>{t('parceria.header_title')} <span className="text-[#f97316]">{t('parceria.header_span')}</span></>}
                icon={Handshake}
                backgroundImage="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?q=80&w=2000&auto=format&fit=crop"
                breadcrumbs={[
                    { label: t('common.home'), href: "/" },
                    { label: t('parceria.header_span'), href: undefined }
                ]}
            />

            {/* 1. Crescemos Juntos */}
            <section className="bg-white py-[100px] overflow-hidden relative border-b border-slate-100">
                {/* Background Image with 10% opacity */}
                <div className="absolute inset-0 z-0 pointer-events-none">
                    <img
                        src="/images/markets/choppies_bg.png"
                        alt="Background"
                        className="w-full h-full object-cover opacity-[0.10]"
                    />
                </div>

                <div className="container-site relative z-10">
                    <div className="grid lg:grid-cols-2 gap-16 lg:gap-12 items-center">
                        {/* Left Column: Image */}
                        <div className="relative h-[450px] rounded-[20px] overflow-hidden shadow-2xl group">
                            <div className="absolute inset-0 bg-slate-900/10 group-hover:bg-slate-900/0 transition-colors duration-500 z-10"></div>
                            <img
                                src="/assets/parceira.webp"
                                alt="Parceria Base Agro Data"
                                className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
                            />
                            {/* Decorative element */}
                            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-[#f97316]/20 rounded-full blur-2xl z-20"></div>
                            <div className="absolute top-10 right-10 w-20 h-20 bg-emerald-500/20 rounded-full blur-xl z-20"></div>
                        </div>

                        {/* Right Column: Text Content */}
                        <div className="space-y-8 animate-in fade-in slide-in-from-right-8 duration-700">
                            <div className="space-y-4">
                                <h2 className="text-[28px] md:text-[45px] font-[900] text-slate-700 leading-[1.1] tracking-tight">
                                    {t('parceria.intro_title')} <br />
                                    {t('parceria.intro_subtitle').split(' ').slice(0, -1).join(' ')} <span className="text-emerald-600">{t('parceria.intro_subtitle').split(' ').slice(-1)}</span>
                                </h2>
                                <p className="text-slate-600 text-[15px] leading-snug font-medium mb-12">
                                    {t('parceria.intro_text')}
                                </p>
                            </div>

                            <div className="space-y-6">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                    <div className="flex gap-3 group sm:border-r sm:border-slate-200 sm:pr-5">
                                        <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center shrink-0 transition-transform group-hover:scale-110 duration-300">
                                            <Eye className="w-5 h-5 text-[#f97316]" />
                                        </div>
                                        <div>
                                            <h3 className="text-base font-bold text-slate-700">{t('parceria.feature1_title')}</h3>
                                            <p className="text-slate-500 text-sm mt-0.5">{t('parceria.feature1_description')}</p>
                                        </div>
                                    </div>

                                    <div className="flex gap-3 group">
                                        <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center shrink-0 transition-transform group-hover:scale-110 duration-300">
                                            <Globe className="w-5 h-5 text-emerald-600" />
                                        </div>
                                        <div>
                                            <h3 className="text-base font-bold text-slate-700">{t('parceria.feature2_title')}</h3>
                                            <p className="text-slate-500 text-sm mt-0.5">{t('parceria.feature2_description')}</p>
                                        </div>
                                    </div>

                                    <div className="flex gap-3 group sm:border-r sm:border-slate-200 sm:pr-5">
                                        <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center shrink-0 transition-transform group-hover:scale-110 duration-300">
                                            <TrendingUp className="w-5 h-5 text-blue-600" />
                                        </div>
                                        <div>
                                            <h3 className="text-base font-bold text-slate-700">{t('parceria.feature3_title')}</h3>
                                            <p className="text-slate-500 text-sm mt-0.5">{t('parceria.feature3_description')}</p>
                                        </div>
                                    </div>

                                    <div className="flex gap-3 group">
                                        <div className="w-10 h-10 rounded-full bg-yellow-50 flex items-center justify-center shrink-0 transition-transform group-hover:scale-110 duration-300">
                                            <Briefcase className="w-5 h-5 text-yellow-600" />
                                        </div>
                                        <div>
                                            <h3 className="text-base font-bold text-slate-700">{t('parceria.feature4_title')}</h3>
                                            <p className="text-slate-500 text-sm mt-0.5">{t('parceria.feature4_description')}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 1.5. Market Position Stats Strip */}
            <MarketStatsStrip />

            {/* 2. Quem procuramos (Full Width Section) */}
            <section id="secao-parceria" className="w-full bg-white py-24 border-y border-slate-100 scroll-mt-20 relative overflow-hidden group">
                {/* Background Image Overlay - Blurred and Transparent */}
                <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
                    <img
                        src="/assets/parceira.webp"
                        alt="Background Decor"
                        className="w-full h-full object-cover opacity-10 blur-3xl scale-110"
                    />
                </div>

                {/* Standardized Dynamic Background (Floating Blobs) */}
                <div className="absolute top-[-10%] left-[-5%] w-[400px] h-[400px] bg-emerald-100/40 rounded-full blur-[100px] group-hover:translate-x-10 group-hover:translate-y-10 transition-transform duration-[5000ms] ease-out pointer-events-none z-0"></div>
                <div className="absolute bottom-[-10%] right-[-5%] w-[500px] h-[500px] bg-emerald-100/40 rounded-full blur-[120px] group-hover:-translate-x-16 group-hover:-translate-y-16 transition-transform duration-[7000ms] ease-out pointer-events-none z-0"></div>
                <div className="absolute top-[30%] left-[30%] -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-orange-100/40 rounded-full blur-[100px] group-hover:scale-110 transition-transform duration-[6000ms] ease-out pointer-events-none z-0"></div>
                <div className="container-site relative z-10">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
                        <div className="z-10">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-10 h-[1.5px] bg-[#f97316]"></div>
                                <span className="text-[#f97316] font-bold text-xs uppercase tracking-wider">Para uma parceria solida</span>
                            </div>

                            <h3 className="text-[28px] md:text-[45px] font-[900] text-slate-700 leading-[1.1] tracking-tight mb-2">
                                {t('parceria.who_title').split(' ')[0]} <span className="text-emerald-600">{t('parceria.who_title').split(' ')[1]}</span>
                            </h3>
                            <p className="text-slate-600 mb-6 text-[15px] leading-snug font-medium max-w-xl">
                                {t('parceria.who_text')}
                            </p>
                            <ul className="grid grid-cols-2 gap-4">
                                <li className="flex items-center gap-3 bg-slate-50 p-3 rounded-md shadow-sm border border-slate-100 hover:border-orange-200 transition-all group overflow-hidden">
                                    <div className="w-1 h-8 bg-orange-500 rounded-full group-hover:scale-y-110 transition-transform"></div>
                                    <h4 className="font-bold text-slate-700 text-sm">{t('parceria.who_item1_title')}</h4>
                                </li>
                                <li className="flex items-center gap-3 bg-slate-50 p-3 rounded-md shadow-sm border border-slate-100 hover:border-emerald-200 transition-all group overflow-hidden">
                                    <div className="w-1 h-8 bg-emerald-500 rounded-full group-hover:scale-y-110 transition-transform"></div>
                                    <h4 className="font-bold text-slate-700 text-sm">{t('parceria.who_item2_title')}</h4>
                                </li>
                                <li className="flex items-center gap-3 bg-slate-50 p-3 rounded-md shadow-sm border border-slate-100 hover:border-teal-200 transition-all group overflow-hidden">
                                    <div className="w-1 h-8 bg-teal-500 rounded-full group-hover:scale-y-110 transition-transform"></div>
                                    <h4 className="font-bold text-slate-700 text-sm">{t('parceria.who_item3_title')}</h4>
                                </li>
                                <li className="flex items-center gap-3 bg-slate-50 p-3 rounded-md shadow-sm border border-slate-100 hover:border-yellow-200 transition-all group overflow-hidden">
                                    <div className="w-1 h-8 bg-yellow-500 rounded-full group-hover:scale-y-110 transition-transform"></div>
                                    <h4 className="font-bold text-slate-700 text-sm">{t('parceria.who_item4_title')}</h4>
                                </li>
                                <li className="flex items-center gap-3 bg-slate-50 p-3 rounded-md shadow-sm border border-slate-100 hover:border-emerald-300 transition-all group overflow-hidden">
                                    <div className="w-1 h-8 bg-emerald-600 rounded-full group-hover:scale-y-110 transition-transform"></div>
                                    <h4 className="font-bold text-slate-700 text-sm">{t('parceria.who_item5_title')}</h4>
                                </li>
                                <li className="flex items-center gap-3 bg-slate-50 p-3 rounded-md shadow-sm border border-slate-100 hover:border-orange-300 transition-all group overflow-hidden">
                                    <div className="w-1 h-8 bg-orange-600 rounded-full group-hover:scale-y-110 transition-transform"></div>
                                    <h4 className="font-bold text-slate-700 text-sm">{t('parceria.who_item6_title')}</h4>
                                </li>
                            </ul>
                        </div>
                        <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-amber-500 transform rotate-3 rounded-2xl opacity-20 blur-lg"></div>
                            <div id="parceria-form-container" className="bg-white rounded-[20px] shadow-[0_20px_50px_rgba(0,0,0,0.1)] relative border border-slate-100 overflow-hidden">
                                <div className="p-8 pb-4 text-left">
                                    <h4 className="text-[25px] font-black text-black/70 mb-1">
                                        Quer ser um <span className="text-[#f97316]">parceiro</span>?
                                    </h4>
                                    <p className="text-black/60 text-[15px] font-medium leading-relaxed">
                                        Envie nos a sua manifestação de interesse preenchendo o formulário abaixo, a nossa equipa entrará em contacto com sigo em breve.
                                    </p>
                                </div>

                                <form id="parceria-form" className="p-8 pt-4 space-y-4 flex flex-col items-start" action="mailto:geral@basededadosagro.com" method="POST" encType="text/plain" onSubmit={handleSubmit}>

                                    {/* Honeypot field - hidden from users, visible to bots */}
                                    <div className="absolute -left-[9999px] opacity-0 pointer-events-none" aria-hidden="true">
                                        <label htmlFor="website_url">Website</label>
                                        <input
                                            type="text"
                                            id="website_url"
                                            name="website_url"
                                            tabIndex={-1}
                                            autoComplete="off"
                                            value={honeypot}
                                            onChange={(e) => setHoneypot(e.target.value)}
                                        />
                                    </div>
                                    <div className="relative w-full">
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        <input
                                            type="text"
                                            name="nome_contato"
                                            className="w-full bg-slate-50 border border-slate-200 rounded-[10px] pl-11 pr-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-[#f97316]/20 focus:border-[#f97316] transition-all font-bold text-[13px] text-slate-700 placeholder:text-slate-400 placeholder:font-medium"
                                            placeholder="Nome Completo"
                                            required
                                        />
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                                        <div className="relative w-full">
                                            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                            <input
                                                type="tel"
                                                name="telefone"
                                                className="w-full bg-slate-50 border border-slate-200 rounded-[10px] pl-11 pr-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-[#f97316]/20 focus:border-[#f97316] transition-all font-bold text-[13px] text-slate-700 placeholder:text-slate-400 placeholder:font-medium"
                                                placeholder="Número de Telefone"
                                                required
                                            />
                                        </div>
                                        <div className="relative w-full">
                                            <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                            <input
                                                type="text"
                                                name="cargo"
                                                className="w-full bg-slate-50 border border-slate-200 rounded-[10px] pl-11 pr-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-[#f97316]/20 focus:border-[#f97316] transition-all font-bold text-[13px] text-slate-700 placeholder:text-slate-400 placeholder:font-medium"
                                                placeholder="Seu Cargo / Função"
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="relative w-full">
                                        <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        <input
                                            type="text"
                                            name="empresa"
                                            className="w-full bg-slate-50 border border-slate-200 rounded-[10px] pl-11 pr-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-[#f97316]/20 focus:border-[#f97316] transition-all font-bold text-[13px] text-slate-700 placeholder:text-slate-400 placeholder:font-medium"
                                            placeholder={t('parceria.form_name')}
                                            required
                                        />
                                    </div>
                                    <div className="relative w-full">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        <input
                                            type="email"
                                            name="email"
                                            className="w-full bg-slate-50 border border-slate-200 rounded-[10px] pl-11 pr-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-[#f97316]/20 focus:border-[#f97316] transition-all font-bold text-[13px] text-slate-700 placeholder:text-slate-400 placeholder:font-medium"
                                            placeholder={t('parceria.form_email')}
                                            required
                                        />
                                    </div>
                                    <div className="relative w-full">
                                        <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        <select
                                            name="categoria"
                                            className="w-full bg-slate-50 border border-slate-200 rounded-[10px] pl-11 pr-10 py-3.5 focus:outline-none focus:ring-2 focus:ring-[#f97316]/20 focus:border-[#f97316] transition-all font-bold text-[14px] text-slate-600 appearance-none"
                                            required
                                            defaultValue=""
                                        >
                                            <option value="" disabled>{t('parceria.form_category')}</option>
                                            <option value="insumos">Fornecedor de Insumos</option>
                                            <option value="tecnologia">Tecnologia e Inovação</option>
                                            <option value="financeiro">Instituição Financeira / Crédito</option>
                                            <option value="logistica">Escoamento e Logística</option>
                                            <option value="ong">ONG / Projecto de Desenvolvimento</option>
                                            <option value="consultoria">Consultoria e Assistência Técnica</option>
                                            <option value="outro">Outra Categoria</option>
                                        </select>
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                                            <div className="w-1.5 h-1.5 border-r-2 border-b-2 border-slate-400 rotate-45" />
                                        </div>
                                    </div>
                                    <div className="relative w-full">
                                        <textarea
                                            name="mensagem"
                                            className="w-full bg-slate-50 border border-slate-200 rounded-[10px] px-5 py-4 focus:outline-none focus:ring-2 focus:ring-[#f97316]/20 focus:border-[#f97316] transition-all font-medium text-[13px] h-32 resize-none text-slate-700 placeholder:text-slate-400"
                                            placeholder={t('parceria.form_message')}
                                            required
                                        ></textarea>
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className={`py-3.5 px-8 text-white font-bold uppercase tracking-wider text-xs rounded-[10px] transition-all duration-300 shadow-lg active:scale-95 flex items-center justify-center gap-2 group ${isSubmitting ? 'bg-slate-400 cursor-not-allowed' : 'bg-emerald-600 hover:bg-[#f97316]'}`}
                                    >
                                        {isSubmitting ? t('common.loading') : t('parceria.form_submit')}
                                        <TrendingUp className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                                    </button>

                                    {/* Bottom Orange Decoration */}
                                    <div className="absolute bottom-0 left-0 w-full h-[5px] bg-[#f97316] z-10 opacity-20" />
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Container 2: Premium Partners */}
            <div className="container-site relative z-20 py-24">
                {/* 3. Premium Partners Section */}
                <section>
                    <div className="text-center mb-10 overflow-hidden">
                        <div className="flex items-center justify-center gap-4 mb-3">
                            <div className="w-10 h-[1.5px] bg-[#f97316]"></div>
                            <span className="text-[#f97316] font-bold text-sm uppercase tracking-[0.3em]">Nossos</span>
                            <div className="w-10 h-[1.5px] bg-[#f97316]"></div>
                        </div>
                        <h2 className="text-[28px] md:text-[45px] font-[900] text-slate-700 leading-[1.1] tracking-tight mb-4">
                            {t('parceria.premium_partners').split(' ')[0]} <span className="text-[#f97316]">{t('parceria.premium_partners').split(' ')[1]}</span>
                        </h2>
                        <p className="text-slate-500 text-[15px] leading-snug font-medium max-w-2xl mx-auto">
                            {t('parceria.premium_text')}
                        </p>
                    </div>

                    <div className="relative">
                        <Carousel
                            opts={{
                                align: "start",
                                loop: true,
                            }}
                            plugins={[
                                Autoplay({
                                    delay: 4000,
                                })
                            ]}
                            className="w-full"
                        >
                            <CarouselContent className="-ml-4">
                                {/* Partner 1 */}
                                <CarouselItem className="pl-4 md:basis-1/2 lg:basis-1/4">
                                    <div className="bg-white border border-slate-200 rounded-lg p-6 flex flex-col items-center justify-center text-center gap-4 hover:border-orange-200 hover:shadow-lg transition-all group cursor-pointer h-full">
                                        <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                            <Globe className="w-8 h-8 text-blue-500" />
                                        </div>
                                        <div>
                                            <h3 className="text-slate-800 font-bold text-lg">TechnoServe</h3>
                                            <p className="text-slate-500 text-xs mt-1 leading-relaxed">{t('parceria.partner1_description')}</p>
                                        </div>
                                    </div>
                                </CarouselItem>

                                {/* Partner 2 */}
                                <CarouselItem className="pl-4 md:basis-1/2 lg:basis-1/4">
                                    <div className="bg-white border border-slate-200 rounded-lg p-6 flex flex-col items-center justify-center text-center gap-4 hover:border-cyan-200 hover:shadow-lg transition-all group cursor-pointer h-full">
                                        <div className="w-16 h-16 rounded-full bg-cyan-50 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                            <Target className="w-8 h-8 text-cyan-500" />
                                        </div>
                                        <div>
                                            <h3 className="text-slate-800 font-bold text-lg">FAO</h3>
                                            <p className="text-slate-500 text-xs mt-1 leading-relaxed">{t('parceria.partner2_description')}</p>
                                        </div>
                                    </div>
                                </CarouselItem>


                                {/* Partner 3 */}
                                <CarouselItem className="pl-4 md:basis-1/2 lg:basis-1/4">
                                    <div className="bg-white border border-slate-200 rounded-lg p-6 flex flex-col items-center justify-center text-center gap-4 hover:border-blue-200 hover:shadow-lg transition-all group cursor-pointer h-full">
                                        <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center group-hover:scale-110 duration-300">
                                            <Briefcase className="w-8 h-8 text-blue-600" />
                                        </div>
                                        <div>
                                            <h3 className="text-slate-800 font-bold text-lg">Banco Mundial</h3>
                                            <p className="text-slate-500 text-xs mt-1 leading-relaxed">{t('parceria.partner3_description')}</p>
                                        </div>
                                    </div>
                                </CarouselItem>

                                {/* Partner 4 */}
                                <CarouselItem className="pl-4 md:basis-1/2 lg:basis-1/4">
                                    <div className="bg-white border border-slate-200 rounded-lg p-6 flex flex-col items-center justify-center text-center gap-4 hover:border-indigo-200 hover:shadow-lg transition-all group cursor-pointer h-full">
                                        <div className="w-16 h-16 rounded-full bg-indigo-50 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                            <TrendingUp className="w-8 h-8 text-indigo-500" />
                                        </div>
                                        <div>
                                            <h3 className="text-slate-800 font-bold text-lg">Standard Bank</h3>
                                            <p className="text-slate-500 text-xs mt-1 leading-relaxed">{t('parceria.partner4_description')}</p>
                                        </div>
                                    </div>
                                </CarouselItem>

                                {/* Duplicate for Loop Effect (or realistic additional partners) */}
                                <CarouselItem className="pl-4 md:basis-1/2 lg:basis-1/4">
                                    <div className="bg-white border border-slate-200 rounded-lg p-6 flex flex-col items-center justify-center text-center gap-4 hover:border-green-200 hover:shadow-lg transition-all group cursor-pointer h-full">
                                        <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                            <Globe className="w-8 h-8 text-green-600" />
                                        </div>
                                        <div>
                                            <h3 className="text-slate-800 font-bold text-lg">AgroGlobal</h3>
                                            <p className="text-slate-500 text-xs mt-1 leading-relaxed">{t('parceria.partner5_description')}</p>
                                        </div>
                                    </div>
                                </CarouselItem>
                            </CarouselContent>
                            <CarouselPrevious />
                            <CarouselNext />
                        </Carousel>
                    </div>
                </section>
            </div>
        </main>
    );
}
