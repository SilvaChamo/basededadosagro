"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Database, CheckCircle, AlertCircle, Loader2 } from "lucide-react";

export default function MigratePresentationsPage() {
    const [loading, setLoading] = useState(false);
    const [done, setDone] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const supabase = createClient();

    const runMigration = async () => {
        setLoading(true);
        setError(null);

        try {
            // First, test if the column already exists by trying to query it
            const { data: testData, error: testError } = await supabase
                .from('presentations')
                .select('id, status')
                .limit(1);

            if (!testError) {
                // Column already exists
                toast.success("A coluna 'status' já existe na tabela!");
                setDone(true);
                setLoading(false);
                return;
            }

            // If we get here, the column doesn't exist - we need to add it via SQL
            // Since we can't run DDL directly, we'll add it by updating records
            // This is a workaround - the actual column needs to be added via Supabase Dashboard

            setError("A coluna 'status' ainda não existe. Por favor, adicione manualmente no Supabase Dashboard:\n\nSQL Editor → Nova Query:\nALTER TABLE public.presentations ADD COLUMN IF NOT EXISTS status text DEFAULT 'active';");
            setLoading(false);

        } catch (err: any) {
            setError(err.message);
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto py-20">
            <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
                <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center">
                        <Database className="w-6 h-6 text-emerald-600" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">Migração de Apresentações</h1>
                        <p className="text-slate-500">Adicionar coluna de status para arquivar/eliminar</p>
                    </div>
                </div>

                {done ? (
                    <div className="bg-emerald-50 rounded-xl p-6 flex items-start gap-4">
                        <CheckCircle className="w-6 h-6 text-emerald-600 flex-shrink-0" />
                        <div>
                            <h3 className="font-bold text-emerald-800">Migração Completa!</h3>
                            <p className="text-emerald-600 text-sm mt-1">A coluna status foi verificada/adicionada. As funcionalidades de arquivar e eliminar devem funcionar agora.</p>
                        </div>
                    </div>
                ) : error ? (
                    <div className="bg-amber-50 rounded-xl p-6">
                        <div className="flex items-start gap-4">
                            <AlertCircle className="w-6 h-6 text-amber-600 flex-shrink-0" />
                            <div>
                                <h3 className="font-bold text-amber-800">Acção Manual Necessária</h3>
                                <pre className="text-amber-700 text-sm mt-2 whitespace-pre-wrap font-mono bg-amber-100/50 p-4 rounded-lg">
                                    {error}
                                </pre>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-6">
                        <div className="bg-slate-50 rounded-xl p-6">
                            <h3 className="font-bold text-slate-800 mb-2">O que esta migração faz:</h3>
                            <ul className="text-slate-600 text-sm space-y-1">
                                <li>• Verifica se a coluna "status" existe na tabela presentations</li>
                                <li>• Se não existir, fornece instruções para adicioná-la manualmente</li>
                                <li>• Permite funcionalidades de arquivar e mover para reciclagem</li>
                            </ul>
                        </div>

                        <Button
                            onClick={runMigration}
                            disabled={loading}
                            className="w-full bg-emerald-600 hover:bg-emerald-700 h-12 text-base font-bold"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                                    A verificar...
                                </>
                            ) : (
                                "Verificar e Migrar"
                            )}
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}
