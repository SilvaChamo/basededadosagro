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
    const { plan, loading: planLoading } = usePlanPermissions();
    const [isLoading, setIsLoading] = useState(false);

    const handleRecruitClick = async () => {
        setIsLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                // Not logged in -> Redirect to company registration
                router.push('/usuario/registo-empresa');
                return;
            }

            if (planLoading) return;

            if (plan === 'Gratuito') {
                // Logged in but Free plan -> Block
                toast.error("Funcionalidade exclusiva para parceiros. Atualize seu plano para publicar vagas.");
                return;
            }

            // Logged in and Paid plan -> Redirect to employment dashboard
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
            className="px-12 py-4 bg-emerald-500 text-white rounded-md font-bold text-base transition-all shadow-lg hover:scale-105 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
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
