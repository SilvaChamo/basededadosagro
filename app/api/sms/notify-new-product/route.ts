import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { canUseSMSNotifications, normalizePlanName } from "@/lib/plan-fields";

// We use the service role key to bypass RLS and fetch all subcribed users
export async function POST(request: Request) {
    // We initialize the client inside the handler to avoid build-time evaluation issues
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
        console.error("Supabase environment variables are missing");
        return NextResponse.json({ error: "Configuração do servidor incompleta" }, { status: 500 });
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    try {
        const { product, price, location, type = 'market', variation = null, companyId = null } = await request.json();

        if (!product || !price) {
            return NextResponse.json({ error: "Dados incompletos" }, { status: 400 });
        }

        // Check if company has SMS feature (Premium+ required for company products)
        if (type === 'company' && companyId) {
            const { data: company } = await supabaseAdmin
                .from('companies')
                .select('plan')
                .eq('id', companyId)
                .single();

            const plan = normalizePlanName(company?.plan);
            if (!canUseSMSNotifications(plan)) {
                return NextResponse.json({
                    error: "Recurso SMS requer plano Premium ou superior",
                    upgrade_required: true
                }, { status: 403 });
            }
        }

        // 1. Fetch subscribers who have SMS enabled
        let query = supabaseAdmin
            .from('profiles')
            .select('phone, province, district')
            .eq('sms_notifications', true)
            .not('phone', 'is', null);

        // 2. Filter by location ONLY if type is 'market'
        // Company products are national alerts, Market variations are regional
        if (location && type === 'market') {
            // Match province or district
            query = query.or(`province.ilike.%${location}%,district.ilike.%${location}%`);
        }

        const { data: subscribers, error: fetchError } = await query;

        if (fetchError) throw fetchError;

        if (!subscribers || subscribers.length === 0) {
            return NextResponse.json({ message: "Nenhum subscritor para esta localização" });
        }

        // 3. Prepare message based on type
        let message = "";
        if (type === 'company') {
            message = `Base Agro: Novo produto de empresa! ${product} por ${price} MT em ${location || 'Moçambique'}. Confira no portal!`;
        } else if (type === 'market') {
            const variationText = variation
                ? ` (${variation > 0 ? '+' : ''}${variation}% de variação)`
                : "";
            message = `Base Agro: Actualização de preço no ${location || 'Mercado'}. ${product}: ${price} MT${variationText}.`;
        } else {
            message = `Base Agro: Novo produto: ${product} (${price} MT) em ${location || 'Moçambique'}.`;
        }

        // 4. Send SMS (Mocked)
        const results = await Promise.all(subscribers.map(async (sub: any) => {

            return { phone: sub.phone, status: 'sent_mock' };
        }));

        return NextResponse.json({
            success: true,
            totalSubscribers: subscribers.length,
            message: "Notificações enviadas",
            results
        });

    } catch (error: any) {
        console.error("SMS notification error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
