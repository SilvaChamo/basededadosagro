"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import { StandardBlogTemplate } from "@/components/StandardBlogTemplate";
import { Package, ArrowRight, Share2, Search, Filter, MessageCircle, Link as LinkIcon, Building2, Facebook, Linkedin, Twitter } from 'lucide-react';
import Link from 'next/link';

export default function ProductsArchiveClient({ company, slug, products }: { company: any, slug: string, products: any[] }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [activeProductShare, setActiveProductShare] = useState<number | null>(null);

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const WhatsAppIcon = ({ className }: { className?: string }) => (
        <svg viewBox="0 0 24 24" fill="currentColor" className={className || "w-5 h-5"}>
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
        </svg>
    );

    const shareUrl = typeof window !== 'undefined' ? `${window.location.origin}/empresas/${slug}/arquivo-produtos` : '';

    const slugify = (text: string) => text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '');

    const handleShare = (type: 'whatsapp' | 'facebook' | 'linkedin' | 'twitter' | 'copy', url: string, title: string) => {
        const text = encodeURIComponent(`Veja os produtos de ${company.name} no Base de Dados Agro: ${title} - ${url}`);

        switch (type) {
            case 'whatsapp':
                window.open(`https://wa.me/?text=${text}`, '_blank');
                break;
            case 'facebook':
                window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
                break;
            case 'linkedin':
                window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, '_blank');
                break;
            case 'twitter':
                window.open(`https://twitter.com/intent/tweet?text=${text}`, '_blank');
                break;
            case 'copy':
                navigator.clipboard.writeText(url);
                alert('Link copiado para a área de transferência!');
                break;
        }
    };

    return (
        <StandardBlogTemplate
            title={`Produtos - ${company.name}`}
            backgroundImage={company.header_bg || "/images/Prototipo/sala2.jpg"}
            breadcrumbs={[
                { label: "Início", href: "/" },
                { label: "Empresas", href: "/empresas" },
                { label: company.name, href: `/empresas/${slug}` },
                { label: "Arquivo de Produtos", href: `/empresas/${slug}/arquivo-produtos` }
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
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block">Categorias</label>
                                <div className="space-y-2">
                                    {['Todos', 'Cereais', 'Processados', 'Sementes'].map((cat, i) => (
                                        <label key={i} className="flex items-center gap-2 cursor-pointer group">
                                            <input type="radio" name="category" className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500" defaultChecked={i === 0} />
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

                    {/* Company Info Card */}
                    <div className="card-agro-static text-center py-8">
                        <div className="w-16 h-16 bg-white rounded-xl p-2 shadow-md mx-auto mb-4 border border-slate-100 flex items-center justify-center">
                            {company.logo_url ? (
                                <img src={company.logo_url} alt="Logo" className="w-full h-full object-contain" />
                            ) : (
                                <Building2 className="w-8 h-8 text-slate-200" />
                            )}
                        </div>
                        <p className="text-[10px] font-black text-slate-400 tracking-widest mb-1">{company.name}</p>
                        <Link href={`/empresas/${slug}`} className="text-xs font-bold text-emerald-600 hover:underline">
                            Ver Perfil Completo
                        </Link>
                    </div>
                </div>
            }
        >
            <div className="space-y-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="relative group max-w-lg flex-1">
                        <input
                            type="text"
                            placeholder={`Pesquisar nos produtos da ${company.name}...`}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full h-12 pl-12 pr-4 bg-white rounded-agro border border-slate-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition-all outline-none shadow-sm"
                        />
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                    </div>
                </div>

                {filteredProducts.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-agro pb-12">
                        {filteredProducts.map((product: any, i) => (
                            <Link
                                key={i}
                                href={`/empresas/${slug}/produto/${slugify(product.name)}`}
                                className="group bg-white rounded-agro overflow-hidden shadow-sm border border-slate-100 hover:shadow-md transition-all flex flex-col"
                            >
                                {/* Product Image + Category Badge */}
                                <div className="relative h-44 w-full overflow-hidden">
                                    <Image
                                        src={product.img || product.photo || "/images/Prototipo/caju.webp"}
                                        alt={product.name}
                                        fill
                                        className="object-cover group-hover:scale-105 transition-transform duration-700"
                                    />
                                    {product.category && (
                                        <div className="absolute top-3 left-3 z-10">
                                            <span className="bg-white/95 backdrop-blur-sm text-[10px] font-black text-emerald-600 uppercase tracking-widest px-2 py-1 rounded-md shadow-sm">
                                                {product.category}
                                            </span>
                                        </div>
                                    )}
                                    {/* Share Button Overlay */}
                                    <div className="absolute top-3 right-3 z-20">
                                        <button
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                setActiveProductShare(activeProductShare === i ? null : i);
                                            }}
                                            className="bg-white/20 backdrop-blur-md hover:bg-white hover:text-orange-600 text-white w-8 h-8 rounded-full flex items-center justify-center border border-white/30 transition-all opacity-0 group-hover:opacity-100"
                                        >
                                            <Share2 className="w-4 h-4" />
                                        </button>
                                        {activeProductShare === i && (
                                            <div className="absolute right-0 top-full mt-2 bg-white/90 backdrop-blur-md border border-slate-100 shadow-2xl rounded-full py-0.5 px-1.5 z-50 flex items-center gap-1 animate-in fade-in zoom-in slide-in-from-bottom-2">
                                                <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleShare('whatsapp', shareUrl, product.name); setActiveProductShare(null); }} className="w-8 h-8 flex items-center justify-center text-emerald-600 hover:bg-emerald-600 hover:text-white rounded-full transition-all">
                                                    <WhatsAppIcon className="w-4.5 h-4.5" />
                                                </button>
                                                <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleShare('facebook', shareUrl, product.name); setActiveProductShare(null); }} className="w-8 h-8 flex items-center justify-center text-blue-600 hover:bg-blue-600 hover:text-white rounded-full transition-all">
                                                    <Facebook className="w-4 h-4" />
                                                </button>
                                                <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleShare('linkedin', shareUrl, product.name); setActiveProductShare(null); }} className="w-8 h-8 flex items-center justify-center text-blue-700 hover:bg-blue-700 hover:text-white rounded-full transition-all">
                                                    <Linkedin className="w-4 h-4" />
                                                </button>
                                                <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleShare('twitter', shareUrl, product.name); setActiveProductShare(null); }} className="w-8 h-8 flex items-center justify-center text-sky-500 hover:bg-sky-500 hover:text-white rounded-full transition-all">
                                                    <Twitter className="w-4 h-4" />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Product Content */}
                                <div className="p-5 flex flex-col flex-1">
                                    <h4 className="text-[17px] font-black text-slate-800 mb-1 uppercase tracking-tight line-clamp-1">
                                        {product.name}
                                    </h4>
                                    <p className="text-slate-400 text-xs font-medium leading-relaxed mb-2 line-clamp-2">
                                        {product.description || "Descrição breve do produto disponível sob consulta."}
                                    </p>

                                    <div>
                                        {/* Price Section */}
                                        <p className="text-emerald-600 font-black text-[18px] mb-1.5">
                                            {product.price}
                                        </p>

                                        <div className="pt-2 border-t border-slate-50 flex items-center justify-between">
                                            {/* Details Link */}
                                            <div className="flex items-center gap-1 text-[#f97316] text-[11px] font-black uppercase tracking-wider group-hover:gap-2 transition-all">
                                                <span>DETALHES</span>
                                                <ArrowRight className="w-3.5 h-3.5" />
                                            </div>

                                            {/* Availability Badge */}
                                            <div className="flex items-center gap-1.5">
                                                <div className={`w-1.5 h-1.5 rounded-full ${product.available !== false ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
                                                <span className={`text-[10px] font-black uppercase tracking-widest ${product.available !== false ? 'text-emerald-500' : 'text-red-500'}`}>
                                                    {product.available !== false ? 'Disponível' : 'Indisponível'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="py-20 text-center border border-slate-100 border-dashed rounded-3xl bg-slate-50/50">
                        <Package className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                        <p className="text-slate-400 font-bold uppercase text-xs tracking-widest">Nenhum produto encontrado</p>
                    </div>
                )}
            </div>
        </StandardBlogTemplate>
    );
}
