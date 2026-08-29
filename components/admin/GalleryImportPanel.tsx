"use client";

import { useState } from "react";
import { X, DownloadCloud, Loader2, AlertTriangle, CheckCircle2 } from "lucide-react";

// Mesma lista de fontes da rota /api/admin/media-library/import-site-images.
const SOURCES: { id: string; label: string }[] = [
    { id: "noticias", label: "Notícias" },
    { id: "empresas", label: "Empresas" },
    { id: "produtos", label: "Produtos" },
    { id: "propriedades", label: "Propriedades" },
    { id: "profissionais", label: "Profissionais" },
    { id: "apresentacoes", label: "Apresentações" },
    { id: "podcasts", label: "Podcasts" },
    { id: "formacoes", label: "Formações" },
    { id: "site", label: "Ficheiros do site (public/ e _IMG/)" },
];

interface Totals { uploaded: number; failed: number; rewrittenRows: number; alreadyInBucket: number; rows: number; }
const ZERO: Totals = { uploaded: 0, failed: 0, rewrittenRows: 0, alreadyInBucket: 0, rows: 0 };

export function GalleryImportPanel({ onClose, onDone }: { onClose: () => void; onDone: () => void }) {
    const [selected, setSelected] = useState<Set<string>>(new Set(SOURCES.map((s) => s.id)));
    const [running, setRunning] = useState<null | "preview" | "import">(null);
    const [currentSource, setCurrentSource] = useState<string | null>(null);
    const [totals, setTotals] = useState<Totals>(ZERO);
    const [log, setLog] = useState<string[]>([]);
    const [failures, setFailures] = useState<any[]>([]);
    const [finished, setFinished] = useState<null | "preview" | "import">(null);

    const toggle = (id: string) =>
        setSelected((prev) => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });

    const run = async (dryRun: boolean) => {
        if (selected.size === 0 || running) return;
        setRunning(dryRun ? "preview" : "import");
        setFinished(null);
        setTotals(ZERO);
        setLog([]);
        setFailures([]);

        const acc = { ...ZERO };
        const allFailures: any[] = [];

        for (const src of SOURCES.filter((s) => selected.has(s.id))) {
            setCurrentSource(src.label);
            let offset = 0;
            let guard = 0;
            while (guard++ < 2000) {
                let j: any;
                try {
                    const res = await fetch("/api/admin/media-library/import-site-images", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ source: src.id, offset, limit: 8, dryRun }),
                    });
                    j = await res.json();
                    if (!res.ok) {
                        setLog((l) => [...l, `${src.label}: erro — ${j?.error || res.status}`]);
                        break;
                    }
                } catch (e: any) {
                    setLog((l) => [...l, `${src.label}: falha de rede — ${e?.message || e}`]);
                    break;
                }

                acc.uploaded += j.uploaded || 0;
                acc.failed += j.failed || 0;
                acc.rewrittenRows += j.rewrittenRows || 0;
                acc.alreadyInBucket += j.alreadyInBucket || 0;
                acc.rows += j.rows || 0;
                setTotals({ ...acc });
                if (Array.isArray(j.failures) && j.failures.length) {
                    allFailures.push(...j.failures.map((f: any) => ({ ...f, source: src.label })));
                    setFailures([...allFailures]);
                }

                if (j.skipped) {
                    setLog((l) => [...l, `${src.label}: tabela indisponível nesta base — ignorada`]);
                    break;
                }
                setLog((l) => [
                    ...l,
                    `${src.label}: +${j.rows} registos · ${dryRun ? "a arquivar" : "arquivadas"} ${j.uploaded} · falhas ${j.failed}${j.partial ? " · (lote parcial)" : ""}`,
                ]);

                if (j.done) break;
                if (j.nextOffset === offset) break; // segurança
                offset = j.nextOffset;
            }
        }

        setCurrentSource(null);
        setRunning(null);
        setFinished(dryRun ? "preview" : "import");
        if (!dryRun) onDone();
    };

    return (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/40 p-4">
            <div className="bg-white w-full max-w-2xl rounded-lg shadow-2xl border border-[#ccd0d4] flex flex-col max-h-[90vh]">
                <div className="flex items-center justify-between px-5 h-14 border-b border-[#ccd0d4] shrink-0">
                    <h2 className="flex items-center gap-2 text-[15px] font-bold text-[#1d2327]">
                        <DownloadCloud className="w-5 h-5 text-[#2271b1]" />
                        Importar imagens do site para a galeria
                    </h2>
                    <button onClick={onClose} className="p-1.5 hover:bg-[#f0f0f1] rounded" disabled={!!running}>
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-5 overflow-y-auto space-y-4">
                    <p className="text-[13px] text-[#50575e] leading-relaxed">
                        Percorre as secções escolhidas, descarrega para o bucket <code>public-assets</code> as
                        imagens que ainda estão fora dele (URLs externos) e reescreve o registo para a cópia
                        arquivada. Fica tudo na galeria, pronto a editar/reposicionar. É seguro repetir —
                        imagens já arquivadas são ignoradas.
                    </p>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {SOURCES.map((s) => (
                            <label
                                key={s.id}
                                className={`flex items-center gap-2 border rounded-md px-3 py-2 text-[13px] cursor-pointer transition-colors ${selected.has(s.id) ? "border-[#2271b1] bg-[#f0f6fc] text-[#1d2327]" : "border-[#ccd0d4] text-[#50575e]"}`}
                            >
                                <input
                                    type="checkbox"
                                    checked={selected.has(s.id)}
                                    onChange={() => toggle(s.id)}
                                    disabled={!!running}
                                />
                                {s.label}
                            </label>
                        ))}
                    </div>

                    {(running || finished) && (
                        <div className="border border-[#ccd0d4] rounded-md bg-[#f6f7f7] p-3 space-y-2">
                            <div className="flex items-center gap-2 text-[13px] font-semibold text-[#1d2327]">
                                {running ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin text-[#2271b1]" />
                                        {running === "preview" ? "A pré-visualizar" : "A importar"}
                                        {currentSource ? ` — ${currentSource}` : ""}…
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                                        {finished === "preview" ? "Pré-visualização concluída" : "Importação concluída"}
                                    </>
                                )}
                            </div>
                            <div className="flex flex-wrap gap-x-5 gap-y-1 text-[12px] text-[#50575e]">
                                <span>Registos analisados: <b>{totals.rows}</b></span>
                                <span>{finished === "preview" || running === "preview" ? "A arquivar" : "Arquivadas"}: <b className="text-[#1d2327]">{totals.uploaded}</b></span>
                                <span>Já na galeria: <b>{totals.alreadyInBucket}</b></span>
                                <span>Registos reescritos: <b>{totals.rewrittenRows}</b></span>
                                <span className={totals.failed ? "text-[#d63638]" : ""}>Falhas: <b>{totals.failed}</b></span>
                            </div>
                            {log.length > 0 && (
                                <div className="max-h-32 overflow-y-auto text-[11px] font-mono text-[#50575e] bg-white border border-[#ccd0d4] rounded p-2 space-y-0.5">
                                    {log.map((line, i) => (
                                        <div key={i}>{line}</div>
                                    ))}
                                </div>
                            )}
                            {failures.length > 0 && (
                                <details className="text-[11px]">
                                    <summary className="cursor-pointer text-[#d63638] font-semibold flex items-center gap-1">
                                        <AlertTriangle className="w-3.5 h-3.5" /> {failures.length} imagem(ns) não arquivada(s)
                                    </summary>
                                    <div className="max-h-32 overflow-y-auto mt-1 space-y-0.5 font-mono text-[#50575e]">
                                        {failures.slice(0, 200).map((f, i) => (
                                            <div key={i} className="truncate">
                                                [{f.source}] {f.reason} — {f.url || f.id}
                                            </div>
                                        ))}
                                    </div>
                                </details>
                            )}
                        </div>
                    )}
                </div>

                <div className="flex items-center justify-end gap-2 px-5 h-16 border-t border-[#ccd0d4] shrink-0">
                    <button
                        onClick={onClose}
                        disabled={!!running}
                        className="h-9 px-4 text-sm font-semibold border border-[#ccd0d4] rounded-md bg-white hover:bg-[#f6f7f7] disabled:opacity-40"
                    >
                        Fechar
                    </button>
                    <button
                        onClick={() => run(true)}
                        disabled={!!running || selected.size === 0}
                        className="h-9 px-4 text-sm font-semibold border border-[#2271b1] text-[#2271b1] rounded-md bg-white hover:bg-[#f6f7f7] disabled:opacity-40"
                    >
                        Pré-visualizar
                    </button>
                    <button
                        onClick={() => run(false)}
                        disabled={!!running || selected.size === 0}
                        className="h-9 px-4 text-sm font-semibold text-white rounded-md bg-[#2271b1] hover:bg-[#135e96] disabled:opacity-40"
                    >
                        Importar agora
                    </button>
                </div>
            </div>
        </div>
    );
}
