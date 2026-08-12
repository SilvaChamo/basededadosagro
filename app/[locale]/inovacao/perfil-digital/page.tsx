"use client";

import React from "react";
import { QrCode, Share2, Smartphone, ShieldCheck, User, Globe, ArrowRight, CheckCircle2, Building2, Facebook, MessageCircle, Linkedin } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function DigitalProfilePage() {
    return (
        <main className="min-h-screen bg-white">
            {/* Hero Section */}
            <section className="pt-32 pb-20 bg-emerald-950 text-white relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?q=80&w=2000&auto=format&fit=crop')] opacity-10 bg-cover bg-center bg-fixed scale-110"></div>
                <div className="container-site relative z-10">
                    <div className="max-w-3xl">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-6 font-sans">
                            <span className="w-2 h-2 rounded-full bg-[#f97316] animate-pulse"></span>
                            <span className="text-xs font-bold uppercase tracking-widest text-[#f97316]">Presença Digital 360º</span>
                        </div>
                        <h1 className="text-[45px] font-[900] mb-6 leading-tight tracking-tight text-white">
                            A Sua Empresa no Próximo <br /> <span className="text-[#f97316]">Nível Digital</span>
                        </h1>
                        <p className="text-xl text-emerald-100/80 leading-relaxed font-medium mb-8">
                            O seu perfil na Base Agro Data é muito mais que um registo bibliográfico. É a sua vitrine profissional para o mundo, pronta para partilhar.
                        </p>
                    </div>
                </div>
            </section>

            {/* QR Code & Sharing Section */}
            <section className="py-24 container-site">
                <div className="grid lg:grid-cols-2 gap-16 items-center">
                    <div className="order-2 lg:order-1 relative">
                        {/* Mock Phone Layout */}
                        <div className="relative w-[340px] mx-auto bg-slate-900 rounded-[32px] p-2 shadow-2xl ring-1 ring-white/10">
                            {/* Physical Buttons */}
                            <div className="absolute -left-1 top-20 w-1 h-12 bg-slate-800 rounded-l-md border-y border-white/10"></div> {/* Volume Up */}
                            <div className="absolute -left-1 top-34 w-1 h-12 bg-slate-800 rounded-l-md border-y border-white/10"></div> {/* Volume Down */}
                            <div className="absolute -right-1 top-24 w-1 h-16 bg-slate-800 rounded-r-md border-y border-white/10"></div> {/* Power Button */}

                            <div className="relative aspect-[9/16.5] bg-white rounded-[28px] overflow-hidden">
                                <div className="p-6 text-center">
                                    <div className="w-16 h-16 bg-emerald-50 rounded-2xl mx-auto mb-3 flex items-center justify-center border border-emerald-100">
                                        <Building2 className="w-8 h-8 text-emerald-600" />
                                    </div>
                                    <h3 className="font-black text-slate-800 text-base leading-tight">Agro Export Lda</h3>
                                    <p className="text-[10px] text-slate-500 mb-4">Maputo, Moçambique</p>

                                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col items-center">
                                        <QrCode className="w-24 h-24 text-slate-800 mb-2" />
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Digital Card</p>
                                    </div>

                                    <div className="mt-6 flex gap-3 justify-center">
                                        <div className="w-10 h-10 bg-emerald-600 rounded-full flex items-center justify-center text-white shadow-lg hover:scale-110 active:scale-95 transition-all cursor-pointer">
                                            <Share2 className="w-4 h-4" />
                                        </div>
                                        <div className="w-10 h-10 bg-[#1877F2] rounded-full flex items-center justify-center text-white shadow-lg hover:scale-110 active:scale-95 transition-all cursor-pointer">
                                            <Facebook className="w-4 h-4" />
                                        </div>
                                        <div className="w-10 h-10 bg-[#25D366] rounded-full flex items-center justify-center text-white shadow-lg hover:scale-110 active:scale-95 transition-all cursor-pointer">
                                            <MessageCircle className="w-4 h-4 text-white fill-current" />
                                        </div>
                                        <div className="w-10 h-10 bg-[#0A66C2] rounded-full flex items-center justify-center text-white shadow-lg hover:scale-110 active:scale-95 transition-all cursor-pointer">
                                            <Linkedin className="w-4 h-4" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="order-1 lg:order-2">
                        <h2 className="text-[45px] font-black text-slate-800/90 mb-6 tracking-tight">Partilha <span className="text-emerald-500">Inteligente</span> em Todo o Lado</h2>
                        <p className="text-slate-600 font-medium text-lg leading-relaxed mb-8">
                            Cada perfil profissional inclui ferramentas integradas para que possa ser contactado instantaneamente por potenciais clientes e parceiros.
                        </p>
                        <ul className="space-y-6">
                            {[
                                { title: "QR Code Exclusivo", desc: "Imprima o seu QR Code em embalagens, cartões de visita ou facturas para que os clientes acedam ao seu catálogo com um scanner.", icon: <QrCode className="w-6 h-6 text-emerald-600" /> },
                                { title: "Cartão de Visita Digital", desc: "Um link único e optimizado para telemóveis que funciona como o seu portfólio oficial.", icon: <Smartphone className="w-6 h-6 text-emerald-600" /> },
                                { title: "Integração Social", desc: "Partilhe o seu perfil no WhatsApp, Facebook e LinkedIn com pré-visualizações ricas e profissionais.", icon: <Share2 className="w-6 h-6 text-emerald-600" /> }
                            ].map((item, i) => (
                                <li key={i} className="flex gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                                    <div className="shrink-0 w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center border border-slate-200">
                                        {item.icon}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-800 mb-1">{item.title}</h4>
                                        <p className="text-sm text-slate-500 font-medium leading-relaxed">{item.desc}</p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </section>

            {/* Visibility Section */}
            <section className="py-24 bg-slate-50 border-y border-slate-100">
                <div className="container-site text-center max-w-4xl mx-auto">
                    <h2 className="text-[45px] font-black text-slate-800/90 mb-6 tracking-tight">O Seu Perfil é a Sua Empresa <span className="text-orange-500">Online</span></h2>
                    <p className="text-slate-600 font-medium text-lg mb-12">
                        Centralize as suas informações, contactos e produtos num único local seguro e profissional. Sem necessidade de custos de manutenção de site próprio.
                    </p>
                    <div className="grid md:grid-cols-4 gap-4">
                        {[
                            { label: "Catálogo", icon: <CheckCircle2 className="w-4 h-4" /> },
                            { label: "Contactos", icon: <CheckCircle2 className="w-4 h-4" /> },
                            { label: "Localização", icon: <CheckCircle2 className="w-4 h-4" /> },
                            { label: "Produtos", icon: <CheckCircle2 className="w-4 h-4" /> },
                            { label: "Galeria", icon: <CheckCircle2 className="w-4 h-4" /> },
                            { label: "Preços", icon: <CheckCircle2 className="w-4 h-4" /> },
                            { label: "Horários", icon: <CheckCircle2 className="w-4 h-4" /> },
                            { label: "Redes Sociais", icon: <CheckCircle2 className="w-4 h-4" /> }
                        ].map((item, i) => (
                            <div key={i} className="flex items-center gap-2 px-4 py-3 bg-white border border-slate-200 rounded-xl font-bold text-slate-700 text-sm">
                                <span className="text-emerald-500">{item.icon}</span>
                                {item.label}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-24 container-site text-center">
                <h2 className="text-[45px] font-black text-slate-800/90 mb-8">Crie o seu Cartão <span className="text-emerald-500">Digital</span> hoje</h2>
                <div className="flex flex-wrap justify-center gap-4">
                    <Link href="/registar">
                        <Button className="bg-[#f97316] hover:bg-orange-600 text-white font-bold px-8 h-12 rounded-xl shadow-lg shadow-orange-500/20">
                            Registar Agora
                        </Button>
                    </Link>
                    <Link href="/empresas">
                        <Button variant="outline" className="border-slate-200 text-slate-600 hover:bg-slate-50 font-bold px-8 h-12 rounded-xl">
                            Ver Exemplos reais
                        </Button>
                    </Link>
                </div>
            </section>
        </main>
    );
}
