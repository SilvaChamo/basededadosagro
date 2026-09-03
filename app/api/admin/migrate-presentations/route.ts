import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST() {
    try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

        if (!supabaseUrl || !supabaseServiceKey) {
            return NextResponse.json({
                success: false,
                error: "Missing Supabase credentials"
            }, { status: 500 });
        }

        const supabase = createClient(supabaseUrl, supabaseServiceKey, {
            auth: { persistSession: false }
        });

        // Add status column if it doesn't exist
        const { error } = await supabase.rpc('exec_sql', {
            query: "ALTER TABLE public.presentations ADD COLUMN IF NOT EXISTS status text DEFAULT 'active';"
        });

        if (error) {
            // Try alternative approach - direct query
            // This might fail if exec_sql function doesn't exist
            return NextResponse.json({
                success: false,
                error: error.message,
                instructions: "Por favor, execute manualmente no Supabase SQL Editor: ALTER TABLE public.presentations ADD COLUMN IF NOT EXISTS status text DEFAULT 'active';"
            }, { status: 400 });
        }

        return NextResponse.json({
            success: true,
            message: "Coluna 'status' adicionada com sucesso!"
        });

    } catch (error: any) {
        return NextResponse.json({
            success: false,
            error: error.message
        }, { status: 500 });
    }
}

// Nunca cacheável (dados sensíveis / por-utilizador). Impede o Next de
// marcar a resposta como estática e a Cloudflare de a guardar.
export const dynamic = "force-dynamic";
