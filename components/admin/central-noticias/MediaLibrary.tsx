"use client";

import { useState, useEffect, useMemo } from "react";
import { toast } from "sonner";
import {
    Trash2,
    Copy,
    RefreshCw,
    ImageIcon,
    LayoutGrid,
    List as ListIcon,
    Search,
    Check,
    Pencil,
    X,
    FolderSync,
} from "lucide-react";
import { ConfirmationModal } from "@/components/ui/ConfirmationModal";

interface MediaItem {
    id: string;
    bucket: string;
    path: string;
    url: string;
    filename: string;
    size: number | null;
    mime_type: string | null;
    alt_text: string | null;
    caption: string | null;
    article_id: string | null;
    created_at: string;
}

interface MediaLibraryProps {
    onSelect?: (url: string) => void;
    isModal?: boolean;
}

export function MediaLibrary({ onSelect, isModal }: MediaLibraryProps) {
    const [files, setFiles] = useState<MediaItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [syncing, setSyncing] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [confirmBulkDelete, setConfirmBulkDelete] = useState(false);
    const [editingFile, setEditingFile] = useState<MediaItem | null>(null);
    const [editForm, setEditForm] = useState({ alt_text: "", caption: "" });
    const [savingMetadata, setSavingMetadata] = useState(false);
    // Imagens cujo <img> falhou a carregar — mostram um placeholder neutro
    // em vez do ícone partido do browser com o nome do ficheiro por cima.
    const [brokenIds, setBrokenIds] = useState<Set<string>>(new Set());

    const loadImages = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/admin/media-library?scope=noticias`);
            const result = await res.json();
            if (!res.ok) throw new Error(result.error);
            setFiles(result.files || []);
        } catch (err: any) {
            toast.error(err.message || "Erro ao carregar a galeria.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadImages(); }, []);

    const syncFromNews = async () => {
        setSyncing(true);
        try {
            const res = await fetch("/api/admin/media-library/backfill", { method: "POST" });
            const result = await res.json();
            if (!res.ok) throw new Error(result.error);
            toast.success(result.inserted > 0 ? `${result.inserted} imagem(ns) sincronizada(s) a partir das notícias.` : "A galeria já está actualizada.");
            await loadImages();
        } catch (err: any) {
            toast.error(err.message || "Erro ao sincronizar.");
        } finally {
            setSyncing(false);
        }
    };

    const filteredFiles = useMemo(() => {
        const query = searchQuery.toLowerCase();
        return files.filter((f) => f.filename.toLowerCase().includes(query));
    }, [files, searchQuery]);

    const toggleSelect = (id: string) => {
        const next = new Set(selectedIds);
        next.has(id) ? next.delete(id) : next.add(id);
        setSelectedIds(next);
    };

    const copyUrl = (url: string) => {
        navigator.clipboard.writeText(url);
        toast.success("Link copiado.");
    };

    const openEdit = (file: MediaItem) => {
        setEditingFile(file);
        setEditForm({ alt_text: file.alt_text || "", caption: file.caption || "" });
    };

    const saveMetadata = async () => {
        if (!editingFile) return;
        setSavingMetadata(true);
        try {
            const res = await fetch("/api/admin/media-library", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id: editingFile.id, ...editForm }),
            });
            if (!res.ok) throw new Error((await res.json()).error);
            setFiles((prev) => prev.map((f) => (f.id === editingFile.id ? { ...f, ...editForm } : f)));
            toast.success("Detalhes da imagem actualizados.");
            setEditingFile(null);
        } catch (err: any) {
            toast.error(err.message || "Erro ao guardar.");
        } finally {
            setSavingMetadata(false);
        }
    };

    const deleteSelected = async () => {
        const ids = Array.from(selectedIds);
        try {
            const res = await fetch("/api/admin/media-library", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ids }),
            });
            if (!res.ok) throw new Error((await res.json()).error);
            toast.success(`${ids.length} imagem(ns) eliminada(s).`);
            setSelectedIds(new Set());
            await loadImages();
        } catch (err: any) {
            toast.error(err.message || "Erro ao eliminar.");
        } finally {
            setConfirmBulkDelete(false);
        }
    };

    return (
        <div className="flex flex-col h-full">
            <div className="flex items-center gap-3 p-4 border-b border-[#ccd0d4] bg-white shrink-0 flex-wrap">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Pesquisar imagens..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full h-9 pl-9 pr-3 bg-white text-[#2c3338] border border-[#ccd0d4] rounded-md text-sm outline-none focus:border-[#2271b1]"
                    />
                </div>

                <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-md">
                    <button type="button" onClick={() => setViewMode("grid")} className={`p-1.5 rounded ${viewMode === "grid" ? "bg-white shadow text-[#2271b1]" : "text-slate-400"}`}>
                        <LayoutGrid className="w-4 h-4" />
                    </button>
                    <button type="button" onClick={() => setViewMode("list")} className={`p-1.5 rounded ${viewMode === "list" ? "bg-white shadow text-[#2271b1]" : "text-slate-400"}`}>
                        <ListIcon className="w-4 h-4" />
                    </button>
                </div>

                <button type="button" onClick={loadImages} className="p-2 text-slate-400 hover:text-[#2271b1]" title="Actualizar">
                    <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                </button>

                <button type="button"
                    onClick={syncFromNews}
                    disabled={syncing}
                    className="flex items-center gap-1.5 px-3 py-1.5 border border-[#2271b1] text-[#2271b1] text-sm rounded-md hover:bg-blue-50 disabled:opacity-50"
                    title="Importar imagens já usadas nas notícias existentes"
                >
                    <FolderSync className={`w-3.5 h-3.5 ${syncing ? "animate-spin" : ""}`} />
                    Sincronizar com notícias existentes
                </button>

                {selectedIds.size > 0 && (
                    <button type="button"
                        onClick={() => setConfirmBulkDelete(true)}
                        className="ml-auto flex items-center gap-1.5 px-3 py-1.5 bg-[#d63638] text-white text-sm rounded-md hover:bg-[#b32d2e]"
                    >
                        <Trash2 className="w-3.5 h-3.5" /> Eliminar ({selectedIds.size})
                    </button>
                )}
            </div>

            <div className="flex-1 overflow-y-auto p-4 bg-[#f0f0f1]">
                {loading ? (
                    <div className="flex justify-center py-20"><RefreshCw className="w-6 h-6 animate-spin text-[#2271b1]" /></div>
                ) : filteredFiles.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-slate-400 text-center">
                        <ImageIcon className="w-10 h-10 mb-2" />
                        Nenhuma imagem na galeria.
                        <button type="button" onClick={syncFromNews} className="mt-3 text-[#2271b1] text-sm hover:underline">
                            Sincronizar com notícias existentes
                        </button>
                    </div>
                ) : viewMode === "grid" ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-10 2xl:grid-cols-[repeat(14,minmax(0,1fr))] gap-2">
                        {filteredFiles.map((file) => (
                            <div
                                key={file.id}
                                className={`group relative aspect-square bg-white border overflow-hidden cursor-pointer ${selectedIds.has(file.id) ? "border-[#2271b1] ring-2 ring-[#2271b1]" : "border-[#ccd0d4]"}`}
                                onClick={() => (onSelect ? onSelect(file.url) : toggleSelect(file.id))}
                            >
                                {brokenIds.has(file.id) ? (
                                    <div className="w-full h-full flex items-center justify-center bg-slate-100">
                                        <ImageIcon className="w-6 h-6 text-slate-300" />
                                    </div>
                                ) : (
                                    <img
                                        src={file.url}
                                        className="w-full h-full object-cover"
                                        alt=""
                                        onError={() => setBrokenIds((prev) => new Set(prev).add(file.id))}
                                    />
                                )}
                                {!onSelect && (
                                    <button type="button"
                                        onClick={(e) => { e.stopPropagation(); toggleSelect(file.id); }}
                                        className={`absolute top-1.5 left-1.5 w-5 h-5 rounded-full flex items-center justify-center border ${selectedIds.has(file.id) ? "bg-[#2271b1] border-[#2271b1]" : "bg-white/80 border-slate-300 opacity-0 group-hover:opacity-100"}`}
                                    >
                                        {selectedIds.has(file.id) && <Check className="w-3 h-3 text-white" />}
                                    </button>
                                )}
                                <div className="absolute inset-x-0 bottom-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 flex justify-between items-center">
                                    <span className="text-white text-[9px] truncate">{file.filename}</span>
                                    <div className="flex items-center gap-1.5 shrink-0">
                                        {!onSelect && (
                                            <button type="button" onClick={(e) => { e.stopPropagation(); openEdit(file); }} className="text-white">
                                                <Pencil className="w-3 h-3" />
                                            </button>
                                        )}
                                        <button type="button" onClick={(e) => { e.stopPropagation(); copyUrl(file.url); }} className="text-white">
                                            <Copy className="w-3 h-3" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-white border border-[#ccd0d4] rounded-md overflow-hidden">
                        {filteredFiles.map((file) => (
                            <div
                                key={file.id}
                                className={`flex items-center gap-3 p-2.5 border-b border-[#f0f0f1] last:border-0 hover:bg-[#f6f7f7] cursor-pointer ${selectedIds.has(file.id) ? "bg-blue-50" : ""}`}
                                onClick={() => (onSelect ? onSelect(file.url) : toggleSelect(file.id))}
                            >
                                <img src={file.url} className="w-10 h-10 object-cover rounded border border-[#ccd0d4]" alt="" />
                                <span className="flex-1 text-sm text-[#2c3338] truncate">{file.filename}</span>
                                {file.size && <span className="text-xs text-slate-400">{(file.size / 1024).toFixed(0)} KB</span>}
                                {!onSelect && (
                                    <button type="button" onClick={(e) => { e.stopPropagation(); openEdit(file); }} className="p-1.5 text-slate-400 hover:text-[#2271b1]">
                                        <Pencil className="w-3.5 h-3.5" />
                                    </button>
                                )}
                                <button type="button" onClick={(e) => { e.stopPropagation(); copyUrl(file.url); }} className="p-1.5 text-slate-400 hover:text-[#2271b1]">
                                    <Copy className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {editingFile && (
                <div className="fixed inset-0 z-[400] bg-black/50 flex items-center justify-center p-4" onClick={() => setEditingFile(null)}>
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between p-4 border-b border-[#ccd0d4]">
                            <h3 className="font-semibold text-[#1d2327]">Detalhes da imagem</h3>
                            <button type="button" onClick={() => setEditingFile(null)} className="text-slate-400 hover:text-slate-600">
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="p-4 space-y-4">
                            <img src={editingFile.url} className="w-full h-40 object-cover rounded border border-[#ccd0d4]" alt="" />
                            <div>
                                <label className="block text-[12px] font-bold text-[#1d2327] mb-1">Texto alternativo (alt)</label>
                                <input
                                    type="text"
                                    value={editForm.alt_text}
                                    onChange={(e) => setEditForm({ ...editForm, alt_text: e.target.value })}
                                    className="w-full h-9 px-3 bg-white text-[#2c3338] border border-[#8c8f94] rounded text-sm outline-none focus:border-[#2271b1]"
                                />
                            </div>
                            <div>
                                <label className="block text-[12px] font-bold text-[#1d2327] mb-1">Legenda</label>
                                <textarea
                                    rows={2}
                                    value={editForm.caption}
                                    onChange={(e) => setEditForm({ ...editForm, caption: e.target.value })}
                                    className="w-full p-3 bg-white text-[#2c3338] border border-[#8c8f94] rounded text-sm outline-none focus:border-[#2271b1]"
                                />
                            </div>
                        </div>
                        <div className="p-4 border-t border-[#ccd0d4] bg-[#f6f7f7] flex justify-end gap-2">
                            <button type="button" onClick={() => setEditingFile(null)} className="px-4 py-2 border border-[#ccd0d4] text-[#50575e] text-sm rounded hover:bg-white">
                                Cancelar
                            </button>
                            <button type="button" onClick={saveMetadata} disabled={savingMetadata} className="px-4 py-2 bg-[#2271b1] text-white text-sm font-bold rounded hover:bg-[#135e96] disabled:opacity-50">
                                {savingMetadata ? "A guardar..." : "Guardar"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <ConfirmationModal
                isOpen={confirmBulkDelete}
                onClose={() => setConfirmBulkDelete(false)}
                onConfirm={deleteSelected}
                title="Eliminar Imagens"
                description={`Eliminar permanentemente ${selectedIds.size} imagem(ns) da galeria? Esta acção não pode ser revertida.`}
                confirmLabel="Eliminar"
                variant="destructive"
            />
        </div>
    );
}
