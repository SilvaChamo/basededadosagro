"use client";

import React from "react";
import { CheckCircle2, Star, Shield, Zap, Globe, BarChart, Users, Award, ArrowRight, Smartphone, MessageSquare, Search, Building2, MapPin, MessageCircle, QrCode } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";

export default function VantagensCadastroPage() {
    const advantages = [
        {
            title: "Visibilidade no Google (SEO)",
            desc: "Seu perfil é otimizado automaticamente para aparecer nas pesquisas de clientes no Google, aumentando o alcance do seu negócio.",
            icon: Search,
            color: "text-blue-500",
            bg: "bg-blue-50"
        },
        {
            title: "Portfólio Digital Premium",
            desc: "Uma página exclusiva com seus produtos, serviços e contactos que funciona como seu cartão de visita digital em Moçambique.",
            icon: Smartphone,
            color: "text-emerald-500",
            bg: "bg-emerald-50"
        },
        {
            title: "Comunicação Segmentada",
            desc: "Acesso a ferramentas de SMS e E-mail Marketing para enviar novidades diretamente aos seus clientes e parceiros.",
            icon: MessageSquare,
            color: "text-orange-500",
            bg: "bg-orange-50"
        },
        {
            title: "Estatísticas em Tempo Real",
            desc: "Monitorize quem visita o seu perfil, cliques e interesse nos seus serviços através de um dashboard intuitivo.",
            icon: BarChart,
            color: "text-purple-500",
            bg: "bg-purple-50"
        },
        {
            title: "Credibilidade & Selos",
            desc: "Destaque-se com o selo de 'Empresa Verificada' na maior base de dados agrícola do país, gerando confiança instantânea.",
            icon: Shield,
            color: "text-red-500",
            bg: "bg-red-50"
        },
        {
            title: "Networking Estratégico",
            desc: "Conecte-se com fornecedores, investidores e outros profissionais do setor agrário numa rede de alto nível.",
            icon: Users,
            color: "text-cyan-500",
            bg: "bg-cyan-50"
        }
    ];

    const privileges = [
        "Acesso antecipado a novos recursos da plataforma",
        "Prioridade de suporte técnico especializado",
        "Destaque nas categorias de pesquisa do portal",
        "Relatórios mensais de visibilidade e mercado",
        "Descontos exclusivos em eventos e formações parceiras"
    ];

    return (
        <main className="min-h-screen bg-slate-50 pb-20">
            {/* Hero Section */}
            <section className="w-full mb-16 bg-white relative overflow-hidden flex items-center min-h-[600px] pt-[114px]">
                <div className="absolute inset-0 z-0">
                    <Image
                        src="/images/markets/choppies_bg.png"
                        alt="Background"
                        fill
                        className="object-cover opacity-[0.15]"
                    />
                </div>

                <div className="container-site relative z-10 py-[90px]">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        {/* Column 1: Text Content */}
                        <div className="max-w-xl">
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 text-sm font-bold uppercase tracking-wider mb-6">
                                <Star className="w-4 h-4 fill-emerald-600" />
                                Oportunidade Exclusiva
                            </div>
                            <h1 className="text-[45px] font-black mb-4 leading-[1.05] text-slate-900">
                                Eleve o seu Negócio ao <br /> <span className="text-emerald-500">Próximo Nível</span>
                            </h1>
                            <p className="text-lg text-slate-600 font-medium mb-6 leading-snug">
                                Estar registado na Base Agro Data não é apenas um diretório; é o passaporte para a transformação digital do seu agro-negócio em Moçambique.
                            </p>
                            <div className="flex flex-wrap gap-3">
                                <Link href="/registar">
                                    <Button className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-11 px-8 rounded-[10px] text-base shadow-lg shadow-emerald-900/20">
                                        Registar Agora Grátis
                                    </Button>
                                </Link>
                                <Link href="/auth/login">
                                    <Button variant="outline" className="border-slate-200 text-slate-700 hover:bg-slate-50 font-bold h-11 px-8 rounded-[10px] text-base">
                                        Entrar na Conta
                                    </Button>
                                </Link>
                            </div>
                        </div>

                        {/* Column 2: Floating Form Elements */}
                        <div className="relative hidden lg:block h-[400px]">
                            {/* Floating Field 1: Name/Profile */}
                            <div className="absolute top-10 right-[140px] bg-white p-6 rounded-[15px] shadow-2xl border border-slate-100 w-72 animate-float">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                                        <Building2 className="w-5 h-5 text-emerald-600" />
                                    </div>
                                    <div className="space-y-1">
                                        <div className="h-2 w-20 bg-slate-100 rounded"></div>
                                        <div className="h-3 w-32 bg-slate-200 rounded"></div>
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <div className="h-10 w-full bg-slate-50 border border-slate-100 rounded-lg flex items-center px-4">
                                        <span className="text-slate-400 text-xs">Agro Negócio Lda</span>
                                    </div>
                                </div>
                            </div>

                            {/* Floating Field 3: Activity/Success (Cadastro Verificado) */}
                            <div className="absolute bottom-20 right-20 bg-white p-5 rounded-[15px] shadow-2xl border border-emerald-100 w-64 animate-float-delayed">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-emerald-500 flex items-center justify-center shrink-0 shadow-lg shadow-emerald-500/30">
                                        <CheckCircle2 className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-black text-slate-800 uppercase tracking-wider">Cadastro Verificado</p>
                                        <p className="text-[10px] text-emerald-600 font-bold">Pronto para o mercado</p>
                                    </div>
                                </div>
                            </div>

                            {/* Decorative background circle */}
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-emerald-500/5 rounded-full blur-[100px] -z-10"></div>
                        </div>
                    </div>
                </div>
            </section>
            {/* Vantagens Grid */}
            <section className="container-site mb-24">
                <div className="text-center max-w-2xl mx-auto mb-16">
                    <h2 className="text-xs font-black text-emerald-600 uppercase tracking-[0.2em] mb-4">Funcionalidades</h2>
                    <h3 className="text-[45px] font-black text-slate-800 leading-[1.1]">
                        O que ganha ao estar <br /> <span className="text-orange-500">connosco?</span>
                    </h3>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-[20px]">
                    {advantages.map((adv, i) => (
                        <div key={i} className="bg-white p-8 rounded-[15px] border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                            <div className={`w-14 h-14 ${adv.bg} ${adv.color} rounded-2xl flex items-center justify-center mb-6`}>
                                <adv.icon className="w-7 h-7" />
                            </div>
                            <h4 className="text-[22px] font-black text-slate-800 mb-3">{adv.title}</h4>
                            <p className="text-slate-500 leading-snug">{adv.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Google Visibility Section */}
            <section className="py-24 bg-slate-950 text-white relative overflow-hidden mb-24">
                {/* Fixed Background Image Overlay */}
                <div
                    className="absolute inset-0 z-0 bg-fixed bg-cover bg-center opacity-20"
                    style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2000&auto=format&fit=crop)' }}
                ></div>

                <div className="container-site relative z-10">
                    <div className="text-center mb-[25px]">
                        <div className="flex items-center justify-center gap-4 mb-3">
                            <div className="w-10 h-[1.5px] bg-[#f97316]"></div>
                            <span className="text-[#f97316] font-bold text-sm uppercase tracking-[0.3em]">estratégia digital</span>
                            <div className="w-10 h-[1.5px] bg-[#f97316]"></div>
                        </div>
                        <h2 className="text-[45px] font-[900] leading-[1.1] mb-4 text-white">
                            Destaque sua empresa no{" "}
                            <span className="notranslate inline-flex drop-shadow-sm">
                                <span className="text-[#4285F4]">G</span>
                                <span className="text-[#EA4335]">o</span>
                                <span className="text-[#FBBC05]">o</span>
                                <span className="text-[#4285F4]">g</span>
                                <span className="text-[#34A853]">l</span>
                                <span className="text-[#EA4335]">e</span>
                            </span>
                        </h2>

                        <div className="max-w-3xl mx-auto mb-[35px]">
                            <p className="text-white/80 text-center text-sm leading-relaxed font-medium">
                                Ao registar e destacar a sua empresa nas nossas plataformas móveis e no site, está automaticamente a colocar a sua empresa no raio de rastreio dos robôs da Google para indexar os links na plataforma Google Search. Além disso, as nossas plataformas utilizam tecnologias de ponta que permitem:
                            </p>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-3 gap-[20px] mt-10">
                        {/* WhatsApp Feature */}
                        <div className="bg-white/5 p-5 rounded-2xl border border-white/50 hover:bg-white/10 transition-all group flex flex-col gap-[10px]">
                            <div className="w-11 h-11 bg-emerald-600 rounded-lg flex items-center justify-center mb-1 shadow-lg shadow-emerald-600/20 group-hover:scale-110 transition-transform">
                                <MessageCircle className="w-6 h-6 text-white" fill="white" />
                            </div>
                            <h4 className="text-xl font-bold text-white">Partilha WhatsApp</h4>
                            <p className="text-white/70 text-sm leading-relaxed font-[500]">
                                Com um clique, envie o seu perfil profissional para clientes e grupos, aumentando o tráfego e ajudando o Google a perceber a importância da sua página.
                            </p>
                            <div className="h-1 w-12 bg-emerald-600 rounded-full mt-[8px] mb-[8px]"></div>
                        </div>

                        {/* QR Code Feature */}
                        <div className="bg-white/5 p-5 rounded-2xl border border-white/50 hover:bg-white/10 transition-all group flex flex-col gap-[10px]">
                            <div className="w-11 h-11 bg-[#f97316] rounded-lg flex items-center justify-center mb-1 shadow-lg shadow-orange-600/20 group-hover:scale-110 transition-transform">
                                <QrCode className="w-6 h-6 text-white" />
                            </div>
                            <h4 className="text-xl font-bold text-white">QR Code Profissional</h4>
                            <p className="text-white/70 text-sm leading-relaxed font-[500]">
                                Crie o seu código profissional que aponta para o seu perfil. Pode mostrar no telemóvel ou imprimir em cartões de visita e etiquetas de produtos.
                            </p>
                            <div className="h-1 w-12 bg-[#f97316] rounded-full mt-[8px] mb-[8px]"></div>
                        </div>

                        {/* SEO Feature */}
                        <div className="bg-white/5 p-5 rounded-2xl border border-white/50 hover:bg-white/10 transition-all group flex flex-col gap-[10px]">
                            <div className="w-11 h-11 bg-blue-600 rounded-lg flex items-center justify-center mb-1 shadow-lg shadow-blue-600/20 group-hover:scale-110 transition-transform">
                                <Search className="w-6 h-6 text-white" />
                            </div>
                            <h4 className="text-xl font-bold text-white">Identidade Digital (SEO)</h4>
                            <p className="text-white/70 text-sm leading-relaxed font-[500]">
                                Ferramenta focada em backlinks e tráfego real para o diretório, fazendo com que o Google indexe a sua empresa muito mais rápido e com mais autoridade.
                            </p>
                            <div className="h-1 w-12 bg-blue-600 rounded-full mt-[8px] mb-[8px]"></div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Privileges & CTA */}
            <section className="container-site">
                <div className="grid lg:grid-cols-2 gap-[20px] items-center">
                    <div className="bg-slate-950 rounded-[15px] p-8 md:p-12 text-white border border-slate-800">
                        <h3 className="text-[45px] font-black mb-4 text-white">Privilégios de <span className="text-orange-500">Membro</span></h3>
                        <div className="space-y-3">
                            {privileges.map((priv, i) => (
                                <div key={i} className="flex gap-4 items-center">
                                    <div className="w-6 h-6 rounded-full bg-orange-500/20 flex items-center justify-center shrink-0">
                                        <CheckCircle2 className="w-4 h-4 text-orange-500" />
                                    </div>
                                    <p className="text-lg font-medium text-white">{priv}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <h3 className="text-[45px] font-black text-slate-800 mb-2 leading-[1.05]">
                                Junte-se à maior comunidade <span className="text-emerald-500">agrotech</span>
                            </h3>
                            <p className="text-slate-500 text-lg leading-snug mb-4">
                                Milhares de produtores e empresas já estão a colher os frutos da nossa rede. Não fique para trás na revolução digital do campo.
                            </p>
                            <div className="bg-orange-50 border border-orange-100 p-6 rounded-[15px] flex gap-4 mb-4">
                                <Award className="w-10 h-10 text-orange-500 shrink-0" />
                                <div>
                                    <p className="font-bold text-orange-800">Selo de Qualidade Garantido</p>
                                    <p className="text-sm text-orange-700/80">Ao registar-se, a sua empresa passa por uma validação que garante o acesso a parcerias exclusivas com grandes agro-indústrias.</p>
                                </div>
                            </div>
                        </div>

                        <Link href="/registar" className="inline-block">
                            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium h-13 px-10 rounded-[10px] text-xl group transition-all shadow-lg shadow-emerald-900/20">
                                Começar o meu Cadastro
                                <ArrowRight className="ml-2 w-6 h-6 group-hover:translate-x-1 transition-transform" />
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>
        </main>
    );
}
