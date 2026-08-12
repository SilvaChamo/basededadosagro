"use client";

import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { Truck, MapPin, Package, Clock, CheckCircle, ArrowRight, Shield } from "lucide-react";

export default function TransporteDetalhesPage() {
    const solutions = [
        {
            title: "Transporte de Produção",
            description: "Escoamento de grandes volumes de produção agrícola para mercados nacionais e internacionais.",
            icon: Truck,
            features: ["Veículos refrigerados", "Rastreamento GPS", "Seguro incluído"]
        },
        {
            title: "Distribuição Regional",
            description: "Serviço de distribuição para todas as províncias de Moçambique.",
            icon: MapPin,
            features: ["Cobertura nacional", "Entregas programadas", "Armazenamento temporário"]
        },
        {
            title: "Logística Especializada",
            description: "Transporte de insumos agrícolas, maquinaria e equipamentos sensíveis.",
            icon: Package,
            features: ["Manuseamento especializado", "Embalagem adequada", "Equipa treinada"]
        }
    ];

    const coverage = [
        { province: "Maputo", status: "Cobertura Completa" },
        { province: "Gaza", status: "Cobertura Completa" },
        { province: "Inhambane", status: "Cobertura Completa" },
        { province: "Sofala", status: "Cobertura Completa" },
        { province: "Manica", status: "Cobertura Parcial" },
        { province: "Tete", status: "Cobertura Parcial" },
        { province: "Zambézia", status: "Cobertura Completa" },
        { province: "Nampula", status: "Cobertura Completa" },
        { province: "Cabo Delgado", status: "Cobertura Parcial" },
        { province: "Niassa", status: "Cobertura Parcial" }
    ];

    return (
        <main className="min-h-screen bg-slate-50">
            <PageHeader
                title="Logística & Transporte - Detalhes"
                icon={Truck}
                backgroundImage="https://images.unsplash.com/photo-1586528116311-ad86d7c49390?q=80&w=2000&auto=format&fit=crop"
                breadcrumbs={[
                    { label: "Início", href: "/" },
                    { label: "Serviços", href: "/servicos" },
                    { label: "Transporte", href: "/servicos/transporte" },
                    { label: "Detalhes", href: undefined }
                ]}
            />

            <div className="container-site relative z-20 mt-[50px] pb-24">
                {/* Intro */}
                <div className="bg-white rounded-[15px] shadow-lg shadow-slate-200/50 border border-slate-200 px-8 md:px-10 lg:px-12 py-10 md:py-12 mb-12">
                    <h2 className="text-2xl md:text-[45px] font-heading font-black text-slate-600 tracking-tight leading-[1.2] mb-6">
                        Soluções de transporte para o <span className="text-[#f97316]">sector agrário</span>
                    </h2>
                    <p className="text-sm text-slate-500 font-medium leading-relaxed">
                        Oferecemos serviços completos de logística e transporte para produtores e empresas agrícolas. Com uma rede de parceiros confiáveis e veículos especializados, garantimos que a sua produção chegue ao destino com segurança e pontualidade.
                    </p>
                </div>

                {/* Solutions */}
                <div className="mb-12">
                    <h3 className="text-2xl md:text-3xl font-black text-slate-900 mb-6">
                        Nossas <span className="text-[#f97316]">Soluções</span>
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {solutions.map((solution, i) => (
                            <div key={i} className="p-8 rounded-[15px] bg-white border border-slate-200 shadow-lg shadow-slate-200/50 hover:-translate-y-1 transition-all duration-300">
                                <div className="w-12 h-12 rounded-lg bg-emerald-50 flex items-center justify-center mb-4">
                                    <solution.icon className="w-6 h-6 text-emerald-500" />
                                </div>
                                <h4 className="text-xl font-bold text-slate-900 mb-2">{solution.title}</h4>
                                <p className="text-sm text-slate-600 mb-4">{solution.description}</p>
                                <ul className="space-y-2">
                                    {solution.features.map((feature, j) => (
                                        <li key={j} className="flex items-center gap-2 text-sm text-slate-700">
                                            <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                                            {feature}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Coverage */}
                <div className="bg-white rounded-[15px] shadow-lg shadow-slate-200/50 border border-slate-200 p-8 md:p-10 mb-12">
                    <h3 className="text-2xl md:text-3xl font-black text-slate-900 mb-6">
                        Cobertura <span className="text-[#f97316]">Nacional</span>
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                        {coverage.map((area, i) => (
                            <div key={i} className="p-4 rounded-lg border border-slate-200 text-center">
                                <p className="font-bold text-slate-900 mb-1">{area.province}</p>
                                <p className={`text-xs ${area.status === 'Cobertura Completa' ? 'text-emerald-600' : 'text-amber-600'}`}>
                                    {area.status}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Benefits */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-[15px] p-8 text-center text-white">
                        <Shield className="w-12 h-12 mx-auto mb-3 opacity-80" />
                        <p className="text-xl font-black mb-2">Seguro Incluído</p>
                        <p className="text-emerald-100 text-sm">Protecção total da sua carga</p>
                    </div>
                    <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-[15px] p-8 text-center text-white">
                        <Clock className="w-12 h-12 mx-auto mb-3 opacity-80" />
                        <p className="text-xl font-black mb-2">Pontualidade</p>
                        <p className="text-blue-100 text-sm">Entregas no prazo garantido</p>
                    </div>
                    <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-[15px] p-8 text-center text-white">
                        <MapPin className="w-12 h-12 mx-auto mb-3 opacity-80" />
                        <p className="text-xl font-black mb-2">Rastreamento</p>
                        <p className="text-amber-100 text-sm">Acompanhe sua carga em tempo real</p>
                    </div>
                </div>

                {/* CTA */}
                <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-[15px] p-8 md:p-12 text-center shadow-2xl shadow-slate-900/20">
                    <h3 className="text-2xl md:text-3xl font-black text-white mb-4">
                        Precisa de transporte para a sua produção?
                    </h3>
                    <p className="text-slate-300 mb-6 max-w-2xl mx-auto">
                        Solicite um orçamento personalizado e descubra as nossas soluções de logística.
                    </p>
                    <Link
                        href="/contactos"
                        className="inline-flex items-center gap-2 bg-[#f97316] hover:bg-[#ea6a0a] text-white font-bold px-8 py-4 rounded-lg transition-all duration-300 hover:scale-105"
                    >
                        Solicitar Orçamento
                        <ArrowRight className="w-5 h-5" />
                    </Link>
                </div>
            </div>
        </main>
    );
}
