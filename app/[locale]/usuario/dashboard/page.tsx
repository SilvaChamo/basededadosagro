"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client"; // Usar o mesmo client do Login
import { PageHeader } from "@/components/PageHeader";
import { DashboardStats } from "@/components/DashboardStats";
import { DashboardKeywordsTable } from "@/components/DashboardKeywordsTable";
import { GrowthTipCard } from "@/components/GrowthTipCard";
import { GrowthNotificationBanner } from "@/components/GrowthNotificationBanner";
import { SearchCategories } from "@/components/SearchCategories";
import { VisibilityChart } from "@/components/VisibilityChart";
import { ActivePlanCard } from "@/components/ActivePlanCard";
import { Building2, ShoppingCart, Briefcase, GraduationCap, ArrowRight, LayoutDashboard, XCircle, User as UserIcon, Bell, Mail, Share2, ExternalLink, ShieldCheck, Package, MessageSquare, BarChart3, Presentation, Lock, Settings } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { UpgradeModal } from "@/components/UpgradeModal";
import { type PlanType, normalizePlanName } from "@/lib/plan-fields";
import { Switch } from "@/components/ui/switch";
import { NotificationPaymentModal } from "@/components/NotificationPaymentModal";

import { useSiteSettings } from "@/hooks/useSiteSettings";
import { usePlanPermissions } from "@/hooks/usePlanPermissions";
import { Spinner } from "@/components/ui/spinner";

// Helper to convert settings object to CSSProperties
const getStyles = (startKey: string, settings: any): React.CSSProperties => {
    const s = settings[startKey];
    if (!s) return {};
    return {
        color: s.color,
        fontSize: s.fontSize,
        lineHeight: s.lineHeight,
        padding: s.padding,
        margin: s.margin,
    };
};

