import { createClient } from '@/utils/supabase/server';
import { notFound } from 'next/navigation';
import ProductsArchiveClient from './ProductsArchiveClient';

interface PageProps {
    params: Promise<{ slug: string }>;
}

export default async function CompanyProductsPage({ params }: PageProps) {
    const { slug } = await params;
    const supabase = await createClient();

    const { data: company, error } = await supabase
        .from('companies')
        .select('*')
        .eq('slug', slug)
        .single();

    if (error || !company) {
        // Fallback for demo
        const fallbackCompanies: Record<string, any> = {
            'agro-industria-zambezia': {
                name: "Agro-Indústria Zambézia",
                logo_url: "https://placehold.co/100x100/f97316/white?text=LOGO",
                header_bg: "/images/Prototipo/sala3.jpg",
                products: [
                    { name: "Castanha de Caju Refinada", price: "500 MT/kg", img: "/images/Prototipo/caju.webp", available: true },
                    { name: "Algodão em Fardo", price: "Sob Consulta", img: "/images/Prototipo/algodao.png", available: true },
                    { name: "Sementes Selecionadas", price: "250 MT/pk", img: "https://images.unsplash.com/photo-1464226184884-fa280b87c399?q=80&w=800", available: false },
                ]
            },
            'cooperativa-do-norte': {
                name: "Cooperativa do Norte",
                logo_url: "https://placehold.co/100x100/10b981/white?text=LOGO",
                header_bg: "/images/Prototipo/sala5.jpg",
                products: [
                    { name: "Feijão Manteiga", price: "65 MT/kg", img: "/images/Prototipo/feijao.jpg", available: true },
                    { name: "Milho Branco", price: "18 MT/kg", img: "https://images.unsplash.com/photo-1551754655-cd27e38d2076?q=80&w=800", available: true },
                ]
            },
            'hortas-do-vale': {
                name: "Hortas do Vale",
                logo_url: "https://placehold.co/100x100/3b82f6/white?text=LOGO",
                header_bg: "/images/Prototipo/sala6.jpg",
                products: [
                    { name: "Óleo Vegetal Natural", price: "120 MT/L", img: "/images/Prototipo/oleo.webp", available: true },
                ]
            }
        };

        if (fallbackCompanies[slug]) {
            return (
                <ProductsArchiveClient
                    company={fallbackCompanies[slug]}
                    slug={slug}
                    products={fallbackCompanies[slug].products}
                />
            );
        }
        notFound();
    }

    return (
        <ProductsArchiveClient
            company={company}
            slug={slug}
            products={company.products || []}
        />
    );
}
