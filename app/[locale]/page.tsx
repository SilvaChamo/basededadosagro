import { HomeHeaderSection } from "@/components/HomeHeaderSection";
import { InfoSection } from "@/components/InfoSection";
import { CategoriesShowcase } from "@/components/CategoriesShowcase";
import { CommunityBanner } from "@/components/CommunityBanner";
import { WhyChooseUs } from "@/components/WhyChooseUs";
import { MobileAppSection } from "@/components/MobileAppSection";
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
  let articlesResult: any = null;

  try {
    const results = await Promise.all([
      supabase.from('dashboard_indicators').select('slug, value, trend').eq('location', 'hero'),
      supabase.from('companies').select('id, name, slug, category, province, location, logo_url, activity, description').eq('is_archived', false).eq('is_featured', true).order('created_at', { ascending: false }).limit(10),
      supabase.from('articles').select('id, title, subtitle, image_url, date, slug, type')
        .is('deleted_at', null)
        .or('publish_status.is.null,publish_status.not.in.(draft,review)')
        .in('type', ['Notícia', 'Internacional', 'Artigo', 'Artigo Técnico', 'Comunicado', 'Evento', 'Oportunidade', 'Curiosidade', 'Guia'])
        .order('created_at', { ascending: false })
        .limit(5)
    ]);
    statsResult = results[0];
    companiesResult = results[1];
    articlesResult = results[2];

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

  // Process Stats
  const stats = statsResult?.data
    ? statsResult.data.reduce((acc: any, item: any) => {
      acc[item.slug] = item;
      return acc;
    }, {})
    : {};

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
    <main className="min-h-screen bg-transparent">
      <HomeHeaderSection stats={stats} />
      <CategoriesShowcase companies={companies} />
      <CommunityBanner />
      <WhyChooseUs />
      <InfoSection initialArticles={articles} />
      <MobileAppSection />
    </main>
  );
}
