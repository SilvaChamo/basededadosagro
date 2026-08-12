"use client";

import React, { useState, useEffect, useRef } from "react";
import {
    Zap,
    MessageSquare,
    Share2,
    Search,
    ScanLine,
    Smartphone,
    Globe,
    QrCode,
    BarChart3,
    ShieldCheck,
    Mail,
    BookOpen,
    Library,
    GraduationCap,
    Filter,
    Brain,
    ChevronDown
} from "lucide-react";
import Link from "next/link";

export default function InovacaoPage() {
    const [isSticky, setIsSticky] = useState(false);
    const [scrollY, setScrollY] = useState(0);
    const heroRef = useRef<HTMLDivElement>(null);
    const section4Ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleScroll = () => {
            setScrollY(window.scrollY);

            if (!heroRef.current) return;
            const rect = heroRef.current.getBoundingClientRect();
            // 72px is the navbar height
            if (rect.bottom <= 72) {
                setIsSticky(true);
            } else {
                setIsSticky(false);
            }
        };

        window.addEventListener("scroll", handleScroll, { passive: true });
        handleScroll();
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <main className="min-h-screen bg-white overflow-x-hidden">
            {/* 1. Hero Section */}
            <section ref={heroRef} className="pt-32 pb-20 bg-white relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('/images/markets/choppies_bg.png')] opacity-10 bg-cover bg-center pointer-events-none"></div>
                <div className="absolute top-0 right-0 w-1/3 h-full bg-emerald-50/50 -skew-x-12 translate-x-1/4 pointer-events-none"></div>
                <div className="container-site relative z-10">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <div>
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#f97316]/10 border border-[#f97316]/20 mb-6">
                                <span className="w-2 h-2 rounded-full bg-[#f97316] animate-pulse"></span>
                                <span className="text-xs font-bold uppercase tracking-widest text-orange-700">Diferencial Base Agro Data</span>
                            </div>

                            <h1 className="text-[45px] font-[900] text-slate-800 mb-6 tracking-tight leading-tight">
                                O Futuro da Agricultura é <br />
                                <span className="text-emerald-600">Digital e Conectado</span>
                            </h1>

                            <p className="text-lg text-slate-600 leading-relaxed max-w-2xl font-medium">
                                Não somos apenas um diretório. Somos uma plataforma tecnológica avançada que coloca ferramentas de
                                <span className="text-[#f97316] font-bold"> última geração</span> nas mãos dos produtores e empresários moçambicanos.
                            </p>
                        </div>

                        {/* Right Column: Hero Mockup */}
                        <div className="relative flex justify-center lg:justify-end">
                            <div className="relative group">
                                {/* Glow Effect */}
                                <div className="absolute inset-0 bg-emerald-500/20 blur-[100px] rounded-full scale-110 opacity-50 group-hover:opacity-100 transition-opacity"></div>

                                {/* Realistic Phone Mockup */}
                                <div className="relative z-10 w-[240px] md:w-[320px] bg-slate-900 rounded-[32px] p-[6px] shadow-2xl ring-1 ring-white/10 transform rotate-[-2deg] transition-transform duration-700">
                                    <div className="relative w-full h-full bg-black rounded-[28px] overflow-hidden border-[2px] border-slate-800">
                                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[90px] h-[24px] bg-black z-20 rounded-b-[16px]"></div>
                                        <img
                                            src="/assets/botanica.webp"
                                            alt="Base Agro Data Innovation"
                                            className="w-full h-auto object-cover opacity-90 group-hover:opacity-100 transition-opacity"
                                        />
                                    </div>

                                    {/* Side Buttons */}
                                    {/* Right Side: Power Button */}
                                    <div className="absolute top-32 -right-[2px] w-[3px] h-12 bg-black rounded-r-md shadow-sm border-r border-slate-900"></div>

                                    {/* Left Side: Volume Buttons */}
                                    <div className="absolute top-24 -left-[2px] w-[3px] h-10 bg-black rounded-l-md shadow-sm border-l border-slate-900"></div>
                                    <div className="absolute top-36 -left-[2px] w-[3px] h-10 bg-black rounded-l-md shadow-sm border-l border-slate-900"></div>
                                </div>

                                {/* Floating Badge */}
                                <div className="absolute -bottom-4 -left-12 bg-[#f97316] p-4 rounded-2xl shadow-2xl transform rotate-[6deg] z-20 shadow-orange-500/30">
                                    <p className="text-white font-black text-[10px] uppercase tracking-tighter mb-0.5">Tecnologia</p>
                                    <p className="text-white font-[900] text-lg">PROATIVA</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sticky Orange Line */}
                <div
                    key={isSticky ? 'sticky' : 'static'}
                    className={`w-full left-0 z-30 pointer-events-none transition-all duration-300 ${isSticky
                        ? "fixed top-[64px] md:top-[72px]"
                        : "absolute bottom-0"
                        }`}
                >
                    <div className="container-site">
                        <div className={`w-full h-[6px] bg-[#f97316] ${isSticky ? '' : 'shadow-[0_0_15px_rgba(249,115,22,0.4)]'}`} />
                    </div>
                </div>
            </section>

            {/* 2. Communication System (SMS/Email) */}
            <section className="py-24 bg-slate-900 text-white relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1556761175-5973dc0f32e7?q=80&w=2000&auto=format&fit=crop')] opacity-20 bg-cover bg-center bg-fixed mix-blend-overlay scale-110"></div>
                <div className="container-site relative z-10">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <div>
                            <div className="w-16 h-16 bg-emerald-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-emerald-500/20">
                                <MessageSquare className="w-8 h-8 text-white" />
                            </div>
                            <h2 className="text-[45px] font-[900] text-white mb-6 leading-tight tracking-tight">
                                Comunicação <span className="text-[#f97316]">Direta e Massiva</span>
                            </h2>
                            <p className="text-slate-300 text-lg leading-relaxed mb-8 font-medium">
                                Alcance o seu público-alvo instantaneamente. O nosso sistema integrado de
                                <span className="text-white font-bold"> SMS e E-mail Marketing </span>
                                permite que parceiros e administradores enviem e recebam alertas, promoções e informações técnicas diretamente para os telemóveis dos produtores, mesmo nas zonas mais remotas.
                            </p>
                            <ul className="space-y-4">
                                <li className="flex items-center gap-3">
                                    <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center">
                                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                                    </div>
                                    <span className="text-slate-200">Segmentação por perfil (Produtores, Profissionais)</span>
                                </li>
                                <li className="flex items-center gap-3">
                                    <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center">
                                        <Zap className="w-3.5 h-3.5 text-emerald-400" />
                                    </div>
                                    <span className="text-slate-200">Entrega imediata com alta taxa de abertura</span>
                                </li>
                                <li className="flex items-center gap-3">
                                    <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center">
                                        <Globe className="w-3.5 h-3.5 text-emerald-400" />
                                    </div>
                                    <span className="text-slate-200">Cobertura nacional em todas as redes</span>
                                </li>
                            </ul>
                        </div>
                        <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-[#f97316] rounded-2xl blur-2xl opacity-30 transform rotate-3"></div>
                            <div className="relative bg-slate-800 border border-slate-700 rounded-2xl p-8 shadow-2xl">
                                {/* Mock UI for SMS */}
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3 border-b border-slate-700 pb-4">
                                        <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center">
                                            <Mail className="w-5 h-5 text-slate-400" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-slate-400 uppercase font-bold">Nova Campanha</p>
                                            <p className="text-white font-bold">Oportunidade de Negócio - Exportação</p>
                                        </div>
                                    </div>
                                    <div className="bg-slate-900 rounded-lg p-4 border border-slate-700">
                                        <p className="text-slate-300 text-sm font-mono">
                                            "DISPONÍVEL: 50 Toneladas de Castanha de Caju em Nampula. Qualidade Premium. Entre em contacto diretamente com o produtor pelos contactos: +258 84 990 1234 Sr. Mussa (Nampula). Negocie direto!"
                                        </p>
                                    </div>
                                    <div className="flex justify-between items-center text-xs text-slate-500 font-mono">
                                        <span>Destinatários: 12.450 Produtores</span>
                                        <span className="text-emerald-400">Enviado com sucesso ✓</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 3. SEO & Google Indexing */}
            <section className="py-24 bg-white relative overflow-hidden">
                {/* Dynamic Background Bubbles - Google Colors & Bouncing */}
                <div className="absolute top-10 left-10 w-64 h-64 bg-[#4285F4]/15 rounded-full blur-[80px] animate-google-bounce-1 pointer-events-none"></div>
                <div className="absolute top-1/2 right-10 w-72 h-72 bg-[#EA4335]/15 rounded-full blur-[90px] animate-google-bounce-2 pointer-events-none"></div>
                <div className="absolute bottom-10 left-1/3 w-80 h-80 bg-[#FBBC05]/15 rounded-full blur-[100px] animate-google-bounce-3 pointer-events-none"></div>
                <div className="absolute top-1/4 right-1/4 w-56 h-56 bg-[#34A853]/15 rounded-full blur-[70px] animate-google-bounce-4 pointer-events-none"></div>

                <div className="container-site relative z-10">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <div className="order-2 lg:order-1 relative">
                            {/* Illustration/Mockup - Animated */}
                            <div className="relative bg-white border border-slate-200 rounded-none p-6 shadow-xl max-w-md mx-auto transform hover:scale-105 transition-all duration-500 animate-float">
                                <div className="flex items-center gap-2 mb-4">
                                    <div className="flex gap-1">
                                        <div className="w-3 h-3 rounded-full bg-red-400"></div>
                                        <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                                        <div className="w-3 h-3 rounded-full bg-green-400"></div>
                                    </div>
                                    <div className="flex-1 bg-slate-100 rounded-full h-8 flex items-center px-3">
                                        <Search className="w-4 h-4 text-slate-400 mr-2" />
                                        <span className="text-xs text-slate-500 pr-1 animate-typing-pulse">fornecedor de sementes maputo</span>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div className="font-sans">
                                        <p className="text-emerald-600 text-lg hover:underline cursor-pointer">Sementes de Qualidade Lda - Base de Dados Agro</p>
                                        <p className="text-emerald-700 text-sm flex items-center gap-1">
                                            https://www.basededadosagro.com/empresas/sementes-qualidade
                                            <span className="text-slate-400">▼</span>
                                        </p>
                                        <p className="text-slate-600 text-sm mt-1">
                                            Encontre as melhores sementes certificadas em Maputo. Catálogo completo, contactos e localização...
                                        </p>
                                    </div>
                                    <div className="bg-slate-50 p-3 rounded border border-slate-100">
                                        <p className="text-xs text-slate-400">Outros resultados...</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="order-1 lg:order-2">
                            <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mb-6 border border-emerald-100">
                                <Search className="w-8 h-8 text-emerald-600" />
                            </div>
                            <h2 className="text-[45px] font-[900] text-slate-800 mb-6 tracking-tight leading-tight">
                                Destaque no{" "}
                                <span className="inline-flex">
                                    <span className="text-[#4285F4]">G</span>
                                    <span className="text-[#EA4335]">o</span>
                                    <span className="text-[#FBBC05]">o</span>
                                    <span className="text-[#4285F4]">g</span>
                                    <span className="text-[#34A853]">l</span>
                                    <span className="text-[#EA4335]">e</span>
                                </span>{" "}
                                (SEO)
                            </h2>
                            <p className="text-slate-600 text-lg leading-relaxed mb-8 font-medium">
                                Não basta estar na internet, é preciso ser encontrado. A nossa plataforma está otimizada com as melhores práticas de
                                <span className="text-slate-900 font-bold"> SEO (Search Engine Optimization)</span>.
                                Ao registar a sua empresa, ela é automaticamente indexada pelos motores de busca, aparecendo nas pesquisas relevantes dos seus clientes.
                            </p>
                            <div className="flex flex-wrap gap-3">
                                <span className="px-4 py-2 bg-emerald-50 text-emerald-700 text-sm font-bold rounded-full border border-emerald-100">Indexação Automática</span>
                                <span className="px-4 py-2 bg-emerald-50 text-emerald-700 text-sm font-bold rounded-full border border-emerald-100">Palavras-chave Estratégicas</span>
                                <span className="px-4 py-2 bg-emerald-50 text-emerald-700 text-sm font-bold rounded-full border border-emerald-100">Autoridade de Domínio</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 4. Digital Profile & Sharing */}
            <section ref={section4Ref} className="py-[150px] bg-slate-950 text-white relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('/assets/african-man.jpg')] opacity-50 bg-cover bg-center bg-fixed pointer-events-none"></div>
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-950/60 via-slate-950/50 to-emerald-900/40 z-0"></div>
                <div className="container-site relative z-10">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <div>
                            <div className="w-16 h-16 bg-orange-50 rounded-2xl flex items-center justify-center mb-6 border border-orange-100">
                                <Share2 className="w-8 h-8 text-[#f97316]" />
                            </div>
                            <h2 className="text-[45px] font-[900] text-white mb-6 tracking-tight leading-tight">
                                Identidade Digital & <br /> <span className="text-[#f97316]">Partilha Inteligente</span>
                            </h2>
                            <p className="text-slate-300 text-lg leading-relaxed mb-8 font-medium">
                                Transforme o seu perfil na Base Agro Data no seu <span className="text-white font-bold">Cartão de Visita Digital</span>.
                                Partilhe o seu portfólio, produtos e contactos com um simples clique ou através de um QR Code exclusivo, ideal para imprimir em embalagens e cartões físicos.
                            </p>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/10 flex items-center gap-3">
                                    <QrCode className="w-8 h-8 text-white" />
                                    <div>
                                        <h4 className="font-bold text-white">QR Code</h4>
                                        <p className="text-xs text-slate-400">Para embalagens</p>
                                    </div>
                                </div>
                                <div className="bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/10 flex items-center gap-3">
                                    <Share2 className="w-8 h-8 text-[#f97316]" />
                                    <div>
                                        <h4 className="font-bold text-white">Social Share</h4>
                                        <p className="text-xs text-slate-400">WhatsApp / Facebook</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="relative">
                            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl border-4 border-white group">
                                <img
                                    src="/assets/african-man.jpg"
                                    alt="Identidade Digital - Base Agro Data"
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/20 to-transparent"></div>
                            </div>
                            {/* Decorative elements */}
                            <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-orange-500/10 rounded-full blur-2xl"></div>
                            <div className="absolute -top-6 -right-6 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl"></div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 5. Slide Presentations */}
            <section className="py-24 bg-white relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1/4 h-full bg-slate-50 -skew-x-12 -translate-x-1/2 pointer-events-none"></div>
                <div className="container-site relative z-10">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <div className="order-2 lg:order-1 relative">
                            {/* Mock UI for Slide Editor */}
                            <div className="relative bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-2xl overflow-hidden aspect-video">
                                <div className="flex items-center gap-2 mb-4 border-b border-slate-800 pb-2">
                                    <div className="w-3 h-3 rounded-full bg-red-500/50"></div>
                                    <div className="w-3 h-3 rounded-full bg-yellow-500/50"></div>
                                    <div className="w-3 h-3 rounded-full bg-emerald-500/50"></div>
                                    <span className="text-[10px] text-slate-500 font-mono ml-2">editor_de_apresentacoes.v1</span>
                                </div>
                                <div className="grid grid-cols-4 h-full gap-4">
                                    <div className="col-span-1 border-r border-slate-800 space-y-2 pr-2">
                                        <div className="h-16 bg-slate-800 rounded-lg border border-emerald-500/30 ring-1 ring-emerald-500/20"></div>
                                        <div className="h-16 bg-slate-800/50 rounded-lg border border-slate-700/50"></div>
                                        <div className="h-16 bg-slate-800/50 rounded-lg border border-slate-700/50"></div>
                                    </div>
                                    <div className="col-span-3 bg-slate-800 rounded-lg relative overflow-hidden flex items-center justify-center">
                                        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=1000&auto=format&fit=crop')] bg-cover bg-center opacity-40"></div>
                                        <div className="relative z-10 text-center space-y-2 p-4">
                                            <div className="h-2 w-20 bg-emerald-500 rounded mx-auto mb-1"></div>
                                            <p className="text-white font-black text-xl leading-tight">Catálogo de Sementes <br /> <span className="text-emerald-400">Moçambique 2026</span></p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            {/* Floating Tooltips */}
                            <div className="absolute -bottom-6 -right-6 bg-white p-4 rounded-xl shadow-xl border border-slate-100 hidden md:block">
                                <div className="flex items-center gap-3">
                                    <BarChart3 className="w-5 h-5 text-emerald-600" />
                                    <p className="text-sm font-bold text-slate-800">Exportação em PDF</p>
                                </div>
                            </div>
                        </div>
                        <div className="order-1 lg:order-2">
                            <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mb-6 border border-emerald-100">
                                <BarChart3 className="w-8 h-8 text-emerald-600" />
                            </div>
                            <h2 className="text-[45px] font-[900] text-slate-800 mb-6 tracking-tight leading-tight">
                                Apresentações <br /> <span className="text-emerald-600">Visuais Imbatíveis</span>
                            </h2>
                            <p className="text-slate-600 text-lg leading-relaxed mb-8 font-medium">
                                Crie catálogos de produtos, perfis de propriedades e relatórios técnicos profissionais em minutos.
                                O nosso editor intuitivo permite gerar <span className="text-slate-900 font-bold">slides interativos</span> prontos para reuniões com investidores ou feiras agrícolas.
                            </p>
                            <ul className="space-y-4">
                                <li className="flex items-center gap-3">
                                    <div className="w-6 h-6 rounded-full bg-emerald-500/10 flex items-center justify-center">
                                        <Smartphone className="w-3.5 h-3.5 text-emerald-600" />
                                    </div>
                                    <span className="text-slate-700 font-medium">Visualização perfeita em Mobile e Desktop</span>
                                </li>
                                <li className="flex items-center gap-3">
                                    <div className="w-6 h-6 rounded-full bg-emerald-500/10 flex items-center justify-center">
                                        <Globe className="w-3.5 h-3.5 text-emerald-600" />
                                    </div>
                                    <span className="text-slate-700 font-medium">Partilha fácil via link único</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            {/* 7. Scientific Articles Repository */}
            <section className="py-24 bg-slate-50 relative overflow-hidden">
                <div className="absolute bottom-0 right-0 w-1/4 h-1/2 bg-emerald-50/20 -skew-y-12 translate-y-1/2 pointer-events-none"></div>
                <div className="container-site relative z-10">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <div>
                            <div className="w-16 h-16 bg-orange-50 rounded-2xl flex items-center justify-center mb-6 border border-orange-100">
                                <Library className="w-8 h-8 text-[#f97316]" />
                            </div>
                            <h2 className="text-[45px] font-[900] text-slate-800 mb-6 tracking-tight leading-tight">
                                Repositório de <br /> <span className="text-emerald-600">Conhecimento Científico</span>
                            </h2>
                            <p className="text-slate-600 text-lg leading-relaxed mb-8 font-medium">
                                Muito mais que um simples motor de busca. Desenvolvemos uma tecnologia de <span className="text-slate-900 font-bold">pesquisa semântica e dinâmica</span> que conecta estudantes e investigadores moçambicanos à vanguarda do conhecimento global.
                            </p>

                            <div className="space-y-6">
                                <div className="flex items-start gap-4 p-4 rounded-xl hover:bg-white transition-all border border-transparent hover:border-slate-100 group">
                                    <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center shrink-0 group-hover:bg-[#f97316] group-hover:text-white transition-colors">
                                        <Globe className="w-5 h-5 text-[#f97316] group-hover:text-white" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-800">Varredura Global (Semantic Scholar)</h4>
                                        <p className="text-sm text-slate-500">Conexão direta com redes de inteligência científica mundial, trazendo os últimos papers e teses para o contexto nacional.</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4 p-4 rounded-xl bg-slate-100/50 border border-slate-200">
                                    <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shrink-0">
                                        <Brain className="w-5 h-5 text-slate-600" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-800">Busca Intuitiva vs. Automática</h4>
                                        <p className="text-sm text-slate-500 italic">Escolha entre o modo que aprende com a sua escrita ou a busca instantânea global.</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="relative">
                            {/* Mock UI for Article Search */}
                            <div className="bg-slate-50 rounded-2xl border border-slate-200 p-6 shadow-xl relative z-10">
                                <div className="flex flex-col gap-4">
                                    <div className="relative flex items-center bg-white border border-slate-200 rounded-lg overflow-hidden h-12">
                                        <Search className="absolute left-4 w-4 h-4 text-slate-400" />
                                        <div className="w-full py-3 pl-12 pr-28 text-sm text-slate-800">
                                            Melhoramento genético do milho...
                                        </div>
                                        {/* Mock Mode Selector */}
                                        <div className="absolute right-0 h-full flex items-center gap-2 px-3 bg-emerald-50 border-l border-emerald-100">
                                            <Zap className="w-3 h-3 text-emerald-600" />
                                            <span className="text-[9px] font-black uppercase text-emerald-700">Modo Automático</span>
                                            <ChevronDown className="w-3 h-3 text-emerald-400" />
                                        </div>
                                    </div>
                                    <div className="flex gap-2 mb-2">
                                        <div className="bg-emerald-100 text-emerald-700 px-3 py-1 transparent text-xs font-bold rounded-full border border-emerald-200 flex items-center gap-1">
                                            <Filter className="w-3 h-3" />
                                            Cultura: Milho
                                        </div>
                                        <div className="bg-slate-100 text-slate-500 px-3 py-1 transparent text-xs font-medium rounded-full border border-slate-200">
                                            Ano: 2024
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider animate-pulse mb-0">Varrendo bibliotecas globais...</p>
                                        {[1, 2].map((i) => (
                                            <div key={i} className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm hover:border-emerald-300 transition-colors group cursor-pointer">
                                                <div className="flex items-start gap-3">
                                                    <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center group-hover:bg-emerald-50">
                                                        <BookOpen className="w-4 h-4 text-slate-400 group-hover:text-emerald-500" />
                                                    </div>
                                                    <div>
                                                        <h5 className="text-sm font-bold text-slate-800 group-hover:text-emerald-600 transition-colors leading-tight">
                                                            {i === 1 ? "Maize Genetic Improvement in Low Rain Areas" : "Integrated Pest Management - 2024 Updates"}
                                                        </h5>
                                                        <p className="text-[10px] text-slate-400 mt-1 uppercase font-bold tracking-tight">Traduzido do Inglês • Disponível via Semantic Scholar</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            {/* Decorative elements */}
                            <div className="absolute -top-6 -right-6 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl"></div>
                            <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-orange-500/10 rounded-full blur-2xl"></div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 8. AgroBotanica Scanner */}
            <section className="py-24 bg-gradient-to-br from-[#022c22] via-[#043d30] to-[#022c22] text-white relative overflow-hidden">
                {/* Background Decor */}
                <div className="absolute top-0 right-0 w-1/2 h-full bg-emerald-900/20 -skew-x-12 translate-x-1/4 pointer-events-none"></div>
                <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none"></div>

                <div className="container-site relative z-10">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        {/* Left Column: Content */}
                        <div className="order-2 lg:order-1">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-800/50 border border-emerald-700/50 mb-6">
                                <ScanLine className="w-4 h-4 text-emerald-400" />
                                <span className="text-xs font-bold uppercase tracking-widest text-emerald-100">Engenharia Agronómica IA</span>
                            </div>
                            <h2 className="text-[45px] font-[900] text-white mb-6 tracking-tight leading-tight">
                                AgroBotanica <span className="text-emerald-400">Scanner</span>
                            </h2>
                            <p className="text-emerald-100/80 text-lg leading-relaxed font-medium mb-10">
                                Identifique pragas, doenças e carências nutricionais em segundos. A nossa IA avançada analisa imagens em tempo real para oferecer diagnósticos precisos e soluções imediatas.
                            </p>

                            <div className="space-y-6">
                                {[
                                    {
                                        title: "Diagnóstico Visual de Precisão",
                                        desc: "95% de precisão na identificação de patógenos através de análise de padrões celulares.",
                                        icon: <ScanLine className="w-6 h-6 text-emerald-400" />
                                    },
                                    {
                                        title: "Tratamento e Remediação",
                                        desc: "Sugestões de produtos e práticas culturais imediatas baseadas no diagnóstico.",
                                        icon: <ShieldCheck className="w-6 h-6 text-emerald-400" />
                                    },
                                    {
                                        title: "Modo Offline Inteligente",
                                        desc: "Funcione sem internet no campo. O sistema processa localmente e sincroniza depois.",
                                        icon: <Smartphone className="w-6 h-6 text-emerald-400" />
                                    }
                                ].map((item, idx) => (
                                    <div key={idx} className="flex gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                                        <div className="shrink-0 w-12 h-12 rounded-xl bg-emerald-900/50 flex items-center justify-center border border-emerald-700/50">
                                            {item.icon}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-white mb-1">{item.title}</h3>
                                            <p className="text-emerald-100/60 text-sm leading-relaxed">{item.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Right Column: Mobile Mockup */}
                        <div className="order-1 lg:order-2 flex justify-center lg:justify-end">
                            <div className="relative group">
                                {/* Glow Effect */}
                                <div className="absolute inset-0 bg-emerald-500/20 blur-[100px] rounded-full scale-110 opacity-50 group-hover:opacity-100 transition-opacity"></div>

                                {/* Realistic Phone Mockup - Optimized Size & Fixed Incline */}
                                <div className="relative z-10 w-[260px] md:w-[350px] bg-slate-900 rounded-[45px] p-[6px] shadow-2xl ring-1 ring-white/10 transform rotate-[2deg] transition-transform duration-700">
                                    <div className="relative w-full h-full bg-black rounded-[40px] overflow-hidden border-[2px] border-slate-800">
                                        {/* Notch */}
                                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[90px] h-[24px] bg-black z-20 rounded-b-[16px]"></div>

                                        {/* App Image */}
                                        <img
                                            src="/assets/botanica.webp"
                                            alt="AgroBotanica Scanner App"
                                            className="w-full h-auto object-cover"
                                        />
                                    </div>

                                    {/* Simulated Side Buttons - BLACK */}
                                    {/* Right Side: Power Button */}
                                    <div className="absolute top-32 -right-[2px] w-[3px] h-12 bg-black rounded-r-md shadow-sm border-r border-slate-900"></div>

                                    {/* Left Side: Volume Buttons */}
                                    <div className="absolute top-24 -left-[2px] w-[3px] h-10 bg-black rounded-l-md shadow-sm border-l border-slate-900"></div>
                                    <div className="absolute top-36 -left-[2px] w-[3px] h-10 bg-black rounded-l-md shadow-sm border-l border-slate-900"></div>
                                </div>

                                {/* Floating Badge - Repositioned 200px further to the LEFT */}
                                <div className="absolute bottom-8 left-[-180px] md:left-[-240px] bg-[#f97316] p-4 rounded-2xl shadow-2xl transform rotate-[-6deg] animate-bounce duration-[3000ms] z-20 shadow-orange-500/30 whitespace-nowrap">
                                    <p className="text-white font-black text-[10px] uppercase tracking-tighter mb-0.5">Identificação</p>
                                    <p className="text-white font-[900] text-xl">INSTANTÂNEA</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            {/* CTA */}
            <section className="py-20 bg-white border-t border-slate-100">
                <div className="container-site text-center">
                    <h2 className="text-[45px] font-[900] text-slate-800 mb-8 tracking-tight leading-tight">
                        Pronto para inovar no seu <span className="text-[#f97316]">negócio?</span>
                    </h2>
                    <div className="flex flex-wrap justify-center gap-4">
                        <Link href="/registar" className="px-8 py-4 bg-[#f97316] text-white font-bold rounded-xl shadow-lg shadow-orange-500/20 hover:bg-orange-600 transition-all hover:-translate-y-1">
                            Registar Empresa Agora
                        </Link>
                        <Link href="/contactos" className="px-8 py-4 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-all">
                            Fale Connosco
                        </Link>
                    </div>
                </div>
            </section>

        </main>
    );
}
