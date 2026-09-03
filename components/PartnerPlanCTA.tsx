"use client";

import { useState } from "react";
import { HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PartnerInterestModal } from "@/components/PartnerInterestModal";

export function PartnerPlanCTA() {
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <div className="container-site text-center">
            <h2 className="text-[28px] md:text-[45px] font-heading font-black text-slate-600 leading-[1.1] tracking-tight mb-4">Quer assinar o Plano <span className="text-orange-600">Parceiro</span>?</h2>
            <p className="text-slate-600 mb-8 max-w-2xl mx-auto">
                Entre em contacto com a nossa equipe do sector comercial que está pronta para ajudar você a celebrar uma parceria.
            </p>
            <Button
                onClick={() => setIsModalOpen(true)}
                variant="outline"
                className="gap-2 px-[25px] py-[8px] rounded-[7px] font-bold border-slate-300 hover:bg-slate-50 transition-all cursor-pointer"
            >
                <HelpCircle className="w-5 h-5 text-orange-600" />
                Falar connosco
            </Button>

            <PartnerInterestModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            />
        </div>
    );
}
