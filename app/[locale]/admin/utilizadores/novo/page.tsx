"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PLAN_HIERARCHY } from "@/lib/plan-fields";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SuccessModal } from "@/components/ui/SuccessModal";
import {
    ChevronLeft,
    Save,
    Eye,
    EyeOff,
} from "lucide-react";

export default function NewUserPage() {
    const router = useRouter();

    const [isCreating, setIsCreating] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        role: "user",
        plan: "Gratuito",
        password: ""
    });

    const PLANS = PLAN_HIERARCHY;

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsCreating(true);

        try {
            const response = await fetch('/api/admin/create-user', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: formData.email,
                    role: formData.role,
                    plan: formData.plan,
                    password: formData.password || undefined,
                    fullName: formData.fullName,
                })
            });

            const result = await response.json();
            if (!response.ok) throw new Error(result.error || "Erro ao criar utilizador");

            setIsSuccessModalOpen(true);
        } catch (error: any) {
            alert(`Erro: ${error.message}`);
        } finally {
            setIsCreating(false);
        }
    };

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
                <h1 className="text-3xl font-black text-slate-900 tracking-tight leading-none m-0 p-0">Adicionar Novo Utilizador</h1>
            </div>

            <div className="bg-white rounded-[15px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 overflow-hidden w-full">
                <form onSubmit={handleCreate} className="p-10 space-y-8">
                    {/* Informações Pessoais */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <Input
                            type="email"
                            required
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="border-slate-300 bg-slate-50/50 focus:bg-white focus:border-emerald-500 font-medium h-11 px-4 rounded-[8px] text-base transition-all py-2"
                            placeholder="E-mail do utilizador"
                        />
                        <Input
                            value={formData.fullName}
                            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                            className="border-slate-300 bg-slate-50/50 focus:bg-white focus:border-emerald-500 font-medium h-11 px-4 rounded-[8px] text-base transition-all py-2"
                            placeholder="Nome Completo do Utilizador"
                        />
                    </div>

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
                            placeholder="Senha temporária (deixe vazio para gerar automaticamente)"
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
                            disabled={isCreating}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-black h-11 px-12 rounded-[8px] shadow-xl shadow-emerald-500/10 transition-all flex items-center gap-3 uppercase tracking-widest text-xs"
                        >
                            {<Save className="w-5 h-5" />}
                            {isCreating ? "A criar..." : "Criar Utilizador"}
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
                description="O novo utilizador foi criado com sucesso e já pode aceder ao sistema."
            />
        </div>
    );
}
