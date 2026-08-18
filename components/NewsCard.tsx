import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Calendar, ArrowRight, Pencil, Trash2, Link as LinkIcon, RotateCcw, Archive, Check } from 'lucide-react';

// Cores dos badges de categoria: só as cores da marca do site. A categoria
// principal (primeira selecionada) mantém sempre o laranja de destaque; as
// categorias adicionais usam uma das 3 tonalidades de verde (hash
// determinístico do nome, para se manter consistente entre cards).
const GREEN_SHADES = ["bg-emerald-500", "bg-emerald-600", "bg-emerald-700"];

function categoryColor(name: string, index: number) {
    if (index === 0) return "bg-[#f97316]";
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return GREEN_SHADES[Math.abs(hash) % GREEN_SHADES.length];
}

interface NewsCardProps {
    id?: string;
    title: string;
    subtitle?: string;
    excerpt?: string;
    category: string;
    /** Todas as categorias selecionadas para a notícia (opcional). Quando
     * definida, cada uma aparece como um badge de cor própria; sem ela,
     * cai-se de volta ao badge único de `category`. */
    categories?: string[];
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
    /** Selecção múltipla (vista em grelha) — mostra uma checkbox sobre o card
     * para marcar vários itens de uma vez para acções em massa. */
    selectable?: boolean;
    selected?: boolean;
    onToggleSelect?: () => void;
}

export function NewsCard({
    id,
    title,
    subtitle,
    excerpt,
    category,
    categories,
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
    selectable = false,
    selected = false,
    onToggleSelect,
}: NewsCardProps) {
    const formattedDate = new Date(date).toLocaleDateString('pt-PT', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });

    const displayCategories = categories && categories.length > 0 ? categories : [category || "Artigo"];

    return (
        <div className={`flex flex-col ${image ? 'h-full' : ''}`}>
            <div className={`group relative flex flex-col ${image ? 'flex-1' : ''} bg-white ${image ? 'rounded-[10px]' : 'rounded-b-[10px] border-t-4 border-t-orange-200 hover:border-t-[#f97316]'} shadow-lg border ${selected ? 'border-emerald-500 ring-2 ring-emerald-500' : 'border-slate-100 hover:border-[#f97316]/50'} transition-all overflow-hidden hover:shadow-xl`}>
            {selectable && (
                <div className="absolute top-3 left-3 z-20 flex items-center gap-2">
                    <button
                        type="button"
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); onToggleSelect?.(); }}
                        title={selected ? "Retirar da selecção" : "Seleccionar"}
                    >
                        <span className={`size-5 rounded-full border-2 flex items-center justify-center shadow transition-all ${selected ? 'bg-emerald-600 border-emerald-600' : 'bg-white/90 border-slate-300 hover:border-emerald-500'}`}>
                            {selected && <Check className="w-3 h-3 text-white" strokeWidth={4} />}
                        </span>
                    </button>
                    {!image && (
                        <span className="flex items-center gap-1 text-[10px] font-bold text-slate-500 uppercase tracking-wider bg-white/90 px-2 py-1 rounded-full shadow">
                            <Calendar className="w-3 h-3 text-[#f97316]" />
                            {formattedDate}
                        </span>
                    )}
                </div>
            )}
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
                        <div className="absolute top-4 left-4 right-4 flex flex-wrap gap-1.5">
                            {displayCategories.map((cat, i) => (
                                <span key={cat} className={`${categoryColor(cat, i)} text-white text-[9px] font-black uppercase px-2.5 py-1 rounded-[6px] shadow-lg`}>
                                    {cat}
                                </span>
                            ))}
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
                        <div className="absolute top-4 left-4 right-4 flex flex-wrap gap-1.5">
                            {displayCategories.map((cat, i) => (
                                <span key={cat} className={`${categoryColor(cat, i)} text-white text-[9px] font-black uppercase px-2.5 py-1 rounded-[6px] shadow-lg`}>
                                    {cat}
                                </span>
                            ))}
                        </div>
                    </Link>
                )
            ) : null}

            {/* Content Section */}
            <div className="p-5 flex flex-col flex-1">
                <div className="flex flex-col">
                    {/* Date */}
                    <div className={`flex items-center gap-2 mb-1 ${selectable && !image ? 'justify-end' : 'justify-between'}`}>
                        {!(selectable && !image) && (
                            <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                <Calendar className="w-3 h-3 text-[#f97316]" />
                                <span>{formattedDate}</span>
                            </div>
                        )}
                        {!image && (
                            <div className="flex flex-wrap justify-end gap-1.5 max-w-[65%]">
                                {displayCategories.map((cat, i) => (
                                    <span key={cat} className={`inline-block ${categoryColor(cat, i)} text-white text-[9px] font-black uppercase px-2.5 py-1 rounded-[6px]`}>
                                        {cat}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Title */}
                    {onCtaClick ? (
                        <button type="button" onClick={onCtaClick} className="block text-left">
                            <h3
                                className="text-[16px] font-bold text-slate-800 group-hover:text-[#f97316] transition-colors leading-[1.4] tracking-tighter first-letter:uppercase my-0 mb-1 min-h-[4.2em]"
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
                                className="text-[16px] font-bold text-slate-800 group-hover:text-[#f97316] transition-colors leading-[1.4] tracking-tighter first-letter:uppercase my-0 mb-1 min-h-[4.2em]"
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
        </div>
    );
}
