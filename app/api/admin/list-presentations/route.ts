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

        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();

        if (profile?.role !== 'admin') {
            return NextResponse.json({ error: "Acesso restrito a administradores" }, { status: 403 });
        }

        const supabaseAdmin = createAdminClient();

        const [{ data: active, error: activeError }, { data: deleted, error: deletedError }] = await Promise.all([
            supabaseAdmin.from('presentations').select('*').order('created_at', { ascending: false }),
            supabaseAdmin.from('deleted_presentations').select('*').order('deleted_at', { ascending: false }),
        ]);

        if (activeError) throw activeError;
        if (deletedError) throw deletedError;

        return NextResponse.json({ presentations: active || [], deletedPresentations: deleted || [] });

    } catch (error: any) {
        console.error("Admin list presentations error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
