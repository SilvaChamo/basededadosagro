import { ServiceForm } from "@/components/admin/ServiceForm";
import { createClient } from "@/utils/supabase/server";

export default async function ServiceEditPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    if (id === 'novo') {
        return <ServiceForm />;
    }

    const supabase = await createClient();
    const { data: service } = await supabase
        .from('services')
        .select('*')
        .eq('id', id)
        .single();

    if (!service) {
        return <div>Serviço não encontrado</div>;
    }

    return <ServiceForm initialData={service} isEditing={true} />;
}
