"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { PricingPlans } from "@/components/PricingPlans";
import { PartnerPlanCTA } from "@/components/PartnerPlanCTA";

export default function PricingPage() {
    return (
        <div className="min-h-screen bg-slate-50 font-sans">
            {/* Header / Navbar Simplificada */}
            <header className="bg-white border-b border-slate-200 py-4">
                <div className="max-w-6xl mx-auto px-4 flex items-center justify-between">
                    <Link href="/usuario/dashboard" className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors font-medium">
                        <ArrowLeft className="w-5 h-5" />
                        Voltar ao Dashboard
                    </Link>
                    <Link href="/">
                        <Image
                            src="/Logo.png"
                            alt="Base Agro Data"
                            width={875}
                            height={491}
                            className="h-8 w-auto"
                            priority
                        />
                    </Link>
                    <div className="w-[140px] hidden md:block"></div> {/* Spacer for center alignment */}
                </div>
            </header>

            <main className="py-16">
                <div className="container-site">

                    {/* Hero Section */}
                    <div className="text-center max-w-3xl mx-auto">
                        <span className="text-orange-600 font-bold tracking-wider uppercase text-sm bg-orange-50 px-3 py-1 rounded-full mb-4 inline-block">
                            Planos Flexíveis
                        </span>
                        <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-6 tracking-tight">
                            Escolha o plano ideal para o seu <span className="text-orange-600">crescimento</span>.
                        </h1>
                    </div>

                    <PricingPlans />

                </div>
            </main>

            {/* Partner Plan / Support Section with White Background */}
            <section className="bg-white py-16 border-t border-slate-200">
                <PartnerPlanCTA />
            </section>
        </div>
    );
}
