"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";
import {
    Trash2,
    RefreshCw,
    CheckCircle2,
    AlertCircle,
    ChevronLeft,
    Image as ImageIcon,
    Search,
    Save,
    ChevronRight,
} from "lucide-react";
import Link from "next/link";
import { ConfirmationModal } from "@/components/ui/ConfirmationModal";

const BUCKET_NAME = "public-assets";

interface NewsItem {
    id: string;
    title: string;
    image_url: string | null;
    type: string | null;
}

interface StorageFile {
    name: string;
    publicUrl: string;
}

export default function ReparacaoImagensPage() {
    const supabase = createClient();
    const [news, setNews] = useState<NewsItem[]>([]);
    const [files, setFiles] = useState<StorageFile[]>([]);
    const [loading, setLoading] = useState(true);
    const [savingId, setSavingId] = useState<string | null>(null);
    const [currentNewsIndex, setCurrentNewsIndex] = useState(0);
    const [manualFilter, setManualFilter] = useState<string | null>(null);
    const [history, setHistory] = useState<{ item: NewsItem; oldUrl: string | null; newUrl: string }[]>([]);
    const [selectedImages, setSelectedImages] = useState<Set<string>>(new Set());
    const [selectedImageToApply, setSelectedImageToApply] = useState<string | null>(null);
    const [viewingHistoryIndex, setViewingHistoryIndex] = useState<number | null>(null);
    const [globalSearchQuery, setGlobalSearchQuery] = useState("");
    const [confirmDeleteSelected, setConfirmDeleteSelected] = useState(false);

    const loadData = async () => {
        setLoading(true);
        try {
            const { data: newsData } = await supabase
                .from("articles")
                .select("id, title, image_url, type")
                .is("deleted_at", null)
                .order("date", { ascending: false });

            const res = await fetch(`/api/admin/upload-image?bucket=${BUCKET_NAME}`);
            const storageResult = await res.json();

            const needsRepair = (newsData || []).filter((n: any) => {
                if (!n.image_url) return true;
                if (n.image_url.includes("CDATA")) return true;
                return false;
            });

            setNews(needsRepair);
            setFiles(res.ok ? storageResult.files || [] : []);
        } catch (err: any) {
            toast.error("Erro ao carregar dados.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadData(); }, []);

    const extractWordFromUrl = (url: string | null) => {
        if (!url) return "";
        const cleanUrl = url.replace("<![CDATA[", "").replace("]]>", "");
        const parts = cleanUrl.split("/");
        const fileName = parts.pop() || "";
        return fileName.split(/[-._]/)[0] || "";
    };

    const getSuggestions = (title: string) => {
        if (!title && !manualFilter) return [];
        const searchTerms = manualFilter ? [manualFilter.toLowerCase()] : title.toLowerCase().split(" ").filter((w) => w.length > 3);
        return files.filter((f) => {
            const fileName = f.name.toLowerCase();
            return searchTerms.some((term) => fileName.includes(term));
        }).slice(0, 15);
    };

    const repairNews = async (newsId: string, publicUrl: string) => {
        const itemToRepair = news.find((n) => n.id === newsId);
        if (!itemToRepair) return;

        setSavingId(newsId);
        const oldUrl = itemToRepair.image_url;

        try {
            const res = await fetch("/api/admin/articles", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id: newsId, payload: { image_url: publicUrl } }),
            });
            if (!res.ok) throw new Error((await res.json()).error);

            if (viewingHistoryIndex !== null) {
                const updated = [...history];
                updated[viewingHistoryIndex].newUrl = publicUrl;
                setHistory(updated);
            } else {
                setHistory((prev) => [...prev, { item: itemToRepair, oldUrl, newUrl: publicUrl }]);
                setNews((prev) => prev.filter((n) => n.id !== newsId));
            }

            setSelectedImageToApply(null);
            setManualFilter(null);
            toast.success("Imagem associada.");
        } catch (err: any) {
            toast.error(err.message || "Erro ao guardar a imagem.");
        } finally {
            setSavingId(null);
        }
    };

    const undo = async () => {
        if (history.length === 0) return;
        const last = history[history.length - 1];
        setLoading(true);
        try {
            const res = await fetch("/api/admin/articles", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id: last.item.id, payload: { image_url: last.oldUrl } }),
            });
            if (!res.ok) throw new Error((await res.json()).error);
            setNews((prev) => [last.item, ...prev]);
            setHistory((prev) => prev.slice(0, -1));
            setViewingHistoryIndex(null);
        } catch {
            toast.error("Erro ao desfazer.");
        } finally {
            setLoading(false);
        }
    };

    const toggleSelectImage = (fileName: string) => {
        setSelectedImages((prev) => {
            const next = new Set(prev);
            next.has(fileName) ? next.delete(fileName) : next.add(fileName);
            return next;
        });
    };

    const deleteSelectedImages = async () => {
        try {
            const names = Array.from(selectedImages);
            const res = await fetch("/api/admin/upload-image", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ bucket: BUCKET_NAME, names }),
            });
            if (!res.ok) throw new Error((await res.json()).error);
            toast.success(`${names.length} imagem(ns) eliminada(s).`);
            setSelectedImages(new Set());
            await loadData();
        } catch (err: any) {
            toast.error(err.message || "Erro ao eliminar.");
        } finally {
            setConfirmDeleteSelected(false);
        }
    };

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === "z" && !e.shiftKey) {
                e.preventDefault();
                undo();
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [history]);

    const safeCurrentNewsIndex = Math.min(currentNewsIndex, Math.max(0, news.length - 1));
    const currentItem = viewingHistoryIndex !== null ? history[viewingHistoryIndex].item : news[safeCurrentNewsIndex];
    const currentImageUrl = viewingHistoryIndex !== null ? history[viewingHistoryIndex].newUrl : currentItem?.image_url;
    const suggestions = currentItem ? getSuggestions(currentItem.title) : [];

    return (
        <div className="text-[#2c3338]">
            <div className="flex items-center justify-between mb-8 flex-wrap gap-3">
                <div className="flex items-center gap-3">
                    <Link href="/admin/central-noticias" className="text-slate-400 hover:text-slate-600">
                        <ChevronLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-normal text-[#1d2327]">Reparação de Imagens</h1>
                        <p className="text-[13px] text-[#50575e]">Associe imagens da biblioteca às notícias com imagem em falta.</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={loadData}
                        disabled={loading}
                        className="flex items-center gap-2 px-3 py-2 bg-white border border-[#ccd0d4] rounded text-sm font-medium hover:bg-[#f6f7f7] transition-all disabled:opacity-50"
                    >
                        <RefreshCw className={`w-4 h-4 text-[#2271b1] ${loading ? "animate-spin" : ""}`} />
                        Atualizar
                    </button>
                    <div className="bg-white px-4 py-2 border border-[#ccd0d4] rounded text-sm font-bold">
                        {news.length} Notícias a Reparar
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 bg-white border border-[#ccd0d4] rounded-lg">
                    <RefreshCw className="w-12 h-12 text-[#2271b1] animate-spin mb-4" />
                    <p>A analisar notícias e biblioteca...</p>
                </div>
            ) : currentItem ? (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    <div className="lg:col-span-5">
                        <div className="bg-white border border-[#ccd0d4] rounded-lg shadow-sm overflow-hidden sticky top-8">
                            <div className="bg-[#f6f7f7] border-b border-[#ccd0d4] p-4 flex items-center justify-between">
                                <span className="text-xs font-bold uppercase text-[#50575e]">{currentItem.type || "Notícia"}</span>
                                <span className="text-xs text-[#50575e]">
                                    {viewingHistoryIndex !== null ? "Alterada" : `Item ${currentNewsIndex + 1} de ${news.length}`}
                                </span>
                            </div>
                            <div className="p-6">
                                <h2 className="text-xl font-bold text-[#1d2327] mb-4 leading-tight">{currentItem.title}</h2>

                                <div className="relative mb-6">
                                    <button
                                        onClick={() => {
                                            if (viewingHistoryIndex === null) setViewingHistoryIndex(history.length - 1);
                                            else setViewingHistoryIndex((prev) => (prev! > 0 ? prev! - 1 : 0));
                                        }}
                                        disabled={history.length === 0 || viewingHistoryIndex === 0}
                                        className="absolute -left-5 top-1/2 -translate-y-1/2 z-10 p-2 bg-white border border-[#ccd0d4] rounded-full shadow-lg disabled:opacity-30 hover:bg-[#f6f7f7] transition-all"
                                    >
                                        <ChevronLeft className="w-5 h-5 text-[#2271b1]" />
                                    </button>

                                    {viewingHistoryIndex !== null ? (
                                        <div className="aspect-video border rounded-lg overflow-hidden relative">
                                            <img src={currentImageUrl!} className="w-full h-full object-cover" alt="" />
                                        </div>
                                    ) : (
                                        <div className="aspect-video bg-amber-50 border-2 border-dashed border-amber-200 rounded-lg flex flex-col items-center justify-center text-amber-600 p-6 overflow-hidden">
                                            <AlertCircle className="w-10 h-10 mb-2 shrink-0" />
                                            <p className="text-sm font-bold mb-3">Imagem em Falta</p>
                                        </div>
                                    )}

                                    <button
                                        onClick={() => {
                                            if (viewingHistoryIndex === history.length - 1) setViewingHistoryIndex(null);
                                            else if (viewingHistoryIndex !== null) setViewingHistoryIndex((prev) => prev! + 1);
                                        }}
                                        disabled={viewingHistoryIndex === null}
                                        className="absolute -right-5 top-1/2 -translate-y-1/2 z-10 p-2 bg-white border border-[#ccd0d4] rounded-full shadow-lg disabled:opacity-30 hover:bg-[#f6f7f7] transition-all"
                                    >
                                        <ChevronRight className="w-5 h-5 text-[#2271b1]" />
                                    </button>
                                </div>

                                <div className="flex flex-wrap gap-2">
                                    <button
                                        onClick={() => setManualFilter(extractWordFromUrl(currentItem.image_url))}
                                        className="flex-[2] min-w-[150px] py-2.5 bg-[#2271b1] text-white text-sm font-bold rounded hover:bg-[#135e96] flex items-center justify-center gap-2 transition-all"
                                    >
                                        <Search className="w-4 h-4" />
                                        Procurar por Link
                                    </button>

                                    <button
                                        onClick={() => {
                                            setManualFilter(null);
                                            setSelectedImageToApply(null);
                                            setCurrentNewsIndex((prev) => Math.min(news.length - 1, prev + 1));
                                        }}
                                        className="flex-1 min-w-[100px] py-2.5 border border-[#ccd0d4] text-sm font-medium hover:bg-[#f6f7f7] rounded transition-all"
                                    >
                                        Pular esta
                                    </button>

                                    {selectedImageToApply && (
                                        <button
                                            onClick={() => repairNews(currentItem.id, selectedImageToApply)}
                                            disabled={savingId === currentItem.id}
                                            className="flex-[1.5] min-w-[130px] py-2.5 bg-green-600 text-white text-sm font-bold rounded hover:bg-green-700 flex items-center justify-center gap-2 shadow-md transition-all"
                                        >
                                            <Save className="w-4 h-4" />
                                            {savingId === currentItem.id ? "..." : "Salvar"}
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-7">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-bold text-[#1d2327] flex items-center gap-2">
                                <ImageIcon className="w-4 h-4 text-[#2271b1]" />
                                {manualFilter ? `Resultados para "${manualFilter}"` : "Sugestões (baseado no título)"}
                            </h3>
                            <div className="flex items-center gap-3">
                                {selectedImages.size > 0 && (
                                    <button
                                        onClick={() => setConfirmDeleteSelected(true)}
                                        className="flex items-center gap-1.5 px-3 py-1.5 bg-[#d63638] text-white text-xs font-bold rounded hover:bg-[#b32d2e] transition-colors shadow-sm"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                        Eliminar ({selectedImages.size})
                                    </button>
                                )}
                                {manualFilter && (
                                    <button onClick={() => setManualFilter(null)} className="text-xs text-[#2271b1] hover:underline">
                                        Limpar filtro
                                    </button>
                                )}
                            </div>
                        </div>

                        {suggestions.length > 0 ? (
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                {suggestions.map((file) => (
                                    <div
                                        key={file.name}
                                        className={`group relative aspect-square bg-white border rounded-lg overflow-hidden transition-all ${selectedImageToApply === file.publicUrl ? "ring-4 ring-green-500 border-green-500 scale-[0.98]" : "border-[#ccd0d4] hover:ring-4 hover:ring-[#2271b1]"}`}
                                    >
                                        <div onClick={() => setSelectedImageToApply(file.publicUrl)} className="w-full h-full cursor-pointer">
                                            <img src={file.publicUrl} className="w-full h-full object-cover" alt="" />
                                            {selectedImageToApply === file.publicUrl && (
                                                <div className="absolute inset-0 bg-green-500/10 flex items-center justify-center">
                                                    <div className="bg-green-600 text-white p-2 rounded-full shadow-lg">
                                                        <CheckCircle2 className="w-6 h-6" />
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                        <div className="absolute top-2 right-2 z-10">
                                            <input
                                                type="checkbox"
                                                checked={selectedImages.has(file.name)}
                                                onChange={(e) => { e.stopPropagation(); toggleSelectImage(file.name); }}
                                                className="w-4 h-4 rounded border-[#ccd0d4] text-[#2271b1] focus:ring-[#2271b1] cursor-pointer"
                                            />
                                        </div>
                                        <div className="absolute bottom-0 inset-x-0 p-1 bg-white/90 text-[9px] truncate font-mono pointer-events-none">
                                            {file.name}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="bg-white border border-[#ccd0d4] p-12 rounded-lg text-center">
                                <p className="text-[#50575e]">Nenhuma sugestão automática encontrada para este título — pesquise manualmente abaixo.</p>
                            </div>
                        )}

                        <div className="mt-12 pt-8 border-t border-[#ccd0d4]">
                            <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-4">
                                <h3 className="text-sm font-bold text-[#1d2327]">Biblioteca completa</h3>
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder="Pesquisa manual..."
                                        value={globalSearchQuery}
                                        onChange={(e) => setGlobalSearchQuery(e.target.value)}
                                        className="w-full md:w-64 pl-8 pr-3 py-1.5 border border-[#ccd0d4] rounded text-sm outline-none focus:border-[#2271b1] focus:ring-1 focus:ring-[#2271b1]"
                                    />
                                    <Search className="absolute left-2.5 top-2 w-3.5 h-3.5 text-[#50575e]" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                {files.filter((f) => f.name.toLowerCase().includes(globalSearchQuery.toLowerCase())).slice(0, 60).map((file) => (
                                    <div
                                        key={file.name}
                                        onClick={() => setSelectedImageToApply(file.publicUrl)}
                                        className={`relative aspect-square bg-white border rounded overflow-hidden cursor-pointer transition-all flex flex-col group ${selectedImageToApply === file.publicUrl ? "ring-4 ring-green-500 border-green-500 z-10" : "border-[#ccd0d4] hover:border-[#2271b1]"}`}
                                    >
                                        <img src={file.publicUrl} className="flex-1 w-full object-cover" alt="" />
                                        <div className="bg-white/95 p-2 border-t border-[#ccd0d4]">
                                            <p className="text-[10px] text-[#50575e] font-semibold truncate font-mono text-center">{file.name}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="bg-white border border-[#ccd0d4] p-20 rounded-lg text-center">
                    <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-[#1d2327]">Tudo Reparado!</h2>
                    <p className="text-[#50575e] mt-2">Todas as notícias têm agora imagens válidas.</p>
                    <Link href="/admin/central-noticias" className="inline-block mt-6 px-6 py-2 bg-[#2271b1] text-white rounded font-bold">
                        Voltar às Notícias
                    </Link>
                </div>
            )}

            <ConfirmationModal
                isOpen={confirmDeleteSelected}
                onClose={() => setConfirmDeleteSelected(false)}
                onConfirm={deleteSelectedImages}
                title="Eliminar Imagens"
                description={`Eliminar permanentemente ${selectedImages.size} imagem(ns) da biblioteca?`}
                confirmLabel="Eliminar"
                variant="destructive"
            />
        </div>
    );
}
