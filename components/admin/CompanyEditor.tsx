"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Building2, Globe, Mail, MapPin, Phone, Target, Eye, Heart, List, X, Loader2, FileText, Star, ShoppingBag, Plus, Trash2, ChevronDown, Check, Pencil } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { RichTextEditor } from "../RichTextEditor";
import { MOZ_DATA, SECTORS, SECTOR_CATEGORIES, VALUE_CHAINS, COMPANY_DESIGNATIONS, COMPANY_SIZES, ALL_CATEGORIES, STORE_CATEGORIES } from "@/lib/agro-data";
import { useRouter } from "next/navigation";
import { ImageUpload } from "./ImageUpload";
import { toSentenceCase } from "@/lib/utils";
import { Spinner } from "@/components/ui/spinner";



interface CompanyEditorProps {
    initialData?: any;
    isNew?: boolean;
    defaultType?: "Empresa" | "Loja";
}

export function CompanyEditor({ initialData, isNew = false, defaultType }: CompanyEditorProps) {
    const supabase = createClient();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: initialData?.name || "",
        nuit: initialData?.nuit || "",
        email: initialData?.email || "",
        contact: initialData?.contact || initialData?.phone || "",
        website: initialData?.website || "",
        address: initialData?.address || "",
        province: initialData?.province || "",
        district: initialData?.district || "",
        category: initialData?.category || initialData?.sector || "",
        value_chain: initialData?.value_chain || "",
        logo_url: initialData?.logo_url || "",
        banner_url: initialData?.banner_url || "",
        description: initialData?.description || "",
        mission: initialData?.mission || "",
        vision: initialData?.vision || "",
        values: initialData?.values || "",
        services: (() => {
            if (Array.isArray(initialData?.services)) return initialData.services;
            if (typeof initialData?.services === 'string' && initialData.services.trim()) {
                try {
                    const parsed = JSON.parse(initialData.services);
                    return Array.isArray(parsed) ? parsed : [initialData.services];
                } catch (e) {
                    return [initialData.services];
                }
            }
            return [];
        })() as string[],
        activity: initialData?.activity || "",
        secondary_contact: initialData?.secondary_contact || "",
        is_featured: initialData?.is_featured || false,
        plan: initialData?.plan || "Gratuito",
        portfolio_url: initialData?.portfolio_url || "",
        type: initialData?.type || "",
        sub_category: initialData?.sub_category || "",
        size: initialData?.size || "",
        location: initialData?.location || "",
        image_url: initialData?.image_url || "",
        is_active: initialData?.is_active ?? true,
    });

    const [registrationType, setRegistrationType] = useState<"Empresa" | "Loja">(
        initialData?.type === "Loja" ? "Loja" : (defaultType || "Empresa")
    );

    // Products State
    const [products, setProducts] = useState<any[]>([]);
    const [newProduct, setNewProduct] = useState({ name: "", price: "", category: "", image_url: "", description: "", is_available: true });
    const [isAddingProduct, setIsAddingProduct] = useState(false);
    const [editingProductId, setEditingProductId] = useState<string | null>(null);
    const slugify = (text: string) => (text || "").toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '');
    const [productLoading, setProductLoading] = useState(false);

    useEffect(() => {
        if (initialData?.id) {
            fetchProducts();
        }
    }, [initialData?.id]);

    const fetchProducts = async () => {
        const { data, error } = await supabase
            .from('products')
            .select('*')
            .eq('company_id', initialData.id)
            .order('created_at', { ascending: false });

        if (data) setProducts(data);
    };

    const handleAddProduct = async () => {
        if (!newProduct.name) {
            alert("Por favor, preencha o nome do produto.");
            return;
        }
        if (!initialData?.id) {
            alert("Erro: ID da empresa não encontrado. Recarregue a página.");
            return;
        }
        setProductLoading(true);

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                alert("Erro: Sessão de utilizador não encontrada. Por favor, recarregue a página.");
                return;
            }

            const productData = {
                name: newProduct.name,
                price: parseFloat(newProduct.price) || 0,
                category: newProduct.category,
                image_url: newProduct.image_url,
                description: newProduct.description,
                is_available: newProduct.is_available
            };

            const { error } = editingProductId
                ? await supabase.from('products').update(productData).eq('id', editingProductId)
                : await supabase.from('products').insert([{
                    ...productData,
                    company_id: initialData.id,
                    user_id: user.id
                }]);

            if (error) {
                console.error("Erro Supabase:", error);
                throw error;
            }

            setEditingProductId(null);
            setNewProduct({ name: "", price: "", category: "", image_url: "", description: "", is_available: true });
            setIsAddingProduct(false);
            fetchProducts();
        } catch (err: any) {
            alert("Erro ao adicionar produto: " + (err.message || err.details || "Erro desconhecido"));
        } finally {
            setProductLoading(false);
        }
    };

    const handleDeleteProduct = async (id: string) => {
        if (!confirm("Tem a certeza que deseja eliminar este produto?")) return;

        const { error } = await supabase.from('products').delete().eq('id', id);
        if (!error) fetchProducts();
    };

    useEffect(() => {
        if (formData.province && !MOZ_DATA[formData.province]?.includes(formData.district)) {
            setFormData(prev => ({ ...prev, district: "" }));
        }
    }, [formData.province]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Get current user to ensure RLS compliance
            const { data: { user } } = await supabase.auth.getUser();

            // Base data without user_id
            const baseData = {
                ...formData,
                type: registrationType === "Loja" ? "Loja" : formData.type,
                services: formData.services.filter(s => s.trim() !== "")
            };

            let error;
            if (!isNew && initialData?.id) {
                // UPDATE: Do not overwrite user_id to preserve ownership (e.g. Admin editing User's company)
                const { error: err } = await supabase
                    .from('companies')
                    .update(baseData)
                    .eq('id', initialData.id);
                error = err;
            } else {
                const submissionData = {
                    ...baseData,
                    user_id: null
                };

                const { error: err } = await supabase
                    .from('companies')
                    .insert([submissionData]);
                error = err;
            }

            if (error) throw error;
            router.push(registrationType === "Loja" ? '/admin/lojas' : '/admin/empresas');
            router.refresh();
        } catch (error: any) {
            alert("Erro ao salvar: " + error.message);
        } finally {
            setLoading(false);
        }
    };


    const addService = () => {
        setFormData(prev => ({ ...prev, services: [...prev.services, ""] }));
    };

    const updateService = (index: number, value: string) => {
        const newServices = [...formData.services];
        newServices[index] = value;
        setFormData(prev => ({ ...prev, services: newServices }));
    };

    const removeService = (index: number) => {
        const newServices = formData.services.filter((_: string, i: number) => i !== index);
        setFormData(prev => ({ ...prev, services: newServices }));
    };

    const handlePortfolioUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.type !== "application/pdf") {
            alert("Por favor, suba um ficheiro PDF.");
            return;
        }

        if (file.size > 1024 * 1024) {
            alert("O ficheiro deve ter menos de 1MB.");
            return;
        }

        setLoading(true);
        try {
            const fileName = `portfolio_${Math.random().toString(36).substring(2)}_${Date.now()}.pdf`;
            const filePath = `portfolios/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('Baseagrodata files')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('Baseagrodata files')
                .getPublicUrl(filePath);

            setFormData(prev => ({ ...prev, portfolio_url: publicUrl }));
            alert("Portfólio carregado!");
        } catch (error: any) {
            console.error(error);
            alert("Erro no upload: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white rounded-agro-lg shadow-[0_0_10px_rgba(0,0,0,0.1)] border border-slate-200 overflow-hidden flex flex-col">
            <div className="px-6 py-8 border-b border-slate-200 flex items-center justify-between bg-slate-300/40 transition-all">
                <div className="flex items-center gap-4 flex-1 min-w-0">
                    <button
                        onClick={() => router.back()}
                        className="p-2 hover:bg-slate-300 rounded-full transition-colors flex-shrink-0 flex items-center justify-center"
                    >
                        <ArrowLeft className="w-5 h-5 text-slate-500" />
                    </button>
                    <div className="flex items-center gap-3 overflow-hidden">
                        <h1 className="text-lg font-black text-slate-800 uppercase tracking-tight whitespace-nowrap leading-none m-0 p-0">
                            {isNew ? "Nova Empresa" : "Editar Empresa"}
                        </h1>
                        {!isNew && (
                            <div className="flex items-center gap-3">
                                <span className="text-slate-300 font-light flex-shrink-0 text-xl leading-none">|</span>
                                <div className="text-sm font-black uppercase tracking-tight truncate flex items-center gap-1.5 leading-none m-0 p-0">
                                    <span className="text-emerald-600">Editando:</span>
                                    <span className="text-slate-500 font-bold">{initialData?.name}</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-3 ml-4 flex-shrink-0">
                    {/* Plan Selector */}
                    <select
                        value={formData.plan}
                        onChange={(e) => setFormData({ ...formData, plan: e.target.value })}
                        className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-full shadow-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none cursor-pointer transition-all"
                    >
                        <option value="Gratuito">🆓 Gratuito</option>
                        <option value="Básico">⭐ Básico</option>
                        <option value="Business Vendedor">💼 Business Vendedor</option>
                        <option value="Premium">💎 Premium</option>
                        <option value="Parceiro">🤝 Parceiro</option>
                    </select>

                    {/* Featured Toggle */}
                    <div
                        className={`flex items-center gap-2 px-4 py-2 rounded-full cursor-pointer transition-all duration-300 border shadow-sm ${formData.is_featured
                            ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                            : 'bg-white border-slate-200 text-slate-400 opacity-60 hover:opacity-100'
                            }`}
                        onClick={() => setFormData({ ...formData, is_featured: !formData.is_featured })}
                    >
                        <Star className={`w-3.5 h-3.5 ${formData.is_featured ? 'fill-emerald-500 text-emerald-500' : ''}`} />
                        <span className="text-[10px] font-black uppercase tracking-widest">Destacar</span>
                        <div className={`w-10 h-5 rounded-full p-0.5 transition-colors duration-300 flex items-center ${formData.is_featured ? 'bg-emerald-600' : 'bg-slate-300'}`}>
                            <div className={`w-4 h-4 rounded-full bg-white shadow-sm transform transition-transform duration-300 ${formData.is_featured ? 'translate-x-5' : 'translate-x-0'}`}></div>
                        </div>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="flex-1 p-8 space-y-[25px]">

                {/* Branding & Media Section - NOW FIRST */}
                <div className="space-y-4">
                    <h3 className="text-xs font-black uppercase text-emerald-600 tracking-widest border-b border-emerald-100 pb-2 mb-4">Mídia e Branding</h3>

                    <div className="flex flex-col md:flex-row gap-6">
                        <div className="w-full md:w-[180px] shrink-0 flex flex-col">
                            <label className="text-xs font-black uppercase text-slate-500 tracking-widest mb-2">Logo</label>
                            <div className="h-[180px] md:flex-1">
                                <ImageUpload
                                    label="Logo"
                                    value={formData.logo_url}
                                    onChange={(url) => setFormData({ ...formData, logo_url: url })}
                                    recommendedSize="400x400"
                                    maxWidth={400}
                                    maxHeight={400}
                                    aspectRatio="square"
                                    bucket="public-assets"
                                    folder="logos"
                                    showRecommendedBadge={false}
                                    className="h-full w-full"
                                    useBackgroundImage={true}
                                    backgroundSize="contain"
                                />
                            </div>
                        </div>
                        <div className="flex-1 flex flex-col">
                            <label className="text-xs font-black uppercase text-slate-500 tracking-widest mb-2">Banner (Capa)</label>
                            <div className="h-[180px] md:flex-1">
                                <ImageUpload
                                    label="Banner (Capa)"
                                    value={formData.banner_url}
                                    onChange={(url) => setFormData({ ...formData, banner_url: url })}
                                    recommendedSize="1200x400"
                                    maxWidth={1200}
                                    maxHeight={400}
                                    bucket="public-assets"
                                    folder="banners"
                                    imageClassName="object-cover w-full h-full"
                                    showRecommendedBadge={false}
                                    className="h-full w-full aspect-auto"
                                    useBackgroundImage={true}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Basic Info Section */}
                <div className="space-y-4 pt-5">
                    <h3 className="text-xs font-black uppercase text-emerald-600 tracking-widest border-b border-emerald-100 pb-2 mb-4">Informação Básica</h3>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="md:col-span-4 relative">
                            <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                required
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: toSentenceCase(e.target.value) })}
                                placeholder="Nome da Empresa"
                                className="pl-12 pr-4 py-[11px] bg-slate-100 border border-slate-200 rounded-agro-btn text-sm font-medium text-slate-700 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none w-full transition-all"
                            />
                        </div>
                        <div className="md:col-span-2 relative">
                            <List className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                value={formData.activity}
                                onChange={(e) => {
                                    const val = e.target.value;
                                    const wordCount = val.trim().split(/\s+/).filter(Boolean).length;
                                    if (wordCount <= 10) {
                                        setFormData({ ...formData, activity: toSentenceCase(val) });
                                    }
                                }}
                                placeholder="Actividade Principal (Máx. 10 palavras)"
                                className="pl-12 pr-4 py-[11px] bg-slate-100 border border-slate-200 rounded-agro-btn text-sm font-medium text-slate-700 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none w-full transition-all"
                            />
                        </div>
                        <div className="md:col-span-2 relative">
                            <Target className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                value={formData.sub_category}
                                onChange={(e) => {
                                    const val = e.target.value;
                                    const wordCount = val.trim().split(/\s+/).filter(Boolean).length;
                                    if (wordCount <= 10) {
                                        setFormData({ ...formData, sub_category: toSentenceCase(val) });
                                    }
                                }}
                                placeholder="Área de Actuação (Máx. 10 palavras)"
                                className="pl-12 pr-4 py-[11px] bg-slate-100 border border-slate-200 rounded-agro-btn text-sm font-medium text-slate-700 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none w-full transition-all"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="md:col-span-1 relative">
                            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                value={formData.contact}
                                onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                                placeholder="Contacto (+258...)"
                                className="pl-12 pr-4 py-[11px] bg-slate-100 border border-slate-200 rounded-agro-btn text-sm font-medium text-slate-700 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none w-full transition-all"
                            />
                        </div>
                        <div className="md:col-span-1 relative">
                            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                value={formData.secondary_contact}
                                onChange={(e) => setFormData({ ...formData, secondary_contact: e.target.value })}
                                placeholder="Nº de WhatsApp"
                                className="pl-12 pr-4 py-[11px] bg-slate-100 border border-slate-200 rounded-agro-btn text-sm font-medium text-slate-700 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none w-full transition-all"
                            />
                        </div>
                        <div className="md:col-span-2 relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                placeholder="Email da Empresa"
                                className="pl-12 pr-4 py-[11px] bg-slate-100 border border-slate-200 rounded-agro-btn text-sm font-medium text-slate-700 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none w-full transition-all"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="md:col-span-2">
                            <div className="relative">
                                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    value={formData.address}
                                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                    placeholder="Endereço (Rua, Número, Bairro...)"
                                    className="pl-12 pr-4 py-[11px] bg-slate-100 border border-slate-200 rounded-agro-btn text-sm font-medium text-slate-700 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none w-full transition-all"
                                />
                            </div>
                        </div>
                        <div className="md:col-span-1">
                            <select
                                value={formData.province}
                                onChange={(e) => setFormData({ ...formData, province: e.target.value })}
                                className="py-3 px-3 bg-slate-100 border border-slate-200 rounded-agro-btn text-sm font-medium text-slate-700 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none w-full transition-all"
                            >
                                <option value="">Província...</option>
                                {Object.keys(MOZ_DATA).map((p: string) => <option key={p} value={p}>{p}</option>)}
                            </select>
                        </div>
                        <div className="md:col-span-1">
                            <select
                                value={formData.district}
                                onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                                className="py-3 px-3 bg-slate-100 border border-slate-200 rounded-agro-btn text-sm font-medium text-slate-700 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none w-full transition-all"
                            >
                                <option value="">Distrito...</option>
                                {formData.province && MOZ_DATA[formData.province]?.map((d: string) => <option key={d} value={d}>{d}</option>)}
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="md:col-span-1 relative">
                            <FileText className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                value={formData.nuit}
                                onChange={(e) => setFormData({ ...formData, nuit: e.target.value })}
                                placeholder="NUIT"
                                className="pl-12 pr-4 py-[11px] bg-slate-100 border border-slate-200 rounded-agro-btn text-sm font-medium text-slate-700 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none w-full transition-all"
                            />
                        </div>
                        <div className="md:col-span-3 relative">
                            <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="url"
                                value={formData.website}
                                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                                placeholder="Website da Empresa (https://...)"
                                className="pl-12 pr-4 py-[11px] bg-slate-100 border border-slate-200 rounded-agro-btn text-sm font-medium text-slate-700 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none w-full transition-all"
                            />
                        </div>
                    </div>
                </div>


                {/* Corporate Profile */}
                <div className="space-y-4">
                    <h3 className="text-xs font-black uppercase text-emerald-600 tracking-widest border-b border-emerald-100 pb-2 mb-4">Perfil Corporativo</h3>

                    {/* Row 1: Descrição 75% + Missão 25% */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="md:col-span-3 flex flex-col gap-2">
                            <label className="text-xs font-black uppercase text-slate-500 tracking-widest">Descrição geral da empresa</label>
                            <RichTextEditor
                                value={formData.description}
                                onChange={(val) => setFormData({ ...formData, description: val })}
                                placeholder="Descreva os objectivos, história e actuação da empresa..."
                                className="bg-slate-100"
                            />
                        </div>
                        <div className="md:col-span-1 flex flex-col gap-2">
                            <label className="text-xs font-black uppercase text-slate-500 tracking-widest flex items-center gap-1">
                                <Target className="w-3 h-3" /> Missão
                            </label>
                            <textarea
                                value={formData.mission}
                                onChange={(e) => setFormData({ ...formData, mission: toSentenceCase(e.target.value) })}
                                placeholder="Missão da empresa..."
                                className="p-3 bg-slate-100 border border-slate-200 rounded-agro-btn text-sm font-medium focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none resize-y h-full min-h-[150px] transition-all"
                            />
                        </div>
                    </div>

                    {/* Row 2: Visão 50% + Valores 50% */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-black uppercase text-slate-500 tracking-widest flex items-center gap-1">
                                <Eye className="w-3 h-3" /> Visão
                            </label>
                            <textarea
                                value={formData.vision}
                                onChange={(e) => setFormData({ ...formData, vision: toSentenceCase(e.target.value) })}
                                placeholder="Visão da empresa..."
                                className="p-3 bg-slate-100 border border-slate-200 rounded-agro-btn text-sm font-medium focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none resize-y h-24 transition-all"
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-black uppercase text-slate-500 tracking-widest flex items-center gap-1">
                                <Heart className="w-3 h-3" /> Valores
                            </label>
                            <textarea
                                value={formData.values}
                                onChange={(e) => setFormData({ ...formData, values: toSentenceCase(e.target.value) })}
                                placeholder="Valores da empresa..."
                                className="p-3 bg-slate-100 border border-slate-200 rounded-agro-btn text-sm font-medium focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none resize-y h-24 transition-all"
                            />
                        </div>
                    </div>
                </div>


                {/* Enquadramento */}
                <div className="space-y-4">
                    <h3 className="text-xs font-black uppercase text-emerald-600 tracking-widest border-b border-emerald-100 pb-2 mb-4">Enquadramento</h3>

                    <div className="flex flex-col gap-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <select
                                value={registrationType}
                                onChange={(e) => setRegistrationType(e.target.value as any)}
                                className="py-3 px-3 bg-slate-100 border border-slate-200 rounded-agro-btn text-sm font-bold text-slate-700 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none w-full transition-all"
                            >
                                <option value="Empresa">🏢 Empresa de Serviços</option>
                                <option value="Loja">🛒 Loja (Venda de Insumos)</option>
                            </select>

                            {registrationType === "Empresa" && (
                                <select
                                    value={formData.type}
                                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                    className="py-3 px-3 bg-slate-100 border border-slate-200 rounded-agro-btn text-sm font-medium text-slate-700 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none w-full transition-all"
                                >
                                    <option value="">Designação...</option>
                                    {COMPANY_DESIGNATIONS.map((d: string) => <option key={d} value={d}>{d}</option>)}
                                </select>
                            )}

                            <select
                                value={formData.value_chain}
                                onChange={(e) => setFormData({ ...formData, value_chain: e.target.value })}
                                className="py-3 px-3 bg-slate-100 border border-slate-200 rounded-agro-btn text-sm font-medium text-slate-700 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none w-full transition-all"
                            >
                                <option value="">Cadeia de Valor...</option>
                                {VALUE_CHAINS.map((vc: string) => <option key={vc} value={vc}>{vc}</option>)}
                            </select>
                            <select
                                value={formData.size}
                                onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                                className="py-3 px-3 bg-slate-100 border border-slate-200 rounded-agro-btn text-sm font-medium text-slate-700 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none w-full transition-all"
                            >
                                <option value="">Dimensão...</option>
                                {COMPANY_SIZES.map((sz: string) => <option key={sz} value={sz}>{sz}</option>)}
                            </select>
                            <select
                                value={formData.category} // High-level Sector
                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                className="py-3 px-3 bg-slate-100 border border-slate-200 rounded-agro-btn text-sm font-medium text-slate-700 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none w-full transition-all"
                            >
                                <option value="">{registrationType === "Loja" ? "Categoria da Loja..." : "Sector de Actividade..."}</option>
                                {(registrationType === "Loja" ? STORE_CATEGORIES : ALL_CATEGORIES).map((s: string) => (
                                    <option key={s} value={s}>{s}</option>
                                ))}
                            </select>
                        </div>

                        {registrationType === "Loja" && (
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="md:col-span-2">
                                        <input
                                            type="text"
                                            value={formData.location}
                                            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                            placeholder="Localização Física (Ex: Av. Eduardo Mondlane, Maputo)"
                                            className="py-3 px-3 bg-slate-100 border border-slate-200 rounded-agro-btn text-sm font-medium text-slate-700 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none w-full transition-all"
                                        />
                                    </div>
                                    <select
                                        value={formData.is_active ? "Aberto" : "Fechado"}
                                        onChange={(e) => setFormData({ ...formData, is_active: e.target.value === "Aberto" })}
                                        className="py-3 px-3 bg-slate-100 border border-slate-200 rounded-agro-btn text-sm font-bold text-slate-700 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none w-full transition-all"
                                    >
                                        <option value="Aberto">✅ Aberto</option>
                                        <option value="Fechado">❌ Fechado</option>
                                    </select>
                                </div>
                                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                                    <label className="text-xs font-black uppercase text-slate-500 tracking-widest mb-3 block">Imagem da Loja (Fachada ou Interior)</label>
                                    <ImageUpload
                                        value={formData.image_url}
                                        onChange={(url) => setFormData({ ...formData, image_url: url })}
                                        label="Imagem da Loja"
                                        maxSizeMB={1}
                                        bucket="Baseagrodata files"
                                        folder="lojas"
                                        description="Esta imagem será exibida como capa da loja nos resultados de pesquisa."
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Services */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-emerald-100 pb-2 mb-4">
                        <h3 className="text-xs font-black uppercase text-emerald-600 tracking-widest">Portfólio de Serviços</h3>
                        <div className="flex items-center gap-2">
                            <label className="cursor-pointer text-[10px] font-black uppercase text-white bg-orange-500 hover:bg-orange-600 px-3 py-1 rounded-full transition-colors flex items-center gap-1">
                                <FileText className="w-3 h-3" />
                                {formData.portfolio_url ? "Alterar PDF" : "Subir PDF (Portfólio)"}
                                <input
                                    type="file"
                                    accept=".pdf"
                                    onChange={handlePortfolioUpload}
                                    className="hidden"
                                />
                            </label>
                            <button
                                type="button"
                                onClick={addService}
                                className="text-[10px] font-black uppercase text-emerald-600 hover:text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full transition-colors"
                            >
                                + Adicionar Serviço
                            </button>
                        </div>
                    </div>

                    {formData.portfolio_url && (
                        <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100 flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <FileText className="w-4 h-4 text-emerald-600" />
                                <span className="text-xs font-bold text-emerald-700">PDF do Portfólio carregado</span>
                            </div>
                            <button
                                type="button"
                                onClick={() => setFormData(prev => ({ ...prev, portfolio_url: "" }))}
                                className="p-1 hover:bg-emerald-100 rounded-full text-emerald-600"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {formData.services.map((service: string, index: number) => (
                            <div key={index} className="flex items-center gap-2">
                                <div className="relative flex-1">
                                    <List className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input
                                        value={service}
                                        onChange={(e) => updateService(index, e.target.value)}
                                        placeholder="Descreva o serviço..."
                                        className="pl-10 pr-4 py-3 bg-slate-100 border border-slate-200 rounded-agro-btn text-sm font-bold focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none w-full transition-all"
                                    />
                                </div>
                                <button
                                    type="button"
                                    onClick={() => removeService(index)}
                                    className="p-3 bg-red-50 text-red-500 hover:bg-red-100 rounded-xl transition-colors"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                        {formData.services.length === 0 && (
                            <p className="col-span-full text-center text-slate-400 text-xs italic py-4">
                                Nenhum serviço adicionado.
                            </p>
                        )}
                    </div>
                </div>

                {/* Products Section - Only available for existing companies */}
                {!isNew && (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between border-b border-emerald-100 pb-2 mb-4">
                            <h3 className="text-xs font-black uppercase text-emerald-600 tracking-widest">Produtos e Serviços Premium</h3>
                            <button
                                type="button"
                                onClick={() => setIsAddingProduct(true)}
                                className="text-[10px] font-black uppercase text-emerald-600 hover:text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full transition-colors flex items-center gap-1"
                            >
                                <Plus className="w-3 h-3" /> Adicionar Produto
                            </button>
                        </div>

                        {/* Add Product Form */}
                        {isAddingProduct && (
                            <div className="bg-slate-50 border border-emerald-100/50 rounded-lg p-6 mb-4 animate-in fade-in slide-in-from-top-2 shadow-sm">
                                <div className="flex items-center justify-between mb-6 border-b border-emerald-100 pb-2">
                                    <h4 className="text-xs font-bold text-emerald-600 uppercase flex items-center gap-2 tracking-widest">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                                        {editingProductId ? 'Editar Produto' : 'Novo Produto'}
                                    </h4>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setIsAddingProduct(false);
                                            setEditingProductId(null);
                                            setNewProduct({ name: "", price: "", category: "", image_url: "", description: "", is_available: true });
                                        }}
                                        className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>

                                <div className="flex flex-col md:flex-row gap-6 mb-4 items-stretch">
                                    {/* Left Side: Image */}
                                    <div className="w-full md:w-56 shrink-0">
                                        <ImageUpload
                                            label="Imagem do Produto"
                                            value={newProduct.image_url}
                                            onChange={(url) => setNewProduct({ ...newProduct, image_url: url })}
                                            recommendedSize="400x400"
                                            aspectRatio="square"
                                            bucket="public-assets"
                                            folder="products"
                                            imageClassName="w-full h-full rounded-lg object-cover bg-white shadow-sm border border-slate-300"
                                            showRecommendedBadge={false}
                                        />
                                    </div>

                                    {/* Right Side: Inputs */}
                                    <div className="flex-1 space-y-4">
                                        <input
                                            value={newProduct.name}
                                            onChange={(e) => setNewProduct({ ...newProduct, name: toSentenceCase(e.target.value) })}
                                            placeholder="Nome do Produto e Marca (Ex: Sementes de Milho Híbrido Pannar)"
                                            className="px-4 py-3 bg-white border border-slate-200 rounded-lg text-sm font-bold w-full outline-none focus:ring-2 focus:ring-emerald-500 transition-all shadow-sm placeholder:text-slate-400 placeholder:font-normal"
                                        />

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <input
                                                type="number"
                                                value={newProduct.price}
                                                onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                                                placeholder="Preço (apenas números sem espaço)"
                                                className="px-4 py-3 bg-white border border-slate-200 rounded-lg text-sm font-medium w-full outline-none focus:ring-2 focus:ring-emerald-500 transition-all shadow-sm placeholder:text-slate-400 placeholder:font-normal"
                                            />
                                            <div className="relative">
                                                <select
                                                    value={newProduct.category}
                                                    onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                                                    className={`appearance-none px-4 py-3 bg-white border border-slate-200 rounded-lg text-sm font-medium w-full outline-none focus:ring-2 focus:ring-emerald-500 transition-all shadow-sm ${!newProduct.category ? 'text-slate-400' : 'text-slate-900'}`}
                                                >
                                                    <option value="" disabled hidden>Selecione a Categoria de Produto</option>
                                                    {[
                                                        "Sementes & Mudas",
                                                        "Fertilizantes & Adubos",
                                                        "Defensivos Agrícolas (Pesticidas)",
                                                        "Maquinaria & Equipamentos",
                                                        "Sistemas de Rega",
                                                        "Ração & Nutrição Animal",
                                                        "Medicamentos Veterinários",
                                                        "Ferramentas Agrícolas",
                                                        "Produtos Frescos (Frutas/Legumes)",
                                                        "Grãos & Cereais",
                                                        "Processados & Agro-indústria",
                                                        "Serviços de Consultoria"
                                                    ].map((cat) => (
                                                        <option key={cat} value={cat} className="text-slate-900">{cat}</option>
                                                    ))}
                                                </select>
                                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                                            </div>
                                        </div>

                                        <textarea
                                            value={newProduct.description}
                                            onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                                            placeholder="Breve descrição das características do produto..."
                                            className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg text-sm font-medium outline-none focus:ring-2 focus:ring-emerald-500 resize-none h-24 transition-all shadow-sm placeholder:text-slate-400 placeholder:font-normal"
                                        />
                                    </div>
                                </div>

                                <div className="flex flex-col md:flex-row items-center justify-between gap-4 mt-4 pt-4 border-t border-slate-100">
                                    <div className="flex items-center gap-4 bg-slate-50/50 border border-slate-200 rounded-lg px-4 py-2.5">
                                        <div className="flex items-center gap-2">
                                            <Switch
                                                checked={newProduct.is_available}
                                                onCheckedChange={(checked) => setNewProduct({ ...newProduct, is_available: checked })}
                                            />
                                            <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Disponibilidade</span>
                                        </div>
                                        <div className="w-px h-4 bg-slate-200" />
                                        <span className={`text-[10px] font-bold uppercase tracking-wider ${newProduct.is_available ? 'text-emerald-600' : 'text-red-500'}`}>
                                            {newProduct.is_available ? "Em Stock" : "Esgotado"}
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setIsAddingProduct(false);
                                                setEditingProductId(null);
                                                setNewProduct({ name: "", price: "", category: "", image_url: "", description: "", is_available: true });
                                            }}
                                            className="px-6 py-2.5 text-xs font-black text-slate-500 hover:bg-slate-100 rounded-lg transition-colors uppercase tracking-widest border border-slate-200 bg-white"
                                        >
                                            Cancelar
                                        </button>
                                        <button
                                            type="button"
                                            onClick={handleAddProduct}
                                            disabled={productLoading}
                                            className="px-8 py-2.5 text-xs font-black text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors flex items-center gap-2 uppercase tracking-widest shadow-lg shadow-emerald-900/10"
                                        >
                                            {(editingProductId ? <Check className="w-3 h-3" /> : <Plus className="w-3 h-3" />)}
                                            {editingProductId ? 'Actualizar Produto' : 'Salvar Produto'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Products List */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                            {products.map((product) => (
                                <div key={product.id} className="bg-white border border-slate-100 rounded-xl overflow-hidden group hover:border-emerald-200 transition-colors flex flex-col relative">
                                    {/* Action Buttons - Absolute Positioned (Trash Only) */}
                                    <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                                        <button
                                            type="button"
                                            onClick={() => handleDeleteProduct(product.id)}
                                            className="p-2 bg-white/90 backdrop-blur-sm text-slate-400 hover:text-red-500 rounded-lg shadow-sm border border-slate-100 transition-all"
                                            title="Eliminar Produto"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>

                                    {/* Image Area */}
                                    <div className="w-full h-40 bg-slate-50 shrink-0 overflow-hidden border-b border-slate-50">
                                        {product.image_url ? (
                                            <img src={product.image_url} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-slate-200">
                                                <ShoppingBag className="w-12 h-12" />
                                            </div>
                                        )}
                                    </div>

                                    {/* Content Area */}
                                    <div className="p-4 flex flex-col gap-1.5 items-start">
                                        <div className="flex flex-col gap-0.5 w-full">
                                            <h5 className="text-[14px] font-black text-slate-800 truncate leading-tight">{product.name}</h5>

                                            {product.category && (
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider leading-tight">
                                                    {product.category}
                                                </p>
                                            )}
                                        </div>

                                        <div className="text-[12px] font-black text-emerald-600 leading-tight">
                                            {product.price ? `${parseFloat(product.price.toString()).toLocaleString('pt-MZ')} MT` : 'Sob consulta'}
                                        </div>

                                        <div className="mt-1 flex items-center justify-between w-full">
                                            <span className={`text-[8px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md border ${product.is_available !== false
                                                ? 'bg-emerald-50 border-emerald-100 text-emerald-600'
                                                : 'bg-red-50 border-red-100 text-red-600'
                                                }`}>
                                                {product.is_available !== false ? 'Em Stock' : 'Esgotado'}
                                            </span>

                                            <div className="flex items-center gap-1 transition-all">
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        const url = initialData.slug
                                                            ? `/empresas/${initialData.slug}/produto/${slugify(product.name)}`
                                                            : `/produtos/${product.id}`;
                                                        window.open(url, '_blank');
                                                    }}
                                                    className="p-1.5 text-slate-400 hover:text-orange-500 hover:bg-orange-50 rounded-md transition-all"
                                                    title="Ver Produto"
                                                >
                                                    <Eye className="w-3.5 h-3.5" />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setEditingProductId(product.id);
                                                        setNewProduct({
                                                            name: product.name || "",
                                                            price: product.price?.toString() || "",
                                                            category: product.category || "",
                                                            image_url: product.image_url || "",
                                                            description: product.description || "",
                                                            is_available: product.is_available !== false
                                                        });
                                                        setIsAddingProduct(true);
                                                    }}
                                                    className="p-1.5 text-slate-400 hover:text-orange-500 hover:bg-orange-50 rounded-md transition-all"
                                                    title="Editar Produto"
                                                >
                                                    <Pencil className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {products.length === 0 && !isAddingProduct && (
                                <p className="col-span-full text-center text-slate-400 text-xs italic py-4">
                                    Nenhum produto registado.
                                </p>
                            )}
                        </div>
                    </div>
                )
                }

                <div className=" pt-8 border-t border-slate-100 flex items-center justify-end gap-3">
                    <Button type="button" variant="outline" onClick={() => router.back()} className="px-8 h-10 rounded-lg text-xs font-black text-slate-500 uppercase tracking-widest">
                        Cancelar
                    </Button>
                    <Button
                        type="submit"
                        disabled={loading}
                        className="px-10 h-10 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-black uppercase tracking-widest shadow-lg"
                    >
                        {(isNew ? "Adicionar Empresa" : "Guardar Alterações")}
                    </Button>
                </div>

            </form >
        </div >
    );
}
