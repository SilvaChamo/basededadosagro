"use client";

import React from "react";
import { PageHeader } from "@/components/PageHeader";
import { Scale, ShieldCheck, FileText, CheckCircle2 } from "lucide-react";

export default function TermsPage() {
    const sections = [
        {
            title: "1. Aceitação dos Termos",
            content: "Ao aceder e utilizar a plataforma Base Agro Data, o utilizador concorda plenamente com os presentes termos e condições de uso. Se não concordar com qualquer parte destes termos, não deverá utilizar os nossos serviços."
        },
        {
            title: "2. Descrição do Serviço",
            content: "A Base Agro Data fornece uma plataforma digital para agregação de indicadores agrícolas, monitoria de preços de mercado e ligação entre produtores, empresas e profissionais do sector agrário em Moçambique."
        },
        {
            title: "3. Responsabilidades do Utilizador",
            content: "O utilizador compromete-se a fornecer informações verdadeiras e actualizadas no momento do registo e a utilizar a plataforma de forma ética, respeitando as leis em vigor na República de Moçambique."
        },
        {
            title: "4. Propriedade Intelectual",
            content: "Todo o conteúdo presente na plataforma, incluindo textos, logótipos, gráficos e software, é propriedade da Base Agro Data ou dos seus licenciadores e está protegido por leis de direitos de autor."
        },
        {
            title: "5. Limitação de Responsabilidade",
            content: "Embora nos esforcemos para garantir a precisão dos dados (especialmente cotações SIMA), a Base Agro Data não se responsabiliza por decisões financeiras tomadas com base em informações flutuantes do mercado."
        }
    ];

    return (
        <main className="min-h-screen bg-slate-50">
            <PageHeader
                title={<>Termos e <span className="text-[#f97316]">Condições</span></>}
                icon={Scale}
                backgroundImage="https://images.unsplash.com/photo-1450101499163-c8848c66ca85?q=80&w=2000&auto=format&fit=crop"
                breadcrumbs={[
                    { label: "Início", href: "/" },
                    { label: "Termos e Condições", href: undefined }
                ]}
            />

            <div className="container-site py-20">
                <div className="max-w-4xl mx-auto">
                    <div className="bg-white p-10 md:p-16 rounded-[40px] border border-slate-100 shadow-xl relative overflow-hidden">
                        {/* Decorative background element */}
                        <div className="absolute top-0 right-0 p-8 opacity-5">
                            <ShieldCheck className="w-48 h-48 text-emerald-600" />
                        </div>

                        <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-10">
                                <FileText className="w-6 h-6 text-emerald-600" />
                                <span className="text-xs font-black uppercase tracking-[0.3em] text-slate-400">Actualizado em Janeiro de 2024</span>
                            </div>

                            <div className="space-y-12">
                                {sections.map((section, i) => (
                                    <section key={i} className="space-y-4">
                                        <h2 className="text-2xl font-black text-slate-800 tracking-tight">{section.title}</h2>
                                        <p className="text-slate-500 leading-relaxed font-medium">
                                            {section.content}
                                        </p>
                                    </section>
                                ))}
                            </div>

                            <div className="mt-20 pt-10 border-t border-slate-100 flex items-center gap-4 text-emerald-600">
                                <CheckCircle2 className="w-5 h-5 shrink-0" />
                                <p className="text-xs font-bold leading-relaxed">
                                    Ao continuar a navegar, o utilizador confirma que leu e compreendeu integralmente os termos acima descritos.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
