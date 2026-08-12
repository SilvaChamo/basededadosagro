"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { User, Mail, Phone, MapPin, Camera, Save, X, Loader2, BadgeCheck, GraduationCap, Briefcase, Map, ShoppingBag, Building2, Facebook, Instagram, Linkedin, Globe, Eye, TrendingUp, Trash2, MessageSquare, Bell, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DashboardPageHeader } from "@/components/DashboardPageHeader";
import { createClient } from "@/utils/supabase/client";
import { User as SupabaseUser } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import { normalizePlanName, getPlanDisplayName, PLAN_HIERARCHY, PLAN_PRIVILEGES, PlanType, canManageProfileSharing } from "@/lib/plan-fields";
import { ChevronRight, Check } from "lucide-react";
import { SuccessModal } from "@/components/ui/SuccessModal";
import { PasswordChangeModal } from "@/components/PasswordChangeModal";
import { KeywordsManagementModal } from "@/components/KeywordsManagementModal";

export default function MinhaContaPage() {
    const supabase = createClient();
    const router = useRouter();
    const [user, setUser] = useState<SupabaseUser | null>(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [isCancelling, setIsCancelling] = useState(false); // New state for cancellation
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [successModal, setSuccessModal] = useState({ isOpen: false, title: "", description: "" });
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
    const [isKeywordsModalOpen, setIsKeywordsModalOpen] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        fullName: "",
        phone: "",
        address: "Maputo, Moçambique", // Default placeholder
        province: "",
        profession: "",
        academicLevel: "",
        avatarUrl: "",
        smsNotifications: false,
        isProfilePublic: true,
        facebookUrl: "",
        instagramUrl: "",
        linkedinUrl: "",
        websiteUrl: "",
        keywords: [] as string[],
        plan: "Gratuito" as PlanType
    });

    const [activeTab, setActiveTab] = useState<"perfil" | "notificações" | "segurança">("perfil"); // Tab state

    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                setUser(user);

                // Fetch profile data from database
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', user.id)
                    .single();

                // Fetch company data for sharing state
                const { data: company } = await supabase
                    .from('companies')
                    .select('is_public')
                    .eq('user_id', user.id)
                    .maybeSingle();

                setFormData({
                    fullName: profile?.full_name || user.user_metadata?.full_name || user.user_metadata?.name || "",
                    phone: profile?.phone || user.user_metadata?.phone || user.phone || "",
                    address: user.user_metadata?.address || "Maputo, Moçambique",
                    province: profile?.province || user.user_metadata?.province || "",
                    profession: user.user_metadata?.profession || "",
                    academicLevel: user.user_metadata?.academic_level || "",
                    avatarUrl: profile?.avatar_url || user.user_metadata?.avatar_url || user.user_metadata?.picture || "",
                    smsNotifications: (profile?.sms_notifications === null && (normalizePlanName(profile?.plan) === 'Business Vendedor' || normalizePlanName(profile?.plan) === 'Parceiro' || normalizePlanName(profile?.plan) === 'Premium')) ? true : (profile?.sms_notifications || false),
                    isProfilePublic: company?.is_public ?? true,
                    facebookUrl: profile?.facebook_url || "",
                    instagramUrl: profile?.instagram_url || "",
                    linkedinUrl: profile?.linkedin_url || "",
                    websiteUrl: profile?.website_url || "",
                    keywords: profile?.keywords || [],
                    plan: normalizePlanName(profile?.plan || user.user_metadata?.plan)
                });
            }
            setLoading(false);
        };
        getUser();
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleAvatarClick = () => {
        if (isEditing) {
            fileInputRef.current?.click();
        }
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;

        const file = e.target.files[0];
        setUploading(true);

        try {
            const fileExt = file.name.split('.').pop();
            const filePath = `${user?.id}-${Math.random()}.${fileExt}`;

            // Upload to Supabase Storage
            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            // Get Public URL
            const { data: { publicUrl } } = supabase.storage
                .from('avatars')
                .getPublicUrl(filePath);

            setFormData(prev => ({ ...prev, avatarUrl: publicUrl }));

        } catch (error) {
            console.error("Error uploading avatar:", error);
            alert("Erro ao fazer upload da foto. Verifique se o bucket 'avatars' existe e é público.");
        } finally {
            setUploading(false);
        }
    };

    const handleSave = async () => {
        if (!user) return;
        setLoading(true);

        try {
            // Update Profile in database
            const { error: profileError } = await supabase
                .from('profiles')
                .update({
                    full_name: formData.fullName,
                    phone: formData.phone,
                    province: formData.province,
                    avatar_url: formData.avatarUrl,
                    sms_notifications: formData.smsNotifications,
                    facebook_url: formData.facebookUrl,
                    instagram_url: formData.instagramUrl,
                    linkedin_url: formData.linkedinUrl,
                    website_url: formData.websiteUrl,
                    keywords: formData.keywords
                })
                .eq('id', user.id);

            if (profileError) throw profileError;

            // Also update Auth metadata for convenience
            const { error } = await supabase.auth.updateUser({
                data: {
                    full_name: formData.fullName,
                    phone: formData.phone,
                    address: formData.address,
                    province: formData.province,
                    profession: formData.profession,
                    academic_level: formData.academicLevel,
                    avatar_url: formData.avatarUrl
                }
            });

            if (error) throw error;

            // Update Company Settings (is_public)
            const { error: companyError } = await supabase
                .from('companies')
                .update({
                    is_public: formData.isProfilePublic
                })
                .eq('user_id', user.id);

            if (companyError) {
                console.error("Error updating company settings:", companyError);
                // Non-blocking error, but good to log
            }

            setSuccessModal({
                isOpen: true,
                title: "Perfil Atualizado",
                description: "As suas informações pessoais e preferências foram guardadas com sucesso."
            });

            setIsEditing(false);
            router.refresh();
        } catch (error) {
            console.error("Error updating profile:", error);
            alert("Erro ao atualizar perfil.");
        } finally {
            setLoading(false);
        }
    };

    // Account Deletion Handler
    const handleDeleteAccount = async () => {
        if (confirm("ATENÇÃO: Tem certeza que deseja cancelar sua subscrição e apagar sua conta permanentemente? Esta ação é irreversível e todos os seus dados serão perdidos.")) {
            setIsCancelling(true);
            try {
                const res = await fetch('/api/user/delete-account', {
                    method: 'POST',
                });
                const data = await res.json();

                if (data.success) {
                    alert("Sua conta foi apagada com sucesso.");
                    window.location.href = "/"; // Force hard redirect
                } else {
                    alert("Erro ao apagar conta: " + (data.error || "Erro desconhecido"));
                    setIsCancelling(false);
                }
            } catch (err) {
                console.error("Error deleting account:", err);
                alert("Erro de conexão. Tente novamente.");
                setIsCancelling(false);
            }
        }
    };

    // Helper to get display avatar
    const getAvatarSrc = () => {
        if (formData.avatarUrl) return formData.avatarUrl;
        const name = formData.fullName || user?.email || "User";
        return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&color=fff&size=256`;
    };

    if (loading && !user) {
        return <div className="p-8 text-center text-slate-500">Carregando dados...</div>;
    }


    return (
        <div className="space-y-4">
            <DashboardPageHeader
                title="Minha Conta"
                description="Gerencie suas informações pessoais e preferências."
            />

            <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] gap-6 items-start">

                {/* CARD ESQUERDA: Identidade */}
                <div className="bg-white rounded-xl py-6 px-6 border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center space-y-4">
                    <div className="group relative">
                        <div
                            className={`w-28 h-28 bg-slate-100 rounded-full flex items-center justify-center text-slate-300 relative overflow-hidden ring-4 ring-white shadow-lg ${isEditing ? 'cursor-pointer hover:opacity-90' : ''}`}
                            onClick={handleAvatarClick}
                        >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={getAvatarSrc()}
                                alt="Profile"
                                className="w-full h-full object-cover"
                            />

                            {isEditing && (
                                <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Camera className="w-8 h-8 text-white" />
                                </div>
                            )}

                            {uploading && (
                                <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10">
                                    <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
                                </div>
                            )}
                        </div>
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            accept="image/*"
                            className="hidden"
                        />
                        {isEditing && (
                            <p className="text-xs text-center mt-2 text-slate-400 font-medium">Clique na foto para alterar</p>
                        )}
                    </div>

                    <div>
                        {isEditing ? (
                            <Input
                                name="fullName"
                                value={formData.fullName}
                                onChange={handleInputChange}
                                className="text-center font-black text-xl text-slate-800"
                                placeholder="Seu Nome"
                            />
                        ) : (
                            <h2 className="text-xl font-black text-slate-800 tracking-tight">{formData.fullName || "Usuário sem Nome"}</h2>
                        )}

                        <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-100">
                            <BadgeCheck className="w-4 h-4" />
                            <span className="text-sm font-bold uppercase tracking-wide">Plano {getPlanDisplayName(formData.plan)}</span>
                        </div>

                        {!isEditing && (
                            <p className="text-slate-400 text-sm mt-4">
                                Membro desde <span className="font-medium text-slate-600">{new Date(user?.created_at || "").toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}</span>
                            </p>
                        )}
                    </div>

                    <div className="w-full pt-4 border-t border-slate-100 space-y-2">
                        <Button
                            variant={activeTab === "perfil" ? "default" : "ghost"}
                            className={`w-full justify-start font-bold text-xs uppercase tracking-wider ${activeTab === "perfil" ? "bg-slate-800 text-white" : "text-slate-500"}`}
                            onClick={() => setActiveTab("perfil")}
                        >
                            <User className="w-4 h-4 mr-2" /> Meu Perfil
                        </Button>
                        <Button
                            variant={activeTab === "notificações" ? "default" : "ghost"}
                            className={`w-full justify-start font-bold text-xs uppercase tracking-wider ${activeTab === "notificações" ? "bg-slate-800 text-white" : "text-slate-500"}`}
                            onClick={() => setActiveTab("notificações")}
                        >
                            <Bell className="w-4 h-4 mr-2" /> Notificações
                        </Button>
                        <Button
                            variant={activeTab === "segurança" ? "default" : "ghost"}
                            className={`w-full justify-start font-bold text-xs uppercase tracking-wider ${activeTab === "segurança" ? "bg-slate-800 text-white" : "text-slate-500"}`}
                            onClick={() => setActiveTab("segurança")}
                        >
                            <ShieldCheck className="w-4 h-4 mr-2" /> Segurança & Dados
                        </Button>
                    </div>
                </div>

                {/* CARD DIREITA: Dados do Usuário */}
                <div className="bg-white rounded-xl border border-slate-100 shadow-sm relative overflow-hidden flex flex-col min-h-[500px]">

                    {/* Cabeçalho do Card */}
                    <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/30">
                        <h3 className="text-2xl font-black text-slate-800 tracking-tight uppercase">
                            {activeTab === "perfil" && "Dados Pessoais"}
                            {activeTab === "notificações" && "Preferências de Alerta"}
                            {activeTab === "segurança" && "Segurança e Visibilidade"}
                        </h3>
                        <div className="flex items-center gap-2">
                            {isEditing ? (
                                <>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setIsEditing(false)}
                                        className="text-slate-500 font-bold text-[10px] uppercase tracking-widest"
                                    >
                                        Cancelar
                                    </Button>
                                    <Button
                                        size="sm"
                                        onClick={handleSave}
                                        disabled={loading || uploading}
                                        className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm font-bold text-[10px] uppercase tracking-widest"
                                    >
                                        {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3 mr-1.5" />}
                                        Salvar
                                    </Button>
                                </>
                            ) : (
                                <Button
                                    size="sm"
                                    onClick={() => setIsEditing(true)}
                                    className="bg-slate-800 text-white font-bold text-[10px] uppercase tracking-widest"
                                >
                                    Editar Definições
                                </Button>
                            )}
                        </div>
                    </div>

                    <div className="p-8 flex-1">
                        {activeTab === "perfil" && (
                            <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-10">
                                {/* Coluna Esquerda: Dados Detalhados */}
                                <div className="space-y-0 divide-y divide-slate-100 border-t border-slate-100 lg:border-t-0 lg:mt-0">
                                    {/* Nome Completo */}
                                    <div className="py-5 first:pt-0">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center shrink-0 border border-slate-100">
                                                <User className="w-5 h-5 text-emerald-600" />
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Nome Completo</p>
                                                {isEditing ? (
                                                    <Input
                                                        name="fullName"
                                                        value={formData.fullName}
                                                        onChange={handleInputChange}
                                                        className="mt-1 font-bold text-slate-800 h-10 border-slate-200"
                                                    />
                                                ) : (
                                                    <p className="text-sm font-bold text-slate-800">{formData.fullName || "Não informado"}</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Email */}
                                    <div className="py-5 first:pt-0">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center shrink-0 border border-slate-100">
                                                <Mail className="w-5 h-5 text-emerald-600" />
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Email Principal</p>
                                                <p className="text-sm font-bold text-slate-800">{user?.email}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Telefone */}
                                    <div className="py-5">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center shrink-0 border border-slate-100">
                                                <Phone className="w-5 h-5 text-emerald-600" />
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Telefone de Contacto</p>
                                                {isEditing ? (
                                                    <Input
                                                        name="phone"
                                                        value={formData.phone}
                                                        onChange={handleInputChange}
                                                        placeholder="+258..."
                                                        className="mt-1 font-bold text-slate-800 h-10 border-slate-200"
                                                    />
                                                ) : (
                                                    <p className="text-sm font-bold text-slate-800">{formData.phone || "Não informado"}</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Localização (Província) */}
                                    <div className="py-5">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center shrink-0 border border-slate-100">
                                                <MapPin className="w-5 h-5 text-emerald-600" />
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Localização (Província)</p>
                                                {isEditing ? (
                                                    <Input
                                                        name="province"
                                                        value={formData.province}
                                                        onChange={handleInputChange}
                                                        className="mt-1 font-bold text-slate-800 h-10 border-slate-200"
                                                    />
                                                ) : (
                                                    <p className="text-sm font-bold text-slate-800">{formData.province || "Não informado"}</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Morada/Endereço */}
                                    <div className="py-5">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center shrink-0 border border-slate-100">
                                                <Map className="w-5 h-5 text-emerald-600" />
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Endereço Detalhado</p>
                                                {isEditing ? (
                                                    <Input
                                                        name="address"
                                                        value={formData.address}
                                                        onChange={handleInputChange}
                                                        className="mt-1 font-bold text-slate-800 h-10 border-slate-200"
                                                    />
                                                ) : (
                                                    <p className="text-sm font-bold text-slate-800">{formData.address || "---"}</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Profissão */}
                                    <div className="py-5">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center shrink-0 border border-slate-100">
                                                <Briefcase className="w-5 h-5 text-emerald-600" />
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Profissão / Cargo</p>
                                                {isEditing ? (
                                                    <Input
                                                        name="profession"
                                                        value={formData.profession}
                                                        onChange={handleInputChange}
                                                        className="mt-1 font-bold text-slate-800 h-10 border-slate-200"
                                                    />
                                                ) : (
                                                    <p className="text-sm font-bold text-slate-800">{formData.profession || "Não especificada"}</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Nível Académico */}
                                    <div className="py-5">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center shrink-0 border border-slate-100">
                                                <GraduationCap className="w-5 h-5 text-emerald-600" />
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Grau Académico</p>
                                                {isEditing ? (
                                                    <Input
                                                        name="academicLevel"
                                                        value={formData.academicLevel}
                                                        onChange={handleInputChange}
                                                        className="mt-1 font-bold text-slate-800 h-10 border-slate-200"
                                                    />
                                                ) : (
                                                    <p className="text-sm font-bold text-slate-800">{formData.academicLevel || "Não especificado"}</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Coluna Direita: Redes Sociais e Visibilidade */}
                                <div className="space-y-6">
                                    {/* Redes Sociais */}
                                    <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 shadow-sm">
                                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-4">Presença Online</p>
                                        <div className="space-y-3">
                                            {isEditing ? (
                                                <>
                                                    <div className="flex items-center gap-2">
                                                        <Facebook className="w-4 h-4 text-blue-600 shrink-0" />
                                                        <Input
                                                            name="facebookUrl"
                                                            value={formData.facebookUrl}
                                                            onChange={handleInputChange}
                                                            placeholder="Facebook URL"
                                                            className="h-8 text-xs"
                                                        />
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Instagram className="w-4 h-4 text-pink-600 shrink-0" />
                                                        <Input
                                                            name="instagramUrl"
                                                            value={formData.instagramUrl}
                                                            onChange={handleInputChange}
                                                            placeholder="Instagram URL"
                                                            className="h-8 text-xs"
                                                        />
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Linkedin className="w-4 h-4 text-sky-600 shrink-0" />
                                                        <Input
                                                            name="linkedinUrl"
                                                            value={formData.linkedinUrl}
                                                            onChange={handleInputChange}
                                                            placeholder="LinkedIn URL"
                                                            className="h-8 text-xs"
                                                        />
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Globe className="w-4 h-4 text-slate-600 shrink-0" />
                                                        <Input
                                                            name="websiteUrl"
                                                            value={formData.websiteUrl}
                                                            onChange={handleInputChange}
                                                            placeholder="Website/Portfolio URL"
                                                            className="h-8 text-xs"
                                                        />
                                                    </div>
                                                </>
                                            ) : (
                                                <div className="grid grid-cols-2 gap-3">
                                                    <a href={formData.facebookUrl || "#"} target="_blank" rel="noopener noreferrer" className={`h-12 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-blue-600 hover:bg-slate-50 transition-all shadow-sm group ${!formData.facebookUrl && 'opacity-30 pointer-events-none'}`}>
                                                        <Facebook className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                                    </a>
                                                    <a href={formData.instagramUrl || "#"} target="_blank" rel="noopener noreferrer" className={`h-12 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-pink-600 hover:bg-slate-50 transition-all shadow-sm group ${!formData.instagramUrl && 'opacity-30 pointer-events-none'}`}>
                                                        <Instagram className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                                    </a>
                                                    <a href={formData.linkedinUrl || "#"} target="_blank" rel="noopener noreferrer" className={`h-12 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-sky-600 hover:bg-slate-50 transition-all shadow-sm group ${!formData.linkedinUrl && 'opacity-30 pointer-events-none'}`}>
                                                        <Linkedin className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                                    </a>
                                                    <a href={formData.websiteUrl || "#"} target="_blank" rel="noopener noreferrer" className={`h-12 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-slate-600 hover:bg-slate-50 transition-all shadow-sm group ${!formData.websiteUrl && 'opacity-30 pointer-events-none'}`}>
                                                        <Globe className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                                    </a>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Visibilidade do Perfil */}
                                    <div className={`p-6 rounded-2xl border shadow-sm space-y-4 ${canManageProfileSharing(formData.plan) ? 'bg-emerald-50 border-emerald-100' : 'bg-slate-50 border-slate-200 opacity-60'}`}>
                                        <div className="flex items-center gap-3">
                                            <Eye className={`w-5 h-5 ${canManageProfileSharing(formData.plan) ? 'text-emerald-600' : 'text-slate-400'}`} />
                                            <h5 className={`font-black uppercase text-xs tracking-tight ${canManageProfileSharing(formData.plan) ? 'text-emerald-900' : 'text-slate-600'}`}>Visibilidade do Perfil</h5>
                                        </div>
                                        <p className={`text-[11px] leading-relaxed font-medium ${canManageProfileSharing(formData.plan) ? 'text-emerald-700' : 'text-slate-500'}`}>
                                            {canManageProfileSharing(formData.plan)
                                                ? "Permita que a sua empresa e perfil sejam vistos publicamente no diretório e motores de busca."
                                                : "Este recurso está disponível a partir do Plano Básico. Faça upgrade para aumentar sua visibilidade."}
                                        </p>
                                        <div className="flex items-center justify-between pt-2">
                                            <span className={`text-[10px] font-bold uppercase ${canManageProfileSharing(formData.plan) ? 'text-emerald-800' : 'text-slate-500'}`}>Status do Perfil</span>
                                            <button
                                                type="button"
                                                disabled={!canManageProfileSharing(formData.plan)}
                                                onClick={() => {
                                                    if (!isEditing) {
                                                        setIsEditing(true);
                                                    }
                                                    setFormData(prev => ({ ...prev, isProfilePublic: !prev.isProfilePublic }));
                                                }}
                                                className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 ${formData.isProfilePublic && canManageProfileSharing(formData.plan) ? 'bg-emerald-600' : 'bg-slate-300'} ${canManageProfileSharing(formData.plan) ? 'cursor-pointer' : 'cursor-not-allowed'}`}
                                            >
                                                <span
                                                    className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform ${formData.isProfilePublic && canManageProfileSharing(formData.plan) ? 'translate-x-6' : 'translate-x-1'}`}
                                                />
                                            </button>
                                        </div>
                                        {!canManageProfileSharing(formData.plan) && (
                                            <Link href="/planos" className="block text-center py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-[10px] font-black uppercase rounded-lg transition-colors">
                                                Fazer Upgrade
                                            </Link>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === "notificações" && (
                            <div className="max-w-2xl mx-auto space-y-8 py-10">
                                <div className="text-center space-y-2">
                                    <div className="w-16 h-16 bg-orange-100 text-[#f97316] rounded-2xl flex items-center justify-center mx-auto mb-4">
                                        <MessageSquare className="w-8 h-8" />
                                    </div>
                                    <h4 className="text-xl font-black text-slate-800 uppercase tracking-tight">Alertas de Mercado</h4>
                                    <p className="text-sm text-slate-500">Active os alertas por SMS para ser o primeiro a saber de novas oportunidades de negócio, preços de mercado e eventos agrários.</p>
                                </div>

                                <div className="p-8 rounded-2xl bg-orange-50 border border-orange-100 flex items-center justify-between group">
                                    <div className="space-y-1">
                                        <h5 className="font-black text-orange-900 uppercase text-sm">Notificações por SMS</h5>
                                        <p className="text-xs text-orange-700 italic">Enviado para: <span className="font-bold underline">{formData.phone || "Configure o seu telefone no perfil"}</span></p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            if (!isEditing) {
                                                setIsEditing(true);
                                                alert("Pode agora ativar as notificações.");
                                            }
                                            setFormData(prev => ({ ...prev, smsNotifications: !prev.smsNotifications }));
                                        }}
                                        className={`relative inline-flex h-8 w-14 items-center rounded-full transition-all focus:outline-none ring-offset-2 ring-[#f97316] focus:ring-2 ${formData.smsNotifications ? 'bg-[#f97316]' : 'bg-slate-300'} cursor-pointer`}
                                    >
                                        <span
                                            className={`inline-block h-6 w-6 transform rounded-full bg-white shadow-md transition-transform ${formData.smsNotifications ? 'translate-x-7' : 'translate-x-1'}`}
                                        />
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="p-4 rounded-xl border border-slate-100 bg-white shadow-sm flex items-center gap-3">
                                        <div className="w-8 h-8 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center">
                                            <Mail className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-slate-800">Alertas por Email</p>
                                            <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest">Sempre Ativo</p>
                                        </div>
                                    </div>
                                    <div className="p-4 rounded-xl border border-slate-100 bg-white shadow-sm flex items-center gap-3">
                                        <div className="w-8 h-8 bg-purple-50 text-purple-600 rounded-lg flex items-center justify-center">
                                            <Bell className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-slate-800">Notificações Web</p>
                                            <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest">Sempre Ativo</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === "segurança" && (
                            <div className="space-y-8">
                                <div className="bg-slate-50 rounded-xl p-8 border border-slate-100">
                                    <div className="flex items-center gap-3 mb-6">
                                        <Eye className="w-6 h-6 text-emerald-600" />
                                        <h4 className="text-lg font-black text-slate-800 uppercase tracking-tight">Gestão de Palavras-Chave</h4>
                                    </div>
                                    <p className="text-sm text-slate-600 mb-6">Esta secção permite gerir os termos de pesquisa pelos quais a sua empresa é encontrada no diretório e optimizar a sua segurança de dados.</p>

                                    <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm space-y-4">
                                        <div className="flex items-center justify-between border-b border-slate-50 pb-4">
                                            <div>
                                                <h5 className="font-bold text-slate-800 text-sm">Palavras-chave de Visibilidade</h5>
                                                <p className="text-[11px] text-slate-500 italic">Termos que fazem o seu perfil aparecer em destaque.</p>
                                            </div>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="text-[10px] font-black uppercase tracking-widest border-slate-200"
                                                onClick={() => setIsKeywordsModalOpen(true)}
                                            >
                                                Gerir Palavras
                                            </Button>
                                        </div>

                                        <div className="flex items-center justify-between border-b border-slate-50 pb-4">
                                            <div>
                                                <h5 className="font-bold text-slate-800 text-sm">Visibilidade do Perfil</h5>
                                                <p className="text-[11px] text-slate-500 italic">Permitir que a sua empresa seja vista publicamente.</p>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    if (!isEditing) {
                                                        setIsEditing(true);
                                                    }
                                                    setFormData(prev => ({ ...prev, isProfilePublic: !prev.isProfilePublic }));
                                                }}
                                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 ${formData.isProfilePublic ? 'bg-emerald-500' : 'bg-slate-200'} cursor-pointer`}
                                            >
                                                <span
                                                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${formData.isProfilePublic ? 'translate-x-6' : 'translate-x-1'}`}
                                                />
                                            </button>
                                        </div>

                                        <div className="flex items-center justify-between border-b border-slate-50 pb-4">
                                            <div>
                                                <h5 className="font-bold text-slate-800 text-sm">Segurança da Conta</h5>
                                                <p className="text-[11px] text-slate-500 italic">Actualize a sua palavra-passe ou active MFA.</p>
                                            </div>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="text-[10px] font-black uppercase tracking-widest border-slate-200"
                                                onClick={() => setIsPasswordModalOpen(true)}
                                            >
                                                Alterar Senha
                                            </Button>
                                        </div>

                                        <div className="flex items-center justify-between text-red-600">
                                            <div>
                                                <h5 className="font-bold text-sm">Zona de Risco</h5>
                                                <p className="text-[11px] text-red-400 italic font-medium">Cancelar subscrição ou eliminar dados permanentemente.</p>
                                            </div>
                                            <button
                                                onClick={handleDeleteAccount}
                                                className="text-[10px] font-black uppercase tracking-widest hover:underline"
                                            >
                                                Eliminar Conta
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="p-6 rounded-xl border border-slate-100 bg-white shadow-sm space-y-4">
                                        <TrendingUp className="w-8 h-8 text-emerald-500" />
                                        <h5 className="font-bold text-slate-800">Métricas de Acesso</h5>
                                        <p className="text-xs text-slate-500 italic">Veja de onde vêm os seus acessos e garanta que a sua conta está segura.</p>
                                        <Button className="w-full text-[10px] font-black uppercase bg-slate-800 hover:bg-slate-900">Ver Histórico de Login</Button>
                                    </div>
                                    <div className="p-6 rounded-xl border border-slate-100 bg-white shadow-sm space-y-4">
                                        <BadgeCheck className="w-8 h-8 text-blue-500" />
                                        <h5 className="font-bold text-slate-800">Verificação de Identidade</h5>
                                        <p className="text-xs text-slate-500 italic">Aumente a sua credibilidade no mercado verificando a sua conta profissional.</p>
                                        <Button className="w-full text-[10px] font-black uppercase bg-emerald-600 hover:bg-emerald-700">Validar Documentos</Button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div >

            {/* NOVA SECÇÃO: Privilégios e Comparativo de Planos */}
            < div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden" >
                <div className="px-8 py-6 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                    <div>
                        <h3 className="text-2xl font-black text-slate-800 tracking-tight">Privilégios da Conta</h3>
                        <p className="text-sm text-slate-500">Confira o que o seu plano oferece e as vantagens de fazer um upgrade.</p>
                    </div>
                    <Link href="/planos">
                        <Button className="bg-orange-500 hover:bg-orange-600 text-white font-bold h-10 px-6 rounded-full shadow-lg shadow-orange-500/20 transition-all">
                            Ver Todos os Planos <ChevronRight className="w-4 h-4 ml-1" />
                        </Button>
                    </Link>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 divide-y lg:divide-y-0 lg:divide-x divide-slate-100">
                    {/* Plano Actual */}
                    <div className="p-8 bg-emerald-50/30">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600">
                                <BadgeCheck className="w-6 h-6" />
                            </div>
                            <div>
                                <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Plano Actual</span>
                                <h4 className="text-xl font-black text-slate-800 uppercase">{getPlanDisplayName(formData.plan)}</h4>
                            </div>
                        </div>
                        <ul className="space-y-3">
                            {PLAN_PRIVILEGES[formData.plan]?.map((privilege, idx) => (
                                <li key={idx} className="flex items-start gap-3 text-sm text-slate-700">
                                    <div className="w-5 h-5 bg-emerald-200 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                                        <Check className="w-3 h-3 text-emerald-700" />
                                    </div>
                                    <span className="font-medium leading-tight">{privilege}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Comparativo de Planos (Scroll) */}
                    <div className="lg:col-span-2 p-8">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                            {PLAN_HIERARCHY
                                .filter(p => p !== formData.plan && p !== 'Parceiro')
                                .slice(0, 4) // Show up to 4 other plans
                                .map((p, idx) => (
                                    <div key={idx} className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <h5 className="font-black text-slate-800 uppercase text-sm tracking-wider">{getPlanDisplayName(p)}</h5>
                                            <Link href="/planos" className="text-[10px] font-bold text-orange-500 hover:underline">VER DETALHES</Link>
                                        </div>
                                        <ul className="space-y-2">
                                            {PLAN_PRIVILEGES[p]?.slice(0, 3).map((priv, pIdx) => (
                                                <li key={pIdx} className="flex items-baseline gap-2 text-xs text-slate-500">
                                                    <div className="w-1.5 h-1.5 bg-slate-200 rounded-full shrink-0" />
                                                    <span>{priv}</span>
                                                </li>
                                            ))}
                                            <li className="text-[10px] text-slate-400 italic mt-1 font-medium">+ e muito mais...</li>
                                        </ul>
                                    </div>
                                ))}
                        </div>
                    </div>
                </div>
            </div >
            <SuccessModal
                isOpen={successModal.isOpen}
                onClose={() => setSuccessModal(prev => ({ ...prev, isOpen: false }))}
                title={successModal.title}
                description={successModal.description}
            />
            <PasswordChangeModal
                isOpen={isPasswordModalOpen}
                onClose={() => setIsPasswordModalOpen(false)}
            />
            <KeywordsManagementModal
                isOpen={isKeywordsModalOpen}
                onClose={() => setIsKeywordsModalOpen(false)}
                initialKeywords={formData.keywords}
                onSave={(newKeywords) => {
                    setFormData(prev => ({ ...prev, keywords: newKeywords }));
                    if (!isEditing) setIsEditing(true);
                }}
            />
        </div >
    );
}
