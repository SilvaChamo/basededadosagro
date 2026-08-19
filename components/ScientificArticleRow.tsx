import Link from "next/link";
import { BookOpen, Calendar, User, Building2, ArrowUpRight } from "lucide-react";

interface ScientificArticleRowProps {
    title: string;
    subtitle?: string;
    author?: string;
    source?: string;
    sourceUrl?: string;
    date: string | Date;
    category?: string;
    slug?: string;
    /** Resultado vindo da varredura global (Semantic Scholar) em vez da
     * base de dados local — o título liga directamente para `sourceUrl`
     * em vez de para `/artigos/[slug]` (que não existe para estes). */
    isExternal?: boolean;
}

export function ScientificArticleRow({
    title,
    subtitle,
    author,
    source,
    sourceUrl,
    date,
    category,
    slug,
    isExternal = false,
}: ScientificArticleRowProps) {
    const formattedDate = new Date(date).toLocaleDateString('pt-PT', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    });

    const titleClass = "text-[16px] font-bold text-slate-800 group-hover:text-emerald-600 transition-colors leading-snug tracking-tight";

    return (
        <div className="group flex gap-4 md:gap-5 p-5 bg-white rounded-[12px] border border-slate-100 hover:border-emerald-200 shadow-sm hover:shadow-md transition-all">
            <div className="shrink-0 w-11 h-11 md:w-12 md:h-12 rounded-[10px] bg-emerald-50 border border-emerald-100 flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-emerald-600" />
            </div>
            <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2 mb-1.5">
                    {category && (
                        <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-[5px] bg-orange-50 text-[#f97316] tracking-wider">
                            {category}
                        </span>
                    )}
                    <span className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        <Calendar className="w-3 h-3" />
                        {formattedDate}
                    </span>
                </div>

                {isExternal && sourceUrl ? (
                    <a href={sourceUrl} target="_blank" rel="noopener noreferrer" className="block">
                        <h3 className={titleClass}>{title}</h3>
                    </a>
                ) : (
                    <Link href={`/artigos/${slug}`} className="block">
                        <h3 className={titleClass}>{title}</h3>
                    </Link>
                )}

                {subtitle && (
                    <p className="text-[13px] text-slate-500 leading-relaxed mt-1.5 line-clamp-2">
                        {subtitle}
                    </p>
                )}

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2.5">
                    {author && (
                        <span className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500">
                            <User className="w-3 h-3 text-slate-400" />
                            {author}
                        </span>
                    )}
                    {source && (
                        <span className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500">
                            <Building2 className="w-3 h-3 text-slate-400" />
                            {source}
                        </span>
                    )}
                    {sourceUrl && (
                        <a
                            href={sourceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 hover:text-[#f97316] transition-colors ml-auto"
                        >
                            {isExternal ? 'Ver documento original' : 'Ver fonte'}
                            <ArrowUpRight className="w-3 h-3" />
                        </a>
                    )}
                </div>
            </div>
        </div>
    );
}
