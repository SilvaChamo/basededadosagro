"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import Image from "next/image";
import { Upload, ShoppingBag, Plus, Trash2, CheckCircle2, X, Pencil, Lock, CreditCard, MapPin } from "lucide-react";
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
    SelectGroup,
    SelectLabel,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { COMPANY_CATEGORIES, PROVINCES } from "@/lib/constants";
import { RichTextEditor } from "@/components/RichTextEditor";
import { PageHeader } from "@/components/PageHeader";

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

export default function SimpleRegistrationPage() {
    const router = useRouter();


    // New states for interactive features
    const [bannerImage, setBannerImage] = useState<string | null>(null);
    const [logoImage, setLogoImage] = useState<string | null>(null);
    const [services, setServices] = useState<string[]>([]);
    const [newService, setNewService] = useState("");

    // Data States
    const [fetchedCategories, setFetchedCategories] = useState<string[]>(COMPANY_CATEGORIES);
    const [bio, setBio] = useState("");

    // Mandatory Free Fields State
    const [companyName, setCompanyName] = useState("");
    const [address, setAddress] = useState("");
    const [province, setProvince] = useState("");
    const [activity, setActivity] = useState("");
    const [sector, setSector] = useState("");
    const [highlightCompany, setHighlightCompany] = useState(false);

    // Partner Fields State
    const [website, setWebsite] = useState("");
    const [representative, setRepresentative] = useState("");
    const [nuit, setNuit] = useState("");

    // Payment State
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'mpesa' | 'visa' | null>(null);
    const [paymentPhoneNumber, setPaymentPhoneNumber] = useState("");
    const [contact, setContact] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Fetch Categories (Removed in favor of static constant)
    useEffect(() => {
        setFetchedCategories(COMPANY_CATEGORIES);
    }, []);

    // Compression Dialog State
    const [showCompressionDialog, setShowCompressionDialog] = useState(false);
    const [pendingFile, setPendingFile] = useState<File | null>(null);
    const [uploadType, setUploadType] = useState<'banner' | 'logo' | null>(null);
    const [isCompressing, setIsCompressing] = useState(false);

    const bannerInputRef = useRef<HTMLInputElement>(null);
    const logoInputRef = useRef<HTMLInputElement>(null);



    // Helper to validate file size (1MB = 1048576 bytes)
    const isValidFileSize = (file: File) => {
        return file.size <= 1048576;
    };



    // IMAGE COMPRESSION UTILITY
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

                    // Simple scaling logic: max 1200px width/height
                    let width = img.width;
                    let height = img.height;
                    const MAX_WIDTH = 1200;
                    const MAX_HEIGHT = 1200;

                    if (width > height) {
                        if (width > MAX_WIDTH) {
                            height *= MAX_WIDTH / width;
                            width = MAX_WIDTH;
                        }
                    } else {
                        if (height > MAX_HEIGHT) {
                            width *= MAX_HEIGHT / height;
                            height = MAX_HEIGHT;
                        }
                    }

                    canvas.width = width;
                    canvas.height = height;
                    ctx?.drawImage(img, 0, 0, width, height);

                    // Compress to 0.7 quality JPEG
                    const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
                    resolve(dataUrl);
                };
                img.onerror = (err) => reject(err);
            };
        });
    };

    const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (!isValidFileSize(file)) {
                setPendingFile(file);
                setUploadType('banner');
                setShowCompressionDialog(true);
                // Reset input
                e.target.value = '';
                return;
            }
            const url = URL.createObjectURL(file);
            setBannerImage(url);
        }
    };

    const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (!isValidFileSize(file)) {
                setPendingFile(file);
                setUploadType('logo');
                setShowCompressionDialog(true);
                // Reset input
                e.target.value = '';
                return;
            }
            const url = URL.createObjectURL(file);
            setLogoImage(url);
        }
    };

    const confirmCompression = async () => {
        if (!pendingFile || !uploadType) return;

        setIsCompressing(true);
        try {
            // Artificial delay to show "Aguarde" if compression is too fast, 
            // or just rely on actual compression time. 
            // User asked: "informar o tempo que o usuario deve esperar". 
            // Since we don't know exact time, "Aguarde..." is standard. 
            // Let's add a small minimum delay for UX so it doesn't flash.
            await new Promise(resolve => setTimeout(resolve, 1500));

            const compressedUrl = await compressImage(pendingFile);

            if (uploadType === 'banner') {
                setBannerImage(compressedUrl);
            } else {
                setLogoImage(compressedUrl);
            }

            setShowCompressionDialog(false);
            setPendingFile(null);
            setUploadType(null);
        } catch (error) {
            alert("Erro ao comprimir imagem.");
        } finally {
            setIsCompressing(false);
        }
    };

    const addService = () => {
        if (newService.trim() && !services.includes(newService.trim())) {
            setServices([...services, newService.trim()]);
            setNewService("");
        }
    };

    const removeService = (serviceToRemove: string) => {
        setServices(services.filter(s => s !== serviceToRemove));
    };

    const handleSave = async () => {
        const errors: string[] = [];
        if (!companyName.trim()) errors.push("Nome da empresa");
        if (!address.trim()) errors.push("Endereço físico");
        if (!province.trim()) errors.push("Província");
        if (!activity.trim()) errors.push("Actividade Principal");
        if (!bio.trim()) errors.push("Descrição geral da empresa (Bio)");

        if (errors.length > 0) {
            alert(`Por favor, preencha os seguintes campos obrigatórios:\n- ${errors.join('\n- ')}`);
            return;
        }

        setIsSubmitting(true);
        try {
            // 1. Upload Images if any
            let finalBannerUrl = null;
            let finalLogoUrl = null;

            const uploadToSupabase = async (imageSource: string, subfolder: string) => {
                const response = await fetch(imageSource);
                const blob = await response.blob();
                const fileExt = blob.type.split('/')[1] || 'jpg';
                const fileName = `${subfolder}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

                const { data, error } = await supabase.storage
                    .from('public-assets')
                    .upload(fileName, blob, {
                        contentType: blob.type,
                        cacheControl: '3600',
                        upsert: false
                    });

                if (error) throw error;

                const { data: { publicUrl } } = supabase.storage
                    .from('public-assets')
                    .getPublicUrl(data.path);

                return publicUrl;
            };

            if (bannerImage) {
                finalBannerUrl = await uploadToSupabase(bannerImage, 'banners');
            }

            if (logoImage) {
                finalLogoUrl = await uploadToSupabase(logoImage, 'logos');
            }

            // 2. Map sector/category - ensure it matches constants
            const category = sector || "Geral";

            // 3. Insert into database
            const slug = companyName
                .toLowerCase()
                .trim()
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, "") // Remove accents
                .replace(/[^a-z0-9]+/g, '-')     // Remove special characters
                .replace(/^-+|-+$/g, '')         // Remove trailing dashes
                + "-" + Math.random().toString(36).substring(2, 6);

            const { data: insertedData, error } = await supabase.from('companies').insert({
                name: companyName,
                activity: activity,
                category: category,
                province: province,
                address: address,
                description: bio,
                contact: contact || representative, // Fallback to representative name if contact is empty
                logo_url: finalLogoUrl,
                banner_url: finalBannerUrl,
                slug: slug,
                registration_type: 'Simples',
                is_archived: false,
                plan: 'Básico',
                updated_at: new Date().toISOString()
            }).select('id').single();

            if (error) throw error;

            if (insertedData) {
                localStorage.setItem('pending_company_registration_id', insertedData.id);
            }

            alert("Registo inicial concluído! Agora, crie a sua conta de acesso para gerir a sua empresa.");
            router.push("/auth/login");

        } catch (error: any) {
            console.error("Erro ao guardar empresa:", error);
            alert("Erro ao guardar empresa: " + (error.message || "Tente novamente."));
        } finally {
            setIsSubmitting(false);
        }
    };


    return (
        <div className="min-h-screen bg-slate-100 font-sans pb-20">
            <div className="mb-[40px]">
                <PageHeader
                    title="Registo Simples"
                    breadcrumbs={[
                        { label: "Design System", href: "/design-system" },
                        { label: "Registo Simples", href: undefined }
                    ]}
                />
            </div>
            <div className="container-site flex flex-col lg:flex-row gap-[20px]">
                {/* MAIN CONTENT (LEFT) */}
                <main className="flex-1 w-full space-y-8">
                    {/* 1. BANNER - Now moved inside and aligned with form */}
                    <div
                        onClick={() => bannerInputRef.current?.click()}
                        className="w-full h-40 bg-white border-2 border-dashed border-slate-200 flex flex-col items-center justify-center group hover:bg-slate-50 transition-all cursor-pointer overflow-hidden relative shadow-sm mb-[20px]"
                        style={{ borderRadius: '15px' }}
                    >
                        {bannerImage ? (
                            <>
                                <img src={bannerImage} alt="Banner Preview" className="w-full h-full object-cover" />
                                <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            bannerInputRef.current?.click();
                                        }}
                                        className="p-2 bg-white/90 backdrop-blur-sm text-slate-700 hover:text-white hover:bg-[#f97316] rounded-full shadow-lg border border-slate-100 transition-colors"
                                        title="Trocar Imagem"
                                    >
                                        <Pencil className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setBannerImage(null);
                                        }}
                                        className="p-2 bg-white/90 backdrop-blur-sm text-slate-700 hover:text-white hover:bg-[#f97316] rounded-full shadow-lg border border-slate-100 transition-colors"
                                        title="Remover Imagem"
                                    >
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
                        <input
                            type="file"
                            ref={bannerInputRef}
                            onChange={handleBannerUpload}
                            className="hidden"
                            accept="image/*"
                        />
                    </div>

                    {/* FORM SECTION */}
                    <div className="space-y-[10px]">
                        {/* LOGO + TOP FIELDS */}
                        <div className="flex flex-col md:flex-row gap-[10px] items-stretch">
                            <div
                                onClick={() => logoInputRef.current?.click()}
                                className="w-56 shrink-0 bg-white border-2 border-dashed border-slate-200 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 transition-all overflow-hidden relative"
                                style={{ borderRadius: '15px' }}
                            >
                                {logoImage ? (
                                    <>
                                        <img src={logoImage} alt="Logo Preview" className="w-full h-full object-cover" />
                                        <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    logoInputRef.current?.click();
                                                }}
                                                className="p-1.5 bg-white/90 backdrop-blur-sm text-slate-700 hover:text-white hover:bg-[#f97316] rounded-full shadow-sm border border-slate-100 transition-colors"
                                                title="Trocar Logo"
                                            >
                                                <Pencil className="w-3.5 h-3.5" />
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setLogoImage(null);
                                                }}
                                                className="p-1.5 bg-white/90 backdrop-blur-sm text-slate-700 hover:text-white hover:bg-[#f97316] rounded-full shadow-sm border border-slate-100 transition-colors"
                                                title="Remover Logo"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <Upload className="w-8 h-8 text-slate-400 mb-1" />
                                        <span className="text-[10px] font-bold text-slate-500 uppercase">Logo (1:1)</span>
                                        <span className="text-[8px] font-bold text-slate-400 uppercase mt-1">Max: 1MB</span>
                                    </>
                                )}
                                <input
                                    type="file"
                                    ref={logoInputRef}
                                    onChange={handleLogoUpload}
                                    className="hidden"
                                    accept="image/*"
                                />
                            </div>

                            <div className="flex-1 w-full flex flex-col gap-[10px] justify-between">
                                <Input
                                    placeholder="Nome da empresa *"
                                    className="h-12 border-slate-200 px-4 text-sm font-semibold text-slate-600 placeholder:text-slate-400 bg-white"
                                    style={{ borderRadius: '8px' }}
                                    required
                                    value={companyName}
                                    onChange={(e) => setCompanyName(e.target.value)}
                                />

                                <Input
                                    placeholder="Actividade Principal *"
                                    className="h-12 border-slate-200 px-4 text-sm font-semibold text-slate-600 placeholder:text-slate-400 bg-white"
                                    style={{ borderRadius: '8px' }}
                                    value={activity}
                                    onChange={(e) => setActivity(e.target.value)}
                                />

                                <div className="grid grid-cols-2 gap-[10px]">
                                    <Select value={sector} onValueChange={setSector}>
                                        <SelectTrigger className="w-full h-12 border-slate-200 bg-white text-slate-600 font-semibold p-4!" style={{ borderRadius: '8px' }}>
                                            <SelectValue placeholder="Sector de Actuação" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {fetchedCategories.map((cat: string) => (
                                                <SelectItem key={cat} value={cat}>
                                                    {cat}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>

                                    <Select value={province} onValueChange={setProvince}>
                                        <SelectTrigger className="w-full h-12 border-slate-200 bg-white text-slate-600 font-semibold p-4!" style={{ borderRadius: '8px' }}>
                                            <SelectValue placeholder="Província *" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Cabo Delgado">Cabo Delgado</SelectItem>
                                            <SelectItem value="Niassa">Niassa</SelectItem>
                                            <SelectItem value="Nampula">Nampula</SelectItem>
                                            <SelectItem value="Zambézia">Zambézia</SelectItem>
                                            <SelectItem value="Tete">Tete</SelectItem>
                                            <SelectItem value="Manica">Manica</SelectItem>
                                            <SelectItem value="Sofala">Sofala</SelectItem>
                                            <SelectItem value="Inhambane">Inhambane</SelectItem>
                                            <SelectItem value="Gaza">Gaza</SelectItem>
                                            <SelectItem value="Maputo Província">Maputo Província</SelectItem>
                                            <SelectItem value="Maputo Cidade">Maputo Cidade</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>


                        <div className="grid grid-cols-1 md:grid-cols-2 gap-[10px]">
                            <Input
                                placeholder="Nome do Representante"
                                className="h-12 border-slate-200 px-4 text-sm font-semibold text-slate-600 placeholder:text-slate-400 bg-white"
                                style={{ borderRadius: '8px' }}
                                value={representative}
                                onChange={(e) => setRepresentative(e.target.value)}
                            />
                            <Input
                                placeholder="Contacto"
                                className="h-12 border-slate-200 px-4 text-sm font-semibold text-slate-600 placeholder:text-slate-400 bg-white"
                                style={{ borderRadius: '8px' }}
                                value={contact}
                                onChange={(e) => setContact(e.target.value)}
                            />
                        </div>

                        <Input
                            placeholder="Endereço físico *"
                            className="h-12 border-slate-200 px-4 text-sm font-semibold text-slate-600 placeholder:text-slate-400 bg-white"
                            style={{ borderRadius: '8px' }}
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                        />

                        <RichTextEditor
                            value={bio}
                            onChange={setBio}
                            placeholder="Descrição Geral"
                            className="min-h-[150px]"
                        />



                    </div>




                    <div className="pt-6 flex justify-start">
                        <Button
                            onClick={handleSave}
                            disabled={isSubmitting}
                            className="w-auto px-8 h-10 bg-emerald-600 hover:bg-[#f97316] text-white font-black uppercase tracking-[0.2em] shadow-xl shadow-emerald-500/20 transition-colors duration-300 disabled:opacity-50"
                            style={{ borderRadius: '8px' }}
                        >
                            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                            {isSubmitting ? "Salvando..." : "Salvar"}
                        </Button>
                    </div>
                </main>

                {/* SIDEBAR (RIGHT) - Continues to the top */}
                <aside
                    className="w-full lg:w-[420px] pb-8 pt-0 px-0 shrink-0 sticky right-0 overflow-y-auto space-y-8"
                    style={{ top: '80px', height: 'calc(100vh - 80px)' }}
                >
                    {/* SERVIÇOS - Refactored to single field + list */}
                    <div
                        className="bg-white p-6 border border-slate-200 shadow-sm"
                        style={{ borderRadius: '15px' }}
                    >
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
                                    onChange={(e) => setNewService(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && addService()}
                                    placeholder="Adicionar um serviço..."
                                    className="flex-1 h-10 border-slate-200 text-xs bg-slate-50 font-bold placeholder:text-slate-400 cursor-not-allowed"
                                    style={{ borderRadius: '8px' }}
                                    disabled
                                />
                                <Button
                                    onClick={addService}
                                    size="sm"
                                    className="bg-emerald-600/50 text-white font-bold h-10 w-10 flex items-center justify-center cursor-not-allowed"
                                    style={{ borderRadius: '8px' }}
                                    disabled
                                >
                                    <Plus className="w-4 h-4" />
                                </Button>
                            </div>

                            <div className="flex flex-wrap gap-2 pt-2">
                                {services.length > 0 ? (
                                    services.map((service, index) => (
                                        <div
                                            key={index}
                                            className="h-9 px-4 bg-emerald-50 text-emerald-700 flex items-center gap-2 border border-emerald-100 group animate-in zoom-in-95 duration-200"
                                            style={{ borderRadius: '8px' }}
                                        >
                                            <span className="text-[10px] font-black uppercase tracking-tighter">{service}</span>
                                            <button
                                                onClick={() => removeService(service)}
                                                className="hover:text-rose-500 transition-colors"
                                            >
                                                <X className="w-3 h-3" />
                                            </button>
                                        </div>
                                    ))
                                ) : (
                                    <div className="w-full py-4 text-center border border-dashed border-slate-200" style={{ borderRadius: '8px' }}>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Nenhum serviço adicionado</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* HIGHLIGHT OPTION */}
                    <div
                        className="bg-emerald-900 p-6 border border-emerald-800 shadow-sm relative overflow-hidden group cursor-pointer transition-all duration-300"
                        style={{ borderRadius: '15px' }}
                        onClick={() => setHighlightCompany(!highlightCompany)}
                    >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl -mr-8 -mt-8"></div>
                        <div className="relative z-10 flex items-center justify-between">
                            <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
                                <span className={`w-2 h-2 rounded-full ${highlightCompany ? 'bg-emerald-400 animate-pulse' : 'bg-slate-600'}`}></span>
                                Destacar Empresa
                            </h3>
                            <div className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 ${highlightCompany ? 'bg-emerald-500' : 'bg-emerald-950 border border-emerald-700'}`}>
                                <div className={`w-4 h-4 rounded-full bg-white shadow-sm transform transition-transform duration-300 ${highlightCompany ? 'translate-x-6' : 'translate-x-0'}`}></div>
                            </div>
                        </div>
                        <p className="text-xs text-green-400 mt-3 font-medium leading-relaxed">
                            Aumente a visibilidade da sua empresa aparecendo em destaque na página inicial e nos motores de google!
                        </p>

                        {/* SLIDING PAYMENT SECTION */}
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
                                            onClick={(e) => { e.stopPropagation(); setSelectedPaymentMethod('mpesa'); }}
                                            className={`bg-white p-0 rounded-md border flex items-center justify-center h-8 w-[50px] transition-all cursor-pointer group/mpesa overflow-hidden relative ${selectedPaymentMethod === 'mpesa' ? 'border-[#E60000] ring-2 ring-[#E60000]/30' : 'border-slate-200 hover:border-[#E60000]'}`}
                                        >
                                            <Image
                                                src="/assets/Mpesa.png"
                                                alt="M-Pesa"
                                                fill
                                                className="object-cover"
                                            />
                                        </div>

                                        {/* Visa / Banco (Manual Transfer) */}
                                        <div
                                            onClick={(e) => { e.stopPropagation(); setSelectedPaymentMethod('visa'); }}
                                            className={`bg-white px-2 py-1 rounded-md border flex items-center justify-center h-8 transition-all cursor-pointer group/visa overflow-hidden ${selectedPaymentMethod === 'visa' ? 'border-[#1A1F71] ring-2 ring-[#1A1F71]/30' : 'border-slate-200 hover:border-[#1A1F71]'}`}
                                        >
                                            <Image
                                                src="/assets/Visa.webp"
                                                alt="Visa"
                                                width={50}
                                                height={25}
                                                className="h-full w-auto object-contain"
                                            />
                                        </div>
                                    </div>

                                    {/* M-Pesa Phone Input */}
                                    {selectedPaymentMethod === 'mpesa' && (
                                        <div className="bg-emerald-950/30 p-3 rounded-lg border border-emerald-500/10 space-y-3 animate-in fade-in slide-in-from-top-2">
                                            <div className="space-y-1">
                                                <label className="text-[10px] font-bold text-emerald-200 uppercase tracking-wider">
                                                    Número Vodacom
                                                </label>
                                                <Input
                                                    placeholder="258 84/85 xxx xxxx"
                                                    value={paymentPhoneNumber}
                                                    onChange={(e) => setPaymentPhoneNumber(e.target.value)}
                                                    onClick={(e) => e.stopPropagation()}
                                                    className="h-9 bg-emerald-900/50 border-emerald-800 text-white placeholder:text-emerald-600 text-xs font-mono"
                                                />
                                            </div>
                                            <Button
                                                size="sm"
                                                disabled={isSubmitting}
                                                onClick={async (e) => {
                                                    e.stopPropagation();

                                                    // Basic validation
                                                    if (paymentPhoneNumber.length < 9) {
                                                        alert("Por favor, insira um número de telefone válido.");
                                                        return;
                                                    }

                                                    setIsSubmitting(true);

                                                    try {
                                                        const res = await fetch('/api/payment/mpesa', {
                                                            method: 'POST',
                                                            headers: { 'Content-Type': 'application/json' },
                                                            body: JSON.stringify({
                                                                phoneNumber: paymentPhoneNumber.startsWith('258') ? paymentPhoneNumber : `258${paymentPhoneNumber}`,
                                                                amount: '1500',
                                                                reference: `REG_${Math.random().toString(36).substring(2, 6).toUpperCase()}_${Date.now()}`
                                                            })
                                                        });

                                                        const data = await res.json();

                                                        if (data.success) {
                                                            alert(`Pedido enviado! Verifique o seu telemóvel (${paymentPhoneNumber}) e insira o PIN do M-Pesa.`);
                                                        } else {
                                                            alert(data.message || "Erro ao processar pagamento. Tente novamente.");
                                                        }
                                                    } catch (err) {
                                                        console.error(err);
                                                        alert("Erro de conexão. Verifique sua internet.");
                                                    } finally {
                                                        setIsSubmitting(false);
                                                    }
                                                }}
                                                className="w-full h-8 text-xs font-black uppercase text-white bg-[#E60000] hover:bg-[#cc0000] hover:text-white"
                                            >
                                                {isSubmitting ? 'Processando...' : 'Pagar 1 500 Mt'}
                                            </Button>
                                        </div>
                                    )}

                                    {/* Visa / Bank Transfer Details */}
                                    {selectedPaymentMethod === 'visa' && (
                                        <div className="bg-emerald-950/30 p-3 rounded-lg border border-emerald-500/10 animate-in fade-in slide-in-from-top-2 space-y-3">
                                            <p className="text-[10px] text-emerald-200 text-center font-bold uppercase tracking-wider mb-2">
                                                Dados para Transferência (Moza Banco)
                                            </p>
                                            <div className="text-xs text-emerald-100 bg-emerald-900/40 p-2 rounded border border-emerald-500/20 space-y-1 font-mono">
                                                <div className="flex justify-between">
                                                    <span className="text-emerald-400">Banco:</span>
                                                    <span>Moza Banco</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-emerald-400">NIB:</span>
                                                    <span className="select-all">003400000544672210195</span>
                                                </div>
                                                <div className="flex justify-between items-center pt-1 border-t border-emerald-500/10 mt-1">
                                                    <span className="text-emerald-400">Titular:</span>
                                                    <span>Visual Design</span>
                                                </div>
                                            </div>

                                            <Button
                                                size="sm"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    // Construct dynamic message
                                                    const message = `Olá, envio comprovativo de 1.500MT referente ao pagamento do destaque/plano da empresa *${companyName || "[Nome da Empresa]"}*.`;
                                                    const encodedMessage = encodeURIComponent(message);
                                                    window.open(`https://wa.me/258877575288?text=${encodedMessage}`, "_blank");
                                                }}
                                                className="w-full h-8 text-xs font-black uppercase text-white bg-[#25D366] hover:bg-[#1ebd59] flex items-center justify-center gap-2"
                                            >
                                                <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                                                    <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-2.846-.828-.927-.382-1.545-1.3-1.666-1.473-.12-.171-.397-.534-.403-.603-.099-.54.275-.826.47-.798.156.022.253.111.366.191.246.168.21.05.353.454.12.35.082.602-.016.793-.11.21-.262.31-.476.438-.344.184-1.127.674-1.17.653-.027-.013-.372-.444-.453-.556-.098-.135-.078-.292-.012-.423.1-.197.636-.59.715-.656.095-.081.259-.153.414-.158.125-.005.336-.007.493-.007.157 0 .341.055.518.254.178.199.646.619.646 1.509 0 .89.467 1.493.645 1.701zm-3.392-9.416c-4.966 0-9.006 4.04-9.006 9.007 0 1.948.517 3.738 1.424 5.289l-1.365 4.983 5.093-1.337c1.474.805 3.167 1.282 4.954 1.284 4.965 0 9.006-4.041 9.006-9.007.001-4.967-4.04-9.006-9.016-9.219z" />
                                                </svg>
                                                Enviar Comprovativo
                                            </Button>
                                        </div>
                                    )}

                                    {/* M-Pesa Info */}
                                    {selectedPaymentMethod === 'mpesa' && (
                                        <div className="bg-emerald-950/30 p-3 rounded-lg border border-emerald-500/10 space-y-2 animate-in fade-in slide-in-from-top-2">
                                            <p className="text-[10px] text-emerald-200 text-center uppercase tracking-wider font-bold">
                                                Instruções M-Pesa
                                            </p>
                                            <div className="text-[10px] text-white/50 bg-emerald-900/40 p-2 rounded border border-emerald-500/20 space-y-1">
                                                <p>1. Insira o seu número Vodacom abaixo</p>
                                                <p>2. Clique em "Pagar 1 500 Mt"</p>
                                                <p>3. Autorize o pagamento no seu telemóvel</p>
                                            </div>
                                        </div>
                                    )}


                                    {/* Visa Info */}
                                    {selectedPaymentMethod === 'visa' && (
                                        <div className="bg-emerald-950/30 p-3 rounded-lg border border-emerald-500/10 animate-in fade-in slide-in-from-top-2">
                                            <p className="text-[10px] text-emerald-200 text-center">
                                                Em breve: Redirecionamento seguro para gateway Visa/Mastercard.
                                            </p>
                                        </div>
                                    )}

                                    <div className="bg-emerald-950/50 p-3 rounded-lg border border-emerald-500/20">
                                        <p className="text-[10px] text-emerald-300 leading-relaxed text-center">
                                            <span className="font-bold text-emerald-200">Nota SEO:</span> Sua empresa estará visível e indexada nos motores de busca do Google em aproximadamente <span className="text-white font-bold underline decoration-emerald-500/50">24 a 48 horas</span> após a verificação.
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
                        <DialogDescription>
                            A imagem selecionada excede o limite de 1MB.
                            Deseja que optimizemos o tamanho automaticamente?
                        </DialogDescription>
                    </DialogHeader>

                    <div className="py-4">
                        {isCompressing ? (
                            <div className="flex flex-col items-center justify-center space-y-3 py-4">
                                <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
                                <p className="text-sm font-semibold text-slate-600">A comprimir imagem... Por favor aguarde.</p>
                            </div>
                        ) : (
                            <div className="p-4 bg-orange-50 rounded-lg border border-orange-100">
                                <p className="text-xs text-orange-800 font-medium">
                                    Nota: A qualidade visual será mantida, mas o tamanho do ficheiro será reduzido para cumprir os requisitos.
                                </p>
                            </div>
                        )}
                    </div>

                    <DialogFooter>
                        {!isCompressing && (
                            <>
                                <Button variant="outline" onClick={() => setShowCompressionDialog(false)}>
                                    Cancelar
                                </Button>
                                <Button onClick={confirmCompression} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                                    Sim
                                </Button>
                            </>
                        )}
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
