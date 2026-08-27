import { createClient } from "@/utils/supabase/server";
import { DocumentView } from "@/components/admin/DocumentView";
import { notFound } from "next/navigation";

export default async function ViewDocumentPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const supabase = await createClient();
    const { data: document } = await supabase.from('articles').select('*').eq('id', id).single();

    if (!document) {
        notFound();
    }

    return <DocumentView document={document} />;
}
