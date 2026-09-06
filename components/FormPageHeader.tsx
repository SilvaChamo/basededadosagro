"use client";

import { useState, useEffect, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut, User } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import Image from "next/image";

// Cabeçalho partilhado por todos os formulários FORA dos painéis (registo/
// destaque de empresa, checkout de planos, etc.) — logótipo à esquerda,
// utilizador (avatar + nome + Sair) à direita quando há sessão. Autónomo de
// propósito: busca a sua própria sessão/perfil, para se poder colocar em
// qualquer página destas sem essa página ter de gerir nada disto.
export function FormPageHeader({ rightExtra }: { rightExtra?: ReactNode }) {
    const router = useRouter();
    const supabase = createClient();
    const [name, setName] = useState("");
    const [avatar, setAvatar] = useState("");
    const [loggedIn, setLoggedIn] = useState(false);

    useEffect(() => {
        (async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;
            setLoggedIn(true);
            const { data: profile } = await supabase
                .from("profiles")
                .select("full_name, avatar_url")
                .eq("id", user.id)
                .maybeSingle();
            setName(profile?.full_name || user.user_metadata?.full_name || user.user_metadata?.name || "");
            setAvatar(profile?.avatar_url || user.user_metadata?.avatar_url || user.user_metadata?.picture || "");
        })();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push("/auth/login");
    };

    return (
        <header className="h-16 bg-white border-b border-slate-200 shadow-sm">
            {/* Sem sessão, não há nada à direita para equilibrar o logótipo
                à esquerda — por isso centra-se na barra enquanto não há
                login. Com sessão, volta ao lugar de sempre (esquerda), já
                que a direita passa a ter o utilizador. */}
            <div className="container-site h-full relative flex items-center">
                <Link
                    href="/"
                    className={`hover:opacity-80 transition-opacity ${loggedIn ? "" : "absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"}`}
                >
                    <Image src="/Logo.png" alt="Base Agro Data Logo" width={875} height={491} className="h-10 w-auto object-contain" priority />
                </Link>
                <div className="flex items-center gap-4 ml-auto">
                    {rightExtra}
                    {loggedIn && (
                        <>
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-emerald-900 border border-emerald-700 flex items-center justify-center overflow-hidden shrink-0">
                                    {avatar ? (
                                        <img src={avatar} alt="Perfil" className="w-full h-full object-cover" />
                                    ) : (
                                        <User className="w-4 h-4 text-emerald-400" />
                                    )}
                                </div>
                                <span className="text-sm text-slate-500">
                                    Olá, <span className="font-bold text-slate-700">{name || "Usuário"}</span>
                                </span>
                            </div>
                            <Button
                                onClick={handleLogout}
                                variant="outline"
                                className="bg-slate-50 border-slate-200 text-slate-500 hover:bg-orange-50 hover:text-[#f97316] hover:border-orange-200 font-bold gap-2 transition-all shadow-sm"
                                style={{ borderRadius: "8px" }}
                            >
                                <LogOut className="w-4 h-4" />
                                Sair
                            </Button>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
}
