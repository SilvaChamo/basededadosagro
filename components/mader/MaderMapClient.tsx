"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, CircleMarker, Tooltip, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";

// Centróides aproximados das 11 províncias — chega para um mapa de bolhas
// (raio = nº de empresas). Não precisa de GeoJSON.
const CENTROIDS: Record<string, [number, number]> = {
    "Niassa": [-13.0, 36.6],
    "Cabo Delgado": [-12.3, 39.3],
    "Nampula": [-15.1, 39.0],
    "Zambézia": [-16.6, 37.0],
    "Tete": [-15.6, 33.2],
    "Manica": [-19.0, 33.2],
    "Sofala": [-19.4, 34.6],
    "Inhambane": [-23.2, 34.6],
    "Gaza": [-23.6, 32.9],
    "Maputo Província": [-25.7, 32.5],
    "Maputo Cidade": [-25.97, 32.58],
};

export interface MapDatum {
    province: string;
    count: number;
}

// O Leaflet calcula o tamanho do mapa no arranque; quando o mapa nasce
// dentro de um grid/flex que só assenta a seguir, os tiles ficam em branco
// até um invalidateSize(). Fazemo-lo algumas vezes logo após montar e a
// cada resize da janela.
function SizeFix() {
    const map = useMap();
    useEffect(() => {
        const fix = () => map.invalidateSize();
        const timers = [0, 150, 400, 900].map((t) => setTimeout(fix, t));
        window.addEventListener("resize", fix);
        return () => {
            timers.forEach(clearTimeout);
            window.removeEventListener("resize", fix);
        };
    }, [map]);
    return null;
}

export default function MaderMapClient({ data }: { data: MapDatum[] }) {
    const max = Math.max(1, ...data.map((d) => d.count));

    const colorFor = (t: number) =>
        t <= 0 ? "#cbd5e1" : t < 0.34 ? "#86efac" : t < 0.67 ? "#22c55e" : "#15803d";

    return (
        <MapContainer
            center={[-18.0, 35.5]}
            zoom={5}
            minZoom={4}
            scrollWheelZoom={false}
            style={{ height: "100%", width: "100%", minHeight: 260, background: "#eef2f6" }}
        >
            <SizeFix />
            <TileLayer
                url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; OpenStreetMap'
            />
            {data.map((d) => {
                const c = CENTROIDS[d.province];
                if (!c) return null;
                const t = d.count / max;
                const radius = 6 + 26 * Math.sqrt(t);
                return (
                    <CircleMarker
                        key={d.province}
                        center={c}
                        radius={radius}
                        pathOptions={{
                            color: "#ffffff",
                            weight: 2,
                            fillColor: colorFor(t),
                            fillOpacity: 0.85,
                        }}
                    >
                        <Tooltip direction="top" offset={[0, -4]} opacity={1}>
                            <span style={{ fontWeight: 700 }}>{d.province}</span>
                            {" — "}
                            {d.count} empresa{d.count === 1 ? "" : "s"}
                        </Tooltip>
                    </CircleMarker>
                );
            })}
        </MapContainer>
    );
}
