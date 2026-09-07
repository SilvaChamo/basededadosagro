import { NextResponse } from "next/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { createClient } from "@/utils/supabase/server";
import { isAdminRole } from "@/lib/roles";

// Lista dos inscritos em alertas SMS (para o painel escolher destinatários
// com checkbox, como nas campanhas). Só admin.

export async function GET(request: Request) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "É necessário iniciar sessão" }, { status: 401 });

    let admin;
    try {
        admin = createAdminClient();
    } catch {
        return NextResponse.json({ error: "Configuração do servidor incompleta" }, { status: 500 });
    }

    const { data: profile } = await admin.from("profiles").select("role").eq("id", user.id).single();
    if (!isAdminRole(profile?.role)) {
        return NextResponse.json({ error: "Apenas administradores" }, { status: 403 });
    }

    const url = new URL(request.url);
    const province = String(url.searchParams.get("province") || "").replace(/[^\p{L}\p{N}\s-]/gu, "").trim().slice(0, 60);
    const district = String(url.searchParams.get("district") || "").replace(/[^\p{L}\p{N}\s-]/gu, "").trim().slice(0, 60);

    let query = admin
        .from("profiles")
        .select("id, full_name, phone, province, district, plan")
        .eq("sms_notifications", true)
        .not("phone", "is", null)
        .order("full_name", { ascending: true })
        .limit(1000);

    if (province) query = query.ilike("province", `%${province}%`);
    if (district) query = query.ilike("district", `%${district}%`);

    const { data, error } = await query;
    if (error) {
        console.error("sms/subscribers error:", error);
        return NextResponse.json({ error: "Não foi possível carregar." }, { status: 500 });
    }

    return NextResponse.json({
        subscribers: (data || []).map((s: { id: string; full_name: string | null; phone: string | null; province: string | null; district: string | null; plan: string | null }) => ({
            id: s.id,
            name: s.full_name || "(sem nome)",
            phone: s.phone,
            province: s.province || "",
            district: s.district || "",
            plan: s.plan || "",
        })),
    });
}
