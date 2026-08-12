import { createClient } from "@/utils/supabase/server";
import { NewsEditor } from "@/components/admin/NewsEditor";
import { notFound } from "next/navigation";

export default async function EditArticlePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const supabase = await createClient();
    const { data: article } = await supabase.from('articles').select('*').eq('id', id).single();

    if (!article) {
        notFound();
    }

    return (
        <div className="max-w-7xl mx-auto py-8">
            <NewsEditor initialData={article} />
        </div>
    );
}
