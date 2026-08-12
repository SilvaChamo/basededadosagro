import React from "react";
import { MobileAppSection } from "@/components/MobileAppSection";

export default function KitPadraoPage() {
    return (
        <div className="min-h-screen bg-slate-50">
            <div className="container-site py-20">
                <h1 className="text-3xl font-black text-slate-800 mb-10">Kit Padrão: Botânica Scanner</h1>
                <div className="border border-dashed border-slate-300 rounded-[20px] overflow-hidden">
                    <MobileAppSection />
                </div>
            </div>
        </div>
    );
}
