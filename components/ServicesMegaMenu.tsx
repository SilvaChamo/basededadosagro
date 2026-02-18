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
        id: "gestao-conteudo",
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
        id: "vagas",
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
        id: "formacoes",
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
    const [activeTab, setActiveTab] = useState(serviceCategories[0].id);
    const [lojasInnerTab, setLojasInnerTab] = useState<"insumos" | "lojas">("insumos");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchServices = async () => {
            const { data, error } = await supabase
                .from('services')
                .select('*')
                .eq('is_active', true)
                .order('title', { ascending: true });

            if (error) {
                console.error('Error fetching services:', error);
            } else {
                setServices(data || []);
            }
            setLoading(false);
        };

        if (isOpen) {
            fetchServices();
        }
    }, [isOpen]);

    // Group services by category
    const getItemsForCategory = (catId: string) => {
        const targetCategory = serviceCategories.find(c => c.id === catId);
        if (!targetCategory) return [];

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
    const activeItems = getItemsForCategory(activeTab);

    return (
        <div className={`absolute left-0 w-full top-full transition-all duration-300 z-50 ${isOpen ? 'opacity-100 visible pointer-events-auto' : 'opacity-0 invisible pointer-events-none'}`}>
            <div className="absolute top-[-25px] left-0 w-full h-[25px] bg-transparent" />
            <div className="bg-white border-y border-slate-200 shadow-[0_40px_80px_rgba(0,0,0,0.12)] overflow-hidden">
                <div className="container-site flex">
                    {/* Left Sidebar - Categories (Hover Activated) */}
                    <div className="w-[300px] bg-slate-50/50 border-r border-slate-100 py-2">
                        <div className="space-y-0.5">
                            {serviceCategories.map((cat) => {
                                const Icon = cat.icon;
                                const isActive = activeTab === cat.id;
                                return (
                                    <button
                                        key={cat.id}
                                        onClick={() => {
                                            setActiveTab(cat.id);
                                        }}
                                        className={`w-full flex items-center justify-between px-4 py-1 text-left transition-all relative group/tab ${isActive
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
                            <div className="pt-2 px-12 overflow-y-auto max-h-[380px]">
                                <div className="grid grid-cols-5 gap-x-6 gap-y-4">
                                    {activeCategory.groups ? (
                                        /* Flattened groups for Insumos */
                                        (activeCategory.groups || []).flatMap((group: any) => group.items).map((item: any, idx: number) => {
                                            const group = (activeCategory.groups || []).find((g: any) => g.items.includes(item));
                                            return (
                                                <Link
                                                    key={idx}
                                                    href={`/servicos/${activeTab}/${item.slug}`}
                                                    onClick={onClose}
                                                    className="group/icon flex flex-col items-center gap-2 w-full"
                                                >
                                                    <div className="w-16 h-16 rounded-full overflow-hidden border border-slate-100 group-hover/icon:border-[#f97316] transition-colors bg-slate-50 flex items-center justify-center p-0">
                                                        {group?.image ? (
                                                            <img
                                                                src={group.image}
                                                                alt={item.title}
                                                                className="w-full h-full object-cover m-0"
                                                            />
                                                        ) : (
                                                            <Store className="w-8 h-8 text-slate-400" />
                                                        )}
                                                    </div>
                                                    <span className="text-[10px] font-bold text-slate-600 group-hover/icon:text-[#f97316] transition-colors text-center leading-tight">
                                                        {item.title}
                                                    </span>
                                                </Link>
                                            );
                                        })
                                    ) : (
                                        /* Normal grid (Lojas and others) - also in 5 columns */
                                        activeItems.map((item: any, idx: number) => (
                                            <Link
                                                key={idx}
                                                href={`/servicos/${activeTab}/${item.slug}`}
                                                onClick={onClose}
                                                className="group/item flex flex-col gap-1.5"
                                            >
                                                <div className="flex items-center gap-2">
                                                    {typeof item.icon === 'string' ? null : <item.icon className="w-3.5 h-3.5 text-slate-300 group-hover/item:text-[#f97316] transition-colors" />}
                                                    <span className="text-[13px] font-bold text-slate-800 group-hover/item:text-[#f97316] transition-colors line-clamp-1">
                                                        {item.title}
                                                    </span>
                                                </div>
                                                <span className="text-[10px] text-slate-400 font-medium leading-tight line-clamp-2 group-hover/item:text-slate-500 transition-colors">
                                                    {item.description}
                                                </span>
                                            </Link>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>


                    </div>
                </div>
            </div>
        </div>
    );
}
