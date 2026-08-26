"use client";

import { ReactNode } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface AdminListToolbarProps {
    children: ReactNode;
    className?: string;
}

/** Barra de topo de cada página de listagem do admin (título/filtros/busca
 * de um lado, acções de gestão + Novo X + Sair do outro). Fica presa ao
 * topo durante o scroll, com a mesma altura do cabeçalho da barra lateral
 * (80px) para a linha divisória de ambos ficar à mesma altura — um único
 * componente para todas as páginas ficarem sempre visualmente idênticas,
 * em vez de cada uma repetir a mesma string de classes por sua conta. */
export function AdminListToolbar({ children, className = "" }: AdminListToolbarProps) {
    return (
        <div
            // z-40 (> z-30 da aside no desktop): a sombra da barra lateral (shadow-xl,
            // propositadamente mantida) já não pinta por cima desta barra — a fronteira
            // com a sidebar passa a ser só o border-l, uma linha simples e suave.
            // No mobile: altura automática e quebra de linha em vez de scroll
            // horizontal — cabe tudo sem forçar rolagem em nenhuma direcção.
            className={`flex flex-wrap lg:flex-nowrap items-center justify-between gap-3 lg:gap-4 bg-white border-b border-l border-slate-200 -mx-8 -mt-2 px-4 py-2 lg:px-8 lg:py-3 sticky top-0 z-40 h-auto lg:h-20 ${className}`}
        >
            {children}
        </div>
    );
}

interface AdminToolbarTitleProps {
    title: string;
    /** Nó mostrado antes do título (ex.: seta "voltar" nas subpáginas). */
    leading?: ReactNode;
    /** Nó extra mostrado logo a seguir ao título (ex.: contador "(12)"). */
    extra?: ReactNode;
    searchValue?: string;
    onSearchChange?: (value: string) => void;
    searchPlaceholder?: string;
}

/** Bloco esquerdo padrão de uma AdminListToolbar: título + busca (quando a
 * página tem lista pesquisável). A busca tem sempre a mesma largura (w-96)
 * em todas as páginas — por viver aqui, e não repetida em cada page.tsx,
 * não há risco de discrepância de tamanho entre páginas. */
export function AdminToolbarTitle({ title, leading, extra, searchValue, onSearchChange, searchPlaceholder = "Buscar..." }: AdminToolbarTitleProps) {
    return (
        <div className="flex flex-wrap lg:flex-nowrap items-center gap-4 min-w-0 lg:shrink-0">
            {leading}
            {/* m-0: neutraliza a regra global "h1 { ... mb-4 }" (globals.css) —
                sem isto o título fica com 16px de margem por baixo e a
                margem entra na centragem vertical do flex, empurrando o
                texto visualmente para cima. */}
            <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight shrink-0 leading-none m-0">{title}</h1>
            {extra}
            {onSearchChange && (
                <div className="relative w-full sm:w-96 shrink-0">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                    <Input
                        placeholder={searchPlaceholder}
                        value={searchValue}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="pl-9 h-10 bg-white border-slate-200 text-sm"
                    />
                </div>
            )}
        </div>
    );
}
