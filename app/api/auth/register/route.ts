import { NextResponse } from "next/server";
import { createAdminClient } from "@/utils/supabase/admin";

// Registo público: cria a conta já confirmada (sem depender do email de
// confirmação) e garante a linha em basededados.profiles, que nenhum trigger
// cria. O cliente faz signInWithPassword a seguir.
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const email = String(body.email || "").trim().toLowerCase();
        const password = String(body.password || "");
        const fullName = body.fullName ? String(body.fullName).trim() : null;
        const phone = body.phone ? String(body.phone).replace(/[\s-]/g, "") : null;

        // Endpoint público: o plano NUNCA vem do cliente. Todo o registo nasce
        // gratuito; upgrades só depois de pagamento confirmado (callback M-Pesa).
        const plan = "Free";
        const smsNotifications = false;

        if (!email || !password) {
            return NextResponse.json({ error: "Email e senha são obrigatórios." }, { status: 400 });
        }
        if (password.length < 6) {
            return NextResponse.json({ error: "A senha deve ter pelo menos 6 caracteres." }, { status: 400 });
        }

        const admin = createAdminClient();

        const { data: created, error: createErr } = await admin.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
            user_metadata: { full_name: fullName, phone },
        });

        if (createErr) {
            const dup = /already|registered|exists|duplicate/i.test(createErr.message);
            return NextResponse.json(
                { error: dup ? "Este email já está registado. Faça login." : createErr.message },
                { status: dup ? 409 : 400 },
            );
        }

        const userId = created.user?.id;
        if (!userId) {
            return NextResponse.json({ error: "Não foi possível criar a conta." }, { status: 500 });
        }

        const { error: profileErr } = await admin
            .from("profiles")
            .upsert(
                {
                    id: userId,
                    email,
                    full_name: fullName,
                    phone,
                    plan,
                    sms_notifications: smsNotifications,
                    updated_at: new Date().toISOString(),
                },
                { onConflict: "id" },
            );

        if (profileErr) {
            await admin.auth.admin.deleteUser(userId);
            return NextResponse.json({ error: `Perfil não criado: ${profileErr.message}` }, { status: 500 });
        }

        return NextResponse.json({ success: true, userId });
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Erro no registo.";
        console.error("register route error:", err);
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
