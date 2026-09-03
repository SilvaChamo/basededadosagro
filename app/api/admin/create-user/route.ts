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
        const wantedEmail = String(email).trim().toLowerCase();

        // 3. Criar o utilizador no Auth — OU reutilizar o que já existe.
        //    auth.users é PARTILHADO com os outros sites deste Supabase: o
        //    email pode já lá estar (registo público, outro site, tentativa
        //    anterior) sem ter linha em basededados.profiles — e então "a
        //    conta não aparece no painel". Nesse caso adoptamos o utilizador
        //    existente e criamos-lhe aqui a linha de profile.
        const { data: authData, error: createError } = await supabaseAdmin.auth.admin.createUser({
            email,
            password: password || Math.random().toString(36).slice(-10),
            email_confirm: true
        });

        let targetUserId: string | null = authData?.user?.id ?? null;
        let adopted = false;

        if (!targetUserId) {
            const alreadyExists =
                createError && /already|registered|exists|duplicate/i.test(createError.message);
            if (!alreadyExists) throw createError || new Error("Erro ao criar utilizador");

            // Procurar o utilizador já existente em auth.users pelo email.
            for (let page = 1; page <= 25 && !targetUserId; page++) {
                const { data: list, error: listErr } =
                    await supabaseAdmin.auth.admin.listUsers({ page, perPage: 200 });
                if (listErr) throw listErr;
                const match = list.users.find(
                    (u) => (u.email || "").toLowerCase() === wantedEmail,
                );
                if (match) targetUserId = match.id;
                if (list.users.length < 200) break;
            }
            if (!targetUserId) throw createError;
            adopted = true;
        }

        // 4. Garantir a linha de profile (role/plan) — upsert por id.
        const { error: profileError } = await supabaseAdmin
            .from('profiles')
            .upsert(
                {
                    id: targetUserId,
                    email: wantedEmail,
                    role: role || 'user',
                    plan: plan || 'Free',
                    ...(fullName ? { full_name: fullName } : {}),
                    updated_at: new Date().toISOString(),
                },
                { onConflict: 'id' },
            );
        if (profileError) throw profileError;

        return NextResponse.json({
            success: true,
            message: adopted
                ? "Este email já tinha conta no sistema; foi adicionado a esta base de dados."
                : "Utilizador criado com sucesso",
        });

    } catch (error: any) {
        console.error("Admin create user error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// Nunca cacheável (dados sensíveis / por-utilizador). Impede o Next de
// marcar a resposta como estática e a Cloudflare de a guardar.
export const dynamic = "force-dynamic";
