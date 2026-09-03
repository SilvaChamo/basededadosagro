import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";

export async function GET() {
    try {
        const supabase = await createClient();

        // 1. Verify User Session and Admin Status
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

        // 2. Fetch all profiles using the admin client (bypasses RLS).
        //    profiles vive no schema 'basededados' — é a lista de contas
        //    ESPECÍFICAS desta base de dados (quem se registou pelo formulário
        //    daqui). Nunca listar auth.users: essa tabela é partilhada com os
        //    outros sites do mesmo Supabase.
        const supabaseAdmin = createAdminClient();
        const { data, error } = await supabaseAdmin
            .from('profiles')
            .select('*');

        if (error) throw error;

        return NextResponse.json({ users: data || [] });

    } catch (error: any) {
        console.error("Admin list users error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// Nunca cacheável (dados sensíveis / por-utilizador). Impede o Next de
// marcar a resposta como estática e a Cloudflare de a guardar.
export const dynamic = "force-dynamic";
