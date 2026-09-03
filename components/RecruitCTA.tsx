"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { usePlanPermissions } from "@/hooks/usePlanPermissions";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";

export function RecruitCTA() {
    const router = useRouter();
    const supabase = createClient();
    const { plan, canJobs, loading: planLoading } = usePlanPermissions();
    const [isLoading, setIsLoading] = useState(false);

    const handleRecruitClick = async () => {
        setIsLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                // Not logged in -> Redirect to login with destination
                router.push('/auth/login?next=/usuario/dashboard/emprego');
                return;
            }

            if (planLoading) return;

            if (!canJobs) {
                // Logged in but Free/Basic plan -> Block
                toast.error("A publicação de vagas é exclusiva dos planos Premium, Business e Parceiro. Atualize seu plano.");
                router.push('/usuario/dashboard/emprego');
                return;
            }

            // Logged in and eligible plan -> Redirect to employment dashboard
            router.push('/usuario/dashboard/emprego');

        } catch (error) {
            console.error("Error checking auth:", error);
            toast.error("Ocorreu um erro. Tente novamente.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <button
            onClick={handleRecruitClick}
            disabled={isLoading || planLoading}
            className="px-8 py-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-md font-bold text-base transition-all shadow-lg hover:scale-105 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 whitespace-nowrap w-full sm:w-auto"
        >
            {isLoading ? (
                <>
                    <Spinner className="w-5 h-5 animate-spin" />
                    A processar...
                </>
            ) : (
                "Publicar Nova Vaga"
            )}
        </button>
    );
}
