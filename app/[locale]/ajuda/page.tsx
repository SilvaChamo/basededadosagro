"use client";

import React from "react";
import { PageHeader } from "@/components/PageHeader";
import { HelpCircle, Mail, Phone, MessageSquare, Book, ShieldQuestion } from "lucide-react";
import Link from "next/link";

export default function HelpPage() {
    const faq = [
        {
            q: "Como posso registar a minha empresa?",
            a: "Pode registar a sua empresa clicando no botão 'Registar Empresa' no menu superior ou na página de mercado. O processo é simples e requer apenas os dados básicos da sua actividade."
        },
        {
            q: "O acesso aos dados de mercado é gratuito?",
            a: "Sim, o acesso básico às cotações de mercado (SIMA) e indicadores gerais é gratuito para todos os utilizadores através da nossa plataforma digital."
        },
        {
            q: "Como posso anunciar os meus produtos?",
            a: "Após criar a sua conta de empresa, poderá listar os seus produtos e insumos no nosso mercado digital através do painel de controlo do utilizador."
        },
        {
            q: "Esqueci-me da minha palavra-passe. O que fazer?",
            a: "Na página de login, clique em 'Esqueci-me da senha' e siga as instruções enviadas para o seu e-mail para redefinir o acesso."
        }
    ];

    return (
        <main className="min-h-screen bg-slate-50">
            <PageHeader
                title={<>Central de <span className="text-[#f97316]">Ajuda</span></>}
                icon={HelpCircle}
                backgroundImage="https://images.unsplash.com/photo-1484417894907-623942c8ee29?q=80&w=2000&auto=format&fit=crop"
                breadcrumbs={[
                    { label: "Início", href: "/" },
                    { label: "Ajuda", href: undefined }
                ]}
            />

            <div className="container-site py-16">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    {/* FAQ Section */}
                    <div className="lg:col-span-8 space-y-8">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600">
                                <ShieldQuestion className="w-6 h-6" />
                            </div>
                            <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Perguntas Frequentes</h2>
                        </div>

                        <div className="space-y-4">
                            {faq.map((item, i) => (
                                <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all">
                                    <h3 className="font-bold text-slate-800 mb-2 flex items-start gap-3">
                                        <span className="text-emerald-500 font-black">Q.</span>
                                        {item.q}
                                    </h3>
                                    <p className="text-slate-500 text-sm leading-relaxed pl-7">
                                        {item.a}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Support Sidebar */}
                    <div className="lg:col-span-4 space-y-6">
                        <div className="bg-emerald-950 p-8 rounded-3xl text-white relative overflow-hidden">
                            <div className="relative z-10">
                                <h3 className="text-xl font-black mb-4">Ainda precisa de apoio?</h3>
                                <p className="text-slate-400 text-sm mb-8 leading-relaxed">
                                    A nossa equipa de suporte técnico está disponível de Segunda a Sexta-feira para o ajudar com qualquer questão.
                                </p>

                                <div className="space-y-4">
                                    <a href="mailto:suporte@basededadosagro.com" className="flex items-center gap-4 group">
                                        <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center group-hover:bg-emerald-500 transition-colors">
                                            <Mail className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">E-mail</p>
                                            <p className="text-sm font-bold">suporte@basededadosagro.com</p>
                                        </div>
                                    </a>

                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                                            <Phone className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Telefone</p>
                                            <p className="text-sm font-bold">+258 84 000 0000</p>
                                        </div>
                                    </div>
                                </div>

                                <Link href="/contactos" className="mt-10 block">
                                    <button className="w-full py-4 bg-[#f97316] hover:bg-white hover:text-slate-900 text-white rounded-xl font-black uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-2">
                                        <MessageSquare className="w-4 h-4" />
                                        Abrir Ticket
                                    </button>
                                </Link>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-3xl border border-slate-200">
                            <div className="flex items-center gap-3 mb-4 text-emerald-600">
                                <Book className="w-5 h-5" />
                                <h4 className="font-black text-xs uppercase tracking-widest">Documentação</h4>
                            </div>
                            <p className="text-slate-500 text-xs leading-relaxed mb-4">
                                Descarregue os nossos guias em PDF para aprender a tirar o máximo proveito da plataforma.
                            </p>
                            <Link href="/repositorio" className="text-[11px] font-black text-emerald-600 uppercase tracking-widest hover:text-slate-900 transition-colors">
                                Explorar Repositório &rarr;
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
