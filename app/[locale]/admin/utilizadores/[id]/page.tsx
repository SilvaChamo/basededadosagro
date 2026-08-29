"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { PLAN_HIERARCHY, normalizePlanName } from "@/lib/plan-fields";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { SuccessModal } from "@/components/ui/SuccessModal";
import { Spinner } from "@/components/ui/spinner";
import {
    ChevronLeft,
    Save,
    Eye,
    EyeOff,
    User as UserIcon,
    Mail,
    Globe,
    Shield,
    Key,
    Loader2
} from "lucide-react";
import { useAdminTopBar } from "@/components/admin/AdminTopBar";

export default function EditUserPage() {
    useAdminTopBar("");
    const params = useParams();
    const userId = params.id as string;

    // Keying by userId forces a full remount when navigating between different
    // users' edit pages, preventing stale form state from a previous user
    // bleeding into the next edit (Next.js reuses the component instance
    // across dynamic-segment navigations otherwise).
    return <EditUserForm key={userId} userId={userId} />;
}

function EditUserForm({ userId }: { userId: string }) {
    const router = useRouter();

    const [loading, setLoading] = useState(true);
    const [isUpdating, setIsUpdating] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        phone: "",
        address: "",
        role: "user",
        plan: "Gratuito",
        bio: "",
        website: "",
        password: ""
    });

    const PLANS = PLAN_HIERARCHY;

    useEffect(() => {
        async function fetchUser() {
            setLoading(true);
            try {
                const response = await fetch(`/api/admin/get-user?id=${userId}`);
                const result = await response.json();
                if (!response.ok) throw new Error(result.error || "Erro ao carregar utilizador.");

                const data = result.user;
                setFormData({
                    fullName: data.full_name || "",
                    email: data.email || "",
                    phone: data.phone || "",
                    address: data.address || "",
                    role: data.role || "user",
                    plan: normalizePlanName(data.plan),
                    bio: data.bio || "",
                    website: data.website || "",
                    password: ""
                });
            } catch (error: any) {
                console.error("Error fetching user:", error);
                alert("Erro ao carregar utilizador.");
                router.push("/admin/utilizadores");
            } finally {
                setLoading(false);
            }
        }

        if (userId) fetchUser();
    }, [userId, router]);

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsUpdating(true);

        try {
            const response = await fetch('/api/admin/update-user', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: userId,
                    role: formData.role,
                    plan: formData.plan,
                    password: formData.password || undefined,
                    fullName: formData.fullName,
                    phone: formData.phone,
                    address: formData.address,
                    bio: formData.bio,
                    website: formData.website
                })
            });

            const result = await response.json();
            if (!response.ok) throw new Error(result.error || "Erro ao atualizar");

            setIsSuccessModalOpen(true);
        } catch (error: any) {
            alert(`Erro: ${error.message}`);
        } finally {
            setIsUpdating(false);
        }
    };

    if (loading) {
        return (
            <div className="h-96 flex flex-col items-center justify-center text-slate-400 gap-4">
                <Spinner className="w-8 h-8 animate-spin" />
                <p className="font-medium animate-pulse">A carregar perfil do utilizador...</p>
            </div>
        );
    }

    return (
        <div className="w-full animate-in fade-in duration-500 pb-20">
            {/* Header Area - Outside the white box */}
            <div className="flex items-center gap-4 mb-10">
                <Button
                    variant="outline"
                    size="icon"
                    onClick={() => router.push("/admin/utilizadores")}
                    className="rounded-full hover:bg-white border-slate-200 w-10 h-10 shadow-sm"
                >
                    <ChevronLeft className="w-5 h-5" />
                </Button>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight leading-none m-0 p-0">Editar Utilizador</h1>
            </div>

            <div className="bg-white rounded-[15px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 overflow-hidden w-full">
                <form onSubmit={handleUpdate} className="p-10 space-y-8">
                    {/* Informações Pessoais */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <Input
                            value={formData.email}
                            disabled
                            className="bg-slate-50 border-slate-300 text-slate-400 font-medium cursor-not-allowed h-11 px-4 rounded-[8px] text-base py-2"
                            placeholder="E-mail do utilizador (Não editável)"
                        />
                        <Input
                            value={formData.fullName}
                            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                            className="border-slate-300 bg-slate-50/50 focus:bg-white focus:border-emerald-500 font-medium h-11 px-4 rounded-[8px] text-base transition-all py-2"
                            placeholder="Nome Completo do Utilizador"
                        />
                    </div>

                    {/* Contactos e Localização */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <Input
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            className="border-slate-300 bg-slate-50/50 focus:bg-white focus:border-emerald-500 font-medium h-11 px-4 rounded-[8px] text-base transition-all py-2"
                            placeholder="Número de Celular (Ex: +258 84...)"
                        />
                        <Input
                            value={formData.website}
                            onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                            className="border-slate-300 bg-slate-50/50 focus:bg-white focus:border-emerald-500 font-medium h-11 px-4 rounded-[8px] text-base transition-all py-2"
                            placeholder="Sítio Web / Portfolio (URL)"
                        />
                        <div className="md:col-span-2">
                            <Input
                                value={formData.address}
                                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                className="border-slate-300 bg-slate-50/50 focus:bg-white focus:border-emerald-500 font-medium h-11 px-4 rounded-[8px] text-base transition-all py-2"
                                placeholder="Endereço Completo: Cidade, Bairro, Rua e número de casa"
                            />
                        </div>
                    </div>

                    {/* Sobre */}
                    <Textarea
                        value={formData.bio}
                        onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                        className="min-h-[150px] border-slate-300 bg-slate-50/50 focus:bg-white focus:border-emerald-500 font-medium px-4 py-3 rounded-[8px] text-base transition-all"
                        placeholder="Biografia ou informações adicionais sobre o utilizador..."
                    />

                    {/* Permissões e Plano */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                            <p className="text-[10px] font-black uppercase text-slate-400 ml-4 tracking-widest">Atribuir Função (Role)</p>
                            <select
                                className="w-full h-11 rounded-[8px] border border-slate-300 bg-slate-50/50 px-4 py-2 text-base font-bold focus:bg-white focus-visible:outline-none focus:ring-2 focus:ring-emerald-500 transition-all appearance-none"
                                value={formData.role}
                                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                            >
                                <option value="admin">Administrador</option>
                                <option value="editor">Editor</option>
                                <option value="contribuidor">Contribuidor</option>
                                <option value="user">Utilizador</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <p className="text-[10px] font-black uppercase text-slate-400 ml-4 tracking-widest">Plano do Utilizador</p>
                            <select
                                className="w-full h-11 rounded-[8px] border border-slate-300 bg-slate-50/50 px-4 py-2 text-base font-bold focus:bg-white focus-visible:outline-none focus:ring-2 focus:ring-emerald-500 transition-all appearance-none"
                                value={formData.plan}
                                onChange={(e) => setFormData({ ...formData, plan: e.target.value })}
                            >
                                {PLANS.map(p => <option key={p} value={p}>{p}</option>)}
                            </select>
                        </div>
                    </div>

                    {/* Segurança */}
                    <div className="relative group max-w-md">
                        <Input
                            type={showPassword ? "text" : "password"}
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            className="border-slate-300 bg-slate-50/50 focus:bg-white focus:border-[#f97316] font-medium pr-14 h-11 px-4 rounded-[8px] text-base transition-all py-2"
                            placeholder="Definir nova senha (Mantenha vazio para não alterar)"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500 transition-colors"
                        >
                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                    </div>

                    {/* Submit Area */}
                    <div className="pt-10 flex items-center justify-end gap-4 border-t border-slate-50">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => router.push("/admin/utilizadores")}
                            className="text-slate-400 hover:text-slate-600 font-bold uppercase tracking-widest text-xs px-8 h-11"
                        >
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            disabled={isUpdating}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-black h-11 px-12 rounded-[8px] shadow-xl shadow-emerald-500/10 transition-all flex items-center gap-3 uppercase tracking-widest text-xs"
                        >
                            {<Save className="w-5 h-5" />}
                            {isUpdating ? "Salvando..." : "Guardar Alterações"}
                        </Button>
                    </div>
                </form>
            </div>


            <SuccessModal
                isOpen={isSuccessModalOpen}
                onClose={() => {
                    setIsSuccessModalOpen(false);
                    router.push("/admin/utilizadores");
                }}
                description="Os dados do utilizador foram atualizados com sucesso no sistema e as alterações já estão ativas."
            />
        </div>
    );
}
