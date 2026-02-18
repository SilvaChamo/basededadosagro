"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { Store, MapPin, Search, ArrowRight, Filter, Phone, Hammer, Tractor, Sprout } from "lucide-react";
import { ContactCTA } from "@/components/ContactCTA";
import { createClient } from "@/utils/supabase/client";
import { Loader2 } from "lucide-react";

export default function LojasPage() {
    const [stores, setStores] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const supabase = createClient();

    const fallbackStores = [
        {
            name: "Agro-Peças Central",
            category: "Peças e Manutenção",
            location: "Beira, Sofala",
            status: "Aberto",
            iconBg: "bg-blue-50",
            iconColor: "text-blue-600",
            icon: Hammer,
            image_url: "https://images.unsplash.com/photo-1580974852861-c381510bc98a?q=80&w=1000&auto=format&fit=crop"
        },
        {
            name: "Equipamentos do Vale",
            category: "Maquinaria Pesada",
            location: "Tete, Tete",
            status: "Aberto",
            iconBg: "bg-orange-50",
            iconColor: "text-orange-600",
            icon: Tractor,
            image_url: "https://images.unsplash.com/photo-1530267981375-27340353c3dd?q=80&w=1000&auto=format&fit=crop"
        },
        {
            name: "Casa do Agricultor",
            category: "Insumos Gerais",
            location: "Maputo, Cidade",
            status: "Aberto",
            iconBg: "bg-emerald-50",
            iconColor: "text-emerald-600",
            icon: Store,
            image_url: "https://images.unsplash.com/photo-1594950346083-066cb4b2e171?q=80&w=1000&auto=format&fit=crop"
        },
        {
            name: "Sementes Vitória",
            category: "Sementes Certificadas",
            location: "Chókwè, Gaza",
            status: "Fechado",
            iconBg: "bg-yellow-50",
            iconColor: "text-yellow-600",
            icon: Sprout,
            image_url: "https://images.unsplash.com/photo-1592982537447-6f2a6a0c7c18?q=80&w=1000&auto=format&fit=crop"
        },
        {
            name: "Irrigação Total Lda",
            category: "Sistemas de Rega",
            location: "Manhiça, Maputo",
            status: "Aberto",
            iconBg: "bg-cyan-50",
            iconColor: "text-cyan-600",
            icon: Store,
            image_url: "https://images.unsplash.com/photo-1563510565-5c1d683501a4?q=80&w=1000&auto=format&fit=crop"
        },
        {
            name: "Veterinária Moderna",
            category: "Saúde Animal",
            location: "Nampula, Nampula",
            status: "Aberto",
            iconBg: "bg-rose-50",
            iconColor: "text-rose-600",
            icon: Store,
            image_url: "https://images.unsplash.com/photo-1628009368231-7bb7cfcb0def?q=80&w=1000&auto=format&fit=crop"
        }
    ];

    useEffect(() => {
        const fetchStores = async () => {
            setIsLoading(true);
            const { data, error } = await supabase
                .from('stores')
                .select('*')
                .order('created_at', { ascending: false });

            if (data && data.length > 0) {
                setStores(data);
            } else {
                setStores(fallbackStores);
            }
            setIsLoading(false);
        };

        fetchStores();
    }, []);

    const filteredStores = stores.filter(store =>
        store.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        store.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Helper to get icon based on category (simplified)
    const getIcon = (category: string) => {
        if (category.includes("Peças")) return Hammer;
        if (category.includes("Maquinaria")) return Tractor;
        if (category.includes("Sementes")) return Sprout;
        return Store;
    };

    return (
        <main className="min-h-screen bg-slate-50 font-sans">
            <PageHeader
                title="Rede de Lojas"
                icon={Store}
                backgroundImage="https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=2000&auto=format&fit=crop"
                breadcrumbs={[
                    { label: "Início", href: "/" },
                    { label: "Serviços", href: "/servicos" },
                    { label: "Lojas", href: undefined }
                ]}
            />

            <div className="container-site relative z-20 mt-[50px] pb-24">

                {/* Search & Filter Bar */}
                <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 mb-8 flex flex-col md:flex-row gap-4 items-center">
                    <div className="flex-1 relative w-full">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Buscar loja por nome ou categoria..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 rounded-xl bg-slate-50 border-none focus:ring-2 focus:ring-orange-500/20 text-slate-800 font-medium placeholder:text-slate-400"
                        />
                    </div>
                    <div className="flex gap-2 w-full md:w-auto">
                        <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-white border border-slate-200 hover:border-orange-200 text-slate-600 hover:text-orange-600 font-bold rounded-xl transition-all">
                            <MapPin className="w-4 h-4" /> Localização
                        </button>
                        <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-white border border-slate-200 hover:border-orange-200 text-slate-600 hover:text-orange-600 font-bold rounded-xl transition-all">
                            <Filter className="w-4 h-4" /> Filtros
                        </button>
                    </div>
                </div>

                {/* Stores Grid */}
                {isLoading ? (
                    <div className="flex justify-center py-20">
                        <Loader2 className="w-10 h-10 animate-spin text-orange-500" />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                        {filteredStores.map((store, i) => {
                            const Icon = store.icon || getIcon(store.category);
                            return (
                                <div key={i} className="group bg-white rounded-2xl border border-slate-100 hover:border-orange-100 shadow-sm hover:shadow-xl hover:shadow-orange-500/5 transition-all duration-300 flex flex-col h-full overflow-hidden relative">

                                    {/* Background Image Header */}
                                    <div className="h-32 bg-slate-100 relative overflow-hidden">
                                        {store.image_url ? (
                                            <>
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10" />
                                                <img
                                                    src={store.image_url}
                                                    alt={store.name}
                                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                                />
                                            </>
                                        ) : (
                                            <div className="w-full h-full bg-slate-200 flex items-center justify-center">
                                                <Store className="w-8 h-8 text-slate-400" />
                                            </div>
                                        )}

                                        <div className="absolute top-4 right-4 z-20">
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest backdrop-blur-md shadow-sm ${store.status === 'Aberto'
                                                ? 'bg-emerald-500/90 text-white'
                                                : 'bg-slate-800/90 text-white'
                                                }`}>
                                                {store.status}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="p-6 pt-0 flex flex-col flex-1 relative z-20">
                                        <div className="-mt-8 mb-3 w-16 h-16 rounded-2xl bg-white p-1 shadow-md flex items-center justify-center relative z-20">
                                            <div className={`w-full h-full rounded-xl flex items-center justify-center ${store.iconBg || 'bg-orange-50'} ${store.iconColor || 'text-orange-600'}`}>
                                                <Icon className="w-8 h-8" />
                                            </div>
                                        </div>

                                        <h3 className="text-lg font-bold text-slate-900 group-hover:text-orange-600 transition-colors mb-1">
                                            {store.name}
                                        </h3>
                                        <p className="text-sm font-medium text-slate-400 mb-4">{store.category}</p>

                                        <div className="mt-auto space-y-4">
                                            <div className="flex items-center gap-2 text-sm text-slate-500">
                                                <MapPin className="w-4 h-4 text-orange-400" />
                                                {store.location}
                                            </div>

                                            <div className="pt-4 border-t border-slate-50 flex items-center justify-between">
                                                <button className="text-slate-400 hover:text-slate-600 transition-colors">
                                                    <Phone className="w-5 h-5" />
                                                </button>
                                                <Link href="#" className="flex items-center gap-2 text-sm font-bold text-orange-500 hover:text-orange-600 transition-colors group/link">
                                                    Ver Loja <ArrowRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Bottom CTA */}
                <ContactCTA
                    title="Dono de loja agropecuária?"
                    description="Junte-se à maior rede de fornecedores do país. Registe o seu estabelecimento e seja encontrado por milhares de produtores."
                    buttonText="Registar Minha Loja"
                    href="/registar"
                />
            </div>
        </main>
    );
}
