"use client";

import { useState, useRef, useCallback } from "react";
import Cropper from "react-cropper";
import "cropperjs/dist/cropper.css";
import { toast } from "sonner";
import { X, Crop, Eraser, Download, Loader2, Check, Undo } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";

interface ImageEditorProps {
    imageUrl: string;
    onSave: (blob: Blob, fileName: string) => void;
    onClose: () => void;
    originalFileName: string;
}

type EditingMode = "none" | "crop" | "remove-bg";

export function ImageEditor({ imageUrl, onSave, onClose, originalFileName }: ImageEditorProps) {
    const [mode, setMode] = useState<EditingMode>("none");
    const [croppedImage, setCroppedImage] = useState<string | null>(null);
    const [processedImage, setProcessedImage] = useState<string | null>(null);
    const [processing, setProcessing] = useState(false);
    const [progress, setProgress] = useState("");
    const cropperRef = useRef<any>(null);

    const applyCrop = useCallback(() => {
        if (cropperRef.current) {
            const cropped = cropperRef.current.cropper.getCroppedCanvas().toDataURL("image/png");
            setCroppedImage(cropped);
            setProcessedImage(cropped);
            setMode("none");
        }
    }, []);

    const removeBg = useCallback(async () => {
        setProcessing(true);
        setProgress("A processar...");

        try {
            const { removeBackground } = await import("@imgly/background-removal");
            const imageToProcess = croppedImage || imageUrl;
            const blob = await removeBackground(imageToProcess, {
                progress: (key: string, current: number, total: number) => {
                    setProgress(`${key}: ${Math.round((current / total) * 100)}%`);
                },
            });

            const url = URL.createObjectURL(blob);
            setProcessedImage(url);
            setMode("none");
        } catch (err) {
            toast.error("Erro ao remover fundo: " + (err as Error).message);
        } finally {
            setProcessing(false);
            setProgress("");
        }
    }, [croppedImage, imageUrl]);

    const saveAsPng = useCallback(async () => {
        const imageToSave = processedImage || croppedImage || imageUrl;

        const response = await fetch(imageToSave);
        const blob = await response.blob();
        void blob;

        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        const img = new Image();

        img.onload = () => {
            canvas.width = img.width;
            canvas.height = img.height;
            ctx?.drawImage(img, 0, 0);

            canvas.toBlob((pngBlob) => {
                if (pngBlob) {
                    const baseName = originalFileName.replace(/\.[^/.]+$/, "");
                    onSave(pngBlob, `${baseName}_edited.png`);
                }
            }, "image/png");
        };

        img.src = imageToSave;
    }, [processedImage, croppedImage, imageUrl, originalFileName, onSave]);

    const reset = () => {
        setCroppedImage(null);
        setProcessedImage(null);
        setMode("none");
    };

    const displayImage = processedImage || croppedImage || imageUrl;

    return (
        <div className="fixed inset-0 z-[300] bg-[#1d2327] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-[#3c434a] bg-[#1d2327] shrink-0">
                <h2 className="text-[18px] font-semibold text-white">Editor de Imagem</h2>
                <div className="flex items-center gap-3">
                    {(croppedImage || processedImage) && (
                        <button onClick={reset} className="flex items-center gap-2 px-4 py-2 text-[13px] text-gray-300 hover:text-white transition-colors">
                            <Undo className="w-4 h-4" />
                            Resetar
                        </button>
                    )}
                    <button onClick={onClose} className="p-2 hover:bg-[#2c3338] rounded-full transition-colors">
                        <X className="w-5 h-5 text-gray-400" />
                    </button>
                </div>
            </div>

            <div className="flex items-center gap-2 p-4 border-b border-[#3c434a] bg-[#2c3338] shrink-0">
                <button
                    onClick={() => setMode(mode === "crop" ? "none" : "crop")}
                    className={`flex items-center gap-2 px-4 py-2 rounded text-[13px] font-medium transition-all ${mode === "crop" ? "bg-[#2271b1] text-white" : "bg-[#1d2327] text-gray-300 hover:bg-[#3c434a]"}`}
                >
                    <Crop className="w-4 h-4" />
                    {mode === "crop" ? "Cancelar Crop" : "Recortar"}
                </button>

                <button
                    onClick={removeBg}
                    disabled={processing}
                    className="flex items-center gap-2 px-4 py-2 rounded text-[13px] font-medium bg-[#1d2327] text-gray-300 hover:bg-[#3c434a] transition-all disabled:opacity-50"
                >
                    {<Eraser className="w-4 h-4" />}
                    Remover Fundo
                </button>

                <div className="flex-1"></div>

                <button
                    onClick={saveAsPng}
                    className="flex items-center gap-2 px-6 py-2 bg-[#00a651] text-white rounded text-[13px] font-bold hover:bg-[#008f45] transition-all"
                >
                    <Download className="w-4 h-4" />
                    Gravar como PNG
                </button>
            </div>

            

            <div className="flex-1 overflow-auto p-4 flex items-center justify-center bg-[#1d2327]">
                {mode === "crop" ? (
                    <div className="max-w-4xl max-h-[80vh] w-full">
                        <Cropper
                            src={imageUrl}
                            style={{ height: 400, width: "100%" }}
                            initialAspectRatio={16 / 9}
                            guides={true}
                            ref={cropperRef}
                            viewMode={1}
                            dragMode="move"
                            scalable={true}
                            zoomable={true}
                        />
                        <div className="flex justify-center gap-3 mt-4">
                            <button onClick={applyCrop} className="flex items-center gap-2 px-6 py-2 bg-[#00a651] text-white rounded text-[13px] font-bold hover:bg-[#008f45]">
                                <Check className="w-4 h-4" />
                                Aplicar Crop
                            </button>
                            <button onClick={() => setMode("none")} className="px-6 py-2 bg-[#3c434a] text-white rounded text-[13px] hover:bg-[#4c535a]">
                                Cancelar
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="relative max-w-4xl max-h-[80vh]">
                        <img
                            src={displayImage}
                            alt="Preview"
                            className="max-w-full max-h-[70vh] object-contain border border-[#3c434a] rounded"
                            style={{ background: processedImage ? "transparent" : "#2c3338" }}
                        />
                        {processedImage && (
                            <div className="absolute top-2 right-2 px-3 py-1 bg-[#00a651] text-white text-[12px] rounded-full">
                                Fundo removido
                            </div>
                        )}
                    </div>
                )}
            </div>

            <div className="p-3 border-t border-[#3c434a] bg-[#2c3338] text-[12px] text-gray-400 text-center">
                Use &quot;Recortar&quot; para selecionar área manualmente • Use &quot;Remover Fundo&quot; para remover o fundo automaticamente • Grava sempre em PNG
            </div>
        </div>
    );
}
