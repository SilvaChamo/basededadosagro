"use client";

import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { GraduationCap, BookOpen, Users, Laptop, ArrowRight, Calendar, Clock, MapPin, ChevronLeft, ChevronRight } from "lucide-react";
import { ContactCTA } from "@/components/ContactCTA";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "sonner";
import { PermissionModal } from "@/components/modals/PermissionModal";

export default function FormacaoPage() {
    const [programs, setPrograms] = useState<any[]>([]);

    const [upcomingTrainings, setUpcomingTrainings] = useState<any[]>([]);
    const [isLoadingTrainings, setIsLoadingTrainings] = useState(true);

    const [user, setUser] = useState<any>(null);
    const [userProfile, setUserProfile] = useState<any>(null);
    const [loadingProfile, setLoadingProfile] = useState(true);
    const [isPermissionModalOpen, setIsPermissionModalOpen] = useState(false);
    const [modalType, setModalType] = useState<"no-login" | "restricted-plan" | "already-allowed">("no-login");
    const router = useRouter();

    useEffect(() => {
        const fetchTrainings = async () => {
            setIsLoadingTrainings(true);
            const { data, error } = await supabase
                .from('trainings')
                .select('*')
                .is('deleted_at', null)
                .order('created_at', { ascending: false });

            if (data) {
                // Logic to separate upcoming and past
                // For now, let's assume items with an older created_at or explicitly marked are 'past'
                // We can also use the 'date' field if we parse it, but for simplicity we'll split or filter

                // Filter upcoming (not past)
                setUpcomingTrainings(data.slice(0, 10)); // Just showing a subset for upcoming

                // Populate "Programs" (Cursos Passados) area dynamically too
                const mappedPrograms = data.slice(-3).map((t: any, i: number) => {
                    const configs = [
                        { icon: Laptop, bg: "bg-blue-50", color: "text-blue-500" },
                        { icon: BookOpen, bg: "bg-emerald-50", color: "text-emerald-500" },
                        { icon: Users, bg: "bg-indigo-50", color: "text-indigo-500" }
                    ];
                    const config = configs[i % configs.length];
                    return {
                        title: t.title,
                        description: t.description?.substring(0, 100) + "...",
                        icon: config.icon,
                        iconBg: config.bg,
                        iconColor: config.color
                    };
                });
                setPrograms(mappedPrograms);
            }
            setIsLoadingTrainings(false);
        };

        fetchTrainings();
    }, []);

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
            // Se já tem permissão, leva para o dashboard
            router.push("/usuario/dashboard/formacao/novo");
        } else {
            setModalType("restricted-plan");
            setIsPermissionModalOpen(true);
        }
    };

    return (
        <main className="min-h-screen bg-slate-50 flex flex-col items-center">
            <div className="w-full">
                <PageHeader
                    title="Formação & Capacitação"
                    icon={GraduationCap}
                    backgroundImage="https://images.unsplash.com/photo-1524178232363-1fb2b075b655?q=80&w=2000&auto=format&fit=crop"
                    breadcrumbs={[
                        { label: "Início", href: "/" },
                        { label: "Serviços", href: "/servicos" },
                        { label: "Formação", href: undefined }
                    ]}
                />
            </div>

            <div className="container-site relative z-20 mt-[50px] pb-24">


                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-[35fr_65fr] gap-0">

                    {/* Left Column: Past Courses (35%) */}
                    <div className="lg:pr-[30px] flex flex-col h-full">
                        <div className="border-b border-slate-200 pb-[10px] text-left lg:-mr-[30px] lg:pr-[30px] shrink-0 relative">
                            <h3 className="text-2xl md:text-3xl font-black text-[#3a3f47]">
                                Cursos <span className="text-[#f97316]">Passados</span>
                            </h3>
                            <div className="hidden lg:block absolute right-0 bottom-0 w-[1px] h-[40px] bg-slate-200 translate-y-[-1px]"></div>
                        </div>
                        <div className="flex flex-col gap-6 pt-8 lg:-mr-[30px] lg:pr-[30px] border-r border-slate-200 flex-1">
                            {programs.map((program, i) => (
                                <div
                                    key={i}
                                    className="p-6 rounded-[15px] bg-white border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col gap-3"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`w-10 h-10 rounded-[10px] flex items-center justify-center shrink-0 ${program.iconBg}`}>
                                            <program.icon className={`h-5 w-5 ${program.iconColor}`} />
                                        </div>
                                        <h3 className="text-lg font-bold leading-tight text-[#3a3f47]">{program.title}</h3>
                                    </div>
                                    <p className="text-sm leading-relaxed text-slate-500">
                                        {program.description}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right Column: Upcoming Trainings (65%) */}
                    <div className="space-y-8 lg:pl-[30px] flex flex-col h-full">
                        <div className="border-b border-slate-200 pb-[10px] text-left lg:-ml-[30px] lg:pl-[30px] shrink-0">
                            <h3 className="text-2xl md:text-3xl font-black text-[#3a3f47]">
                                Próximas <span className="text-[#f97316]">Formações</span>
                            </h3>
                        </div>
                        <div className="flex flex-col gap-6">
                            {isLoadingTrainings ? (
                                <div className="flex justify-center py-10">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#f97316]"></div>
                                </div>
                            ) : upcomingTrainings.length === 0 ? (
                                <div className="text-center py-10 text-slate-400 font-medium bg-white rounded-xl border border-dashed border-slate-200">
                                    Nenhuma formação disponível no momento.
                                </div>
                            ) : (
                                upcomingTrainings.map((training) => {
                                    // Helper to extract day and month for the big date display
                                    const dateParts = training.date?.split(' ') || [];
                                    const dateStr = dateParts[0] || 'N/A';
                                    const yearStr = dateParts[2]?.slice(-2) || '24';

                                    return (
                                        <Link
                                            key={training.id}
                                            href={`/servicos/formacao/${training.id}`}
                                            className="flex flex-col rounded-[15px] bg-white border border-slate-200 shadow-lg shadow-slate-200/50 hover:-translate-y-1 hover:shadow-2xl transition-all duration-300 group overflow-hidden"
                                        >
                                            {/* Top Section: Date & Details */}
                                            <div className="flex flex-row flex-1 border-b border-slate-100">
                                                {/* Left Column: Date (20%) */}
                                                <div className="w-[20%] bg-slate-50 border-r border-slate-200 flex flex-col items-center justify-center p-2 text-center shrink-0">
                                                    <div className="text-[10px] md:text-sm font-bold text-slate-500 uppercase tracking-widest mb-1">
                                                        {dateStr}
                                                    </div>
                                                    <div className="w-8 h-[2px] bg-slate-200 my-1"></div>
                                                    <div className="text-[30px] md:text-[50px] leading-none font-black text-[#3a3f47] tracking-tighter">
                                                        {yearStr}
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
                                                            <span className="line-clamp-1">
                                                                <b className="text-[#3a3f47]">Formador:</b> {typeof training.instructor === 'object' ? training.instructor.name : training.instructor || 'Base Agro'}
                                                            </span>
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
                                            </div>

                                            {/* Bottom Section: Footer (Full Width) */}
                                            <div className="px-5 py-4 bg-white flex items-center justify-between border-t border-slate-50">
                                                <div className="flex items-center gap-2 text-sm font-bold text-slate-600 group-hover:text-[#f97316] transition-colors">
                                                    Leia mais detalhes sobre o curso
                                                    <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                                                </div>
                                                <span className="px-3 py-1 rounded-[7px] bg-emerald-500 text-white text-xs font-bold shadow-sm">
                                                    {(training.spots_available || training.spots_total) ? `${training.spots_available || training.spots_total} vagas` : 'Vagas limitadas'}
                                                </span>
                                            </div>
                                        </Link>
                                    );
                                })
                            )}
                        </div>

                        {/* Pagination */}
                        <div className="flex justify-start items-center gap-2 pt-8 mt-auto">
                            <button className="w-10 h-10 flex items-center justify-center rounded-lg bg-white border border-transparent text-slate-500 hover:border-[#f97316] hover:text-[#f97316] transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm">
                                <ChevronLeft className="w-5 h-5" />
                            </button>
                            <button className="w-10 h-10 flex items-center justify-center rounded-lg bg-white border border-[#f97316] text-[#f97316] font-bold shadow-sm">
                                1
                            </button>
                            <button className="w-10 h-10 flex items-center justify-center rounded-lg bg-white border border-slate-200 text-slate-600 font-medium hover:border-[#f97316] hover:text-[#f97316] transition-colors shadow-sm">
                                2
                            </button>
                            <button className="w-10 h-10 flex items-center justify-center rounded-lg bg-white border border-slate-200 text-slate-600 font-medium hover:border-[#f97316] hover:text-[#f97316] transition-colors shadow-sm">
                                3
                            </button>
                            <span className="text-slate-400 px-2">...</span>
                            <button className="w-10 h-10 flex items-center justify-center rounded-lg bg-white border border-transparent text-slate-500 hover:border-[#f97316] hover:text-[#f97316] transition-colors shadow-sm">
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* CTA Section */}
                {/* CTA Section */}
                <ContactCTA
                    title="Invista no desenvolvimento da sua equipa"
                    description="Publique a sua formação ou contacte-nos para conhecer os nossos programas personalizados de capacitação agrária."
                    buttonText="Falar com Especialistas"
                >
                    <button
                        onClick={handlePublishCourse}
                        className="inline-flex items-center justify-center gap-2 bg-white/10 backdrop-blur-md border border-white/30 text-white font-bold px-8 py-4 rounded-lg transition-all duration-300 hover:scale-105 hover:bg-white/20 sm:w-auto w-full"
                    >
                        Cadastrar Curso
                        <ArrowRight className="w-5 h-5 text-[#f97316]" />
                    </button>
                </ContactCTA>
            </div>

            <PermissionModal
                isOpen={isPermissionModalOpen}
                onClose={() => setIsPermissionModalOpen(false)}
                type={modalType}
                currentPlan={userProfile?.user_type}
            />
        </main>
    );
}
