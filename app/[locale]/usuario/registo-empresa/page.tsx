"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import {
    Building2, MapPin, Briefcase, CheckCircle2, Upload,
    Loader2, Save, Crown, Plus, Trash2, X, Pencil, Lock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { cn, compressImage } from "@/lib/utils";
import { Spinner } from "@/components/ui/spinner";
import { RichTextEditor } from "@/components/RichTextEditor";
import { COMPANY_CATEGORIES } from "@/lib/constants";
import Image from "next/image";

// Plan config
const PLANS = [
    {
        id: 'Gratuito',
        label: 'Gratuito',
        price: 0,
        badge: null,
        color: 'slate',
        features: ['Perfil básico', 'Visibilidade limitada', 'Suporte via e-mail'],
    },
    {
        id: 'Premium',
        label: 'Premium',
        price: 2500,
        badge: 'Pequenas Empresas',
        color: 'orange',
        features: ['Acesso a cotações', 'Vagas ilimitadas', 'Perfil verificado', 'Produtos ilimitados'],
    },
    {
        id: 'Business Vendedor',
        label: 'Business Vendedor',
        price: 5000,
        badge: null,
        color: 'blue',
        features: ['Tudo do Premium', 'Acesso API de dados', 'Relatórios PDF/Excel', 'Consultoria Mensal'],
    },
    {
        id: 'Parceiro',
        label: 'Plano Parceiro',
        price: null,
        badge: 'Sob Consulta',
        color: 'emerald',
        features: ['Tudo do Business', 'Destaque máximo', 'Publicação de vagas', 'Suporte dedicado'],
    },
];

const PLAN_COLOR: Record<string, string> = {
    Gratuito: 'border-slate-300 bg-slate-50',
    Premium: 'border-orange-400 bg-orange-50/40',
    'Business Vendedor': 'border-blue-500 bg-blue-50/40',
    Parceiro: 'border-emerald-500 bg-emerald-50/40',
};

const PLAN_ACTIVE: Record<string, string> = {
    Gratuito: 'ring-2 ring-slate-400',
    Premium: 'ring-2 ring-orange-400',
    'Business Vendedor': 'ring-2 ring-blue-500',
    Parceiro: 'ring-2 ring-emerald-500',
};

