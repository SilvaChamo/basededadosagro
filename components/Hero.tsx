import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";
import { useTranslations } from 'next-intl';

interface HeroProps {
    onToggleSearch: () => void;
    isSearchOpen: boolean;
    stats: Record<string, any>;
}

export function Hero({ onToggleSearch, isSearchOpen, stats }: HeroProps) {
    const t = useTranslations('Hero');

    // Função auxiliar para obter o valor com segurança
    const getVal = (slug: string, fallback: string) => stats[slug]?.value || fallback;
    const getTrend = (slug: string, fallback: string) => stats[slug]?.trend || fallback;

    return (
        <section className="relative w-full min-h-[110vh] md:h-[calc(100vh-30px)] md:min-h-[670px] flex items-center justify-center overflow-hidden">
            {/* Imagem de Fundo */}
            <div className="absolute inset-0 z-0">
                <Image
                    src="/assets/hero-bg-new.webp"
                    alt={t('title.part1')}
                    fill
                    className="object-cover"
                    priority
                />
                {/* Sobreposição escura para legibilidade do texto */}
                <div className="absolute inset-0 bg-black/60 shadow-[inset_0_0_100px_rgba(0,0,0,0.8)]" />

                {/* Efeito Visual (Blob) */}
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-emerald-500/20 rounded-full blur-[100px] -mr-40 -mt-40 pointer-events-none z-10 animate-pulse-slow"></div>
            </div>

            {/* Contentor de Conteúdo */}
            <div className="relative z-10 container-site grid grid-cols-1 lg:grid-cols-2 gap-12 items-center h-full pt-20">

                {/* Coluna Esquerda: Texto e Ações */}
                <div className="space-y-8 animate-in slide-in-from-left-6 duration-700">
                    <div className="space-y-4">
                        <h1 className="text-[28px] md:text-[32px] lg:text-[48px] font-heading font-black text-white leading-[1.2] tracking-tight">
                            <span className="block">{t('title.part1')}</span>
                            <span className="block">{t('title.part2')}</span>
                            <span className="block text-[#22c55e]">{t('title.country')}</span>
                        </h1>
                        <p className="text-base md:text-lg text-gray-200 max-w-xl font-sans leading-relaxed">
                            {t('description')}
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-4">
                        <Link href="/parceria#secao-parceria">
                            <Button className="bg-emerald-700 hover:bg-[#f97316] text-white px-8 py-6 rounded-[7px] text-sm font-medium uppercase tracking-wider shadow-md transition-colors duration-300">
                                {t('buttons.partner')}
                            </Button>
                        </Link>
                        <Link href="/sobre-nos">
                            <Button variant="outline" className="bg-[#5c3a1e]/80 border-[#f97316] text-white hover:bg-[#f97316] hover:border-[#f97316] hover:text-white px-8 py-6 rounded-[7px] text-sm font-medium uppercase tracking-wider backdrop-blur-sm transition-all duration-300">
                                {t('buttons.learn_more')}
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Coluna Direita: Grelha de Cartões de Estatísticas */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 animate-in slide-in-from-right-6 duration-700 delay-200">
                    {/* Cartão 1: Empresas Agrárias */}
                    <Link href="/estatisticas/empresas" className="block h-full animate-float">
                        <div className="bg-gradient-to-br from-white/20 to-white/5 border border-[#f97316]/50 p-5 rounded-[12px] shadow-2xl hover:from-white/30 hover:to-white/10 hover:border-[#f97316] hover:shadow-[0_0_40px_rgba(249,115,22,0.4)] hover:scale-[1.03] transition-all duration-500 group relative overflow-hidden h-full cursor-pointer">
                            {/* Shine Sweep Effect */}
                            <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-[100%] group-hover:animate-shine transition-transform duration-1000"></div>

                            <div className="absolute top-3 right-3 opacity-50">
                                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                            </div>
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-white/70 group-hover:text-white mb-2 truncate drop-shadow-md transition-colors" suppressHydrationWarning>{t('stats.companies.title')}</h4>
                            <h3 className="text-4xl font-heading font-black text-white mb-1 drop-shadow-md group-hover:scale-105 transition-transform origin-left" suppressHydrationWarning><span>{getVal('hero-companies', '950+')}</span></h3>
                            <p className="text-xs text-gray-200 uppercase tracking-wider drop-shadow-sm group-hover:text-white transition-colors">{t('stats.companies.subtitle')}</p>
                            <div className="mt-4 w-full h-1 bg-black/20 rounded-full overflow-hidden">
                                <div className="h-full bg-[#f97316] w-[85%] shadow-[0_0_15px_rgba(249,115,22,0.6)] group-hover:w-[90%] transition-all duration-700"></div>
                            </div>
                        </div>
                    </Link>

                    {/* Cartão 2: Produção Agrária 2025 */}
                    <Link href="/estatisticas/producao" className="block h-full animate-float-delayed">
                        <div className="bg-gradient-to-br from-white/20 to-white/5 border border-white/20 p-5 rounded-[12px] shadow-2xl hover:from-white/30 hover:to-white/10 hover:border-[#f97316] hover:shadow-[0_0_40px_rgba(249,115,22,0.4)] hover:scale-[1.03] transition-all duration-500 group relative overflow-hidden h-full cursor-pointer">
                            {/* Shine Sweep Effect */}
                            <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-[100%] group-hover:animate-shine transition-transform duration-1000"></div>

                            <h4 className="text-[10px] font-black uppercase tracking-widest text-white/70 group-hover:text-white mb-2 truncate drop-shadow-md transition-colors" suppressHydrationWarning>{t('stats.production.title')}</h4>
                            <div className="flex items-baseline gap-1 group-hover:scale-105 transition-transform origin-left">
                                <h3 className="text-4xl font-heading font-black text-white drop-shadow-md" suppressHydrationWarning><span>{getVal('hero-production', '20M+').split(' ')[0]}</span></h3>
                                <span className="text-sm font-bold text-gray-200">{t('stats.production.unit')}</span>
                            </div>
                            <p className="text-xs text-green-300 mt-2 uppercase tracking-wider flex items-center gap-1 font-bold drop-shadow-sm group-hover:text-green-400 transition-colors">
                                <span className="text-lg animate-bounce">↑</span> {t('stats.production.growth')}
                            </p>
                        </div>
                    </Link>

                    {/* Cartão 3: Economia Agrária 2025 */}
                    <Link href="/estatisticas/economia" className="block h-full md:col-span-2 lg:col-span-1 animate-float">
                        <div className="bg-gradient-to-br from-white/20 to-white/5 border border-white/20 p-5 rounded-[12px] shadow-2xl hover:from-white/30 hover:to-white/10 hover:border-[#f97316] hover:shadow-[0_0_40px_rgba(249,115,22,0.4)] hover:scale-[1.03] transition-all duration-500 group relative overflow-hidden h-full cursor-pointer">
                            {/* Shine Sweep Effect */}
                            <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-[100%] group-hover:animate-shine transition-transform duration-1000"></div>

                            <h4 className="text-[10px] font-black uppercase tracking-widest text-white/70 group-hover:text-white mb-2 truncate drop-shadow-md transition-colors" suppressHydrationWarning>{t('stats.economy.title')}</h4>
                            <div className="space-y-1 group-hover:scale-105 transition-transform origin-left">
                                <h3 className="text-3xl font-heading font-black text-white leading-tight drop-shadow-md" suppressHydrationWarning><span>{getVal('hero-economy', '91.4B').split(' ')[0]}</span> <span className="text-base text-gray-200">{t('stats.economy.unit')}</span></h3>
                                <p className="text-xs text-gray-200 uppercase tracking-wider drop-shadow-sm group-hover:text-white transition-colors">{t('stats.economy.subtitle')}</p>
                                <div className="w-full h-1.5 bg-black/20 rounded-full mt-2 overflow-hidden">
                                    <div className="h-full w-[24%] bg-emerald-500 shadow-[0_0_15px_rgba(34,197,94,0.6)] group-hover:w-[30%] transition-all duration-700" title={t('stats.economy.trend')}></div>
                                </div>
                                <p className="text-[10px] text-right text-gray-300 group-hover:text-white mt-1 transition-colors" suppressHydrationWarning><span>{getTrend('hero-economy', t('stats.economy.trend'))}</span></p>
                            </div>
                        </div>
                    </Link>

                    {/* Cartão 4: Empregos na Agricultura */}
                    <Link href="/estatisticas/emprego" className="block h-full md:col-span-2 lg:col-span-1 animate-float-delayed">
                        <div className="bg-gradient-to-br from-white/20 to-white/5 border border-white/20 p-5 rounded-[12px] shadow-2xl hover:from-white/30 hover:to-white/10 hover:border-[#f97316] hover:shadow-[0_0_40px_rgba(249,115,22,0.4)] hover:scale-[1.03] transition-all duration-500 group relative overflow-hidden h-full cursor-pointer">
                            {/* Shine Sweep Effect */}
                            <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-[100%] group-hover:animate-shine transition-transform duration-1000"></div>

                            <h4 className="text-[10px] font-black uppercase tracking-widest text-emerald-500 mb-2 truncate drop-shadow-md group-hover:text-emerald-400 transition-colors" suppressHydrationWarning>{t('stats.jobs.title')}</h4>
                            <div className="flex items-end gap-2 group-hover:scale-105 transition-transform origin-left">
                                <h3 className="text-4xl font-heading font-black text-white leading-none drop-shadow-md" suppressHydrationWarning><span>{getVal('hero-jobs', '70%')}</span></h3>
                                <p className="text-xs text-gray-200 uppercase tracking-wider mb-1.5 drop-shadow-sm group-hover:text-white transition-colors">{t('stats.jobs.subtitle')}</p>
                            </div>
                            <p className="text-[10px] text-gray-200 group-hover:text-white mt-2 leading-tight drop-shadow-sm transition-colors">
                                {t('stats.jobs.description')}
                            </p>
                        </div>
                    </Link>

                </div>

            </div>

            {/* Botão de Pesquisa Flutuante - Alinhado à Direita do Conteúdo */}
            <div className="absolute bottom-6 w-full z-20 pointer-events-none">
                <div className="container-site mx-auto flex justify-end">
                    <button
                        onClick={onToggleSearch}
                        className={`w-12 h-12 rounded-[7px] flex items-center justify-center transition-all duration-300 shadow-xl pointer-events-auto animate-in fade-in slide-in-from-bottom-8 duration-700 ${isSearchOpen
                            ? "bg-transparent text-[#f97316] rotate-90 border-0 shadow-none"
                            : "bg-[#22c55e] text-white hover:bg-[#f97316] hover:scale-110"
                            }`}
                    >
                        {isSearchOpen ? <X className="w-6 h-6" /> : <Search className="w-6 h-6" />}
                    </button>
                </div>
            </div>
        </section>
    );
}
