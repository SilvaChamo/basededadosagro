import { NextResponse } from "next/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { createClient } from "@/utils/supabase/server";
import { isAdminRole } from "@/lib/roles";

// Marca SMS recebidas como lidas (read_at). Só admin.

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
        if (ids.length === 0) return NextResponse.json({ ok: true, affected: 0 });

        const { error } = await admin
            .from("sms_messages")
            .update({ read_at: new Date().toISOString() })
            .in("id", ids)
            .is("read_at", null);
        if (error) throw error;

        return NextResponse.json({ ok: true, affected: ids.length });
    } catch (err) {
        console.error("sms/messages/read error:", err);
        return NextResponse.json({ error: "Falhou." }, { status: 500 });
    }
}
