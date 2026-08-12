"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";

import { toast } from "sonner";
import { Loader2, FileText, ArrowRight } from "lucide-react";

export default function MigratePage() {
    const supabase = createClient();
    const [articles, setArticles] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [classifying, setClassifying] = useState(false);

    const fetchArticles = async () => {
        setLoading(true);
        // Fetch everything that is NOT already a Documento
        const { data, error } = await supabase
            .from('articles')
            .select('*')
            .neq('type', 'Documento')
            .order('created_at', { ascending: false });

        if (data) setArticles(data);
        setLoading(false);
    };

    useEffect(() => {
        fetchArticles();
    }, []);

    const toggleSelection = (id: string) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const handleMigrate = async () => {
        if (selectedIds.length === 0) return;
        setClassifying(true);

        try {
            const { error, count } = await supabase
                .from('articles')
                .update({ type: 'Documento' }, { count: 'exact' })
                .in('id', selectedIds);

            if (error) throw error;

            if (count === 0) {
                toast.error("Nenhum artigo foi actualizado. Verifique as permissões.");
            } else {
                toast.success(`${count} itens movidos para Documentos com sucesso!`);
                setSelectedIds([]);
                await fetchArticles();
            }
        } catch (error: any) {
            console.error("Migration error:", error);
            toast.error("Erro ao migrar: " + error.message);
        } finally {
            setClassifying(false);
        }
    };

    return (
        <div className="p-8 max-w-5xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Migração de Documentos</h1>
                    <p className="text-slate-500">Seleccione os artigos que devem ser movidos para a aba "Documentos".</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="text-sm text-slate-500">
                        {selectedIds.length} seleccionados
                    </div>
                    <Button
                        onClick={handleMigrate}
                        disabled={selectedIds.length === 0 || classifying}
                        className="bg-emerald-600 hover:bg-emerald-700"
                    >
                        {classifying && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                        Mover para Documentos
                    </Button>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                {loading ? (
                    <div className="p-8 flex justify-center">
                        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
                    </div>
                ) : (
                    <div className="divide-y divide-slate-100">
                        {articles.map((article) => (
                            <div
                                key={article.id}
                                className={`p-4 flex items-center gap-4 hover:bg-slate-50 cursor-pointer transition-colors ${selectedIds.includes(article.id) ? 'bg-emerald-50/50' : ''}`}
                                onClick={() => toggleSelection(article.id)}
                            >
                                <input
                                    type="checkbox"
                                    className="w-5 h-5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer accent-emerald-600"
                                    checked={selectedIds.includes(article.id)}
                                    onChange={() => toggleSelection(article.id)}
                                />
                                <div className="w-12 h-12 rounded-lg bg-slate-100 flex-shrink-0 overflow-hidden">
                                    {article.image_url ? (
                                        <img src={article.image_url} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <FileText className="w-5 h-5 text-slate-400" />
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-semibold text-slate-900 truncate">{article.title}</h3>
                                    <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                                        <span className="bg-slate-100 px-1.5 py-0.5 rounded uppercase font-bold tracking-wider">{article.type || 'Sem Tipo'}</span>
                                        <span>•</span>
                                        <span>{new Date(article.created_at).toLocaleDateString()}</span>
                                    </div>
                                </div>
                                {selectedIds.includes(article.id) && (
                                    <div className="flex items-center text-emerald-600 text-sm font-medium animate-in fade-in slide-in-from-right-4">
                                        Mover <ArrowRight className="w-4 h-4 ml-1" /> Documentos
                                    </div>
                                )}
                            </div>
                        ))}
                        {articles.length === 0 && (
                            <div className="p-8 text-center text-slate-500">
                                Nenhum artigo encontrado para migração.
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
