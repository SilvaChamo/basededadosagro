import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";

export async function POST(request: Request) {
    try {
        const supabase = await createClient();

        // 1. Verify User Session and Admin Status
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
        }

        // Check if current user is an admin in the profiles table
        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();

        if (profile?.role !== 'admin') {
            return NextResponse.json({ error: "Acesso restrito a administradores" }, { status: 403 });
        }

        const body = await request.json();
        const { userId } = body;

        if (!userId) {
            return NextResponse.json({ error: "ID do utilizador é obrigatório" }, { status: 400 });
        }

        // Prevent deleting yourself
        if (userId === user.id) {
            return NextResponse.json({ error: "Não pode eliminar a sua própria conta" }, { status: 400 });
        }

        // 2. Initialize Admin Client
        const supabaseAdmin = createAdminClient();

        // 3. Delete Profile (optional, usually handled by cascade if configured, but let's be safe)
        // First delete anything related to the user if necessary, or just delete the user
        // and let the foreign key cascade handles it.

        // 4. Delete the User from Auth
        const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(userId);
        if (deleteError) throw deleteError;

        return NextResponse.json({ success: true, message: "Utilizador eliminado com sucesso" });

    } catch (error: any) {
        console.error("Admin delete user error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// Nunca cacheável (dados sensíveis / por-utilizador). Impede o Next de
// marcar a resposta como estática e a Cloudflare de a guardar.
export const dynamic = "force-dynamic";
