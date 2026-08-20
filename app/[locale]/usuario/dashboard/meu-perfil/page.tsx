"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { PageHeader } from "@/components/PageHeader";
import { ProfessionalRegistrationForm } from "@/components/ProfessionalRegistrationForm";
import { ArrowLeft, Loader2, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";

export default function MeuPerfilProfissionalPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [professional, setProfessional] = useState<any>(null);
    const supabase = createClient();

    useEffect(() => {
        const loadProfile = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push("/auth/login");
                return;
            }

            const { data, error } = await supabase
                .from('professionals')
                .select('*')
                .eq('user_id', user.id)
                .maybeSingle();

            if (error) {
                console.error("Erro ao carregar perfil:", error);
                toast.error("Erro ao carregar o seu perfil.");
            } else if (!data) {
                toast.error("Perfil profissional não encontrado.");
                router.push("/usuario/dashboard");
            } else {
                setProfessional(data);
            }
            setLoading(false);
        };

        loadProfile();
    }, [supabase, router]);

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <Spinner className="h-10 w-10 animate-spin text-emerald-600" />
            </div>
        );
    }

    if (!professional) return null;

    return (
        <div className="min-h-screen bg-slate-50">
            <PageHeader
                title="Meu Perfil Profissional"
                icon={User}
                backgroundImage="https://images.unsplash.com/photo-1541888941297-8591cd6d62ed?q=80&w=2000&auto=format&fit=crop"
                breadcrumbs={[
                    { label: "Dashboard", href: "/usuario/dashboard" },
                    { label: "Meu Perfil", href: undefined }
                ]}
            />

            <main className="container-site py-12">
                <div className="max-w-4xl mx-auto space-y-8">
                    <div className="flex items-center justify-between">
                        <Link href="/usuario/dashboard">
                            <Button variant="ghost" className="gap-2 text-slate-500 hover:text-emerald-600 font-bold">
                                <ArrowLeft className="w-4 h-4" />
                                Voltar ao Dashboard
                            </Button>
                        </Link>

                        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 border border-emerald-100">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-xs font-black text-emerald-700 uppercase tracking-widest">
                                Plano Free Ativo
                            </span>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl p-2 shadow-sm border border-slate-100 overflow-hidden">
                        <div className="bg-emerald-600 p-6 text-white flex items-center gap-4">
                            <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center border-2 border-white/50 overflow-hidden">
                                {professional.photo_url ? (
                                    <img src={professional.photo_url} alt={professional.name} className="w-full h-full object-cover" />
                                ) : (
                                    <User className="w-8 h-8" />
                                )}
                            </div>
                            <div>
                                <h3 className="text-2xl font-black">{professional.name}</h3>
                                <p className="text-emerald-100 font-medium opacity-80">{professional.role || professional.profession}</p>
                            </div>
                        </div>

                        <div className="p-0">
                            <ProfessionalRegistrationForm initialData={professional} />
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
