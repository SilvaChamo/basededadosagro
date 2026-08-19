import Link from "next/link";
import { Calendar, ArrowUpRight } from "lucide-react";

interface ScientificArticleRowProps {
    title: string;
    subtitle?: string;
    author?: string;
    source?: string;
    sourceUrl?: string;
    /** Link directo ao PDF (quando o Semantic Scholar o disponibiliza via
     * openAccessPdf) — mostra o selo "PDF" e passa a ser o link preferido
     * no canto direito, em vez do sourceUrl genérico. */
    pdfUrl?: string;
    date: string | Date;
    category?: string;
    slug?: string;
    /** Resultado vindo da varredura global (Semantic Scholar) em vez da
     * base de dados local — o título liga directamente para `sourceUrl`
     * em vez de para `/artigos/[slug]` (que não existe para estes). */
    isExternal?: boolean;
}

function domainFromUrl(url: string) {
    try {
        return new URL(url).hostname.replace(/^www\./, '');
    } catch {
        return url;
    }
}

export function ScientificArticleRow({
    title,
    subtitle,
    author,
    source,
    sourceUrl,
    pdfUrl,
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

    const realLink = pdfUrl || sourceUrl;
    const authorSource = [author, source].filter(Boolean).join(' - ');
    const titleClass = "text-[17px] font-bold text-slate-800 hover:text-emerald-700 hover:underline transition-colors leading-snug tracking-tight";

    return (
        <div className="py-6 first:pt-0">
            <div className="flex items-start justify-between gap-6">
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
                        <a href={sourceUrl} target="_blank" rel="noopener noreferrer">
                            <h3 className={titleClass}>{title}</h3>
                        </a>
                    ) : (
                        <Link href={`/artigos/${slug}`}>
                            <h3 className={titleClass}>{title}</h3>
                        </Link>
                    )}

                    {authorSource && (
                        <p className="text-[12px] font-bold text-emerald-700/80 mt-1">
                            {authorSource}
                        </p>
                    )}

                    {subtitle && (
                        <p className="text-[13px] text-slate-500 leading-relaxed mt-2 line-clamp-2">
                            {subtitle}
                        </p>
                    )}
                </div>

                {realLink && (
                    <a
                        href={realLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="shrink-0 flex items-center gap-1.5 text-[11px] font-bold text-slate-500 hover:text-emerald-700 transition-colors"
                    >
                        {pdfUrl && (
                            <span className="px-1.5 py-0.5 rounded-[4px] bg-rose-50 text-rose-600 border border-rose-100 text-[9px] font-black tracking-wide">
                                PDF
                            </span>
                        )}
                        <span className="truncate max-w-[140px]">{domainFromUrl(realLink)}</span>
                        <ArrowUpRight className="w-3 h-3 shrink-0" />
                    </a>
                )}
            </div>
        </div>
    );
}
