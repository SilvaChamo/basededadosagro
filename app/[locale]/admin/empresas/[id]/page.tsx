import { createClient } from "@/utils/supabase/server";
import { CompanyEditor } from "@/components/admin/CompanyEditor";
import { notFound } from "next/navigation";

export default async function EditCompanyPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const supabase = await createClient();
    const { data: company } = await supabase.from('companies').select('*').eq('id', id).single();

    if (!company) {
        notFound();
    }

    return (
        <div className="w-full max-w-none mx-auto py-8">
            <CompanyEditor initialData={company} />
        </div>
    );
}
