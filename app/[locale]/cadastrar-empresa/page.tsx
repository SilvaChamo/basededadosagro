"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import {
    Upload, Plus, Trash2, CheckCircle2, X, Pencil, Lock,
    Building2, LogIn, UserPlus, Loader2
} from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { createClient } from "@/utils/supabase/client";
import { COMPANY_CATEGORIES } from "@/lib/constants";
import { RichTextEditor } from "@/components/RichTextEditor";
import { Spinner } from "@/components/ui/spinner";
import { ReceiptUpload } from "@/components/ReceiptUpload";

const PlanBadge = ({ plan }: { plan: 'Básico' | 'Premium' | 'Parceiro' }) => {
    const styles = {
        'Básico': "bg-slate-100 text-slate-600 border-slate-200",
        Premium: "bg-orange-50 text-orange-600 border-orange-200",
        Parceiro: "bg-emerald-50 text-emerald-600 border-emerald-200"
    };

    return (
        <div className={`absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2 px-2 py-1 rounded-md border ${styles[plan]}`}>
            <span className="text-[10px] font-black uppercase tracking-widest">{plan}</span>
            <Lock className="w-3 h-3" />
        </div>
    );
};

export default function CadastrarEmpresaPage() {
    const router = useRouter();
    const supabase = createClient();

    // Auth state
    const [authChecking, setAuthChecking] = useState(true);
    const [user, setUser] = useState<any>(null);

    // Form states
    const [bannerImage, setBannerImage] = useState<string | null>(null);
    const [logoImage, setLogoImage] = useState<string | null>(null);
    const [services, setServices] = useState<string[]>([]);
    const [newService, setNewService] = useState("");
    const [fetchedCategories] = useState<string[]>(COMPANY_CATEGORIES);
    const [bio, setBio] = useState("");
    const [companyName, setCompanyName] = useState("");
    const [address, setAddress] = useState("");
    const [province, setProvince] = useState("");
    const [activity, setActivity] = useState("");
    const [sector, setSector] = useState("");
    const [highlightCompany, setHighlightCompany] = useState(false);
    const [website, setWebsite] = useState("");
    const [representative, setRepresentative] = useState("");
    const [nuit, setNuit] = useState("");
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'mpesa' | 'visa' | null>(null);
    const [paymentPhoneNumber, setPaymentPhoneNumber] = useState("");
    const [contact, setContact] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Compression dialog
    const [showCompressionDialog, setShowCompressionDialog] = useState(false);
    const [pendingFile, setPendingFile] = useState<File | null>(null);
    const [uploadType, setUploadType] = useState<'banner' | 'logo' | null>(null);
    const [isCompressing, setIsCompressing] = useState(false);

    const bannerInputRef = useRef<HTMLInputElement>(null);
    const logoInputRef = useRef<HTMLInputElement>(null);

    // Restore saved form data from localStorage
    useEffect(() => {
        const saved = localStorage.getItem('pending_cadastrar_empresa');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                if (parsed.companyName) setCompanyName(parsed.companyName);
                if (parsed.activity) setActivity(parsed.activity);
                if (parsed.sector) setSector(parsed.sector);
                if (parsed.province) setProvince(parsed.province);
                if (parsed.address) setAddress(parsed.address);
                if (parsed.contact) setContact(parsed.contact);
                if (parsed.bio) setBio(parsed.bio);
                if (parsed.website) setWebsite(parsed.website);
                if (parsed.representative) setRepresentative(parsed.representative);
                if (parsed.nuit) setNuit(parsed.nuit);
                if (parsed.services) setServices(parsed.services);
            } catch (e) { /* ignore */ }
        }
    }, []);

    // Check auth
    useEffect(() => {
        const checkAuth = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);
            setAuthChecking(false);
        };
        checkAuth();
    }, []);

    // Auto-save to localStorage
    useEffect(() => {
        if (!authChecking) {
            localStorage.setItem('pending_cadastrar_empresa', JSON.stringify({
                companyName, activity, sector, province, address,
                contact, bio, website, representative, nuit, services
            }));
        }
    }, [companyName, activity, sector, province, address, contact, bio, website, representative, nuit, services, authChecking]);

    const handleGoToLogin = () => {
        router.push(`/auth/login?next=/cadastrar-empresa`);
    };

    const handleGoToRegister = () => {
        router.push(`/registar?next=/cadastrar-empresa`);
    };

    const isValidFileSize = (file: File) => file.size <= 1048576;

    const compressImage = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (event) => {
                const img = new window.Image();
                img.src = event.target?.result as string;
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');
                    let width = img.width;
                    let height = img.height;
                    const MAX = 1200;
                    if (width > height) {
                        if (width > MAX) { height *= MAX / width; width = MAX; }
                    } else {
                        if (height > MAX) { width *= MAX / height; height = MAX; }
                    }
                    canvas.width = width;
                    canvas.height = height;
                    ctx?.drawImage(img, 0, 0, width, height);
                    resolve(canvas.toDataURL('image/jpeg', 0.7));
                };
                img.onerror = (err) => reject(err);
            };
        });
    };

    const handleBannerUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (!isValidFileSize(file)) {
            setPendingFile(file); setUploadType('banner');
            setShowCompressionDialog(true); e.target.value = ''; return;
        }
        setBannerImage(URL.createObjectURL(file));
    };

    const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (!isValidFileSize(file)) {
            setPendingFile(file); setUploadType('logo');
            setShowCompressionDialog(true); e.target.value = ''; return;
        }
        setLogoImage(URL.createObjectURL(file));
    };

    const confirmCompression = async () => {
        if (!pendingFile || !uploadType) return;
        setIsCompressing(true);
        try {
            await new Promise(r => setTimeout(r, 1500));
            const compressed = await compressImage(pendingFile);
            if (uploadType === 'banner') setBannerImage(compressed);
            else setLogoImage(compressed);
            setShowCompressionDialog(false);
            setPendingFile(null); setUploadType(null);
        } catch { alert("Erro ao comprimir imagem."); }
        finally { setIsCompressing(false); }
    };

    const addService = () => {
        if (newService.trim() && !services.includes(newService.trim())) {
            setServices([...services, newService.trim()]);
            setNewService("");
        }
    };

    const removeService = (s: string) => setServices(services.filter(x => x !== s));

    const handleSave = async () => {
        const errors: string[] = [];
        if (!companyName.trim()) errors.push("Nome da empresa");
        if (!address.trim()) errors.push("Endereço físico");
        if (!province.trim()) errors.push("Província");
        if (!activity.trim()) errors.push("Actividade Principal");
        if (!bio.trim()) errors.push("Descrição geral da empresa");
        if (errors.length > 0) {
            alert(`Por favor, preencha os seguintes campos:\n- ${errors.join('\n- ')}`);
            return;
        }

        setIsSubmitting(true);
        try {
            const uploadToSupabase = async (src: string, folder: string) => {
                const response = await fetch(src);
                const blob = await response.blob();
                const ext = blob.type.split('/')[1] || 'jpg';
                const path = `${folder}/${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`;
                const { data, error } = await supabase.storage.from('public-assets').upload(path, blob, { contentType: blob.type, upsert: false });
                if (error) throw error;
                return supabase.storage.from('public-assets').getPublicUrl(data.path).data.publicUrl;
            };

            const finalBannerUrl = bannerImage ? await uploadToSupabase(bannerImage, 'banners') : null;
            const finalLogoUrl = logoImage ? await uploadToSupabase(logoImage, 'logos') : null;

            const slug = companyName.toLowerCase().trim()
                .normalize('NFD').replace(/[\u0300-\u036f]/g, "")
                .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
                + "-" + Math.random().toString(36).substring(2, 6);

            const insertData: any = {
                name: companyName,
                activity,
                category: sector || "Geral",
                province,
                address,
                description: bio,
                contact: contact || representative,
                logo_url: finalLogoUrl,
                banner_url: finalBannerUrl,
                slug,
                registration_type: 'Simples',
                is_archived: false,
                plan: 'Básico',
                updated_at: new Date().toISOString()
            };

            // If logged in, link to user
            if (user) insertData.user_id = user.id;
            if (website) insertData.website = website;
            if (representative) insertData.representative_name = representative;
            if (nuit) insertData.nuit = nuit;

            const { data: inserted, error } = await supabase.from('companies').insert(insertData).select('id').single();
            if (error) throw error;

            localStorage.removeItem('pending_cadastrar_empresa');

            alert("Empresa registada com sucesso! A sua empresa ficará visível em 24 a 48 horas.");
            if (user) {
                router.push('/usuario/dashboard/minha-conta');
            } else {
                router.push('/auth/login');
            }
        } catch (err: any) {
            console.error(err);
            alert("Erro ao guardar empresa: " + (err.message || "Tente novamente."));
        } finally {
            setIsSubmitting(false);
        }
    };

    // ── Loading state ──
    if (authChecking) {
        return (
            <div className="min-h-screen bg-slate-100 flex items-center justify-center">
                <Spinner className="w-8 h-8 text-emerald-600 animate-spin" />
            </div>
        );
    }

    // ── Auth gate — show if NOT logged in ──
    if (!user) {
        return (
            <div className="min-h-screen bg-slate-100 font-sans">
                {/* Top bar */}
                <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center gap-3">
                    <Building2 className="w-6 h-6 text-emerald-600" />
                    <span className="font-black text-slate-800 text-lg tracking-tight">BASE AGRO</span>
                </div>

                <div className="flex items-center justify-center min-h-[calc(100vh-65px)] px-4">
                    <div className="w-full max-w-md">
                        {/* Card */}
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                            {/* Header dark */}
                            <div className="bg-emerald-950 p-8 text-center relative overflow-hidden">
                                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1625246333195-09d9b63bd70b?q=80&w=600&auto=format&fit=crop')] bg-cover bg-center opacity-10" />
                                <div className="relative z-10">
                                    <div className="w-14 h-14 bg-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Building2 className="w-7 h-7 text-white" />
                                    </div>
                                    <h1 className="text-xl font-black text-white mb-2">Destacar a sua Empresa</h1>
                                    <p className="text-emerald-300 text-sm leading-relaxed">
                                        Para cadastrar a sua empresa, precisa de uma conta. É rápido e gratuito.
                                    </p>
                                </div>
                            </div>

                            {/* Auth options */}
                            <div className="p-8 space-y-4">
                                <Button
                                    onClick={handleGoToRegister}
                                    className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase tracking-widest flex items-center justify-center gap-3"
                                    style={{ borderRadius: '10px' }}
                                >
                                    <UserPlus className="w-5 h-5" />
                                    Criar Conta Gratuita
                                </Button>

                                <div className="flex items-center gap-3">
                                    <div className="flex-1 h-px bg-slate-200" />
                                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">ou</span>
                                    <div className="flex-1 h-px bg-slate-200" />
                                </div>

                                <Button
                                    onClick={handleGoToLogin}
                                    variant="outline"
                                    className="w-full h-12 border-slate-200 text-slate-700 font-bold flex items-center justify-center gap-3 hover:bg-slate-50"
                                    style={{ borderRadius: '10px' }}
                                >
                                    <LogIn className="w-5 h-5" />
                                    Já tenho conta — Entrar
                                </Button>

                                <p className="text-center text-[11px] text-slate-400 mt-4 leading-relaxed">
                                    Os seus dados do formulário são guardados automaticamente.<br />
                                    Após o login, continua de onde ficou.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // ── Main form (logged in) ──
    return (
        <div className="min-h-screen bg-slate-100 font-sans pb-20">
            {/* Top bar */}
            <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                    <Building2 className="w-6 h-6 text-emerald-600" />
                    <span className="font-black text-slate-800 text-lg tracking-tight">BASE AGRO</span>
                    <span className="text-slate-300 mx-1">·</span>
                    <span className="text-sm font-semibold text-slate-500">Cadastrar Empresa</span>
                </div>
                <button
                    onClick={() => router.back()}
                    className="text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors"
                >
                    ← Voltar
                </button>
            </div>

            <div className="container-site flex flex-col lg:flex-row gap-[20px]">
                {/* MAIN CONTENT (LEFT) */}
                <main className="flex-1 w-full space-y-[10px]">
                    {/* BANNER */}
                    <div
                        onClick={() => bannerInputRef.current?.click()}
                        className="w-full h-40 bg-white border-2 border-dashed border-slate-200 flex flex-col items-center justify-center group hover:bg-slate-50 transition-all cursor-pointer overflow-hidden relative shadow-sm mb-[10px]"
                        style={{ borderRadius: '15px' }}
                    >
                        {bannerImage ? (
                            <>
                                <img src={bannerImage} alt="Banner" className="w-full h-full object-cover" />
                                <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                    <button onClick={e => { e.stopPropagation(); bannerInputRef.current?.click(); }}
                                        className="p-2 bg-white/90 backdrop-blur-sm text-slate-700 hover:text-white hover:bg-emerald-600 rounded-full shadow-lg border border-slate-100 transition-colors">
                                        <Pencil className="w-4 h-4" />
                                    </button>
                                    <button onClick={e => { e.stopPropagation(); setBannerImage(null); }}
                                        className="p-2 bg-white/90 backdrop-blur-sm text-slate-700 hover:text-white hover:bg-red-500 rounded-full shadow-lg border border-slate-100 transition-colors">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </>
                        ) : (
                            <>
                                <Upload className="w-10 h-10 text-slate-400 mb-2" />
                                <span className="text-sm font-bold text-slate-500 uppercase tracking-widest">Banner da Empresa</span>
                                <p className="text-[10px] text-slate-400 mt-1 uppercase font-black">Recomendado: 1200x400px (Max: 1MB)</p>
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
                            {logoImage ? (
                                <img src={logoImage} alt="Logo" className="w-full h-full object-contain" />
                            ) : (
                                <>
                                    <Upload className="w-8 h-8 text-slate-400 mb-1" />
                                    <span className="text-[10px] font-bold text-slate-500 uppercase">Logo (1:1)</span>
                                    <span className="text-[8px] font-bold text-slate-400 uppercase mt-1">Max: 1MB</span>
                                </>
                            )}
                            <input type="file" ref={logoInputRef} onChange={handleLogoUpload} className="hidden" accept="image/*" />
                        </div>

                        <div className="flex-1 flex flex-col gap-[10px] justify-between">
                            <Input
                                placeholder="Nome da empresa *"
                                className="h-12 border-slate-200 px-4 text-sm font-semibold text-slate-600 placeholder:text-slate-400 bg-white"
                                style={{ borderRadius: '8px' }}
                                value={companyName}
                                onChange={e => setCompanyName(e.target.value)}
                            />
                            <Input
                                placeholder="Actividade Principal *"
                                className="h-12 border-slate-200 px-4 text-sm font-semibold text-slate-600 placeholder:text-slate-400 bg-white"
                                style={{ borderRadius: '8px' }}
                                value={activity}
                                onChange={e => setActivity(e.target.value)}
                            />
                            <div className="grid grid-cols-2 gap-[10px]">
                                <Select value={sector} onValueChange={setSector}>
                                    <SelectTrigger className="w-full h-12 border-slate-200 bg-white text-slate-600 font-semibold px-4" style={{ borderRadius: '8px' }}>
                                        <SelectValue placeholder="Sector de Actuação" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {fetchedCategories.map(cat => (
                                            <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <Select value={province} onValueChange={setProvince}>
                                    <SelectTrigger className="w-full h-12 border-slate-200 bg-white text-slate-600 font-semibold px-4" style={{ borderRadius: '8px' }}>
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

                    {/* CONTACTS + ADDRESS */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-[10px]">
                        <Input
                            placeholder="Nome do Representante"
                            className="h-12 border-slate-200 px-4 text-sm font-semibold text-slate-600 placeholder:text-slate-400 bg-white"
                            style={{ borderRadius: '8px' }}
                            value={representative}
                            onChange={e => setRepresentative(e.target.value)}
                        />
                        <Input
                            placeholder="Contacto / Telefone *"
                            className="h-12 border-slate-200 px-4 text-sm font-semibold text-slate-600 placeholder:text-slate-400 bg-white"
                            style={{ borderRadius: '8px' }}
                            value={contact}
                            onChange={e => setContact(e.target.value)}
                        />
                    </div>

                    <Input
                        placeholder="Endereço físico *"
                        className="h-12 border-slate-200 px-4 text-sm font-semibold text-slate-600 placeholder:text-slate-400 bg-white"
                        style={{ borderRadius: '8px' }}
                        value={address}
                        onChange={e => setAddress(e.target.value)}
                    />

                    <RichTextEditor
                        value={bio}
                        onChange={setBio}
                        placeholder="Descrição Geral da Empresa *"
                        className="min-h-[150px] bg-white"
                    />

                    {/* SUBMIT */}
                    <div className="pt-4 flex justify-start">
                        <Button
                            onClick={handleSave}
                            disabled={isSubmitting}
                            className="px-10 h-12 bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase tracking-widest shadow-xl shadow-emerald-500/20 transition-colors duration-300 disabled:opacity-50 flex items-center gap-2"
                            style={{ borderRadius: '8px' }}
                        >
                            {isSubmitting ? <><Loader2 className="w-4 h-4 animate-spin" /> A guardar...</> : "Guardar Empresa"}
                        </Button>
                    </div>
                </main>

                {/* SIDEBAR (RIGHT) */}
                <aside
                    className="w-full lg:w-[420px] pb-8 pt-0 px-0 shrink-0 sticky right-0 overflow-y-auto space-y-[10px]"
                    style={{ top: '80px', height: 'calc(100vh - 80px)' }}
                >
                    {/* SERVIÇOS */}
                    <div className="bg-white p-6 border border-slate-200 shadow-sm" style={{ borderRadius: '15px' }}>
                        <h3 className="relative text-sm font-black text-slate-800 uppercase tracking-widest mb-6 flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                Serviços
                            </div>
                            <PlanBadge plan="Básico" />
                        </h3>
                        <div className="space-y-4">
                            <div className="flex gap-2">
                                <Input
                                    value={newService}
                                    onChange={e => setNewService(e.target.value)}
                                    onKeyDown={e => e.key === "Enter" && addService()}
                                    placeholder="Adicionar um serviço..."
                                    className="flex-1 h-10 border-slate-200 text-xs bg-slate-50 font-bold placeholder:text-slate-400 cursor-not-allowed"
                                    style={{ borderRadius: '8px' }}
                                    disabled
                                />
                                <Button onClick={addService} size="sm"
                                    className="bg-emerald-600/50 text-white font-bold h-10 w-10 flex items-center justify-center cursor-not-allowed"
                                    style={{ borderRadius: '8px' }} disabled>
                                    <Plus className="w-4 h-4" />
                                </Button>
                            </div>
                            <div className="flex flex-wrap gap-2 pt-2">
                                {services.length > 0 ? services.map((s, i) => (
                                    <div key={i} className="h-9 px-4 bg-emerald-50 text-emerald-700 flex items-center gap-2 border border-emerald-100" style={{ borderRadius: '8px' }}>
                                        <span className="text-[10px] font-black uppercase tracking-tighter">{s}</span>
                                        <button onClick={() => removeService(s)} className="hover:text-rose-500 transition-colors">
                                            <X className="w-3 h-3" />
                                        </button>
                                    </div>
                                )) : (
                                    <div className="w-full py-4 text-center border border-dashed border-slate-200" style={{ borderRadius: '8px' }}>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Nenhum serviço adicionado</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* DESTACAR EMPRESA */}
                    <div
                        className="bg-emerald-900 p-6 border border-emerald-800 shadow-sm relative overflow-hidden group cursor-pointer transition-all duration-300"
                        style={{ borderRadius: '15px' }}
                        onClick={() => setHighlightCompany(!highlightCompany)}
                    >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl -mr-8 -mt-8" />
                        <div className="relative z-10 flex items-center justify-between">
                            <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
                                <span className={`w-2 h-2 rounded-full ${highlightCompany ? 'bg-emerald-400 animate-pulse' : 'bg-slate-600'}`} />
                                Destacar Empresa
                            </h3>
                            <div className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 ${highlightCompany ? 'bg-emerald-500' : 'bg-emerald-950 border border-emerald-700'}`}>
                                <div className={`w-4 h-4 rounded-full bg-white shadow-sm transform transition-transform duration-300 ${highlightCompany ? 'translate-x-6' : 'translate-x-0'}`} />
                            </div>
                        </div>
                        <p className="text-xs text-green-400 mt-3 font-medium leading-relaxed">
                            Aumente a visibilidade da sua empresa aparecendo em destaque na página inicial e nos motores de busca!
                        </p>

                        {/* Payment section — slides in */}
                        <div className={`grid transition-all duration-500 ease-in-out ${highlightCompany ? 'grid-rows-[1fr] opacity-100 mt-6 pt-6 border-t border-emerald-800' : 'grid-rows-[0fr] opacity-0'}`}>
                            <div className="overflow-hidden min-h-0">
                                <div className="flex flex-col gap-4">
                                    <div className="flex justify-between items-end">
                                        <span className="text-emerald-400 text-xs font-bold uppercase tracking-widest">Custo do Destaque</span>
                                        <span className="text-2xl font-black text-white">1 500 Mt</span>
                                    </div>

                                    <div className="flex gap-2">
                                        {/* M-Pesa */}
                                        <div
                                            onClick={e => { e.stopPropagation(); setSelectedPaymentMethod('mpesa'); }}
                                            className={`bg-white p-0 rounded-md border flex items-center justify-center h-8 w-[50px] transition-all cursor-pointer overflow-hidden relative ${selectedPaymentMethod === 'mpesa' ? 'border-[#E60000] ring-2 ring-[#E60000]/30' : 'border-slate-200 hover:border-[#E60000]'}`}
                                        >
                                            <Image src="/assets/Mpesa.png" alt="M-Pesa" fill className="object-cover" />
                                        </div>
                                        {/* Visa */}
                                        <div
                                            onClick={e => { e.stopPropagation(); setSelectedPaymentMethod('visa'); }}
                                            className={`bg-white px-2 py-1 rounded-md border flex items-center justify-center h-8 transition-all cursor-pointer overflow-hidden ${selectedPaymentMethod === 'visa' ? 'border-[#1A1F71] ring-2 ring-[#1A1F71]/30' : 'border-slate-200 hover:border-[#1A1F71]'}`}
                                        >
                                            <Image src="/assets/Visa.webp" alt="Visa" width={50} height={25} className="h-full w-auto object-contain" />
                                        </div>
                                    </div>

                                    {/* M-Pesa input */}
                                    {selectedPaymentMethod === 'mpesa' && (
                                        <div className="bg-emerald-950/30 p-3 rounded-lg border border-emerald-500/10 space-y-3 animate-in fade-in slide-in-from-top-2">
                                            <div className="space-y-1">
                                                <label className="text-[10px] font-bold text-emerald-200 uppercase tracking-wider">Número Vodacom</label>
                                                <Input
                                                    placeholder="258 84/85 xxx xxxx"
                                                    value={paymentPhoneNumber}
                                                    onChange={e => setPaymentPhoneNumber(e.target.value)}
                                                    onClick={e => e.stopPropagation()}
                                                    className="h-9 bg-emerald-900/50 border-emerald-800 text-white placeholder:text-emerald-600 text-xs font-mono"
                                                />
                                            </div>
                                            <Button size="sm" disabled={isSubmitting}
                                                onClick={async e => {
                                                    e.stopPropagation();
                                                    if (paymentPhoneNumber.length < 9) { alert("Insira um número válido."); return; }
                                                    setIsSubmitting(true);
                                                    try {
                                                        const res = await fetch('/api/payment/mpesa', {
                                                            method: 'POST',
                                                            headers: { 'Content-Type': 'application/json' },
                                                            body: JSON.stringify({
                                                                phoneNumber: paymentPhoneNumber.startsWith('258') ? paymentPhoneNumber : `258${paymentPhoneNumber}`,
                                                                amount: '1500',
                                                                reference: `DEST_${Math.random().toString(36).substring(2, 6).toUpperCase()}_${Date.now()}`
                                                            })
                                                        });
                                                        const data = await res.json();
                                                        if (data.success) alert(`Pedido enviado! Verifique o seu telemóvel e insira o PIN.`);
                                                        else alert(data.message || "Erro ao processar pagamento.");
                                                    } catch { alert("Erro de conexão. Verifique a internet."); }
                                                    finally { setIsSubmitting(false); }
                                                }}
                                                className="w-full h-8 text-xs font-black uppercase text-white bg-[#E60000] hover:bg-[#cc0000]">
                                                {isSubmitting ? 'Processando...' : 'Pagar 1 500 Mt'}
                                            </Button>
                                        </div>
                                    )}

                                    {/* Visa / Bank */}
                                    {selectedPaymentMethod === 'visa' && (
                                        <div className="bg-emerald-950/30 p-3 rounded-lg border border-emerald-500/10 animate-in fade-in slide-in-from-top-2 space-y-3">
                                            <p className="text-[10px] text-emerald-200 text-center font-bold uppercase tracking-wider mb-2">Dados para Transferência (Moza Banco)</p>
                                            <div className="text-xs text-emerald-100 bg-emerald-900/40 p-2 rounded border border-emerald-500/20 space-y-1 font-mono">
                                                <div className="flex justify-between"><span className="text-emerald-400">Banco:</span><span>Moza Banco</span></div>
                                                <div className="flex justify-between"><span className="text-emerald-400">NIB:</span><span className="select-all">003400000544672210195</span></div>
                                                <div className="flex justify-between items-center pt-1 border-t border-emerald-500/10 mt-1"><span className="text-emerald-400">Titular:</span><span>Visual Design</span></div>
                                            </div>
                                            <p className="text-[10px] text-emerald-300/80 leading-relaxed">
                                                Depois de transferir, anexe aqui o comprovativo (imagem ou PDF). Fica pendente até a nossa equipa confirmar.
                                            </p>
                                            <ReceiptUpload amount={1500} planName="Destaque" itemType="highlight" />
                                        </div>
                                    )}

                                    <div className="bg-emerald-950/50 p-3 rounded-lg border border-emerald-500/20">
                                        <p className="text-[10px] text-emerald-300 leading-relaxed text-center">
                                            <span className="font-bold text-emerald-200">Nota SEO:</span> A sua empresa ficará visível nos motores de busca em <span className="text-white font-bold underline decoration-emerald-500/50">24 a 48 horas</span> após verificação.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </aside>
            </div>

            {/* COMPRESSION DIALOG */}
            <Dialog open={showCompressionDialog} onOpenChange={setShowCompressionDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Imagem muito grande</DialogTitle>
                        <DialogDescription>A imagem excede 1MB. Deseja optimizar automaticamente?</DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <div className="p-4 bg-orange-50 rounded-lg border border-orange-100">
                            <p className="text-xs text-orange-800 font-medium">A qualidade visual será mantida, mas o tamanho será reduzido.</p>
                        </div>
                    </div>
                    <DialogFooter>
                        {!isCompressing ? (
                            <>
                                <Button variant="outline" onClick={() => setShowCompressionDialog(false)}>Cancelar</Button>
                                <Button onClick={confirmCompression} className="bg-emerald-600 hover:bg-emerald-700 text-white">Sim, optimizar</Button>
                            </>
                        ) : (
                            <div className="flex items-center gap-2 text-sm text-slate-500">
                                <Loader2 className="w-4 h-4 animate-spin" /> A comprimir...
                            </div>
                        )}
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
