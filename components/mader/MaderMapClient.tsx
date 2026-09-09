"use client";

// Mapa das 11 províncias desenhado em SVG na própria página — sem tiles
// externos (a CSP do site não permite mapas) e sem dependências. O contorno
// é aproximado; serve de fundo para as bolhas (raio = nº de empresas).

export interface MapDatum {
    province: string;
    count: number;
}

const CENTROIDS: Record<string, [number, number]> = {
    "Niassa": [-13.0, 36.4],
    "Cabo Delgado": [-12.4, 39.3],
    "Nampula": [-15.2, 39.2],
    "Zambézia": [-16.7, 37.2],
    "Tete": [-15.4, 33.0],
    "Manica": [-19.2, 33.3],
    "Sofala": [-19.6, 34.7],
    "Inhambane": [-23.2, 34.8],
    "Gaza": [-23.6, 32.9],
    "Maputo Província": [-25.4, 32.4],
    "Maputo Cidade": [-25.95, 32.55],
};

const SHORT: Record<string, string> = {
    "Cabo Delgado": "C. Delgado",
    "Maputo Província": "Maputo Prov.",
    "Maputo Cidade": "Maputo Cid.",
    "Zambézia": "Zambézia",
};

// Contorno aproximado de Moçambique (lat, lon), sentido horário a partir do
// extremo NE (foz do Rovuma).
const OUTLINE: [number, number][] = [
    [-10.47, 40.42], [-12.0, 40.55], [-13.4, 40.55], [-14.6, 40.75], [-15.6, 40.3],
    [-16.3, 39.95], [-17.9, 36.9], [-18.9, 36.35], [-19.8, 34.85], [-20.9, 35.2],
    [-22.0, 35.4], [-23.9, 35.45], [-24.9, 34.0], [-25.1, 33.5], [-25.9, 32.9],
    [-26.5, 32.9], [-26.86, 32.9], [-26.0, 32.02], [-25.4, 31.98], [-24.4, 31.9],
    [-22.35, 31.3], [-21.5, 32.4], [-20.0, 32.45], [-19.0, 32.95], [-16.7, 32.7],
    [-16.2, 31.1], [-15.6, 30.35], [-14.5, 33.6], [-13.5, 34.5], [-12.2, 34.6],
    [-11.4, 34.55], [-11.0, 35.6], [-10.8, 38.2], [-10.47, 40.42],
];

const LAT_N = -10.0, LAT_S = -27.1, LON_W = 29.9, LON_E = 41.2;
const W = 360, H = 520, PAD = 36;
const px = (lon: number) => PAD + ((lon - LON_W) / (LON_E - LON_W)) * (W - 2 * PAD);
const py = (lat: number) => PAD + ((LAT_N - lat) / (LAT_N - LAT_S)) * (H - 2 * PAD);

const colorFor = (t: number) =>
    t <= 0 ? "#e2e8f0" : t < 0.34 ? "#86efac" : t < 0.67 ? "#22c55e" : "#15803d";

export default function MaderMapClient({ data }: { data: MapDatum[] }) {
    const max = Math.max(1, ...data.map((d) => d.count));
    const poly = OUTLINE.map(([la, lo]) => `${px(lo).toFixed(1)},${py(la).toFixed(1)}`).join(" ");

    return (
        <svg
            viewBox={`0 0 ${W} ${H}`}
            width="100%"
            height="100%"
            preserveAspectRatio="xMidYMid meet"
            style={{ display: "block", background: "#f1f5f9" }}
            role="img"
            aria-label="Mapa de empresas por província"
        >
            <polygon points={poly} fill="#e6ebf0" stroke="#cbd5e1" strokeWidth={1.2} strokeLinejoin="round" />
            <text x={W - PAD} y={22} textAnchor="end" fontSize={11} fontWeight={700} fill="#94a3b8">N ↑</text>

            {data.map((d) => {
                const c = CENTROIDS[d.province];
                if (!c) return null;
                const t = d.count / max;
                const r = 4 + 22 * Math.sqrt(t);
                const x = px(c[1]) + (d.province === "Maputo Cidade" ? 11 : 0);
                const y = py(c[0]);
                return (
                    <g key={d.province}>
                        <circle cx={x} cy={y} r={r} fill={colorFor(t)} fillOpacity={0.88} stroke="#ffffff" strokeWidth={1.5}>
                            <title>{`${d.province} — ${d.count} empresa${d.count === 1 ? "" : "s"}`}</title>
                        </circle>
                        <text x={x} y={y + r + 9} textAnchor="middle" fontSize={8.5} fontWeight={600} fill="#475569">
                            {SHORT[d.province] || d.province}
                        </text>
                    </g>
                );
            })}
        </svg>
    );
}
