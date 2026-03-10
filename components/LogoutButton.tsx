"use client";

import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { LogOut, Loader2 } from "lucide-react";
import { useState } from "react";
import { Button } from "./ui/button";

interface LogoutButtonProps {
    variant?: "default" | "outline" | "ghost" | "destructive";
    className?: string;
    showIcon?: boolean;
    label?: string;
}

export function LogoutButton({
    variant = "outline",
    className = "",
    showIcon = true,
    label = "Terminar Sessão"
}: LogoutButtonProps) {
    const supabase = createClient();
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const handleLogout = async () => {
        setLoading(true);
        try {
            await supabase.auth.signOut();
            router.push("/auth/login");
            router.refresh();
        } catch (error) {
            console.error("Error logging out:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Button
            variant={variant}
            onClick={handleLogout}
            disabled={loading}
            className={className}
        >
            {loading ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
                showIcon && <LogOut className="w-4 h-4 mr-2" />
            )}
            {label}
        </Button>
    );
}
