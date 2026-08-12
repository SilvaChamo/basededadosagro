"use client";

import React, { useState } from "react";
import { StandardBlogTemplate } from "@/components/StandardBlogTemplate";
import { CheckCircle2, MapPin, Globe, Phone, Mail, Package, ArrowRight, Share2, Facebook, Twitter, Linkedin } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function StandardCompanyDetailsPage() {
    const products = [
        { name: "Castanha de Caju Refinada", price: "500 MT/kg", img: "/images/Prototipo/caju.webp", available: true },
        { name: "Algodão em Fardo", price: "Sob Consulta", img: "/images/Prototipo/algodao.png", available: true },
        { name: "Sementes Selecionadas", price: "250 MT/pk", img: "https://images.unsplash.com/photo-1464226184884-fa280b87c399?q=80&w=800", available: false },
    ];

    const [activeShareProduct, setActiveShareProduct] = useState<number | null>(null);
    const [showCompanyShare, setShowCompanyShare] = useState(false);

    const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
    const shareTitle = "Agro-Indústria Zambézia";

    const shareOptions = [
        { name: 'WhatsApp', icon: <Share2 className="w-4 h-4" />, color: 'hover:bg-green-500', url: '#' },
        { name: 'Facebook', icon: <Facebook className="w-4 h-4" />, color: 'hover:bg-blue-600', url: '#' },
        { name: 'Twitter', icon: <Twitter className="w-4 h-4" />, color: 'hover:bg-sky-500', url: '#' },
    ];

    return (
        <StandardBlogTemplate
            title="Agro-Indústria Zambézia"
            backgroundImage="/images/Prototipo/sala3.jpg"
            breadcrumbs={[
                { label: "Início", href: "/" },
                { label: "Empresas", href: "/empresas" },
                { label: "Agro-Indústria Zambézia" }
            ]}
            sidebarComponents={
                <div className="space-y-agro">
                    {/* Status Card */}
                    <div className="card-agro-static group">
                        <div className="flex items-center gap-2 mb-4">
                            <CheckCircle2 className="text-emerald-500 w-5 h-5" />
                            <span className="font-bold text-sm text-emerald-700 uppercase tracking-wider">Empresa Verificada</span>
                        </div>
                        <p className="text-xs text-slate-400 mb-4">Verificado em: 12 Jan 2024</p>
                        <button className="btn-primary w-full text-xs">Contactar Empresa</button>
                    </div>

                    {/* Contacts Card */}
                    <div className="card-agro-static group">
                        <h4 className="mb-4">Contactos Diretos</h4>
                        <ul className="space-y-4">
                            <li className="flex items-start gap-3">
                                <MapPin className="w-4 h-4 text-slate-400 mt-1" />
                                <span className="text-sm font-medium">Av. 25 de Setembro, Quelimane</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <Phone className="w-4 h-4 text-slate-400 mt-1" />
                                <span className="text-sm font-medium">+258 84 123 4567</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <Mail className="w-4 h-4 text-slate-400 mt-1" />
                                <span className="text-sm font-medium">info@zambezia.co.mz</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <Globe className="w-4 h-4 text-slate-400 mt-1" />
                                <span className="text-sm font-medium">www.zambezia.co.mz</span>
                            </li>
                        </ul>
                    </div>
                </div>
            }
        >
            <div className="space-y-agro">
                {/* Facebook Style Banner (Reduced Height) */}
                <div className="relative w-full h-[280px] rounded-agro-lg overflow-hidden shadow-lg border border-slate-100/50">
                    <Image
                        src="/images/Prototipo/sala1.jpg"
                        alt="Company Cover"
                        fill
                        className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end p-8">
                        <div className="flex items-end gap-6 w-full">
                            <div className="w-24 h-24 bg-white rounded-agro p-2 shadow-2xl shrink-0 border border-slate-100">
                                <img src="https://placehold.co/100x100/f97316/white?text=LOGO" alt="Logo" className="w-full h-full object-contain" />
                            </div>
                            <div className="text-white mb-2 flex-1 flex items-end justify-between">
                                <div>
                                    <h1 className="text-3xl md:text-4xl font-black mb-1 text-white leading-tight drop-shadow-md uppercase tracking-tighter">Agro-Indústria Zambézia</h1>
                                    <p className="text-white/90 font-medium drop-shadow-sm">Processamento de Castanha de Caju e Algodão</p>
                                </div>
                                <div className="relative">
                                    <button
                                        onClick={() => setShowCompanyShare(!showCompanyShare)}
                                        className="flex items-center justify-center w-10 h-10 bg-white/20 backdrop-blur-md hover:bg-white hover:text-orange-600 text-white rounded-full transition-all border border-white/30"
                                    >
                                        <Share2 className="w-5 h-5" />
                                    </button>

                                    {showCompanyShare && (
                                        <div className="absolute right-0 bottom-full mb-2 bg-white border border-slate-100 shadow-xl rounded-xl p-2 z-50 flex gap-1 animate-in fade-in slide-in-from-bottom-2">
                                            {shareOptions.map((opt) => (
                                                <button key={opt.name} className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${opt.color} hover:text-white text-slate-400`}>
                                                    {opt.icon}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="card-agro-lg">
                    <h2 className="mb-4">Sobre a Empresa</h2>
                    <div className="prose prose-slate max-w-none font-sans text-slate-500">
                        <p>
                            A <strong>Agro-Indústria Zambézia</strong> é líder no processamento e exportação de castanha de caju na região centro de Moçambique. Fundada em 2010, nossa missão é agregar valor à produção local e garantir preços justos aos pequenos produtores.
                        </p>
                    </div>
                </div>

                {/* Product Grid Section (3 items per line) */}
                <div className="card-agro-lg">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-orange-50 text-orange-600 rounded-lg flex items-center justify-center">
                                <Package className="w-5 h-5" />
                            </div>
                            <h3 className="mb-0 text-xl font-black uppercase tracking-tight">Catálogo de Produtos</h3>
                        </div>
                        <Link
                            href="/design-system/arquivo-produtos"
                            className="text-sm font-bold text-[#f97316] hover:underline flex items-center gap-1 transition-all"
                        >
                            Ver todos os produtos
                            <ArrowRight className="w-4 h-4 ml-1" />
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-agro">
                        {products.map((product, i) => (
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

                                    <div className="flex items-center gap-1 text-white/90 text-[11px] font-bold mt-2 hover:text-white transition-colors">
                                        <span>Ver detalhes</span>
                                        <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-2" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </StandardBlogTemplate>
    );
}