export default function RegisterCompanyPage() {
    const router = useRouter();
    const supabase = createClient();

    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [user, setUser] = useState<any>(null);
    const [tempLogoFile, setTempLogoFile] = useState<File | null>(null);
    const [isRestored, setIsRestored] = useState(false);
    const [bannerUrl, setBannerUrl] = useState("");
    const [tempBannerFile, setTempBannerFile] = useState<File | null>(null);

    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'mpesa' | 'visa' | null>(null);
    const [paymentPhoneNumber, setPaymentPhoneNumber] = useState("");
    const [isPaymentProcessing, setIsPaymentProcessing] = useState(false);

    const [formData, setFormData] = useState({
        companyName: "",
        activity: "",
        email: "",
        contact: "",
        newsletter: true,
        logoUrl: "",
        website: "",
        representative: "",
        nuit: "",
        plan: "Gratuito",
        billingPeriod: "monthly",
        highlightCompany: false,
        province: "",
        district: "",
        address: "",
        sector: "",
        description: "",
        tags: "",
        products: [] as { name: string; description: string }[],
        paymentMethod: "",
        paymentPhone: "",
        paymentConfirmed: false
    });

    const logoInputRef = useRef<HTMLInputElement>(null);
    const bannerInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const checkUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);
            if (!user) return;

            const { data: company } = await supabase
                .from('companies')
                .select('*')
                .eq('user_id', user.id)
                .maybeSingle();

            if (company) {
                setFormData(prev => ({
                    ...prev,
                    companyName: company.name || prev.companyName,
                    activity: company.activity || prev.activity,
                    email: company.email || prev.email,
                    contact: company.contact || prev.contact,
                    logoUrl: company.logo_url || prev.logoUrl,
                    province: company.province || prev.province,
                    district: company.district || prev.district,
                    address: company.address || prev.address,
                    sector: company.category || prev.sector,
                    description: company.description || prev.description,
                    plan: company.plan || prev.plan,
                    website: company.website || prev.website,
                    representative: company.representative_name || prev.representative,
                    nuit: company.nuit || prev.nuit,
                    billingPeriod: company.billing_period || prev.billingPeriod,
                    products: Array.isArray(company.products) && company.products.length ? company.products : prev.products,
                    highlightCompany: typeof company.is_featured === 'boolean' ? company.is_featured : prev.highlightCompany,
                }));
                if (company.banner_url) setBannerUrl(company.banner_url);
            }
        };
        checkUser();

        const savedData = localStorage.getItem('pending_company_form');
        if (savedData) {
            try {
                const parsed = JSON.parse(savedData);
                setFormData(prev => ({ ...prev, ...parsed }));
            } catch (e) { /* ignore */ }
        }
        setIsRestored(true);
    }, []);

    useEffect(() => {
        if (isRestored) {
            const { logoUrl, ...rest } = formData;
            localStorage.setItem('pending_company_form', JSON.stringify(rest));
        }
    }, [formData, isRestored]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || !e.target.files.length) return;
        const file = e.target.files[0];
        if (!user) {
            setTempLogoFile(file);
            const reader = new FileReader();
            reader.onload = ev => setFormData(prev => ({ ...prev, logoUrl: ev.target?.result as string }));
            reader.readAsDataURL(file);
            return;
        }
        setUploading(true);
        try {
            const blob = await compressImage(file);
            const path = `company-logos/${user.id}-${Math.random()}.webp`;
            const { error } = await supabase.storage.from('public-assets').upload(path, blob);
            if (error) throw error;
            const { data: { publicUrl } } = supabase.storage.from('public-assets').getPublicUrl(path);
            setFormData(prev => ({ ...prev, logoUrl: publicUrl }));
        } catch { alert("Erro ao fazer upload do logo."); }
        finally { setUploading(false); }
    };

    const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || !e.target.files.length) return;
        const file = e.target.files[0];
        if (!user) {
            setTempBannerFile(file);
            const reader = new FileReader();
            reader.onload = ev => setBannerUrl(ev.target?.result as string);
            reader.readAsDataURL(file);
            return;
        }
        setUploading(true);
        try {
            const blob = await compressImage(file);
            const path = `company-banners/${user.id}-${Math.random()}.webp`;
            const { error } = await supabase.storage.from('public-assets').upload(path, blob);
            if (error) throw error;
            const { data: { publicUrl } } = supabase.storage.from('public-assets').getPublicUrl(path);
            setBannerUrl(publicUrl);
        } catch { alert("Erro ao fazer upload do banner."); }
        finally { setUploading(false); }
    };

    const handleSubmit = async () => {
        if (!user) {
            localStorage.setItem('pending_company_form', JSON.stringify(formData));
            localStorage.setItem('pending_company_submission', 'true');
            router.push(`/registar?next=/usuario/registo-empresa`);
            return;
        }
        setLoading(true);
        try {
            let finalLogoUrl = formData.logoUrl;
            let finalBannerUrl = bannerUrl;

            if (tempLogoFile && !formData.logoUrl.startsWith('http')) {
                setUploading(true);
                const blob = await compressImage(tempLogoFile);
                const path = `company-logos/${user.id}-${Math.random()}.webp`;
                const { error } = await supabase.storage.from('public-assets').upload(path, blob);
                if (error) throw error;
                finalLogoUrl = supabase.storage.from('public-assets').getPublicUrl(path).data.publicUrl;
                setTempLogoFile(null);
            }

            if (tempBannerFile && !bannerUrl.startsWith('http')) {
                const blob = await compressImage(tempBannerFile);
                const path = `company-banners/${user.id}-${Math.random()}.webp`;
                const { error } = await supabase.storage.from('public-assets').upload(path, blob);
                if (error) throw error;
                finalBannerUrl = supabase.storage.from('public-assets').getPublicUrl(path).data.publicUrl;
                setTempBannerFile(null);
            }

            const { error } = await supabase.from('companies').upsert({
                user_id: user.id,
                name: formData.companyName,
                activity: formData.activity,
                email: formData.email,
                contact: formData.contact,
                logo_url: finalLogoUrl,
                banner_url: finalBannerUrl,
                province: formData.province,
                district: formData.district,
                address: formData.address,
                category: formData.sector,
                description: formData.description,
                plan: formData.plan,
                website: formData.website,
                representative_name: formData.representative,
                nuit: formData.nuit,
                billing_period: formData.billingPeriod,
                products: formData.products,
                is_featured: formData.highlightCompany,
                payment_method: formData.paymentMethod,
                payment_phone: formData.paymentPhone,
                geo_location: `${formData.province}, ${formData.district}`,
                updated_at: new Date().toISOString()
            }, { onConflict: 'user_id' });

            if (error) throw error;
            localStorage.removeItem('pending_company_form');
            localStorage.removeItem('pending_company_submission');
            alert("Empresa guardada com sucesso!");
            router.push('/usuario/dashboard/minha-conta');
        } catch (err: any) {
            alert(`Erro ao salvar dados: ${err.message}`);
        } finally {
            setLoading(false);
            setUploading(false);
        }
    };

    // Compute plan cost
    const planLower = formData.plan.toLowerCase();
    const planCost = planLower === 'gratuito' || planLower === 'free' ? 0
        : planLower === 'premium' ? 2500
        : planLower === 'business vendedor' ? 5000 : 0;
    const highlightCost = formData.highlightCompany ? 1500 : 0;
    const totalCost = planCost + highlightCost;
    const needsPayment = totalCost > 0 && !formData.paymentConfirmed;

    return (
        <div className="min-h-screen bg-slate-100 font-sans pb-20">
            {/* Page title */}
            <div className="mb-6">
                <h1 className="text-xl font-black text-slate-800 flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-emerald-600" />
                    Cadastro de Empresa
                </h1>
                <p className="text-sm text-slate-500 mt-1">Preencha todos os campos para registar a sua empresa na plataforma.</p>
            </div>

            <div className="flex flex-col lg:flex-row gap-[20px]">
                {/* ── MAIN FORM (LEFT) ── */}
                <main className="flex-1 space-y-[10px]">

                    {/* BANNER */}
                    <div
                        onClick={() => bannerInputRef.current?.click()}
                        className="w-full h-40 bg-white border-2 border-dashed border-slate-200 flex flex-col items-center justify-center group hover:bg-slate-50 transition-all cursor-pointer overflow-hidden relative shadow-sm"
                        style={{ borderRadius: '15px' }}
                    >
                        {bannerUrl ? (
                            <>
                                <img src={bannerUrl} alt="Banner" className="w-full h-full object-cover" />
                                <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                    <button onClick={e => { e.stopPropagation(); bannerInputRef.current?.click(); }}
                                        className="p-2 bg-white/90 backdrop-blur-sm text-slate-700 hover:text-white hover:bg-emerald-600 rounded-full shadow-lg border border-slate-100 transition-colors">
                                        <Pencil className="w-4 h-4" />
                                    </button>
                                    <button onClick={e => { e.stopPropagation(); setBannerUrl(""); }}
                                        className="p-2 bg-white/90 backdrop-blur-sm text-slate-700 hover:text-white hover:bg-red-500 rounded-full shadow-lg border border-slate-100 transition-colors">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </>
                        ) : (
                            <>
                                <Upload className="w-10 h-10 text-slate-400 mb-2" />
                                <span className="text-sm font-bold text-slate-500 uppercase tracking-widest">Banner da Empresa</span>
                                <p className="text-[10px] text-slate-400 mt-1 uppercase font-black">Recomendado: 1200x400px</p>
                            </>
                        )}
                        <input type="file" ref={bannerInputRef} onChange={handleBannerUpload} className="hidden" accept="image/*" />
                    </div>

                    {/* LOGO + TOP FIELDS */}
                    <div className="flex flex-col md:flex-row gap-[10px] items-stretch">
                        <div
                            onClick={() => logoInputRef.current?.click()}
                            className="w-56 h-36 shrink-0 bg-white border-2 border-dashed border-slate-200 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 transition-all overflow-hidden relative"
                            style={{ borderRadius: '15px' }}
                        >
                            {uploading ? <Loader2 className="w-8 h-8 text-slate-400 animate-spin" /> :
                                formData.logoUrl ? (
                                    <img src={formData.logoUrl} alt="Logo" className="w-full h-full object-cover" />
                                ) : (
                                    <>
                                        <Upload className="w-8 h-8 text-slate-400 mb-1" />
                                        <span className="text-[10px] font-bold text-slate-500 uppercase">Logo (1:1)</span>
                                    </>
                                )}
                            <input ref={logoInputRef} type="file" className="hidden" accept="image/*" onChange={handleLogoUpload} />
                        </div>

                        <div className="flex-1 flex flex-col gap-[10px]">
                            <Input name="companyName" value={formData.companyName} onChange={handleInputChange}
                                placeholder="Nome da Empresa *"
                                className="h-12 border-slate-200 px-4 text-sm font-semibold text-slate-600 bg-white placeholder:text-slate-400"
                                style={{ borderRadius: '8px' }} />
                            <Input name="activity" value={formData.activity} onChange={handleInputChange}
                                placeholder="Actividade Principal *"
                                className="h-12 border-slate-200 px-4 text-sm font-semibold text-slate-600 bg-white placeholder:text-slate-400"
                                style={{ borderRadius: '8px' }} />
                            <div className="grid grid-cols-2 gap-[10px]">
                                <Select value={formData.sector} onValueChange={v => setFormData(p => ({ ...p, sector: v }))}>
                                    <SelectTrigger className="h-12 border-slate-200 bg-white px-4 font-semibold text-slate-600" style={{ borderRadius: '8px' }}>
                                        <SelectValue placeholder="Sector de Actuação" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {COMPANY_CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                                <Select value={formData.province} onValueChange={v => setFormData(p => ({ ...p, province: v }))}>
                                    <SelectTrigger className="h-12 border-slate-200 bg-white px-4 font-semibold text-slate-600" style={{ borderRadius: '8px' }}>
                                        <SelectValue placeholder="Província *" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {["Cabo Delgado","Niassa","Nampula","Zambézia","Tete","Manica","Sofala","Inhambane","Gaza","Maputo Província","Maputo Cidade"].map(p => (
                                            <SelectItem key={p} value={p}>{p}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>

                    {/* CONTACT ROW */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-[10px]">
                        <Input name="contact" value={formData.contact} onChange={handleInputChange}
                            placeholder="Telefone / Contacto"
                            className="h-12 border-slate-200 px-4 text-sm font-semibold text-slate-600 bg-white placeholder:text-slate-400"
                            style={{ borderRadius: '8px' }} />
                        <Input name="email" type="email" value={formData.email} onChange={handleInputChange}
                            placeholder="E-mail Corporativo"
                            className="h-12 border-slate-200 px-4 text-sm font-semibold text-slate-600 bg-white placeholder:text-slate-400"
                            style={{ borderRadius: '8px' }} />
                    </div>

                    {/* ADDRESS ROW */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-[10px]">
                        <Input name="district" value={formData.district} onChange={handleInputChange}
                            placeholder="Distrito"
                            className="h-12 border-slate-200 px-4 text-sm font-semibold text-slate-600 bg-white placeholder:text-slate-400"
                            style={{ borderRadius: '8px' }} />
                        <Input name="address" value={formData.address} onChange={handleInputChange}
                            placeholder="Endereço Completo"
                            className="h-12 border-slate-200 px-4 text-sm font-semibold text-slate-600 bg-white placeholder:text-slate-400"
                            style={{ borderRadius: '8px' }} />
                    </div>

                    {/* DESCRIPTION */}
                    <div className="bg-white border border-slate-200 rounded-[15px] overflow-hidden">
                        <RichTextEditor
                            value={formData.description}
                            onChange={v => setFormData(p => ({ ...p, description: v }))}
                            placeholder="Descrição Geral da Empresa"
                            className="min-h-[150px]"
                        />
                    </div>

                    <Input name="tags" value={formData.tags} onChange={handleInputChange}
                        placeholder="Tags / Palavras-chave (ex: Milho, Soja, Adubos...)"
                        className="h-12 border-slate-200 px-4 text-sm font-semibold text-slate-600 bg-white placeholder:text-slate-400"
                        style={{ borderRadius: '8px' }} />

                    {/* PARCEIRO EXTRA FIELDS */}
                    {formData.plan === 'Parceiro' && (
                        <div className="bg-emerald-50 border border-emerald-200 p-5 space-y-[10px] animate-in fade-in slide-in-from-top-4" style={{ borderRadius: '15px' }}>
                            <p className="text-xs font-black text-emerald-800 uppercase tracking-widest">Dados do Parceiro</p>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-[10px]">
                                <Input name="website" value={formData.website} onChange={handleInputChange}
                                    placeholder="Website Oficial"
                                    className="h-12 border-emerald-200 bg-white px-4 text-sm font-semibold text-slate-600"
                                    style={{ borderRadius: '8px' }} />
                                <Input name="representative" value={formData.representative} onChange={handleInputChange}
                                    placeholder="Nome do Representante"
                                    className="h-12 border-emerald-200 bg-white px-4 text-sm font-semibold text-slate-600"
                                    style={{ borderRadius: '8px' }} />
                                <Input name="nuit" value={formData.nuit} onChange={handleInputChange}
                                    placeholder="NUIT da Empresa"
                                    className="h-12 border-emerald-200 bg-white px-4 text-sm font-semibold text-slate-600"
                                    style={{ borderRadius: '8px' }} />
                            </div>
                        </div>
                    )}

                    {/* PRODUCTS */}
                    <div className="bg-white border border-slate-200 p-6 space-y-4" style={{ borderRadius: '15px' }}>
                        <div className="flex justify-between items-center">
                            <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                Catálogo de Produtos
                                {formData.plan === 'Gratuito' && (
                                    <span className="text-[10px] bg-slate-100 text-slate-500 border border-slate-200 px-2 py-0.5 rounded-md font-black uppercase flex items-center gap-1">
                                        <Lock className="w-3 h-3" /> Premium
                                    </span>
                                )}
                            </h3>
                            {formData.plan !== 'Gratuito' && (
                                <Button
                                    onClick={() => setFormData(p => ({ ...p, products: [...p.products, { name: "", description: "" }] }))}
                                    size="sm"
                                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                                    style={{ borderRadius: '8px' }}
                                >
                                    <Plus className="w-4 h-4 mr-1" /> Adicionar
                                </Button>
                            )}
                        </div>

                        {formData.plan === 'Gratuito' ? (
                            <div className="text-center py-8 border-2 border-dashed border-slate-200" style={{ borderRadius: '10px' }}>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                                    Disponível a partir do plano Premium
                                </p>
                            </div>
                        ) : formData.products.length === 0 ? (
                            <div className="text-center py-8 border-2 border-dashed border-slate-200" style={{ borderRadius: '10px' }}>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Nenhum produto adicionado</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {formData.products.map((prod, idx) => (
                                    <div key={idx} className="flex gap-[10px] items-start bg-slate-50 p-3 border border-slate-100" style={{ borderRadius: '10px' }}>
                                        <div className="flex-1 space-y-2">
                                            <Input
                                                placeholder={`Produto #${idx + 1}`}
                                                value={prod.name}
                                                onChange={e => {
                                                    const products = [...formData.products];
                                                    products[idx].name = e.target.value;
                                                    setFormData(p => ({ ...p, products }));
                                                }}
                                                className="h-10 border-slate-200 bg-white text-sm font-semibold text-slate-600"
                                                style={{ borderRadius: '8px' }}
                                            />
                                            <Textarea
                                                placeholder="Descrição breve"
                                                value={prod.description}
                                                onChange={e => {
                                                    const products = [...formData.products];
                                                    products[idx].description = e.target.value;
                                                    setFormData(p => ({ ...p, products }));
                                                }}
                                                className="border-slate-200 bg-white text-sm text-slate-600 min-h-[60px]"
                                                style={{ borderRadius: '8px' }}
                                            />
                                        </div>
                                        <button
                                            onClick={() => setFormData(p => ({ ...p, products: p.products.filter((_, i) => i !== idx) }))}
                                            className="p-2 text-slate-400 hover:text-red-500 transition-colors mt-1"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* NEWSLETTER */}
                    <div className="flex items-center gap-3 bg-white border border-slate-200 px-5 py-4" style={{ borderRadius: '10px' }}>
                        <input type="checkbox" id="newsletter" checked={formData.newsletter}
                            onChange={e => setFormData(p => ({ ...p, newsletter: e.target.checked }))}
                            className="w-5 h-5 accent-emerald-600 rounded" />
                        <label htmlFor="newsletter" className="text-xs font-bold text-slate-600 cursor-pointer">
                            Subscrever à nossa Newsletter para actualizações do sector
                        </label>
                    </div>

                    {/* SUBMIT */}
                    <div className="pt-2 flex justify-start">
                        <Button
                            onClick={handleSubmit}
                            disabled={loading || needsPayment}
                            className="px-10 h-12 bg-orange-500 hover:bg-orange-600 text-white font-black uppercase tracking-widest shadow-lg shadow-orange-500/20 flex items-center gap-2 disabled:opacity-50"
                            style={{ borderRadius: '8px' }}
                        >
                            {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> A guardar...</> : <><Save className="w-4 h-4" /> Guardar Empresa</>}
                        </Button>
                        {needsPayment && (
                            <p className="text-xs text-orange-600 font-bold ml-4 self-center">
                                Complete o pagamento na barra lateral →
                            </p>
                        )}
                    </div>
                </main>

                {/* ── SIDEBAR RIGHT (dark) ── */}
                <aside
                    className="w-full lg:w-[380px] shrink-0 space-y-[10px] sticky overflow-y-auto"
                    style={{ top: '20px', height: 'calc(100vh - 100px)' }}
                >
                    {/* PLAN SELECTOR */}
                    <div className="bg-white border border-slate-200 shadow-sm p-5 space-y-3" style={{ borderRadius: '15px' }}>
                        <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-2 mb-1">
                            <Crown className="w-4 h-4 text-orange-500" /> Plano
                        </h3>
                        {PLANS.map(plan => (
                            <div
                                key={plan.id}
                                onClick={() => setFormData(p => ({ ...p, plan: plan.id }))}
                                className={cn(
                                    "p-4 border-2 cursor-pointer transition-all",
                                    formData.plan === plan.id
                                        ? PLAN_ACTIVE[plan.id] + " " + PLAN_COLOR[plan.id]
                                        : "border-slate-100 hover:border-slate-200 bg-white"
                                )}
                                style={{ borderRadius: '10px' }}
                            >
                                <div className="flex justify-between items-start">
                                    <div>
                                        <span className="text-sm font-black text-slate-800">{plan.label}</span>
                                        {plan.badge && (
                                            <span className="ml-2 text-[9px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-black uppercase">{plan.badge}</span>
                                        )}
                                        <div className="mt-1 space-y-0.5">
                                            {plan.features.slice(0, 2).map(f => (
                                                <p key={f} className="text-[10px] text-slate-500 flex items-center gap-1">
                                                    <CheckCircle2 className="w-3 h-3 text-emerald-500" /> {f}
                                                </p>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="text-right shrink-0">
                                        {plan.price === null ? (
                                            <span className="text-xs font-black text-slate-600">Sob Consulta</span>
                                        ) : plan.price === 0 ? (
                                            <span className="text-lg font-black text-slate-800">Grátis</span>
                                        ) : (
                                            <>
                                                <span className="text-lg font-black text-slate-800">{plan.price.toLocaleString()} Mt</span>
                                                <p className="text-[9px] text-slate-400">/mês</p>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* HIGHLIGHT + PAYMENT */}
                    <div
                        className="bg-emerald-900 p-5 border border-emerald-800 shadow-sm relative overflow-hidden cursor-pointer"
                        style={{ borderRadius: '15px' }}
                        onClick={() => setFormData(p => ({ ...p, highlightCompany: !p.highlightCompany }))}
                    >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl -mr-8 -mt-8" />
                        <div className="relative z-10 flex items-center justify-between">
                            <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
                                <span className={`w-2 h-2 rounded-full ${formData.highlightCompany ? 'bg-emerald-400 animate-pulse' : 'bg-slate-600'}`} />
                                Destacar Empresa
                            </h3>
                            <div className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 ${formData.highlightCompany ? 'bg-emerald-500' : 'bg-emerald-950 border border-emerald-700'}`}>
                                <div className={`w-4 h-4 rounded-full bg-white shadow-sm transform transition-transform duration-300 ${formData.highlightCompany ? 'translate-x-6' : 'translate-x-0'}`} />
                            </div>
                        </div>
                        <p className="text-xs text-emerald-400 mt-2 font-medium leading-relaxed">
                            Apareça em destaque na página inicial e nos motores de busca!
                        </p>

                        <div className={`grid transition-all duration-500 ease-in-out ${formData.highlightCompany ? 'grid-rows-[1fr] opacity-100 mt-5 pt-5 border-t border-emerald-800' : 'grid-rows-[0fr] opacity-0'}`}>
                            <div className="overflow-hidden min-h-0">
                                <div className="flex flex-col gap-3">
                                    <div className="flex justify-between items-end">
                                        <span className="text-emerald-400 text-xs font-bold uppercase tracking-widest">Custo do Destaque</span>
                                        <span className="text-2xl font-black text-white">1 500 Mt</span>
                                    </div>
                                    <div className="flex gap-2">
                                        <div onClick={e => { e.stopPropagation(); setSelectedPaymentMethod('mpesa'); }}
                                            className={`bg-white p-0 rounded-md border flex items-center justify-center h-8 w-[50px] cursor-pointer overflow-hidden relative transition-all ${selectedPaymentMethod === 'mpesa' ? 'border-[#E60000] ring-2 ring-[#E60000]/30' : 'border-slate-200 hover:border-[#E60000]'}`}>
                                            <Image src="/assets/Mpesa.png" alt="M-Pesa" fill className="object-cover" />
                                        </div>
                                        <div onClick={e => { e.stopPropagation(); setSelectedPaymentMethod('visa'); }}
                                            className={`bg-white px-2 rounded-md border flex items-center justify-center h-8 cursor-pointer overflow-hidden transition-all ${selectedPaymentMethod === 'visa' ? 'border-[#1A1F71] ring-2 ring-[#1A1F71]/30' : 'border-slate-200 hover:border-[#1A1F71]'}`}>
                                            <Image src="/assets/Visa.webp" alt="Visa" width={50} height={25} className="h-full w-auto object-contain" />
                                        </div>
                                    </div>

                                    {selectedPaymentMethod === 'mpesa' && (
                                        <div className="bg-emerald-950/30 p-3 rounded-lg border border-emerald-500/10 space-y-2 animate-in fade-in slide-in-from-top-2">
                                            <label className="text-[10px] font-bold text-emerald-200 uppercase tracking-wider">Número Vodacom</label>
                                            <Input placeholder="258 84/85 xxx xxxx"
                                                value={paymentPhoneNumber}
                                                onChange={e => setPaymentPhoneNumber(e.target.value)}
                                                onClick={e => e.stopPropagation()}
                                                className="h-9 bg-emerald-900/50 border-emerald-800 text-white placeholder:text-emerald-600 text-xs font-mono" />
                                            <Button size="sm" disabled={isPaymentProcessing}
                                                onClick={async e => {
                                                    e.stopPropagation();
                                                    if (paymentPhoneNumber.length < 9) { alert("Insira um número válido."); return; }
                                                    setIsPaymentProcessing(true);
                                                    try {
                                                        const res = await fetch('/api/payment/mpesa', {
                                                            method: 'POST',
                                                            headers: { 'Content-Type': 'application/json' },
                                                            body: JSON.stringify({
                                                                phoneNumber: paymentPhoneNumber.startsWith('258') ? paymentPhoneNumber : `258${paymentPhoneNumber}`,
                                                                amount: String(highlightCost || planCost || 1500),
                                                                reference: `EMP_${Math.random().toString(36).substring(2, 6).toUpperCase()}`
                                                            })
                                                        });
                                                        const data = await res.json();
                                                        if (data.success) {
                                                            setFormData(p => ({ ...p, paymentConfirmed: true, paymentPhone: paymentPhoneNumber, paymentMethod: 'mpesa' }));
                                                            alert("Pedido enviado! Verifique o seu telemóvel e insira o PIN.");
                                                        } else alert(data.message || "Erro ao processar pagamento.");
                                                    } catch { alert("Erro de conexão."); }
                                                    finally { setIsPaymentProcessing(false); }
                                                }}
                                                className="w-full h-8 text-xs font-black uppercase text-white bg-[#E60000] hover:bg-[#cc0000]">
                                                {isPaymentProcessing ? 'Processando...' : `Pagar ${(highlightCost || planCost || 1500).toLocaleString()} Mt`}
                                            </Button>
                                        </div>
                                    )}

                                    {selectedPaymentMethod === 'visa' && (
                                        <div className="bg-emerald-950/30 p-3 rounded-lg border border-emerald-500/10 animate-in fade-in slide-in-from-top-2 space-y-2">
                                            <p className="text-[10px] text-emerald-200 text-center font-bold uppercase tracking-wider">Transferência Bancária (Moza Banco)</p>
                                            <div className="text-xs text-emerald-100 bg-emerald-900/40 p-2 rounded border border-emerald-500/20 space-y-1 font-mono">
                                                <div className="flex justify-between"><span className="text-emerald-400">Banco:</span><span>Moza Banco</span></div>
                                                <div className="flex justify-between"><span className="text-emerald-400">NIB:</span><span className="select-all">003400000544672210195</span></div>
                                                <div className="flex justify-between pt-1 border-t border-emerald-500/10 mt-1"><span className="text-emerald-400">Titular:</span><span>Visual Design</span></div>
                                            </div>
                                            <Button size="sm"
                                                onClick={e => {
                                                    e.stopPropagation();
                                                    const msg = `Olá, envio comprovativo de ${totalCost.toLocaleString()}MT referente ao pagamento do plano *${formData.plan}* da empresa *${formData.companyName || "[Nome da Empresa]"}*.`;
                                                    window.open(`https://wa.me/258877575288?text=${encodeURIComponent(msg)}`, "_blank");
                                                }}
                                                className="w-full h-8 text-xs font-black uppercase text-white bg-[#25D366] hover:bg-[#1ebd59] flex items-center justify-center gap-2">
                                                <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-2.846-.828-.927-.382-1.545-1.3-1.666-1.473-.12-.171-.397-.534-.403-.603-.099-.54.275-.826.47-.798.156.022.253.111.366.191.246.168.21.05.353.454.12.35.082.602-.016.793-.11.21-.262.31-.476.438-.344.184-1.127.674-1.17.653-.027-.013-.372-.444-.453-.556-.098-.135-.078-.292-.012-.423.1-.197.636-.59.715-.656.095-.081.259-.153.414-.158.125-.005.336-.007.493-.007.157 0 .341.055.518.254.178.199.646.619.646 1.509 0 .89.467 1.493.645 1.701zm-3.392-9.416c-4.966 0-9.006 4.04-9.006 9.007 0 1.948.517 3.738 1.424 5.289l-1.365 4.983 5.093-1.337c1.474.805 3.167 1.282 4.954 1.284 4.965 0 9.006-4.041 9.006-9.007.001-4.967-4.04-9.006-9.016-9.219z" /></svg>
                                                Enviar Comprovativo
                                            </Button>
                                        </div>
                                    )}

                                    {formData.paymentConfirmed && (
                                        <div className="flex items-center gap-2 p-3 bg-emerald-500/20 border border-emerald-500/30 rounded-lg">
                                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                                            <span className="text-xs font-bold text-emerald-300">Pagamento confirmado</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* COST SUMMARY */}
                    {totalCost > 0 && (
                        <div className="bg-slate-800 border border-slate-700 p-5 space-y-3" style={{ borderRadius: '15px' }}>
                            <h3 className="text-xs font-black text-slate-300 uppercase tracking-widest">Resumo</h3>
                            {planCost > 0 && (
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-400">Plano {formData.plan}</span>
                                    <span className="text-white font-bold">{planCost.toLocaleString()} Mt/mês</span>
                                </div>
                            )}
                            {highlightCost > 0 && (
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-400">Destaque</span>
                                    <span className="text-white font-bold">1 500 Mt</span>
                                </div>
                            )}
                            <div className="flex justify-between border-t border-slate-600 pt-3">
                                <span className="text-slate-300 font-black text-sm uppercase">Total</span>
                                <span className="text-emerald-400 font-black text-xl">{totalCost.toLocaleString()} Mt</span>
                            </div>
                        </div>
                    )}

                    {/* SEO NOTE */}
                    <div className="bg-emerald-950 border border-emerald-900 p-4" style={{ borderRadius: '12px' }}>
                        <p className="text-[10px] text-emerald-300 leading-relaxed text-center">
                            <span className="font-bold text-emerald-200">Nota SEO:</span> A sua empresa ficará visível nos motores de busca em{" "}
                            <span className="text-white font-bold">24 a 48 horas</span> após verificação.
                        </p>
                    </div>
                </aside>
            </div>
        </div>
    );
}
