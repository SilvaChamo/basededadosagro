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
        const { userId, role, plan, password, fullName, phone, address, bio, website } = body;

        if (!userId) {
            return NextResponse.json({ error: "ID do utilizador é obrigatório" }, { status: 400 });
        }

        // 2. Initialize Admin Client
        const supabaseAdmin = createAdminClient();

        // 3. Update Auth Data (Password) if provided
        if (password) {
            const { error: passwordError } = await supabaseAdmin.auth.admin.updateUserById(
                userId,
                { password: password }
            );
            if (passwordError) throw passwordError;
        }

        // 4. Update Profile Data (Role, Plan, Contact Info)
        const updateData: any = {};
        if (role) updateData.role = role;
        if (plan) updateData.plan = plan;
        if (fullName !== undefined) updateData.full_name = fullName;
        if (phone !== undefined) updateData.phone = phone;
        if (address !== undefined) updateData.address = address;
        if (bio !== undefined) updateData.bio = bio;
        if (website !== undefined) updateData.website = website;
        updateData.updated_at = new Date().toISOString();

        const { error: profileError } = await supabaseAdmin
            .from('profiles')
            .update(updateData)
            .eq('id', userId);

        if (profileError) throw profileError;

        // 5. Update Company Data (Plan) if it exists
        if (plan) {
            await supabaseAdmin
                .from('companies')
                .update({
                    plan: plan,
                    updated_at: new Date().toISOString()
                })
                .eq('user_id', userId);
        }

        return NextResponse.json({ success: true, message: "Utilizador atualizado com sucesso" });

    } catch (error: any) {
        console.error("Admin update user error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
