"use client";

import React, { useState } from "react";
import { StandardBlogTemplate } from "@/components/StandardBlogTemplate";
import { Package, ArrowRight, Share2, Facebook, Twitter, Linkedin, Search, Filter } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function ProductsArchiveExamplePage() {
    const companyName = "Agro-Indústria Zambézia";

    const allProducts = [
        { id: 1, name: "Castanha de Caju Refinada", price: "500 MT/kg", img: "/images/Prototipo/caju.webp", available: true, company: companyName },
        { id: 2, name: "Algodão em Fardo", price: "Sob Consulta", img: "/images/Prototipo/algodao.png", available: true, company: companyName },
        { id: 3, name: "Óleo Vegetal Natural", price: "120 MT/L", img: "/images/Prototipo/oleo.webp", available: true, company: companyName },
        { id: 4, name: "Milho Branco", price: "18 MT/kg", img: "https://images.unsplash.com/photo-1551754655-cd27e38d2076?q=80&w=800", available: true, company: companyName },
        { id: 5, name: "Feijão Manteiga", price: "65 MT/kg", img: "/images/Prototipo/feijao.jpg", available: true, company: companyName },
        { id: 6, name: "Soja em Grão", price: "45 MT/kg", img: "/images/Prototipo/soja.jpg", available: false, company: companyName },
    ];

    const [activeShareProduct, setActiveShareProduct] = useState<number | null>(null);

    const shareOptions = [
        { name: 'WhatsApp', icon: <Share2 className="w-4 h-4" />, color: 'hover:bg-green-500', url: '#' },
        { name: 'Facebook', icon: <Facebook className="w-4 h-4" />, color: 'hover:bg-blue-600', url: '#' },
        { name: 'Twitter', icon: <Twitter className="w-4 h-4" />, color: 'hover:bg-sky-500', url: '#' },
    ];

    return (
        <StandardBlogTemplate
            title={`Produtos da ${companyName}`}
            backgroundImage="/images/Prototipo/sala2.jpg"
            breadcrumbs={[
                { label: "Início", href: "/" },
                { label: "Empresas", href: "/empresas" },
                { label: companyName, href: "/design-system/detalhes-empresa" },
                { label: "Produtos" }
            ]}
            sidebarComponents={
                <div className="space-y-agro">
                    <div className="card-agro-static">
                        <h4 className="flex items-center gap-2 mb-6">
                            <Filter className="w-4 h-4 text-emerald-600" />
                            Filtrar Produtos
                        </h4>

                        <div className="space-y-6">
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block">Categorias de {companyName}</label>
                                <div className="space-y-2">
                                    {['Cereais', 'Leguminosas', 'Processados'].map((cat, i) => (
                                        <label key={i} className="flex items-center gap-2 cursor-pointer group">
                                            <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500" defaultChecked={i === 0} />
                                            <span className="text-sm font-medium text-slate-600 group-hover:text-emerald-700">{cat}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <button className="btn-primary w-full shadow-emerald-200/50">
                                Pesquisar
                            </button>
                        </div>
                    </div>
                </div>
            }
        >
            <div className="space-y-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="relative group max-w-lg flex-1">
                        <input
                            type="text"
                            placeholder={`Pesquisar nos produtos da ${companyName}...`}
                            className="w-full h-12 pl-12 pr-4 bg-white rounded-agro border border-slate-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition-all outline-none shadow-sm"
                        />
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-agro">
                    {allProducts.map((product, i) => (
                        <div key={i} className="group relative h-[210px] rounded-agro overflow-hidden shadow-md card-interactive transition-all duration-300 cursor-pointer border border-slate-100/50 bg-white">
                            <Image
                                src={product.img}
                                alt={product.name}
                                fill
                                className="object-cover group-hover:scale-110 transition-transform duration-700"
                            />

                            <div className="absolute top-3 right-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                <button className="bg-white/20 backdrop-blur-md hover:bg-white hover:text-orange-600 text-white w-8 h-8 rounded-full flex items-center justify-center border border-white/30">
                                    <Share2 className="w-4 h-4" />
                                </button>
                            </div>

                            {/* Content Overlay */}
                            <div className="absolute inset-x-0 bottom-0 p-5 bg-gradient-to-t from-black/90 via-black/50 to-transparent flex flex-col justify-end h-full">
                                <h4 className="text-[17px] font-black text-white mb-1 line-clamp-2 leading-tight uppercase tracking-tight group-hover:mb-2 transition-all">
                                    {product.name}
                                </h4>

                                <div className="max-h-0 opacity-0 group-hover:max-h-6 group-hover:opacity-100 transition-all duration-300 ease-out overflow-hidden mb-1">
                                    <span className={`text-[10px] font-bold uppercase tracking-widest ${product.available ? 'text-emerald-400' : 'text-red-400'}`}>
                                        ● {product.available ? 'Disponível' : 'Indisponível'}
                                    </span>
                                </div>

                                <p className="text-[#f97316] font-black text-[16px] drop-shadow-sm mb-1">
                                    {product.price}
                                </p>

                                <div className="mt-2">
                                    <div className="flex items-center gap-1 text-white/90 text-[11px] font-bold hover:text-white transition-colors">
                                        <span>Ver detalhes</span>
                                        <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-2" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </StandardBlogTemplate>
    );
}
