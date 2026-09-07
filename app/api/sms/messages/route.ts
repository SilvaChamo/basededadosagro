import { NextResponse } from "next/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { createClient } from "@/utils/supabase/server";
import { isAdminRole } from "@/lib/roles";

// Lista os SMS registados para o painel. Só admin.
// ?tab = recebidas | enviadas | eliminadas   (default: enviadas)
// Cada linha traz o nome do contacto (se o número existir em profiles).

function last9(phone: string) {
    return String(phone || "").replace(/\D/g, "").slice(-9);
}

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
    const limit = Math.min(Number(url.searchParams.get("limit")) || 100, 300);

    let query = admin
        .from("sms_messages")
        .select("id, direction, phone, from_phone, content, status, detail, read_at, created_at")
        .order("created_at", { ascending: false })
        .limit(limit);

    if (tab === "eliminadas") {
        query = query.not("deleted_at", "is", null);
    } else {
        query = query.is("deleted_at", null);
        if (tab === "recebidas") query = query.eq("direction", "inbound");
        else query = query.eq("direction", "outbound");
    }

    const { data, error } = await query;
    if (error) {
        console.error("sms/messages error:", error);
        return NextResponse.json({ error: "Não foi possível carregar." }, { status: 500 });
    }

    // Nome do contacto: mapa últimos-9-dígitos -> full_name (poucos perfis).
    const nameByTail = new Map<string, string>();
    const { data: profs } = await admin
        .from("profiles")
        .select("full_name, phone")
        .not("phone", "is", null)
        .limit(5000);
    for (const p of profs || []) {
        const t = last9(p.phone as string);
        if (t.length === 9 && p.full_name) nameByTail.set(t, p.full_name as string);
    }

    const messages = (data || []).map((m: Record<string, unknown>) => ({
        ...m,
        name: nameByTail.get(last9(m.phone as string)) || null,
    }));

    return NextResponse.json({ messages });
}
