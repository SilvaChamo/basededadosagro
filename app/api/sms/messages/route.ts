import { NextResponse } from "next/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { createClient } from "@/utils/supabase/server";
import { isAdminRole } from "@/lib/roles";

// Lista os SMS registados (enviados e/ou recebidos) para o ecrã do painel.
// Só admin.

export async function GET(request: Request) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return NextResponse.json({ error: "É necessário iniciar sessão" }, { status: 401 });
    }

    let admin;
    try {
        admin = createAdminClient();
    } catch {
        return NextResponse.json({ error: "Configuração do servidor incompleta" }, { status: 500 });
    }

    const { data: profile } = await admin
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();
    if (!isAdminRole(profile?.role)) {
        return NextResponse.json({ error: "Apenas administradores" }, { status: 403 });
    }

    const url = new URL(request.url);
    const direction = url.searchParams.get("direction"); // inbound | outbound | (todos)
    const limit = Math.min(Number(url.searchParams.get("limit")) || 50, 200);

    let query = admin
        .from("sms_messages")
        .select("id, direction, phone, from_phone, content, status, created_at")
        .order("created_at", { ascending: false })
        .limit(limit);

    if (direction === "inbound" || direction === "outbound") {
        query = query.eq("direction", direction);
    }

    const { data, error } = await query;
    if (error) {
        console.error("sms/messages error:", error);
        return NextResponse.json({ error: "Não foi possível carregar." }, { status: 500 });
    }

    return NextResponse.json({ messages: data || [] });
}
