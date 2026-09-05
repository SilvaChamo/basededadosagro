import Link from "next/link";
import { CloudRain, Sun, Wind, Droplets, AlertTriangle, TrendingDown, Info, ArrowRight } from "lucide-react";

export function MarketSidebar() {
    return (
        <div className="space-y-6 sticky top-24">

            {/* 1. Weather Widget */}
            <div className="bg-white rounded-[10px] shadow-sm border border-slate-100 overflow-hidden">
                <div className="bg-sky-50 p-4 border-b border-sky-100 flex justify-between items-center">
                    <h3 className="font-bold text-slate-700 flex items-center gap-2">
                        <Sun className="w-5 h-5 text-amber-500" />
                        Tempo Agrícola
                    </h3>
                    <span className="text-xs font-semibold text-sky-700 bg-sky-100 px-2 py-1 rounded-full">Hoje</span>
                </div>
                <div className="p-5">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <p className="text-4xl font-black text-slate-800">28°C</p>
                            <p className="text-slate-500 font-medium">Maputo, Moçambique</p>
                        </div>
                        <Sun className="w-14 h-14 text-amber-400 animate-pulse" />
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center gap-2 text-slate-600 bg-slate-50 p-2 rounded-lg">
                            <Droplets className="w-4 h-4 text-cyan-500" />
                            <span>Humidade: <b className="text-slate-800">65%</b></span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-600 bg-slate-50 p-2 rounded-lg">
                            <Wind className="w-4 h-4 text-slate-400" />
                            <span>Vento: <b className="text-slate-800">12km/h</b></span>
                        </div>
                    </div>
                </div>
            </div>

            {/* 2. Weather Alert */}
            <div className="bg-red-50 rounded-[10px] border border-red-100 p-5 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-24 h-24 bg-red-100 rounded-bl-full -mr-4 -mt-4 opacity-50 transition-transform group-hover:scale-110"></div>
                <div className="flex items-start gap-3 relative z-10">
                    <div className="bg-red-100 p-2 rounded-lg shrink-0 text-red-600">
                        <AlertTriangle className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="font-bold text-red-800 text-lg mb-1">Alerta de Mau Tempo</h3>
                        <p className="text-red-700/80 text-sm leading-relaxed mb-3">
                            Previsão de chuvas fortes e ventos moderados nas províncias de <b>Gaza e Inhambane</b> nas próximas 48h. Proteja as colheitas.
                        </p>
                        <p className="text-xs text-red-600 font-semibold">• Emitido há 2h pelo INAM</p>
                    </div>
                </div>
            </div>

            {/* 3. Price Drop Alert */}
            <div className="bg-white rounded-[10px] shadow-sm border border-slate-100 p-5 group hover:border-emerald-200 transition-colors">
                <div className="flex items-center gap-2 mb-4">
                    <div className="bg-emerald-100 p-1.5 rounded-md text-emerald-600">
                        <TrendingDown className="w-5 h-5" />
                    </div>
                    <h3 className="font-bold text-slate-700">Baixa de Preço</h3>
                </div>

                <div className="flex items-end gap-3 mb-2">
                    <span className="text-3xl font-black text-slate-800">15%</span>
                    <span className="text-sm text-slate-500 mb-1.5">menos no tomate 🍅</span>
                </div>
                <p className="text-slate-600 text-sm mb-4">
                    Grande oferta de tomate nacional no <b>Mercado Grossista do Zimpeto</b> provocou descida de preços hoje.
                </p>
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 w-3/4 rounded-full"></div>
                </div>
                <div className="flex justify-between text-xs text-slate-400 mt-2">
                    <span>Alta Procura</span>
                    <span>Média Oferta</span>
                </div>
            </div>

            {/* 4. Market Info / Hints */}
            <div className="bg-slate-900 rounded-[10px] p-6 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#f97316] rounded-full blur-[60px] opacity-20"></div>

                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                    <Info className="w-5 h-5 text-[#f97316]" />
                    Destaques do Sector
                </h3>

                <div className="space-y-4">
                    <div className="pb-4 border-b border-slate-700/50">
                        <span className="text-xs text-[#f97316] font-bold uppercase tracking-wider mb-1 block">Exportação</span>
                        <p className="text-slate-300 text-sm hover:text-white transition-colors cursor-pointer">
                            Simplificados processos de exportação para feijão boer e gergelim.
                        </p>
                    </div>
                    <div className="pb-4 border-b border-slate-700/50">
                        <span className="text-xs text-emerald-400 font-bold uppercase tracking-wider mb-1 block">Evento</span>
                        <p className="text-slate-300 text-sm hover:text-white transition-colors cursor-pointer">
                            Feira Agrária de Chimoio confirmada para 25-30 de Janeiro.
                        </p>
                    </div>
                    <div>
                        <span className="text-xs text-blue-400 font-bold uppercase tracking-wider mb-1 block">Tecnologia</span>
                        <p className="text-slate-300 text-sm hover:text-white transition-colors cursor-pointer">
                            Novo sistema de rega solar subsidiado pelo governo disponível.
                        </p>
                    </div>
                </div>

                <Link href="/blog" className="flex items-center gap-2 text-[#f97316] text-sm font-bold mt-6 hover:gap-3 transition-all">
                    Ver todas notícias <ArrowRight className="w-4 h-4" />
                </Link>
            </div>

        </div>
    );
}
