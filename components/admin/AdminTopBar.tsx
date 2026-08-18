"use client";

import { createContext, useContext, useEffect, useRef, useState, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { LogoutButton } from "@/components/LogoutButton";

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

/** Barra fina acima do conteúdo de cada página admin. Sem nenhuma página a
 * chamar useAdminTopBar, mostra só o Sair — é o único sítio onde esse botão
 * existe fora do Dashboard, por isso fica sempre visível por omissão. */
export function AdminTopBar() {
    const config = useAdminTopBarValue();

    if (!config) {
        return (
            <div className="flex items-center justify-end px-8 pt-6 pb-2">
                <LogoutButton
                    variant="outline"
                    className="h-9 px-4 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-red-600 border-slate-200"
                    showIcon
                    label="Sair"
                />
            </div>
        );
    }

    // Página pediu para não mostrar nada (ex.: Dashboard, que já tem o seu
    // próprio cabeçalho) — sem título, acções nem Sair, não há barra a mostrar.
    if (!config.title && !config.actions && !config.onCancel && !config.showLogout) {
        return null;
    }

    return (
        <div className="flex items-center justify-between px-8 pt-6 pb-2 gap-4">
            <h1 className="text-lg font-black text-slate-900 truncate">{config.title}</h1>
            <div className="flex items-center gap-3 shrink-0">
                {config.actions}
                {config.onCancel && (
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={config.onCancel}
                        className="text-slate-400 hover:text-slate-600 font-bold uppercase tracking-widest text-[10px] px-4 h-9"
                    >
                        {config.cancelLabel}
                    </Button>
                )}
                {config.showLogout && (
                    <LogoutButton
                        variant="outline"
                        className="h-9 px-4 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-red-600 border-slate-200"
                        showIcon
                        label="Sair"
                    />
                )}
            </div>
        </div>
    );
}
