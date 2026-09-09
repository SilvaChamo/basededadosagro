import type { Metadata } from "next";
import { MaderPanel } from "@/components/mader/MaderPanel";

export const metadata: Metadata = {
    title: "Painel Institucional — Base de Dados Agrícolas",
    robots: { index: false, follow: false },
};

export default function MaderPage() {
    return <MaderPanel />;
}
