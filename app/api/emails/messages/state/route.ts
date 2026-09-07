import { NextResponse } from "next/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { createClient } from "@/utils/supabase/server";
import { isAdminRole } from "@/lib/roles";

// Estado de e-mails do painel: lido/não lido e arquivar/desarquivar. Só admin.
// POST { ids: string[], read?: boolean, archived?: boolean }

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
        if (ids.length === 0) return NextResponse.json({ error: "Nada selecionado." }, { status: 400 });
        if (ids.length > 500) return NextResponse.json({ error: "Máximo 500 de cada vez." }, { status: 400 });

        const patch: Record<string, unknown> = {};
        if (typeof body.read === "boolean") patch.read_at = body.read ? new Date().toISOString() : null;
        if (typeof body.archived === "boolean") patch.archived_at = body.archived ? new Date().toISOString() : null;
        if (Object.keys(patch).length === 0) {
            return NextResponse.json({ error: "Nada para alterar." }, { status: 400 });
        }

        const { error } = await admin.from("email_messages").update(patch).in("id", ids);
        if (error) throw error;

        return NextResponse.json({ ok: true, affected: ids.length });
    } catch (err) {
        console.error("emails/messages/state error:", err);
        return NextResponse.json({ error: "Não foi possível concluir." }, { status: 500 });
    }
}
