import { NextResponse } from "next/server";
import { createAdminClient } from "@/utils/supabase/admin";

export async function GET(request: Request, { params }: { params: Promise<{ slug: string }> }) {
    try {
        const { slug } = await params;
        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slug);

        const supabaseAdmin = createAdminClient();
        const query = supabaseAdmin.from('presentations').select('*').eq('status', 'active');

        const { data, error } = await (isUUID ? query.eq('id', slug) : query.eq('slug', slug)).maybeSingle();

        if (error) throw error;

        return NextResponse.json({ presentation: data });

    } catch (error: any) {
        console.error("Public get presentation error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
