import { createClient } from "@/utils/supabase/server";
import { DocumentForm } from "@/components/admin/DocumentForm";
import { notFound } from "next/navigation";

export default async function EditDocumentPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const supabase = await createClient();
    const { data: document } = await supabase.from('articles').select('*').eq('id', id).single();

    if (!document) {
        notFound();
    }

    return <DocumentForm initialData={document} />;
}
