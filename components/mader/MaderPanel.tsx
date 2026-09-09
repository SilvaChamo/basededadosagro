"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import {
    Building2, Store, Package, Users, User, TrendingUp, Filter, X,
    Download, Printer, Loader2, AlertTriangle,
} from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { getRoleLabel } from "@/lib/roles";
import { Charts } from "@/components/stats/Charts";

const MaderMap = dynamic(() => import("./MaderMapClient"), {
    ssr: false,
    loading: () => (
        <div className="w-full h-full bg-slate-100 flex items-center justify-center">
            <Loader2 className="w-6 h-6 text-slate-400 animate-spin" />
        </div>
    ),
});

const PROVINCES = [
    "Niassa", "Cabo Delgado", "Nampula", "Zambézia", "Tete", "Manica",
    "Sofala", "Inhambane", "Gaza", "Maputo Província", "Maputo Cidade",
];
const MONTHS_PT = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
const UNSET = "Não indicado";
const ACCENT = "#f97316";

interface Row {
    province: string | null;
    district: string | null;
    category: string | null;
    value_chain: string | null;
    size: string | null;
    type: string | null;
    created_at: string | null;
    is_archived: boolean | null;
}

const norm = (v: string | null | undefined) => (v && v.trim() ? v.trim() : UNSET);

function tally(rows: Row[], key: (r: Row) => string) {
    const m = new Map<string, number>();
    for (const r of rows) m.set(key(r), (m.get(key(r)) || 0) + 1);
    return [...m.entries()].map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count);
}

function BarRow({ label, value, max, pct }: { label: string; value: number; max: number; pct?: number }) {
    const w = max > 0 ? Math.max(2, (value / max) * 100) : 0;
    return (
        <div className="flex items-center gap-3 py-[5px]">
            <span className="w-36 sm:w-44 shrink-0 text-xs font-medium text-slate-600 truncate" title={label}>{label}</span>
            <div className="flex-1 h-2.5 rounded-full bg-slate-100 overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${w}%`, background: ACCENT }} />
            </div>
            <span className="w-16 shrink-0 text-right text-xs font-bold text-slate-700 tabular-nums">
                {value}{typeof pct === "number" ? <span className="text-slate-400 font-medium"> · {pct.toFixed(0)}%</span> : null}
            </span>
        </div>
    );
}

