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

// Extrai bucket + caminho de um URL público do Supabase Storage,
// ex: https://xxx.supabase.co/storage/v1/object/public/public-assets/noticias/foo.jpg
function parsePublicStorageUrl(url: string): { bucket: string; path: string } | null {
    const match = url.match(/\/storage\/v1\/object\/public\/([^/]+)\/(.+?)(\?.*)?$/);
    if (!match) return null;
    return { bucket: match[1], path: decodeURIComponent(match[2]) };
}

function extractImageUrls(html: string | null): string[] {
    if (!html) return [];
    const urls: string[] = [];
    const regex = /<img[^>]+src=["']([^"']+)["']/gi;
    let m;
    while ((m = regex.exec(html)) !== null) {
        urls.push(m[1]);
    }
    return urls;
}

export async function POST(req: NextRequest) {
    const { error: authError } = await requireAdmin();
    if (authError) return authError;

    const admin = createAdminClient();

    const { data: articles, error } = await admin
        .from("articles")
        .select("id, title, image_url, content")
        .is("deleted_at", null);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    const rows: Record<string, any>[] = [];
    const seen = new Set<string>();

    for (const article of articles || []) {
        const candidateUrls = [article.image_url, ...extractImageUrls(article.content)].filter(Boolean) as string[];

        for (const url of candidateUrls) {
            const parsed = parsePublicStorageUrl(url);
            if (!parsed) continue;

            const key = `${parsed.bucket}:${parsed.path}`;
            if (seen.has(key)) continue;
            seen.add(key);

            const filename = parsed.path.split("/").pop() || parsed.path;
            rows.push({
                bucket: parsed.bucket,
                path: parsed.path,
                url,
                filename,
                scope: "noticias",
                article_id: article.id,
            });
        }
    }

    if (rows.length === 0) {
        return NextResponse.json({ inserted: 0, message: "Nenhuma imagem encontrada para sincronizar." });
    }

    const { error: upsertError, count } = await admin
        .from("media_library")
        .upsert(rows, { onConflict: "bucket,path", ignoreDuplicates: true, count: "exact" });

    if (upsertError) return NextResponse.json({ error: upsertError.message }, { status: 500 });

    return NextResponse.json({ inserted: count ?? rows.length, scanned: rows.length });
}
