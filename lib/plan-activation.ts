import type { createAdminClient } from "@/utils/supabase/admin";

type AdminClient = ReturnType<typeof createAdminClient>;

// Validade do plano a partir do ciclo de facturação da empresa, com uma
// pequena tolerância (3 dias) para o cliente renovar sem perder acesso à
// justa. Não há renovação automática — passada a data, o plano volta a
// Gratuito (ver hooks/usePlanPermissions.ts) até nova aprovação.
export function planExpiryFor(billingPeriod: string | null | undefined): string {
    const annual = String(billingPeriod || "").toLowerCase() === "annual";
    const d = new Date();
    d.setDate(d.getDate() + (annual ? 365 + 3 : 30 + 3));
    return d.toISOString();
}

// Concede o plano ao utilizador com data de validade.
// `profiles` é a fonte de verdade da expiração (coluna protegida por
// trigger contra escrita de quem não é service_role); `companies` leva a
// mesma data só para exibição no painel.
export async function grantPlanWithExpiry(
    admin: AdminClient,
    userId: string,
    planName: string,
): Promise<string> {
    const { data: company } = await admin
        .from("companies")
        .select("billing_period")
        .eq("user_id", userId)
        .maybeSingle();

    const expiresAt = planExpiryFor(company?.billing_period);

    await admin.from("profiles").update({ plan: planName, plan_expires_at: expiresAt }).eq("id", userId);
    await admin.from("companies").update({ plan: planName, plan_expires_at: expiresAt }).eq("user_id", userId);

    return expiresAt;
}
