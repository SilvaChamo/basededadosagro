"use client";

import { PricingPlans } from "@/components/PricingPlans";
import { PartnerPlanCTA } from "@/components/PartnerPlanCTA";

// Últimas secções da homepage, antes do rodapé:
//  - Planos: fundo transparente, como a secção de notícias (InfoSection).
//  - Parceiro: largura total, fundo branco, sem margem em baixo — encosta ao
//    rodapé (a linha laranja do rodapé fica sobre este branco).
export function HomePlansSection() {
    return (
        <>
            <section className="w-full bg-transparent relative py-24">
                <div className="container-site relative z-10">
                    <div className="text-center max-w-3xl mx-auto">
                        <span className="text-orange-600 font-bold tracking-wider uppercase text-sm bg-orange-50 px-3 py-1 rounded-full mb-4 inline-block">
                            Planos e Preços
                        </span>
                        <h2 className="text-[28px] md:text-[45px] font-heading font-black text-slate-600 leading-[1.1] tracking-tight">
                            Escolha o plano ideal para o seu <span className="text-orange-600">crescimento</span>.
                        </h2>
                    </div>

                    <PricingPlans />
                </div>
            </section>

            <section className="w-full bg-white pt-16 pb-16">
                <PartnerPlanCTA />
            </section>
        </>
    );
}
