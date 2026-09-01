import { MetadataRoute } from 'next'
import { supabase } from '@/lib/supabaseClient'

const baseUrl = 'https://basededadosagro.com'

// URLs canónicas = sem prefixo de idioma (localePrefix: 'as-needed', pt por
// omissão). Só páginas públicas — /admin, /usuario, /api, /auth ficam de fora
// (ver public/robots.txt).
const STATIC_PATHS: { path: string; priority: number; changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency'] }[] = [
    { path: '/', priority: 1.0, changeFrequency: 'daily' },
    { path: '/mercado', priority: 0.9, changeFrequency: 'daily' },
    { path: '/artigos', priority: 0.9, changeFrequency: 'daily' },
    { path: '/blog', priority: 0.8, changeFrequency: 'daily' },
    { path: '/empresas', priority: 0.8, changeFrequency: 'weekly' },
    { path: '/servicos', priority: 0.8, changeFrequency: 'weekly' },
    { path: '/repositorio', priority: 0.8, changeFrequency: 'weekly' },
    { path: '/documentos', priority: 0.8, changeFrequency: 'weekly' },
    { path: '/estatisticas/admin', priority: 0.6, changeFrequency: 'weekly' },
    { path: '/produtos', priority: 0.7, changeFrequency: 'weekly' },
    { path: '/propriedades', priority: 0.7, changeFrequency: 'weekly' },
    { path: '/relatorios', priority: 0.7, changeFrequency: 'weekly' },
    { path: '/agrocast', priority: 0.7, changeFrequency: 'weekly' },
    { path: '/forum', priority: 0.7, changeFrequency: 'daily' },
    { path: '/inovacao', priority: 0.6, changeFrequency: 'monthly' },
    { path: '/inovacao/agrobotanica', priority: 0.5, changeFrequency: 'monthly' },
    { path: '/inovacao/perfil-digital', priority: 0.5, changeFrequency: 'monthly' },
    { path: '/inovacao/repositorio-cientifico', priority: 0.5, changeFrequency: 'monthly' },
    { path: '/inovacao/comunicacao-sms', priority: 0.5, changeFrequency: 'monthly' },
    { path: '/inovacao/seo-google', priority: 0.5, changeFrequency: 'monthly' },
    { path: '/inovacao/vantagens-cadastro', priority: 0.5, changeFrequency: 'monthly' },
    { path: '/servicos/mercado', priority: 0.7, changeFrequency: 'weekly' },
    { path: '/servicos/lojas', priority: 0.6, changeFrequency: 'weekly' },
    { path: '/servicos/formacao', priority: 0.6, changeFrequency: 'weekly' },
    { path: '/servicos/emprego', priority: 0.6, changeFrequency: 'weekly' },
    { path: '/servicos/consultoria', priority: 0.5, changeFrequency: 'monthly' },
    { path: '/servicos/assistencia', priority: 0.5, changeFrequency: 'monthly' },
    { path: '/servicos/eventos', priority: 0.5, changeFrequency: 'weekly' },
    { path: '/servicos/insumos', priority: 0.5, changeFrequency: 'monthly' },
    { path: '/servicos/transporte', priority: 0.5, changeFrequency: 'monthly' },
    { path: '/servicos/conteudo', priority: 0.5, changeFrequency: 'monthly' },
    { path: '/planos', priority: 0.6, changeFrequency: 'monthly' },
    { path: '/sobre-nos', priority: 0.5, changeFrequency: 'monthly' },
    { path: '/sobre-nos/historial', priority: 0.4, changeFrequency: 'yearly' },
    { path: '/contactos', priority: 0.5, changeFrequency: 'yearly' },
    { path: '/carreiras', priority: 0.4, changeFrequency: 'monthly' },
    { path: '/parceria', priority: 0.4, changeFrequency: 'monthly' },
    { path: '/ajuda', priority: 0.4, changeFrequency: 'monthly' },
    { path: '/termos', priority: 0.2, changeFrequency: 'yearly' },
    { path: '/politica-privacidade', priority: 0.2, changeFrequency: 'yearly' },
]

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const now = new Date()

    const staticEntries: MetadataRoute.Sitemap = STATIC_PATHS.map(({ path, priority, changeFrequency }) => ({
        url: `${baseUrl}${path}`,
        lastModified: now,
        changeFrequency,
        priority,
    }))

    // Páginas de detalhe geradas a partir da base de dados. Resiliente: se a
    // consulta falhar, o sitemap continua a sair só com as páginas estáticas.
    // (Colunas reais: companies.updated_at existe; articles NÃO tem updated_at
    // — usa-se created_at. Não há tabela `documents`: /documentos e /artigos
    // servem ambos da tabela `articles`, listada aqui só uma vez como /artigos.)
    let dynamicEntries: MetadataRoute.Sitemap = []
    try {
        const [companies, articles] = await Promise.all([
            supabase.from('companies').select('slug, updated_at').eq('is_archived', false),
            supabase
                .from('articles')
                .select('slug, created_at')
                .is('deleted_at', null)
                .or('publish_status.is.null,publish_status.not.in.(draft,review)')
                .limit(5000),
        ])

        const fromRows = (
            rows: { slug: string | null; updated_at?: string | null; created_at?: string | null }[] | null,
            prefix: string,
            priority: number,
        ): MetadataRoute.Sitemap =>
            (rows || [])
                .filter((r) => r.slug)
                .map((r) => ({
                    url: `${baseUrl}${prefix}/${r.slug}`,
                    lastModified: new Date(r.updated_at || r.created_at || now),
                    changeFrequency: 'weekly' as const,
                    priority,
                }))

        dynamicEntries = [
            ...fromRows(companies.data as any, '/empresas', 0.6),
            ...fromRows(articles.data as any, '/artigos', 0.6),
        ]
    } catch (err) {
        console.error('sitemap: falha a obter páginas dinâmicas (não crítico):', err)
    }

    return [...staticEntries, ...dynamicEntries]
}
