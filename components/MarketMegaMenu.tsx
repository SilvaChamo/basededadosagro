"use client";

import React from "react";
import Link from "next/link";
import { Store, ShoppingCart, Bell, ShieldCheck, ArrowRight, Star, Truck, Users, ShoppingBag } from "lucide-react";

interface MarketCategory {
    id: string;
    title: string;
    icon: React.ElementType;
    link: string;
}

const marketCategories: MarketCategory[] = [
    {
        id: "produtores",
        title: "Produtores",
        icon: Users,
        link: "/mercado/produtores",
    },
    {
        id: "fornecedores",
        title: "Fornecedores",
        icon: Truck,
        link: "/mercado/fornecedores",
    },
    {
        id: "consumidores",
        title: "Consumidores",
        icon: ShoppingBag,
        link: "/mercado/consumidores",
    },
    {
        id: "lojas",
        title: "Rede de Lojas",
        icon: Store,
        link: "/servicos/lojas",
    }
];

export function MarketMegaMenu({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
    return (
        <div className={`absolute left-0 w-full top-full transition-all duration-300 z-50 ${isOpen ? 'opacity-100 visible pointer-events-auto' : 'opacity-0 invisible pointer-events-none'}`}>
            <div className="absolute top-[-25px] left-0 w-full h-[25px] bg-transparent" />
            <div className="bg-white border-y border-slate-200 shadow-[0_40px_80px_rgba(0,0,0,0.12)] overflow-hidden">
                <div className="container-site flex flex-col md:flex-row py-12 px-6 lg:px-12 gap-12 items-center">

                    {/* Left Section - Hero Area */}
                    <div className="flex-1 max-w-[450px] space-y-6">
                        <div className="flex items-center gap-2">
                            <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center text-white shadow-lg shadow-orange-500/20">
                                <Star className="w-6 h-6 fill-current" />
                            </div>
                            <span className="text-xl font-[800] text-slate-800 tracking-tight">Mercado Confiável</span>
                        </div>

                        <p className="text-sm font-medium text-slate-500 leading-relaxed">
                            Conectamos todos os intervenientes da cadeia de valor agrária em Moçambique, desde produtores e fornecedores até ao consumidor final, garantindo integridade e eficiência em cada transação.
                        </p>

                        <Link href="/mercado" onClick={onClose} className="inline-flex items-center justify-center px-8 py-3 bg-emerald-600 hover:bg-[#f97316] text-white font-bold rounded-[8px] transition-all shadow-lg shadow-emerald-500/20 hover:shadow-orange-500/30 transform hover:-translate-y-0.5 active:scale-95 text-sm">
                            Saiba mais
                        </Link>
                    </div>

                    {/* Right Section - Grid of Cards */}
                    <div className="flex-[1.2] w-full max-w-[700px]">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {marketCategories.map((cat) => (
                                <Link
                                    key={cat.id}
                                    href={cat.link}
                                    onClick={onClose}
                                    className="group flex items-center justify-between p-6 bg-slate-50/80 hover:bg-white rounded-[20px] border border-transparent hover:border-orange-100 hover:shadow-[0_8px_30px_rgba(249,115,22,0.08)] transition-all duration-300"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-14 h-14 rounded-full bg-orange-100/50 flex items-center justify-center group-hover:bg-orange-500 transition-colors duration-300">
                                            <cat.icon className="w-6 h-6 text-[#f97316] group-hover:text-white transition-colors duration-300" />
                                        </div>
                                        <span className="text-[15px] font-bold text-slate-800 group-hover:text-[#f97316] transition-colors line-clamp-2">
                                            {cat.title}
                                        </span>
                                    </div>
                                    <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-[#f97316] transform group-hover:translate-x-1 transition-all" />
                                </Link>
                            ))}
                        </div>
                    </div>

                </div>
            </div>
            {/* Background Accent */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-orange-50/30 rounded-full -translate-y-1/2 translate-x-1/4 blur-3xl -z-10" />
        </div>
    );
}
