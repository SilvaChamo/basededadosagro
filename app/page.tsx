import { HomeHeaderSection } from "@/components/HomeHeaderSection";
import { InfoSection } from "@/components/InfoSection";
import { CategoriesShowcase } from "@/components/CategoriesShowcase";
import { CommunityBanner } from "@/components/CommunityBanner";
import { WhyChooseUs } from "@/components/WhyChooseUs";
import { MobileAppSection } from "@/components/MobileAppSection";
import { AgroCastSection } from "@/components/AgroCastSection";
import { createClient } from "@/utils/supabase/server";

export const revalidate = 60; // Revalidate every 60 seconds
export const dynamic = 'force-dynamic';

export default async function Home() {
  const supabase = await createClient();

  // Parallel Data Fetching with error resilience
  let statsResult: any = null;
  let companiesResult: any = null;

  try {
    const results = await Promise.all([
      supabase.from('dashboard_indicators').select('slug, value, trend').eq('location', 'hero'),
      supabase.from('companies').select('id, name, slug, category, province, location, logo_url, activity, description').eq('is_archived', false).eq('is_featured', true).order('created_at', { ascending: false }).limit(10)
    ]);
    statsResult = results[0];
    companiesResult = results[1];

    if (statsResult.error) console.error("❌ Error fetching stats:", statsResult.error);
    if (companiesResult.error) console.error("❌ Error fetching companies:", companiesResult.error);
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
      location: c.province || c.location || "Moçambique",
      logo: c.logo_url,
      activity: c.activity,
      description: c.description,
    }))
    : [];

  return (
    <main className="min-h-screen bg-transparent">
      <HomeHeaderSection stats={stats} />
      <CategoriesShowcase companies={companies} />
      <CommunityBanner />
      <WhyChooseUs />
      <InfoSection />
      <MobileAppSection />
    </main>
  );
}
