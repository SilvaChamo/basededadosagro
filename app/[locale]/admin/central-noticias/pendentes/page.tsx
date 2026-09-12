"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { Clock } from "lucide-react";
import { AdminListToolbar } from "@/components/admin/AdminListToolbar";
import { useAdminTopBar } from "@/components/admin/AdminTopBar";
import { LogoutButton } from "@/components/LogoutButton";
import { NewsCard } from "@/components/NewsCard";
import { Spinner } from "@/components/ui/spinner";
import { ConfirmationModal } from "@/components/ui/ConfirmationModal";
import { toast } from "sonner";

interface PendingItem {
    id: string;
    title: string;
    category: string | null;
    date: string | null;
    created_at: string;
    image_url: string | null;
    status: string | null;
    source: string | null;
    source_url: string | null;
}

// Mesma fonte, filtro e cartão (NewsCard) da vista "Pendentes" em
// /admin/noticias: articles_pending, a fila alimentada pelo robô de
// notícias (app/api/cron/news-fetch). O NewsCard é obrigatório aqui, não só
// estético — as imagens vêm de sites de notícias externos, e o <img> directo
// era bloqueado pelo CSP (img-src só permite domínios específicos); o
// NewsCard usa next/image, que passa pelo optimizador do próprio site
// (mesma origem) e por isso não é bloqueado.
export default function PendentesPage() {
    const supabase = createClient();
    const router = useRouter();
    const [items, setItems] = useState<PendingItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [toDiscard, setToDiscard] = useState<PendingItem | null>(null);

    const load = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from("articles_pending")
            .select("id, title, category, date, created_at, image_url, status, source, source_url")
            .order("date", { ascending: false, nullsFirst: false });
        if (!error) {
            const filtered = (data || [])
                .filter((p: PendingItem) => p.category !== "Relatório" && p.category !== "Relatórios")
                .filter((p: PendingItem) => p.status !== "archived");
            setItems(filtered);
        }
        setLoading(false);
    };

    useEffect(() => { load(); }, []);

    const handleArchive = async (item: PendingItem) => {
        const previous = [...items];
        setItems((prev) => prev.filter((p) => p.id !== item.id));
        const { error } = await supabase.from("articles_pending").update({ status: "archived" }).eq("id", item.id);
        if (error) {
            setItems(previous);
            toast.error(error.message || "Erro ao arquivar");
        } else {
            toast.success("Notícia arquivada.");
        }
    };

    const confirmDiscard = async () => {
        if (!toDiscard) return;
        try {
            const { error } = await supabase.from("articles_pending").delete().eq("id", toDiscard.id);
            if (error) throw error;
            setItems((prev) => prev.filter((p) => p.id !== toDiscard.id));
            toast.success("Notícia descartada.");
        } catch (err: any) {
            toast.error(err.message || "Erro ao descartar");
        } finally {
            setToDiscard(null);
        }
    };

    useAdminTopBar("");

    return (
        <div className="text-[#2c3338]">
            <AdminListToolbar className="flex-nowrap">
                <div className="flex items-center gap-4 shrink-0">
                    <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight shrink-0 leading-none m-0 flex items-center gap-2">
                        <Clock className="w-5 h-5 text-gray-500" /> Pendentes
                    </h1>
                    <span className="text-sm text-gray-400 shrink-0">({items.length} itens)</span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                    <LogoutButton
                        variant="outline"
                        className="h-9 px-4 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-red-600 border-slate-200"
                        showIcon
                        label="Sair"
                    />
                </div>
            </AdminListToolbar>

            <div className="pt-6">
                {loading ? (
                    <div className="flex justify-center py-20">
                        <Spinner className="h-8 w-8" />
                    </div>
                ) : items.length === 0 ? (
                    <div className="text-center py-20 text-slate-400">
                        Sem notícias pendentes de momento.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-6 items-end">
                        {items.map((item) => (
                            <NewsCard
                                key={item.id}
                                title={item.title}
                                category={item.category || "Notícia"}
                                date={item.date || item.created_at}
                                image={item.image_url || undefined}
                                slug={item.id}
                                isAdmin
                                ctaLabel="Rever e Editar"
                                onCtaClick={() => router.push(`/admin/central-noticias/novo?pendente=${item.id}`)}
                                sourceUrl={item.source_url || undefined}
                                sourceLabel={item.source ? `Fonte: ${item.source}` : undefined}
                                onArchive={() => handleArchive(item)}
                                onDelete={() => setToDiscard(item)}
                            />
                        ))}
                    </div>
                )}
            </div>

            <ConfirmationModal
                isOpen={!!toDiscard}
                onClose={() => setToDiscard(null)}
                onConfirm={confirmDiscard}
                title="Descartar Notícia Pendente"
                description={`A notícia "${toDiscard?.title}" será removida da lista de pendentes. Esta acção não pode ser desfeita.`}
                confirmLabel="Descartar"
                variant="destructive"
            />
        </div>
    );
}
