"use client";

import { use } from "react";
import { PresentationEditorComponent } from "@/components/admin/PresentationEditorComponent";
import { usePlanPermissions } from "@/hooks/usePlanPermissions";
import Image from "next/image";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";

export default function UserPresentationEditorPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const { canPresentations, loading } = usePlanPermissions();

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-slate-50">
                <Spinner className="w-8 h-8 animate-spin text-emerald-600" />
            </div>
        );
    }

    if (!canPresentations) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
                <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-xl text-center border border-slate-100">
                    <div className="mx-auto w-24 h-24 relative mb-6 bg-orange-100 rounded-full flex items-center justify-center">
                        {/* Fallback icon if image fails or while loading */}
                        <span className="text-4xl">👑</span>
                    </div>
                    <h1 className="text-2xl font-black text-slate-900 mb-2">Recurso Premium</h1>
                    <p className="text-slate-500 mb-8">
                        A criação de apresentações interativas é exclusiva para planos <strong>Premium</strong> e <strong>Corporativo</strong>.
                    </p>
                    <Link
                        href="/planos"
                        className="inline-flex items-center justify-center rounded-xl text-sm font-bold bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:from-orange-600 hover:to-orange-700 h-12 px-8 w-full shadow-lg shadow-orange-500/20 transition-all uppercase tracking-wider"
                    >
                        Fazer Upgrade Agora
                    </Link>
                    <Link
                        href="/usuario/dashboard/apresentacoes"
                        className="block mt-4 text-xs font-bold text-slate-400 hover:text-slate-600"
                    >
                        Voltar
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <PresentationEditorComponent id={id} backPath="/usuario/dashboard/apresentacoes" />
    );
}
