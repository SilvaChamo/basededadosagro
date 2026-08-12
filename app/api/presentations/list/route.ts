import { NextResponse } from "next/server";
import { createAdminClient } from "@/utils/supabase/admin";

export async function GET() {
    try {
        const supabaseAdmin = createAdminClient();
        const { data, error } = await supabaseAdmin
            .from('presentations')
            .select('*')
            .eq('status', 'active')
            .order('created_at', { ascending: false });

        if (error) throw error;

        return NextResponse.json({ presentations: data || [] });

    } catch (error: any) {
        console.error("Public list presentations error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
