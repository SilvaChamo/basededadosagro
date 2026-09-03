"use client";

import { useState } from "react";
import { Hero } from "@/components/Hero";
import { SearchSection } from "@/components/SearchSection";
import { StickyDivider } from "@/components/StickyDivider";

interface HomeHeaderSectionProps {
    stats: Record<string, any>;
}

export function HomeHeaderSection({ stats }: HomeHeaderSectionProps) {
    // Começa fechado: o motor de busca só expande quando o utilizador clica
    // no botão de pesquisa do Hero.
    const [isSearchOpen, setIsSearchOpen] = useState(false);

    return (
        <>
            <Hero
                onToggleSearch={() => setIsSearchOpen(!isSearchOpen)}
                isSearchOpen={isSearchOpen}
                stats={stats}
            />
            <StickyDivider />
            <SearchSection isOpen={isSearchOpen} />
        </>
    );
}
