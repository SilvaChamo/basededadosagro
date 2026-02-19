"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
    Truck, Store, ShoppingCart, Smartphone, Calendar, FileText,
    Briefcase, Users, GraduationCap, ShieldCheck, Search, Zap,
    TrendingUp, Gavel, Globe, Star, ChevronRight, ArrowRight, Lightbulb, Monitor
} from "lucide-react";
import { IconMap } from "@/lib/icons";
import { createClient } from "@/utils/supabase/client";

// Icon mapping helper
// IconMap is now imported from @/lib/icons

interface ServiceCategory {
    id: string;
    title: string;
    icon: React.ElementType;
    description: string;
    groups?: {
        name: string;
        image?: string;
        items: {
            title: string;
            slug: string;
        }[];
    }[];
    items: {
        title: string;
        link: string;
        slug: string;
        description: string;
        icon: React.ElementType;
    }[];
}

const serviceCategories: ServiceCategory[] = [
    {
        id: "logistica",
        title: "Logística e transporte",
        icon: Truck,
        description: "Soluções completas para o escoamento de produção em grande escala, garantindo pontualidade e segurança através de parcerias estratégicas com as maiores transportadoras nacionais e monitoramento de carga 24/7.",
        items: [
            { title: "Transporte Terrestre", link: "/servicos/transporte", slug: "transporte", description: "Frota especializada para o transporte de produtos agrários em grandes quantidades.", icon: Truck },
            { title: "Segurança de Carga", link: "/servicos/transporte", slug: "seguranca", description: "Protocolos rigorosos de segurança e monitoramento em tempo real.", icon: ShieldCheck },
            { title: "Rastreio em Tempo Real", link: "/servicos/transporte", slug: "rastreio", description: "Acompanhe a sua mercadoria desde a origem até ao destino final.", icon: Search }
        ]
    },
    {
        id: "compra-venda",
        title: "Compra e venda",
        icon: ShoppingCart,
        description: "Plataforma avançada de comercialização que conecta diretamente produtores, cooperativas e grandes compradores industriais, facilitando negociações transparentes com cotações e garantias de negócio em tempo real.",
        items: [
            { title: "Cotações do Dia", link: "/servicos/mercado", slug: "cotacoes", description: "Acompanhe os preços médios nas principais praças nacionais.", icon: TrendingUp },
            { title: "Ofertas de Venda", link: "/servicos/mercado", slug: "ofertas", description: "Explore anúncios de produtores que procuram escoar produção.", icon: ShoppingCart },
            { title: "Leilões Agrários", link: "/servicos/mercado", slug: "leiloes", description: "Participe em licitações para compra de grandes lotes de produção.", icon: Gavel },
            { title: "Garantia de Negócio", link: "/servicos/mercado", slug: "garantia", description: "Transações seguras e monitoradas para evitar falhas.", icon: ShieldCheck }
        ]
    },
    {
        id: "assistencia",
        title: "Assistência digital",
        icon: Smartphone,
        description: "Suporte tecnológico especializado no agro-negócio, desde a criação de portais institucionais robustos até o desenvolvimento de aplicações personalizadas para a gestão eficiente e digital do campo.",
        items: [
            { title: "Criação de Portais", link: "/servicos/assistencia", slug: "portais", description: "Desenvolvimento de sites institucionais e catálogos agrários.", icon: Globe },
            { title: "Apoio Técnico TI", link: "/servicos/assistencia", slug: "tecnico", description: "Assistência para a modernização das suas ferramentas de gestão.", icon: Smartphone },
            { title: "Desenvolvimento App", link: "/servicos/assistencia", slug: "apps", description: "Soluções móveis personalizadas para gestão de campo.", icon: Smartphone },
            { title: "Suporte Online", link: "/servicos/assistencia", slug: "suporte", description: "Equipa dedicada para garantir a operacionalidade das plataformas.", icon: Users }
        ]
    },
    {
        id: "eventos",
        title: "Feiras e eventos",
        icon: Calendar,
        description: "Promoção estratégica e organização completa de eventos corporativos, feiras regionais e congressos do setor agrário, conectando a sua marca com os principais decisores e stakeholders do mercado.",
        items: [
            { title: "Calendário Regional", link: "/servicos/eventos", slug: "calendario", description: "Acompanhe as principais feiras provinciais e nacionais.", icon: Calendar },
            { title: "Promoção de Eventos", link: "/servicos/eventos", slug: "promocao", description: "Divulgue o seu evento para toda a nossa rede agrária.", icon: Zap },
            { title: "Bilheteira Online", link: "/servicos/eventos", slug: "bilheteira", description: "Gestão completa de acessos e venda de bilhetes para feiras.", icon: ShoppingCart },
            { title: "Patrocínio Digital", link: "/servicos/eventos", slug: "patrocinio", description: "Destaque a sua marca nos maiores eventos do sector.", icon: Star }
        ]
    },
    {
        id: "conteudo",
        title: "Gestão de conteúdo",
        icon: FileText,
        description: "Estratégia de comunicação digital e produção de media exclusiva para o setor agro, incluindo gestão de redes sociais, vídeo marketing e newsletters técnicas para fortalecer a presença digital das empresas.",
        items: [
            { title: "Escrita Técnica", link: "/servicos/conteudo", slug: "escrita", description: "Produção de artigos e posts especializados para o agro.", icon: FileText },
            { title: "Gestão de Redes", link: "/servicos/conteudo", slug: "redes", description: "Presença digital estratégica para marcas do sector.", icon: Users },
            { title: "Vídeo Marketing", link: "/servicos/conteudo", slug: "video", description: "Cobertura de eventos e produção de vídeos institucionais.", icon: FileText }
        ]
    },
    {
        id: "emprego",
        title: "Vagas de emprego",
        icon: Briefcase,
        description: "Hub de talentos e oportunidades de carreira focado exclusivamente no setor agrário, conectando profissionais qualificados às melhores vagas nas maiores empresas de agronegócio de Moçambique.",
        items: [
            { title: "Talento Agrário", link: "/servicos/emprego", slug: "talento", description: "Candidate-se a vagas nas maiores empresas do país.", icon: Briefcase },
            { title: "Recrutamento Especializado", link: "/servicos/emprego", slug: "recrutamento", description: "Serviços de RH focados em perfis técnicos agrícolas.", icon: Users },
            { title: "Estágios Profissionais", link: "/servicos/emprego", slug: "estagios", description: "Programas de entrada no mercado para jovens licenciados.", icon: GraduationCap },
            { title: "Consultoria de Carreira", link: "/servicos/emprego", slug: "carreira", description: "Apoio na elaboração de CV e preparação para entrevistas.", icon: FileText }
        ]
    },
    {
        id: "consultoria",
        title: "Consultoria digital",
        icon: Users,
        description: "Assessoria técnica especializada em transformação digital para o agro, auxiliando na implementação de novas tecnologias, análise de dados de produção e otimização de processos operacionais através da inovação.",
        items: [
            { title: "Estratégia Digital", link: "/servicos/consultoria", slug: "estrategia", description: "Planos estratégicos para transformação digital do agro-negócio.", icon: Globe },
            { title: "Otimização de Processos", link: "/servicos/consultoria", slug: "otimizacao", description: "Análise e melhoria de processos operacionais através de tecnologia.", icon: Zap },
            { title: "Análise de Dados", link: "/servicos/consultoria", slug: "dados", description: "Insights baseados em dados para melhor tomada de decisão.", icon: TrendingUp },
            { title: "Implementação Tecnológica", link: "/servicos/consultoria", slug: "implementacao", description: "Suporte na adoção e integração de novas tecnologias.", icon: Smartphone }
        ]
    },
    {
        id: "formacao",
        title: "Formações e capacitações",
        icon: GraduationCap,
        description: "Programas educativos e workshops práticos voltados para a capacitação técnica em novas tecnologias agrícolas, gestão de negócios rurais e certificações de qualidade reconhecidas internacionalmente.",
        items: [
            { title: "Academia Agro", link: "/servicos/formacao", slug: "academia", description: "Cursos certificados online para capacitação técnica.", icon: GraduationCap },
            { title: "Capacitação Rural", link: "/servicos/formacao", slug: "capacitacao", description: "Treinos práticos de campo para melhoria de produtividade.", icon: Truck }
        ]
    },
    {
        id: "inovacao",
        title: "Inovação",
        icon: Lightbulb,
        description: "Explore o futuro do agronegócio com ferramentas de inteligência artificial, apresentações interativas e repositórios de conhecimento que transformam dados em progresso.",
        items: [
            { title: "Apresentações Visuais", link: "/inovacao/apresentacoes", slug: "apresentacoes", description: "Editor de slides interativos para catálogos e relatórios.", icon: Monitor },
            { title: "Repositório Científico", link: "/inovacao/repositorio-cientifico", slug: "repositorio-cientifico", description: "Pesquisa dinâmica e semântica de artigos académicos.", icon: Search },
            { title: "AgroBotanica AI", link: "/inovacao/agrobotanica", slug: "agrobotanica", description: "Scanner inteligente para diagnóstico de pragas e doenças.", icon: Zap },
            { title: "Identidade Digital", link: "/inovacao/perfil-digital", slug: "perfil-digital", description: "Perfis profissionais e cartões de visita com QR Code.", icon: Users }
        ]
    }
];

