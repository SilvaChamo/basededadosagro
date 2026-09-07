import { NextResponse } from "next/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { createClient } from "@/utils/supabase/server";
import { isAdminRole } from "@/lib/roles";

// Lista de possíveis destinatários de SMS, para escolha com checkbox no painel.
// Só admin. ?source = plan (default, inscritos em alertas) | profissionais | contactos

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
    const source = url.searchParams.get("source") || "plan";
    const clean = (v: string) => String(v || "").replace(/[^\p{L}\p{N}\s-]/gu, "").trim().slice(0, 60);
    const province = clean(url.searchParams.get("province") || "");
    const district = clean(url.searchParams.get("district") || "");

    type Row = { id: string; name: string; phone: string; province: string; district: string; plan: string };
    let rows: Row[] = [];

    if (source === "profissionais") {
        let q = admin.from("professionals").select("id, name, phone, province, district").not("phone", "is", null).limit(2000);
        if (province) q = q.ilike("province", `%${province}%`);
        if (district) q = q.ilike("district", `%${district}%`);
        const { data, error } = await q;
        if (error) return NextResponse.json({ error: "Não foi possível carregar." }, { status: 500 });
        rows = (data || []).map((s: { id: string; name: string | null; phone: string | null; province: string | null; district: string | null }) => ({
            id: s.id, name: s.name || "(sem nome)", phone: s.phone || "", province: s.province || "", district: s.district || "", plan: "",
        }));
    } else if (source === "contactos") {
        const { data, error } = await admin
            .from("contacts")
            .select("id, name, phone, whatsapp")
            .or("phone.not.is.null,whatsapp.not.is.null")
            .limit(3000);
        if (error) return NextResponse.json({ error: "Não foi possível carregar." }, { status: 500 });
        rows = (data || []).map((s: { id: string; name: string | null; phone: string | null; whatsapp: string | null }) => ({
            id: s.id, name: s.name || "(sem nome)", phone: s.phone || s.whatsapp || "", province: "", district: "", plan: "",
        })).filter((r: Row) => r.phone);
    } else {
        let q = admin
            .from("profiles")
            .select("id, full_name, phone, province, district, plan")
            .eq("sms_notifications", true)
            .not("phone", "is", null)
            .order("full_name", { ascending: true })
            .limit(1000);
        if (province) q = q.ilike("province", `%${province}%`);
        if (district) q = q.ilike("district", `%${district}%`);
        const { data, error } = await q;
        if (error) return NextResponse.json({ error: "Não foi possível carregar." }, { status: 500 });
        rows = (data || []).map((s: { id: string; full_name: string | null; phone: string | null; province: string | null; district: string | null; plan: string | null }) => ({
            id: s.id, name: s.full_name || "(sem nome)", phone: s.phone || "", province: s.province || "", district: s.district || "", plan: s.plan || "",
        }));
    }

    return NextResponse.json({ subscribers: rows });
}
