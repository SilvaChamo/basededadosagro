import { cn } from "@/lib/utils";

interface SpinnerProps {
    className?: string;
}

/** Spinner único do site: anel laranja fino com ponta a esbater. Usar em
 * todo o lado onde antes havia Loader2/animate-spin — nunca criar outro. */
export function Spinner({ className }: SpinnerProps) {
    return (
        <div
            className={cn("inline-block animate-spin rounded-full", className)}
            style={{
                background:
                    "conic-gradient(from 0deg, transparent 0%, transparent 10%, #f97316 100%)",
                WebkitMask:
                    "radial-gradient(farthest-side, transparent calc(100% - 2px), #000 calc(100% - 2px))",
                mask: "radial-gradient(farthest-side, transparent calc(100% - 2px), #000 calc(100% - 2px))",
            }}
            role="status"
            aria-label="A carregar"
        />
    );
}
