"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { NewsForm } from "@/components/admin/central-noticias/NewsForm";
import { Spinner } from "@/components/ui/spinner";

// O robô guarda o corpo da notícia como texto simples (parágrafos separados
// por linha em branco) — o editor espera HTML, por isso sem isto o texto
// entrava tudo junto, sem parágrafos nem espaçamento. Mesma lógica de
// app/[locale]/admin/noticias/page.tsx (snippetToHtml).
function snippetToHtml(snippet: string) {
    const escapeHtml = (s: string) => s
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
    return snippet
        .split(/\n\s*\n/)
        .map((p) => p.trim())
        .filter(Boolean)
        .map((p) => `<p>${escapeHtml(p)}</p>`)
        .join("");
}

function NovaNoticiaContent() {
    const supabase = createClient();
    const pendingId = useSearchParams().get("pendente");
    const [initialData, setInitialData] = useState<any>(undefined);
    const [loading, setLoading] = useState(!!pendingId);

    useEffect(() => {
        if (!pendingId) return;
        (async () => {
            const { data } = await supabase.from("articles_pending").select("*").eq("id", pendingId).single();
            if (data) {
                setInitialData({
                    title: data.title,
                    type: data.category || "Notícia",
                    content: data.snippet ? snippetToHtml(data.snippet) : "",
                    image_url: data.image_url || "",
                    source: data.source || "",
                    source_url: data.source_url || "",
                    date: data.date || new Date().toISOString().split("T")[0],
                });
            }
            setLoading(false);
        })();
    }, [pendingId]);

    if (loading) {
        return (
            <div className="flex justify-center py-20">
                <Spinner className="h-8 w-8" />
            </div>
        );
    }

    return <NewsForm isEdit={false} initialData={initialData} pendingId={pendingId || undefined} />;
}

export default function NovaNoticiaPage() {
    return (
        <Suspense fallback={<div className="flex justify-center py-20"><Spinner className="h-8 w-8" /></div>}>
            <NovaNoticiaContent />
        </Suspense>
    );
}
