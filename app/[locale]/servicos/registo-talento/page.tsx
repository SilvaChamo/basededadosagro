"use client";

import { ProfessionalRegistrationForm } from "@/components/ProfessionalRegistrationForm";
import { PageHeader } from "@/components/PageHeader";
import { UserPlus, CheckCircle2 } from "lucide-react";
import Link from "next/link";

export default function RegisterTalentPage() {
    return (
        <main className="min-h-screen bg-slate-50">
            <PageHeader
                title="Registar Perfil Profissional"
                icon={UserPlus}
                backgroundImage="https://images.unsplash.com/photo-1595152248447-c93d5006b00b?q=80&w=2000&auto=format&fit=crop"
                breadcrumbs={[
                    { label: "Início", href: "/" },
                    { label: "Talentos", href: "/servicos" },
                    { label: "Registo", href: undefined }
                ]}
            />

            <div className="container-site relative z-20 mt-10 pb-24">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

                    {/* Sidebar Information */}
                    <div className="hidden lg:block lg:col-span-1 sticky top-24 space-y-6">
                        {/* Info Card 1 */}
                        <div className="bg-white p-6 rounded-[15px] shadow-sm border border-slate-100">
                            <h3 className="font-heading font-black text-xl text-slate-800 mb-4">
                                Informação Importante
                            </h3>
                            <div className="space-y-4">
                                <div className="flex gap-3">
                                    <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                                        <UserPlus className="w-4 h-4 text-emerald-600" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-700 text-sm">Visibilidade Profissional</h4>
                                        <p className="text-xs text-slate-500 leading-relaxed mt-1">
                                            O seu perfil será listado na nossa base de dados de talentos, acessível a empresas e recrutadores do sector agrário.
                                        </p>
                                    </div>
                                </div>
                                <div className="flex gap-3">
                                    <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center shrink-0">
                                        <CheckCircle2 className="w-4 h-4 text-[#f97316]" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-700 text-sm">Validação de Perfil</h4>
                                        <p className="text-xs text-slate-500 leading-relaxed mt-1">
                                            Todos os registos passam por uma validação manual para garantir a qualidade e veracidade da nossa rede.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Support Card */}
                        <div className="bg-emerald-900 p-6 rounded-[15px] shadow-lg relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-4 opacity-10">
                                <UserPlus className="w-24 h-24 text-white transform rotate-12" />
                            </div>
                            <h3 className="relative z-10 font-heading font-bold text-lg text-white mb-2">
                                Precisa de Ajuda?
                            </h3>
                            <p className="relative z-10 text-emerald-100 text-sm mb-4 leading-relaxed">
                                Se tiver dificuldades no preenchimento ou dúvidas sobre a plataforma, contacte a nossa equipa.
                            </p>
                            <Link href="/contactos" className="relative z-10 inline-flex items-center gap-2 text-white font-bold text-xs bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors">
                                Contactar Suporte
                            </Link>
                        </div>
                    </div>

                    {/* Main Form Area */}
                    <div className="lg:col-span-2">
                        <ProfessionalRegistrationForm />
                    </div>

                </div>
            </div>
        </main>
    );
}
