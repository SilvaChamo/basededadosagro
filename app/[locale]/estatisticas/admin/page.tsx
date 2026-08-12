"use client";

import { PageHeader } from "@/components/PageHeader";
import { StatsEntryForm } from "@/components/stats/StatsEntryForm";
import { Settings } from "lucide-react";

export default function AdminStatsPage() {
    return (
        <div className="min-h-screen bg-gray-50">
            <PageHeader
                title="Administração de Dados"
                breadcrumbs={[
                    { label: "Início", href: "/" },
                    { label: "Estatísticas", href: "/estatisticas/producao" },
                    { label: "Painel Admin", href: undefined }
                ]}
                icon={Settings}
                backgroundImage="/images/page-banner-bg.png"
            />


            <div className="container-site py-12">
                <div className="max-w-4xl mx-auto space-y-8">
                    <div className="text-center space-y-2">
                        <h2 className="text-3xl font-black text-gray-900 tracking-tight">Gestão de Estatísticas</h2>
                        <p className="text-gray-500 max-w-xl mx-auto">
                            Utilize o formulário abaixo para inserir novos indicadores agrícolas na base de dados. Estes dados serão reflectidos automaticamente nos gráficos e tabelas públicos.
                        </p>
                    </div>

                    <StatsEntryForm />

                    {/* Quick Tips */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100 flex gap-4">
                            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center shrink-0 text-white font-bold">1</div>
                            <div>
                                <h4 className="font-bold text-blue-900 text-sm mb-1">Cuidado com os Valores</h4>
                                <p className="text-xs text-blue-800 leading-relaxed">
                                    Insira valores numéricos simples. O sistema formata automaticamente para Moneda (MZN) ou Toneladas dependendo da categoria.
                                </p>
                            </div>
                        </div>
                        <div className="bg-orange-50 p-6 rounded-2xl border border-orange-100 flex gap-4">
                            <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center shrink-0 text-white font-bold">2</div>
                            <div>
                                <h4 className="font-bold text-orange-900 text-sm mb-1">Província "Todas"</h4>
                                <p className="text-xs text-orange-800 leading-relaxed">
                                    Use a opção "Todas" para dados que representam o somatório nacional ou indicadores gerais.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
