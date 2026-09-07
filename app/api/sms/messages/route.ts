import { NextResponse } from "next/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { createClient } from "@/utils/supabase/server";
import { isAdminRole } from "@/lib/roles";

// Lista os SMS registados para o painel. Só admin.
// ?tab = recebidas | enviadas | eliminadas   (default: enviadas)

async function requireAdmin() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "É necessário iniciar sessão", status: 401 as const };
    const admin = createAdminClient();
    const { data: profile } = await admin.from("profiles").select("role").eq("id", user.id).single();
    if (!isAdminRole(profile?.role)) return { error: "Apenas administradores", status: 403 as const };
    return { admin, user };
}

export async function GET(request: Request) {
    let ctx;
    try {
        ctx = await requireAdmin();
    } catch {
        return NextResponse.json({ error: "Configuração do servidor incompleta" }, { status: 500 });
    }
    if ("error" in ctx) return NextResponse.json({ error: ctx.error }, { status: ctx.status });
    const { admin } = ctx;

    const url = new URL(request.url);
    const tab = url.searchParams.get("tab") || "enviadas";
    const limit = Math.min(Number(url.searchParams.get("limit")) || 60, 200);

    let query = admin
        .from("sms_messages")
        .select("id, direction, phone, from_phone, content, status, detail, created_at")
        .order("created_at", { ascending: false })
        .limit(limit);

    if (tab === "eliminadas") {
        query = query.not("deleted_at", "is", null);
    } else {
        query = query.is("deleted_at", null);
        if (tab === "recebidas") query = query.eq("direction", "inbound");
        else query = query.eq("direction", "outbound"); // enviadas
    }

    const { data, error } = await query;
    if (error) {
        console.error("sms/messages error:", error);
        return NextResponse.json({ error: "Não foi possível carregar." }, { status: 500 });
    }
    return NextResponse.json({ messages: data || [] });
}
