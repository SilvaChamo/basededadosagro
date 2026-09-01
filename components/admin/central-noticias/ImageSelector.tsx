"use client";

import { useState } from "react";
import { toast } from "sonner";
import { X, Upload, RefreshCw, Check, AlertCircle, Edit3 } from "lucide-react";
import { MediaLibrary } from "./MediaLibrary";
import { ImageEditor } from "./ImageEditor";

const BUCKET_NAME = "public-assets";

interface ImageSelectorProps {
    onSelect: (url: string) => void;
    onClose: () => void;
}

export function ImageSelector({ onSelect, onClose }: ImageSelectorProps) {
    const [tab, setTab] = useState<"upload" | "library">("upload");
    const [uploadFile, setUploadFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [showEditor, setShowEditor] = useState(false);
    const [editedBlob, setEditedBlob] = useState<Blob | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setUploadFile(e.target.files[0]);
            setEditedBlob(null);
        }
    };

    const uploadAndSelect = async () => {
        if (!uploadFile && !editedBlob) return;
        setUploading(true);
        try {
            const baseName = (uploadFile?.name || "imagem").replace(/\.[^/.]+$/, "").replace(/[^a-zA-Z0-9-_]/g, "_");
            const fileToUpload: Blob = editedBlob || uploadFile!;
            const extension = editedBlob ? "png" : (uploadFile!.name.split(".").pop() || "jpg");
            const fileName = `noticias/${baseName}_${Date.now()}.${extension}`;

            const form = new FormData();
            form.append("file", fileToUpload, fileName);
            form.append("bucket", BUCKET_NAME);
            form.append("path", fileName);
            form.append("scope", "noticias");

            const res = await fetch("/api/admin/upload-image", { method: "POST", body: form });
            const result = await res.json();
            if (!res.ok) throw new Error(result.error);

            onSelect(result.publicUrl);
            onClose();
        } catch (err: any) {
            toast.error("Erro ao carregar: " + err.message);
        } finally {
            setUploading(false);
        }
    };

    const handleEditorSave = (blob: Blob) => {
        setEditedBlob(blob);
        setShowEditor(false);
    };

    return (
        <div className="fixed inset-0 z-[200] bg-white flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-[#ccd0d4] bg-white shrink-0">
                <h2 className="text-[18px] font-semibold text-[#1d2327]">Imagem de destaque</h2>
                <button type="button" onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                    <X className="w-5 h-5 text-gray-500" />
                </button>
            </div>

            <div className="flex border-b border-[#ccd0d4] bg-white shrink-0">
                <button type="button"
                    onClick={() => setTab("upload")}
                    className={`px-6 py-3 text-[13px] font-medium transition-all ${tab === "upload" ? "border-b-2 border-[#2271b1] text-[#2271b1]" : "text-[#50575e] hover:text-[#2271b1]"}`}
                >
                    Carregar ficheiro
                </button>
                <button type="button"
                    onClick={() => setTab("library")}
                    className={`px-6 py-3 text-[13px] font-medium transition-all ${tab === "library" ? "border-b-2 border-[#2271b1] text-[#2271b1]" : "text-[#50575e] hover:text-[#2271b1]"}`}
                >
                    Biblioteca multimédia
                </button>
            </div>

            <div className="flex-1 overflow-hidden flex flex-col bg-[#f0f0f1]">
                {tab === "upload" ? (
                    <div className="flex-1 flex flex-col items-center justify-center p-0">
                        {!uploadFile ? (
                            <div className="max-w-md w-full text-center">
                                <div className="mb-6 p-12 border-2 border-dashed border-[#ccd0d4] rounded-lg bg-white/50 flex flex-col items-center">
                                    <Upload className="w-12 h-12 text-[#ccd0d4] mb-4" />
                                    <p className="text-[16px] text-[#3c434a] mb-4">Largue o ficheiro aqui para carregar</p>
                                    <p className="text-[13px] text-[#50575e] mb-4">ou</p>
                                    <label className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#2271b1] text-white rounded-[4px] text-[13px] font-bold hover:bg-[#135e96] cursor-pointer transition-all shadow-sm">
                                        <span>Seleccionar ficheiro</span>
                                        <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                                    </label>
                                </div>
                            </div>
                        ) : (
                            <div className="max-w-2xl w-full bg-white border border-[#ccd0d4] rounded-lg shadow-lg overflow-hidden">
                                <div className="p-6">
                                    <div className="flex gap-6">
                                        <div className="w-48 h-48 shrink-0 border border-[#ccd0d4] rounded bg-gray-50 overflow-hidden shadow-inner relative">
                                            <img
                                                src={editedBlob ? URL.createObjectURL(editedBlob) : URL.createObjectURL(uploadFile)}
                                                className="w-full h-full object-cover"
                                                alt="Preview"
                                            />
                                            <button type="button"
                                                onClick={() => setShowEditor(true)}
                                                className="absolute bottom-2 right-2 p-2 bg-[#2271b1] text-white rounded-full shadow-lg hover:bg-[#135e96] transition-all"
                                                title="Editar imagem"
                                            >
                                                <Edit3 className="w-4 h-4" />
                                            </button>
                                        </div>
                                        <div className="flex-1 space-y-4">
                                            <div>
                                                <h3 className="font-bold text-[#1d2327] mb-1">{uploadFile.name}</h3>
                                                <p className="text-xs text-[#50575e]">{(uploadFile.size / (1024 * 1024)).toFixed(2)} MB</p>
                                                {editedBlob && (
                                                    <span className="inline-flex items-center gap-1 mt-2 px-2 py-1 bg-green-100 text-green-700 text-[11px] rounded font-medium">
                                                        <Check className="w-3 h-3" />
                                                        Editada (será gravada como PNG)
                                                    </span>
                                                )}
                                            </div>

                                            <div className="flex flex-wrap gap-2 pt-2">
                                                <button type="button"
                                                    onClick={uploadAndSelect}
                                                    disabled={uploading}
                                                    className="px-6 py-2.5 bg-[#2271b1] text-white text-[13px] font-bold rounded hover:bg-[#135e96] transition-all disabled:opacity-50 flex items-center gap-2"
                                                >
                                                    {uploading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                                                    {uploading ? "A carregar..." : editedBlob ? "Gravar e definir" : "Carregar e definir"}
                                                </button>
                                                <button type="button"
                                                    onClick={() => { setUploadFile(null); setEditedBlob(null); }}
                                                    disabled={uploading}
                                                    className="px-4 py-2 border border-[#ccd0d4] text-[#50575e] text-[13px] font-bold rounded hover:bg-gray-50 transition-all"
                                                >
                                                    Cancelar
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="flex-1 overflow-hidden">
                        <MediaLibrary
                            isModal
                            onSelect={(url) => { onSelect(url); onClose(); }}
                        />
                    </div>
                )}
            </div>

            <div className="p-4 border-t border-[#ccd0d4] bg-[#f6f7f7] flex justify-between items-center shrink-0">
                <div className="text-xs text-[#50575e]">
                    {tab === "upload" ? "Os ficheiros carregados são comprimidos e guardados na biblioteca." : "Seleccione uma imagem da biblioteca."}
                </div>
                <button type="button" onClick={onClose} className="px-6 py-2 bg-[#2271b1] text-white text-[13px] font-bold rounded-[4px] hover:bg-[#135e96] transition-all">
                    Fechar
                </button>
            </div>

            {showEditor && uploadFile && (
                <ImageEditor
                    imageUrl={URL.createObjectURL(uploadFile)}
                    onSave={handleEditorSave}
                    onClose={() => setShowEditor(false)}
                    originalFileName={uploadFile.name}
                />
            )}
        </div>
    );
}
