"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { usePlanPermissions } from "@/hooks/usePlanPermissions";

export function AnunciarProdutoButton() {
    const router = useRouter();
    const { plan } = usePlanPermissions();

    const handleAnunciarClick = () => {
        if (plan === 'Business Vendedor' || plan === 'Parceiro') {
            router.push('/usuario/dashboard/produtos');
        } else {
            router.push('/planos');
        }
    };

    return (
        <button
            onClick={handleAnunciarClick}
            className="px-12 py-4 bg-white text-emerald-900 rounded-md font-black uppercase text-sm tracking-widest hover:scale-105 active:scale-95 shadow-xl transition-all"
        >
            Anunciar Produto
        </button>
    );
}
