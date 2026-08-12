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

        // 2. Fetch all profiles using the admin client (bypasses RLS)
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
