"use client";

import { createContext, useContext, useEffect, useRef, useState, ReactNode } from "react";

interface TopBarConfig {
    title: string;
    cancelLabel?: string;
    onCancel?: () => void;
    /** Botões extra (ex.: acções da página) mostrados antes do Cancelar/Sair. */
    actions?: ReactNode;
    /** Mantém o botão Sair visível ao lado do título/acções (por omissão fica escondido, como nos formulários). */
    showLogout?: boolean;
}

interface TopBarContextValue {
    config: TopBarConfig | null;
    setConfig: (config: TopBarConfig | null) => void;
}

const AdminTopBarContext = createContext<TopBarContextValue | null>(null);

export function AdminTopBarProvider({ children }: { children: ReactNode }) {
    const [config, setConfig] = useState<TopBarConfig | null>(null);
    return (
        <AdminTopBarContext.Provider value={{ config, setConfig }}>
            {children}
        </AdminTopBarContext.Provider>
    );
}

export function useAdminTopBarValue() {
    return useContext(AdminTopBarContext)?.config ?? null;
}

/** Faz uma página substituir a barra Sair por um título — com Cancelar
 * (ex.: formulários) e/ou acções extra + Sair (ex.: páginas de listagem)
 * — enquanto estiver montada. */
export function useAdminTopBar(
    title: string,
    onCancel?: () => void,
    cancelLabel = "Cancelar",
    options?: { actions?: ReactNode; showLogout?: boolean }
) {
    const ctx = useContext(AdminTopBarContext);
    const onCancelRef = useRef(onCancel);
    onCancelRef.current = onCancel;
    // `actions` é normalmente um nó JSX recriado a cada render do chamador — não pode
    // entrar na dependency array do efeito (mudaria de referência sempre, disparando o
    // efeito em loop). Guardamos a versão mais recente numa ref e só disparamos o efeito
    // quando os valores primitivos (título, cancelLabel, etc.) mudam de facto.
    const actionsRef = useRef(options?.actions);
    actionsRef.current = options?.actions;
    const showLogoutRef = useRef(options?.showLogout);
    showLogoutRef.current = options?.showLogout;

    useEffect(() => {
        if (!ctx) return;
        ctx.setConfig({
            title,
            cancelLabel,
            onCancel: onCancel ? () => onCancelRef.current?.() : undefined,
            actions: actionsRef.current,
            showLogout: showLogoutRef.current,
        });
        return () => ctx.setConfig(null);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [title, cancelLabel, !!onCancel]);
}