export default function DashboardPage() {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [isProfessional, setIsProfessional] = useState(false);
    const [loading, setLoading] = useState(true);
    const [smsNotifications, setSmsNotifications] = useState(false);
    const [updatingSms, setUpdatingSms] = useState(false);
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

    const supabase = createClient();
    const { settings, loading: settingsLoading } = useSiteSettings();
    const { plan, canAnalytics, canManageSharing, canPresentations, canSMS, loading: permissionsLoading } = usePlanPermissions();

    const [upgradeModal, setUpgradeModal] = useState<{
        isOpen: boolean;
        fieldLabel: string;
        requiredPlan: PlanType;
    }>({
        isOpen: false,
        fieldLabel: "",
        requiredPlan: "Gratuito"
    });


    useEffect(() => {
        const checkUser = async () => {
            const { data: { user }, error } = await supabase.auth.getUser();
            if (error || !user) {
                router.push("/auth/login");
            } else {
                setUser(user);

                // Check for profile data (role, plan, etc.)
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('role, plan, sms_notifications')
                    .eq('id', user.id)
                    .single();

                if (profile) {
                    const normalizedPlan = normalizePlanName(profile.plan);
                    const isHighPlan = normalizedPlan === 'Business Vendedor' || normalizedPlan === 'Parceiro' || normalizedPlan === 'Premium';
                    const smsSetting = profile.sms_notifications === null && isHighPlan ? true : (profile.sms_notifications || false);
                    setSmsNotifications(smsSetting);

                    // Admins always have access
                    if (profile.role === 'admin') {
                        setIsAdmin(true);
                    }
                }

                // Check for professional profile
                const { data: professional } = await supabase
                    .from('professionals')
                    .select('id, status')
                    .eq('user_id', user.id)
                    .maybeSingle();

                if (professional) {
                    setIsProfessional(true);
                }
            }
            setLoading(false);
        };
        checkUser();
    }, [router, supabase]);

    if (loading || settingsLoading || permissionsLoading) return (
        <div className="flex items-center justify-center py-24">
            <Spinner className="h-12 w-12" />
        </div>
    );

    const toggleSms = async () => {
        if (!user || updatingSms) return;
        setUpdatingSms(true);
        try {
            const nextValue = !smsNotifications;
            const { error } = await supabase
                .from('profiles')
                .update({ sms_notifications: nextValue })
                .eq('id', user.id);

            if (error) throw error;
            setSmsNotifications(nextValue);
        } catch (err) {
            console.error("Error toggling SMS:", err);
        } finally {
            setUpdatingSms(false);
        }
    };

    const handleSmsToggle = async () => {
        if (!canSMS && !smsNotifications) {
            setIsPaymentModalOpen(true);
            return;
        }
        toggleSms();
    };

    const handleCardClick = (e: React.MouseEvent, href: string, isLocked: boolean, label: string, requiredPlan: PlanType = "Gratuito") => {
        if (isLocked) {
            e.preventDefault();
            setUpgradeModal({
                isOpen: true,
                fieldLabel: label,
                requiredPlan: requiredPlan
            });
        }
    };


    return (
        <div>
            <GrowthNotificationBanner />
            <div className="w-full mx-auto relative z-20">

                {/* Statistics Header & KPIs - Only if allowed */}
                {canAnalytics && (
                    <DashboardStats
                        welcomeTitle={settings['dashboard_welcome_title']?.text}
                        welcomeSubtitle={settings['dashboard_welcome_subtitle']?.text}
                        titleStyle={getStyles('dashboard_welcome_title', settings)}
                        subtitleStyle={getStyles('dashboard_welcome_subtitle', settings)}
                        cardTitleStyle={getStyles('dashboard_card_title', settings)}
                    />
                )}

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 items-start">

                    {/* LEFT COLUMN (Main Focus) */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Active Plan - ALWAYS SHOWN AT TOP OF LEFT COLUMN NOW */}
                        <ActivePlanCard />


                        {/* Keywords Table - Relocated for better visibility */}
                        {canAnalytics && (
                            <div className="space-y-4">
                                <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider flex items-center gap-2 italic">
                                    <BarChart3 className="w-4 h-4 text-emerald-500" />
                                    Performance de Palavras-chave
                                </h3>
                                <DashboardKeywordsTable />
                            </div>
                        )}

                        {/* Profile Sharing Status - Linked to Settings */}
                        {canManageSharing && (
                            <div className="bg-white rounded-[15px] p-6 border border-slate-100 shadow-sm cursor-pointer hover:border-emerald-200 transition-all group" onClick={() => router.push('/usuario/dashboard/minha-conta')}>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform">
                                            <Share2 className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-slate-800 text-sm italic">Marketing & Visibilidade</h4>
                                            <p className="text-[10px] text-slate-500 italic">Gerencie a visibilidade pública a partir das Definições</p>
                                        </div>
                                    </div>
                                    <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                                        <ShieldCheck className="w-4 h-4" />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Visibility Chart - PREMIUM Main Area */}
                        {canAnalytics && (
                            <div className="space-y-4 pt-4 border-t border-slate-50 mt-6">
                                <h4 className="font-extrabold text-slate-800 text-xs uppercase tracking-tight flex items-center gap-2 italic px-1">
                                    <BarChart3 className="w-3 h-3 text-emerald-500" />
                                    Tendência de Visibilidade (Performance)
                                </h4>
                                <VisibilityChart />
                            </div>
                        )}
                    </div>

                    {/* RIGHT COLUMN (Information & Support) */}
                    <div className="space-y-6">

                        {/* Information & Notifications Card - New Section */}
                        <div className="bg-white rounded-[15px] p-6 border border-slate-100 shadow-sm relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-3 opacity-10 pointer-events-none">
                                <Bell className="w-12 h-12 text-blue-500" />
                            </div>
                            <div className="flex items-center justify-between mb-4 relative z-10">
                                <h4 className="font-extrabold text-slate-800 text-sm uppercase tracking-tight flex items-center gap-2">
                                    <Bell className="w-4 h-4 text-blue-500" />
                                    Informações e Alertas
                                </h4>
                                <div className="flex items-center gap-2 bg-slate-50 px-2 py-1 rounded-full border border-slate-100">
                                    <span className="text-[9px] font-black uppercase text-slate-400">Alertas SMS</span>
                                    <Switch
                                        checked={smsNotifications}
                                        onCheckedChange={handleSmsToggle}
                                        disabled={updatingSms}
                                    />
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div className="flex items-start gap-3">
                                    <div className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0"></div>
                                    <div>
                                        <p className="text-xs font-bold text-slate-700">Newsletter Semanal</p>
                                        <p className="text-[10px] text-slate-500 italic">Subscrição ativa para análise de mercado.</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 flex-shrink-0"></div>
                                    <div>
                                        <p className="text-xs font-bold text-slate-700">Notificações de Eventos</p>
                                        <p className="text-[10px] text-slate-500 italic">Receba convites para webinars e feiras.</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="w-2 h-2 rounded-full bg-amber-500 mt-1.5 flex-shrink-0"></div>
                                    <div>
                                        <p className="text-xs font-bold text-slate-700">Alertas de Financiamento</p>
                                        <p className="text-[10px] text-slate-500 italic">Novas oportunidades de crédito agrário.</p>
                                    </div>
                                </div>
                            </div>
                            <div className="mt-4 pt-4 border-t border-slate-50">
                                <p className="text-[10px] text-slate-400 text-center italic">
                                    Enviado também para: <span className="font-bold text-blue-500">{user?.email}</span>
                                </p>
                            </div>
                        </div>




                        {/* Search Categories - Hidden for Free */}
                        {canAnalytics && <SearchCategories />}

                        {/* Growth Tip */}
                        <GrowthTipCard />


                    </div>
                </div>
            </div>

            <UpgradeModal
                isOpen={upgradeModal.isOpen}
                onClose={() => setUpgradeModal(prev => ({ ...prev, isOpen: false }))}
                fieldLabel={upgradeModal.fieldLabel}
                requiredPlan={upgradeModal.requiredPlan}
            />
            <NotificationPaymentModal
                isOpen={isPaymentModalOpen}
                onClose={() => setIsPaymentModalOpen(false)}
                onSuccess={() => {
                    // Force enable after successful payment simulation
                    setSmsNotifications(true);
                }}
            />
        </div >
    );
}
