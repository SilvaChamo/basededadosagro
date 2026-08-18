"use client";

import { useState } from "react";
import {
    Search,
    Plus,
    Edit2,
    Trash2,
    MoreHorizontal,
    ChevronLeft,
    ChevronRight,
    Printer,
    Upload,
    MoreVertical,
    FileDown,
    Copy,
    Share2,
    ExternalLink,
    X,
    Check
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { syncManager } from "@/lib/syncManager";
import { useNetworkStatus } from "@/hooks/useNetworkStatus";
import { useEffect } from "react";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";

interface AdminDataTableProps {
    title: string;
    columns: { header: string; key: string; render?: (val: any, row: any) => React.ReactNode }[];
    data: any[];
    onEdit?: (row: any) => void;
    onDelete?: (row: any) => void;
    onAdd?: () => void;
    onExport?: () => void;
    onPrint?: () => void;
    onImport?: () => void;
    loading?: boolean;
    customActions?: (row: any) => React.ReactNode;
    pageSize?: number;
    hideHeader?: boolean;
    // Selection support
    selectedIds?: string[];
    onSelectAll?: (all: boolean) => void;
    onSelectRow?: (id: string, selected: boolean) => void;
    bulkActions?: React.ReactNode;
    headerMenu?: React.ReactNode;
    hideSearch?: boolean;
}

export function AdminDataTable({
    title,
    columns,
    data,
    onEdit,
    onDelete,
    onAdd,
    onExport,
    onPrint,
    onImport,
    loading,
    customActions,
    pageSize = 50,
    hideHeader = false,
    selectedIds = [],
    onSelectAll,
    onSelectRow,
    bulkActions,
    headerMenu,
    hideSearch = false
}: AdminDataTableProps) {
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [localData, setLocalData] = useState<any[]>(data);
    const { isOnline } = useNetworkStatus();

    // Sync local data with prop data
    useEffect(() => {
        if (!loading) {
            setLocalData(data);
            // Optionally still save for other uses, but we won't fall back here
            syncManager.saveSnapshot(title, data);
        }
    }, [data, loading, title]);

    const filteredData = localData.filter(item =>
        Object.values(item).some(val =>
            String(val).toLowerCase().includes(searchTerm.toLowerCase())
        )
    );

    const totalPages = Math.ceil(filteredData.length / pageSize);
    const paginatedData = filteredData.slice(
        (currentPage - 1) * pageSize,
        currentPage * pageSize
    );

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        // Could add a toast here
    };

    return (
        <div className="relative bg-white rounded-lg shadow-sm border border-slate-100 overflow-hidden">
            {/* Header - Google Contacts Style */}
            {!hideHeader && (
                <div className="px-6 py-4 flex items-center justify-between border-b border-slate-100">
                    <div className="flex items-center gap-4">
                        <h2 className="text-xl font-medium text-slate-800 tracking-tight">
                            {title.split('(')[0]} <span className="text-slate-400 text-sm font-normal">({filteredData.length})</span>
                        </h2>
                    </div>

                    <div className="flex items-center gap-1 text-slate-500">
                        {!hideSearch && (
                            <div className="relative mr-4">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Pesquisar..."
                                    value={searchTerm}
                                    onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                                    className="pl-10 pr-4 py-2 bg-slate-50/50 border border-slate-300 rounded-[8px] text-xs font-medium focus:ring-2 focus:ring-slate-200 transition-all outline-none w-48 md:w-64"
                                />
                            </div>
                        )}

                        {onPrint && (
                            <button onClick={onPrint} className="p-2 hover:bg-slate-100 rounded-full transition-colors" title="Imprimir">
                                <Printer className="w-5 h-5" />
                            </button>
                        )}
                        {onExport && (
                            <button onClick={onExport} className="p-2 hover:bg-slate-100 rounded-full transition-colors" title="Exportar csv">
                                <FileDown className="w-5 h-5" />
                            </button>
                        )}
                        {onImport && (
                            <button onClick={onImport} className="p-2 hover:bg-slate-100 rounded-full transition-colors" title="Importar">
                                <Upload className="w-5 h-5" />
                            </button>
                        )}

                        {headerMenu && (
                            <Popover>
                                <PopoverTrigger asChild>
                                    <button className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                                        <MoreVertical className="w-5 h-5" />
                                    </button>
                                </PopoverTrigger>
                                <PopoverContent align="end" className="w-48 p-1">
                                    {headerMenu}
                                </PopoverContent>
                            </Popover>
                        )}

                        {onAdd && (
                            <Button
                                onClick={onAdd}
                                className="bg-slate-900 hover:bg-slate-800 text-white gap-2 text-xs font-bold rounded-md ml-2 px-4 h-9"
                            >
                                <Plus className="w-4 h-4" />
                                Novo
                            </Button>
                        )}
                    </div>
                </div>
            )}

            {/* Table */}
            <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
                <table className="w-full text-left border-collapse min-w-[1000px]">
                    <thead className="bg-slate-50/50">
                        <tr>
                            {onSelectAll && (
                                <th className="px-4 py-2 w-10 border-b border-slate-100">
                                    <div className="relative flex items-center justify-center">
                                        <input
                                            type="checkbox"
                                            className="peer appearance-none size-4 rounded-full border border-slate-300 checked:bg-emerald-600 checked:border-emerald-600 bg-slate-100 cursor-pointer transition-all focus:ring-2 focus:ring-emerald-500/20 outline-none"
                                            checked={paginatedData.length > 0 && paginatedData.every(row => selectedIds.includes(row.id))}
                                            onChange={(e) => onSelectAll(e.target.checked)}
                                        />
                                        <Check className="w-2.5 h-2.5 text-white absolute pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity" strokeWidth={4} />
                                    </div>
                                </th>
                            )}
                            {columns.map((col) => (
                                <th key={col.key} className="px-4 py-2 text-[11px] font-black uppercase tracking-[0.12em] text-slate-400 border-b border-slate-100">
                                    {col.header}
                                </th>
                            ))}
                            {(onEdit || onDelete || customActions) && (
                                <th className="px-4 py-2 text-[11px] font-black uppercase tracking-[0.12em] text-slate-400 border-b border-slate-100 text-right sticky right-0 bg-slate-50/50 backdrop-blur-sm z-10">
                                    Acções
                                </th>
                            )}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {loading ? (
                            <tr>
                                <td colSpan={columns.length + (onEdit || onDelete || customActions ? 1 : 0)} className="px-4 py-10 text-center text-slate-400 text-xs font-bold italic">
                                    A carregar dados...
                                </td>
                            </tr>
                        ) : paginatedData.length === 0 ? (
                            <tr>
                                <td colSpan={columns.length + (onEdit || onDelete || customActions ? 1 : 0)} className="px-4 py-10 text-center text-slate-400 text-xs font-bold italic">
                                    Nenhum item encontrado.
                                </td>
                            </tr>
                        ) : (
                            paginatedData.map((row, i) => (
                                <tr key={i} className="hover:bg-slate-50/80 transition-colors group">
                                    {onSelectAll && (
                                        <td className="px-4 py-2 w-10">
                                            <div className="relative flex items-center justify-center">
                                                <input
                                                    type="checkbox"
                                                    className="peer appearance-none size-4 rounded-full border border-slate-300 checked:bg-emerald-600 checked:border-emerald-600 bg-slate-100 cursor-pointer transition-all focus:ring-2 focus:ring-emerald-500/20 outline-none"
                                                    checked={selectedIds.includes(row.id)}
                                                    onChange={(e) => onSelectRow?.(row.id, e.target.checked)}
                                                />
                                                <Check className="w-2.5 h-2.5 text-white absolute pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity" strokeWidth={4} />
                                            </div>
                                        </td>
                                    )}
                                    {columns.map((col) => (
                                        <td key={col.key} className="px-4 py-2 text-xs font-bold text-slate-600">
                                            {col.render ? col.render(row[col.key], row) : String(row[col.key])}
                                        </td>
                                    ))}
                                    {(onEdit || onDelete || customActions) && (
                                        <td className="px-4 py-2 text-right sticky right-0 bg-white/80 group-hover:bg-slate-50/90 backdrop-blur-sm z-10 transition-colors">
                                            <div className="flex items-center justify-end gap-1">
                                                {onEdit && (
                                                    <button
                                                        onClick={() => onEdit(row)}
                                                        className="size-7 rounded text-slate-400 flex items-center justify-center hover:bg-orange-50 hover:text-orange-600 transition-all font-bold"
                                                        title="Editar"
                                                    >
                                                        <Edit2 className="w-3.5 h-3.5" />
                                                    </button>
                                                )}
                                                {onDelete && (
                                                    <button
                                                        onClick={() => onDelete(row)}
                                                        className="size-7 rounded text-slate-400 flex items-center justify-center hover:bg-red-50 hover:text-red-600 transition-all font-bold"
                                                        title="Eliminar"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                )}
                                                {customActions && customActions(row)}
                                            </div>
                                        </td>
                                    )}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Selection Toolbar / Floating Header */}
            {selectedIds.length > 0 && (
                <div className="absolute top-0 left-0 w-full h-[60px] bg-emerald-600 text-white flex items-center justify-between px-6 z-50 animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="flex items-center gap-6">
                        <button
                            onClick={() => onSelectAll?.(false)}
                            className="p-1 hover:bg-white/10 rounded transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                        <span className="text-lg font-black tracking-tight">
                            {selectedIds.length} {selectedIds.length === 1 ? 'seleccionado' : 'seleccionados'}
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        {bulkActions}
                    </div>
                </div>
            )}

            {/* Pagination Controls - Minimalist Style */}
            <div className="px-4 py-3 border-t border-slate-50 flex items-center justify-end bg-slate-50/20">
                <div className="flex items-center gap-4">
                    <p className="text-xs font-medium text-slate-500">
                        {filteredData.length > 0 ? (
                            <>
                                {(currentPage - 1) * pageSize + 1}-
                                {Math.min(currentPage * pageSize, filteredData.length)} de {filteredData.length}
                            </>
                        ) : '0 de 0'}
                    </p>
                    <div className="flex items-center gap-1">
                        <button
                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                            disabled={currentPage === 1}
                            className="size-7 rounded-md flex items-center justify-center text-slate-400 disabled:opacity-20 transition-all hover:bg-white border border-transparent hover:border-slate-200"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                            disabled={currentPage === totalPages || totalPages === 0}
                            className="size-7 rounded-md flex items-center justify-center text-slate-400 disabled:opacity-20 transition-all hover:bg-white border border-transparent hover:border-slate-200"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
