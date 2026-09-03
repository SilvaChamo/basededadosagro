import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";

export async function POST(request: Request) {
    try {
        const supabase = await createClient();

        // 1. Verify User Session
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // 2. Initialize Admin Client
        const supabaseAdmin = createAdminClient();

        // 3. Delete User from Auth (Cascades to public tables if configured, normally)
        // Note: You might want to manually delete from profiles or other tables if Cascade Delete isn't set up in SQL.
        // Assuming Auth Deletion is the primary goal requested.
        const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(
            user.id
        );

        if (deleteError) {
            console.error("Error deleting user:", deleteError);
            return NextResponse.json({ error: deleteError.message }, { status: 500 });
        }

        // 4. Sign out the user from the current session
        await supabase.auth.signOut();

        return NextResponse.json({ success: true, message: "Account deleted successfully" });

    } catch (error: any) {
        console.error("Delete account error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// Nunca cacheável (dados sensíveis / por-utilizador). Impede o Next de
// marcar a resposta como estática e a Cloudflare de a guardar.
export const dynamic = "force-dynamic";
