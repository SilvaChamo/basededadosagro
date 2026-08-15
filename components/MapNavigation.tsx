"use client";

import dynamic from 'next/dynamic';
import React from 'react';
import { Spinner } from "@/components/ui/spinner";

// Dynamically import the map logic to prevent SSR errors
const MapInner = dynamic(() => import('./MapNavigationInner'), {
    ssr: false,
    loading: () => (
        <div className="w-full h-full bg-slate-100 animate-pulse flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
                <Spinner className="w-10 h-10" />
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Carregando Mapa...</p>
            </div>
        </div>
    )
});

interface MapNavigationProps {
    companyCoords: [number, number] | null;
    companyName: string;
    companyAddress: {
        address: string;
        district?: string;
        province?: string;
    };
}

export function MapNavigation({ companyCoords, companyName, companyAddress }: MapNavigationProps) {
    return <MapInner companyCoords={companyCoords} companyName={companyName} companyAddress={companyAddress} />;
}
