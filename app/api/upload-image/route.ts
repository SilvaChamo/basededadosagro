import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";

// Versão do /api/admin/upload-image para fora do painel: qualquer conta com
// sessão iniciada pode usar (não exige admin/editor). Existe porque
// components/admin/ImageUpload.tsx só sabia falar com a rota de admin — bom
// dentro do painel, mas dava "Unauthorized" em formulários públicos como o
// de registo de profissional. Mesma lógica de upload, só a exigência de
// sessão muda; sem registo em galeria (isso é só para o painel de notícias).
async function requireAuth() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: NextResponse.json({ error: "É necessário iniciar sessão." }, { status: 401 }), user: null };
    return { error: null, user };
}

export async function POST(req: NextRequest) {
    const { error: authError } = await requireAuth();
    if (authError) return authError;

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const bucket = (formData.get("bucket") as string | null) || "public-assets";
    const path = formData.get("path") as string | null;

    if (!file || !path) {
        return NextResponse.json({ error: "Ficheiro ou caminho em falta." }, { status: 400 });
    }

    const admin = createAdminClient();
    const { data, error: uploadError } = await admin.storage
        .from(bucket)
        .upload(path, file, {
            contentType: file.type || "image/webp",
            cacheControl: "3600",
            upsert: false,
        });

    if (uploadError) {
        return NextResponse.json({ error: uploadError.message }, { status: 500 });
    }

    const { data: { publicUrl } } = admin.storage.from(bucket).getPublicUrl(data.path);
    return NextResponse.json({ publicUrl });
}
