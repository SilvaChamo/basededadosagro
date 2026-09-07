import { NextResponse } from "next/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { createClient } from "@/utils/supabase/server";
import { isAdminRole } from "@/lib/roles";

// Um e-mail completo (corpo HTML incluído) para o popup. Só admin.
// Ao abrir, marca os recebidos como lidos. ?id=<uuid>

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

    const id = new URL(request.url).searchParams.get("id") || "";
    if (!id) return NextResponse.json({ error: "Falta o id." }, { status: 400 });

    const { data, error } = await admin
        .from("email_messages")
        .select("id, direction, address, from_address, cc, bcc, subject, html, snippet, status, detail, attachments, read_at, deleted_at, created_at")
        .eq("id", id)
        .single();
    if (error || !data) return NextResponse.json({ error: "Não encontrado." }, { status: 404 });

    if (data.direction === "inbound" && !data.read_at) {
        await admin.from("email_messages").update({ read_at: new Date().toISOString() }).eq("id", id);
        data.read_at = new Date().toISOString();
    }

    return NextResponse.json({ message: data });
}
