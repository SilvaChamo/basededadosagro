import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { canAccessAdminArea } from "@/lib/roles";

// Artigos/notícias podem ser geridos por administradores e pela equipa de
// notícias (Editor/Contribuidor) — não só administradores.
async function requireAdmin() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };

    const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

    if (!canAccessAdminArea(profile?.role)) {
        return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
    }
    return { error: null };
}

export async function POST(req: NextRequest) {
    const { error: authError } = await requireAdmin();
    if (authError) return authError;

    const { id, payload } = await req.json();
    if (!payload) return NextResponse.json({ error: "Dados em falta." }, { status: 400 });

    const admin = createAdminClient();

    if (id) {
        const { data, error, count } = await admin
            .from("articles")
            .update(payload, { count: "exact" })
            .eq("id", id)
            .select();

        if (error) return NextResponse.json({ error: error.message }, { status: 500 });
        if (count === 0) return NextResponse.json({ error: "Artigo não encontrado." }, { status: 404 });
        return NextResponse.json({ data: data?.[0] });
    }

    const { data, error } = await admin.from("articles").insert([payload]).select();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ data: data?.[0] });
}

// Actualização em massa (usado para lixo/arquivar/restaurar em lote).
export async function PATCH(req: NextRequest) {
    const { error: authError } = await requireAdmin();
    if (authError) return authError;

    const { ids, payload } = await req.json();
    if (!Array.isArray(ids) || ids.length === 0 || !payload) {
        return NextResponse.json({ error: "IDs ou dados em falta." }, { status: 400 });
    }

    const admin = createAdminClient();
    const { error } = await admin.from("articles").update(payload).in("id", ids);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
}

export async function DELETE(req: NextRequest) {
    const { error: authError } = await requireAdmin();
    if (authError) return authError;

    const { ids } = await req.json();
    if (!Array.isArray(ids) || ids.length === 0) {
        return NextResponse.json({ error: "IDs em falta." }, { status: 400 });
    }

    const admin = createAdminClient();
    const { error, count } = await admin.from("articles").delete({ count: "exact" }).in("id", ids);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, count });
}
