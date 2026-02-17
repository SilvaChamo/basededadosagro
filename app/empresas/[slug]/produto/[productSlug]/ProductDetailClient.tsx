"use client";

import React from 'react';
import Image from 'next/image';
import { StandardBlogTemplate } from "@/components/StandardBlogTemplate";
import {
    Share2,
    Facebook,
    ShoppingCart,
    ShieldCheck,
    Building2,
    Package,
    Tag,
    MapPin,
    ExternalLink,
    Info,
    TrendingUp,
    Eye,
    Truck,
    Clock,
    MessageSquare,
    Send,
    X,
    CheckCircle2
} from 'lucide-react';
import { useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { toast } from 'sonner';
import Link from 'next/link';

interface Company {
    name: string;
    logo_url?: string;
    header_bg?: string;
    banner_url?: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any;
}

interface Product {
    name: string;
    price: string | number;
    img?: string;
    photo?: string;
    image_url?: string;
    available?: boolean;
    description?: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any;
}

interface OtherSeller {
    id: string;
    name: string;
    price: string | number;
    company: {
        name: string;
        logo_url: string;
        slug: string;
    };
}

const WhatsAppIcon = ({ className }: { className?: string }) => (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className || "w-5 h-5"}>
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
    </svg>
);

export default function ProductDetailClient({
    company,
    product,
    companySlug,
    otherSellers = [],
    similarProducts = []
}: {
    company: Company,
    product: Product,
    companySlug: string,
    otherSellers?: OtherSeller[],
    similarProducts?: (Product & { companySlug: string })[]
}) {

    const [stats, setStats] = useState({ views: 0, leads: 0 });
    const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [honeypot, setHoneypot] = useState("");
    const [formLoadTime, setFormLoadTime] = useState(0);
    const supabase = createClient();

    // Track View & Fetch Stats
    React.useEffect(() => {
        if (product?.id) {
            const initStats = async () => {
                // 1. Log view
                await supabase.from('page_views').insert({
                    target_type: 'product',
                    target_id: product.id,
                    user_id: company.user_id
                });

                // 2. Fetch counts
                const { count: viewCount } = await supabase
                    .from('page_views')
                    .select('*', { count: 'exact', head: true })
                    .eq('target_type', 'product')
                    .eq('target_id', product.id);

                const { count: leadCount } = await supabase
                    .from('leads')
                    .select('*', { count: 'exact', head: true })
                    .eq('source_type', 'product')
                    .eq('source_id', product.id);

                setStats({ views: viewCount || 0, leads: leadCount || 0 });
            };
            initStats();
        }
    }, [product?.id]);

    // Update formLoadTime when modal opens
    React.useEffect(() => {
        if (isQuoteModalOpen) {
            setFormLoadTime(Date.now());
        }
    }, [isQuoteModalOpen]);

    const handleQuoteSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        // Anti-spam checks
        if (honeypot) {
            console.warn("Spam detected: honeypot filled");
            toast.error("Erro ao enviar solicitação.");
            return;
        }

        const timeTaken = Date.now() - formLoadTime;
        if (timeTaken < 4000) { // 4 seconds for a small quote form
            console.warn("Spam detected: submitted too quickly", timeTaken);
            toast.error("Por favor, preencha o formulário com mais calma.");
            return;
        }

        setSubmitting(true);
        const formData = new FormData(e.currentTarget);

        const data = {
            user_id: company.user_id,
            sender_name: formData.get("sender_name") as string,
            sender_email: formData.get("sender_email") as string,
            sender_phone: formData.get("sender_phone") as string,
            subject: `Solicitação de Cotação: ${product.name}`,
            message: formData.get("message") as string,
            source_type: 'product',
            source_id: product.id,
            status: 'new'
        };

        try {
            const { error } = await supabase.from('leads').insert(data);
            if (error) throw error;
            toast.success("Solicitação enviada com sucesso!");
            setIsQuoteModalOpen(false);
            // Increment local interest count
            setStats(prev => ({ ...prev, leads: prev.leads + 1 }));
        } catch (error) {
            console.error("Error sending quote:", error);
            toast.error("Erro ao enviar solicitação. Tente novamente.");
        } finally {
            setSubmitting(false);
        }
    };

    const shareUrl = typeof window !== 'undefined' ? window.location.href : '';

    const handleShare = (type: 'whatsapp' | 'facebook' | 'linkedin' | 'twitter' | 'copy') => {
        const text = encodeURIComponent(`Confira este produto: ${product.name} de ${company.name} no BaseAgroData - ${shareUrl}`);

        switch (type) {
            case 'whatsapp':
                window.open(`https://wa.me/?text=${text}`, '_blank');
                break;
            case 'facebook':
                window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank');
                break;
            case 'linkedin':
                window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`, '_blank');
                break;
            case 'twitter':
                window.open(`https://twitter.com/intent/tweet?text=${text}`, '_blank');
                break;
            case 'copy':
                navigator.clipboard.writeText(shareUrl);
                alert('Link copiado para a área de transferência!');
                break;
        }
    };

    const handleOrder = () => {
        // Prioritize secondary_contact (labeled as 'Nº de WhatsApp' in the form)
        const waContact = company.secondary_contact || company.contact || "";
        const phone = waContact.replace(/\D/g, '');
        const message = encodeURIComponent(`Olá! Tenho interesse no produto *${product.name}* que vi no BaseAgroData. Poderiam dar-me mais informações?`);

        if (phone) {
            window.open(`https://wa.me/${phone.startsWith('258') ? phone : '258' + phone}?text=${message}`, '_blank');
        } else {
            alert('Esta empresa ainda não disponibilizou um contacto de WhatsApp.');
        }
    };

    const handleQuoteRequest = () => {
        setIsQuoteModalOpen(true);
    };

    return (
        <StandardBlogTemplate
            title={product.name}
            backgroundImage={company.header_bg || "/images/Prototipo/sala2.jpg"}
            isSidebarLeft={true}
            breadcrumbs={[
                { label: "Início", href: "/" },
                { label: "Empresas", href: "/empresas" },
                { label: company.name, href: `/empresas/${companySlug}` },
                { label: product.name }
            ]}
            sidebarComponents={
                <div className="space-y-agro">
                    {/* WIDE PRODUCT CARD (LEFT SIDEBAR) - 30% Approx */}
                    <div className="group bg-white rounded-[15px] border border-slate-200 shadow-md card-interactive transition-all duration-500 flex flex-col relative overflow-hidden">
                        <div className="relative h-[260px] w-full overflow-hidden">
                            <Image
                                src={product.image_url || product.img || product.photo || "/images/Prototipo/caju.webp"}
                                alt={product.name}
                                fill
                                className="object-cover transition-transform duration-700 group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60" />

                            <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between z-10">
                                <div className="flex flex-col gap-2">
                                    <div className="bg-emerald-600/90 backdrop-blur-md text-white text-[9px] font-bold px-2.5 py-1.5 rounded-md shadow-lg border border-white/10 flex items-center gap-1.5">
                                        <ShieldCheck className="w-3 h-3" />
                                        Catálogo oficial
                                    </div>
                                    {company.is_verified && (
                                        <div className="bg-blue-600/90 backdrop-blur-md text-white text-[9px] font-bold px-2.5 py-1.5 rounded-md shadow-lg border border-white/10 flex items-center gap-1.5 animate-in fade-in zoom-in duration-500">
                                            <CheckCircle2 className="w-3 h-3" />
                                            Vendedor Verificado
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>


                        <div className="p-6 flex flex-col pt-4">
                            <h2 className="text-2xl font-black text-black/75 tracking-tighter mb-4 pb-3 border-b border-slate-200 leading-tight">
                                {product.name}
                            </h2>

                            <div className="flex items-center gap-2 mb-4">
                                <span className={`text-[9px] font-black uppercase tracking-[0.1em] px-2.5 py-1 rounded-full border ${product.available !== false ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'}`}>
                                    {product.available !== false ? '● Disponível' : '● Indisponível'}
                                </span>
                            </div>

                            <p className="text-sm font-bold text-slate-400 mb-6 leading-normal">
                                Disponível para encomenda direta via BaseAgroData em Moçambique.
                            </p>

                            <div className="flex items-center gap-2 text-lg font-black text-[#f97316]">
                                <Tag className="w-5 h-5" />
                                {product.price} MT
                            </div>
                        </div>


                    </div>

                </div >
            }
        >
            <div className="space-y-agro pb-20">
                {/* QUOTE MODAL */}
                {isQuoteModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                        <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl animate-in zoom-in-95 duration-200 relative">
                            <button
                                onClick={() => setIsQuoteModalOpen(false)}
                                className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 bg-slate-50 hover:bg-slate-100 rounded-full transition-all"
                            >
                                <X className="w-4 h-4" />
                            </button>

                            <h3 className="text-xl font-black text-slate-800 mb-1">Solicitar Cotação</h3>
                            <p className="text-sm text-slate-500 mb-6 font-medium">Preencha os dados e a empresa receberá sua solicitação.</p>

                            <form onSubmit={handleQuoteSubmit} className="space-y-4">
                                <input name="product_id" type="hidden" value={product.id || ""} />
                                <input name="company_id" type="hidden" value={company.id || ""} />

                                {/* Honeypot field - hidden from users, visible to bots */}
                                <div className="absolute -left-[9999px] opacity-0 pointer-events-none" aria-hidden="true">
                                    <label htmlFor="website_url">Website</label>
                                    <input
                                        type="text"
                                        id="website_url"
                                        name="website_url"
                                        tabIndex={-1}
                                        autoComplete="off"
                                        value={honeypot}
                                        onChange={(e) => setHoneypot(e.target.value)}
                                    />
                                </div>

                                <div>
                                    <label className="block text-[11px] font-black uppercase tracking-wider text-slate-500 mb-1.5">Seu Nome</label>
                                    <input
                                        name="sender_name"
                                        required
                                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                                        placeholder="Nome completo"
                                    />
                                </div>

                                <div>
                                    <label className="block text-[11px] font-black uppercase tracking-wider text-slate-500 mb-1.5">Seu Email</label>
                                    <input
                                        name="sender_email"
                                        type="email"
                                        required
                                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                                        placeholder="email@exemplo.com"
                                    />
                                </div>

                                <div>
                                    <label className="block text-[11px] font-black uppercase tracking-wider text-slate-500 mb-1.5">Telefone (Opcional)</label>
                                    <input
                                        name="sender_phone"
                                        type="tel"
                                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                                        placeholder="+258 84 123 4567"
                                    />
                                </div>

                                <div>
                                    <label className="block text-[11px] font-black uppercase tracking-wider text-slate-500 mb-1.5">Mensagem</label>
                                    <textarea
                                        name="message"
                                        required
                                        rows={3}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm font-medium text-slate-700 outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 resize-none"
                                        defaultValue={`Olá, gostaria de receber uma cotação para o produto: ${product.name}.`}
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="w-full bg-[#f97316] hover:bg-[#ea580c] text-white font-black uppercase tracking-wider text-xs py-3.5 rounded-xl shadow-lg shadow-orange-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                                >
                                    {submitting ? "Enviando..." : "Enviar Solicitação"}
                                    {!submitting && <Send className="w-4 h-4" />}
                                </button>
                            </form>
                        </div>
                    </div>
                )}

                {/* MAIN CONTENT (RIGHT COLUMN) - Strictly no forced uppercase */}
                <div className="bg-white border border-slate-200 rounded-[15px] shadow-sm min-h-[600px] p-10">
                    <h1 className="text-2xl font-black text-black/75 mb-[46px] flex items-center gap-2 relative">
                        <Package className="w-5 h-5 text-emerald-500" />
                        Detalhes do produto
                        <div className="absolute -bottom-4 left-0 w-20 h-1 bg-emerald-500 rounded-full" />
                        <div className="absolute -bottom-4 left-0 w-full h-px bg-slate-200" />
                    </h1>

                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-8">
                        <div className="space-y-4">
                            <div className="flex items-start gap-3">
                                <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shrink-0 border border-slate-200">
                                    <Tag className="w-3.5 h-3.5 text-primary" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-[9px] font-black text-slate-400 mb-0.5 uppercase tracking-wider">Preço sugerido</p>
                                    <p className="text-base font-black text-accent tracking-tighter">{product.price} MT</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shrink-0 border border-slate-200">
                                    <ShieldCheck className="w-3.5 h-3.5 text-primary" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-[9px] font-black text-slate-400 mb-0.5 uppercase tracking-wider">Estado de disponibilidade</p>
                                    <p className={`text-sm font-bold ${product.available !== false ? 'text-primary' : 'text-red-500'}`}>
                                        {product.available !== false ? 'Disponível para encomenda' : 'Temporariamente indisponível'}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shrink-0 border border-slate-200">
                                    <Package className="w-3.5 h-3.5 text-primary" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-[9px] font-black text-slate-400 mb-0.5 uppercase tracking-wider">Categoria de produto</p>
                                    <p className="text-sm font-bold text-slate-700">Agrícolas processados</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shrink-0 border border-slate-200">
                                    <MapPin className="w-3.5 h-3.5 text-primary" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-[9px] font-black text-slate-400 mb-0.5 uppercase tracking-wider">Origem ou produção</p>
                                    <p className="text-sm font-bold text-slate-700">Zambézia, Moçambique</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shrink-0 border border-slate-200">
                                    <Truck className="w-3.5 h-3.5 text-primary" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-[9px] font-black text-slate-400 mb-0.5 uppercase tracking-wider">Entrega estimada</p>
                                    <p className="text-sm font-bold text-slate-700">3 a 7 dias úteis</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shrink-0 border border-slate-200">
                                    <Clock className="w-3.5 h-3.5 text-primary" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-[9px] font-black text-slate-400 mb-0.5 uppercase tracking-wider">Resposta média</p>
                                    <p className="text-sm font-bold text-slate-700">Menos de 24 horas</p>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-slate-50 mt-2">
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="w-6 h-6 rounded bg-white flex items-center justify-center shrink-0 border border-slate-200">
                                        <Info className="w-3 h-3 text-accent" />
                                    </div>
                                    <h3 className="text-[10px] font-black text-slate-700 uppercase tracking-widest !mb-0">Descrição</h3>
                                </div>
                                <p className="text-slate-500 font-medium leading-normal text-[12px]">
                                    {product.description || "Este produto foi processado sob rigorosos padrões de qualidade internacionais."}
                                </p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            {/* Company Quick Link Card - Moved from sidebar */}
                            <div className="bg-white rounded-[10px] border border-slate-200 p-4 shadow-sm hover:border-emerald-200 transition-colors group">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-slate-50 rounded-lg p-1.5 border border-slate-100 shrink-0">
                                        {company.logo_url ? (
                                            <Image src={company.logo_url} alt="Logo" width={32} height={32} className="w-full h-full object-contain" />
                                        ) : (
                                            <Building2 className="w-full h-full text-slate-200" />
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[10px] font-black text-slate-400 leading-none mb-1.5 uppercase tracking-wider">{company.name}</p>
                                        <Link
                                            href={`/empresas/${companySlug}`}
                                            className="text-xs font-bold text-primary hover:text-accent transition-all flex items-center gap-1"
                                        >
                                            Ver perfil completo
                                            <ExternalLink className="w-3 h-3" />
                                        </Link>
                                    </div>
                                </div>
                            </div>

                            {/* Share section relocated here - below company card */}
                            <div className="bg-white rounded-[10px] p-5 border border-slate-200 shadow-sm relative overflow-hidden group">
                                <h4 className="text-[10px] font-black text-slate-400 mb-4 tracking-widest uppercase">Partilhar produto</h4>
                                <div className="flex items-center gap-3">
                                    <button onClick={() => handleShare('whatsapp')} className="w-9 h-9 bg-white rounded-full flex items-center justify-center text-primary shadow-sm border border-slate-100 hover:bg-primary hover:text-white transition-all transform hover:-translate-y-1">
                                        <WhatsAppIcon className="w-5 h-5" />
                                    </button>
                                    <button onClick={() => handleShare('facebook')} className="w-9 h-9 bg-white rounded-full flex items-center justify-center text-blue-600 shadow-sm border border-slate-100 hover:bg-blue-600 hover:text-white transition-all transform hover:-translate-y-1">
                                        <Facebook className="w-5 h-5" />
                                    </button>
                                    <button onClick={() => handleShare('copy')} className="w-9 h-9 bg-white rounded-full flex items-center justify-center text-slate-400 shadow-sm border border-slate-100 hover:bg-slate-100 transition-all transform hover:-translate-y-1">
                                        <Share2 className="w-4.5 h-4.5" />
                                    </button>
                                </div>
                            </div>

                            <div className="bg-white rounded-[10px] p-6 border border-slate-200 shadow-md space-y-4">
                                <h4 className="text-[10px] font-black text-slate-400 mb-4 flex items-center justify-between tracking-widest uppercase">
                                    <span>Variações de interesse</span>
                                    <TrendingUp className="w-4 h-4 text-emerald-500" />
                                </h4>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-white rounded-[15px] p-4 border border-slate-200">
                                        <div className="flex items-center gap-2.5 mb-2">
                                            <Eye className="w-4 h-4 text-primary" />
                                            <span className="text-[10px] font-black text-slate-400 leading-none">Visitas</span>
                                        </div>
                                        <p className="text-2xl font-black text-slate-800 tracking-tight">{stats.views.toLocaleString()}</p>
                                    </div>

                                    <div className="bg-white rounded-[15px] p-4 border border-slate-200">
                                        <div className="flex items-center gap-2.5 mb-2">
                                            <ShoppingCart className="w-4 h-4 text-accent" />
                                            <span className="text-[10px] font-black text-slate-400 leading-none">Interesse</span>
                                        </div>
                                        <p className="text-2xl font-black text-slate-800 tracking-tight">{stats.leads.toLocaleString()}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-2 flex flex-col gap-3">
                                {/* New Quote Button */}
                                <button
                                    onClick={handleQuoteRequest}
                                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase tracking-wider text-xs py-3.5 rounded-xl shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center gap-2"
                                >
                                    <MessageSquare className="w-4 h-4" />
                                    Solicitar Cotação
                                </button>

                                {/* Existing Order Button */}
                                <button
                                    onClick={handleOrder}
                                    className="w-full bg-white border border-emerald-100 hover:bg-emerald-50 text-emerald-700 font-bold uppercase tracking-wider text-xs py-3.5 rounded-xl transition-all flex items-center justify-center gap-2"
                                >
                                    <WhatsAppIcon className="w-5 h-5 text-emerald-600" />
                                    Encomendar via WhatsApp
                                </button>
                            </div>
                        </div>
                    </div>


                    {/* Price Comparison / Other Sellers Section */}
                    {otherSellers.length > 0 && (
                        <div className="pt-10 border-t border-slate-200 mt-10">
                            <div className="flex items-center justify-between mb-8">
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-lg bg-white flex items-center justify-center border border-slate-200">
                                        <TrendingUp className="w-5 h-5 text-blue-600" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-black text-slate-800 !mb-0 tracking-tight">Comparar preços no mercado</h3>
                                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Outros fornecedores disponíveis</p>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-3">
                                {otherSellers.map((seller: any) => (
                                    <div key={seller.id} className="group bg-white border border-slate-200 rounded-[15px] p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all hover:border-blue-200 hover:shadow-md hover:shadow-blue-500/5">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-white rounded-lg p-2 border border-slate-200 group-hover:bg-white transition-colors">
                                                {seller.company.logo_url ? (
                                                    <Image src={seller.company.logo_url} alt={seller.company.name} width={40} height={40} className="w-full h-full object-contain" />
                                                ) : (
                                                    <Building2 className="w-full h-full text-slate-200" />
                                                )}
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-black text-slate-800 mb-1">{seller.company.name}</h4>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1 uppercase tracking-wider">
                                                        <MapPin className="w-3 h-3" />
                                                        Moçambique
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between md:justify-end gap-10">
                                            <div className="text-right">
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1.5">Preço cotado</p>
                                                <p className="text-xl font-black text-blue-600 tracking-tighter leading-none">
                                                    {seller.price} <span className="text-xs">MT</span>
                                                </p>
                                            </div>
                                            <Link
                                                href={`/empresas/${seller.company.slug}/produto/${encodeURIComponent(seller.name.toLowerCase().replace(/\s+/g, '-'))}`}
                                                className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                                            >
                                                <ExternalLink className="w-5 h-5" />
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Similar Products Section */}
                <div className="bg-white border border-slate-200 rounded-[15px] shadow-sm p-10 mt-agro">
                    <h3 className="text-2xl font-black text-black/75 mb-[46px] flex items-center gap-2 relative">
                        <Package className="w-5 h-5 text-emerald-500" />
                        Produtos semelhantes
                        <div className="absolute -bottom-4 left-0 w-20 h-1 bg-emerald-500 rounded-full" />
                        <div className="absolute -bottom-4 left-0 w-full h-px bg-slate-200" />
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {similarProducts.slice(0, 3).map((item: any, idx: any) => {
                            const itemSlug = (item.name || item.nome || "").toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '');
                            return (
                                <div key={item.id || idx} className="group bg-white border border-slate-200 rounded-[15px] overflow-hidden hover:shadow-md transition-all">
                                    <div className="relative h-40 w-full overflow-hidden">
                                        <Image
                                            src={item.image_url || item.img || item.photo || "/images/Prototipo/caju.webp"}
                                            alt={item.name}
                                            fill
                                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                                        />
                                    </div>
                                    <div className="p-4">
                                        <h4 className="text-sm font-black text-slate-800 mb-2 truncate">{item.name || "Produto"}</h4>
                                        <div className="flex items-center justify-between gap-2">
                                            <p className="text-primary font-black text-sm">{item.price} MT</p>
                                            <Link
                                                href={`/empresas/${item.companySlug}/produto/${itemSlug}`}
                                                className="text-[10px] font-bold text-slate-400 hover:text-primary uppercase tracking-wider flex items-center gap-1"
                                            >
                                                Ver detalhes
                                                <ExternalLink className="w-3 h-3" />
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </StandardBlogTemplate >
    );
}
