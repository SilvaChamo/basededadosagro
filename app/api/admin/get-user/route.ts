import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";

export async function GET(request: Request) {
    try {
        const supabase = await createClient();

        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
        }

        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();

        if (profile?.role !== 'admin') {
            return NextResponse.json({ error: "Acesso restrito a administradores" }, { status: 403 });
        }

        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('id');
        if (!userId) {
            return NextResponse.json({ error: "ID do utilizador é obrigatório" }, { status: 400 });
        }

        const supabaseAdmin = createAdminClient();
        const { data, error } = await supabaseAdmin
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();

        if (error) throw error;

        return NextResponse.json({ user: data });

    } catch (error: any) {
        console.error("Admin get user error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// Nunca cacheável (dados sensíveis / por-utilizador). Impede o Next de
// marcar a resposta como estática e a Cloudflare de a guardar.
export const dynamic = "force-dynamic";
