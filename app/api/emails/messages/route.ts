import { NextResponse } from "next/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { createClient } from "@/utils/supabase/server";
import { isAdminRole } from "@/lib/roles";

// Lista os e-mails individuais para o painel. Só admin.
// ?tab = entrada | enviados | eliminados   (default: enviados)
// entrada = recebidos (sincronizados por IMAP); enviados/eliminados = BD.

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
    const tab = url.searchParams.get("tab") || "enviados";
    const limit = Math.min(Number(url.searchParams.get("limit")) || 100, 300);

    let query = admin
        .from("email_messages")
        .select("id, direction, address, from_address, cc, bcc, subject, snippet, status, detail, read_at, created_at")
        .order("created_at", { ascending: false })
        .limit(limit);

    if (tab === "eliminados") {
        query = query.not("deleted_at", "is", null);
    } else {
        query = query.is("deleted_at", null);
        query = query.eq("direction", tab === "entrada" ? "inbound" : "outbound");
    }

    const { data, error } = await query;
    if (error) {
        console.error("emails/messages error:", error);
        return NextResponse.json({ error: "Não foi possível carregar." }, { status: 500 });
    }

    return NextResponse.json({ messages: data || [] });
}
