"use client";

import Link from "next/link";
import { Users, Clock, MapPin, ArrowRight, Plus, Pencil } from "lucide-react";
import { DashboardPageHeader } from "@/components/DashboardPageHeader";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { PermissionModal } from "@/components/modals/PermissionModal";

export default function FormacaoPage() {
    const router = useRouter();
    const upcomingTrainings = [
        {
            id: "agricultura-precisao",
            title: "Agricultura de Precisão com Drones",
            dateStr: "15-17/02",
            year: "25",
            fullDate: "15-17 Fevereiro 2025",
            duration: "3 dias",
            location: "Maputo, Moçambique",
            instructor: "Eng. Carlos Matola",
            spots: "12 vagas disponíveis"
        },
        {
            id: "gestao-financeira",
            title: "Gestão Financeira para Agro-Negócios",
            dateStr: "22-23/02",
            year: "25",
            fullDate: "22-23 Fevereiro 2025",
            duration: "2 dias",
            location: "Beira, Moçambique",
            instructor: "Dra. Ana Santos",
            spots: "15 vagas disponíveis"
        },
        {
            id: "marketing-digital",
            title: "Marketing Digital para Produtos Agrícolas",
            dateStr: "01-02/03",
            year: "25",
            fullDate: "1-2 Março 2025",
            duration: "2 dias",
            location: "Nampula, Moçambique",
            instructor: "Lic. João Macamo",
            spots: "20 vagas disponíveis"
        },
        {
            id: "iot-agricultura",
            title: "IoT e Sensores na Agricultura",
            dateStr: "08-10/03",
            year: "25",
            fullDate: "8-10 Março 2025",
            duration: "3 dias",
            location: "Maputo, Moçambique",
            instructor: "Eng. Sofia Cossa",
            spots: "10 vagas disponíveis"
        }
    ];

    const [user, setUser] = useState<any>(null);
    const [userProfile, setUserProfile] = useState<any>(null);
    const [loadingProfile, setLoadingProfile] = useState(true);
    const [isPermissionModalOpen, setIsPermissionModalOpen] = useState(false);
    const [modalType, setModalType] = useState<"no-login" | "restricted-plan" | "already-allowed">("no-login");

    useEffect(() => {
        const fetchUserData = async (currentUser: any) => {
            setLoadingProfile(true);
            if (!currentUser) {
                setUser(null);
                setUserProfile(null);
                setLoadingProfile(false);
                return;
            }
            setUser(currentUser);
            const { data: profile } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', currentUser.id)
                .single();
            setUserProfile(profile);
            setLoadingProfile(false);
        };

        // Get initial user
        supabase.auth.getUser().then(({ data: { user } }: { data: { user: any } }) => fetchUserData(user));

        // Listen for changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: any, session: any) => {
            fetchUserData(session?.user ?? null);
        });

        return () => subscription.unsubscribe();
    }, []);

    const handlePublishCourse = () => {
        if (loadingProfile) {
            toast.info("Verificando permissões...");
            return;
        }

        if (!user) {
            setModalType("no-login");
            setIsPermissionModalOpen(true);
            return;
        }

        const allowedPlans = ["Premium", "Parceiro", "Business Vendedor"];
        const currentPlan = userProfile?.user_type || "Básico";

        if (allowedPlans.includes(currentPlan) || userProfile?.role === 'admin') {
            router.push("/usuario/dashboard/formacao/novo");
        } else {
            setModalType("restricted-plan");
            setIsPermissionModalOpen(true);
        }
    };

    const handleEditCourse = (training: any) => {
        router.push(`/usuario/dashboard/formacao/editar/${training.id}`);
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <DashboardPageHeader
                    title="Formação & Capacitação"
                    description="Invista no desenvolvimento da sua equipa com os nossos cursos especializados."
                />

                <Button
                    onClick={handlePublishCourse}
                    className="bg-[#f97316] hover:bg-[#ea580c] text-white font-bold h-12 px-6 rounded-xl shadow-lg shadow-orange-500/20 flex items-center gap-2 shrink-0 self-start md:self-center"
                >
                    <Plus className="w-5 h-5" />
                    Cadastrar Curso
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {upcomingTrainings.map((training) => (
                    <div
                        key={training.id}
                        className="flex flex-col rounded-[12px] bg-white border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300 group overflow-hidden"
                    >
                        {/* Top Section: Date & Details (Clickable) */}
                        <Link href={`/usuario/dashboard/formacao/${training.id}`} className="flex flex-row flex-1 border-b border-slate-100 hover:bg-slate-50 transition-colors">
                            {/* Left Column: Date (20%) */}
                            <div className="w-[120px] md:w-[20%] bg-slate-50 border-r border-slate-200 flex flex-col items-center justify-center p-2 text-center shrink-0">
                                <div className="text-xs md:text-sm font-bold text-slate-500 uppercase tracking-widest mb-1">
                                    {training.dateStr}
                                </div>
                                <div className="w-8 h-[2px] bg-slate-200 my-1"></div>
                                <div className="text-3xl md:text-[50px] leading-none font-black text-[#3a3f47] tracking-tighter">
                                    {training.year}
                                </div>
                            </div>

                            {/* Right Column: Details (80%) */}
                            <div className="flex-1 p-5 flex flex-col justify-center">
                                <h4 className="text-lg font-bold text-[#3a3f47] group-hover:text-[#f97316] transition-colors mb-2 leading-tight">
                                    {training.title}
                                </h4>
                                <div className="space-y-1.5 flex flex-col justify-center">
                                    <div className="flex items-center gap-2 text-sm text-slate-600">
                                        <Users className="w-4 h-4 text-emerald-500 shrink-0" />
                                        <span className="line-clamp-1"><b className="text-[#3a3f47]">Formador:</b> {training.instructor}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-slate-600">
                                        <MapPin className="w-4 h-4 text-emerald-500 shrink-0" />
                                        <span className="line-clamp-1"><b className="text-[#3a3f47]">Local:</b> {training.location}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-slate-600">
                                        <Clock className="w-4 h-4 text-emerald-500 shrink-0" />
                                        <span><b className="text-[#3a3f47]">Duração:</b> {training.duration}</span>
                                    </div>
                                </div>
                            </div>
                        </Link>

                        {/* Bottom Section: Footer Actions */}
                        <div className="px-5 py-4 bg-white flex items-center justify-between border-t border-slate-50">
                            <div className="flex items-center gap-4">
                                <Link href={`/usuario/dashboard/formacao/${training.id}`} className="flex items-center gap-2 text-xs md:text-sm font-bold text-slate-600 hover:text-[#f97316] transition-colors">
                                    Ver detalhes
                                    <ArrowRight className="w-4 h-4" />
                                </Link>

                                <button
                                    onClick={() => handleEditCourse(training)}
                                    className="flex items-center gap-2 text-xs md:text-sm font-bold text-emerald-600 hover:text-emerald-700 transition-colors"
                                >
                                    <Pencil className="w-3.5 h-3.5" />
                                    Editar
                                </button>
                            </div>

                            <span className="px-3 py-1 rounded-[7px] bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase tracking-wider">
                                {training.spots}
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            <PermissionModal
                isOpen={isPermissionModalOpen}
                onClose={() => setIsPermissionModalOpen(false)}
                type={modalType}
                currentPlan={userProfile?.user_type}
            />
        </div>
    );
}
