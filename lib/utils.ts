import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Compresses an image and converts it to WebP format.
 * Ensures the file size is under the target size (default 100KB).
 */
export const compressImage = async (
  file: File | Blob,
  options: {
    maxWidth?: number;
    maxHeight?: number;
    quality?: number;
    targetSizeKb?: number;
  } = {}
): Promise<Blob> => {
  const {
    maxWidth = 1024,
    maxHeight = 1024,
    quality = 0.8,
    targetSizeKb = 100
  } = options;

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Calculate new dimensions while maintaining aspect ratio
        if (width > height) {
          if (width > maxWidth) {
            height *= maxWidth / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width *= maxHeight / height;
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error("Failed to get canvas context"));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        const attemptCompression = (q: number) => {
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error("Failed to create blob"));
                return;
              }

              if (blob.size / 1024 <= targetSizeKb || q <= 0.1) {
                resolve(blob);
              } else {
                // Reduce quality and try again
                attemptCompression(q - 0.1);
              }
            },
            'image/webp',
            q
          );
        };

        attemptCompression(quality);
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
};

/**
 * Capitalizes the first letter of each sentence in a string.
 */
export const toSentenceCase = (text: string): string => {
  if (!text) return text;

  // Split by marks that end a sentence (. ! ?) followed by space or newline
  // Keep the delimiter in the result using capture group
  return text.replace(/(^|[.!?]\s+)([a-záàâãéèêíïóôõöúç])/g, (match, prefix, char) => {
    return prefix + char.toUpperCase();
  });
};

/**
 * Ordena artigos por data decrescente (mais recentes primeiro).
 *
 * `articles.date` é uma coluna de texto livre, não uma data real — alguns
 * registos antigos (semeados directamente na BD, antes do formulário usar
 * <input type="date">) têm valores como "Fevereiro 2024" ou "02 Fev 2024"
 * em vez de "2024-02-02". Ordenar essa coluna como texto (ex: `.order('date')`
 * do Supabase) põe esses registos antigos no topo, à frente de notícias reais
 * e recentes, porque "F" e "0" ordenam à frente de "2" num sort alfabético.
 *
 * Esta função usa `date` só quando dá para interpretar como data válida;
 * caso contrário cai para `created_at` (sempre um timestamp real), para que
 * conteúdo antigo com data mal formatada nunca apareça como se fosse recente.
 */
export function sortArticlesByDateDesc<T extends { date?: string | null; created_at?: string | null }>(
  articles: T[]
): T[] {
  const effectiveTime = (a: T): number => {
    const parsedDate = a.date ? Date.parse(a.date) : NaN;
    if (!isNaN(parsedDate)) return parsedDate;
    const parsedCreatedAt = a.created_at ? Date.parse(a.created_at) : NaN;
    return isNaN(parsedCreatedAt) ? 0 : parsedCreatedAt;
  };
  return [...articles].sort((a, b) => effectiveTime(b) - effectiveTime(a));
}
