"use client";

import { useState, useEffect, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import {
    Trash2,
    LayoutGrid,
    List as ListIcon,
    ChevronLeft,
    ChevronRight,
    Check,
    X,
} from "lucide-react";
import { AdminListToolbar, AdminToolbarTitle } from "@/components/admin/AdminListToolbar";
import { useAdminTopBar } from "@/components/admin/AdminTopBar";
import { LogoutButton } from "@/components/LogoutButton";

// Biblioteca multimédia do admin: lista directamente o bucket "public-assets"
// (todas as imagens/documentos já carregados no site — notícias, artigos,
// produtos, etc.), com metadados próprios (alt/título/legenda/descrição)
// guardados em basededados.media_details, indexados pelo nome/caminho do
// ficheiro. Porta da biblioteca multimédia do projecto de referência
// "entrecampos", adaptada para passar pelas rotas admin (service role +
// verificação de role) em vez de escrever directamente no Storage/DB a
// partir do browser.
const BUCKET_NAME = "public-assets";

interface StorageFile {
    name: string;
    created_at: string | null;
    size: number | null;
    mimetype: string | null;
    publicUrl: string;
}

function MediaGalleryContent() {
    const searchParams = useSearchParams();
    const tipoParam = searchParams.get("tipo");

    const [files, setFiles] = useState<StorageFile[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedFile, setSelectedFile] = useState<StorageFile | null>(null);
    const [uploading, setUploading] = useState(false);
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [isBulkMode, setIsBulkMode] = useState(false);
    const [fileTypeFilter, setFileTypeFilter] = useState(tipoParam || "todos");
    const [dateFilter, setDateFilter] = useState("todas");

    // O menu lateral (grupo "Multimédia") liga para /admin/galeria?tipo=X —
    // mantém o filtro sincronizado se o parâmetro mudar (ex.: clicar noutro
    // sub-item sem desmontar a página).
    useEffect(() => {
        setFileTypeFilter(tipoParam || "todos");
    }, [tipoParam]);

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 100;

    // Edição avançada de imagem
    const [isEditingImage, setIsEditingImage] = useState(false);
    const [editWidth, setEditWidth] = useState(0);
    const [editHeight, setEditHeight] = useState(0);
    const [editFormat, setEditFormat] = useState<"original" | "webp" | "jpeg">("original");
    const [processingImage, setProcessingImage] = useState(false);
    const [estimatedSize, setEstimatedSize] = useState<number | null>(null);

    // Metadados
    const [metadata, setMetadata] = useState({ alt_text: "", title: "", caption: "", description: "" });
    const [savingMetadata, setSavingMetadata] = useState(false);

    const loadImages = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/admin/upload-image?bucket=${BUCKET_NAME}`);
            const result = await res.json();
            if (!res.ok) throw new Error(result.error);
            setFiles(result.files || []);
        } catch (err: any) {
            toast.error("Erro ao carregar a galeria: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadImages(); }, []);

    const years = useMemo(() => {
        const uniqueYears = Array.from(new Set(
            files.map((f) => new Date(f.created_at || Date.now()).getFullYear())
        )).sort((a, b) => b - a);
        return uniqueYears;
    }, [files]);

    const filteredFiles = useMemo(() => {
        return files.filter((f) => {
            const matchesSearch = f.name.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesType = fileTypeFilter === "todos" ||
                (fileTypeFilter === "imagens" && /\.(jpg|jpeg|png|gif|webp|svg|bmp)$/i.test(f.name)) ||
                (fileTypeFilter === "videos" && /\.(mp4|mov|avi|mkv|webm|flv|wmv)$/i.test(f.name)) ||
                (fileTypeFilter === "documentos" && /\.(doc|docx|xls|xlsx|ppt|pptx|txt|rtf|odt)$/i.test(f.name)) ||
                (fileTypeFilter === "pdf" && /\.pdf$/i.test(f.name)) ||
                (fileTypeFilter === "audio" && /\.(mp3|wav|aac|ogg|flac|m4a|wma)$/i.test(f.name));
            const fileYear = new Date(f.created_at || Date.now()).getFullYear();
            const matchesDate = dateFilter === "todas" || fileYear.toString() === dateFilter;
            return matchesSearch && matchesType && matchesDate;
        });
    }, [files, searchQuery, fileTypeFilter, dateFilter]);

    const totalPages = Math.ceil(filteredFiles.length / itemsPerPage);
    const paginatedFiles = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return filteredFiles.slice(start, start + itemsPerPage);
    }, [filteredFiles, currentPage]);

    const toggleSelect = (id: string) => {
        const next = new Set(selectedIds);
        next.has(id) ? next.delete(id) : next.add(id);
        setSelectedIds(next);
    };

    const deleteFiles = async (names: string[]) => {
        const res = await fetch("/api/admin/upload-image", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ bucket: BUCKET_NAME, names }),
        });
        const result = await res.json();
        if (!res.ok) throw new Error(result.error);
    };

    const deleteSelected = async () => {
        if (selectedIds.size === 0) return;
        if (!confirm(`Deseja eliminar permanentemente os ${selectedIds.size} itens selecionados?`)) return;

        try {
            setLoading(true);
            await deleteFiles(Array.from(selectedIds));
            setSelectedIds(new Set());
            setIsBulkMode(false);
            await loadImages();
            toast.success("Itens eliminados com sucesso!");
        } catch (err: any) {
            toast.error("Erro ao eliminar: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    const deleteSingle = async (filename: string) => {
        if (!confirm(`Eliminar "${filename}"?`)) return;
        try {
            await deleteFiles([filename]);
            setFiles(files.filter((f) => f.name !== filename));
            if (selectedFile?.name === filename) setSelectedFile(null);
            toast.success("Ficheiro eliminado.");
        } catch (err: any) {
            toast.error("Erro: " + err.message);
        }
    };

    const copyUrl = (file: StorageFile) => {
        navigator.clipboard.writeText(file.publicUrl);
        toast.success("URL copiada!");
    };

    const formatSize = (bytes: number) => {
        if (!bytes) return "0 B";
        const k = 1024;
        const sizes = ["B", "KB", "MB"];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
    };

    const openDetails = async (file: StorageFile) => {
        setSelectedFile(file);
        setIsEditingImage(false);
        try {
            const res = await fetch(`/api/admin/media-details?file_name=${encodeURIComponent(file.name)}`);
            const result = await res.json();
            if (result.data) {
                setMetadata({
                    alt_text: result.data.alt_text || "",
                    title: result.data.title || "",
                    caption: result.data.caption || "",
                    description: result.data.description || "",
                });
            } else {
                setMetadata({ alt_text: "", title: file.name.split("-").slice(0, -1).join("-") || file.name, caption: "", description: "" });
            }
        } catch {
            setMetadata({ alt_text: "", title: file.name, caption: "", description: "" });
        }
    };

    // Estimar tamanho final ao editar
    useEffect(() => {
        if (isEditingImage && selectedFile) {
            const timer = setTimeout(async () => {
                const img = new Image();
                img.crossOrigin = "anonymous";
                img.src = selectedFile.publicUrl;
                await new Promise((r) => { img.onload = r; });

                const canvas = document.createElement("canvas");
                canvas.width = editWidth || img.width;
                canvas.height = editHeight || img.height;
                const ctx = canvas.getContext("2d");
                if (ctx) ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

                const mimeType = editFormat === "webp" ? "image/webp" : editFormat === "jpeg" ? "image/jpeg" : selectedFile.mimetype || "image/jpeg";
                canvas.toBlob((blob) => { if (blob) setEstimatedSize(blob.size); }, mimeType, 0.85);
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [editWidth, editHeight, editFormat, isEditingImage, selectedFile]);

    const applyImageEdits = async () => {
        if (!selectedFile) return;
        setProcessingImage(true);

        try {
            const img = new Image();
            img.crossOrigin = "anonymous";
            img.src = selectedFile.publicUrl;
            await new Promise((resolve) => { img.onload = resolve; });

            const canvas = document.createElement("canvas");
            const finalWidth = editWidth || img.width;
            const finalHeight = editHeight || img.height;
            canvas.width = finalWidth;
            canvas.height = finalHeight;
            const ctx = canvas.getContext("2d");
            if (ctx) ctx.drawImage(img, 0, 0, finalWidth, finalHeight);

            const mimeType = editFormat === "webp" ? "image/webp" : editFormat === "jpeg" ? "image/jpeg" : selectedFile.mimetype || "image/jpeg";
            const extension = editFormat === "webp" ? ".webp" : editFormat === "jpeg" ? ".jpg" : "." + selectedFile.name.split(".").pop();

            const blob: Blob = await new Promise((resolve) => {
                canvas.toBlob((b) => resolve(b!), mimeType, 0.85);
            });

            const baseName = selectedFile.name.replace(/\.[^/.]+$/, "").split("/").pop();
            const newFileName = `${Date.now()}-${baseName}${editFormat !== "original" ? "_edited" : ""}${extension}`;

            const form = new FormData();
            form.append("file", blob, newFileName);
            form.append("bucket", BUCKET_NAME);
            form.append("path", newFileName);

            const res = await fetch("/api/admin/upload-image", { method: "POST", body: form });
            const result = await res.json();
            if (!res.ok) throw new Error(result.error);

            toast.success("Imagem processada e guardada com sucesso!");
            setIsEditingImage(false);
            loadImages();
        } catch (err: any) {
            toast.error("Erro ao editar imagem: " + err.message);
        } finally {
            setProcessingImage(false);
        }
    };

    const saveMetadata = async () => {
        if (!selectedFile) return;
        setSavingMetadata(true);
        try {
            const res = await fetch("/api/admin/media-details", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ file_name: selectedFile.name, ...metadata }),
            });
            if (!res.ok) throw new Error((await res.json()).error);
            toast.success("Guardado!");
        } catch (err: any) {
            toast.error("Erro ao guardar: " + err.message);
        } finally {
            setSavingMetadata(false);
        }
    };

    const handleUpload = async (filesToUpload: FileList | null) => {
        if (!filesToUpload || filesToUpload.length === 0) return;
        setUploading(true);
        let successCount = 0;

        for (let i = 0; i < filesToUpload.length; i++) {
            const file = filesToUpload[i];
            const cleanName = `${Date.now()}-${file.name.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^\w.-]/g, "_")}`;
            const form = new FormData();
            form.append("file", file);
            form.append("bucket", BUCKET_NAME);
            form.append("path", cleanName);
            const res = await fetch("/api/admin/upload-image", { method: "POST", body: form });
            if (res.ok) successCount++;
        }

        if (successCount > 0) {
            toast.success(`${successCount} ficheiro(s) carregado(s) com sucesso!`);
            loadImages();
        }
        setUploading(false);
    };

    useAdminTopBar("");

    return (
        <div className="text-[#2c3338]">
            <AdminListToolbar className="flex-nowrap">
                <AdminToolbarTitle
                    title="Multimédia"
                    searchValue={searchQuery}
                    onSearchChange={setSearchQuery}
                    searchPlaceholder="Procurar itens multimédia..."
                />

                <div className="flex items-center gap-2 shrink-0">
                    <label className="px-3 py-1.5 bg-white border border-[#2271b1] text-[#2271b1] rounded-[3px] text-sm font-semibold hover:bg-[#f6f7f7] cursor-pointer transition-all whitespace-nowrap">
                        {uploading ? "A carregar..." : "Adicionar ficheiros multimédia"}
                        <input
                            type="file"
                            className="hidden"
                            accept="image/*"
                            multiple
                            onChange={(e) => handleUpload(e.target.files)}
                        />
                    </label>
                    <LogoutButton
                        variant="outline"
                        className="h-9 px-4 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-red-600 border-slate-200"
                        showIcon
                        label="Sair"
                    />
                </div>
            </AdminListToolbar>

            {/* Toolbar de filtros — cola-se logo abaixo da AdminListToolbar (80px) */}
            <div className="sticky top-20 z-10 pt-4 pb-4">
                <div className="flex flex-col md:flex-row items-center justify-between bg-white border border-[#ccd0d4] p-2 gap-2 shadow-sm">
                    <div className="flex items-center gap-2 flex-wrap">
                        {isBulkMode && (
                            <input
                                type="checkbox"
                                checked={selectedIds.size === paginatedFiles.length && paginatedFiles.length > 0}
                                onChange={() => {
                                    if (selectedIds.size === paginatedFiles.length) setSelectedIds(new Set());
                                    else setSelectedIds(new Set(paginatedFiles.map((f) => f.name)));
                                }}
                                className="w-4 h-4 cursor-pointer"
                            />
                        )}

                        <button onClick={() => setViewMode("list")} className={`p-1.5 rounded-md ${viewMode === "list" ? "bg-[#f0f0f1] text-[#2271b1]" : "text-[#50575e] hover:text-[#2271b1]"}`}>
                            <ListIcon className="w-5 h-5" />
                        </button>
                        <button onClick={() => setViewMode("grid")} className={`p-1.5 rounded-md ${viewMode === "grid" ? "bg-[#f0f0f1] text-[#2271b1]" : "text-[#50575e] hover:text-[#2271b1]"}`}>
                            <LayoutGrid className="w-5 h-5" />
                        </button>

                        <select className="ml-2 h-8 text-sm border border-[#ccd0d4] rounded-md bg-white px-2" value={fileTypeFilter} onChange={(e) => setFileTypeFilter(e.target.value)}>
                            <option value="todos">Todos os ficheiros</option>
                            <option value="imagens">Imagens</option>
                            <option value="videos">Vídeos</option>
                            <option value="documentos">Documentos</option>
                            <option value="pdf">PDF</option>
                            <option value="audio">Áudio</option>
                        </select>

                        <select className="h-8 text-sm border border-[#ccd0d4] rounded-md bg-white px-2" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)}>
                            <option value="todas">Todas as datas</option>
                            {years.map((year) => <option key={year} value={year.toString()}>{year}</option>)}
                        </select>

                        {!isBulkMode ? (
                            <button onClick={() => setIsBulkMode(true)} className="ml-2 h-8 px-4 text-sm font-semibold border border-[#ccd0d4] rounded-md bg-white hover:bg-[#f6f7f7] whitespace-nowrap">
                                Seleção em massa
                            </button>
                        ) : (
                            <div className="flex items-center gap-3 ml-2 flex-nowrap">
                                <span onClick={selectedIds.size > 0 ? deleteSelected : undefined} className={`text-sm whitespace-nowrap ${selectedIds.size > 0 ? "text-[#d63638] cursor-pointer hover:underline" : "text-gray-400 cursor-not-allowed"}`}>
                                    Eliminar {selectedIds.size} itens selecionados
                                </span>
                                <button onClick={() => { setIsBulkMode(false); setSelectedIds(new Set()); }} className="h-8 px-4 text-sm font-semibold border border-[#ccd0d4] rounded-md bg-white hover:bg-[#f6f7f7] whitespace-nowrap">
                                    Cancelar
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="flex items-center gap-4 flex-nowrap">
                        <div className="flex items-center gap-2 text-[13px] text-[#50575e] whitespace-nowrap">
                            <span>{filteredFiles.length} itens</span>
                            <div className="flex items-center gap-1 ml-2">
                                <button disabled={currentPage === 1} onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} className="p-1 border border-[#ccd0d4] bg-white rounded-md disabled:opacity-30">
                                    <ChevronLeft className="w-4 h-4" />
                                </button>
                                <span className="px-2 font-medium">{currentPage} <span className="font-normal text-gray-400">de</span> {totalPages || 1}</span>
                                <button disabled={currentPage === totalPages || totalPages === 0} onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} className="p-1 border border-[#ccd0d4] bg-white rounded-md disabled:opacity-30">
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Conteúdo */}
            {loading ? (
                <div className="grid grid-cols-[repeat(auto-fill,minmax(110px,1fr))] gap-2">
                    {Array.from({ length: 14 }).map((_, i) => <div key={i} className="aspect-square bg-gray-200 animate-pulse" />)}
                </div>
            ) : viewMode === "grid" ? (
                <div className="grid grid-cols-[repeat(auto-fill,minmax(110px,1fr))] gap-2">
                    {paginatedFiles.map((file) => (
                        <div
                            key={file.name}
                            onClick={() => (isBulkMode ? toggleSelect(file.name) : openDetails(file))}
                            className={`aspect-square relative bg-white border cursor-pointer overflow-hidden group ${selectedIds.has(file.name) ? "ring-[3px] ring-[#2271b1] ring-inset" : "border-[#ccd0d4]"}`}
                        >
                            <img src={file.publicUrl} className="w-full h-full object-cover" alt="" />

                            {isBulkMode && (
                                <div className={`absolute top-1 right-1 w-5 h-5 rounded-sm border flex items-center justify-center ${selectedIds.has(file.name) ? "bg-[#2271b1] border-[#2271b1]" : "bg-white border-[#ccd0d4]"}`}>
                                    {selectedIds.has(file.name) && <Check className="w-3.5 h-3.5 text-white" />}
                                </div>
                            )}

                            {!isBulkMode && <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity" />}
                        </div>
                    ))}
                </div>
            ) : (
                <div className="bg-white border border-[#ccd0d4] overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="bg-white text-left text-[13px] font-bold border-b border-[#ccd0d4]">
                                <th className="p-2 w-10">
                                    <input type="checkbox" checked={selectedIds.size === filteredFiles.length && filteredFiles.length > 0} onChange={() => {
                                        if (selectedIds.size === filteredFiles.length) setSelectedIds(new Set());
                                        else setSelectedIds(new Set(filteredFiles.map((f) => f.name)));
                                    }} />
                                </th>
                                <th className="p-3">Ficheiro</th>
                                <th className="p-3">Tipo</th>
                                <th className="p-3">Data</th>
                                <th className="p-3 text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedFiles.map((file) => (
                                <tr key={file.name} className="border-b border-[#f0f0f1] hover:bg-[#f6f7f7] text-[13px]">
                                    <td className="p-2">
                                        <input type="checkbox" checked={selectedIds.has(file.name)} onChange={() => toggleSelect(file.name)} />
                                    </td>
                                    <td className="p-3">
                                        <div className="flex items-center gap-3 max-w-[400px]">
                                            <div className="w-16 h-16 border border-[#ccd0d4] bg-[#f0f0f1] flex-shrink-0">
                                                <img src={file.publicUrl} className="w-full h-full object-cover" alt="" />
                                            </div>
                                            <div className="flex flex-col min-w-0">
                                                <button onClick={() => openDetails(file)} className="text-[#2271b1] font-bold hover:text-[#135e96] text-left truncate whitespace-nowrap block w-full">
                                                    {file.name}
                                                </button>
                                                <span className="text-[#50575e] text-xs font-mono truncate">{file.mimetype}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-3 text-[#50575e]">{file.mimetype || "-"}</td>
                                    <td className="p-3 text-[#50575e]">{file.created_at ? new Date(file.created_at).toLocaleDateString("pt-PT") : "-"}</td>
                                    <td className="p-3 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button onClick={() => openDetails(file)} className="text-[#2271b1] hover:underline">Editar</button>
                                            <span className="text-[#ccd0d4]">|</span>
                                            <button onClick={() => deleteSingle(file.name)} className="text-[#d63638] hover:underline">Eliminar</button>
                                            <span className="text-[#ccd0d4]">|</span>
                                            <button onClick={() => copyUrl(file)} className="text-[#2271b1] hover:underline">Ver</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Modal estilo WP */}
            {selectedFile && (
                <div className="fixed inset-0 bg-white z-[100] flex flex-col">
                    <div className="flex items-center justify-between px-4 h-12 border-b bg-[#f6f7f7]">
                        <h2 className="text-lg font-bold">Detalhes do anexo</h2>
                        <button onClick={() => setSelectedFile(null)} className="p-2 hover:bg-[#ccd0d4]"><X className="w-6 h-6" /></button>
                    </div>

                    <div className="flex-1 flex flex-col md:flex-row overflow-hidden bg-[#f0f0f1]">
                        {/* Preview */}
                        <div className="flex-1 p-4 flex flex-col items-center justify-center overflow-auto bg-checkerboard">
                            {!isEditingImage ? (
                                <>
                                    <img src={selectedFile.publicUrl} className="max-w-full max-h-[70vh] shadow-lg border border-[#ccd0d4] bg-white" alt="" />
                                    <div className="mt-4 flex gap-2">
                                        <button
                                            onClick={() => {
                                                const img = new Image();
                                                img.src = selectedFile.publicUrl;
                                                img.onload = () => {
                                                    setEditWidth(img.width);
                                                    setEditHeight(img.height);
                                                    setIsEditingImage(true);
                                                };
                                            }}
                                            className="px-4 py-1.5 bg-[#2271b1] text-white text-sm font-semibold rounded-[3px] hover:bg-[#135e96]"
                                        >
                                            Editar imagem
                                        </button>
                                        <button onClick={() => window.open(selectedFile.publicUrl, "_blank")} className="px-4 py-1.5 border border-[#2271b1] text-[#2271b1] bg-white text-sm font-semibold rounded-[3px] hover:bg-[#f6f7f7]">
                                            Ver ficheiro completo
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <div className="w-full max-w-4xl bg-white border border-[#ccd0d4] shadow-lg p-6">
                                    <div className="flex items-center justify-between mb-6">
                                        <h3 className="text-xl font-bold">Ferramentas de Edição</h3>
                                        <button onClick={() => setIsEditingImage(false)} className="text-sm text-[#2271b1] hover:underline">Voltar aos detalhes</button>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="flex flex-col items-center justify-center bg-[#f0f0f1] border p-4">
                                            <img src={selectedFile.publicUrl} className="max-w-full max-h-[40vh] object-contain" alt="Preview" />
                                        </div>

                                        <div className="space-y-6">
                                            <div className="space-y-3">
                                                <h4 className="font-bold text-sm border-b pb-1">Redimensionar</h4>
                                                <div className="flex items-center gap-4">
                                                    <div className="flex flex-col gap-1">
                                                        <label className="text-xs text-gray-500">Largura</label>
                                                        <input type="number" value={editWidth} onChange={(e) => setEditWidth(parseInt(e.target.value) || 0)} className="w-24 h-8 bg-white text-[#2c3338] border border-[#ccd0d4] text-sm px-2 outline-none focus:border-[#2271b1]" />
                                                    </div>
                                                    <span className="mt-4 text-gray-400">×</span>
                                                    <div className="flex flex-col gap-1">
                                                        <label className="text-xs text-gray-500">Altura</label>
                                                        <input type="number" value={editHeight} onChange={(e) => setEditHeight(parseInt(e.target.value) || 0)} className="w-24 h-8 bg-white text-[#2c3338] border border-[#ccd0d4] text-sm px-2 outline-none focus:border-[#2271b1]" />
                                                    </div>
                                                </div>
                                                <div className="flex gap-2">
                                                    <button onClick={() => { setEditWidth(Math.round(editWidth * 0.5)); setEditHeight(Math.round(editHeight * 0.5)); }} className="text-[11px] text-[#2271b1] hover:underline">50%</button>
                                                    <button onClick={() => { setEditWidth(Math.round(editWidth * 0.75)); setEditHeight(Math.round(editHeight * 0.75)); }} className="text-[11px] text-[#2271b1] hover:underline">75%</button>
                                                </div>

                                                <div className="bg-[#f6f7f7] p-2 border border-[#ccd0d4] rounded-[2px] mt-2">
                                                    <p className="text-[11px] text-gray-600">Tamanho atual: <strong>{formatSize(selectedFile.size || 0)}</strong></p>
                                                    <p className="text-[11px] text-[#2271b1]">Tamanho final estimado: <strong>{estimatedSize ? formatSize(estimatedSize) : "A calcular..."}</strong></p>
                                                </div>
                                            </div>

                                            <div className="space-y-3">
                                                <h4 className="font-bold text-sm border-b pb-1">Formato e Otimização</h4>
                                                <div className="flex flex-col gap-2">
                                                    <label className="flex items-center gap-2 text-sm cursor-pointer">
                                                        <input type="radio" checked={editFormat === "original"} onChange={() => setEditFormat("original")} />
                                                        <span>Manter original ({selectedFile.mimetype})</span>
                                                    </label>
                                                    <label className="flex items-center gap-2 text-sm cursor-pointer">
                                                        <input type="radio" checked={editFormat === "webp"} onChange={() => setEditFormat("webp")} />
                                                        <span className="font-medium text-green-700">Converter para WebP (Otimizado para Web)</span>
                                                    </label>
                                                    <label className="flex items-center gap-2 text-sm cursor-pointer">
                                                        <input type="radio" checked={editFormat === "jpeg"} onChange={() => setEditFormat("jpeg")} />
                                                        <span>Converter para JPEG</span>
                                                    </label>
                                                </div>
                                            </div>

                                            <div className="pt-6 border-t flex gap-3">
                                                <button onClick={applyImageEdits} disabled={processingImage} className="px-6 py-2 bg-[#2271b1] text-white text-sm font-semibold rounded-[3px] hover:bg-[#135e96] disabled:opacity-50">
                                                    {processingImage ? "A processar..." : "Guardar Alterações"}
                                                </button>
                                                <button onClick={() => setIsEditingImage(false)} className="px-6 py-2 border border-[#ccd0d4] text-sm font-semibold rounded-[3px] hover:bg-[#f6f7f7]">
                                                    Cancelar
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Sidebar de detalhes */}
                        <div className="w-full md:w-[300px] bg-[#f6f7f7] border-l border-[#ccd0d4] overflow-y-auto p-4 space-y-4">
                            <div className="text-[12px] text-[#50575e] space-y-1">
                                <p><strong>Carregado em:</strong> {selectedFile.created_at ? new Date(selectedFile.created_at).toLocaleDateString("pt-PT") : "-"}</p>
                                <p><strong>Nome:</strong> {selectedFile.name}</p>
                                <p><strong>Tipo:</strong> {selectedFile.mimetype}</p>
                                <p><strong>Tamanho:</strong> {formatSize(selectedFile.size || 0)}</p>
                            </div>

                            <hr className="border-[#ccd0d4]" />

                            <div className="space-y-4">
                                <div className="flex flex-col gap-1">
                                    <label className="text-[12px] font-semibold text-[#50575e]">Texto alternativo</label>
                                    <textarea value={metadata.alt_text} onChange={(e) => setMetadata({ ...metadata, alt_text: e.target.value })} className="w-full text-xs bg-white text-[#2c3338] border border-[#ccd0d4] p-1.5 focus:border-[#2271b1] outline-none h-14 rounded-[3px]" />
                                </div>
                                <div className="flex flex-col gap-1">
                                    <label className="text-[12px] font-semibold text-[#50575e]">Título</label>
                                    <input type="text" value={metadata.title} onChange={(e) => setMetadata({ ...metadata, title: e.target.value })} className="w-full text-xs bg-white text-[#2c3338] border border-[#ccd0d4] p-1.5 focus:border-[#2271b1] outline-none rounded-[3px]" />
                                </div>
                                <div className="flex flex-col gap-1">
                                    <label className="text-[12px] font-semibold text-[#50575e]">Legenda</label>
                                    <textarea value={metadata.caption} onChange={(e) => setMetadata({ ...metadata, caption: e.target.value })} className="w-full text-xs bg-white text-[#2c3338] border border-[#ccd0d4] p-1.5 focus:border-[#2271b1] outline-none h-14 rounded-[3px]" />
                                </div>
                                <div className="flex flex-col gap-1">
                                    <label className="text-[12px] font-semibold text-[#50575e]">Descrição</label>
                                    <textarea value={metadata.description} onChange={(e) => setMetadata({ ...metadata, description: e.target.value })} className="w-full text-xs bg-white text-[#2c3338] border border-[#ccd0d4] p-1.5 focus:border-[#2271b1] outline-none h-20 rounded-[3px]" />
                                </div>
                                <div className="flex flex-col gap-1">
                                    <label className="text-[12px] font-semibold text-[#50575e]">URL do ficheiro</label>
                                    <input type="text" readOnly value={selectedFile.publicUrl} className="w-full text-[11px] border border-[#ccd0d4] p-1.5 bg-[#f0f0f1] rounded-[3px]" />
                                    <button onClick={() => copyUrl(selectedFile)} className="text-[11px] text-[#2271b1] hover:underline text-left mt-1">Copiar URL</button>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-[#ccd0d4] flex justify-between items-center">
                                <button onClick={() => deleteSingle(selectedFile.name)} className="text-[12px] text-[#d63638] hover:underline">Eliminar permanentemente</button>
                                <button onClick={saveMetadata} disabled={savingMetadata} className="px-4 py-1.5 bg-[#2271b1] text-white text-sm font-semibold rounded-[3px] hover:bg-[#135e96] disabled:opacity-50">
                                    {savingMetadata ? "A guardar..." : "Salvar"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <style jsx global>{`
                .bg-checkerboard {
                    background-image: linear-gradient(45deg, #e5e7eb 25%, transparent 25%), linear-gradient(-45deg, #e5e7eb 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #e5e7eb 75%), linear-gradient(-45deg, transparent 75%, #e5e7eb 75%);
                    background-size: 20px 20px;
                    background-position: 0 0, 0 10px, 10px -10px, -10px 0px;
                }
            `}</style>
        </div>
    );
}

export default function MediaGalleryPage() {
    // Suprime a barra "Sair" antiga já no 1.º render da rota, antes de o
    // Suspense resolver — senão o AdminTopBar mostrava o "Sair" por omissão
    // em duplicado ao carregar a página.
    useAdminTopBar("");
    return (
        <Suspense fallback={<div>A carregar...</div>}>
            <MediaGalleryContent />
        </Suspense>
    );
}
