import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { canAccessAdminArea } from "@/lib/roles";

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

function slugify(name: string) {
    return name
        .toLowerCase()
        .normalize("NFD")
        .replace(/[̀-ͯ]/g, "")
        .replace(/[^\w\s-]/g, "")
        .trim()
        .replace(/\s+/g, "-");
}

export async function POST(req: NextRequest) {
    const { error: authError } = await requireAdmin();
    if (authError) return authError;

    const { name } = await req.json();
    if (!name || !name.trim()) return NextResponse.json({ error: "Nome em falta." }, { status: 400 });

    const admin = createAdminClient();
    const { data, error } = await admin
        .from("news_categories")
        .insert([{ name: name.trim(), slug: slugify(name) }])
        .select()
        .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ data });
}

export async function PATCH(req: NextRequest) {
    const { error: authError } = await requireAdmin();
    if (authError) return authError;

    const { id, name } = await req.json();
    if (!id || !name || !name.trim()) return NextResponse.json({ error: "Dados em falta." }, { status: 400 });

    const admin = createAdminClient();

    const { data: current } = await admin.from("news_categories").select("name").eq("id", id).single();

    const { data, error } = await admin
        .from("news_categories")
        .update({ name: name.trim(), slug: slugify(name) })
        .eq("id", id)
        .select()
        .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // Mantém os artigos existentes associados ao novo nome da categoria
    // (articles.type guarda o nome da categoria em texto livre).
    if (current?.name && current.name !== name.trim()) {
        await admin.from("articles").update({ type: name.trim() }).eq("type", current.name);
    }

    return NextResponse.json({ data });
}

export async function DELETE(req: NextRequest) {
    const { error: authError } = await requireAdmin();
    if (authError) return authError;

    const { id } = await req.json();
    if (!id) return NextResponse.json({ error: "ID em falta." }, { status: 400 });

    const admin = createAdminClient();

    const { data: category } = await admin.from("news_categories").select("name").eq("id", id).single();
    if (!category) return NextResponse.json({ error: "Categoria não encontrada." }, { status: 404 });

    const { count } = await admin
        .from("articles")
        .select("id", { count: "exact", head: true })
        .eq("type", category.name)
        .is("deleted_at", null);

    if (count && count > 0) {
        return NextResponse.json({ error: `Não é possível eliminar: ${count} notícia(s) usam esta categoria.` }, { status: 409 });
    }

    const { error } = await admin.from("news_categories").delete().eq("id", id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ success: true });
}

// Nunca cacheável (dados sensíveis / por-utilizador). Impede o Next de
// marcar a resposta como estática e a Cloudflare de a guardar.
export const dynamic = "force-dynamic";
