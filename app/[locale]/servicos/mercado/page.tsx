"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/PageHeader";
import { ShoppingBag, TrendingUp, BarChart3, ArrowUpRight, Tags, ShieldCheck, ArrowRight, Search, X } from "lucide-react";
import { usePlanPermissions } from "@/hooks/usePlanPermissions";
import { SearchSection } from "@/components/SearchSection";
import { ContactCTA } from "@/components/ContactCTA";

export default function MercadoServicoPage() {
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const { plan } = usePlanPermissions();
    const router = useRouter();

    const handleAnunciarClick = () => {
        if (plan === 'Business Vendedor' || plan === 'Parceiro') {
            router.push('/usuario/dashboard/produtos');
        } else {
            router.push('/planos');
        }
    };

    const marketInfo = [
        {
            title: "Cotações do Dia",
            description: "Acompanhe os preços médios do milho, feijão e outros produtos nas principais praças nacionais.",
            icon: TrendingUp,
            iconBg: "bg-emerald-50",
            iconColor: "text-emerald-500",
            val: "+5.2%"
        },
        {
            title: "Ofertas de Venda",
            description: "Explore anúncios de produtores que procuram escoar grandes quantidades de produção.",
            icon: Tags,
            iconBg: "bg-orange-50",
            iconColor: "text-orange-500",
            val: "1.2k+"
        },
        {
            title: "Garantia de Negócio",
            description: "Transações seguras e monitoradas para garantir que o pagamento e a entrega ocorram sem falhas.",
            icon: ShieldCheck,
            iconBg: "bg-blue-50",
            iconColor: "text-blue-500",
            val: "100%"
        }
    ];

    return (
        <main className="min-h-screen bg-slate-50">
            <div className="relative">
                <PageHeader
                    title={<>Mercado <span className="text-[#f97316]">Digital</span></>}
                    icon={ShoppingBag}
                    backgroundImage="https://images.unsplash.com/photo-1542831371-29b0f74f9713?q=80&w=2000&auto=format&fit=crop"
                    breadcrumbs={[
                        { label: "Início", href: "/" },
                        { label: "Serviços", href: "/servicos" },
                        { label: "Mercado", href: undefined }
                    ]}
                />

                {/* Floating Search Toggle */}
                <div className="absolute bottom-6 w-full z-20 pointer-events-none">
                    <div className="container-site mx-auto flex justify-end">
                        <button
                            onClick={() => setIsSearchOpen(!isSearchOpen)}
                            className={`w-12 h-12 rounded-[7px] flex items-center justify-center transition-all duration-300 shadow-xl pointer-events-auto animate-in fade-in slide-in-from-bottom-8 duration-700 ${isSearchOpen
                                ? "bg-[#f97316] text-white rotate-90 border border-[#f97316]"
                                : "bg-[#22c55e] text-white hover:bg-[#f97316] hover:scale-110"
                                }`}
                        >
                            {isSearchOpen ? <X className="w-6 h-6" /> : <Search className="w-6 h-6" />}
                        </button>
                    </div>
                </div>
            </div>

            <SearchSection isOpen={isSearchOpen} withBottomBorder={true} />

            <div className="container-site relative z-20 mt-[50px] pb-24">
                {/* Market Info Grid - On Background */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-20">
                    {marketInfo.map((item, i) => (
                        <div key={i} className="p-6 md:p-8 rounded-[15px] bg-white border border-slate-200 shadow-lg shadow-slate-200/50 text-left transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl flex flex-col gap-4 group">
                            <div className="flex items-start justify-between">
                                <div className="flex items-start gap-4">
                                    <div className={`w-12 h-12 rounded-[10px] flex items-center justify-center shrink-0 ${item.iconBg}`}>
                                        <item.icon className={`h-6 w-6 ${item.iconColor}`} />
                                    </div>
                                    <div className="space-y-1">
                                        <h3 className="text-xl font-bold leading-tight text-slate-900 group-hover:text-[#f97316] transition-colors">{item.title}</h3>
                                        <span className="text-2xl font-black text-slate-900">{item.val}</span>
                                    </div>
                                </div>
                            </div>
                            <p className="text-sm leading-relaxed text-slate-500 flex-1">{item.description}</p>
                            <div className="flex items-center gap-2 text-xs font-bold text-slate-400 group-hover:text-slate-900 transition-colors pt-4 font-black uppercase tracking-widest cursor-pointer">
                                Ver Detalhes <ArrowUpRight className="h-3 w-3" />
                            </div>
                        </div>
                    ))}
                </div>

                {/* Como Funciona */}
                <div className="bg-white rounded-3xl p-10 md:p-12 mb-20 border border-slate-100 shadow-sm">
                    <h3 className="text-3xl font-black text-slate-800 mb-12 text-center">Como negociar na plataforma?</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
                        {/* Connecting Line (Desktop) */}
                        <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-1 bg-slate-100 -z-0"></div>

                        {/* Step 1 */}
                        <div className="relative z-10 text-center">
                            <div className="w-24 h-24 mx-auto bg-white border-4 border-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mb-6 shadow-sm">
                                <span className="text-3xl font-black">1</span>
                            </div>
                            <h4 className="text-xl font-bold text-slate-800 mb-2">Registe-se Grátis</h4>
                            <p className="text-slate-500 text-sm">Crie a sua conta de produtor ou comprador em menos de 2 minutos.</p>
                        </div>
                        {/* Step 2 */}
                        <div className="relative z-10 text-center">
                            <div className="w-24 h-24 mx-auto bg-white border-4 border-orange-50 text-orange-600 rounded-full flex items-center justify-center mb-6 shadow-sm">
                                <span className="text-3xl font-black">2</span>
                            </div>
                            <h4 className="text-xl font-bold text-slate-800 mb-2">Publique ou Pesquise</h4>
                            <p className="text-slate-500 text-sm">Insira seus produtos com fotos e preços, ou busque o que precisa.</p>
                        </div>
                        {/* Step 3 */}
                        <div className="relative z-10 text-center">
                            <div className="w-24 h-24 mx-auto bg-white border-4 border-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-6 shadow-sm">
                                <span className="text-3xl font-black">3</span>
                            </div>
                            <h4 className="text-xl font-bold text-slate-800 mb-2">Negociação Segura</h4>
                            <p className="text-slate-500 text-sm">Feche negócio directamente e utilize nossa rede logística para entrega.</p>
                        </div>
                    </div>
                </div>

                {/* Diferenciais */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-12">
                    <div className="space-y-8">
                        <div className="flex gap-4">
                            <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                                <ShieldCheck className="w-6 h-6 text-emerald-600" />
                            </div>
                            <div>
                                <h4 className="text-xl font-bold text-slate-800">Verificação de Qualidade</h4>
                                <p className="text-slate-500 mt-2">Todos os produtores passam por um processo de verificação para garantir a qualidade dos produtos ofertados.</p>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center shrink-0">
                                <BarChart3 className="w-6 h-6 text-orange-600" />
                            </div>
                            <div>
                                <h4 className="text-xl font-bold text-slate-800">Preços Justos</h4>
                                <p className="text-slate-500 mt-2">Nossa ferramenta de cotação ajuda a definir preços competitivos baseados na média nacional.</p>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                                <ShoppingBag className="w-6 h-6 text-blue-600" />
                            </div>
                            <div>
                                <h4 className="text-xl font-bold text-slate-800">Mix Diversificado</h4>
                                <p className="text-slate-500 mt-2">De hortícolas frescas a grãos e tubérculos. Encontre tudo o que o campo produz em um só lugar.</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-slate-50 rounded-2xl p-8 border border-slate-200">
                        <h4 className="font-black text-slate-800 mb-6 uppercase tracking-wider text-sm">Categorias em Alta</h4>
                        <div className="flex flex-wrap gap-2">
                            {["Milho", "Feijão Nhemba", "Tomate", "Cebola", "Batata Reno", "Arroz", "Mandioca", "Soja", "Gergelim", "Castanha"].map((tag, i) => (
                                <span key={i} className="px-4 py-2 bg-white border border-slate-200 rounded-full text-slate-600 font-bold text-xs hover:border-[#f97316] hover:text-[#f97316] cursor-pointer transition-colors">
                                    {tag}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>

                <ContactCTA
                    title="Quer começar a vender agora?"
                    description="Publique o seu stock e conecte-se com centenas de compradores em todo o país através do nosso mercado digital."
                    buttonText="Falar com Especialistas"
                >
                    <button
                        onClick={handleAnunciarClick}
                        className="inline-flex items-center justify-center px-12 py-4 bg-white text-emerald-900 rounded-md font-black uppercase text-sm tracking-widest hover:scale-105 active:scale-95 shadow-xl transition-all sm:w-auto w-full"
                    >
                        Anunciar Produto
                    </button>
                </ContactCTA>
            </div>
        </main>
    );
}
