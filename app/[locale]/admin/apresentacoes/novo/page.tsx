"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function NewPresentationPage() {
    const router = useRouter();

    useEffect(() => {
        router.replace('/admin/apresentacoes/editor/novo');
    }, []);

    return (
        <div className="flex items-center justify-center min-h-[400px]">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
        </div>
    );
}
