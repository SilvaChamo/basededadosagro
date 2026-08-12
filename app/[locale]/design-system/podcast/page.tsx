import { AgroCastSection } from "@/components/AgroCastSection";

export default function PodcastDesignPage() {
    return (
        <div className="min-h-screen bg-slate-50 pt-20">
            <div className="container-site mb-8">
                <h1 className="text-2xl font-bold text-slate-800">Ambiente de Desenvolvimento: AgroCast</h1>
                <p className="text-slate-500">Área isolada para refinamento do módulo de podcast/vídeo.</p>
            </div>

            <AgroCastSection />
        </div>
    );
}
