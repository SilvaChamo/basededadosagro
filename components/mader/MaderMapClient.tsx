"use client";

import { useEffect, useMemo, useState } from "react";

// Mapa real das províncias (geoBoundaries ADM1), desenhado em SVG a partir
// do GeoJSON estático em /public/geo. Sem tiles externos (a CSP bloqueia-os).
// Choropleth pelo nº de empresas; clicar numa província aplica o filtro.

export interface MapDatum {
    province: string;
    count: number;
}

interface Props {
    data: MapDatum[];
    selected: string;
    onSelect: (province: string) => void;
}

const W = 380;
const H = 560;
const PAD = 12;

// O GeoJSON tem 10 formas — "Maputo Cidade" está dentro de "Maputo".
const SHAPE_TO_PROV: Record<string, string> = { Maputo: "Maputo Província" };
const canon = (shapeName: string) => SHAPE_TO_PROV[shapeName] || shapeName;

const colorFor = (t: number) =>
    t <= 0 ? "#eef2f6"
        : t < 0.25 ? "#cdeadb"
            : t < 0.5 ? "#8fd3ab"
                : t < 0.75 ? "#3fae72"
                    : "#15803d";

type Ring = number[][];
const walkBounds = (c: any, b: number[]) => {
    if (typeof c[0] === "number") {
        b[0] = Math.min(b[0], c[0]); b[2] = Math.max(b[2], c[0]);
        b[1] = Math.min(b[1], c[1]); b[3] = Math.max(b[3], c[1]);
    } else for (const x of c) walkBounds(x, b);
};

export default function MaderMapClient({ data, selected, onSelect }: Props) {
    const [fc, setFc] = useState<any>(null);
    const [failed, setFailed] = useState(false);

    useEffect(() => {
        let alive = true;
        fetch("/geo/moz-provincias.geojson")
            .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
            .then((j) => { if (alive) setFc(j); })
            .catch(() => { if (alive) setFailed(true); });
        return () => { alive = false; };
    }, []);

    const counts = useMemo(() => {
        const m = new Map<string, number>();
        for (const d of data) {
            const key = d.province === "Maputo Cidade" ? "Maputo Província" : d.province;
            m.set(key, (m.get(key) || 0) + d.count);
        }
        return m;
    }, [data]);
    const max = Math.max(1, ...Array.from(counts.values()));

    const shapes = useMemo(() => {
        if (!fc?.features?.length) return null;
        const b = [Infinity, Infinity, -Infinity, -Infinity];
        fc.features.forEach((f: any) => walkBounds(f.geometry.coordinates, b));
        const [minX, minY, maxX, maxY] = b;
        const s = Math.min((W - 2 * PAD) / (maxX - minX), (H - 2 * PAD) / (maxY - minY));
        const ox = PAD + ((W - 2 * PAD) - s * (maxX - minX)) / 2;
        const oy = PAD + ((H - 2 * PAD) - s * (maxY - minY)) / 2;
        const proj = (lon: number, lat: number): [number, number] =>
            [ox + (lon - minX) * s, oy + (maxY - lat) * s];
        const ringPath = (ring: Ring) =>
            ring.map(([lon, lat], i) => {
                const [x, y] = proj(lon, lat);
                return `${i ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`;
            }).join("") + "Z";
        const geomPath = (geom: any) => {
            const polys: Ring[][] = geom.type === "Polygon" ? [geom.coordinates] : geom.coordinates;
            return polys.map((poly) => poly.map(ringPath).join(" ")).join(" ");
        };
        return fc.features.map((f: any) => ({
            key: f.properties.shapeName as string,
            name: canon(f.properties.shapeName),
            d: geomPath(f.geometry),
        }));
    }, [fc]);

    if (failed) {
        return <div className="w-full h-full flex items-center justify-center text-xs font-bold text-slate-400 uppercase tracking-widest">Mapa indisponível</div>;
    }
    if (!shapes) {
        return <div className="w-full h-full flex items-center justify-center text-xs font-bold text-slate-400 uppercase tracking-widest animate-pulse">A carregar mapa…</div>;
    }

    const isSel = (name: string) =>
        selected === name || (selected === "Maputo Cidade" && name === "Maputo Província");

    return (
        <svg
            viewBox={`0 0 ${W} ${H}`}
            width="100%"
            height="100%"
            preserveAspectRatio="xMidYMid meet"
            style={{ display: "block", background: "#f8fafc" }}
            role="img"
            aria-label="Empresas por província"
        >
            {shapes.map((sh: any) => {
                const n = counts.get(sh.name) || 0;
                const sel = isSel(sh.name);
                return (
                    <path
                        key={sh.key}
                        d={sh.d}
                        fill={sel ? "#f97316" : colorFor(n / max)}
                        stroke={sel ? "#c2410c" : "#ffffff"}
                        strokeWidth={sel ? 1.8 : 0.8}
                        style={{ cursor: "pointer", transition: "fill .12s ease" }}
                        onClick={() => onSelect(isSel(sh.name) ? "" : sh.name)}
                    >
                        <title>{`${sh.name} — ${n} empresa${n === 1 ? "" : "s"}${n ? "" : " (sem registos)"}`}</title>
                    </path>
                );
            })}
        </svg>
    );
}
