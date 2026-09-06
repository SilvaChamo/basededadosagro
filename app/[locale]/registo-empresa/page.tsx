"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import {
    Upload,
    Loader2, Save, Crown, Plus, Trash2, Pencil, Lock, ShoppingBag,
    ShieldCheck, Info
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
import { getProductLimit } from "@/lib/plan-fields";
import { Spinner } from "@/components/ui/spinner";
import { RichTextEditor } from "@/components/RichTextEditor";
import { COMPANY_CATEGORIES } from "@/lib/constants";
import { VALUE_CHAINS, ESTABLISHMENT_TYPES } from "@/lib/agro-data";
import { PaymentItem } from "@/components/PaymentItem";
import { FormPageHeader } from "@/components/FormPageHeader";
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

const PLAN_ACTIVE: Record<string, string> = {
    Gratuito: 'ring-2 ring-slate-400',
    Premium: 'ring-2 ring-orange-400',
    'Business Vendedor': 'ring-2 ring-blue-500',
    Parceiro: 'ring-2 ring-emerald-500',
};

interface ProductRow {
    id?: string;
    name: string;
    price: string;
    category: string;
    image_url: string;
    description: string;
    is_available: boolean;
}

const EMPTY_PRODUCT: ProductRow = { name: "", price: "", category: "", image_url: "", description: "", is_available: true };

// PaymentItem (M-Pesa com polling real + comprovativo manual para
// transferência/Visa) vive agora em components/PaymentItem.tsx, partilhado
// com /checkout — garante que os dois têm exactamente o mesmo comportamento.

function RegistoEmpresaContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const supabase = createClient();
    // Vindo do botão "Destacar a sua empresa" (?destacar=1) -> o interruptor
    // já começa ligado. Vindo de qualquer outro sítio (ex.: "Cadastrar a
    // minha empresa" em /empresas) -> começa desligado, como seria um
    // registo simples.
    const arrivedToHighlight = searchParams.get('destacar') === '1';

    // A conta já existe sempre que se chega aqui — quem não tem sessão é
    // mandado para a página de login (que já sabe criar conta / entrar).
    // Esta página nunca cria contas, só aplica plano/destaque à conta actual.
    const [checkingAuth, setCheckingAuth] = useState(true);
    const [user, setUser] = useState<any>(null);
    const [companyId, setCompanyId] = useState<string | null>(null);

    const [loading, setLoading] = useState(false);
    // Estados separados — antes partilhavam um só "uploading" e o spinner
    // aparecia na caixa errada (logo a rodar enquanto se enviava o banner).
    const [uploadingLogo, setUploadingLogo] = useState(false);
    const [uploadingBanner, setUploadingBanner] = useState(false);
    const [tempLogoFile, setTempLogoFile] = useState<File | null>(null);
    const [bannerUrl, setBannerUrl] = useState("");
    const [tempBannerFile, setTempBannerFile] = useState<File | null>(null);

    const [showPlans, setShowPlans] = useState(true);
    // Plano e destaque são cobranças independentes — cada uma com o seu
    // próprio estado de "já pago", para se poder pagar uma sem a outra, em
    // qualquer ordem, mesmo repetindo o mesmo método (M-Pesa) para as duas.
    const [highlightPaid, setHighlightPaid] = useState(false);
    const [planPaid, setPlanPaid] = useState(false);

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
        highlightCompany: arrivedToHighlight,
        province: "",
        district: "",
        address: "",
        sector: "",
        valueChain: "",
        establishmentType: "",
        description: "",
        tags: "",
        paymentMethod: "",
        paymentPhone: "",
    });

    // Produtos — a empresa só existe a sério depois de gravar o formulário,
    // por isso os produtos ficam aqui (com a foto já enviada) e só são
    // gravados na tabela própria a seguir a criar/actualizar a empresa.
    const [products, setProducts] = useState<ProductRow[]>([]);
    const [newProduct, setNewProduct] = useState<ProductRow>(EMPTY_PRODUCT);
    const [isAddingProduct, setIsAddingProduct] = useState(false);
    const [editingProductIdx, setEditingProductIdx] = useState<number | null>(null);
    const [uploadingProductImage, setUploadingProductImage] = useState(false);

    // honeypot anti-bot — campo escondido; se vier preenchido, é robô.
    const [honeypot, setHoneypot] = useState("");

    const logoInputRef = useRef<HTMLInputElement>(null);
    const bannerInputRef = useRef<HTMLInputElement>(null);
    const productImageInputRef = useRef<HTMLInputElement>(null);
    const planCardRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const init = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                // Sem sessão: vai directo para o formulário de criar
                // conta/entrar (já tem os dois modos e um link para trocar
                // entre eles) — sem ecrã intermédio a duplicar essa escolha.
                const qs = searchParams.toString();
                const next = encodeURIComponent(`/registo-empresa${qs ? `?${qs}` : ""}`);
                router.push(`/registar?next=${next}`);
                return;
            }
            setUser(user);

            const { data: company } = await supabase
                .from('companies')
                .select('*')
                .eq('user_id', user.id)
                .maybeSingle();

            if (company) {
                setCompanyId(company.id);
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
                    valueChain: company.value_chain || prev.valueChain,
                    establishmentType: company.registration_type || prev.establishmentType,
                    description: company.description || prev.description,
                    plan: company.plan || prev.plan,
                    website: company.website || prev.website,
                    representative: company.representative_name || prev.representative,
                    nuit: company.nuit || prev.nuit,
                    billingPeriod: company.billing_period || prev.billingPeriod,
                    highlightCompany: typeof company.is_featured === 'boolean' ? company.is_featured : prev.highlightCompany,
                }));
                if (company.banner_url) setBannerUrl(company.banner_url);

                // Plano/destaque já activos na conta = já pagos antes — não
                // voltar a pedir pagamento para a MESMA coisa outra vez. Ao
                // seleccionar um plano diferente (upgrade/downgrade), o
                // clique na lista de planos já repõe planPaid=false sozinho.
                const savedPlanLower = String(company.plan || '').toLowerCase();
                if (company.plan && savedPlanLower !== 'gratuito' && savedPlanLower !== 'free') {
                    setPlanPaid(true);
                }
                if (company.is_featured) {
                    setHighlightPaid(true);
                }

                const { data: existingProducts } = await supabase
                    .from('products')
                    .select('*')
                    .eq('company_id', company.id);
                if (existingProducts?.length) {
                    setProducts(existingProducts.map((p: any) => ({
                        id: p.id,
                        name: p.name || "",
                        price: p.price?.toString() || "",
                        category: p.category || "",
                        image_url: p.image_url || "",
                        description: p.description || "",
                        is_available: p.is_available !== false,
                    })));
                }
            }
            setCheckingAuth(false);
        };
        init();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // Comprime sempre para baixo de 50kb (o hardCapMB do resto do site) —
    // primeiro tenta com qualidade alta, só perde qualidade real se a
    // imagem for mesmo grande, porque compressImage baixa a qualidade em
    // passos pequenos até caber no tamanho, mantendo a maior nitidez
    // possível dentro do limite.
    const COMPRESS_OPTS = { targetSizeKb: 50, maxWidth: 1200, maxHeight: 1200 };

    const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || !e.target.files.length) return;
        const file = e.target.files[0];
        setUploadingLogo(true);
        try {
            const blob = await compressImage(file, COMPRESS_OPTS);
            const path = `logos/${user.id}-${Math.random()}.webp`;
            const { error } = await supabase.storage.from('public-assets').upload(path, blob, { contentType: 'image/webp' });
            if (error) throw error;
            const { data: { publicUrl } } = supabase.storage.from('public-assets').getPublicUrl(path);
            setFormData(prev => ({ ...prev, logoUrl: publicUrl }));
        } catch (err: any) {
            console.error("Erro no upload do logo:", err);
            alert(`Erro ao fazer upload do logo${err?.message ? `: ${err.message}` : "."}`);
        }
        finally { setUploadingLogo(false); }
    };

    const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || !e.target.files.length) return;
        const file = e.target.files[0];
        setUploadingBanner(true);
        try {
            const blob = await compressImage(file, COMPRESS_OPTS);
            const path = `banners/${user.id}-${Math.random()}.webp`;
            const { error } = await supabase.storage.from('public-assets').upload(path, blob, { contentType: 'image/webp' });
            if (error) throw error;
            const { data: { publicUrl } } = supabase.storage.from('public-assets').getPublicUrl(path);
            setBannerUrl(publicUrl);
        } catch (err: any) {
            console.error("Erro no upload do banner:", err);
            alert(`Erro ao fazer upload do banner${err?.message ? `: ${err.message}` : "."}`);
        }
        finally { setUploadingBanner(false); }
    };

    // Foto do produto — mesma compressão e mesmo envio directo já usados
    // acima para logo/banner (a rota de upload com optimização automática
    // que existe no painel de administração é só para administradores).
    const handleProductImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || !e.target.files.length) return;
        const file = e.target.files[0];
        setUploadingProductImage(true);
        try {
            const blob = await compressImage(file, COMPRESS_OPTS);
            const path = `products/${user.id}-${Date.now()}.webp`;
            const { error } = await supabase.storage.from('public-assets').upload(path, blob, { contentType: 'image/webp' });
            if (error) throw error;
            const { data: { publicUrl } } = supabase.storage.from('public-assets').getPublicUrl(path);
            setNewProduct(prev => ({ ...prev, image_url: publicUrl }));
        } catch { alert("Erro ao fazer upload da foto do produto."); }
        finally { setUploadingProductImage(false); }
    };

    const handleSaveProduct = () => {
        if (!newProduct.name.trim()) { alert("Indique o nome do produto."); return; }
        if (editingProductIdx !== null) {
            setProducts(prev => prev.map((p, i) => (i === editingProductIdx ? newProduct : p)));
        } else {
            setProducts(prev => [...prev, newProduct]);
        }
        setNewProduct(EMPTY_PRODUCT);
        setEditingProductIdx(null);
        setIsAddingProduct(false);
    };

    const handleEditProduct = (idx: number) => {
        setNewProduct(products[idx]);
        setEditingProductIdx(idx);
        setIsAddingProduct(true);
    };

    const handleDeleteProduct = (idx: number) => {
        setProducts(prev => prev.filter((_, i) => i !== idx));
    };

    const planLower = formData.plan.toLowerCase();
    const planCost = planLower === 'gratuito' || planLower === 'free' ? 0
        : planLower === 'premium' ? 2500
            : planLower === 'business vendedor' ? 5000 : 0;
    const highlightCost = formData.highlightCompany ? 1500 : 0;
    // Plano e destaque pagam-se em separado — cada um só entra na conta se
    // tiver custo e ainda não tiver sido pago.
    const planNeedsPayment = (planCost > 0 || planLower === 'parceiro') && !planPaid;
    const highlightNeedsPayment = highlightCost > 0 && !highlightPaid;
    const needsPayment = planNeedsPayment || highlightNeedsPayment;
    // Só para o bloco de pagamento em si (Parceiro é "sob consulta", não tem
    // valor fixo para somar aqui — continua a bloquear a gravação acima via
    // planNeedsPayment, mas não entra na conta do M-Pesa/Visa).
    const highlightDue = highlightNeedsPayment;
    const planDue = planCost > 0 && !planPaid;
    const productLimit = getProductLimit(formData.plan);
    const canAddProduct = !planNeedsPayment && products.length < productLimit;

    const handleSubmit = async () => {
        if (honeypot.trim()) return; // honeypot anti-bot: preenchido => ignora submissão
        if (needsPayment) {
            setShowPlans(true);
            planCardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            return;
        }

        setLoading(true);
        try {
            let finalLogoUrl = formData.logoUrl;
            let finalBannerUrl = bannerUrl;

            if (tempLogoFile && !formData.logoUrl.startsWith('http')) {
                const blob = await compressImage(tempLogoFile);
                const path = `logos/${user.id}-${Math.random()}.webp`;
                const { error } = await supabase.storage.from('public-assets').upload(path, blob);
                if (error) throw error;
                finalLogoUrl = supabase.storage.from('public-assets').getPublicUrl(path).data.publicUrl;
            }
            if (tempBannerFile && !bannerUrl.startsWith('http')) {
                const blob = await compressImage(tempBannerFile);
                const path = `banners/${user.id}-${Math.random()}.webp`;
                const { error } = await supabase.storage.from('public-assets').upload(path, blob);
                if (error) throw error;
                finalBannerUrl = supabase.storage.from('public-assets').getPublicUrl(path).data.publicUrl;
            }

            const companyPayload = {
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
                value_chain: formData.valueChain,
                registration_type: formData.establishmentType,
                description: formData.description,
                plan: formData.plan,
                website: formData.website,
                representative_name: formData.representative,
                nuit: formData.nuit,
                billing_period: formData.billingPeriod,
                // resumo dos produtos, usado pelo perfil público da empresa
                products: products.map(({ id, ...p }) => p),
                is_featured: formData.highlightCompany,
                payment_method: formData.paymentMethod,
                payment_phone: formData.paymentPhone,
                geo_location: `${formData.province}, ${formData.district}`,
                updated_at: new Date().toISOString()
            };

            // A tabela `companies` na base de dados NÃO tem constraint UNIQUE
            // em `user_id`, por isso um upsert com { onConflict: 'user_id' }
            // rebenta com "there is no unique or exclusion constraint matching
            // the ON CONFLICT specification". Fazemos a decisão à mão: se já
            // existe empresa deste utilizador, UPDATE; senão, INSERT. (Buscar
            // o id por select separado — encadear .select() a uma escrita no
            // cliente do browser é frágil por causa das políticas RLS.)
            let newCompanyId = companyId;
            if (!newCompanyId) {
                const { data: freshCompany } = await supabase
                    .from('companies')
                    .select('id')
                    .eq('user_id', user.id)
                    .maybeSingle();
                newCompanyId = freshCompany?.id || null;
            }

            if (newCompanyId) {
                const { error } = await supabase.from('companies').update(companyPayload).eq('id', newCompanyId);
                if (error) throw error;
            } else {
                const { error } = await supabase.from('companies').insert(companyPayload);
                if (error) throw error;
                const { data: freshCompany } = await supabase
                    .from('companies')
                    .select('id')
                    .eq('user_id', user.id)
                    .maybeSingle();
                newCompanyId = freshCompany?.id || null;
            }

            // Produtos vão também para a tabela própria — é a que alimenta
            // "Meus Produtos" no painel.
            if (newCompanyId) {
                for (const p of products) {
                    const row = {
                        name: p.name,
                        price: parseFloat(p.price) || 0,
                        category: p.category,
                        image_url: p.image_url,
                        description: p.description,
                        is_available: p.is_available,
                    };
                    if (p.id) {
                        await supabase.from('products').update(row).eq('id', p.id);
                    } else {
                        await supabase.from('products').insert([{ ...row, company_id: newCompanyId, user_id: user.id }]);
                    }
                }
            }

            alert("Empresa guardada com sucesso!");
            router.push('/usuario/dashboard/minha-conta');
        } catch (err: any) {
            alert(`Erro ao salvar dados: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    if (checkingAuth) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-100">
                <Spinner className="w-10 h-10 text-emerald-600" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-100 font-sans pb-20">
            {/* Cabeçalho partilhado por todos os formulários fora dos
                painéis — a barra ocupa a largura total, o conteúdo obedece
                à largura normal do site (container-site). */}
            <FormPageHeader />

            <div className="pb-5 md:pb-8" style={{ paddingTop: '30px' }}>
                <div className="container-site flex flex-col lg:flex-row gap-[20px]">
                    {/* honeypot anti-bot — invisível para humanos. Fica fora do
                        <main> de propósito: dentro dele era o primeiro filho
                        de um space-y-[10px], e isso empurrava 10px de
                        margem indevida para o banner logo a seguir. */}
                    <input
                        type="text"
                        name="empresa_site_confirm"
                        tabIndex={-1}
                        autoComplete="off"
                        aria-hidden="true"
                        value={honeypot}
                        onChange={e => setHoneypot(e.target.value)}
                        className="absolute left-[-9999px] top-0 h-0 w-0 opacity-0 pointer-events-none"
                    />

                    {/* ── MAIN FORM (LEFT) ── */}
                    <main className="flex-1 space-y-[10px]">

                        {/* BANNER */}
                        <div
                            onClick={() => bannerInputRef.current?.click()}
                            className="w-full h-40 bg-white border-2 border-dashed border-slate-200 flex flex-col items-center justify-center group hover:bg-slate-50 transition-all cursor-pointer overflow-hidden relative shadow-sm"
                            style={{ borderRadius: '8px' }}
                        >
                            {uploadingBanner ? (
                                <Loader2 className="w-8 h-8 text-slate-400 animate-spin" />
                            ) : bannerUrl ? (
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
                                className="w-56 shrink-0 bg-white border-2 border-dashed border-slate-200 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 transition-all overflow-hidden relative"
                                style={{ borderRadius: '8px' }}
                            >
                                {uploadingLogo ? <Loader2 className="w-8 h-8 text-slate-400 animate-spin" /> :
                                    formData.logoUrl ? (
                                        <img src={formData.logoUrl} alt="Logo" className="w-full h-full object-contain" />
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
                                        <SelectTrigger className="w-full h-12 border-slate-200 bg-white px-4 font-semibold text-slate-600" style={{ borderRadius: '8px' }}>
                                            <SelectValue placeholder="Sector de Actuação" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {COMPANY_CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                    <Select value={formData.province} onValueChange={v => setFormData(p => ({ ...p, province: v }))}>
                                        <SelectTrigger className="w-full h-12 border-slate-200 bg-white px-4 font-semibold text-slate-600" style={{ borderRadius: '8px' }}>
                                            <SelectValue placeholder="Província *" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {["Cabo Delgado", "Niassa", "Nampula", "Zambézia", "Tete", "Manica", "Sofala", "Inhambane", "Gaza", "Maputo Província", "Maputo Cidade"].map(p => (
                                                <SelectItem key={p} value={p}>{p}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid grid-cols-2 gap-[10px]">
                                    <Select value={formData.establishmentType} onValueChange={v => setFormData(p => ({ ...p, establishmentType: v }))}>
                                        <SelectTrigger className="w-full h-12 border-slate-200 bg-white px-4 font-semibold text-slate-600" style={{ borderRadius: '8px' }}>
                                            <SelectValue placeholder="Tipo de Estabelecimento" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {ESTABLISHMENT_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                    <Select value={formData.valueChain} onValueChange={v => setFormData(p => ({ ...p, valueChain: v }))}>
                                        <SelectTrigger className="w-full h-12 border-slate-200 bg-white px-4 font-semibold text-slate-600" style={{ borderRadius: '8px' }}>
                                            <SelectValue placeholder="Cadeia de Valor" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {VALUE_CHAINS.map(vc => <SelectItem key={vc} value={vc}>{vc}</SelectItem>)}
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
                        <div className="bg-white border border-slate-200 rounded-[8px] overflow-hidden">
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

                        {/* PARCEIRO EXTRA FIELDS — só aparece neste plano */}
                        {formData.plan === 'Parceiro' && (
                            <div className="bg-emerald-50 border border-emerald-200 p-5 space-y-[10px] animate-in fade-in slide-in-from-top-4" style={{ borderRadius: '8px' }}>
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

                        {/* PRODUCTS — só a partir do plano Premium, com foto */}
                        <div className="bg-white border border-slate-200 p-6 space-y-4" style={{ borderRadius: '8px' }}>
                            <div className="flex justify-between items-center">
                                <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
                                    <ShoppingBag className="w-4 h-4 text-emerald-600" />
                                    Catálogo de Produtos
                                    {formData.plan === 'Gratuito' && (
                                        <span className="text-[10px] bg-slate-100 text-slate-500 border border-slate-200 px-2 py-0.5 rounded-md font-black uppercase flex items-center gap-1">
                                            <Lock className="w-3 h-3" /> Premium
                                        </span>
                                    )}
                                </h3>
                                {canAddProduct && !isAddingProduct && (
                                    <Button
                                        onClick={() => { setNewProduct(EMPTY_PRODUCT); setEditingProductIdx(null); setIsAddingProduct(true); }}
                                        size="sm"
                                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                                        style={{ borderRadius: '8px' }}
                                    >
                                        <Plus className="w-4 h-4 mr-1" /> Adicionar
                                    </Button>
                                )}
                            </div>

                            {formData.plan === 'Gratuito' || planNeedsPayment ? (
                                <div className="text-center py-8 border-2 border-dashed border-slate-200" style={{ borderRadius: '8px' }}>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                                        {planNeedsPayment ? 'Efectue o pagamento do plano para adicionar produtos' : 'Sem produtos disponíveis neste plano'}
                                    </p>
                                </div>
                            ) : (
                                <>
                                    {isAddingProduct && canAddProduct && (
                                        <div className="flex flex-col md:flex-row gap-4 bg-slate-50 p-4 border border-slate-200" style={{ borderRadius: '8px' }}>
                                            <div
                                                onClick={() => productImageInputRef.current?.click()}
                                                className="w-full md:w-40 h-40 shrink-0 bg-white border-2 border-dashed border-slate-200 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-100 transition-all overflow-hidden relative"
                                                style={{ borderRadius: '8px' }}
                                            >
                                                {uploadingProductImage ? (
                                                    <Loader2 className="w-6 h-6 text-slate-400 animate-spin" />
                                                ) : newProduct.image_url ? (
                                                    <img src={newProduct.image_url} alt="" className="w-full h-full object-cover" />
                                                ) : (
                                                    <>
                                                        <Upload className="w-6 h-6 text-slate-400 mb-1" />
                                                        <span className="text-[10px] font-bold text-slate-500 uppercase">Foto do Produto</span>
                                                    </>
                                                )}
                                                <input ref={productImageInputRef} type="file" className="hidden" accept="image/*" onChange={handleProductImageUpload} />
                                            </div>
                                            <div className="flex-1 space-y-2">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                                    <Input placeholder="Nome do produto *" value={newProduct.name}
                                                        onChange={e => setNewProduct(p => ({ ...p, name: e.target.value }))}
                                                        className="h-10 bg-white border-slate-200 text-sm font-semibold text-slate-600" style={{ borderRadius: '8px' }} />
                                                    <Input placeholder="Preço (MT)" value={newProduct.price} type="number"
                                                        onChange={e => setNewProduct(p => ({ ...p, price: e.target.value }))}
                                                        className="h-10 bg-white border-slate-200 text-sm font-semibold text-slate-600" style={{ borderRadius: '8px' }} />
                                                </div>
                                                <Input placeholder="Categoria" value={newProduct.category}
                                                    onChange={e => setNewProduct(p => ({ ...p, category: e.target.value }))}
                                                    className="h-10 bg-white border-slate-200 text-sm font-semibold text-slate-600" style={{ borderRadius: '8px' }} />
                                                <Textarea placeholder="Descrição breve" value={newProduct.description}
                                                    onChange={e => setNewProduct(p => ({ ...p, description: e.target.value }))}
                                                    className="border-slate-200 bg-white text-sm text-slate-600 min-h-[60px]" style={{ borderRadius: '8px' }} />
                                                <div className="flex justify-end gap-2 pt-1">
                                                    <Button variant="outline" size="sm" onClick={() => { setIsAddingProduct(false); setEditingProductIdx(null); }}>Cancelar</Button>
                                                    <Button size="sm" onClick={handleSaveProduct} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold">
                                                        {editingProductIdx !== null ? "Guardar Alterações" : "Adicionar Produto"}
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {products.length === 0 && !isAddingProduct ? (
                                        <div className="text-center py-8 border-2 border-dashed border-slate-200" style={{ borderRadius: '8px' }}>
                                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Nenhum produto adicionado</p>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                                            {products.map((prod, idx) => (
                                                <div key={idx} className="bg-slate-50 border border-slate-200 overflow-hidden group relative" style={{ borderRadius: '8px' }}>
                                                    <div className="h-28 bg-white flex items-center justify-center overflow-hidden">
                                                        {prod.image_url ? (
                                                            <img src={prod.image_url} alt={prod.name} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <ShoppingBag className="w-8 h-8 text-slate-300" />
                                                        )}
                                                    </div>
                                                    <div className="p-3">
                                                        <p className="text-sm font-bold text-slate-700 truncate">{prod.name}</p>
                                                        {prod.price && <p className="text-xs text-emerald-600 font-bold">{Number(prod.price).toLocaleString()} Mt</p>}
                                                    </div>
                                                    <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button onClick={() => handleEditProduct(idx)} className="p-1.5 bg-white/90 rounded-full shadow-sm hover:bg-emerald-600 hover:text-white transition-colors">
                                                            <Pencil className="w-3.5 h-3.5" />
                                                        </button>
                                                        <button onClick={() => handleDeleteProduct(idx)} className="p-1.5 bg-white/90 rounded-full shadow-sm hover:bg-red-500 hover:text-white transition-colors">
                                                            <Trash2 className="w-3.5 h-3.5" />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </>
                            )}
                        </div>

                        {/* NEWSLETTER */}
                        <div className="flex items-center gap-3 bg-white border border-slate-200 px-5 py-4" style={{ borderRadius: '8px' }}>
                            <input type="checkbox" id="newsletter" checked={formData.newsletter}
                                onChange={e => setFormData(p => ({ ...p, newsletter: e.target.checked }))}
                                className="w-5 h-5 accent-emerald-600 rounded" />
                            <label htmlFor="newsletter" className="text-xs font-bold text-slate-600 cursor-pointer">
                                Subscrever à nossa Newsletter para actualizações do sector
                            </label>
                        </div>

                        {/* SUBMIT */}
                        <div className="pt-2 flex justify-start items-center flex-wrap gap-4">
                            <Button
                                onClick={handleSubmit}
                                disabled={loading}
                                className="px-10 h-12 bg-orange-500 hover:bg-orange-600 text-white font-black uppercase tracking-widest shadow-lg shadow-orange-500/20 flex items-center gap-2 disabled:opacity-50"
                                style={{ borderRadius: '8px' }}
                            >
                                {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> A guardar...</> : <><Save className="w-4 h-4" /> Guardar Empresa</>}
                            </Button>
                            {needsPayment && (
                                <p className="text-xs text-orange-600 font-bold self-center">
                                    Complete o pagamento na barra lateral →
                                </p>
                            )}
                        </div>
                    </main>

                    {/* ── SIDEBAR RIGHT — plano + pagamento, um só bloco ── */}
                    <aside className="w-full lg:w-[380px] shrink-0 space-y-[10px] lg:sticky lg:top-5 self-start">
                        <div
                            ref={planCardRef}
                            className="bg-emerald-900 p-5 border border-emerald-800 shadow-sm relative overflow-hidden"
                            style={{ borderRadius: '8px' }}
                        >
                            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl -mr-8 -mt-8" />

                            <div
                                className="relative z-10 flex items-center justify-between cursor-pointer"
                                onClick={() => setFormData(p => ({ ...p, highlightCompany: !p.highlightCompany }))}
                            >
                                <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
                                    <span className={`w-2 h-2 rounded-full ${formData.highlightCompany ? 'bg-emerald-400 animate-pulse' : 'bg-slate-600'}`} />
                                    Destacar Empresa
                                </h3>
                                <div className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 ${formData.highlightCompany ? 'bg-emerald-500' : 'bg-emerald-950 border border-emerald-700'}`}>
                                    <div className={`w-4 h-4 rounded-full bg-white shadow-sm transform transition-transform duration-300 ${formData.highlightCompany ? 'translate-x-6' : 'translate-x-0'}`} />
                                </div>
                            </div>
                            <p className="text-xs text-emerald-400 mt-2 font-medium leading-relaxed relative z-10">
                                Apareça em destaque na página inicial e nos motores de busca!
                            </p>

                            {/* Plano — escondido por omissão; abre com "Assinar um plano".
                                Junta a escolha do plano com o pagamento no MESMO sítio, porque
                                a mesma cobrança pode incluir o plano + o destaque. */}
                            <div className="mt-5 pt-5 border-t border-emerald-800 relative z-10 space-y-3">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-xs font-black text-white uppercase tracking-widest">Plano actual</p>
                                        <p className="text-lg font-black text-white">{formData.plan}</p>
                                    </div>
                                    <Button
                                        type="button"
                                        onClick={() => setShowPlans(v => !v)}
                                        size="sm"
                                        className="bg-orange-500 hover:bg-orange-600 text-white font-black uppercase tracking-widest text-[11px]"
                                        style={{ borderRadius: '8px' }}
                                    >
                                        <Crown className="w-3.5 h-3.5 mr-1" /> Assinar um plano
                                    </Button>
                                </div>

                                {showPlans && (
                                    <div className="space-y-2 pt-2 animate-in fade-in slide-in-from-top-2">
                                        {PLANS.map(plan => (
                                            <div
                                                key={plan.id}
                                                onClick={() => {
                                                    if (formData.plan !== plan.id) setPlanPaid(false);
                                                    setFormData(p => ({ ...p, plan: plan.id }));
                                                }}
                                                className={cn(
                                                    "p-3 border-2 cursor-pointer transition-all bg-emerald-950/40",
                                                    formData.plan === plan.id ? PLAN_ACTIVE[plan.id] + " border-emerald-400" : "border-emerald-800 hover:border-emerald-600"
                                                )}
                                                style={{ borderRadius: '8px' }}
                                            >
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <span className="text-sm font-black text-white">{plan.label}</span>
                                                        {plan.badge && (
                                                            <span className="ml-2 text-[9px] bg-white/10 text-emerald-200 px-2 py-0.5 rounded-full font-black uppercase">{plan.badge}</span>
                                                        )}
                                                        <div className="mt-1 space-y-0.5">
                                                            {plan.features.slice(0, 2).map(f => (
                                                                <p key={f} className="text-[10px] text-emerald-300 flex items-center gap-1">
                                                                    <Save className="w-3 h-3 text-emerald-500" /> {f}
                                                                </p>
                                                            ))}
                                                        </div>
                                                    </div>
                                                    <div className="text-right shrink-0">
                                                        {plan.price === null ? (
                                                            <span className="text-xs font-black text-emerald-200">Sob Consulta</span>
                                                        ) : plan.price === 0 ? (
                                                            <span className="text-base font-black text-white">Grátis</span>
                                                        ) : (
                                                            <>
                                                                <span className="text-base font-black text-white">{plan.price.toLocaleString()} Mt</span>
                                                                <p className="text-[9px] text-emerald-400">/mês</p>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Pagamento — um único bloco. Enquanto nada estiver pago, o
                                    destaque e o plano somam-se no mesmo total (uma só cobrança,
                                    um só método a escolher). Assim que uma parte é paga, esse
                                    valor sai da conta e o bloco actualiza-se sozinho — se ainda
                                    faltar a outra parte, o método volta a aparecer só para essa;
                                    ao escolher outro plano (upgrade), a cobrança recomeça de novo
                                    só com o que falta, sem nunca mostrar dois métodos ao mesmo
                                    tempo. */}
                                {(highlightDue || planDue) && (
                                    <div className="pt-3 border-t border-emerald-800">
                                        <PaymentItem
                                            key={`${highlightDue}-${planDue}-${formData.plan}`}
                                            label={
                                                highlightDue && planDue
                                                    ? `Destacar Empresa + Plano ${formData.plan}`
                                                    : highlightDue
                                                        ? "Destacar Empresa"
                                                        : `Plano ${formData.plan}`
                                            }
                                            amount={(highlightDue ? highlightCost : 0) + (planDue ? planCost : 0)}
                                            planName={formData.plan}
                                            itemType={highlightDue && planDue ? 'both' : highlightDue ? 'highlight' : 'plan'}
                                            onPaid={() => {
                                                if (highlightDue) setHighlightPaid(true);
                                                if (planDue) setPlanPaid(true);
                                            }}
                                        />
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="bg-emerald-950 border border-emerald-900 p-4" style={{ borderRadius: '8px' }}>
                            <p className="text-[10px] text-emerald-300 leading-relaxed text-center flex items-center justify-center gap-2">
                                <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                                <span><span className="font-bold text-emerald-200">Nota SEO:</span> a sua empresa fica visível nos motores de busca em 24 a 48 horas após verificação.</span>
                            </p>
                        </div>
                    </aside>
                </div>
            </div>
        </div>
    );
}

export default function RegistoEmpresaPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-slate-100">
                <Spinner className="w-10 h-10 text-emerald-600" />
            </div>
        }>
            <RegistoEmpresaContent />
        </Suspense>
    );
}
