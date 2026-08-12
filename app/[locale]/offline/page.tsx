import Link from "next/link";
import { WifiOff } from "lucide-react";

export default function OfflinePage() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
            <div className="bg-slate-50 p-6 rounded-full mb-6">
                <WifiOff className="w-12 h-12 text-slate-400" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mb-2">Estás Offline</h1>
            <p className="text-slate-600 mb-8 max-w-md">
                Parece que ficaste sem ligação à internet. Podes continuar a navegar nas páginas que já visitaste anteriormente.
            </p>
            <Link
                href="/"
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3 rounded-agro-btn font-bold transition-all shadow-lg"
            >
                Voltar ao Início
            </Link>
        </div>
    );
}