function Card({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
    return (
        <section className="bg-white rounded-[8px] border border-slate-200 shadow-sm p-5 sm:p-6">
            <div className="mb-3">
                <h2 className="text-sm font-black text-slate-800 uppercase tracking-widest leading-tight mb-0">{title}</h2>
                {hint && <p className="text-[11px] text-slate-400 font-medium mt-0.5">{hint}</p>}
            </div>
            {children}
        </section>
    );
}

function Select({ label, value, onChange, options }: {
    label: string; value: string; onChange: (v: string) => void; options: string[];
}) {
    return (
        <label className="block">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</span>
            <select
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="mt-1 w-full h-10 rounded-[8px] border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-400"
            >
                <option value="">Todas</option>
                {options.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
        </label>
    );
}

export function MaderPanel() {
    const [rows, setRows] = useState<Row[] | null>(null);
    const [productCount, setProductCount] = useState(0);
    const [professionalCount, setProfessionalCount] = useState(0);
    const [err, setErr] = useState<string | null>(null);
    const [account, setAccount] = useState<{ email: string; roleLabel: string; name: string; avatar: string }>({ email: "", roleLabel: "", name: "", avatar: "" });

    const [fProv, setFProv] = useState("");
    const [fSector, setFSector] = useState("");
    const [fChain, setFChain] = useState("");
    const [fSize, setFSize] = useState("");

    useEffect(() => {
        (async () => {
            try {
                const supabase = createClient();
                const [c, p, pr] = await Promise.all([
                    supabase.from("companies").select("province, district, category, value_chain, size, type, created_at, is_archived"),
                    supabase.from("products").select("*", { count: "exact", head: true }),
                    supabase.from("professionals").select("*", { count: "exact", head: true }),
                ]);
                if (c.error) throw c.error;
                setRows((c.data as Row[]).filter((r) => r.is_archived !== true));
                setProductCount(p.count || 0);
                setProfessionalCount(pr.count || 0);

                const { data: { user } } = await supabase.auth.getUser();
                if (user) {
                    const { data: prof } = await supabase.from("profiles").select("role, full_name, avatar_url").eq("id", user.id).maybeSingle();
                    const meta = (user.user_metadata ?? {}) as Record<string, string>;
                    setAccount({
                        email: user.email ?? "",
                        roleLabel: getRoleLabel(prof?.role),
                        name: prof?.full_name || meta.full_name || meta.name || "",
                        avatar: prof?.avatar_url || meta.avatar_url || meta.picture || "",
                    });
                }
            } catch (e: any) {
                setErr(e?.message || "Não foi possível carregar os dados.");
            }
        })();
    }, []);

    const sectorOpts = useMemo(() => rows ? [...new Set(rows.map((r) => norm(r.category)))].sort((a, b) => a.localeCompare(b)) : [], [rows]);
    const chainOpts = useMemo(() => rows ? [...new Set(rows.map((r) => norm(r.value_chain)))].sort((a, b) => a.localeCompare(b)) : [], [rows]);
    const sizeOpts = useMemo(() => rows ? [...new Set(rows.map((r) => norm(r.size)))].sort((a, b) => a.localeCompare(b)) : [], [rows]);

    const filtered = useMemo(() => {
        if (!rows) return [];
        return rows.filter((r) =>
            (!fProv || norm(r.province) === fProv) &&
            (!fSector || norm(r.category) === fSector) &&
            (!fChain || norm(r.value_chain) === fChain) &&
            (!fSize || norm(r.size) === fSize));
    }, [rows, fProv, fSector, fChain, fSize]);

    const activeFilters = [
        fProv && { k: "Província", v: fProv, clear: () => setFProv("") },
        fSector && { k: "Sector", v: fSector, clear: () => setFSector("") },
        fChain && { k: "Cadeia de valor", v: fChain, clear: () => setFChain("") },
        fSize && { k: "Dimensão", v: fSize, clear: () => setFSize("") },
    ].filter(Boolean) as { k: string; v: string; clear: () => void }[];

    const total = filtered.length;
    const lojas = filtered.filter((r) => r.type === "Loja").length;
    const empresas = total - lojas;
    const novos30 = useMemo(() => {
        const since = Date.now() - 30 * 864e5;
        return filtered.filter((r) => r.created_at && new Date(r.created_at).getTime() >= since).length;
    }, [filtered]);

    const byProvince = useMemo(() => {
        const counts = tally(filtered, (r) => norm(r.province));
        const map = new Map(counts.map((x) => [x.name, x.count]));
        const list = [...PROVINCES, UNSET].map((name) => ({ name, count: map.get(name) || 0 }));
        return list.sort((a, b) => b.count - a.count).filter((x) => x.name !== UNSET || x.count > 0);
    }, [filtered]);

    const districtRows = useMemo(() => {
        const base = fProv ? filtered : filtered;
        return tally(base.filter((r) => (fProv ? true : true)), (r) => norm(r.district))
            .filter((x) => x.name !== UNSET || x.count > 0)
            .slice(0, fProv ? 40 : 15);
    }, [filtered, fProv]);

    const byMonth = useMemo(() => {
        const now = new Date();
        const buckets: { key: string; name: string; count: number }[] = [];
        for (let i = 11; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            buckets.push({
                key: `${d.getFullYear()}-${d.getMonth()}`,
                name: `${MONTHS_PT[d.getMonth()]}/${String(d.getFullYear()).slice(2)}`,
                count: 0,
            });
        }
        const idx = new Map(buckets.map((b, i) => [b.key, i]));
        for (const r of filtered) {
            if (!r.created_at) continue;
            const d = new Date(r.created_at);
            const k = `${d.getFullYear()}-${d.getMonth()}`;
            const i = idx.get(k);
            if (i !== undefined) buckets[i].count++;
        }
        return buckets;
    }, [filtered]);

    const monthTotal = byMonth.reduce((s, b) => s + b.count, 0);
    const monthAvg = monthTotal / 12;
    const monthPeak = byMonth.reduce((m, b) => (b.count > m.count ? b : m), byMonth[0] || { name: "—", count: 0 });

    const byChain = useMemo(() => tally(filtered, (r) => norm(r.value_chain)).slice(0, 8), [filtered]);
    const bySector = useMemo(() => tally(filtered, (r) => norm(r.category)).slice(0, 8), [filtered]);
    const bySize = useMemo(() => tally(filtered, (r) => norm(r.size)), [filtered]);

    // Matriz Sector × Província (ignora o filtro de sector nas linhas)
    const matrix = useMemo(() => {
        const base = rows ? rows.filter((r) =>
            (!fProv || norm(r.province) === fProv) &&
            (!fChain || norm(r.value_chain) === fChain) &&
            (!fSize || norm(r.size) === fSize)) : [];
        const topSectors = tally(base, (r) => norm(r.category)).slice(0, 10).map((x) => x.name);
        const provs = fProv ? [fProv] : PROVINCES;
        const cell = (sec: string, prov: string) =>
            base.filter((r) => norm(r.category) === sec && norm(r.province) === prov).length;
        const grid = topSectors.map((sec) => ({
            sector: sec,
            cells: provs.map((prov) => cell(sec, prov)),
            total: base.filter((r) => norm(r.category) === sec).length,
        }));
        const colTotals = provs.map((prov) => base.filter((r) => norm(r.province) === prov).length);
        return { provs, grid, colTotals, grand: base.length };
    }, [rows, fProv, fChain, fSize]);

    const clearAll = () => { setFProv(""); setFSector(""); setFChain(""); setFSize(""); };

    const exportCsv = () => {
        const lines: string[] = [];
        const push = (arr: (string | number)[]) => lines.push(arr.map((x) => `"${String(x).replace(/"/g, '""')}"`).join(","));
        push(["Painel Institucional — Base de Dados Agrícolas"]);
        push(["Gerado em", new Date().toLocaleString("pt-PT")]);
        push(["Filtros", activeFilters.length ? activeFilters.map((f) => `${f.k}: ${f.v}`).join(" | ") : "nenhum"]);
        lines.push("");
        push(["Indicador", "Valor"]);
        push(["Empresas/organizações", empresas]);
        push(["Lojas", lojas]);
        push(["Registos (total)", total]);
        push(["Novos (30 dias)", novos30]);
        push(["Produtos no catálogo (total do site)", productCount]);
        push(["Profissionais (total do site)", professionalCount]);
        lines.push("");
        push(["Cobertura por província", "Empresas", "%"]);
        byProvince.forEach((x) => push([x.name, x.count, total ? ((x.count / total) * 100).toFixed(1) : "0"]));
        lines.push("");
        push([`Distritos${fProv ? ` (${fProv})` : ""}`, "Empresas"]);
        districtRows.forEach((x) => push([x.name, x.count]));
        lines.push("");
        push(["Cadeia de valor", "Empresas"]);
        byChain.forEach((x) => push([x.name, x.count]));
        lines.push("");
        push(["Sector de actividade", "Empresas"]);
        bySector.forEach((x) => push([x.name, x.count]));
        lines.push("");
        push(["Dimensão", "Empresas"]);
        bySize.forEach((x) => push([x.name, x.count]));
        lines.push("");
        push(["Registos por mês (12 meses)", "Empresas"]);
        byMonth.forEach((x) => push([x.name, x.count]));
        const blob = new Blob(["﻿" + lines.join("\r\n")], { type: "text/csv;charset=utf-8" });
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = `painel-mader-${new Date().toISOString().slice(0, 10)}.csv`;
        a.click();
        URL.revokeObjectURL(a.href);
    };

    if (err) {
        return (
            <div className="bg-white rounded-[8px] border border-red-200 p-10 text-center">
                <AlertTriangle className="w-8 h-8 text-red-400 mx-auto mb-3" />
                <p className="font-bold text-slate-800">Não foi possível carregar os dados</p>
                <p className="text-sm text-slate-500 mt-1">{err}</p>
            </div>
        );
    }
    if (!rows) {
        return (
            <div className="bg-white rounded-[8px] border border-slate-200 p-16 flex flex-col items-center gap-3">
                <Loader2 className="w-7 h-7 text-slate-400 animate-spin" />
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest">A carregar indicadores…</p>
            </div>
        );
    }

    const provMax = Math.max(1, ...byProvince.map((x) => x.count));
    const distMax = Math.max(1, ...districtRows.map((x) => x.count));

    const kpis = [
        { icon: Building2, label: "Empresas / organizações", value: empresas },
        { icon: Store, label: "Lojas", value: lojas },
        { icon: TrendingUp, label: "Novos (30 dias)", value: novos30 },
        { icon: Package, label: "Produtos no catálogo", value: productCount, muted: "total do site" },
        { icon: Users, label: "Profissionais", value: professionalCount, muted: "total do site" },
    ];

    return (
        <div className="flex flex-col lg:flex-row gap-6">
                {/* ---- BARRA LATERAL: FILTROS (arranca no topo, como no painel admin) ---- */}
                <aside className="w-full lg:w-[260px] lg:shrink-0 print:hidden">
                    <div className="bg-white rounded-[8px] border border-slate-200 shadow-sm p-5 lg:sticky lg:top-[80px] space-y-4">
                        <div className="flex items-center gap-2">
                            <Filter className="w-4 h-4 text-slate-400" />
                            <h2 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-0">Filtros</h2>
                        </div>
                        <Select label="Província" value={fProv} onChange={setFProv} options={PROVINCES} />
                        <Select label="Sector de actividade" value={fSector} onChange={setFSector} options={sectorOpts} />
                        <Select label="Cadeia de valor" value={fChain} onChange={setFChain} options={chainOpts} />
                        <Select label="Dimensão da empresa" value={fSize} onChange={setFSize} options={sizeOpts} />

                        {activeFilters.length > 0 && (
                            <button onClick={clearAll}
                                className="w-full h-9 rounded-[8px] bg-slate-100 hover:bg-slate-200 text-[11px] font-black uppercase tracking-widest text-slate-500 transition-colors">
                                Limpar filtros
                            </button>
                        )}

                        <div className="pt-3 border-t border-slate-100">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Resultado do cruzamento</p>
                            <p className="mt-1 text-3xl font-black text-slate-900 tabular-nums">{total}</p>
                            <p className="text-xs text-slate-500">
                                empresa{total === 1 ? "" : "s"}
                                {fSector && ` em «${fSector}»`}
                                {fProv && ` · ${fProv}`}
                            </p>
                        </div>

                        {activeFilters.length > 0 && (
                            <div className="flex flex-wrap gap-1.5">
                                {activeFilters.map((f) => (
                                    <button key={f.k} onClick={f.clear}
                                        className="inline-flex items-center gap-1 rounded-full bg-orange-50 border border-orange-200 text-[10px] font-bold text-[#f97316] px-2 py-1">
                                        {f.v} <X className="w-3 h-3" />
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* dados da conta ligada — no fim da barra lateral */}
                        <div className="pt-3 border-t border-slate-100 flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-emerald-900 border border-emerald-700 flex items-center justify-center overflow-hidden shrink-0">
                                {account.avatar
                                    ? <img src={account.avatar} alt="" className="w-full h-full object-cover" />
                                    : <User className="w-4 h-4 text-emerald-400" />}
                            </div>
                            <div className="min-w-0">
                                {account.name && <p className="text-xs font-bold text-slate-700 truncate">{account.name}</p>}
                                <p className="text-[11px] text-slate-400 truncate">{account.email || "—"}</p>
                                {account.roleLabel && (
                                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest truncate">{account.roleLabel}</p>
                                )}
                            </div>
                        </div>
                    </div>
                </aside>

                {/* ---- CONTEÚDO ---- */}
                <div className="flex-1 min-w-0 space-y-5">

                    {/* título + descrição + acções — mesma linha, depois da barra lateral */}
                    <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-tight mb-0">Cobertura e perfil do sector</h1>
                            <p className="text-sm text-slate-500 mt-0.5">
                                Dados agregados do directório. {activeFilters.length === 0
                                    ? "Sem filtros — visão nacional."
                                    : `Filtrado: ${activeFilters.map((f) => f.v).join(" · ")}.`}
                            </p>
                        </div>
                        <div className="flex items-center gap-2 print:hidden">
                            <button onClick={exportCsv}
                                className="h-9 px-4 inline-flex items-center gap-2 rounded-[8px] border border-slate-200 bg-white text-[11px] font-black uppercase tracking-widest text-slate-600 hover:border-orange-300 hover:text-[#f97316] transition-colors">
                                <Download className="w-3.5 h-3.5" /> CSV
                            </button>
                            <button onClick={() => window.print()}
                                className="h-9 px-4 inline-flex items-center gap-2 rounded-[8px] border border-slate-200 bg-white text-[11px] font-black uppercase tracking-widest text-slate-600 hover:border-orange-300 hover:text-[#f97316] transition-colors">
                                <Printer className="w-3.5 h-3.5" /> Imprimir / PDF
                            </button>
                        </div>
                    </div>

                    {/* KPIs */}
                    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3">
                        {kpis.map((k) => (
                            <div key={k.label} className="bg-white rounded-[8px] border border-slate-200 shadow-sm p-4">
                                <k.icon className="w-4 h-4 text-slate-300 mb-2" />
                                <p className="text-2xl font-black text-slate-900 tabular-nums leading-none">{k.value.toLocaleString("pt-PT")}</p>
                                <p className="text-[11px] font-bold text-slate-500 mt-1.5 leading-tight">{k.label}</p>
                                {k.muted && <p className="text-[10px] text-slate-400 uppercase tracking-wider">{k.muted}</p>}
                            </div>
                        ))}
                    </div>

                    {/* Distribuição territorial */}
                    <Card title="Distribuição territorial" hint="Nº de empresas por província. O tamanho da bolha é proporcional ao total.">
                        <div className="grid lg:grid-cols-[1fr_340px] gap-5">
                            <div className="h-[300px] lg:h-[420px] rounded-[8px] overflow-hidden border border-slate-200">
                                <MaderMap data={byProvince.map((x) => ({ province: x.name, count: x.count }))} />
                            </div>
                            <div className="min-w-0">
                                {byProvince.map((x) => (
                                    <BarRow key={x.name} label={x.name} value={x.count} max={provMax}
                                        pct={total ? (x.count / total) * 100 : 0} />
                                ))}
                            </div>
                        </div>
                    </Card>

                    {/* Distritos */}
                    <Card title={`Distritos${fProv ? ` — ${fProv}` : " (mais representados)"}`}
                        hint={fProv ? "Todos os distritos com registos nesta província." : "Escolha uma província na barra lateral para ver todos os distritos."}>
                        {districtRows.length === 0
                            ? <p className="text-sm text-slate-400 italic">Sem registos para o filtro actual.</p>
                            : <div className="grid sm:grid-cols-2 gap-x-8">
                                {districtRows.map((x) => <BarRow key={x.name} label={x.name} value={x.count} max={distMax} />)}
                            </div>}
                    </Card>

                    {/* Evolução */}
                    <Card title="Evolução de registos" hint="Novas empresas por mês, últimos 12 meses.">
                        <Charts data={byMonth} type="area" dataKey="count" categoryKey="name" color={ACCENT} />
                        <div className="grid grid-cols-3 gap-3 mt-2">
                            {[
                                ["No período", monthTotal],
                                ["Média / mês", monthAvg.toFixed(1)],
                                ["Mês mais forte", `${monthPeak.name} (${monthPeak.count})`],
                            ].map(([l, v]) => (
                                <div key={l as string} className="bg-slate-50 rounded-[8px] border border-slate-100 p-3">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{l}</p>
                                    <p className="text-sm font-bold text-slate-800 mt-0.5">{v}</p>
                                </div>
                            ))}
                        </div>
                    </Card>

                    {/* Perfil do sector */}
                    <Card title="Perfil do sector" hint="Repartição das empresas do filtro actual.">
                        <div className="grid md:grid-cols-3 gap-6">
                            {[
                                { t: "Cadeia de valor", d: byChain },
                                { t: "Sector de actividade", d: bySector },
                                { t: "Dimensão", d: bySize },
                            ].map(({ t, d }) => {
                                const m = Math.max(1, ...d.map((x) => x.count));
                                return (
                                    <div key={t} className="min-w-0">
                                        <p className="text-[11px] font-black text-slate-500 uppercase tracking-widest mb-2">{t}</p>
                                        {d.length === 0
                                            ? <p className="text-xs text-slate-400 italic">Sem dados.</p>
                                            : d.map((x) => <BarRow key={x.name} label={x.name} value={x.count} max={m} />)}
                                    </div>
                                );
                            })}
                        </div>
                    </Card>

                    {/* Matriz Sector × Província */}
                    <Card title="Sector × Província"
                        hint="Nº de empresas de cada sector em cada província. Responde a «o que há no sector X na província Y».">
                        <div className="overflow-x-auto -mx-1 px-1">
                            <table className="w-full text-xs border-collapse">
                                <thead>
                                    <tr>
                                        <th className="text-left font-black text-slate-500 uppercase tracking-wider py-2 pr-3 sticky left-0 bg-white">Sector</th>
                                        {matrix.provs.map((p) => (
                                            <th key={p} className="px-2 py-2 font-bold text-slate-400 whitespace-nowrap text-right">{p}</th>
                                        ))}
                                        <th className="px-2 py-2 font-black text-slate-600 text-right">Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {matrix.grid.map((row) => (
                                        <tr key={row.sector} className="border-t border-slate-100">
                                            <td className="py-2 pr-3 font-medium text-slate-700 whitespace-nowrap sticky left-0 bg-white">{row.sector}</td>
                                            {row.cells.map((n, i) => (
                                                <td key={i} className="px-2 py-2 text-right tabular-nums"
                                                    style={{ color: n === 0 ? "#cbd5e1" : "#334155", background: n > 0 ? `rgba(249,115,22,${Math.min(0.14, 0.03 + n / (row.total || 1) * 0.14)})` : "transparent" }}>
                                                    {n || "–"}
                                                </td>
                                            ))}
                                            <td className="px-2 py-2 text-right font-black text-slate-800 tabular-nums">{row.total}</td>
                                        </tr>
                                    ))}
                                    <tr className="border-t-2 border-slate-200">
                                        <td className="py-2 pr-3 font-black text-slate-600 uppercase tracking-wider sticky left-0 bg-white">Total</td>
                                        {matrix.colTotals.map((n, i) => (
                                            <td key={i} className="px-2 py-2 text-right font-bold text-slate-600 tabular-nums">{n}</td>
                                        ))}
                                        <td className="px-2 py-2 text-right font-black text-slate-900 tabular-nums">{matrix.grand}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </Card>

                    <p className="text-[11px] text-slate-400 leading-relaxed">
                        Dados agregados, gerados em {new Date().toLocaleString("pt-PT")}. Não inclui
                        informação nominativa das empresas. Acesso só-leitura — este painel não permite
                        criar, alterar ou eliminar registos.
                    </p>
                </div>
        </div>
    );
}
