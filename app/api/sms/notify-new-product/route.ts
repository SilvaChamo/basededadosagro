import { NextResponse } from "next/server";
import { canUseSMSNotifications, normalizePlanName } from "@/lib/plan-fields";
import { createAdminClient } from "@/utils/supabase/admin";
import { createClient } from "@/utils/supabase/server";
import { isAdminRole } from "@/lib/roles";

const INFOBIP_BASE_URL = process.env.INFOBIP_BASE_URL;
const INFOBIP_API_KEY = process.env.INFOBIP_API_KEY;
// Envio real fica desligado por defeito. Definir SMS_DRY_RUN=false no ambiente (ex: no dia da defesa) para activar o envio via Infobip.
const SMS_DRY_RUN = process.env.SMS_DRY_RUN !== "false";

async function sendSMS(phone: string, text: string): Promise<{ phone: string; status: string }> {
    if (SMS_DRY_RUN || !INFOBIP_BASE_URL || !INFOBIP_API_KEY) {
        console.log(`[SMS dry-run] Para ${phone}: ${text}`);
        return { phone, status: "sent_mock" };
    }

    const destination = phone.replace(/^\+/, "").replace(/\s/g, "");

    try {
        const response = await fetch(`https://${INFOBIP_BASE_URL}/sms/2/text/advanced`, {
            method: "POST",
            headers: {
                Authorization: `App ${INFOBIP_API_KEY}`,
                "Content-Type": "application/json",
                Accept: "application/json",
            },
            body: JSON.stringify({
                messages: [
                    {
                        destinations: [{ to: destination }],
                        text,
                    },
                ],
            }),
        });

        if (!response.ok) {
            console.error(`Infobip respondeu ${response.status} para ${phone}:`, await response.text());
            return { phone, status: "failed" };
        }

        const data = await response.json();
        const groupName = data?.messages?.[0]?.status?.groupName;
        return { phone, status: groupName === "PENDING" ? "sent" : "failed" };
    } catch (err) {
        console.error(`Erro ao enviar SMS para ${phone}:`, err);
        return { phone, status: "failed" };
    }
}

// We use the service role key to bypass RLS and fetch all subcribed users
export async function POST(request: Request) {
    // Sem isto, qualquer pessoa não autenticada conseguia disparar SMS reais
    // (custam dinheiro via Infobip) para todos os subscritores de uma
    // localização, só chamando este endpoint directamente.
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return NextResponse.json({ error: "É necessário iniciar sessão" }, { status: 401 });
    }

    // We initialize the client inside the handler to avoid build-time evaluation issues
    let supabaseAdmin;
    try {
        supabaseAdmin = createAdminClient();
    } catch {
        console.error("Supabase environment variables are missing");
        return NextResponse.json({ error: "Configuração do servidor incompleta" }, { status: 500 });
    }

    try {
        const { product, price, location, type = 'market', variation = null, companyId = null } = await request.json();

        if (!product || !price) {
            return NextResponse.json({ error: "Dados incompletos" }, { status: 400 });
        }

        if (type === 'company') {
            // Alerta de produto de empresa: só o dono da empresa (ou um
            // admin) pode disparar isto, e só se o plano incluir SMS.
            if (!companyId) {
                return NextResponse.json({ error: "companyId é obrigatório para type=company" }, { status: 400 });
            }

            const { data: company } = await supabaseAdmin
                .from('companies')
                .select('plan, user_id')
                .eq('id', companyId)
                .single();

            const { data: profile } = await supabaseAdmin
                .from('profiles')
                .select('role')
                .eq('id', user.id)
                .single();

            if (!company || (company.user_id !== user.id && !isAdminRole(profile?.role))) {
                return NextResponse.json({ error: "Sem permissão para notificar por esta empresa" }, { status: 403 });
            }

            const plan = normalizePlanName(company.plan);
            if (!canUseSMSNotifications(plan)) {
                return NextResponse.json({
                    error: "Recurso SMS requer plano Premium ou superior",
                    upgrade_required: true
                }, { status: 403 });
            }
        } else {
            // Alertas de mercado (regionais/nacionais) só podem ser
            // despoletados pela administração — não há dono individual a
            // verificar como no caso de 'company'.
            const { data: profile } = await supabaseAdmin
                .from('profiles')
                .select('role')
                .eq('id', user.id)
                .single();

            if (!isAdminRole(profile?.role)) {
                return NextResponse.json({ error: "Apenas administradores podem enviar alertas de mercado" }, { status: 403 });
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
            // `location` vem do pedido — nunca interpolar directamente numa
            // string de filtro do PostgREST. Só letras/números/espaços/hífen
            // sobrevivem, o resto é cortado antes de entrar no .or().
            const safeLocation = String(location).replace(/[^\p{L}\p{N}\s-]/gu, '').trim().slice(0, 100);
            if (safeLocation) {
                query = query.or(`province.ilike.%${safeLocation}%,district.ilike.%${safeLocation}%`);
            }
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

        // 4. Send SMS (real via Infobip quando SMS_DRY_RUN=false; simulado caso contrário)
        const results = await Promise.all(subscribers.map((sub: any) => sendSMS(sub.phone, message)));

        return NextResponse.json({
            success: true,
            totalSubscribers: subscribers.length,
            message: "Notificações enviadas",
            dryRun: SMS_DRY_RUN,
            results
        });

    } catch (error: any) {
        console.error("SMS notification error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
