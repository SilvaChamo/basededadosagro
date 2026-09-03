import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";

async function requireAdmin() {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
        return { error: NextResponse.json({ error: "Não autorizado" }, { status: 401 }) };
    }

    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

    if (profile?.role !== 'admin') {
        return { error: NextResponse.json({ error: "Acesso restrito a administradores" }, { status: 403 }) };
    }

    return {};
}

export async function GET() {
    const { error: authError } = await requireAdmin();
    if (authError) return authError;

    try {
        const supabaseAdmin = createAdminClient();
        const { data, error } = await supabaseAdmin.from('integrations').select('*');
        if (error) throw error;
        return NextResponse.json({ integrations: data || [] });
    } catch (error: any) {
        console.error("Admin list integrations error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    const { error: authError } = await requireAdmin();
    if (authError) return authError;

    try {
        const payload = await request.json();
        const supabaseAdmin = createAdminClient();
        const { error } = await supabaseAdmin
            .from('integrations')
            .upsert(payload, { onConflict: 'provider' });
        if (error) throw error;
        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("Admin save integration error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// Nunca cacheável (dados sensíveis / por-utilizador). Impede o Next de
// marcar a resposta como estática e a Cloudflare de a guardar.
export const dynamic = "force-dynamic";
