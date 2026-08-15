"use client";

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, useMap, ZoomControl, useMapEvents, Tooltip } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Navigation, MapPin, MousePointer2, Car, Maximize, Target, ArrowRight, Search } from 'lucide-react';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Spinner } from "@/components/ui/spinner";

// Fix for Leaflet default icon issues in Next.js
const DefaultIcon = L.icon({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

const CompanyIcon = L.divIcon({
    html: `<div class="w-10 h-10 bg-[#f97316] rounded-full border-4 border-white shadow-xl flex items-center justify-center text-white">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21h18"/><path d="M9 8h1"/><path d="M9 12h1"/><path d="M9 16h1"/><path d="M14 8h1"/><path d="M14 12h1"/><path d="M14 16h1"/><path d="M5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16"/></svg>
           </div>`,
    className: '',
    iconSize: [40, 40],
    iconAnchor: [20, 20],
});

const UserIcon = L.divIcon({
    html: `<div class="relative w-8 h-8">
            <div class="absolute inset-0 bg-emerald-500 rounded-full animate-ping opacity-25"></div>
            <div class="relative w-8 h-8 bg-emerald-500 rounded-full border-4 border-white shadow-xl flex items-center justify-center text-white">
                <div class="w-2 h-2 bg-white rounded-full"></div>
            </div>
           </div>`,
    className: '',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
});

const StepIcon = L.divIcon({
    html: `<div class="w-3 h-3 bg-white border-2 border-[#f97316] rounded-full shadow-md"></div>`,
    className: '',
    iconSize: [12, 12],
    iconAnchor: [6, 6],
});

interface MapNavigationInnerProps {
    companyCoords: [number, number] | null;
    companyName: string;
    companyAddress: {
        address: string;
        district?: string;
        province?: string;
    };
}

// Map Click Listener Component
function MapClickHandler({ onLocationSelect, active }: { onLocationSelect: (lat: number, lon: number) => void, active: boolean }) {
    useMapEvents({
        click(e) {
            if (active) {
                onLocationSelect(e.latlng.lat, e.latlng.lng);
            }
        },
    });
    return null;
}

// Helper to fit bounds ONLY WHEN CALLED OR ON INITIAL ROUTE
function MapController({ coords, trigger }: { coords: [number, number][], trigger: number }) {
    const map = useMap();
    const hasAutoCentered = useRef(false);
    const lastTrigger = useRef(trigger);

    useEffect(() => {
        if (coords.length > 1) {
            // Center on first route found OR when trigger button is clicked
            if (!hasAutoCentered.current || trigger !== lastTrigger.current) {
                const bounds = L.latLngBounds(coords);
                map.fitBounds(bounds, { padding: [40, 40], maxZoom: 16 });
                hasAutoCentered.current = true;
                lastTrigger.current = trigger;
            }
        }
    }, [coords, map, trigger]);
    return null;
}

export default function MapNavigationInner({ companyCoords: initialCoords, companyName, companyAddress }: MapNavigationInnerProps) {
    const [finalCompanyCoords, setFinalCompanyCoords] = useState<[number, number] | null>(initialCoords);
    const [userCoords, setUserCoords] = useState<[number, number] | null>(null);
    const [routes, setRoutes] = useState<{
        driving?: {
            path: [number, number][],
            distance: string,
            duration: string,
            steps: string[]
        }
    }>({});
    const [selectingLocation, setSelectingLocation] = useState(false);
    const [fitTrigger, setFitTrigger] = useState(0);
    const [gpsStatus, setGpsStatus] = useState<"idle" | "searching" | "found" | "error">("idle");
    const [userAddress, setUserAddress] = useState<{ road?: string; suburb?: string }>({});
    const [routeStepMarkers, setRouteStepMarkers] = useState<{ name: string; coords: [number, number] }[]>([]);
    const [gpsAccuracy, setGpsAccuracy] = useState<number | null>(null);
    const [userSearchQuery, setUserSearchQuery] = useState("");
    const [isGeocodingUser, setIsGeocodingUser] = useState(false);
    const watchId = useRef<number | null>(null);
    const lastFetchedCoords = useRef<string | null>(null);

    // Search for user location by text
    const handleSearchUserLocation = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!userSearchQuery.trim()) return;

        setIsGeocodingUser(true);
        try {
            const refinedQuery = `${userSearchQuery}, Moçambique`;
            const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(refinedQuery)}&limit=1`;
            const res = await fetch(url, { headers: { 'User-Agent': 'BaseDadosAgro-App' } });
            const data = await res.json();

            if (data && data.length > 0) {
                const newCoords: [number, number] = [parseFloat(data[0].lat), parseFloat(data[0].lon)];
                setUserCoords(newCoords);
                setGpsStatus("found");
                setSelectingLocation(false);
                setFitTrigger(v => v + 1);
                toast.success("Localização encontrada!");
            } else {
                toast.error("Localização não encontrada. Tente ser mais específico.");
            }
        } catch (err) {
            console.error("Geocoding error:", err);
            toast.error("Erro ao pesquisar localização.");
        } finally {
            setIsGeocodingUser(false);
        }
    };

    // 1. Geocoding logic if coords are missing
    useEffect(() => {
        async function geocodeCompany() {
            if (initialCoords) {
                setFinalCompanyCoords(initialCoords);
                return;
            }

            try {
                const queries = [
                    `${companyAddress.address}, ${companyAddress.district || ''}, ${companyAddress.province || ''}, Mozambique`,
                    `${companyAddress.district || ''}, ${companyAddress.province || ''}, Mozambique`
                ];

                for (const query of queries) {
                    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`;
                    const res = await fetch(url, { headers: { 'User-Agent': 'BaseDadosAgro-App' } });
                    const data = await res.json();

                    if (data && data.length > 0) {
                        setFinalCompanyCoords([parseFloat(data[0].lat), parseFloat(data[0].lon)]);
                        return;
                    }
                }
            } catch (err) {
                console.error("Geocoding error:", err);
            }
        }
        geocodeCompany();
    }, [initialCoords, companyAddress]);

    // 2. Continuous GPS Tracking
    const requestGPS = useCallback(() => {
        if ("geolocation" in navigator) {
            setGpsStatus("searching");

            if (watchId.current !== null) {
                navigator.geolocation.clearWatch(watchId.current);
            }

            const options = {
                enableHighAccuracy: true,
                timeout: 30000,
                maximumAge: 0
            };

            watchId.current = navigator.geolocation.watchPosition(
                (pos) => {
                    console.log('[GPS] Position acquired:', pos.coords.latitude, pos.coords.longitude, 'Accuracy:', pos.coords.accuracy);
                    setUserCoords([pos.coords.latitude, pos.coords.longitude]);
                    setGpsAccuracy(pos.coords.accuracy);
                    setGpsStatus("found");
                },
                (err) => {
                    console.warn('[GPS] Watch failed:', err.message);
                    setGpsStatus("error");
                    navigator.geolocation.getCurrentPosition(
                        (pos) => {
                            console.log('[GPS] Fallback position:', pos.coords.latitude, pos.coords.longitude);
                            setUserCoords([pos.coords.latitude, pos.coords.longitude]);
                            setGpsStatus("found");
                        },
                        (fallbackErr) => {
                            console.warn('[GPS] Fallback also failed:', fallbackErr.message);
                            setGpsStatus("error");
                            // Automatically enable manual selection mode when GPS fails
                            setSelectingLocation(true);
                        },
                        { enableHighAccuracy: false, timeout: 10000 }
                    );
                },
                options
            );
        }
    }, []);

    useEffect(() => {
        requestGPS();
        return () => {
            if (watchId.current !== null) {
                navigator.geolocation.clearWatch(watchId.current);
            }
        };
    }, [requestGPS]);

    // 2.1 Reverse Geocode User Location
    useEffect(() => {
        async function reverseGeocode() {
            if (!userCoords) return;
            try {
                const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${userCoords[0]}&lon=${userCoords[1]}`;
                const res = await fetch(url, { headers: { 'User-Agent': 'BaseDadosAgro-App' } });
                const data = await res.json();
                if (data.address) {
                    setUserAddress({
                        road: data.address.road || data.address.pedestrian || data.address.highway,
                        suburb: data.address.suburb || data.address.neighbourhood || data.address.city_district || data.address.town
                    });
                }
            } catch (err) {
                console.error("Reverse geocoding error:", err);
            }
        }
        reverseGeocode();
    }, [userCoords]);

    // 3. Routing Logic (Driving Only) - with caching to prevent infinite loops
    useEffect(() => {
        async function fetchRoute() {
            if (!userCoords || !finalCompanyCoords) {
                console.log('[Route] Skipping - missing coords. User:', userCoords, 'Company:', finalCompanyCoords);
                return;
            }

            // Prevent refetching if coordinates haven't changed
            const coordsKey = `${userCoords[0].toFixed(4)},${userCoords[1].toFixed(4)}-${finalCompanyCoords[0].toFixed(4)},${finalCompanyCoords[1].toFixed(4)}`;
            if (lastFetchedCoords.current === coordsKey) {
                console.log('[Route] Skipping - already fetched for these coords');
                return;
            }
            lastFetchedCoords.current = coordsKey;

            console.log('[Route] Fetching route from', userCoords, 'to', finalCompanyCoords);

            try {
                const url = `https://router.project-osrm.org/route/v1/driving/${userCoords[1]},${userCoords[0]};${finalCompanyCoords[1]},${finalCompanyCoords[0]}?overview=full&geometries=geojson&steps=true`;
                const res = await fetch(url);
                const data = await res.json();

                console.log('[Route] OSRM Response:', data.code, data.routes?.length, 'routes');

                if (data.routes && data.routes.length > 0) {
                    const route = data.routes[0];
                    const path = route.geometry.coordinates.map((c: any) => [c[1], c[0]]);

                    let distanceValue = (route.distance / 1000).toFixed(1);
                    const durationValue = Math.ceil(route.duration / 60).toString();

                    const stepNames: string[] = [];
                    const stepMarkers: { name: string; coords: [number, number] }[] = [];

                    route.legs[0].steps.forEach((step: any) => {
                        if (step.name && step.name.trim() !== "" && step.name !== "Unnamed road") {
                            if (stepNames[stepNames.length - 1] !== step.name) {
                                stepNames.push(step.name);
                                // Only add marker if location exists
                                if (step.location && Array.isArray(step.location) && step.location.length >= 2) {
                                    stepMarkers.push({
                                        name: step.name,
                                        coords: [step.location[1], step.location[0]]
                                    });
                                }
                            }
                        }
                    });

                    console.log('[Route] Path points:', path.length, 'Distance:', distanceValue, 'Duration:', durationValue);

                    setRoutes({
                        driving: {
                            path,
                            distance: distanceValue,
                            duration: durationValue,
                            steps: stepNames
                        }
                    });
                    setRouteStepMarkers(stepMarkers);
                } else {
                    console.warn('[Route] No routes found in response');
                }
            } catch (err) {
                console.error('[Route] Fetch error:', err);
            }
        }

        fetchRoute();
    }, [userCoords, finalCompanyCoords]);

    if (!finalCompanyCoords) return (
        <div className="w-full h-full bg-slate-50 flex items-center justify-center">
            <Spinner className="h-8 w-8" />
        </div>
    );

    return (
        <div className="flex flex-col w-full h-full bg-slate-50 overflow-hidden">
            {/* TOP INTERFACE (Outside Map) */}
            <div className="bg-white border-b border-slate-200 z-[1001] shrink-0 overflow-hidden">
                <div className="h-11 container-site flex items-center justify-between">
                    {/* Left: Trajectory Data */}
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                        <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${selectingLocation ? 'bg-orange-600 text-white animate-bounce shadow-lg shadow-orange-500/20' : 'bg-emerald-50 text-emerald-600 shadow-inner'}`}>
                            {selectingLocation ? <MousePointer2 className="w-5 h-5" /> : <Navigation className="w-4 h-4" />}
                        </div>

                        <div className="flex-1 min-w-0">
                            {selectingLocation ? (
                                <p className="text-xs font-black text-orange-600 uppercase leading-snug truncate tracking-tight animate-pulse">Toque no mapa para definir sua posição</p>
                            ) : gpsStatus === 'error' && !userCoords ? (
                                <div className="flex items-center gap-2">
                                    <p className="text-xs font-black text-red-500 uppercase tracking-tight">GPS Indisponível</p>
                                    <button onClick={() => setSelectingLocation(true)} className="text-[10px] font-black text-orange-500 underline uppercase">Definir Manualmente</button>
                                </div>
                            ) : gpsAccuracy && gpsAccuracy > 1000 ? (
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse"></div>
                                        <p className="text-[10px] font-black text-yellow-600 uppercase tracking-tight">GPS Impreciso ({Math.round(gpsAccuracy / 1000)}km)</p>
                                    </div>
                                    <button onClick={() => setSelectingLocation(true)} className="text-[9px] font-black text-orange-500 uppercase">Ajustar</button>
                                    {routes.driving && (
                                        <div className="flex items-center gap-4 ml-2">
                                            <span className="text-sm font-black text-slate-900">{routes.driving.distance}km</span>
                                            <span className="text-sm font-black text-slate-900">{routes.driving.duration}min</span>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="flex items-center gap-6">
                                    <div className="flex items-center gap-2">
                                        <div className={`w-2 h-2 rounded-full ${gpsStatus === 'found' ? 'bg-emerald-500 animate-pulse' : gpsStatus === 'searching' ? 'bg-orange-400 animate-ping' : 'bg-red-400'}`}></div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest hidden sm:block">{gpsStatus === 'searching' ? 'A localizar...' : 'Trajectória'}</p>
                                    </div>
                                    <div className="flex items-center gap-6">
                                        <div className="flex items-center gap-2">
                                            <Car className="w-4 h-4 text-emerald-600" />
                                            <span className="text-base font-black text-slate-900 tracking-tighter">{routes.driving ? `${routes.driving.distance}km` : '--'}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Maximize className="w-4 h-4 text-orange-600" />
                                            <span className="text-base font-black text-slate-900 tracking-tighter">{routes.driving ? `${routes.driving.duration}min` : '--'}</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Middle: Search Box */}
                    <form
                        onSubmit={handleSearchUserLocation}
                        className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-lg px-2 h-8 w-40 sm:w-64 mx-2 sm:mx-4"
                    >
                        <Search className="w-3.5 h-3.5 text-slate-400" />
                        <Input
                            placeholder="Digite sua localização!"
                            value={userSearchQuery}
                            onChange={(e) => setUserSearchQuery(e.target.value)}
                            className="h-full border-none bg-transparent shadow-none focus-visible:ring-0 text-[11px] font-bold p-0 placeholder:font-normal"
                        />
                        
                    </form>

                    {/* Right: Map Controls */}
                    <div className="flex gap-2 shrink-0">
                        <button
                            onClick={() => setFitTrigger(v => v + 1)}
                            className="p-2 bg-slate-50 hover:bg-slate-100 rounded-lg text-slate-600 transition-all border border-slate-200 active:scale-95"
                            title="Recentralizar"
                        >
                            <Maximize className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => {
                                requestGPS();
                                setFitTrigger(v => v + 1);
                            }}
                            className={`p-2 bg-slate-50 hover:bg-slate-100 rounded-lg border transition-all active:scale-95 ${gpsStatus === 'searching' ? 'text-orange-500 border-orange-200' : 'text-slate-600 border-slate-200'}`}
                            title="GPS"
                        >
                            <Target className={`w-4 h-4 ${gpsStatus === 'searching' ? 'animate-spin' : ''}`} />
                        </button>
                    </div>
                </div>

                {/* Horizontal Steps Bar (Removed as per user request) */}
            </div>

            <div className={`relative flex-1 ${selectingLocation ? 'cursor-crosshair' : ''}`}>
                <MapContainer
                    center={finalCompanyCoords}
                    zoom={14}
                    className="w-full h-full"
                    zoomControl={false}
                    attributionControl={false}
                    scrollWheelZoom={true} // Explicitly allow zoom
                >
                    <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />

                    <MapClickHandler
                        active={selectingLocation}
                        onLocationSelect={(lat, lon) => {
                            setUserCoords([lat, lon]);
                            setSelectingLocation(false);
                            setGpsStatus("found");
                        }}
                    />

                    <Marker position={finalCompanyCoords} icon={CompanyIcon} />

                    {userCoords && (
                        <>
                            {routes.driving && routes.driving.path.length > 0 && (
                                <Polyline
                                    positions={routes.driving.path}
                                    pathOptions={{
                                        color: '#f97316',
                                        weight: 5,
                                        opacity: 0.6,
                                        lineJoin: 'round',
                                        lineCap: 'round'
                                    }}
                                />
                            )}
                            <MapController coords={[userCoords, finalCompanyCoords]} trigger={fitTrigger} />
                            <Marker position={userCoords} icon={UserIcon}>
                                <Tooltip permanent direction="top" offset={[0, -10]} opacity={1} className="!bg-transparent !border-none !shadow-none p-0">
                                    <div className="bg-emerald-600 text-white px-3 py-2 rounded-xl shadow-2xl border-2 border-white flex flex-col items-center min-w-[140px] relative">
                                        <span className="text-[9px] font-black uppercase tracking-[0.2em] mb-1 text-white/90">Você está aqui</span>
                                        <div className="w-full h-[1px] bg-white/20 mb-1"></div>
                                        <p className="text-[11px] font-black leading-tight text-center text-white">{userAddress.suburb || userAddress.road || 'Localizando...'}</p>
                                        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-emerald-600 rotate-45 border-r-2 border-b-2 border-white"></div>
                                    </div>
                                </Tooltip>
                            </Marker>

                            {routeStepMarkers.map((marker, idx) => (
                                <Marker key={`step-${idx}`} position={marker.coords} icon={StepIcon}>
                                    <Tooltip direction="top" offset={[0, -5]} opacity={0.9} className="!bg-white/90 !backdrop-blur !border-slate-200 !rounded-lg !shadow-lg">
                                        <div className="px-2 py-1">
                                            <p className="text-[10px] font-black text-slate-800 whitespace-nowrap">{marker.name}</p>
                                        </div>
                                    </Tooltip>
                                </Marker>
                            ))}

                        </>
                    )}

                    <ZoomControl position="bottomright" />
                </MapContainer>

                {/* ACTION BUTTON (Aligned with Container) */}
                <div className="absolute bottom-3 left-0 right-0 z-[1001] pointer-events-none">
                    <div className="container-site flex justify-start">
                        <button
                            onClick={() => setSelectingLocation(!selectingLocation)}
                            className={`flex items-center gap-2 px-3 py-2 rounded-lg shadow-2xl border pointer-events-auto transition-all active:scale-95 ${selectingLocation
                                ? 'bg-orange-600 text-white border-orange-400'
                                : 'bg-slate-900/95 text-white border-white/20'
                                }`}
                        >
                            <MapPin className={`w-3.5 h-3.5 ${selectingLocation ? 'text-white' : 'text-orange-500'}`} />
                            <span className="text-[11px] font-black uppercase tracking-wide">{selectingLocation ? 'Cancelar' : companyName}</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
