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
    MapPin as MapPinIcon
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { IconMap } from "@/lib/icons";

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
    const [loadingStores, setLoadingStores] = useState(false);

    useEffect(() => {
        async function fetchStores() {
            if (!slug || categoryId !== 'lojas') return;
            setLoadingStores(true);
            try {
                // Find companies that have products in this category
                // Note: We search by name match (case-insensitive) for better compatibility
                const { data: productData, error: productError } = await supabase
                    .from('products')
                    .select('company_id')
                    .ilike('category', `%${slug}%`);

                if (productData && productData.length > 0) {
                    const companyIds = Array.from(new Set(productData.map(p => p.company_id).filter(id => id)));

                    if (companyIds.length > 0) {
                        const { data: companyData, error: companyError } = await supabase
                            .from('companies')
                            .select('*')
                            .in('id', companyIds)
                            .limit(5);

                        if (companyData) setStores(companyData);
                    }
                }
            } catch (err) {
                console.error("Error fetching stores for category:", err);
            } finally {
                setLoadingStores(false);
            }
        }

        fetchStores();
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
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
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
                        {/* Integrated Overview & Sub-services Card */}
                        <section className="bg-white p-[40px] rounded-xl border border-slate-200 shadow-sm space-y-8">
                            <div>
                                <h2 className="text-3xl font-black text-slate-900 mb-6 tracking-tight">Visão Geral</h2>
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
                        {categoryId === 'lojas' && stores.length > 0 && (
                            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
                                <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                                    <Building2 className="w-5 h-5 text-emerald-600" />
                                    Lojas que Disponibilizam
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
        </main>
    );
}
