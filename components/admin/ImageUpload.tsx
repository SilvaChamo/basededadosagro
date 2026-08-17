"use client";

import { useState, useRef, useEffect } from "react";
import { Upload, X, ImageIcon, Loader2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/utils/supabase/client";
import { Spinner } from "@/components/ui/spinner";

interface ImageUploadProps {
    value: string;
    onChange: (url: string) => void;
    label: string;
    description?: string;
    recommendedSize?: string;
    maxSizeMB?: number;
    bucket?: string;
    folder?: string;
    aspectRatio?: "square" | "video" | "any";
    imageClassName?: string;
    showRecommendedBadge?: boolean;
    maxWidth?: number;
    maxHeight?: number;
    hardCapMB?: number; // Tecto absoluto de KB — só para casos onde a imagem é exibida em grande (ex: banner de destaque). Por defeito 0.05 (50kb) em todo o site.
    className?: string; // Container class override
    useBackgroundImage?: boolean; // If true, use background-image instead of img element
    backgroundSize?: "cover" | "contain"; // Background size mode when useBackgroundImage is true
    disabled?: boolean;
}

export function ImageUpload({
    value,
    onChange,
    label,
    description,
    recommendedSize,
    maxSizeMB = 1,
    bucket = "public-assets",
    folder = "admin",
    aspectRatio = "any",
    imageClassName,
    showRecommendedBadge = true,
    maxWidth,
    maxHeight,
    hardCapMB = 0.05,
    className,
    useBackgroundImage = false,
    backgroundSize = "cover",
    disabled = false
}: ImageUploadProps) {
    const supabase = createClient();
    // Tecto absoluto por imagem (mantendo a melhor qualidade possível dentro
    // desse limite) — aplica-se sempre, independentemente do que for passado
    // em maxSizeMB, para garantir que nenhuma imagem do site ultrapassa este
    // tamanho. Por defeito 50kb; só sobe via hardCapMB nos casos (como o
    // banner de destaque de artigos) em que a imagem é exibida em grande.
    const effectiveMaxBytes = Math.min(maxSizeMB, hardCapMB) * 1024 * 1024;
    // Se quem chama este componente não definir dimensões máximas, aplicamos
    // um tecto de resolução por defeito — sem isto, imagens grandes só eram
    // comprimidas por qualidade (mantendo a resolução original), o que torna
    // impossível chegar a 50kb sem destruir a qualidade visual.
    const effectiveMaxWidth = maxWidth ?? 1600;
    const effectiveMaxHeight = maxHeight ?? (maxWidth ? undefined : 1600);
    const [uploading, setUploading] = useState(false);
    const [userId, setUserId] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const getSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session?.user) {
                setUserId(session.user.id);
            }
        };
        getSession();
    }, []);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Decide silenciosamente se a imagem precisa de ser reduzida — sem
    // interromper o upload a pedir confirmação ao utilizador.
    const checkNeedsResize = (file: File): Promise<boolean> => {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (event) => {
                const img = new Image();
                img.src = event.target?.result as string;
                img.onload = () => {
                    const width = img.width;
                    const height = img.height;
                    const needsResizing = (effectiveMaxWidth && width > effectiveMaxWidth) || (effectiveMaxHeight && height > effectiveMaxHeight) || (file.size > effectiveMaxBytes);
                    resolve(needsResizing);
                };
            };
        });
    };

    const convertToWebP = (file: File, forceResize: boolean, quality: number = 0.85, extraScale: number = 1): Promise<Blob> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (event) => {
                const img = new Image();
                img.src = event.target?.result as string;
                img.onload = () => {
                    const canvas = document.createElement("canvas");
                    let targetWidth = img.width;
                    let targetHeight = img.height;

                    if (forceResize && effectiveMaxWidth && effectiveMaxHeight) {
                        targetWidth = effectiveMaxWidth;
                        targetHeight = effectiveMaxHeight;
                    } else if (forceResize) {
                        if (effectiveMaxWidth && targetWidth > effectiveMaxWidth) {
                            targetHeight *= effectiveMaxWidth / targetWidth;
                            targetWidth = effectiveMaxWidth;
                        }
                        if (effectiveMaxHeight && targetHeight > effectiveMaxHeight) {
                            targetWidth *= effectiveMaxHeight / targetHeight;
                            targetHeight = effectiveMaxHeight;
                        }
                    }

                    // Redução adicional progressiva (usada quando qualidade +
                    // tecto de resolução normal ainda não chegam aos 50kb).
                    if (extraScale < 1) {
                        targetWidth *= extraScale;
                        targetHeight *= extraScale;
                    }
                    targetWidth = Math.max(1, Math.round(targetWidth));
                    targetHeight = Math.max(1, Math.round(targetHeight));

                    canvas.width = targetWidth;
                    canvas.height = targetHeight;
                    const ctx = canvas.getContext("2d");
                    if (!ctx) return reject(new Error("Não foi possível criar o contexto do canvas"));

                    if (forceResize && effectiveMaxWidth && effectiveMaxHeight) {
                        // Center crop logic
                        const imgSize = img.width / img.height;
                        const targetSize = targetWidth / targetHeight;
                        let sWidth, sHeight, sx, sy;

                        if (imgSize > targetSize) {
                            sHeight = img.height;
                            sWidth = img.height * targetSize;
                            sx = (img.width - sWidth) / 2;
                            sy = 0;
                        } else {
                            sWidth = img.width;
                            sHeight = img.width / targetSize;
                            sx = 0;
                            sy = (img.height - sHeight) / 2;
                        }
                        ctx.drawImage(img, sx, sy, sWidth, sHeight, 0, 0, targetWidth, targetHeight);
                    } else {
                        ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
                    }

                    canvas.toBlob(
                        (blob) => {
                            if (blob) resolve(blob);
                            else reject(new Error("Erro na conversão WebP"));
                        },
                        "image/webp",
                        quality
                    );
                };
                img.onerror = () => reject(new Error("Erro ao carregar imagem"));
            };
            reader.onerror = () => reject(new Error("Erro ao ler ficheiro"));
        });
    };

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setError(null);

        // 20MB limit for raw file input (we will compress it drastically)
        if (file.size > 20 * 1024 * 1024) {
            setError(`O ficheiro é demasiado grande (Máx 20MB).`);
            return;
        }

        const shouldResize = await checkNeedsResize(file);
        await startUpload(file, shouldResize);
    };

    const startUpload = async (file: File, shouldResize: boolean) => {
        setUploading(true);
        try {
            // Tenta primeiro só reduzir a qualidade, com o tecto de resolução
            // já aplicado (shouldResize=true assim que a imagem excede o
            // tecto de resolução ou de tamanho — ver checkAndResize).
            let webpBlob = await convertToWebP(file, true, 0.85);

            const qualitySteps = [0.70, 0.55, 0.40];
            for (const q of qualitySteps) {
                if (webpBlob.size <= effectiveMaxBytes) break;
                webpBlob = await convertToWebP(file, true, q);
            }

            // Se a qualidade sozinha não chegar a 50kb, reduz também a
            // resolução progressivamente (mantendo a melhor qualidade
            // possível a cada passo) até caber no limite.
            const scaleSteps = [0.75, 0.6, 0.45, 0.3, 0.2];
            for (const scale of scaleSteps) {
                if (webpBlob.size <= effectiveMaxBytes) break;
                webpBlob = await convertToWebP(file, true, 0.6, scale);
            }

            // Final Check
            if (webpBlob.size > effectiveMaxBytes) {
                setError(`Não foi possível comprimir a imagem para menos de ${Math.round(effectiveMaxBytes / 1024)}kb. Tente uma imagem menor.`);
                setUploading(false);
                return;
            }

            const userPrefix = userId ? `${userId}-` : "";
            const fileName = `${folder}/${userPrefix}${Date.now()}.webp`;

            const uploadForm = new FormData();
            uploadForm.append("file", webpBlob, fileName);
            uploadForm.append("bucket", bucket);
            uploadForm.append("path", fileName);

            const res = await fetch("/api/admin/upload-image", {
                method: "POST",
                body: uploadForm,
            });

            const result = await res.json();
            if (!res.ok) throw new Error(result.error || "Erro ao carregar imagem.");

            onChange(result.publicUrl);
        } catch (err: any) {
            console.error("Upload error:", err);
            setError("Erro ao carregar imagem: " + (err.message || "Tente novamente."));
        } finally {
            setUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    const removeImage = () => {
        onChange("");
        setError(null);
    };

    return (
        <div className={cn("flex flex-col gap-2", useBackgroundImage && "h-full")}>
            {/* Label removed as per request */}

            <div
                className={cn(
                    "relative rounded-xl border border-dashed border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-all cursor-pointer group flex items-center justify-center overflow-hidden w-full",
                    !className?.includes('aspect-') && (aspectRatio === "square" ? "aspect-square max-h-[220px] max-w-[220px] mx-auto p-[10px]" : "aspect-[3/1] max-h-[220px]"),
                    error ? "border-red-200 bg-red-50/10" : "",
                    useBackgroundImage && "h-full flex-1",
                    className
                )}
                onClick={() => !uploading && fileInputRef.current?.click()}
            >
                {uploading ? (
                    <div className="flex flex-col items-center gap-2">
                        <Spinner className="w-8 h-8 text-emerald-600 animate-spin" />
                        <span className="text-xs font-bold text-emerald-600 uppercase tracking-tight">Processando...</span>
                    </div>
                ) : value ? (
                    useBackgroundImage ? (
                        <div
                            className="relative w-full h-full flex items-center justify-center overflow-hidden group"
                            style={{
                                backgroundImage: `url(${value})`,
                                backgroundSize: backgroundSize,
                                backgroundPosition: 'center',
                                backgroundRepeat: 'no-repeat',
                                backgroundColor: backgroundSize === 'contain' ? '#ffffff' : 'transparent',
                                transform: backgroundSize === 'contain' ? 'scale(1.2)' : 'none'
                            }}
                        >
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    removeImage();
                                }}
                                className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    ) : (
                        <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
                            <img
                                src={value}
                                alt={label}
                                className={cn(
                                    "w-full h-full transition-transform group-hover:scale-105 object-cover",
                                    imageClassName
                                )}
                            />
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    removeImage();
                                }}
                                className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    )
                ) : (
                    <div className="flex flex-col items-center gap-2 p-4 text-center">
                        <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm border border-slate-100 group-hover:scale-110 transition-transform">
                            <Upload className="w-5 h-5 text-slate-400 group-hover:text-emerald-500" />
                        </div>
                        <div className="whitespace-nowrap">
                            <p className="text-xs font-bold text-slate-600">Clique para carregar</p>
                            {recommendedSize && (
                                <p className="text-[10px] text-emerald-600 font-bold tracking-tight">recomendado: {recommendedSize}</p>
                            )}
                        </div>
                    </div>
                )}

                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    accept="image/*"
                    className="hidden"
                    disabled={uploading}
                />
            </div>

            {
                error && (
                    <div className="flex items-center gap-1.5 text-red-500 mt-1">
                        <AlertCircle className="w-3.5 h-3.5" />
                        <span className="text-[10px] font-bold uppercase">{error}</span>
                    </div>
                )
            }

        </div >
    );
}
