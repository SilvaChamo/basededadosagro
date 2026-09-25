import { HomeHeaderSection } from "@/components/HomeHeaderSection";
import { InfoSection } from "@/components/InfoSection";
import { CategoriesShowcase } from "@/components/CategoriesShowcase";
import { CommunityBanner } from "@/components/CommunityBanner";
import { WhyChooseUs } from "@/components/WhyChooseUs";
import { MobileAppSection } from "@/components/MobileAppSection";
import { HomePlansSection } from "@/components/HomePlansSection";
import { supabase } from "@/lib/supabaseClient";
import { getTranslations, setRequestLocale } from 'next-intl/server';

// A homepage não mostra nada específico do utilizador (só dados públicos:
// estatísticas, empresas em destaque, notícias). Usar o cliente Supabase
// simples (sem cookies()) em vez do cliente de sessão evita que o Next.js
// force esta página a renderizar de novo em CADA pedido — com cookies() a
// página ficava sempre 100% dinâmica, ignorando este `revalidate`, e cada
// visita pagava sempre a latência de rede até ao Supabase.
export const revalidate = 60; // Revalidate every 60 seconds

export default async function Home({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations('CategoriesShowcase');

  // Parallel Data Fetching with error resilience
  let statsResult: any = null;
  let companiesResult: any = null;
  let companyCountResult: any = null;
  let articlesResult: any = null;

  try {
    const results = await Promise.all([
      supabase.from('dashboard_indicators').select('slug, value, trend').eq('location', 'hero'),
      supabase.from('companies').select('id, name, slug, category, province, location, logo_url, activity, description').eq('is_archived', false).eq('is_featured', true).order('created_at', { ascending: false }).limit(10),
      supabase.from('companies').select('*', { count: 'exact', head: true }).eq('is_archived', false),
      supabase.from('articles').select('id, title, subtitle, image_url, date, slug, type')
        .is('deleted_at', null)
        .or('publish_status.is.null,publish_status.not.in.(draft,review)')
        .in('type', ['Notícia', 'Internacional', 'Artigo', 'Artigo Técnico', 'Comunicado', 'Evento', 'Oportunidade', 'Curiosidade', 'Guia'])
        .order('date', { ascending: false, nullsFirst: false })
        .order('created_at', { ascending: false })
        .limit(5)
    ]);
    statsResult = results[0];
    companiesResult = results[1];
    companyCountResult = results[2];
    articlesResult = results[3];

    if (statsResult.error) {
      console.error("❌ Error fetching stats:", JSON.stringify(statsResult.error, null, 2));
    }
    if (companiesResult.error) {
      console.error("❌ Error fetching companies:", JSON.stringify(companiesResult.error, null, 2));
    }
    if (articlesResult.error) {
      console.error("❌ Error fetching articles:", JSON.stringify(articlesResult.error, null, 2));
    }
  } catch (err) {
    console.error("💥 Critical error during homepage data fetch:", err);
  }

  // Process Stats com valores padronizados reais do sector
  const realCompanyCount = companyCountResult?.count && companyCountResult.count >= 950 
    ? `${companyCountResult.count}+` 
    : "950+";

  const stats = statsResult?.data
    ? statsResult.data.reduce((acc: any, item: any) => {
      acc[item.slug] = item;
      return acc;
    }, {})
    : {};

  // Garantir que os 4 indicadores oficiais do sector estão sempre definidos com dados reais
  if (!stats['hero-companies']) {
    stats['hero-companies'] = { slug: 'hero-companies', value: realCompanyCount, trend: 'Empresas Ativas Cadastradas' };
  } else if (companyCountResult?.count && companyCountResult.count > 0) {
    stats['hero-companies'].value = realCompanyCount;
  }

  if (!stats['hero-production']) {
    stats['hero-production'] = { slug: 'hero-production', value: '20M+', trend: '+5% Crescimento Anual' };
  }
  if (!stats['hero-economy']) {
    stats['hero-economy'] = { slug: 'hero-economy', value: '91.4B', trend: '24% do PIB Nacional' };
  }
  if (!stats['hero-jobs']) {
    stats['hero-jobs'] = { slug: 'hero-jobs', value: '70%', trend: '70% da Força Laboral' };
  }

  // Process Companies
  const companies = companiesResult?.data
    ? companiesResult.data.map((c: any) => ({
      id: c.id,
      title: c.name,
      slug: c.slug,
      sub: c.category,
      location: c.province || c.location || t('fallbacks.location'),
      logo: c.logo_url,
      activity: c.activity,
      description: c.description,
    }))
    : [];

  const articles = articlesResult?.data || [];

  return (
    <main className="min-h-screen bg-slate-50">
      <HomeHeaderSection stats={stats} />
      <CategoriesShowcase companies={companies} />
      <CommunityBanner />
      <WhyChooseUs />
      <InfoSection initialArticles={articles} />
      <MobileAppSection />
      <HomePlansSection />
    </main>
  );
}
