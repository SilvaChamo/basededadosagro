import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Calendar, ArrowRight, Pencil, Trash2, Link as LinkIcon, RotateCcw, Archive } from 'lucide-react';

interface NewsCardProps {
    id?: string;
    title: string;
    subtitle?: string;
    excerpt?: string;
    category: string;
    date: string | Date;
    image?: string;
    slug: string;
    isAdmin?: boolean;
    isDeleted?: boolean;
    onEdit?: () => void;
    onDelete?: () => void;
    onRestore?: () => void;
    onArchive?: () => void;
    isArchived?: boolean;
    /** Quando definido, o card deixa de ligar para /artigos/[slug] (usado
     * para candidatos ainda sem página própria, ex: notícias pendentes) —
     * a imagem, o título e o botão principal passam a chamar isto. */
    ctaLabel?: string;
    onCtaClick?: () => void;
    /** Link para a fonte original (ex: notícias pendentes vindas do robô). */
    sourceUrl?: string;
    sourceLabel?: string;
}

export function NewsCard({
    id,
    title,
    subtitle,
    excerpt,
    category,
    date,
    image,
    slug,
    isAdmin = false,
    isDeleted = false,
    isArchived = false,
    onEdit,
    onDelete,
    onRestore,
    onArchive,
    ctaLabel,
    sourceUrl,
    sourceLabel,
    onCtaClick,
}: NewsCardProps) {
    const formattedDate = new Date(date).toLocaleDateString('pt-PT', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });

    return (
        <div className={`group flex flex-col ${image ? 'h-full' : ''} bg-white rounded-[10px] shadow-lg border border-slate-100 hover:border-[#f97316]/50 transition-all overflow-hidden hover:shadow-xl`}>
            {image ? (
                /* Image Section */
                onCtaClick ? (
                    <button type="button" onClick={onCtaClick} className="relative aspect-[16/10] overflow-hidden block border-b-4 border-[#f97316] w-full text-left">
                        <Image
                            src={image}
                            alt={title}
                            fill
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            className="object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                        <div className="absolute top-4 left-4 bg-[#f97316] text-white text-[9px] font-black uppercase px-2.5 py-1 rounded-[6px] shadow-lg">
                            {category || "Artigo"}
                        </div>
                    </button>
                ) : (
                    <Link href={`/artigos/${slug}`} className="relative aspect-[16/10] overflow-hidden block border-b-4 border-[#f97316]">
                        <Image
                            src={image}
                            alt={title}
                            fill
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            className="object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                        <div className="absolute top-4 left-4 bg-[#f97316] text-white text-[9px] font-black uppercase px-2.5 py-1 rounded-[6px] shadow-lg">
                            {category || "Artigo"}
                        </div>
                    </Link>
                )
            ) : (
                /* Sem imagem: faixa cinza suave com o badge da categoria, linha laranja fina por baixo */
                <div className="px-5 py-4 bg-slate-50 border-b border-[#f97316]">
                    <span className="inline-block bg-[#f97316] text-white text-[9px] font-black uppercase px-2.5 py-1 rounded-[6px]">
                        {category || "Artigo"}
                    </span>
                </div>
            )}

            {/* Content Section */}
            <div className="p-5 flex flex-col flex-1">
                <div className="flex flex-col">
                    {/* Date */}
                    <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                        <Calendar className="w-3 h-3 text-[#f97316]" />
                        <span>{formattedDate}</span>
                    </div>

                    {/* Title */}
                    {onCtaClick ? (
                        <button type="button" onClick={onCtaClick} className="block text-left">
                            <h3
                                className="text-[15px] font-bold text-slate-800 group-hover:text-[#f97316] transition-colors leading-[1.4] tracking-tighter first-letter:uppercase my-0 mb-1"
                                style={{
                                    display: '-webkit-box',
                                    WebkitBoxOrient: 'vertical',
                                    WebkitLineClamp: 3,
                                    overflow: 'hidden',
                                }}
                            >
                                {title}
                            </h3>
                        </button>
                    ) : (
                        <Link href={`/artigos/${slug}`} className="block">
                            <h3
                                className="text-[15px] font-bold text-slate-800 group-hover:text-[#f97316] transition-colors leading-[1.4] tracking-tighter first-letter:uppercase my-0 mb-1"
                                style={{
                                    display: '-webkit-box',
                                    WebkitBoxOrient: 'vertical',
                                    WebkitLineClamp: 3,
                                    overflow: 'hidden',
                                }}
                            >
                                {title}
                            </h3>
                        </Link>
                    )}
                    {subtitle && (
                        <p
                            className="text-xs text-slate-500 leading-relaxed my-0"
                            style={{
                                display: '-webkit-box',
                                WebkitBoxOrient: 'vertical',
                                WebkitLineClamp: 3,
                                overflow: 'hidden',
                            }}
                        >
                            {subtitle}
                        </p>
                    )}
                    {sourceUrl && (
                        <a
                            href={sourceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 hover:text-emerald-600 transition-colors mt-1 truncate"
                        >
                            <LinkIcon className="w-3 h-3 shrink-0" />
                            {sourceLabel || 'Ver fonte original'}
                        </a>
                    )}
                </div>

                {/* Footer/Actions */}
                <div className="mt-auto pt-4 flex items-center justify-between border-t border-slate-50">
                    {onCtaClick ? (
                        <button
                            type="button"
                            onClick={onCtaClick}
                            className="flex items-center gap-2 text-sm font-bold text-emerald-600 group-hover:text-[#f97316] transition-colors"
                        >
                            {ctaLabel || 'Explorar'} <ArrowRight className="h-4 w-4" />
                        </button>
                    ) : (
                        <Link
                            href={`/artigos/${slug}`}
                            className="flex items-center gap-2 text-sm font-bold text-emerald-600 group-hover:text-[#f97316] transition-colors"
                        >
                            {ctaLabel || 'Explorar'} <ArrowRight className="h-4 w-4" />
                        </Link>
                    )}

                    {isAdmin && (
                        <div className="flex gap-2">
                            {!isDeleted && (
                                <>
                                    <button
                                        type="button"
                                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); onEdit?.(); }}
                                        className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-50 text-slate-400 hover:bg-emerald-50 hover:text-emerald-600 transition-all border border-slate-100"
                                        title="Editar"
                                    >
                                        <Pencil className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); onArchive?.(); }}
                                        className={`w-8 h-8 flex items-center justify-center rounded-lg ${isArchived ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-400 hover:bg-amber-50 hover:text-amber-600'} transition-all border border-slate-100`}
                                        title={isArchived ? "Desarquivar" : "Arquivar"}
                                    >
                                        <Archive className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); onDelete?.(); }}
                                        className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-50 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-all border border-slate-100"
                                        title="Eliminar"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                </>
                            )}
                            {isDeleted && (
                                <button
                                    type="button"
                                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); onRestore?.(); }}
                                    className="w-8 h-8 flex items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-all border border-emerald-200"
                                    title="Restaurar"
                                >
                                    <RotateCcw className="w-3.5 h-3.5" />
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
