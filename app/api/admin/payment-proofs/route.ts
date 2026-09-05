import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";

async function requireAdmin() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

    return profile?.role === "admin";
}

export async function GET() {
    if (!(await requireAdmin())) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const adminClient = createAdminClient();
    const { data: transactions, error } = await adminClient
        .from("payment_transactions")
        .select("*")
        .eq("method", "visa")
        .order("created_at", { ascending: false })
        .limit(1000);

    if (error) {
        console.error("Erro ao carregar comprovativos:", error);
        return NextResponse.json({ error: "Não foi possível carregar os comprovativos." }, { status: 500 });
    }

    const userIds = Array.from(new Set((transactions || []).map((transaction) => transaction.user_id)));
    const [{ data: profiles }, { data: companies }] = await Promise.all([
        userIds.length
            ? adminClient.from("profiles").select("id, full_name").in("id", userIds)
            : Promise.resolve({ data: [] as { id: string; full_name: string | null }[] }),
        userIds.length
            ? adminClient.from("companies").select("user_id, name").in("user_id", userIds)
            : Promise.resolve({ data: [] as { user_id: string; name: string | null }[] }),
    ]);

    const nameById = new Map((profiles || []).map((profile) => [profile.id, profile.full_name]));
    const companyByUser = new Map((companies || []).map((company) => [company.user_id, company.name]));

    return NextResponse.json({
        rows: (transactions || []).map((transaction) => ({
            ...transaction,
            userName: nameById.get(transaction.user_id) || "—",
            companyName: companyByUser.get(transaction.user_id) || "—",
        })),
    });
}