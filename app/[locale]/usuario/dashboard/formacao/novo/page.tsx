"use client";

import { useRouter } from "next/navigation";
import { TrainingEditor } from "@/components/admin/TrainingEditor";
import { DashboardPageHeader } from "@/components/DashboardPageHeader";
import { toast } from "sonner";
import { ChevronLeft } from "lucide-react";

export default function NewTrainingPage() {
    const router = useRouter();

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
                    title="Cadastrar Nova Formação"
                    description="Preencha os dados abaixo para criar o seu curso."
                />
            </div>

            <div className="bg-white p-8 rounded-[15px] shadow-sm border border-slate-100">
                <TrainingEditor
                    isPage={true}
                    onClose={() => router.back()}
                    onSuccess={() => {
                        toast.success("Curso enviado para análise!");
                        router.push("/usuario/dashboard/formacao");
                    }}
                />
            </div>
        </div>
    );
}
