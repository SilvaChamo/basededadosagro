import { StatsDashboard } from "@/components/stats/StatsDashboard";
import { notFound } from "next/navigation";

// Define valid slugs explicitly
const validSlugs = ["producao", "economia", "empresas", "emprego"];

interface PageProps {
    params: Promise<{ slug: string }>;
}

export default async function StatisticsPage({ params }: PageProps) {
    const { slug } = await params;

    if (!validSlugs.includes(slug)) {
        notFound();
    }

    return (
        <main className="min-h-screen bg-background pb-20">
            <StatsDashboard slug={slug} />
        </main>
    );
}
