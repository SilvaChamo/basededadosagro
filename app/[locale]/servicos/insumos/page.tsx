"use client";

import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { ShoppingCart, MapPin, Phone, ArrowRight, Package, BadgeCheck, Clock, Building2 } from "lucide-react";
import { ContactCTA } from "@/components/ContactCTA";

export default function InsumosPage() {
    const stores = [
        {
            name: "Agro-Insumos Niassa Lda",
            category: "Sementes & Fertilizantes",
            location: "Lichinga, Niassa",
            status: "Aberto",
            iconBg: "bg-orange-50",
            iconColor: "text-orange-500"
        },
        {
            name: "Tecno-Campo Sul",
            category: "Maquinaria & Equipamento",
            location: "Matola, Maputo",
            status: "Aberto",
            iconBg: "bg-blue-50",
            iconColor: "text-blue-500"
        },
        {
            name: "Eco-Sementes Centro",
            category: "Insumos Orgânicos",
            location: "Chimoio, Manica",
            status: "Fechado",
            iconBg: "bg-emerald-50",
            iconColor: "text-emerald-500"
        },
        {
            name: "Fertilizantes do Norte",
            category: "Nutrição Vegetal",
            location: "Nampula, Nampula",
            status: "Aberto",
            iconBg: "bg-violet-50",
            iconColor: "text-violet-500"
        }
    ];

    return (
        <main className="min-h-screen bg-slate-50">
            <PageHeader
                title="Lojas de Insumos"
                icon={ShoppingCart}
                backgroundImage="https://images.unsplash.com/photo-1464226184884-fa280b87c399?q=80&w=2000&auto=format&fit=crop"
                breadcrumbs={[
                    { label: "Início", href: "/" },
                    { label: "Serviços", href: "/servicos" },
                    { label: "Insumos", href: undefined }
                ]}
            />

            <div className="container-site relative z-20 mt-[50px] pb-24">

                {/* Stores Grid - Using Emprego Card Style */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {stores.map((store, i) => (
                        <div key={i} className="p-6 md:p-8 rounded-[15px] bg-white border border-slate-200 shadow-lg shadow-slate-200/50 text-left transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-6 group">
                            <div className="flex items-center gap-6">
                                <div className={`w-14 h-14 rounded-[10px] flex items-center justify-center shrink-0 ${store.iconBg}`}>
                                    <Package className={`h-7 w-7 ${store.iconColor}`} />
                                </div>
                                <div className="space-y-1">
                                    <h4 className="text-xl font-bold text-slate-900 group-hover:text-emerald-600 transition-colors tracking-tight">{store.name}</h4>
                                    <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-slate-400">
                                        <div className="flex items-center gap-1.5">
                                            <BadgeCheck className="w-3.5 h-3.5 text-[#f97316]" />
                                            {store.category}
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <MapPin className="w-3.5 h-3.5 text-[#f97316]" />
                                            {store.location}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center justify-between md:justify-end gap-8 pt-4 md:pt-0 border-t md:border-none border-slate-200 shrink-0">
                                <div className="text-right">
                                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{store.status}</p>
                                    <span className="flex items-center gap-1 text-[10px] font-black text-emerald-500 uppercase tracking-widest mt-1">
                                        <Clock className="w-3 h-3" /> Hoje
                                    </span>
                                </div>
                                <div className="size-10 bg-white rounded-lg flex items-center justify-center text-slate-400 group-hover:bg-emerald-500 group-hover:text-white transition-all shadow-sm">
                                    <ArrowRight className="w-4 h-4" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Bottom CTA */}
                <ContactCTA
                    title="Tem uma loja de insumos?"
                    description="Aumente a visibilidade do seu negócio e alcance mais produtores em todo o país. Registe a sua loja hoje mesmo."
                    buttonText="Registar Loja Nova"
                    href="/registar"
                />
            </div>
        </main>
    );
}
