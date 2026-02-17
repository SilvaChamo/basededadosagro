"use client";

import React, { useState, useEffect } from 'react';
import { CompanyCard } from './CompanyCard';
import { Company } from '@/lib/constants';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import { createClient } from '@/utils/supabase/client';

export function FeaturedCompanies() {
    const [companies, setCompanies] = useState<Company[]>([]);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    const [emblaRef] = useEmblaCarousel(
        { loop: true, align: 'start', skipSnaps: false },
        [Autoplay({ delay: 5000, stopOnInteraction: true, stopOnMouseEnter: true })]
    );

    useEffect(() => {
        async function fetchCompanies() {
            try {
                const { data, error } = await supabase
                    .from('companies')
                    .select('*')
                    .or('is_featured.eq.true,plan.eq.Parceiro,plan.eq.Partner')
                    .order('created_at', { ascending: false });

                if (error) throw error;

                if (data) {
                    const mapped: Company[] = data.map((d: any) => ({
                        id: d.id,
                        slug: d.slug,
                        name: d.company_name || d.name,
                        tag: d.category || d.activity,
                        description: d.activity || d.bio || d.description || "",
                        logoUrl: d.logo_url || 'https://placehold.co/100x100/054a29/fff?text=Logo',
                        type: d.registration_type || 'Empresa',
                        image: d.banner_url || d.image_url || 'https://images.unsplash.com/photo-1625246333195-58f21a416327',
                        isVerified: d.is_verified || d.is_featured,
                        province: d.province,
                        valueChain: d.value_chain
                    }));
                    setCompanies(mapped);
                }
            } catch (err) {
                console.error("Erro ao carregar empresas:", err);
            } finally {
                // Add a small delay for smoother transition if it's too fast, 
                // but here we just set loading false.
                setLoading(false);
            }
        }

        fetchCompanies();
    }, []);

    if (loading) return (
        <div className="w-full h-40 flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
    );

    if (companies.length === 0) return null;

    return (
        <div className="w-full bg-[#fdfdfd] overflow-hidden">
            <div className="container-site py-24 flex flex-col justify-center animate-in fade-in duration-[1200ms] w-full">
                <div className="mb-16 w-full">
                    <div className="flex justify-between items-center mb-10">
                        <h2 className="text-slate-900 font-black text-[11px] md:text-[13px] tracking-[0.7em] uppercase">
                            Empresas em Destaque
                        </h2>
                    </div>

                    <div className="relative group/embla">
                        <div className="overflow-hidden" ref={emblaRef}>
                            <div className="flex -mr-5">
                                {companies.map((company, idx) => (
                                    <div
                                        key={`${company.id}-${idx}`}
                                        className="flex-[0_0_100%] sm:flex-[0_0_50%] lg:flex-[0_0_25%] min-w-0 pr-5"
                                    >
                                        <CompanyCard company={company} />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
