import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";

export async function GET() {
    try {
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
        }

        // page_views/leads RLS blocks authenticated reads even for the row owner,
        // so use the admin client but always scope by the requester's own user_id.
        const supabaseAdmin = createAdminClient();

        const [{ count: impressionsCount }, { count: profileClicksCount }, { count: leadsCount }] = await Promise.all([
            supabaseAdmin.from('page_views').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
            supabaseAdmin.from('page_views').select('*', { count: 'exact', head: true }).eq('user_id', user.id).eq('target_type', 'profile'),
            supabaseAdmin.from('leads').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
        ]);

        const impressions = impressionsCount || 0;
        const clicks = profileClicksCount || 0;
        const leads = leadsCount || 0;
        const ctr = impressions > 0 ? parseFloat(((clicks / impressions) * 100).toFixed(1)) : 0;

        return NextResponse.json({ impressions, clicks, leads, ctr });

    } catch (error: any) {
        console.error("Dashboard stats error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// Nunca cacheável (dados sensíveis / por-utilizador). Impede o Next de
// marcar a resposta como estática e a Cloudflare de a guardar.
export const dynamic = "force-dynamic";
