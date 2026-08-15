import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { canAccessAdminArea } from "@/lib/roles";

async function requireAdmin() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }), user: null };

    const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

    if (!canAccessAdminArea(profile?.role)) {
        return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }), user: null };
    }
    return { error: null, user };
}

export async function GET(req: NextRequest) {
    const { error: authError } = await requireAdmin();
    if (authError) return authError;

    const bucket = req.nextUrl.searchParams.get("bucket");
    if (!bucket) return NextResponse.json({ error: "Bucket em falta." }, { status: 400 });

    const admin = createAdminClient();
    const { data, error } = await admin.storage.from(bucket).list("", {
        limit: 1000,
        sortBy: { column: "created_at", order: "desc" },
    });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    const files = (data || [])
        .filter((f) => f.id !== null) // ignora "pastas" (placeholder entries)
        .map((f) => ({
            name: f.name,
            created_at: f.created_at,
            size: f.metadata?.size ?? null,
            publicUrl: admin.storage.from(bucket).getPublicUrl(f.name).data.publicUrl,
        }));

    return NextResponse.json({ files });
}

export async function DELETE(req: NextRequest) {
    const { error: authError } = await requireAdmin();
    if (authError) return authError;

    const { bucket, names } = await req.json();
    if (!bucket || !Array.isArray(names) || names.length === 0) {
        return NextResponse.json({ error: "Bucket ou nomes de ficheiro em falta." }, { status: 400 });
    }

    const admin = createAdminClient();
    const { error } = await admin.storage.from(bucket).remove(names);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // Mantém a galeria (media_library) sincronizada com o storage.
    await admin.from("media_library").delete().eq("bucket", bucket).in("path", names);

    return NextResponse.json({ success: true });
}

export async function POST(req: NextRequest) {
    const { error: authError, user } = await requireAdmin();
    if (authError) return authError;

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const bucket = formData.get("bucket") as string | null;
    const path = formData.get("path") as string | null;
    const scope = formData.get("scope") as string | null;
    const articleId = formData.get("articleId") as string | null;

    if (!file || !bucket || !path) {
        return NextResponse.json({ error: "Ficheiro, bucket ou caminho em falta." }, { status: 400 });
    }

    const admin = createAdminClient();

    // Garante que o bucket existe (auto-cura buckets que ainda não foram criados no Supabase).
    const { data: existingBucket } = await admin.storage.getBucket(bucket);
    if (!existingBucket) {
        await admin.storage.createBucket(bucket, { public: true });
    }

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

    // Regista na galeria só quando o chamador indica um scope (ex.: "noticias").
    // Uploads de outras áreas do site (logos, produtos, etc.) não passam scope
    // e por isso não entram na galeria de notícias.
    if (scope) {
        await admin.from("media_library").upsert(
            {
                bucket,
                path: data.path,
                url: publicUrl,
                filename: file.name || data.path.split("/").pop(),
                size: file.size,
                mime_type: file.type || null,
                scope,
                article_id: articleId || null,
                uploaded_by: user?.id || null,
            },
            { onConflict: "bucket,path" }
        );
    }

    return NextResponse.json({ publicUrl });
}
