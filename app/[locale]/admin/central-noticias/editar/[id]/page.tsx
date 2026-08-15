"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { NewsForm } from "@/components/admin/central-noticias/NewsForm";
import { Loader2 } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";

export default function EditarNoticiaPage() {
    const { id } = useParams<{ id: string }>();
    const supabase = createClient();
    const [article, setArticle] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);

    useEffect(() => {
        const load = async () => {
            const { data, error } = await supabase.from("articles").select("*").eq("id", id).single();
            if (error || !data) {
                setNotFound(true);
            } else {
                setArticle(data);
            }
            setLoading(false);
        };
        load();
    }, [id]);

    if (loading) {
        return (
            <div className="flex justify-center py-20">
                <Spinner className="w-6 h-6 animate-spin text-[#2271b1]" />
            </div>
        );
    }

    if (notFound) {
        return <div className="text-center py-20 text-slate-500">Notícia não encontrada.</div>;
    }

    return <NewsForm initialData={article} isEdit />;
}