export function ServicesMegaMenu({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
    const supabase = createClient();
    const [services, setServices] = useState<any[]>([]);
    const [trainings, setTrainings] = useState<any[]>([]);
    const [activeTab, setActiveTab] = useState(serviceCategories[0].id);
    const [lojasInnerTab, setLojasInnerTab] = useState<"insumos" | "lojas">("insumos");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAllData = async () => {
            setLoading(true);
            try {
                // Fetch Services
                const { data: servicesData, error: servicesError } = await supabase
                    .from('services')
                    .select('*')
                    .eq('is_active', true)
                    .order('title', { ascending: true });

                if (servicesError) console.error('Error fetching services:', servicesError);
                else setServices(servicesData || []);

                // Fetch Trainings
                const { data: trainingsData, error: trainingsError } = await supabase
                    .from('trainings')
                    .select('*')
                    .is('deleted_at', null)
                    .order('created_at', { ascending: false })
                    .limit(6);

                if (trainingsError) console.error('Error fetching trainings:', trainingsError);
                else setTrainings(trainingsData || []);

            } catch (err) {
                console.error('Error fetching mega menu data:', err);
            } finally {
                setLoading(false);
            }
        };

        if (isOpen) {
            fetchAllData();
        }
    }, [isOpen]);

    // Group services by category
    const getItemsForCategory = (catId: string) => {
        const targetCategory = serviceCategories.find(c => c.id === catId);
        if (!targetCategory) return [];

        // Special handling for trainings
        if (catId === 'formacao' && trainings.length > 0) {
            return trainings.map(t => ({
                title: t.title,
                slug: t.id,
                description: `${t.date} | ${t.location}`,
                icon: GraduationCap,
                isTraining: true
            }));
        }

        const dynamicItems = services.filter(s => s.category === targetCategory.title);

        // If we have dynamic items for this category, use them
        if (dynamicItems.length > 0) {
            return dynamicItems.map(s => ({
                title: s.title,
                slug: s.slug || s.id,
                description: s.description || "",
                icon: IconMap[s.icon as keyof typeof IconMap] || Briefcase
            }));
        }

        // Fallback to static items if no dynamic ones exist for this category yet
        return targetCategory.items || [];
    };

    const activeCategory = serviceCategories.find(c => c.id === activeTab) || serviceCategories[0];
    const activeCategoryIndex = serviceCategories.findIndex(c => c.id === activeTab);
    const activeItems = getItemsForCategory(activeTab);
    const styleVariant = activeCategoryIndex % 5;

    return (
        <div className={`absolute left-0 w-full top-full transition-all duration-300 z-50 ${isOpen ? 'opacity-100 visible pointer-events-auto' : 'opacity-0 invisible pointer-events-none'}`}>
            <div className="absolute top-[-25px] left-0 w-full h-[25px] bg-transparent" />
            <div className="bg-white border-y border-slate-200 shadow-[0_40px_80px_rgba(0,0,0,0.12)] overflow-hidden">
                <div className="container-site flex">
                    {/* Left Sidebar - Categories (Hover Activated) */}
                    <div className="w-[300px] bg-slate-50/50 border-r border-slate-100 py-2">
                        <div className="space-y-1">
                            {serviceCategories.map((cat) => {
                                const Icon = cat.icon;
                                const isActive = activeTab === cat.id;
                                return (
                                    <button
                                        key={cat.id}
                                        onClick={() => {
                                            setActiveTab(cat.id);
                                        }}
                                        className={`w-full flex items-center justify-between px-4 py-2 text-left transition-all relative group/tab ${isActive
                                            ? "bg-white text-[#f97316] font-bold shadow-sm"
                                            : "text-slate-500 hover:bg-white/60 hover:text-[#f97316]"
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`p-1.5 rounded-lg transition-colors ${isActive ? "bg-orange-50" : "bg-transparent group-hover/tab:bg-orange-50/50"}`}>
                                                <Icon className="w-4 h-4" />
                                            </div>
                                            <span className="text-[13px] font-semibold leading-tight tracking-tight">{cat.title}</span>
                                        </div>
                                        {isActive && <ChevronRight className="w-4 h-4" />}
                                        {isActive && <div className="absolute right-0 top-0 h-full w-[3px] bg-[#f97316]" />}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Right Content Area */}
                    <div className="flex-1 bg-white py-0 px-0 relative overflow-hidden text-black">

                        <div className="relative z-10">
                            {/* Header: Removed */}

                            {/* Content Area */}
                            <div className="p-[40px] overflow-y-auto max-h-[500px]">
                                <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                                    {activeCategory.groups ? (
                                        /* Flattened groups for Insumos */
                                        (activeCategory.groups || []).flatMap((group: any) => group.items).map((item: any, idx: number) => {
                                            const group = (activeCategory.groups || []).find((g: any) => g.items.includes(item));
                                            return (
                                                <Link
                                                    key={idx}
                                                    href={`/servicos/${activeTab}/${item.slug}`}
                                                    onClick={onClose}
                                                    className="group/icon flex flex-col items-center gap-3 w-full p-2 rounded-2xl transition-all hover:bg-slate-50/50"
                                                >
                                                    <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-slate-100 group-hover/icon:border-[#f97316] group-hover/icon:scale-110 group-hover/icon:rotate-2 shadow-sm group-hover/icon:shadow-md transition-all duration-300 relative flex items-center justify-center p-0 bg-white">
                                                        {group?.image ? (
                                                            <img
                                                                src={group.image}
                                                                alt={item.title}
                                                                className="w-full h-full object-cover m-0"
                                                            />
                                                        ) : (
                                                            <Store className="w-10 h-10 text-slate-300 group-hover/icon:text-[#f97316] transition-colors" />
                                                        )}
                                                        <div className="absolute inset-0 bg-black/0 group-hover/icon:bg-black/5 flex items-center justify-center transition-all opacity-0 group-hover/icon:opacity-100">
                                                            <ArrowRight className="w-6 h-6 text-white drop-shadow-md transform translate-x-[-10px] group-hover/icon:translate-x-0 transition-all duration-300" />
                                                        </div>
                                                    </div>
                                                    <span className="text-[11px] font-extrabold text-slate-700 group-hover/icon:text-[#f97316] transition-colors text-center leading-tight">
                                                        {item.title}
                                                    </span>
                                                </Link>
                                            );
                                        })
                                    ) : (
                                        /* Alternating card styles per category */
                                        activeItems.map((item: any, idx: number) => {
                                            const ItemIcon = typeof item.icon === 'string' ? Briefcase : item.icon;
                                            let href = activeTab === 'inovacao' ? `/inovacao/${item.slug}` : `/servicos/${activeTab}/${item.slug}`;

                                            // Special route for trainings
                                            if (item.isTraining) {
                                                href = `/servicos/formacao/${item.slug}`;
                                            }

                                            /* Style A — Card with left border accent */
                                            if (styleVariant === 0) return (
                                                <Link
                                                    key={idx}
                                                    href={href}
                                                    onClick={onClose}
                                                    className="group/item flex flex-col gap-1.5 p-5 rounded-xl border-l-[3px] border-l-orange-400 bg-orange-50/50 border border-orange-100 hover:bg-orange-50 hover:shadow-md transition-all duration-300 relative overflow-hidden"
                                                >
                                                    <div className="absolute top-0 right-0 w-16 h-16 bg-orange-100/30 rounded-full -translate-y-1/2 translate-x-1/2 group-hover/item:scale-150 transition-transform duration-500" />
                                                    <div className="flex items-center gap-2.5 relative z-10">
                                                        <ItemIcon className="w-4.5 h-4.5 text-orange-500 group-hover/item:text-orange-600 transition-colors" />
                                                        <span className="text-[15px] font-bold text-slate-800 group-hover/item:text-orange-600 transition-colors">
                                                            {item.title}
                                                        </span>
                                                    </div>
                                                    <span className="text-[13px] text-slate-500 font-medium leading-relaxed line-clamp-2 relative z-10 pl-7">
                                                        {item.description}
                                                    </span>
                                                </Link>
                                            );

                                            /* Style B — Large circular icon, centered layout */
                                            if (styleVariant === 1) return (
                                                <Link
                                                    key={idx}
                                                    href={href}
                                                    onClick={onClose}
                                                    className="group/item flex flex-col items-center gap-3 p-5 rounded-2xl bg-emerald-50/40 border border-emerald-100/60 hover:bg-emerald-50/70 hover:shadow-md transition-all duration-300"
                                                >
                                                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-emerald-50 to-teal-100 flex items-center justify-center group-hover/item:from-orange-100 group-hover/item:to-orange-50 group-hover/item:shadow-lg group-hover/item:shadow-orange-200/40 group-hover/item:scale-110 transition-all duration-300">
                                                        <ItemIcon className="w-6 h-6 text-emerald-600 group-hover/item:text-orange-500 transition-colors duration-300" />
                                                    </div>
                                                    <span className="text-[15px] font-bold text-slate-700 group-hover/item:text-orange-600 transition-colors text-center leading-tight">
                                                        {item.title}
                                                    </span>
                                                    <span className="text-[13px] text-slate-400 font-medium leading-snug line-clamp-2 text-center">
                                                        {item.description}
                                                    </span>
                                                </Link>
                                            );

                                            /* Style C — Horizontal card with colored tag */
                                            if (styleVariant === 2) return (
                                                <Link
                                                    key={idx}
                                                    href={href}
                                                    onClick={onClose}
                                                    className="group/item flex items-start gap-3 p-5 rounded-xl bg-blue-50/30 border border-blue-100 hover:border-blue-200 hover:bg-blue-50/50 hover:shadow-[0_4px_20px_rgba(59,130,246,0.08)] transition-all duration-300"
                                                >
                                                    <div className="p-2 rounded-lg bg-blue-50 group-hover/item:bg-blue-100 transition-colors shrink-0 mt-0.5">
                                                        <ItemIcon className="w-4 h-4 text-blue-500 group-hover/item:text-blue-600 transition-colors" />
                                                    </div>
                                                    <div className="flex flex-col gap-1 flex-1 min-w-0">
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-[15px] font-bold text-slate-800 group-hover/item:text-blue-600 transition-colors">
                                                                {item.title}
                                                            </span>
                                                            <ArrowRight className="w-3.5 h-3.5 text-blue-400 opacity-0 group-hover/item:opacity-100 transform -translate-x-1 group-hover/item:translate-x-0 transition-all duration-300 shrink-0" />
                                                        </div>
                                                        <span className="text-[13px] text-slate-400 font-medium leading-relaxed line-clamp-2">
                                                            {item.description}
                                                        </span>
                                                    </div>
                                                </Link>
                                            );

                                            /* Style D — Minimalist with underline animation */
                                            if (styleVariant === 3) return (
                                                <Link
                                                    key={idx}
                                                    href={href}
                                                    onClick={onClose}
                                                    className="group/item flex flex-col gap-2 p-5 rounded-lg border border-amber-100/80 bg-amber-50/30 transition-all duration-300 hover:bg-amber-50/60 hover:shadow-md"
                                                >
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-amber-400 group-hover/item:bg-amber-500 group-hover/item:scale-150 transition-all duration-300" />
                                                        <span className="text-[15px] font-bold text-slate-700 group-hover/item:text-amber-600 transition-colors relative">
                                                            {item.title}
                                                            <span className="absolute bottom-0 left-0 w-0 h-[1.5px] bg-amber-400 group-hover/item:w-full transition-all duration-400" />
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-[13px] text-slate-400 font-medium leading-relaxed line-clamp-2 pl-3.5">
                                                            {item.description}
                                                        </span>
                                                        <ChevronRight className="w-3.5 h-3.5 text-amber-400 opacity-0 group-hover/item:opacity-100 transition-all duration-300 shrink-0" />
                                                    </div>
                                                </Link>
                                            );

                                            /* Style E — Gradient glassmorphism (Inovação etc.) */
                                            return (
                                                <Link
                                                    key={idx}
                                                    href={href}
                                                    onClick={onClose}
                                                    className="group/item flex flex-col gap-2 p-5 rounded-2xl bg-gradient-to-br from-purple-50/80 via-violet-50/60 to-orange-50/60 border border-purple-100 hover:border-purple-200 hover:shadow-[0_8px_30px_rgba(147,51,234,0.1)] backdrop-blur-sm transition-all duration-300 relative overflow-hidden"
                                                >
                                                    <div className="absolute -top-4 -right-4 w-20 h-20 bg-purple-200/20 rounded-full blur-xl group-hover/item:bg-purple-300/30 group-hover/item:scale-150 transition-all duration-500" />
                                                    <div className="flex items-center gap-2.5 relative z-10">
                                                        <div className="p-1.5 rounded-lg bg-white/80 shadow-sm group-hover/item:shadow-purple-200/50 transition-all">
                                                            <ItemIcon className="w-4 h-4 text-purple-500 group-hover/item:text-purple-600 transition-colors" />
                                                        </div>
                                                        <span className="text-[15px] font-bold text-slate-800 group-hover/item:text-purple-600 transition-colors">
                                                            {item.title}
                                                        </span>
                                                    </div>
                                                    <span className="text-[13px] text-slate-500 font-medium leading-relaxed line-clamp-2 relative z-10 pl-8">
                                                        {item.description}
                                                    </span>
                                                </Link>
                                            );
                                        })
                                    )}
                                </div>

                                {activeTab === 'formacao' && (
                                    <div className="mt-8 pt-8 border-t border-slate-100 flex justify-center">
                                        <Link
                                            href="/servicos/formacao"
                                            onClick={onClose}
                                            className="flex items-center gap-2 px-6 py-2.5 bg-slate-900 hover:bg-[#f97316] text-white rounded-xl font-bold text-sm transition-all shadow-lg hover:shadow-orange-200/50"
                                        >
                                            Ver todas as formações
                                            <ArrowRight className="w-4 h-4" />
                                        </Link>
                                    </div>
                                )}
                            </div>
                        </div>


                    </div>
                </div>
            </div>
        </div>
    );
}
