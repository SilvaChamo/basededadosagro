import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";

// Aprovação é dinheiro real (transferência bancária confirmada à mão) —
// restrito só a "admin", ao contrário de outras rotas do painel que também
// deixam editor/contribuidor entrar (canAccessAdminArea). Aqui não.
async function requireAdmin() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }), user: null };

    const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

    if (profile?.role !== "admin") {
        return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }), user: null };
    }
    return { error: null, user };
}

// Mesma lógica de activação já usada pelo M-Pesa (lib duplicada de propósito
// — ver app/api/payment/mpesa/route.ts — para não arriscar mexer numa rota
// de pagamento já a funcionar só para partilhar 2 linhas).
async function activatePlan(adminClient: ReturnType<typeof createAdminClient>, userId: string, planName: string) {
    await adminClient.from('profiles').update({ plan: planName }).eq('id', userId);
    await adminClient.from('companies').update({ plan: planName }).eq('user_id', userId);
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { error: authError } = await requireAdmin();
    if (authError) return authError;

    const { id } = await params;
    const { action } = await request.json().catch(() => ({}));
    if (action !== "approve" && action !== "reject") {
        return NextResponse.json({ error: "Acção inválida." }, { status: 400 });
    }

    const adminClient = createAdminClient();
    const { data: tx, error: txError } = await adminClient
        .from("payment_transactions")
        .select("*")
        .eq("id", id)
        .single();

    if (txError || !tx) {
        return NextResponse.json({ error: "Comprovativo não encontrado." }, { status: 404 });
    }
    if (tx.status !== "pending") {
        return NextResponse.json({ error: `Este comprovativo já foi ${tx.status === 'completed' ? 'aprovado' : 'rejeitado'}.` }, { status: 409 });
    }

    if (action === "reject") {
        const { error: rejectError } = await adminClient.from("payment_transactions")
            .update({ status: "failed" })
            .eq("id", id);
        if (rejectError) {
            console.error("Erro ao rejeitar comprovativo:", rejectError);
            return NextResponse.json({ error: "Não foi possível rejeitar o comprovativo." }, { status: 500 });
        }
        return NextResponse.json({ success: true, status: "failed" });
    }

    // Aprovar: dá o privilégio a sério — sandbox ou não, isto é uma
    // transferência bancária confirmada por uma pessoa, não pelo M-Pesa.
    // "both" acontece quando o cliente pagou destaque + plano juntos numa
    // única cobrança (ver PaymentItem em registo-empresa/page.tsx).
    if (tx.item_type === "plan" || tx.item_type === "both") {
        await activatePlan(adminClient, tx.user_id, tx.plan_name);
    }
    if (tx.item_type === "highlight" || tx.item_type === "both") {
        await adminClient.from("companies").update({ is_featured: true }).eq("user_id", tx.user_id);
    }

    const { error: completedError } = await adminClient.from("payment_transactions")
        .update({ status: "completed", completed_at: new Date().toISOString() })
        .eq("id", id);
    if (completedError) {
        console.error("Erro ao aprovar comprovativo:", completedError);
        return NextResponse.json({ error: "O plano foi processado, mas não foi possível guardar a aprovação." }, { status: 500 });
    }

    return NextResponse.json({ success: true, status: "completed" });
}
