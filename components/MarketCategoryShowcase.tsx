"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Search } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { CompanyCard } from "@/components/CompanyCard";

// As mesmas 4 categorias do mega menu do "Mercado" (components/MarketMegaMenu.tsx):
// Produtor/Fornecedor/Consumidor vêm do campo "value_chain" da empresa
// (o mesmo seletor "Cadeia de Valor" do /registo-empresa); "Rede de Lojas"
// é o mesmo filtro (type = 'Loja') já usado em /servicos/lojas.
const CATEGORY_TABS = [
    { id: "fornecedores", label: "Fornecedores", valueChain: "Fornecedor", seeAllHref: "/empresas" },
    { id: "consumidores", label: "Consumidores", valueChain: "Consumidor", seeAllHref: "/empresas" },
    { id: "produtores", label: "Produtores", valueChain: "Produtor", seeAllHref: "/empresas" },
    { id: "lojas", label: "Rede de Lojas", type: "Loja", seeAllHref: "/servicos/lojas" },
] as const;

export function MarketCategoryShowcase() {
    const supabase = createClient();
    const [activeTab, setActiveTab] = useState<(typeof CATEGORY_TABS)[number]["id"]>("fornecedores");
    const [companies, setCompanies] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const tab = CATEGORY_TABS.find(t => t.id === activeTab)!;
        let cancelled = false;

        async function fetchCompanies() {
            setLoading(true);
            let query = supabase
                .from('companies')
                .select('*')
                .eq('is_archived', false)
                .limit(8);

            query = 'type' in tab
                ? query.eq('type', tab.type)
                : query.ilike('value_chain', `%${tab.valueChain}%`);

            const { data, error } = await query;
            if (!cancelled) {
                if (error) console.error("Error fetching market category companies:", error);
                setCompanies(data || []);
                setLoading(false);
            }
        }
        fetchCompanies();
        return () => { cancelled = true; };
    }, [activeTab]);

    const activeConfig = CATEGORY_TABS.find(t => t.id === activeTab)!;

    return (
        <div className="w-full bg-white py-20 border-t border-slate-100">
            <div className="container-site">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-10">
                    <div>
                        <h2 className="text-[24px] md:text-[32px] font-black text-slate-900 leading-tight">
                            Quem faz parte do Mercado
                        </h2>
                        <p className="text-slate-500 font-medium mt-1">
                            Navegue pelas mesmas categorias do menu Mercado.
                        </p>
                    </div>
                    <Link
                        href={activeConfig.seeAllHref}
                        className="shrink-0 inline-flex items-center gap-2 text-[#f97316] hover:text-orange-700 text-xs font-black uppercase tracking-widest transition-colors"
                    >
                        Ver todos <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>

                {/* Tabs — só texto, sem fundo; laranja no hover e no activo */}
                <div className="flex flex-wrap gap-1 border-b border-slate-200 mb-8">
                    {CATEGORY_TABS.map(tab => {
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`lowercase -mb-px px-5 py-3 text-sm font-black tracking-wide border rounded-t-md transition-colors ${isActive
                                    ? "text-[#f97316] border-slate-200 border-b-white bg-white"
                                    : "text-slate-400 hover:text-[#f97316] border-transparent"
                                    }`}
                            >
                                {tab.label}
                            </button>
                        );
                    })}
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="h-[280px] bg-slate-50 animate-pulse rounded-[10px] border border-slate-100" />
                        ))}
                    </div>
                ) : companies.length === 0 ? (
                    <div className="py-16 text-center">
                        <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-dashed border-slate-200">
                            <Search className="w-7 h-7 text-slate-300" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-800">Ainda sem resultados em {activeConfig.label}</h3>
                        <p className="text-slate-500 text-sm">Seja a primeira empresa a aparecer aqui.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {companies.map((company: any) => (
                            <CompanyCard
                                key={company.id}
                                company={{
                                    id: company.id,
                                    slug: company.slug,
                                    name: company.name,
                                    tag: company.sub_category || company.category,
                                    description: company.activity || company.bio || "",
                                    logoUrl: company.logo_url || "",
                                    type: company.type || "Empresa",
                                    image: company.banner_url || "",
                                    isVerified: company.is_verified || company.is_featured || company.plan === 'Parceiro' || company.plan === 'Partner',
                                    province: company.province,
                                    valueChain: company.value_chain,
                                }}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
