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
        const { email, role, plan, password, fullName } = body;

        if (!email) {
            return NextResponse.json({ error: "Email é obrigatório" }, { status: 400 });
        }

        // 2. Initialize Admin Client
        const supabaseAdmin = createAdminClient();

        // 3. Create the User in Auth
        const { data: authData, error: createError } = await supabaseAdmin.auth.admin.createUser({
            email,
            password: password || Math.random().toString(36).slice(-10),
            email_confirm: true
        });

        if (createError) throw createError;

        if (!authData.user) throw new Error("Erro ao criar utilizador");

        // 4. Update Profile Data (Role, Plan)
        // Profiles are usually created by a trigger on the database, 
        // but let's ensure it has the correct role and plan.
        const { error: profileError } = await supabaseAdmin
            .from('profiles')
            .update({
                role: role || 'user',
                plan: plan || 'Free',
                email: email, // ensure email is set if trigger didn't do it
                ...(fullName ? { full_name: fullName } : {}),
                updated_at: new Date().toISOString()
            })
            .eq('id', authData.user.id);

        // If it doesn't exist (trigger failed or didn't run), insert it
        if (profileError) {
            await supabaseAdmin
                .from('profiles')
                .insert({
                    id: authData.user.id,
                    email: email,
                    role: role || 'user',
                    plan: plan || 'Free',
                    ...(fullName ? { full_name: fullName } : {}),
                    created_at: new Date().toISOString()
                });
        }

        return NextResponse.json({ success: true, message: "Utilizador criado com sucesso" });

    } catch (error: any) {
        console.error("Admin create user error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
