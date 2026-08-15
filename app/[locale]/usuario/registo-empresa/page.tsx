"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import {
    Building2, MapPin, Briefcase, CheckCircle2,
    ArrowRight, ArrowLeft, Upload, Loader2, Save, Crown
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn, compressImage } from "@/lib/utils";
import { Spinner } from "@/components/ui/spinner";

// Definindo os passos do Wizard
const STEPS = [
    { id: 1, title: "Identidade", icon: Building2, description: "Essenciais do negócio" },
    { id: 2, title: "Plano", icon: Crown, description: "Escolha sua presença" },
    { id: 3, title: "Localização", icon: MapPin, description: "Sede e operação" },
    { id: 4, title: "Atividade", icon: Briefcase, description: "Perfil detalhado" },
    { id: 5, title: "Produtos", icon: Save, description: "Seu catálogo" },
    { id: 6, title: "Pagamento", icon: CheckCircle2, description: "Facturação" }
];

export default function RegisterCompanyPage() {
    const router = useRouter();
    const supabase = createClient();

    // Estados Globais
    const [currentStep, setCurrentStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [user, setUser] = useState<any>(null);
    const [tempLogoFile, setTempLogoFile] = useState<File | null>(null);
    const [isRestored, setIsRestored] = useState(false);

    // Estado do Formulário (Unificado)
    const [formData, setFormData] = useState({
        // Passo 1: Identidade
        companyName: "",
        activity: "",
        email: "",
        contact: "",
        newsletter: true,
        logoUrl: "",

        // Partner Fields
        website: "",
        representative: "",
        nuit: "",

        // Passo 2: Plano
        plan: "Gratuito", // Gratuito | Premium | Business Vendedor | Parceiro
        billingPeriod: "monthly",
        isCatalogUnlocked: false,
        highlightCompany: false,

        // Passo 3: Localização
        province: "",
        district: "",
        address: "",

        // Passo 4: Atividade
        sector: "",
        description: "",
        tags: "",

        // Passo 5: Produtos
        products: [] as { name: string; description: string }[],

        // Passo 6: Pagamento
        paymentMethod: "",
        paymentPhone: "",
        paymentConfirmed: false
    });

    const fileInputRef = useRef<HTMLInputElement>(null);

    // Verificar Auth e Restaurar Dados
    useEffect(() => {
        const checkUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);
        };
        checkUser();

        // Restore from localStorage
        const savedData = localStorage.getItem('pending_company_form');
        if (savedData) {
            try {
                const parsed = JSON.parse(savedData);
                setFormData(prev => ({ ...prev, ...parsed }));
            } catch (e) {
                console.error("Error restoring data", e);
            }
        }
        setIsRestored(true);
    }, [supabase]);

    // Auto-save to localStorage
    useEffect(() => {
        if (isRestored) {
            const { logoUrl, ...rest } = formData; // Don't save URL to localStorage if it's transient
            localStorage.setItem('pending_company_form', JSON.stringify(rest));
        }
    }, [formData, isRestored]);

    // Auto-submit after login
    useEffect(() => {
        const pendingSubmission = localStorage.getItem('pending_company_submission');
        if (user && pendingSubmission === 'true') {
            localStorage.removeItem('pending_company_submission');
            handleSubmit();
        }
    }, [user]);

    // Auto-resize textarea function
    const autoResize = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const target = e.target;
        target.style.height = 'auto';
        target.style.height = `${target.scrollHeight}px`;
    };

    // Handlers
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;
        const file = e.target.files[0];

        if (!user) {
            // Se não estiver logado, apenas guarda localmente o ficheiro e mostra uma preview temporária
            setTempLogoFile(file);
            const reader = new FileReader();
            reader.onload = (event) => {
                setFormData(prev => ({ ...prev, logoUrl: event.target?.result as string }));
            };
            reader.readAsDataURL(file);
            return;
        }

        setUploading(true);
        try {
            const compressedBlob = await compressImage(file);
            const filePath = `company-logos/${user?.id}-${Math.random()}.webp`;

            const { error: uploadError } = await supabase.storage
                .from('public-assets')
                .upload(filePath, compressedBlob);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('public-assets')
                .getPublicUrl(filePath);

            setFormData(prev => ({ ...prev, logoUrl: publicUrl }));
        } catch (error) {
            console.error("Upload error:", error);
            alert("Erro ao fazer upload do logo. Tente novamente.");
        } finally {
            setUploading(false);
        }
    };

    const handleNext = () => {
        if (currentStep < 6) setCurrentStep(prev => prev + 1);
    };

    const handleBack = () => {
        if (currentStep > 1) setCurrentStep(prev => prev - 1);
    };

    const handleSubmit = async () => {
        if (!user) {
            // Salvar estado e redirecionar para login/registo
            localStorage.setItem('pending_company_form', JSON.stringify(formData));
            localStorage.setItem('pending_company_submission', 'true');
            // Nota: tempLogoFile não pode ser guardado no localStorage facilmente como objeto File.
            // O utilizador terá de re-selecionar ou podemos converter para Base64 se for pequeno,
            // mas por agora vamos focar no fluxo principal.
            router.push(`/registar?next=/usuario/registo-empresa`);
            return;
        }

        setLoading(true);
        try {
            let finalLogoUrl = formData.logoUrl;

            // Se houver um logo pendente de upload (selecionado como guest)
            if (tempLogoFile && !formData.logoUrl.startsWith('http')) {
                setUploading(true);
                const compressedBlob = await compressImage(tempLogoFile);
                const filePath = `company-logos/${user.id}-${Math.random()}.webp`;

                const { error: uploadError } = await supabase.storage
                    .from('public-assets')
                    .upload(filePath, compressedBlob);

                if (uploadError) throw uploadError;

                const { data: { publicUrl } } = supabase.storage
                    .from('public-assets')
                    .getPublicUrl(filePath);

                finalLogoUrl = publicUrl;
                setTempLogoFile(null);
            }

            const { error } = await supabase.from('companies').upsert({
                user_id: user.id,
                name: formData.companyName,
                activity: formData.activity,
                email: formData.email,
                contact: formData.contact,
                logo_url: finalLogoUrl,
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

            alert("Empresa registada com sucesso!");
            router.push('/usuario/dashboard/minha-conta');

        } catch (error: any) {
            console.error("Submit error:", error);
            alert(`Erro ao salvar dados: ${error.message}`);
        } finally {
            setLoading(false);
            setUploading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">

            {/* Sidebar Visual (Esquerda) */}
            <div className="w-full md:w-1/3 bg-[#0f172a] text-white p-8 md:p-12 flex flex-col justify-between relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1625246333195-09d9b63bd70b?q=80&w=1000&auto=format&fit=crop')] bg-cover bg-center opacity-10"></div>
                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-10">
                        <Building2 className="w-8 h-8 text-emerald-500" />
                        <span className="font-black text-xl tracking-tight">BASE AGRO</span>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-extrabold mb-4 leading-tight">
                        Cadastre sua Empresa
                    </h1>
                    <p className="text-slate-400 text-lg leading-relaxed">
                        Junte-se à maior rede do agronegócio em Moçambique. Amplie sua visibilidade e encontre novos parceiros.
                    </p>
                </div>

                {/* Steps Indicator (Vertical on Desktop) */}
                <div className="relative z-10 space-y-6 mt-12 hidden md:block">
                    {STEPS.map((step) => {
                        const Icon = step.icon;
                        const isActive = currentStep === step.id;
                        const isCompleted = currentStep > step.id;

                        return (
                            <div key={step.id} className={`flex items-center gap-4 transition-all duration-300 ${isActive ? 'translate-x-2' : 'opacity-60'}`}>
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${isActive || isCompleted ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-slate-600 text-slate-400'}`}>
                                    {isCompleted ? <CheckCircle2 className="w-6 h-6" /> : <span className="font-bold">{step.id}</span>}
                                </div>
                                <div>
                                    <p className={`font-bold ${isActive ? 'text-white' : 'text-slate-400'}`}>{step.title}</p>
                                    <p className="text-xs text-slate-500">{step.description}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Conteúdo do Formulário (Direita) */}
            <div className="flex-1 p-6 md:p-12 lg:p-20 overflow-y-auto">
                <div className="max-w-2xl mx-auto">

                    {/* Header Mobile Steps */}
                    <div className="md:hidden flex items-center justify-between mb-8 pb-4 border-b border-slate-200">
                        <span className="text-sm font-bold text-slate-500">Passo {currentStep} de 6</span>
                        <div className="flex gap-1">
                            {[1, 2, 3, 4, 5, 6].map(i => (
                                <div key={i} className={`h-1.5 w-6 rounded-full ${i <= currentStep ? 'bg-emerald-600' : 'bg-slate-200'}`} />
                            ))}
                        </div>
                    </div>

                    {/* Step Content */}
                    <div className="min-h-[400px]">

                        {/* PASSO 1: IDENTIDADE */}
                        {currentStep === 1 && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                                <h2 className="text-2xl font-bold text-slate-800 mb-6">Identidade da Empresa</h2>

                                <div className="space-y-4">
                                    <div className="flex items-center gap-6 mb-2">
                                        <div
                                            onClick={() => fileInputRef.current?.click()}
                                            className="w-24 h-24 rounded-lg bg-slate-100 border-2 border-dashed border-slate-300 flex items-center justify-center cursor-pointer hover:border-emerald-500 hover:bg-emerald-50 transition-colors overflow-hidden relative"
                                        >
                                            {formData.logoUrl ? (
                                                // eslint-disable-next-line @next/next/no-img-element
                                                <img src={formData.logoUrl} alt="Logo" className="w-full h-full object-cover" />
                                            ) : (
                                                <Upload className="w-8 h-8 text-slate-400" />
                                            )}
                                            
                                        </div>
                                        <div className="flex-1">
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={() => fileInputRef.current?.click()}
                                                disabled={uploading}
                                                className="text-xs font-bold"
                                            >
                                                Escolher Logo da Empresa
                                            </Button>
                                            <p className="text-[10px] text-slate-400 mt-2 font-medium">Recomendado: 500x500px, JPG ou PNG.</p>
                                            <input ref={fileInputRef} type="file" className="hidden" accept="image/*" onChange={handleLogoUpload} />
                                        </div>
                                    </div>

                                    <Input
                                        name="companyName"
                                        value={formData.companyName}
                                        onChange={handleInputChange}
                                        placeholder="NOME DA EMPRESA: Ex: Agro Pecuária do Norte, Lda."
                                        className="h-12 border-slate-200 p-[10px] text-sm font-sans font-semibold text-slate-600 bg-slate-50"
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <Input
                                        name="activity"
                                        value={formData.activity}
                                        onChange={handleInputChange}
                                        placeholder="ACTIVIDADE PRINCIPAL: Ex: Produção de Milho"
                                        className="h-12 border-slate-200 p-[10px] text-sm font-sans font-semibold text-slate-600 bg-slate-50"
                                    />
                                    <Input
                                        name="contact"
                                        value={formData.contact}
                                        onChange={handleInputChange}
                                        placeholder="TELEFONE / CONTACTO: +258 ..."
                                        className="h-12 border-slate-200 p-[10px] text-sm font-sans font-semibold text-slate-600 bg-slate-50"
                                    />
                                </div>

                                <Input
                                    name="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    placeholder="E-MAIL CORPORATIVO: empresa@exemplo.com"
                                    className="h-12 border-slate-200 p-[10px] text-sm font-sans font-semibold text-slate-600 bg-slate-50"
                                />

                                <div className="flex items-center gap-3 pt-2">
                                    <input
                                        type="checkbox"
                                        id="newsletter"
                                        checked={formData.newsletter}
                                        onChange={(e) => setFormData(p => ({ ...p, newsletter: e.target.checked }))}
                                        className="w-5 h-5 accent-emerald-600 rounded"
                                    />
                                    <label htmlFor="newsletter" className="text-xs font-bold text-slate-600 cursor-pointer">
                                        Subscrever à nossa Newsletter para actualizações do sector
                                    </label>
                                </div>
                            </div>
                        )}

                        {/* PASSO 2: PLANO DE ASSINATURA */}
                        {currentStep === 2 && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                                <h2 className="text-2xl font-bold text-slate-800 mb-2">Escolha seu Plano</h2>
                                <p className="text-slate-500 text-sm mb-6">Selecione o nível de visibilidade que sua empresa deseja ter.</p>

                                <div className="grid grid-cols-1 gap-[20px]">
                                    {/* Gratuito */}
                                    <div
                                        onClick={() => setFormData(p => ({ ...p, plan: 'Gratuito' }))}
                                        className={`p-6 rounded-[15px] border-2 transition-all cursor-pointer relative overflow-hidden ${formData.plan === 'Gratuito' ? 'border-emerald-500 bg-emerald-50/30 shadow-md' : 'border-slate-100 hover:border-slate-200 bg-white'}`}
                                    >
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h3 className="font-black text-slate-800 text-lg">Gratuito</h3>
                                                <p className="text-xs text-slate-500 mb-4">Essencial para começar</p>
                                                <ul className="space-y-2">
                                                    <li className="flex items-center gap-2 text-xs font-medium text-slate-600">
                                                        <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Visualização de vagas básicas
                                                    </li>
                                                    <li className="flex items-center gap-2 text-xs font-medium text-slate-600">
                                                        <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Perfil de usuário simples
                                                    </li>
                                                    <li className="flex items-center gap-2 text-xs font-medium text-slate-600">
                                                        <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Suporte via e-mail
                                                    </li>
                                                    <li className="flex items-center gap-2 text-xs font-medium text-slate-300 line-through">
                                                        <CheckCircle2 className="w-4 h-4 text-slate-200" /> Cadastro de produtos
                                                    </li>
                                                </ul>
                                            </div>
                                            <div className="text-right">
                                                <span className="text-2xl font-black text-slate-800">Grátis</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Profissional */}
                                    <div
                                        onClick={() => setFormData(p => ({ ...p, plan: 'Premium' }))}
                                        className={`p-6 rounded-[15px] border-2 transition-all cursor-pointer relative overflow-hidden ${formData.plan === 'Premium' ? 'border-orange-500 bg-orange-50/30 shadow-md' : 'border-slate-100 hover:border-slate-200 bg-white'}`}
                                    >
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h3 className="font-black text-slate-800 text-lg flex items-center gap-2">
                                                    Premium <span className="text-[10px] bg-orange-500 text-white px-2 py-0.5 rounded-full uppercase">Pequenas Empresas</span>
                                                </h3>
                                                <p className="text-xs text-slate-500 mb-4">Crescimento e visibilidade</p>
                                                <ul className="space-y-1.5 grid grid-cols-1 md:grid-cols-2 gap-x-4">
                                                    <li className="flex items-center gap-2 text-xs font-medium text-slate-600">
                                                        <CheckCircle2 className="w-4 h-4 text-orange-500" /> Acesso a cotações
                                                    </li>
                                                    <li className="flex items-center gap-2 text-xs font-medium text-slate-600">
                                                        <CheckCircle2 className="w-4 h-4 text-orange-500" /> Vagas ilimitadas
                                                    </li>
                                                    <li className="flex items-center gap-2 text-xs font-medium text-slate-600">
                                                        <CheckCircle2 className="w-4 h-4 text-orange-500" /> Perfil verificado
                                                    </li>
                                                    <li className="flex items-center gap-2 text-xs font-medium text-slate-600">
                                                        <CheckCircle2 className="w-4 h-4 text-orange-500" /> Produtos ilimitados
                                                    </li>
                                                    <li className="flex items-center gap-2 text-xs font-medium text-slate-600">
                                                        <CheckCircle2 className="w-4 h-4 text-orange-500" /> 1 Anúncio/Mês
                                                    </li>
                                                </ul>
                                            </div>
                                            <div className="text-right">
                                                <span className="text-2xl font-black text-slate-800">2 500 MT</span>
                                                <p className="text-[10px] text-slate-500">por mês</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Empresarial */}
                                    <div
                                        onClick={() => setFormData(p => ({ ...p, plan: 'Business Vendedor' }))}
                                        className={`p-6 rounded-[15px] border-2 transition-all cursor-pointer relative overflow-hidden ${formData.plan === 'Business Vendedor' ? 'border-blue-600 bg-blue-50/30 shadow-md' : 'border-slate-100 hover:border-slate-200 bg-white'}`}
                                    >
                                        <div className="flex justify-between items-start relative z-10">
                                            <div>
                                                <h3 className="font-black text-slate-800 text-lg flex items-center gap-2">
                                                    Business Vendedor <Crown className="w-4 h-4 text-blue-600" />
                                                </h3>
                                                <p className="text-xs text-slate-500 mb-4">Dados estratégicos e API</p>
                                                <ul className="space-y-1.5 grid grid-cols-1 md:grid-cols-2 gap-x-4">
                                                    <li className="flex items-center gap-2 text-xs font-medium text-slate-600">
                                                        <CheckCircle2 className="w-4 h-4 text-blue-600" /> Tudo do Premium
                                                    </li>
                                                    <li className="flex items-center gap-2 text-xs font-medium text-slate-600">
                                                        <CheckCircle2 className="w-4 h-4 text-blue-600" /> Acesso API de dados
                                                    </li>
                                                    <li className="flex items-center gap-2 text-xs font-medium text-slate-600">
                                                        <CheckCircle2 className="w-4 h-4 text-blue-600" /> Relatórios PDF/Excel
                                                    </li>
                                                    <li className="flex items-center gap-2 text-xs font-medium text-slate-600">
                                                        <CheckCircle2 className="w-4 h-4 text-blue-600" /> Consultoria Mensal
                                                    </li>
                                                    <li className="flex items-center gap-2 text-xs font-medium text-slate-600">
                                                        <CheckCircle2 className="w-4 h-4 text-blue-600" /> Destaque máximo
                                                    </li>
                                                </ul>
                                            </div>
                                            <div className="text-right">
                                                <span className="text-2xl font-black text-slate-800">5 000 MT</span>
                                                <p className="text-[10px] text-slate-500">por mês</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Parceiro */}
                                    <div
                                        onClick={() => setFormData(p => ({ ...p, plan: 'Parceiro' }))}
                                        className={`p-6 rounded-[15px] border-2 transition-all cursor-pointer relative overflow-hidden ${formData.plan === 'Parceiro' ? 'border-emerald-600 bg-emerald-950 text-white shadow-md' : 'border-slate-100 hover:border-slate-200 bg-white'}`}
                                    >
                                        <div className="flex justify-between items-center">
                                            <div className="flex items-center gap-4">
                                                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${formData.plan === 'parceiro' ? 'bg-emerald-500' : 'bg-emerald-100'}`}>
                                                    <Briefcase className={`w-6 h-6 ${formData.plan === 'parceiro' ? 'text-white' : 'text-emerald-600'}`} />
                                                </div>
                                                <div>
                                                    <h3 className={`font-black text-lg ${formData.plan === 'parceiro' ? 'text-white' : 'text-slate-800'}`}>Plano Parceiro</h3>
                                                    <p className={`text-xs ${formData.plan === 'parceiro' ? 'text-emerald-200' : 'text-slate-500'}`}>Liberdade total e benefícios exclusivos</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <span className={`text-sm font-bold px-3 py-1 rounded-full ${formData.plan === 'parceiro' ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-600'}`}>Sob Consulta</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Partner Additional Fields */}
                                {formData.plan === 'Parceiro' && (
                                    <div className="bg-emerald-50 border border-emerald-200 rounded-[15px] p-6 mt-6 animate-in fade-in slide-in-from-top-4">
                                        <h3 className="font-bold text-emerald-800 mb-4">Dados do Parceiro</h3>
                                        <div className="grid grid-cols-1 gap-4">
                                            <Input
                                                name="website"
                                                value={formData.website}
                                                onChange={handleInputChange}
                                                placeholder="Website Oficial / Link"
                                                className="bg-white border-emerald-200 focus:ring-emerald-500"
                                            />
                                            <Input
                                                name="representative"
                                                value={formData.representative}
                                                onChange={handleInputChange}
                                                placeholder="Nome do Representante"
                                                className="bg-white border-emerald-200 focus:ring-emerald-500"
                                            />
                                            <Input
                                                name="nuit"
                                                value={formData.nuit}
                                                onChange={handleInputChange}
                                                placeholder="NUIT da Empresa"
                                                className="bg-white border-emerald-200 focus:ring-emerald-500"
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* PASSO 3: LOCALIZAÇÃO */}
                        {currentStep === 3 && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                                <h2 className="text-2xl font-bold text-slate-800 mb-6">Onde sua empresa está?</h2>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-[20px]">
                                    <Input
                                        name="province"
                                        value={formData.province}
                                        onChange={handleInputChange}
                                        placeholder="PROVÍNCIA: Ex: Maputo, Nampula..."
                                        className="h-12 border-slate-200 p-[10px] text-sm font-sans font-semibold text-slate-600 bg-slate-50"
                                    />
                                    <Input
                                        name="district"
                                        value={formData.district}
                                        onChange={handleInputChange}
                                        placeholder="DISTRITO: Digite o distrito"
                                        className="h-12 border-slate-200 p-[10px] text-sm font-sans font-semibold text-slate-600 bg-slate-50"
                                    />
                                    <div className="col-span-1 md:col-span-2">
                                        <Input
                                            name="address"
                                            value={formData.address}
                                            onChange={handleInputChange}
                                            placeholder="ENDEREÇO COMPLETO: Rua, Bairro, Número..."
                                            className="h-12 border-slate-200 p-[10px] text-sm font-sans font-semibold text-slate-600 bg-slate-50"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* PASSO 4: ATIVIDADE */}
                        {currentStep === 4 && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                                <h2 className="text-2xl font-bold text-slate-800 mb-6">Detalhes do Negócio</h2>

                                <div className="space-y-4">
                                    <Input
                                        name="sector"
                                        value={formData.sector}
                                        onChange={handleInputChange}
                                        placeholder="SETOR DE ATIVIDADE: Ex: Produção Agrícola, Pecuária..."
                                        className="h-12 border-slate-200 p-[10px] text-sm font-sans font-semibold text-slate-600 bg-slate-50"
                                    />

                                    <Textarea
                                        name="description"
                                        value={formData.description}
                                        onInput={(e: any) => autoResize(e)}
                                        onChange={handleInputChange}
                                        placeholder="DESCRIÇÃO DA EMPRESA: Breve resumo sobre o que sua empresa faz..."
                                        className="min-h-[120px] border-slate-200 p-[10px] text-sm font-sans font-semibold text-slate-600 bg-slate-50 leading-relaxed overflow-hidden"
                                    />

                                    <Input
                                        name="tags"
                                        value={formData.tags}
                                        onChange={handleInputChange}
                                        placeholder="TAGS (PALAVRAS-CHAVE): Ex: Milho, Soja, Adubos..."
                                        className="h-12 border-slate-200 p-[10px] text-sm font-sans font-semibold text-slate-600 bg-slate-50"
                                    />
                                </div>
                            </div>
                        )}

                        {/* PASSO 5: PRODUTOS & DESTAQUE */}
                        {currentStep === 5 && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                                {formData.plan === 'Gratuito' ? (
                                    <div className="space-y-6">
                                        <div className="bg-white border border-slate-200 p-8 rounded-[15px] shadow-sm text-center">
                                            <div className="max-w-md mx-auto">
                                                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                                    <Save className="w-8 h-8 text-slate-400" />
                                                </div>
                                                <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">Catálogo Indisponível</h2>
                                                <p className="text-slate-500 text-sm mt-2">
                                                    A adição de produtos não está disponível no plano <span className="font-bold text-emerald-600">Gratuito</span>.
                                                    Faça o Upgrade para o plano <span className="font-bold text-orange-500">Premium</span> para gerir o seu catálogo.
                                                </p>
                                            </div>
                                        </div>

                                        {/* OPÇÃO DE DESTAQUE */}
                                        <div
                                            onClick={() => setFormData(p => ({ ...p, highlightCompany: !p.highlightCompany }))}
                                            className={`p-6 rounded-[15px] border-2 transition-all cursor-pointer relative overflow-hidden ${formData.highlightCompany ? 'border-orange-500 bg-orange-50/30' : 'border-slate-200 bg-white hover:border-slate-300'}`}
                                        >
                                            <div className="flex justify-between items-center relative z-10">
                                                <div className="flex items-center gap-4">
                                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${formData.highlightCompany ? 'bg-orange-500 text-white' : 'bg-slate-100 text-slate-400'}`}>
                                                        <Crown className="w-6 h-6" />
                                                    </div>
                                                    <div className="text-left">
                                                        <h3 className="font-black text-slate-800 uppercase tracking-tight">Destacar Minha Empresa</h3>
                                                        <p className="text-xs text-slate-500">Apareça no topo das pesquisas e na página inicial.</p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <span className="text-xl font-black text-slate-800">1 500 Mt</span>
                                                    <div className={`w-6 h-6 rounded-full border-2 mt-1 mx-auto flex items-center justify-center ${formData.highlightCompany ? 'border-orange-500 bg-orange-500' : 'border-slate-300'}`}>
                                                        {formData.highlightCompany && <CheckCircle2 className="w-4 h-4 text-white" />}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <div className="flex justify-between items-center">
                                            <h2 className="text-2xl font-bold text-slate-800">Seu Catálogo</h2>
                                            <Button
                                                onClick={() => setFormData(p => ({ ...p, products: [...p.products, { name: "", description: "" }] }))}
                                                className="bg-emerald-600 hover:bg-emerald-700 text-white"
                                            >
                                                + Adicionar Produto
                                            </Button>
                                        </div>

                                        <div className="space-y-[20px]">
                                            {formData.products.length === 0 ? (
                                                <div className="text-center py-12 bg-slate-50 rounded-[15px] border-2 border-dashed border-slate-200">
                                                    <Save className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                                                    <p className="text-slate-500">Ainda não adicionou produtos ao seu catálogo.</p>
                                                </div>
                                            ) : (
                                                formData.products.map((prod, idx) => (
                                                    <div key={idx} className="bg-white p-6 rounded-[15px] border border-slate-200 shadow-sm space-y-4">
                                                        <div className="flex justify-between">
                                                            <span className="text-xs font-black uppercase text-slate-400">Produto #{idx + 1}</span>
                                                            <button onClick={() => setFormData(p => ({ ...p, products: p.products.filter((_, i) => i !== idx) }))} className="text-red-500 hover:text-red-700 text-xs font-bold">Remover</button>
                                                        </div>
                                                        <Input
                                                            placeholder="NOME DO PRODUTO: Ex: Milho Branco"
                                                            value={prod.name}
                                                            onChange={e => {
                                                                const newProds = [...formData.products];
                                                                newProds[idx].name = e.target.value;
                                                                setFormData(p => ({ ...p, products: newProds }));
                                                            }}
                                                            className="h-12 border-slate-200 p-[10px] text-sm font-sans font-semibold text-slate-600 bg-slate-50"
                                                        />
                                                        <Textarea
                                                            placeholder="DESCRIÇÃO (Opcional)"
                                                            value={prod.description}
                                                            onChange={e => {
                                                                const newProds = [...formData.products];
                                                                newProds[idx].description = e.target.value;
                                                                setFormData(p => ({ ...p, products: newProds }));
                                                            }}
                                                            className="min-h-[100px] border-slate-200 bg-slate-50 font-semibold text-slate-600"
                                                        />
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </>
                                )}
                            </div>
                        )}

                        {/* PASSO 6: PAGAMENTO */}
                        {currentStep === 6 && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                                <h2 className="text-2xl font-bold text-slate-800 mb-6">Finalizar e Pagar</h2>
                                <div className="bg-orange-50 p-6 rounded-[15px] border border-orange-100 flex items-center justify-between">
                                    <div>
                                        <p className="text-[10px] font-black uppercase text-orange-600 tracking-widest">Plano Seleccionado</p>
                                        <h3 className="text-xl font-black text-slate-800 uppercase">{formData.plan}</h3>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] font-black uppercase text-orange-600 tracking-widest">Total a Pagar</p>
                                        <h3 className="text-2xl font-black text-slate-800">
                                            {(() => {
                                                const planLower = formData.plan.toLowerCase();
                                                const planCost = (planLower === 'gratuito' || planLower === 'free') ? 0 :
                                                    planLower === 'premium' ? 2500 :
                                                        planLower === 'básico' ? 1500 : 5000;
                                                const highlightCost = formData.highlightCompany ? 1500 : 0;
                                                return `${(planCost + highlightCost).toLocaleString()} MT`;
                                            })()}
                                        </h3>
                                    </div>
                                </div>

                                {(() => {
                                    const planLower = formData.plan.toLowerCase();
                                    const planCost = (planLower === 'gratuito' || planLower === 'free') ? 0 :
                                        planLower === 'premium' ? 2500 :
                                            planLower === 'básico' ? 1000 : 5000;
                                    const highlightCost = formData.highlightCompany ? 1500 : 0;
                                    const totalCost = planCost + highlightCost;

                                    if (totalCost === 0) {
                                        return (
                                            <div className="bg-emerald-50/50 p-8 rounded-[15px] border border-emerald-100 text-center animate-in zoom-in-95 duration-300">
                                                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                                    <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                                                </div>
                                                <h3 className="text-xl font-black text-slate-800 uppercase">Tudo Pronto!</h3>
                                                <p className="text-slate-500 text-sm mt-2 max-w-sm mx-auto">
                                                    O seu registo no plano Gratuito não tem custos. Clique em **Finalizar Registo** para concluir.
                                                </p>
                                            </div>
                                        );
                                    }

                                    return (
                                        <div className="space-y-6">
                                            <p className="text-sm font-bold text-slate-700">Escolha o Método de Pagamento</p>
                                            <div className="grid grid-cols-3 gap-[20px]">
                                                {[
                                                    { id: 'mpesa', label: 'MPESA', color: 'emerald' },
                                                    { id: 'emola', label: 'EMOLA', color: 'blue' },
                                                    { id: 'banco', label: 'BANCO', color: 'slate' }
                                                ].map(m => (
                                                    <button
                                                        key={m.id}
                                                        onClick={() => setFormData(p => ({ ...p, paymentMethod: m.id }))}
                                                        className={`py-4 rounded-[15px] border flex flex-col items-center gap-2 transition-all ${formData.paymentMethod === m.id ? 'border-emerald-600 bg-emerald-50 text-emerald-700 shadow-sm' : 'border-slate-100 bg-white text-slate-400 hover:border-slate-200'}`}
                                                    >
                                                        <span className="font-black uppercase text-[10px] tracking-widest">{m.label}</span>
                                                    </button>
                                                ))}
                                            </div>

                                            {formData.paymentMethod && (
                                                <div className="pt-4 space-y-4 animate-in slide-in-from-top-2 duration-200">
                                                    {formData.paymentMethod !== 'banco' && (
                                                        <div className="space-y-1">
                                                            <Input
                                                                placeholder={formData.paymentMethod === 'mpesa' ? "84 / 85 xxx xxxx" : "86 / 87 xxx xxxx"}
                                                                value={formData.paymentPhone}
                                                                onChange={e => setFormData(p => ({ ...p, paymentPhone: e.target.value }))}
                                                                className="h-12 border-slate-200 font-mono text-center text-lg"
                                                                maxLength={9}
                                                            />
                                                        </div>
                                                    )}

                                                    {formData.paymentMethod === 'banco' && (
                                                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-2 text-xs font-medium text-slate-600">
                                                            <p className="font-bold uppercase text-slate-400 text-[9px]">Dados para transferência:</p>
                                                            <div className="flex justify-between"><span>Banco:</span> <span className="font-bold">Millennium BIM</span></div>
                                                            <div className="flex justify-between"><span>Conta:</span> <span className="font-bold">123456789</span></div>
                                                            <div className="flex justify-between"><span>NIB:</span> <span className="font-bold">0001 0000 1234 5678 9012 3</span></div>
                                                        </div>
                                                    )}

                                                    <Button
                                                        onClick={async () => {
                                                            if (formData.paymentMethod !== 'banco') {
                                                                if (!formData.paymentPhone || formData.paymentPhone.length < 9) {
                                                                    alert("Por favor, insira um número válido.");
                                                                    return;
                                                                }
                                                                setLoading(true);
                                                                // Simulação de pagamento
                                                                setTimeout(() => {
                                                                    setLoading(false);
                                                                    setFormData(p => ({ ...p, paymentConfirmed: true }));
                                                                    alert("Pagamento confirmado com sucesso!");
                                                                }, 2000);
                                                            } else {
                                                                alert("Por favor, anexe o comprovativo após finalizar o registo.");
                                                                setFormData(p => ({ ...p, paymentConfirmed: true }));
                                                            }
                                                        }}
                                                        disabled={loading || formData.paymentConfirmed}
                                                        className={`w-full h-12 bg-emerald-500 hover:bg-emerald-600 text-white font-black uppercase tracking-widest rounded-xl transition-all ${formData.paymentConfirmed ? 'bg-slate-400' : ''}`}
                                                    >
                                                        
                                                        {formData.paymentConfirmed ? "PAGAMENTO CONFIRMADO" : `CONFIRMAR PAGAMENTO ${formData.paymentMethod.toUpperCase()}`}
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })()}
                            </div>
                        )}
                    </div>

                    {/* Footer Actions */}
                    <div className="pt-8 border-t border-slate-100 flex justify-between mt-8">
                        {currentStep > 1 ? (
                            <Button
                                variant="outline"
                                onClick={handleBack}
                                className="h-12 px-6 text-slate-600 font-bold border-slate-200 bg-white shadow-sm hover:bg-slate-50"
                                style={{ borderRadius: '12px' }}
                            >
                                <ArrowLeft className="w-4 h-4 mr-2" /> Voltar
                            </Button>
                        ) : (
                            <div />
                        )}

                        {currentStep < 6 ? (
                            <Button
                                onClick={handleNext}
                                className="h-12 px-8 bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                                style={{ borderRadius: '12px' }}
                            >
                                Próximo Passo <ArrowRight className="w-4 h-4 ml-2" />
                            </Button>
                        ) : (
                            <Button
                                onClick={handleSubmit}
                                disabled={loading || (() => {
                                    const planLower = formData.plan.toLowerCase();
                                    const planCost = (planLower === 'gratuito' || planLower === 'free') ? 0 :
                                        planLower === 'premium' ? 2500 :
                                            planLower === 'básico' ? 1000 : 5000;
                                    const totalCost = planCost + (formData.highlightCompany ? 1500 : 0);
                                    return totalCost > 0 && !formData.paymentConfirmed;
                                })()}
                                className="h-12 px-10 bg-orange-500 hover:bg-orange-600 text-white font-black uppercase tracking-widest shadow-lg shadow-orange-500/20"
                                style={{ borderRadius: '12px' }}
                            >
                                {<Save className="w-4 h-4 mr-2" />}
                                Finalizar Cadastro
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </div >
    );
}
