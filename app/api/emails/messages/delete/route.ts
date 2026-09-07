import { NextResponse } from "next/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { createClient } from "@/utils/supabase/server";
import { isAdminRole } from "@/lib/roles";

// Eliminar e-mails do painel. Só admin.
//  mode "soft" (default): marca deleted_at -> separador "Eliminados".
//  mode "hard": apaga mesmo (só a partir de "Eliminados").
//  mode "restore": tira de "Eliminados".

export async function POST(request: Request) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "É necessário iniciar sessão" }, { status: 401 });

    let admin;
    try {
        admin = createAdminClient();
    } catch {
        return NextResponse.json({ error: "Configuração do servidor incompleta" }, { status: 500 });
    }

    const { data: profile } = await admin.from("profiles").select("role").eq("id", user.id).single();
    if (!isAdminRole(profile?.role)) {
        return NextResponse.json({ error: "Apenas administradores" }, { status: 403 });
    }

    try {
        const body = await request.json();
        const ids: string[] = Array.isArray(body.ids) ? body.ids.filter((x: unknown) => typeof x === "string") : [];
        const mode = ["soft", "hard", "restore"].includes(body.mode) ? body.mode : "soft";

        if (ids.length === 0) return NextResponse.json({ error: "Nada selecionado." }, { status: 400 });
        if (ids.length > 500) return NextResponse.json({ error: "Máximo 500 de cada vez." }, { status: 400 });

        if (mode === "hard") {
            const { error } = await admin.from("email_messages").delete().in("id", ids);
            if (error) throw error;
        } else {
            const { error } = await admin
                .from("email_messages")
                .update({ deleted_at: mode === "restore" ? null : new Date().toISOString() })
                .in("id", ids);
            if (error) throw error;
        }

        return NextResponse.json({ ok: true, affected: ids.length });
    } catch (err) {
        console.error("emails/messages/delete error:", err);
        return NextResponse.json({ error: "Não foi possível concluir." }, { status: 500 });
    }
}
