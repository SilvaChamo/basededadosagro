
import Link from "next/link";
import { FileText, Calendar, Eye, Trash2, RotateCcw, Pencil, AlertCircle, Archive } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DocumentCardProps {
    id: string;
    title: string;
    subtitle?: string;
    category?: string;
    date: string;
    source?: string; // e.g. "MASA"
    sourceUrl?: string;
    slug?: string; // mantido por compatibilidade com quem passa a prop
    isDeleted?: boolean;
    onRestore?: () => void;
    onEdit?: () => void;
    onDelete?: () => void;
    onArchive?: () => void;
}

export function DocumentCard({
    id,
    title,
    subtitle,
    category,
    date,
    source,
    isDeleted,
    onRestore,
    onEdit,
    onDelete,
    onArchive
}: DocumentCardProps) {
    return (
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6 flex flex-col md:flex-row items-start md:items-center gap-6 hover:shadow-md transition-all group">
            {/* Icon Section */}
            <div className="size-14 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-colors shrink-0 border border-slate-100">
                <FileText className="w-7 h-7" />
            </div>

            {/* Content Section */}
            <div className="flex-1 space-y-2 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                    <span className="text-[9px] font-black uppercase tracking-widest bg-slate-100 text-slate-500 px-2 py-0.5 rounded">
                        {category || "Documento"}
                    </span>
                    {source && (
                        <span className="text-[9px] font-bold uppercase tracking-widest text-emerald-600 flex items-center gap-1">
                            <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                            Fonte: {source}
                        </span>
                    )}
                </div>

                <h3 className="text-lg font-bold text-slate-800 leading-tight line-clamp-2">
                    <Link href={`/admin/documentos/${id}/ver`} className="hover:text-emerald-700 transition-colors" title="Ver documento no painel">
                        {title}
                    </Link>
                </h3>

                {subtitle && (
                    <p className="text-sm text-slate-500 line-clamp-2 leading-relaxed">
                        {subtitle}
                    </p>
                )}

                <div className="flex items-center gap-3 pt-1">
                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>Publicado em {new Date(date).toLocaleDateString('pt-PT', { day: '2-digit', month: 'short', year: 'numeric' }).replace(' de ', ' de ')}</span>
                    </div>
                </div>
            </div>

            {/* Actions Section */}
            <div className="flex items-center gap-2 w-full md:w-auto mt-4 md:mt-0 justify-end border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-6">
                {isDeleted ? (
                    <>
                        <Button
                            onClick={onRestore}
                            variant="ghost"
                            size="sm"
                            className="text-emerald-600 hover:bg-emerald-50 h-9 px-3"
                            title="Restaurar"
                        >
                            <RotateCcw className="w-4 h-4 mr-2" />
                            <span className="text-xs font-bold uppercase">Restaurar</span>
                        </Button>
                        <Button
                            onClick={onDelete}
                            variant="ghost"
                            size="sm"
                            className="text-rose-600 hover:bg-rose-50 h-9 px-3"
                            title="Eliminar Permanentemente"
                        >
                            <AlertCircle className="w-4 h-4 mr-2" />
                            <span className="text-xs font-bold uppercase">Eliminar</span>
                        </Button>
                    </>
                ) : (
                    <>
                        <Link
                            href={`/admin/documentos/${id}/ver`}
                            className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                            title="Ver documento no painel"
                        >
                            <Eye className="w-5 h-5" />
                        </Link>
                        <Button
                            onClick={onEdit}
                            variant="ghost"
                            size="icon"
                            className="text-slate-400 hover:text-emerald-600 hover:bg-slate-50"
                            title="Editar"
                        >
                            <Pencil className="w-5 h-5" />
                        </Button>
                        <Button
                            onClick={onArchive}
                            variant="ghost"
                            size="icon"
                            className="text-slate-400 hover:text-amber-600 hover:bg-amber-50"
                            title="Arquivar"
                        >
                            <Archive className="w-5 h-5" />
                        </Button>
                        <Button
                            onClick={onDelete}
                            variant="ghost"
                            size="icon"
                            className="text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                            title="Eliminar"
                        >
                            <Trash2 className="w-5 h-5" />
                        </Button>
                    </>
                )}
            </div>
        </div>
    );
}
