import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET(req: NextRequest) {
    const supabase = await createClient();

    // Check admin role
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

    if (profile?.role !== 'admin') {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const defaultSettings = [
        { key: 'site_name', value: 'Base de Dados Agro' },
        { key: 'contact_email', value: 'info@basededadosagro.com' },
        { key: 'contact_phone', value: '+258 84 000 0000' },
        { key: 'address', value: 'Maputo, Moçambique' },
        { key: 'facebook_url', value: 'https://facebook.com/baseagrodata' },
        { key: 'instagram_url', value: 'https://instagram.com/baseagrodata' },
        { key: 'linkedin_url', value: 'https://linkedin.com/company/baseagrodata' },
        { key: 'footer_about', value: 'Criado para impulsionar o sector agrário, através de facilitação ao acesso à informação e divulgação de dados agricolas.' }
    ];

    const { error } = await supabase
        .from('site_settings')
        .upsert(defaultSettings, { onConflict: 'key' });

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: "Site settings seeded successfully", data: defaultSettings });
}
