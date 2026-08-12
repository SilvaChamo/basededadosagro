import { createClient } from "@/utils/supabase/server";
import { PropertyEditor } from "@/components/admin/PropertyEditor";
import { notFound } from "next/navigation";

export default async function EditPropertyPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const supabase = await createClient();
    const { data: property } = await supabase.from('properties').select('*').eq('id', id).single();

    if (!property) {
        notFound();
    }

    return (
        <div className="h-full">
            <PropertyEditor initialData={property} />
        </div>
    );
}
