"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { TrainingEditor } from "@/components/admin/TrainingEditor";
import { DashboardPageHeader } from "@/components/DashboardPageHeader";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "sonner";
import { ChevronLeft, Loader2 } from "lucide-react";

export default function EditTrainingPage() {
    const router = useRouter();
    const params = useParams();
    const [training, setTraining] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTraining = async () => {
            if (!params.id) return;

            try {
                const { data, error } = await supabase
                    .from('trainings')
                    .select('*')
                    .eq('id', params.id)
                    .single();

                if (error) throw error;
                setTraining(data);
            } catch (error: any) {
                console.error("Error fetching training:", error);
                toast.error("Não foi possível carregar os dados do curso.");
                router.push("/usuario/dashboard/formacao");
            } finally {
                setLoading(false);
            }
        };

        fetchTraining();
    }, [params.id, router]);

    if (loading) {
        return (
            <div className="h-[400px] flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
            </div>
        );
    }

    if (!training) return null;

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col gap-4">
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors w-fit"
                >
                    <ChevronLeft className="w-4 h-4" />
                    <span className="text-sm font-bold">Voltar</span>
                </button>
                <DashboardPageHeader
                    title="Editar Formação"
                    description={`Editando: ${training.title}`}
                />
            </div>

            <div className="bg-white p-8 rounded-[15px] shadow-sm border border-slate-100">
                <TrainingEditor
                    isPage={true}
                    initialData={training}
                    onClose={() => router.back()}
                    onSuccess={() => {
                        toast.success("Alterações gravadas!");
                        router.push("/usuario/dashboard/formacao");
                    }}
                />
            </div>
        </div>
    );
}
