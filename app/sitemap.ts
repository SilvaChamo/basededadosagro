import { MetadataRoute } from 'next'
import { createClient } from '@/utils/supabase/server'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const supabase = await createClient()

    // Fetch only featured companies for indexing
    const { data: companies } = await supabase
        .from('companies')
        .select('slug, updated_at')
        .eq('is_featured', true)

    const baseUrl = 'https://basededadosagro.com'

    // Temporarily disabled for development phase
    return [];
    /*
        const companyUrls = (companies || []).map((company) => ({
            url: `${baseUrl}/empresas/${company.slug}`,
            lastModified: new Date(company.updated_at || new Date()),
            changeFrequency: 'weekly' as const,
            priority: 0.8,
        }))
    
        return [
            {
                url: baseUrl,
                lastModified: new Date(),
                changeFrequency: 'daily',
                priority: 1,
            },
            {
                url: `${baseUrl}/sobre-nos`,
                lastModified: new Date(),
                changeFrequency: 'monthly',
                priority: 0.5,
            },
            {
                url: `${baseUrl}/servicos`,
                lastModified: new Date(),
                changeFrequency: 'weekly',
                priority: 0.7,
            },
            {
                url: `${baseUrl}/servicos/mercado`,
                lastModified: new Date(),
                changeFrequency: 'daily',
                priority: 0.9,
            },
            ...companyUrls,
        ]
    */
}
