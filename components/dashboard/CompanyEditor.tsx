"use client";

import { useState, useEffect } from "react";
import { Building2, ArrowRight, Lock, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import { User } from "@supabase/supabase-js";
import { MOZ_DATA, SECTORS, VALUE_CHAINS } from "@/lib/agro-data";
import { usePlanPermissions } from "@/hooks/usePlanPermissions";
import { UpgradeModal, LockedFieldOverlay, PlanFieldWrapper } from "@/components/UpgradeModal";
import { getRequiredPlan, type PlanType } from "@/lib/plan-fields";
import { Spinner } from "@/components/ui/spinner";

interface CompanyEditorProps {
    user: User | null;
}

export function CompanyEditor({ user }: CompanyEditorProps) {
    const supabase = createClient();
    const [isRegistered, setIsRegistered] = useState(true);
    // const [user, setUser] = useState<User | null>(null); // Received from props
    const [isEditingCompany, setIsEditingCompany] = useState(false);
    const [showSuccessPopup, setShowSuccessPopup] = useState(false);
    const [isUploadingLogo, setIsUploadingLogo] = useState(false);
    const [logoError, setLogoError] = useState<string | null>(null);
    const [isUploadingBanner, setIsUploadingBanner] = useState(false);
    const [bannerError, setBannerError] = useState<string | null>(null);
    const [companyId, setCompanyId] = useState<string | null>(null);
    const [products, setProducts] = useState<any[]>([]);

    // Plan permissions
    const { canEdit, getRequiredPlanForField, plan, planDisplayName, loading: planLoading } = usePlanPermissions();
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);
    const [lockedFieldLabel, setLockedFieldLabel] = useState("");
    const [lockedFieldPlan, setLockedFieldPlan] = useState<PlanType>("Premium");

    // Handle click on locked field
    const handleLockedFieldClick = (fieldName: string, label: string) => {
        const required = getRequiredPlanForField(fieldName);
        if (required) {
            setLockedFieldLabel(label);
            setLockedFieldPlan(required);
            setShowUpgradeModal(true);
        }
    };

    const [companyForm, setCompanyForm] = useState({
        name: "",
        nuit: "",
        contact: "",
        email: "",
        province: "",
        district: "",
        category: "",
        description: "",
        address: "",
        logo_url: "",
        banner_url: "",
        value_chain: "",
        slug: "",
        mission: "",
        vision: "",
        values: "",
        services: [] as string[]
    });

    // Auto-resize textarea function
    const autoResize = (target: HTMLTextAreaElement) => {
        target.style.height = 'auto';
        target.style.height = `${target.scrollHeight}px`;
    };

    useEffect(() => {
        const fetchCompany = async () => {
            if (!user) return;
            const { data, error } = await supabase
                .from('companies')
                .select('*')
                .eq('user_id', user.id)
                .single();

            if (data) {
                setIsRegistered(true);
                setCompanyId(data.id);
                setCompanyForm({
                    name: data.name || "",
                    nuit: data.nuit || "",
                    contact: data.contact || "",
                    email: data.email || "",
                    province: data.province || "",
                    district: data.district || "",
                    category: data.category || "",
                    description: data.description || "",
                    address: data.address || "",
                    logo_url: data.logo_url || "",
                    banner_url: data.banner_url || "",
                    value_chain: data.value_chain || "",
                    slug: data.slug || "",
                    mission: data.mission || "",
                    vision: data.vision || "",
                    values: data.values || "",
                    services: Array.isArray(data.services) ? data.services : []
                });

                // Fetch Products
                const { data: productsData } = await supabase
                    .from('products')
                    .select('*')
                    .eq('company_id', data.id)
                    .order('created_at', { ascending: false });

                if (productsData) setProducts(productsData);

                // Initial resize after a short delay to ensure DOM is ready
                setTimeout(() => {
                    const textareas = document.querySelectorAll('textarea');
                    textareas.forEach(ta => {
                        if (ta.classList.contains('overflow-hidden')) {
                            autoResize(ta as HTMLTextAreaElement);
                        }
                    });
                }, 100);
            } else {
                // No company found by user_id, check for pending registration from simplified form
                const pendingId = localStorage.getItem('pending_company_registration_id');
                if (pendingId) {
                    const { data: pendingCompany } = await supabase
                        .from('companies')
                        .select('*')
                        .eq('id', pendingId)
                        .is('user_id', null)
                        .single();

                    if (pendingCompany) {
                        // Link the company to the logged in user
                        const { error: linkError } = await supabase
                            .from('companies')
                            .update({ user_id: user.id })
                            .eq('id', pendingId);

                        if (!linkError) {
                            localStorage.removeItem('pending_company_registration_id');
                            setIsRegistered(true);
                            setCompanyId(pendingCompany.id);
                            setCompanyForm({
                                name: pendingCompany.name || "",
                                nuit: pendingCompany.nuit || "",
                                contact: pendingCompany.contact || "",
                                email: pendingCompany.email || "",
                                province: pendingCompany.province || "",
                                district: pendingCompany.district || "",
                                category: pendingCompany.category || "",
                                description: pendingCompany.description || "",
                                address: pendingCompany.address || "",
                                logo_url: pendingCompany.logo_url || "",
                                banner_url: pendingCompany.banner_url || "",
                                value_chain: pendingCompany.value_chain || "",
                                slug: pendingCompany.slug || "",
                                mission: pendingCompany.mission || "",
                                vision: pendingCompany.vision || "",
                                values: pendingCompany.values || "",
                                services: Array.isArray(pendingCompany.services) ? pendingCompany.services : []
                            });
                            return;
                        }
                    }
                    localStorage.removeItem('pending_company_registration_id');
                }
                setIsRegistered(false);
            }
        };
        fetchCompany();
    }, [user]);

    const handleCompanyLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;
        const file = e.target.files[0];

        const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
        if (!validTypes.includes(file.type)) {
            setLogoError("Formato inválido. Use JPG, PNG ou WebP.");
            return;
        }

        if (file.size > 1 * 1024 * 1024) {
            setLogoError("O arquivo é muito grande. Máximo 1MB.");
            return;
        }

        setLogoError(null);
        setIsUploadingLogo(true);
        const fileName = `logos/${user?.id}-${Date.now()}.jpg`;

        const { error: uploadError } = await supabase.storage
            .from('public-assets')
            .upload(fileName, file);

        if (!uploadError) {
            const { data: { publicUrl } } = supabase.storage
                .from('public-assets')
                .getPublicUrl(fileName);
            setCompanyForm(prev => ({ ...prev, logo_url: publicUrl }));
        } else {
            setLogoError(`Erro no upload: ${uploadError.message}`);
        }
        setIsUploadingLogo(false);
    };

    const handleCompanyBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;
        const file = e.target.files[0];

        const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
        if (!validTypes.includes(file.type)) {
            setBannerError("Formato inválido. Use JPG, PNG ou WebP.");
            return;
        }

        if (file.size > 1 * 1024 * 1024) {
            setBannerError("O arquivo é muito grande. Máximo 1MB.");
            return;
        }

        setBannerError(null);
        setIsUploadingBanner(true);
        const fileName = `banners/${user?.id}-${Date.now()}.jpg`;

        const { error: uploadError } = await supabase.storage
            .from('public-assets')
            .upload(fileName, file);

        if (!uploadError) {
            const { data: { publicUrl } } = supabase.storage
                .from('public-assets')
                .getPublicUrl(fileName);
            setCompanyForm(prev => ({ ...prev, banner_url: publicUrl }));
        } else {
            setBannerError(`Erro no upload: ${uploadError.message}`);
        }
        setIsUploadingBanner(false);
    };

    const handleUpdateCompany = async () => {
        if (!user || !companyId) return;

        const { error } = await supabase
            .from('companies')
            .update({
                name: companyForm.name,
                nuit: companyForm.nuit,
                contact: companyForm.contact,
                email: companyForm.email,
                province: companyForm.province,
                district: companyForm.district,
                category: companyForm.category,
                description: companyForm.description,
                address: companyForm.address,
                logo_url: companyForm.logo_url,
                banner_url: companyForm.banner_url,
                value_chain: companyForm.value_chain,
                mission: companyForm.mission,
                vision: companyForm.vision,
                values: companyForm.values,
                services: companyForm.services,
                updated_at: new Date().toISOString()
            })
            .eq('id', companyId);

        if (error) {
            alert("Erro ao atualizar empresa: " + error.message);
        } else {
            setShowSuccessPopup(true);
            setIsEditingCompany(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Success Popup */}
            {showSuccessPopup && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-300">
                    <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-sm w-full text-center relative animate-in zoom-in-95 duration-300">
                        <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
                            </svg>
                        </div>
                        <h3 className="text-xl font-bold text-slate-800 mb-2">Sucesso!</h3>
                        <p className="text-slate-500 mb-8">Os dados da sua empresa foram atualizados com sucesso.</p>
                        <Button
                            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-12 rounded-lg"
                            onClick={() => setShowSuccessPopup(false)}
                        >
                            Continuar
                        </Button>
                    </div>
                </div>
            )}

            <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    {/* <h2 className="text-3xl font-[900] tracking-tight text-[#3a3f47]">Minha Empresa</h2> */}
                    {/* <p className="text-slate-500">Gerencie os dados e o perfil público da sua empresa.</p> */}
                </div>
                {isRegistered && (
                    <Link href={`/empresas/${companyForm.slug}`} target="_blank">
                        <Button variant="outline" className="border-emerald-600 text-emerald-600 hover:bg-emerald-50 font-bold gap-2">
                            Visualizar Empresa
                            <ArrowRight className="w-4 h-4" />
                        </Button>
                    </Link>
                )}
            </div>

            <div className="min-h-[400px]">
                {isRegistered ? (
                    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                        <div className="bg-white px-6 py-4 border-b border-slate-200 flex justify-between items-center">
                            <h3 className="font-extrabold text-[#3a3f47] flex items-center gap-2">
                                <Building2 className="w-5 h-5 text-emerald-600" />
                                PERFIL CORPORATIVO
                            </h3>
                            <div className="flex items-center gap-3">
                                {isEditingCompany ? (
                                    <>
                                        <Button variant="ghost" size="sm" onClick={() => setIsEditingCompany(false)} className="text-slate-400 hover:text-slate-600 font-bold uppercase text-[10px] tracking-widest">
                                            Cancelar
                                        </Button>
                                        <Button size="sm" onClick={handleUpdateCompany} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold uppercase text-[10px] tracking-widest px-4">
                                            SALVAR ALTERAÇÕES
                                        </Button>
                                    </>
                                ) : (
                                    <Button size="sm" variant="outline" onClick={() => setIsEditingCompany(true)} className="border-slate-200 text-slate-500 hover:text-emerald-600 hover:border-emerald-600 font-bold uppercase text-[10px] tracking-widest px-4">
                                        Editar Perfil
                                    </Button>
                                )}
                            </div>
                        </div>
                        <div className="p-6 md:p-8">
                            <div className="space-y-8">
                                {/* Top Section: Logo & Grid(Info | Banner) */}
                                <div className="flex flex-col md:flex-row gap-5 items-center">
                                    {/* Logo Section */}
                                    <div className="w-full md:w-auto flex-shrink-0 flex justify-center md:justify-start">
                                        <div className="w-40 h-40 bg-slate-100 rounded-lg border border-slate-200 flex items-center justify-center shrink-0 overflow-hidden p-[20px] relative group">
                                            {isUploadingLogo && (
                                                <div className="absolute inset-0 bg-black/10 flex items-center justify-center z-10">
                                                    <Spinner className="w-6 h-6" />
                                                </div>
                                            )}

                                            {companyForm.logo_url ? (
                                                <img src={companyForm.logo_url} alt={companyForm.name} className="w-full h-full object-cover" />
                                            ) : companyForm.name ? (
                                                <div className="w-full h-full bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-3xl">
                                                    {companyForm.name.charAt(0)}
                                                </div>
                                            ) : (
                                                <Building2 className="w-12 h-12 text-slate-300" />
                                            )}

                                            {isEditingCompany && (
                                                <>
                                                    <label htmlFor="logo-upload" className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors cursor-pointer flex items-center justify-center">
                                                        <div className="bg-white/90 p-1 rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-600"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" x2="12" y1="3" y2="15" /></svg>
                                                        </div>
                                                    </label>
                                                    <input type="file" id="logo-upload" onChange={handleCompanyLogoUpload} className="hidden" accept="image/png, image/jpeg, image/jpg, image/webp" />
                                                </>
                                            )}
                                        </div>
                                        {logoError && <p className="text-xs text-red-500 mt-2 text-center md:text-left">{logoError}</p>}
                                    </div>

                                    {/* Info & Banner Section */}
                                    <div className="flex-1 w-full grid grid-cols-1 lg:grid-cols-2 gap-5 items-center h-full">
                                        {/* Left Column: Basic Info */}
                                        <div className="space-y-3">
                                            <input
                                                className="w-full border border-slate-200 bg-slate-50 p-[10px] rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-slate-600 font-sans text-sm font-semibold disabled:opacity-75 disabled:cursor-not-allowed disabled:bg-transparent disabled:border-slate-300"
                                                value={companyForm.name}
                                                onChange={e => setCompanyForm({ ...companyForm, name: e.target.value })}
                                                disabled={!isEditingCompany}
                                                placeholder="Razão social / Nome da Empresa"
                                            />
                                            <input
                                                className="w-full border border-slate-200 bg-slate-50 p-[10px] rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-slate-600 font-sans text-sm font-semibold disabled:opacity-75 disabled:cursor-not-allowed disabled:bg-transparent disabled:border-slate-300"
                                                value={companyForm.contact}
                                                onChange={e => setCompanyForm({ ...companyForm, contact: e.target.value })}
                                                placeholder="Telefone de Contacto"
                                                disabled={!isEditingCompany}
                                            />
                                            <input
                                                className="w-full border border-slate-200 bg-slate-50 p-[10px] rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-slate-600 font-sans text-sm font-semibold disabled:opacity-75 disabled:cursor-not-allowed disabled:bg-transparent disabled:border-slate-300"
                                                value={companyForm.address}
                                                onChange={e => setCompanyForm({ ...companyForm, address: e.target.value })}
                                                disabled={!isEditingCompany}
                                                placeholder="Endereço / Avenida / Rua"
                                            />
                                        </div>

                                        {/* Right Column: Banner Upload */}
                                        <div className="flex flex-col">
                                            <div className="relative h-40 bg-slate-100 rounded-lg border-2 border-dashed border-slate-200 overflow-hidden group">
                                                {isUploadingBanner && (
                                                    <div className="absolute inset-0 bg-black/10 flex items-center justify-center z-10">
                                                        <Spinner className="w-8 h-8" />
                                                    </div>
                                                )}

                                                {companyForm.banner_url ? (
                                                    <img src={companyForm.banner_url} alt="Banner" className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
                                                        <svg className="w-8 h-8 text-slate-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                        </svg>
                                                        <span className="text-xs text-slate-400">Recomendado: 1200x400px (Máx 1MB)</span>
                                                    </div>
                                                )}

                                                {isEditingCompany && (
                                                    <>
                                                        <label htmlFor="banner-upload" className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors cursor-pointer flex items-center justify-center">
                                                            <div className="bg-white px-4 py-2 rounded-lg shadow-sm font-bold text-xs text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                {companyForm.banner_url ? 'Alterar Banner' : 'Subir Banner'}
                                                            </div>
                                                        </label>
                                                        <input type="file" id="banner-upload" onChange={handleCompanyBannerUpload} className="hidden" accept="image/png, image/jpeg, image/jpg, image/webp" />
                                                    </>
                                                )}
                                            </div>
                                            {bannerError && <p className="text-[10px] text-red-500 text-center">{bannerError}</p>}
                                        </div>
                                    </div>
                                </div>

                                {/* Bottom Section: Remaining Fields Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-5 w-full">
                                    <div className="space-y-3">
                                        {/* NUIT - Premium */}
                                        <PlanFieldWrapper
                                            fieldName="nuit"
                                            fieldLabel="NUIT"
                                            canEdit={canEdit('nuit')}
                                            requiredPlan={getRequiredPlanForField('nuit')}
                                            onLockedClick={handleLockedFieldClick}
                                        >
                                            <input
                                                className="w-full border border-slate-200 bg-slate-50 p-[10px] rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-slate-600 font-sans text-sm font-semibold disabled:opacity-75 disabled:cursor-not-allowed disabled:bg-transparent disabled:border-slate-300"
                                                value={companyForm.nuit}
                                                onChange={e => setCompanyForm({ ...companyForm, nuit: e.target.value })}
                                                disabled={!isEditingCompany || !canEdit('nuit')}
                                                placeholder="NUIT (Número Unificado de Imposto)"
                                            />
                                        </PlanFieldWrapper>

                                        {/* Email - Premium */}
                                        <PlanFieldWrapper
                                            fieldName="email"
                                            fieldLabel="Email Corporativo"
                                            canEdit={canEdit('email')}
                                            requiredPlan={getRequiredPlanForField('email')}
                                            onLockedClick={handleLockedFieldClick}
                                        >
                                            <input
                                                className="w-full border border-slate-200 bg-slate-50 p-[10px] rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-slate-600 font-sans text-sm font-semibold disabled:opacity-75 disabled:cursor-not-allowed disabled:bg-transparent disabled:border-slate-300"
                                                value={companyForm.email}
                                                onChange={e => setCompanyForm({ ...companyForm, email: e.target.value })}
                                                disabled={!isEditingCompany || !canEdit('email')}
                                                placeholder="Email Institucional / de Contacto"
                                            />
                                        </PlanFieldWrapper>
                                    </div>

                                    <div className="space-y-3">
                                        {/* Value Chain - Business Vendedor */}
                                        <PlanFieldWrapper
                                            fieldName="value_chain"
                                            fieldLabel="Cadeia de Valor"
                                            canEdit={canEdit('value_chain')}
                                            requiredPlan={getRequiredPlanForField('value_chain')}
                                            onLockedClick={handleLockedFieldClick}
                                        >
                                            <select
                                                className="w-full border border-slate-200 bg-slate-50 p-[10px] rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-slate-600 font-sans text-sm font-semibold disabled:opacity-100 disabled:cursor-not-allowed disabled:bg-transparent disabled:border-slate-300 disabled:appearance-none pr-8"
                                                value={companyForm.value_chain}
                                                onChange={e => setCompanyForm({ ...companyForm, value_chain: e.target.value })}
                                                disabled={!isEditingCompany || !canEdit('value_chain')}
                                            >
                                                <option value="">Cadeia de valor</option>
                                                {VALUE_CHAINS.map(vc => <option key={vc} value={vc}>{vc}</option>)}
                                            </select>
                                        </PlanFieldWrapper>

                                        {/* Sector - Basic (no wrapper needed) */}
                                        <div className="relative">
                                            <select
                                                className="w-full border border-slate-200 bg-slate-50 p-[10px] rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-slate-600 font-sans text-sm font-semibold disabled:opacity-100 disabled:cursor-not-allowed disabled:bg-transparent disabled:border-slate-300 disabled:appearance-none pr-8"
                                                value={SECTORS.includes(companyForm.category) ? companyForm.category : "Outro"}
                                                onChange={e => {
                                                    if (e.target.value === "Outro") setCompanyForm({ ...companyForm, category: "" });
                                                    else setCompanyForm({ ...companyForm, category: e.target.value });
                                                }}
                                                disabled={!isEditingCompany}
                                            >
                                                <option value="">Setor de Actividade</option>
                                                {SECTORS.map(s => <option key={s} value={s}>{s}</option>)}
                                            </select>
                                            {((!SECTORS.includes(companyForm.category) && companyForm.category !== "") || (!SECTORS.includes(companyForm.category) && companyForm.category === "")) && (
                                                <input
                                                    className="w-full border border-slate-200 bg-slate-50 p-[10px] rounded-lg mt-2 focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-slate-600 font-sans text-sm font-semibold disabled:opacity-75 disabled:cursor-not-allowed disabled:bg-transparent disabled:border-slate-300"
                                                    placeholder="Especifique o setor..."
                                                    value={companyForm.category}
                                                    onChange={e => setCompanyForm({ ...companyForm, category: e.target.value })}
                                                    disabled={!isEditingCompany}
                                                />
                                            )}
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        {/* Province - Basic (no wrapper needed) */}
                                        <select
                                            className="w-full border border-slate-200 bg-slate-50 p-[10px] rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-slate-600 font-sans text-sm font-semibold disabled:opacity-100 disabled:cursor-not-allowed disabled:bg-transparent disabled:border-slate-300 disabled:appearance-none pr-8"
                                            value={companyForm.province}
                                            onChange={e => setCompanyForm({ ...companyForm, province: e.target.value, district: "" })}
                                            disabled={!isEditingCompany}
                                        >
                                            <option value="">Província</option>
                                            {Object.keys(MOZ_DATA).map(p => <option key={p} value={p}>{p}</option>)}
                                        </select>

                                        {/* District - Premium */}
                                        <PlanFieldWrapper
                                            fieldName="district"
                                            fieldLabel="Distrito"
                                            canEdit={canEdit('district')}
                                            requiredPlan={getRequiredPlanForField('district')}
                                            onLockedClick={handleLockedFieldClick}
                                        >
                                            <select
                                                className="w-full border border-slate-200 bg-slate-50 p-[10px] rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-slate-600 font-sans text-sm font-semibold disabled:opacity-100 disabled:cursor-not-allowed disabled:bg-transparent disabled:border-slate-300 disabled:appearance-none pr-8"
                                                value={companyForm.district}
                                                onChange={e => setCompanyForm({ ...companyForm, district: e.target.value })}
                                                disabled={!companyForm.province || !isEditingCompany || !canEdit('district')}
                                            >
                                                <option value="">Distrito</option>
                                                {companyForm.province && MOZ_DATA[companyForm.province]?.map(d => <option key={d} value={d}>{d}</option>)}
                                            </select>
                                        </PlanFieldWrapper>
                                    </div>
                                </div>

                                {/* Two-Column Bio and MVV Section */}
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                                    {/* Left Column: Who We Are - Basic (no wrapper) */}
                                    <div className="h-full flex flex-col">
                                        <textarea
                                            className="w-full flex-1 min-h-[350px] border border-slate-200 bg-slate-50 p-[10px] rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-sm font-sans font-semibold leading-relaxed resize-none disabled:opacity-75 disabled:cursor-not-allowed disabled:bg-transparent disabled:border-slate-300 text-slate-600 overflow-hidden"
                                            value={companyForm.description}
                                            onInput={(e: any) => autoResize(e.target)}
                                            onChange={e => setCompanyForm({ ...companyForm, description: e.target.value })}
                                            disabled={!isEditingCompany}
                                            placeholder="QUEM SOMOS (BIO): Descreva a história, propósito e trajetória da sua empresa..."
                                        />
                                    </div>

                                    {/* Right Column: Mission, Vision, Values (Premium) */}
                                    <div className="space-y-6 h-full flex flex-col">
                                        {/* Mission - Premium */}
                                        <PlanFieldWrapper
                                            fieldName="mission"
                                            fieldLabel="Missão"
                                            canEdit={canEdit('mission')}
                                            requiredPlan={getRequiredPlanForField('mission')}
                                            onLockedClick={handleLockedFieldClick}
                                        >
                                            <div className="flex-1 flex flex-col">
                                                <textarea
                                                    className="w-full flex-1 min-h-[100px] border border-slate-200 bg-slate-50 p-[10px] rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-sm font-sans font-semibold leading-relaxed resize-none disabled:opacity-75 disabled:cursor-not-allowed disabled:bg-transparent disabled:border-slate-200 text-slate-600 overflow-hidden"
                                                    value={companyForm.mission}
                                                    onInput={(e: any) => autoResize(e.target)}
                                                    onChange={e => setCompanyForm({ ...companyForm, mission: e.target.value })}
                                                    disabled={!isEditingCompany || !canEdit('mission')}
                                                    placeholder="MISSÃO: O propósito fundamental da sua existência..."
                                                />
                                            </div>
                                        </PlanFieldWrapper>

                                        {/* Vision - Premium */}
                                        <PlanFieldWrapper
                                            fieldName="vision"
                                            fieldLabel="Visão"
                                            canEdit={canEdit('vision')}
                                            requiredPlan={getRequiredPlanForField('vision')}
                                            onLockedClick={handleLockedFieldClick}
                                        >
                                            <div className="flex-1 flex flex-col">
                                                <textarea
                                                    className="w-full flex-1 min-h-[100px] border border-slate-200 bg-slate-50 p-[10px] rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-sm font-sans font-semibold leading-relaxed resize-none disabled:opacity-75 disabled:cursor-not-allowed disabled:bg-transparent disabled:border-slate-200 text-slate-600 overflow-hidden"
                                                    value={companyForm.vision}
                                                    onInput={(e: any) => autoResize(e.target)}
                                                    onChange={e => setCompanyForm({ ...companyForm, vision: e.target.value })}
                                                    disabled={!isEditingCompany || !canEdit('vision')}
                                                    placeholder="VISÃO: Onde a empresa pretende chegar nos próximos anos..."
                                                />
                                            </div>
                                        </PlanFieldWrapper>

                                        {/* Values - Premium */}
                                        <PlanFieldWrapper
                                            fieldName="values"
                                            fieldLabel="Valores"
                                            canEdit={canEdit('values')}
                                            requiredPlan={getRequiredPlanForField('values')}
                                            onLockedClick={handleLockedFieldClick}
                                        >
                                            <div className="flex-1 flex flex-col">
                                                <textarea
                                                    className="w-full flex-1 min-h-[100px] border border-slate-200 bg-slate-50 p-[10px] rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-sm font-sans font-semibold leading-relaxed resize-none disabled:opacity-75 disabled:cursor-not-allowed disabled:bg-transparent disabled:border-slate-200 text-slate-600 overflow-hidden"
                                                    value={companyForm.values}
                                                    onInput={(e: any) => autoResize(e.target)}
                                                    onChange={e => setCompanyForm({ ...companyForm, values: e.target.value })}
                                                    disabled={!isEditingCompany || !canEdit('values')}
                                                    placeholder="VALORES: Princípios fundamentais (ex: Ética, Inovação, Qualidade)..."
                                                />
                                            </div>
                                        </PlanFieldWrapper>
                                    </div>
                                </div>

                                {/* Services Management - Premium */}
                                <PlanFieldWrapper
                                    fieldName="services"
                                    fieldLabel="Serviços"
                                    canEdit={canEdit('services')}
                                    requiredPlan={getRequiredPlanForField('services')}
                                    onLockedClick={handleLockedFieldClick}
                                >
                                    <div className="space-y-4 pt-4 border-t border-slate-100">
                                        <div className="flex items-center justify-between">
                                            <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Portfólio de Serviços</h4>
                                            {isEditingCompany && canEdit('services') && (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => setCompanyForm({ ...companyForm, services: [...companyForm.services, ""] })}
                                                    className="text-emerald-600 text-[10px] font-black uppercase tracking-widest hover:bg-emerald-50"
                                                >
                                                    + Adicionar Serviço
                                                </Button>
                                            )}
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                            {companyForm.services.length > 0 ? (
                                                companyForm.services.map((service, index) => (
                                                    <div key={index} className="flex items-center gap-2 group">
                                                        <input
                                                            className="flex-1 border border-slate-200 bg-slate-50 p-2 rounded-lg text-xs font-bold text-slate-600 focus:ring-2 focus:ring-emerald-500 outline-none transition-all disabled:opacity-100 disabled:cursor-default disabled:bg-transparent disabled:border-transparent"
                                                            value={service}
                                                            onChange={e => {
                                                                const newServices = [...companyForm.services];
                                                                newServices[index] = e.target.value;
                                                                setCompanyForm({ ...companyForm, services: newServices });
                                                            }}
                                                            disabled={!isEditingCompany || !canEdit('services')}
                                                            placeholder="Ex: Consultoria Técnica"
                                                        />
                                                        {isEditingCompany && canEdit('services') && (
                                                            <button
                                                                onClick={() => {
                                                                    const newServices = companyForm.services.filter((_, i) => i !== index);
                                                                    setCompanyForm({ ...companyForm, services: newServices });
                                                                }}
                                                                className="p-1.5 text-slate-400 hover:text-red-500 bg-slate-100 rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
                                                            >
                                                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" /></svg>
                                                            </button>
                                                        )}
                                                    </div>
                                                ))
                                            ) : (
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest col-span-full py-4 text-center border border-dashed border-slate-200 rounded-xl">Nenhum serviço cadastrado.</p>
                                            )}
                                        </div>
                                    </div>
                                </PlanFieldWrapper>

                                {/* Products Management */}
                                {/* REMOVED: Products specific section inside company editor to avoid duplication since we are merging tabs */}
                            </div>

                            <div className="mt-8 pt-6 border-t border-slate-100 flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sincronizado com Perfil Público</span>
                                </div>
                                <div className="flex gap-3">
                                    {isEditingCompany ? (
                                        <>
                                            <Button variant="outline" onClick={() => setIsEditingCompany(false)} className="font-bold border-slate-200">Cancelar</Button>
                                            <Button onClick={handleUpdateCompany} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold">SALVAR ALTERAÇÕES</Button>
                                        </>
                                    ) : (
                                        <div />
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="bg-white rounded-lg p-8 md:p-10 shadow-lg shadow-slate-200/50 border border-slate-100 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-50 rounded-full -mr-16 -mt-16 opacity-50 group-hover:scale-110 transition-transform duration-500 pointer-events-none"></div>
                        <div className="relative z-10">
                            <div className="w-14 h-14 bg-emerald-100 rounded-lg flex items-center justify-center mb-6 text-emerald-600"><Building2 className="w-7 h-7" /></div>
                            <h3 className="text-2xl font-black text-[#3a3f47] mb-3">Registar a minha Empresa</h3>
                            <p className="text-slate-500 mb-8 leading-relaxed max-w-lg">Junte-se ao maior diretório de empresas do setor agrário em Moçambique.</p>
                            <Link href="/usuario/registo-empresa">
                                <Button className="h-12 px-8 bg-[#f97316] hover:bg-[#ea580c] text-white rounded-lg text-sm font-bold uppercase tracking-wider shadow-lg shadow-orange-500/20 transition-all hover:scale-105">
                                    Começar Registo <ArrowRight className="ml-2 w-5 h-5" />
                                </Button>
                            </Link>
                        </div>
                    </div>
                )}
            </div>

            {/* Plan Banner */}
            <div className="mt-6 bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl border border-orange-100 p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                        <Crown className="w-5 h-5 text-orange-600" />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Seu Plano</p>
                        <p className="text-lg font-black text-slate-800">{planDisplayName}</p>
                    </div>
                </div>
                <Link href="/planos">
                    <Button variant="outline" className="border-orange-200 text-orange-600 hover:bg-orange-100 font-bold text-xs uppercase tracking-wider gap-2">
                        <ArrowRight className="w-4 h-4" />
                        Ver Planos
                    </Button>
                </Link>
            </div>

            {/* Upgrade Modal */}
            <UpgradeModal
                isOpen={showUpgradeModal}
                onClose={() => setShowUpgradeModal(false)}
                fieldLabel={lockedFieldLabel}
                requiredPlan={lockedFieldPlan}
            />
        </div>
    );
}
