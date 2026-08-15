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

    const scope = req.nextUrl.searchParams.get("scope") || "noticias";
    const search = req.nextUrl.searchParams.get("search") || "";

    const admin = createAdminClient();
    let query = admin
        .from("media_library")
        .select("*")
        .eq("scope", scope)
        .order("created_at", { ascending: false })
        .limit(1000);

    if (search) query = query.ilike("filename", `%${search}%`);

    const { data, error } = await query;
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ files: data || [] });
}

export async function PATCH(req: NextRequest) {
    const { error: authError } = await requireAdmin();
    if (authError) return authError;

    const { id, alt_text, caption } = await req.json();
    if (!id) return NextResponse.json({ error: "ID em falta." }, { status: 400 });

    const admin = createAdminClient();
    const { data, error } = await admin
        .from("media_library")
        .update({ alt_text, caption })
        .eq("id", id)
        .select()
        .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ data });
}

export async function DELETE(req: NextRequest) {
    const { error: authError } = await requireAdmin();
    if (authError) return authError;

    const { ids } = await req.json();
    if (!Array.isArray(ids) || ids.length === 0) {
        return NextResponse.json({ error: "IDs em falta." }, { status: 400 });
    }

    const admin = createAdminClient();

    const { data: rows, error: fetchError } = await admin
        .from("media_library")
        .select("id, bucket, path")
        .in("id", ids);

    if (fetchError) return NextResponse.json({ error: fetchError.message }, { status: 500 });

    const byBucket = new Map<string, string[]>();
    for (const row of rows || []) {
        const list = byBucket.get(row.bucket) || [];
        list.push(row.path);
        byBucket.set(row.bucket, list);
    }

    for (const [bucket, paths] of byBucket) {
        await admin.storage.from(bucket).remove(paths);
    }

    const { error: deleteError } = await admin.from("media_library").delete().in("id", ids);
    if (deleteError) return NextResponse.json({ error: deleteError.message }, { status: 500 });

    return NextResponse.json({ success: true });
}
