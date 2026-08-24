"use client";

import { ReactNode } from "react";

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
            className={`flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white border-b border-slate-200 -mx-8 -mt-2 px-8 py-3 sticky top-0 z-20 lg:h-20 ${className}`}
        >
            {children}
        </div>
    );
}
