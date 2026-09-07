import { NextResponse } from "next/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { createClient } from "@/utils/supabase/server";
import { isAdminRole } from "@/lib/roles";

// Histórico de conversa com um contacto (recebidas + enviadas), por ordem
// cronológica. Só admin. ?phone=+258...

function last9(phone: string) {
    return String(phone || "").replace(/\D/g, "").slice(-9);
}

export async function GET(request: Request) {
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

    const url = new URL(request.url);
    const tail = last9(url.searchParams.get("phone") || "");
    if (tail.length !== 9) {
        return NextResponse.json({ error: "Número inválido." }, { status: 400 });
    }

    // Sem coluna derivada de últimos-9 no PostgREST — filtra por sufixo.
    const { data, error } = await admin
        .from("sms_messages")
        .select("id, direction, phone, from_phone, content, status, detail, read_at, deleted_at, created_at")
        .ilike("phone", `%${tail}`)
        .order("created_at", { ascending: true })
        .limit(500);
    if (error) {
        console.error("sms/thread error:", error);
        return NextResponse.json({ error: "Não foi possível carregar." }, { status: 500 });
    }

    const messages = (data || []).filter((m: { phone: string }) => last9(m.phone) === tail);

    // Nome do contacto.
    let name: string | null = null;
    const { data: prof } = await admin
        .from("profiles")
        .select("full_name, phone")
        .ilike("phone", `%${tail}`)
        .limit(5);
    for (const p of prof || []) {
        if (last9(p.phone as string) === tail && p.full_name) { name = p.full_name as string; break; }
    }

    return NextResponse.json({ name, phone: messages[0]?.phone || `+${tail}`, messages });
}
