import { createClient } from '@/utils/supabase/server';
import { notFound } from 'next/navigation';
import CompanyProfileClient from './CompanyProfileClient';
import { Metadata } from 'next';

interface PageProps {
    params: Promise<{ slug: string }>;
}

async function fetchCompanyByIdentifier(supabase: any, identifier: string) {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(identifier);
    if (isUuid) {
        const { data } = await supabase
            .from('companies')
            .select('*')
            .or(`id.eq.${identifier},slug.eq.${identifier}`)
            .maybeSingle();
        if (data) return data;
    }
    const { data } = await supabase
        .from('companies')
        .select('*')
        .eq('slug', identifier)
        .maybeSingle();
    return data;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { slug } = await params;
    const supabase = await createClient();

    const company = await fetchCompanyByIdentifier(supabase, slug);

    if (!company) {
        return {
            title: 'Empresa não encontrada',
            description: 'Perfil de empresa agrícola em Moçambique.'
        };
    }

    const title = `${company.name} — ${company.activity || 'Empresa do sector agrário'}`;
    const description = company.description
        ? company.description.substring(0, 160) + (company.description.length > 160 ? '…' : '')
        : `Saiba mais sobre ${company.name}, na área de ${company.activity || 'agro-negócio'} em Moçambique.`;

    const images: string[] = [];
    if (company.banner_url) images.push(company.banner_url);
    if (company.logo_url) images.push(company.logo_url);

    return {
        title: title,
        description: description,
        openGraph: {
            title: title,
            description: description,
            ...(images.length > 0 ? { images } : {}),
            type: 'website',
        },
        twitter: {
            card: 'summary_large_image',
            title: title,
            description: description,
            ...(images.length > 0 ? { images } : {}),
        }
    };
}

export default async function CompanyEmpresasPage({ params }: PageProps) {
    const { slug } = await params;
    const supabase = await createClient();

    const company = await fetchCompanyByIdentifier(supabase, slug);

    if (!company) {
        notFound();
    }

    // Fetch products belonging to this company
    const { data: productsData } = await supabase
        .from('products')
        .select('*')
        .eq('company_id', company.id)
        .order('created_at', { ascending: false });

    const products = productsData || [];
    const isVerified = company.is_verified || company.is_featured;

    return (
        <CompanyProfileClient
            company={{
                ...company,
                banner_url: company.banner_url || "/images/Prototipo/sala1.jpg",
                header_bg: company.header_bg || company.banner_url || "/images/Prototipo/sala3.jpg",
                products: products,
                is_verified: isVerified
            }}
            slug={slug}
        />
    );
}
