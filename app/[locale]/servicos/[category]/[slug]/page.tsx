"use client";

import { useParams, notFound } from "next/navigation";
import { PageHeader } from "@/components/PageHeader";
import { servicesData } from "@/lib/services-data";
import {
    CheckCircle2,
    ArrowRight,
    Star,
    Briefcase,
    Building2,
    MapPin as MapPinIcon,
    ShoppingBag
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { IconMap } from "@/lib/icons";
import { Spinner } from "@/components/ui/spinner";

export default function ServiceSubCategoryPage() {
    const params = useParams();
    const supabase = createClient();
    const categoryId = params.category as string;
    const slug = params.slug as string;

    const [loading, setLoading] = useState(true);
    const [dynamicService, setDynamicService] = useState<any>(null);

    // Fallback static data
    const category = servicesData[categoryId];
    const staticService = category?.subCategories[slug];

    useEffect(() => {
        async function fetchService() {
            setLoading(true);
            try {
                const { data, error } = await supabase
                    .from("services")
                    .select("*")
                    .eq("slug", slug)
                    .eq("is_active", true)
                    .single();

                if (data && !error) {
                    setDynamicService(data);
                }
            } catch (err) {
                console.error("Error fetching dynamic service:", err);
            } finally {
                setLoading(false);
            }
        }

        fetchService();
    }, [slug, supabase]);

    const [stores, setStores] = useState<any[]>([]);
    const [products, setProducts] = useState<any[]>([]);
    const [loadingStores, setLoadingStores] = useState(false);
    const [loadingProducts, setLoadingProducts] = useState(false);

    const slugify = (text: string) => (text || "").toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '');

    useEffect(() => {
        async function fetchContent() {
            if (!slug || (categoryId !== 'lojas' && categoryId !== 'insumos')) return;
            setLoadingStores(true);
            setLoadingProducts(true);
            try {
                // 1. Fetch Products for this subcategory
                const { data: productData, error: productError } = await supabase
                    .from('products')
                    .select('*, companies(id, name, slug, province)')
                    .ilike('category', `%${slug}%`)
                    .limit(12);

                if (productData) {
                    setProducts(productData.map((p: any) => ({
                        ...p,
                        nome: p.name || p.nome,
                        preco: p.price || p.preco || "Sob Consulta",
                        image_url: p.image_url || p.imagem || "https://images.unsplash.com/photo-1595152248447-c93d5006b00b?q=80&w=400",
                        company_slug: p.companies?.slug,
                        company_name: p.companies?.name
                    })));

                    // 2. Derive stores from products or fetch them
                    const companyIds = Array.from(new Set(productData.map((p: any) => p.company_id).filter((id: any) => id)));

                    if (companyIds.length > 0) {
                        const { data: companyData } = await supabase
                            .from('companies')
                            .select('*')
                            .in('id', companyIds)
                            .limit(5);
                        if (companyData) setStores(companyData);
                    }
                }
            } catch (err) {
                console.error("Error fetching content for category:", err);
            } finally {
                setLoadingStores(false);
                setLoadingProducts(false);
            }
        }

        fetchContent();
    }, [slug, categoryId, supabase]);

    // Decide which data to use
    const service = dynamicService || staticService;

    if (!service && !loading) {
        return notFound();
    }

    // Default values and mapping if using dynamic service
    const title = service?.title || "";
    const fullDescription = service?.full_description || service?.fullDescription || "";
    const subServices = service?.sub_services || service?.subServices || [];
    const features = service?.features || [];

    // Icon handling
    const rawIcon = service?.icon;
    const Icon = typeof rawIcon === "string" ? (IconMap[rawIcon] || Briefcase) : (rawIcon || Briefcase);

    const isTalentoAgrario = slug === 'talento';
    const contactHref = isTalentoAgrario ? "/servicos/registo-talento" : "/contactos";
    const contactText = isTalentoAgrario ? "Registar Profissional" : "Conectar Agora";

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <Spinner className="h-12 w-12" />
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-slate-50">
            <PageHeader
                title={title}
                icon={Icon}
                backgroundImage="https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?q=80&w=2000&auto=format&fit=crop"
                breadcrumbs={[
                    { label: "Início", href: "/" },
                    { label: "Serviços", href: "/servicos" },
                    { label: category?.title || "Geral", href: category ? `/servicos/${categoryId}` : "/servicos" },
                    { label: title, href: undefined }
                ]}
            />

            <div className="container-site relative z-20 mt-[60px] pb-24">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">

                    {/* Main Content */}
                    <div className="lg:col-span-8 space-y-5">

                        {/* Products Grid - Shown first if products exist */}
                        {(categoryId === 'lojas' || categoryId === 'insumos') && (
                            <section className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                                        <ShoppingBag className="w-6 h-6 text-orange-500" />
                                        {categoryId === 'insumos' ? `${title} Disponíveis` : 'Produtos Disponíveis'}
                                    </h2>
                                    {products.length > 0 && (
                                        <span className="text-sm font-bold text-slate-400">
                                            {products.length} {products.length === 1 ? 'item encontrado' : 'itens encontrados'}
                                        </span>
                                    )}
                                </div>

                                {loadingProducts ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                        {[1, 2].map((i) => (
                                            <div key={i} className="h-[350px] bg-white rounded-xl border border-slate-100 animate-pulse" />
                                        ))}
                                    </div>
                                ) : products.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                        {products.map((product, i) => {
                                            const prodUrl = `/empresas/${product.company_slug}/produto/${slugify(product.nome)}`;
                                            return (
                                                <div
                                                    key={product.id || i}
                                                    className="group bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col"
                                                >
                                                    <Link href={prodUrl} className="relative h-44 block overflow-hidden">
                                                        <Image
                                                            src={product.image_url}
                                                            alt={product.nome}
                                                            fill
                                                            className="object-cover group-hover:scale-105 transition-transform duration-700"
                                                        />
                                                    </Link>
                                                    <div className="p-4 flex-1 flex flex-col gap-2">
                                                        <div className="flex items-center gap-1.5 opacity-60">
                                                            <Building2 className="w-3 h-3" />
                                                            <span className="text-[10px] font-black uppercase tracking-widest truncate">
                                                                {product.company_name}
                                                            </span>
                                                        </div>
                                                        <Link href={prodUrl}>
                                                            <h3 className="text-[16px] font-black text-slate-800 line-clamp-1 group-hover:text-orange-600 transition-colors">{product.nome}</h3>
                                                        </Link>
                                                        <div className="mt-auto pt-3 border-t border-slate-50 flex items-center justify-between">
                                                            <div className="text-emerald-600 font-black text-[16px]">
                                                                {typeof product.preco === 'number' ? `${product.preco.toLocaleString('pt-MZ')} MT` : product.preco}
                                                            </div>
                                                            <Link
                                                                href={prodUrl}
                                                                className="text-[10px] font-black uppercase tracking-wider text-[#f97316] flex items-center gap-1"
                                                            >
                                                                VER MAIS <ArrowRight className="w-3 h-3" />
                                                            </Link>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className="bg-slate-100/50 rounded-xl p-10 text-center border-2 border-dashed border-slate-200">
                                        <p className="text-slate-500 font-medium">
                                            Nenhum {categoryId === 'insumos' ? title.toLowerCase() : 'produto'} cadastrado nesta categoria no momento.
                                        </p>
                                    </div>
                                )}
                            </section>
                        )}

                        {/* Overview Section */}
                        <section className="bg-white p-[40px] rounded-xl border border-slate-200 shadow-sm space-y-8">
                            <div>
                                <h2 className="text-2xl font-black text-slate-900 mb-6 tracking-tight">Sobre esta Categoria</h2>
                                <div className="space-y-4">
                                    {fullDescription.split('\n').filter((p: string) => p.trim() !== '').map((paragraph: string, index: number) => (
                                        <p key={index} className="text-base text-slate-600 leading-relaxed font-medium">
                                            {paragraph.trim()}
                                        </p>
                                    ))}
                                </div>
                                {slug === 'registo' && (
                                    <div className="pt-6">
                                        <div className="relative z-50">
                                            <Link
                                                href="/registar"
                                                className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-md font-bold text-[13px] hover:!bg-[#f97316] transition-all group shadow-md shadow-emerald-500/10 hover:shadow-orange-500/20 cursor-pointer"
                                            >
                                                Registe a sua Empresa Agora
                                                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                            </Link>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {subServices.length > 0 && (
                                <div className="pt-6 border-t border-slate-100 space-y-6">
                                    <div className="flex items-center gap-3 py-1">
                                        <div className="w-4 h-[2.5px] bg-[#f97316]" />
                                        <h3 className="text-[13px] font-black text-slate-400 tracking-[0.2em] uppercase">
                                            Soluções Especializadas
                                        </h3>
                                    </div>
                                    <div className="space-y-6">
                                        {subServices.map((sub: any, i: number) => (
                                            <div key={i} className="flex flex-col gap-0.5">
                                                <div className="flex items-center gap-2.5">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-[#f97316]" />
                                                    <h4 className="text-[15px] font-black text-slate-800 tracking-tight">
                                                        {sub.title}
                                                    </h4>
                                                </div>
                                                <p className="text-[14px] text-slate-500 font-medium leading-[1.5] pl-4 border-l border-slate-100">
                                                    {sub.description}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </section>
                    </div>

                    {/* Sidebar / Features */}
                    <div className="lg:col-span-4 space-y-5">
                        {/* Stores Section */}
                        {(categoryId === 'lojas' || categoryId === 'insumos') && stores.length > 0 && (
                            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
                                <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                                    <Building2 className="w-5 h-5 text-emerald-600" />
                                    {categoryId === 'insumos' ? 'Onde Encontrar' : 'Lojas que Disponibilizam'}
                                </h3>
                                <div className="space-y-3">
                                    {stores.map((store, i) => (
                                        <Link
                                            key={i}
                                            href={`/empresas/${store.slug || store.id}`}
                                            className="block p-3 rounded-lg bg-slate-50 border border-slate-100 hover:border-emerald-200 hover:bg-emerald-50 transition-all group"
                                        >
                                            <h4 className="font-bold text-slate-800 text-sm group-hover:text-emerald-700">{store.name}</h4>
                                            <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
                                                <MapPinIcon className="w-3 h-3" />
                                                <span>{store.province || "Moçambique"}</span>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                                <Link
                                    href="/servicos/insumos"
                                    className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 mt-2"
                                >
                                    Ver todas as lojas <ArrowRight className="w-3 h-3" />
                                </Link>
                            </div>
                        )}

                        {/* Benefits Card */}
                        {features.length > 0 && (
                            <div className="bg-slate-900 p-8 rounded-xl text-white shadow-xl relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 blur-[60px]" />
                                <h3 className="text-xl font-black mb-8 flex items-center gap-3 uppercase tracking-wider text-orange-400">
                                    <Star className="w-5 h-5" />
                                    Benefícios
                                </h3>
                                <ul className="space-y-6">
                                    {features.map((feature: string, i: number) => (
                                        <li key={i} className="flex items-start gap-4 group">
                                            <div className="w-6 h-6 rounded-full bg-orange-500/20 flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-orange-500 transition-colors">
                                                <CheckCircle2 className="w-4 h-4 text-orange-500 group-hover:text-white transition-colors" />
                                            </div>
                                            <span className="text-[15px] font-bold text-slate-200 leading-tight">
                                                {feature}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Quick Contact Card */}
                        <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm space-y-6">
                            <h4 className="text-lg font-black text-slate-900 tracking-tight truncate">
                                {isTalentoAgrario ? "Seja parceiro" : "Precisa de suporte?"}
                            </h4>
                            <p className="text-[14px] text-slate-500 font-medium line-clamp-2">
                                {isTalentoAgrario
                                    ? "Registe-se como profissional especializado para aceder a oportunidades exclusivas e gerir o seu perfil."
                                    : "Fale com um dos nossos consultores técnicos para entender como podemos ajudar no seu caso específico."}
                            </p>
                            <div className="relative z-50">
                                <Link
                                    href={contactHref}
                                    className="inline-flex items-center justify-center w-fit px-4 py-2 bg-emerald-600 text-white rounded-md font-bold text-[13px] hover:!bg-[#f97316] transition-all shadow-md shadow-emerald-500/10 hover:shadow-orange-500/20 cursor-pointer"
                                >
                                    {contactText}
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </main >
    );
}
