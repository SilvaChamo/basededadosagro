import { PodcastForm } from "@/components/admin/PodcastForm";
import { createClient } from "@/utils/supabase/server";

export default async function PodcastEditPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    if (id === 'novo') {
        return <PodcastForm />;
    }

    const supabase = await createClient();
    const { data: podcast } = await supabase
        .from('podcasts')
        .select('*')
        .eq('id', id)
        .single();

    if (!podcast) {
        return <div>Episódio não encontrado</div>;
    }

    return <PodcastForm initialData={podcast} isEditing={true} />;
}
