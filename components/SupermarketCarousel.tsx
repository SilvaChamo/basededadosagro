"use client";

import React from "react";
import Link from "next/link";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel";
import { ShoppingCart, Store } from "lucide-react";

// Fotos de loja são representativas da marca (não fotografias das lojas em
// Moçambique especificamente) — guardadas localmente em vez de hotlink
// porque o CSP do site (next.config.ts, img-src) só permite alguns
// domínios, e o domínio do logo do Premier (premier.co.mz) já nem resolve.
const supermarkets = [
    {
        name: "Shoprite",
        bgImage: "/images/markets/shoprite_store.jpg",
    },
    {
        name: "Spar",
        bgImage: "/images/markets/spar_store.jpg",
    },
    {
        name: "Premier",
        color: "bg-slate-50",
        borderColor: "border-slate-100",
    },
    {
        name: "Game",
        color: "bg-red-50",
        borderColor: "border-red-100",
    },
];

export function SupermarketCarousel() {
    return (
        <div className="w-full bg-white rounded-[10px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-200 p-6 md:p-8 mb-8">
            <div className="flex items-center justify-between gap-3 mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                        <ShoppingCart className="w-5 h-5 text-[#f97316]" />
                    </div>
                    <div>
                        <h3 className="text-lg font-black text-slate-800 leading-none">Mercado Digital</h3>
                        <p className="text-xs text-slate-500 font-medium mt-1">Principais parceiros comerciais</p>
                    </div>
                </div>
                <Link
                    href="/registo-empresa"
                    className="shrink-0 inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black uppercase tracking-widest px-4 py-2.5 rounded-[7px] transition-colors"
                >
                    <Store className="w-4 h-4" />
                    Cadastrar Mercado
                </Link>
            </div>

            <Carousel
                opts={{
                    align: "start",
                    loop: true,
                }}
                className="w-full"
            >
                <CarouselContent className="-ml-6">
                    {supermarkets.map((market, index) => (
                        <CarouselItem key={index} className="pl-6 basis-1/2 md:basis-1/3 lg:basis-1/4">
                            {market.bgImage ? (
                                <div className="relative rounded-[10px] border border-slate-200 overflow-hidden h-32 group cursor-pointer hover:shadow-md transition-all">
                                    <img
                                        src={market.bgImage}
                                        alt=""
                                        className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                                    <span className="absolute bottom-3 left-0 right-0 text-center font-black text-white text-sm tracking-wide drop-shadow">
                                        {market.name}
                                    </span>
                                </div>
                            ) : (
                                <div className={`relative p-4 rounded-[10px] border overflow-hidden ${market.borderColor} ${market.color} h-32 flex flex-col items-center justify-center gap-2 group cursor-pointer hover:shadow-md transition-all`}>
                                    <div className="relative z-10 w-full h-12 flex items-center justify-center">
                                        <span className="font-black text-slate-700 text-center leading-tight">{market.name}</span>
                                    </div>
                                </div>
                            )}
                        </CarouselItem>
                    ))}
                </CarouselContent>
                <div className="flex justify-end gap-2 mt-4">
                    <CarouselPrevious className="relative left-0 top-0 translate-y-0 h-8 w-8 hover:bg-orange-100 hover:text-orange-600 border-slate-200" />
                    <CarouselNext className="relative right-0 top-0 translate-y-0 h-8 w-8 hover:bg-orange-100 hover:text-orange-600 border-slate-200" />
                </div>
            </Carousel>
        </div>
    );
}
