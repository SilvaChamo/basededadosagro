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

// Metadados (alt/título/legenda/descrição) de ficheiros da galeria de
// multimédia — indexados pelo nome/caminho do ficheiro no bucket, não por um
// registo próprio de upload (ver basededados.media_details).
export async function GET(req: NextRequest) {
    const { error: authError } = await requireAdmin();
    if (authError) return authError;

    const fileName = req.nextUrl.searchParams.get("file_name");
    if (!fileName) return NextResponse.json({ error: "file_name em falta." }, { status: 400 });

    const admin = createAdminClient();
    const { data } = await admin
        .from("media_details")
        .select("*")
        .eq("file_name", fileName)
        .single();

    return NextResponse.json({ data: data || null });
}

export async function PUT(req: NextRequest) {
    const { error: authError } = await requireAdmin();
    if (authError) return authError;

    const { file_name, alt_text, title, caption, description } = await req.json();
    if (!file_name) return NextResponse.json({ error: "file_name em falta." }, { status: 400 });

    const admin = createAdminClient();
    const { error } = await admin.from("media_details").upsert(
        { file_name, alt_text, title, caption, description, updated_at: new Date().toISOString() },
        { onConflict: "file_name" }
    );

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
}

// Nunca cacheável (dados sensíveis / por-utilizador). Impede o Next de
// marcar a resposta como estática e a Cloudflare de a guardar.
export const dynamic = "force-dynamic";
