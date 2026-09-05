import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";

// Versão do /api/admin/upload-image para fora do painel: qualquer conta com
// sessão iniciada pode usar (não exige admin/editor). Existe porque
// components/admin/ImageUpload.tsx só sabia falar com a rota de admin — bom
// dentro do painel (só admin/editor lá chegam), mas dava "Unauthorized" em
// formulários públicos como o de registo de profissional. Sem registo em
// galeria (isso é só para o painel de notícias).
//
// ATENÇÃO: como usa o cliente admin (service_role), ignora TODAS as
// políticas de storage — por isso, ao contrário da rota de admin (só
// alcançável por quem já é de confiança), esta tem de validar tudo ela
// própria: bucket fixo (nunca vindo do pedido), caminho construído no
// servidor a partir do id do utilizador (nunca aceite tal e qual do
// cliente) e tipo/tamanho do ficheiro limitados a imagens pequenas.
async function requireAuth() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: NextResponse.json({ error: "É necessário iniciar sessão." }, { status: 401 }), user: null };
    return { error: null, user };
}

const BUCKET = "public-assets";
const ALLOWED_TYPES: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
};
const MAX_SIZE_BYTES = 5 * 1024 * 1024; // a imagem já chega comprimida (ImageUpload visa <50kb) — 5MB é margem generosa, não um alvo.

// Só a pasta ("professionals", etc.) vem do chamador, e só para organizar —
// nunca o caminho completo. Sem isto, qualquer letra/dígito/traço serve;
// "/" ou ".." ficam de fora, para não sair da pasta pretendida.
function sanitizeFolder(raw: string | null): string {
    const cleaned = (raw || "uploads").replace(/[^a-zA-Z0-9_-]/g, "");
    return cleaned || "uploads";
}

export async function POST(req: NextRequest) {
    const { error: authError, user } = await requireAuth();
    if (authError) return authError;

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const folder = sanitizeFolder(formData.get("folder") as string | null);

    if (!file) {
        return NextResponse.json({ error: "Ficheiro em falta." }, { status: 400 });
    }
    const ext = ALLOWED_TYPES[file.type];
    if (!ext) {
        return NextResponse.json({ error: "Formato não suportado. Envie uma imagem JPG, PNG ou WebP." }, { status: 400 });
    }
    if (file.size > MAX_SIZE_BYTES) {
        return NextResponse.json({ error: "Imagem demasiado grande (máximo 5MB)." }, { status: 400 });
    }

    // Caminho sempre construído aqui, com o id de quem está autenticado —
    // nunca aceite tal e qual do pedido (era isso que deixava escrever em
    // qualquer pasta/bucket, já que esta rota usa a chave de serviço).
    const path = `${folder}/${user!.id}-${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${ext}`;

    const admin = createAdminClient();
    const { data, error: uploadError } = await admin.storage
        .from(BUCKET)
        .upload(path, file, {
            contentType: file.type, // já validado contra ALLOWED_TYPES acima
            cacheControl: "3600",
            upsert: false,
        });

    if (uploadError) {
        return NextResponse.json({ error: uploadError.message }, { status: 500 });
    }

    const { data: { publicUrl } } = admin.storage.from(BUCKET).getPublicUrl(data.path);
    return NextResponse.json({ publicUrl });
}
