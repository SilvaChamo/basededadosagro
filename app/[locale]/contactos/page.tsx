"use client";

import { PageHeader } from "@/components/PageHeader";
import { Phone, Mail, MapPin } from "lucide-react";
import { ContactForm } from "@/components/ContactForm";

export default function ContactosPage() {
    return (
        <main className="min-h-screen bg-transparent relative">
            {/* Background Image Overlay */}
            <div
                className="absolute inset-0 z-0 opacity-[0.2] pointer-events-none bg-center bg-cover bg-no-repeat"
                style={{ backgroundImage: "url('/assets/cta-gradient-bg.webp')" }}
            />
            <PageHeader
                title={<>Entre em <span className="text-[#f97316]">Contacto</span></>}
                icon={Phone}
                backgroundImage="https://images.unsplash.com/photo-1423666639041-f56000c27a9a?q=80&w=2000&auto=format&fit=crop"
                breadcrumbs={[
                    { label: "Início", href: "/" },
                    { label: "Contactos", href: undefined }
                ]}
            />

            <div className="container-site relative z-20 mt-[50px] pb-24">


                {/* Main Content Area - Split Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-[20px] items-start">

                    {/* Left Column: Contact Info (Vertical Stack) */}
                    <div className="lg:col-span-4 flex flex-col gap-[20px]">
                        <div className="card-agro group flex items-start gap-6 rounded-[15px]">
                            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                                <Phone className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="font-black text-slate-800/80 text-[24px] mb-1">Telefones</h3>
                                <p className="text-slate-500 font-medium">+258 87 75 75 288</p>
                                <p className="text-slate-500 font-medium">+258 82 52 88 328</p>
                            </div>
                        </div>

                        <div className="card-agro group flex items-start gap-6 rounded-[15px]">
                            <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                                <Mail className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="font-black text-slate-800/80 text-[24px] mb-1">E-mail</h3>
                                <a href="mailto:geral@basededadosagro.com" className="text-slate-500 font-medium hover:text-[#f97316] transition-colors">
                                    geral@basededadosagro.com
                                </a>
                            </div>
                        </div>

                        <div className="card-agro group flex items-start gap-6 rounded-[15px]">
                            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                                <MapPin className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="font-black text-slate-800/80 text-[24px] mb-1">Endereço Físico</h3>
                                <p className="text-slate-500 font-medium">Av. Karl Marx nº 177</p>
                                <p className="text-slate-500 font-medium">Maputo - Moçambique</p>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Secure Contact Form */}
                    <div className="lg:col-span-8">
                        <ContactForm />
                    </div>
                </div>

            </div>
        </main>
    );
}
