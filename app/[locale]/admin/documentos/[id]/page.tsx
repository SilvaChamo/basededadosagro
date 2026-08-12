import { createClient } from "@/utils/supabase/server";
import { NewsEditor } from "@/components/admin/NewsEditor";
import { notFound } from "next/navigation";

export default async function EditDocumentPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const supabase = await createClient();
    const { data: document } = await supabase.from('articles').select('*').eq('id', id).single();

    if (!document) {
        notFound();
    }

    return (
        <div className="max-w-7xl mx-auto py-8">
            <NewsEditor initialData={document} />
        </div>
    );
}
