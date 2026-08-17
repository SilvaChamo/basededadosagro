"use client";

import React, { useState } from "react";
import { ShoppingBag, Search, X } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { SearchSection } from "@/components/SearchSection";

/** Cabeçalho + botão flutuante de pesquisa da página Mercado. Isolado num
 * componente cliente pequeno (só isto precisa de estado no browser) para o
 * resto da página poder ser preparado no servidor. */
export function MercadoHeaderSearch() {
    const [isSearchOpen, setIsSearchOpen] = useState(false);

    return (
        <>
            <div className="relative">
                <PageHeader
                    title={<>Mercado <span className="text-[#f97316]">Agro</span></>}
                    icon={ShoppingBag}
                    backgroundImage="https://images.unsplash.com/photo-1488459716781-31db52582fe9?q=80&w=2000&auto=format&fit=crop"
                    breadcrumbs={[
                        { label: "Início", href: "/" },
                        { label: "Mercado", href: undefined }
                    ]}
                />

                {/* Botão de Pesquisa Flutuante - Alinhado à Direita do Conteúdo */}
                <div className="absolute bottom-6 w-full z-20 pointer-events-none">
                    <div className="container-site mx-auto flex justify-end">
                        <button
                            onClick={() => setIsSearchOpen(!isSearchOpen)}
                            className={`w-12 h-12 rounded-[7px] flex items-center justify-center transition-all duration-300 shadow-xl pointer-events-auto animate-in fade-in slide-in-from-bottom-8 duration-700 ${isSearchOpen
                                ? "bg-[#f97316] text-white rotate-90 border border-[#f97316]"
                                : "bg-[#22c55e] text-white hover:bg-[#f97316] hover:scale-110"
                                }`}
                        >
                            {isSearchOpen ? <X className="w-6 h-6" /> : <Search className="w-6 h-6" />}
                        </button>
                    </div>
                </div>
            </div>

            <SearchSection isOpen={isSearchOpen} withBottomBorder={true} />
        </>
    );
}
