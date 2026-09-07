import { NextResponse } from "next/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { createClient } from "@/utils/supabase/server";
import { isAdminRole } from "@/lib/roles";
import { sendSMS, smsIsDryRun } from "@/lib/sms/send";

// Envio de SMS a partir do painel (Interações -> Enviar SMS). Só admin.
// Destinatários: inscritos (profiles.sms_notifications = true, com filtro
// opcional por província/distrito) ou uma lista de números colada à mão.

const MAX_RECIPIENTS = 300;      // trava de segurança por envio
const SEND_SPACING_MS = 250;     // pausa entre chamadas à API do httpSMS

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

function normalizePhone(raw: string): string | null {
    const digits = String(raw).replace(/[^\d+]/g, "").replace(/(?!^)\+/g, "");
    const only = digits.replace(/\D/g, "");
    if (only.length < 9) return null;
    if (digits.startsWith("+")) return digits;
    if (only.length === 9) return `+258${only}`;      // número moçambicano sem indicativo
    return `+${only}`;
}

export async function POST(request: Request) {
    // Auth: sessão + role admin.
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return NextResponse.json({ error: "É necessário iniciar sessão" }, { status: 401 });
    }

    let admin;
    try {
        admin = createAdminClient();
    } catch {
        return NextResponse.json({ error: "Configuração do servidor incompleta" }, { status: 500 });
    }

    const { data: profile } = await admin
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();
    if (!isAdminRole(profile?.role)) {
        return NextResponse.json({ error: "Apenas administradores" }, { status: 403 });
    }

    try {
        const body = await request.json();
        const message = String(body.message || "").trim();
        const mode = body.mode === "manual" ? "manual" : "subscribers";

        if (!message) {
            return NextResponse.json({ error: "Escreva a mensagem." }, { status: 400 });
        }
        if (message.length > 700) {
            return NextResponse.json({ error: "Mensagem demasiado longa (máx. 700 caracteres)." }, { status: 400 });
        }

        // 1. Resolver a lista de números.
        let phones: string[] = [];

        if (mode === "manual") {
            const raw: string[] = Array.isArray(body.numbers)
                ? body.numbers
                : String(body.numbers || "").split(/[\s,;\n]+/);
            phones = raw.map(normalizePhone).filter((p): p is string => !!p);
        } else {
            let query = admin
                .from("profiles")
                .select("phone")
                .eq("sms_notifications", true)
                .not("phone", "is", null);

            const province = String(body.province || "").replace(/[^\p{L}\p{N}\s-]/gu, "").trim().slice(0, 60);
            const district = String(body.district || "").replace(/[^\p{L}\p{N}\s-]/gu, "").trim().slice(0, 60);
            if (province) query = query.ilike("province", `%${province}%`);
            if (district) query = query.ilike("district", `%${district}%`);

            const { data: subs, error } = await query;
            if (error) throw error;
            phones = (subs || []).map((s: { phone: string | null }) => normalizePhone(s.phone || "")).filter((p): p is string => !!p);
        }

        // Dedupe.
        phones = Array.from(new Set(phones));

        if (phones.length === 0) {
            return NextResponse.json({ error: "Nenhum número válido para enviar." }, { status: 400 });
        }
        if (phones.length > MAX_RECIPIENTS) {
            return NextResponse.json(
                { error: `Máximo de ${MAX_RECIPIENTS} destinatários por envio (tens ${phones.length}). Divide em lotes.` },
                { status: 400 },
            );
        }

        // 2. Enviar em série, com pausa curta, e registar cada um.
        let sent = 0;
        let failed = 0;
        const rows: Array<Record<string, unknown>> = [];

        for (const phone of phones) {
            const r = await sendSMS(phone, message);
            if (r.status === "failed") failed++;
            else sent++;
            rows.push({
                direction: "outbound",
                phone,
                from_phone: r.from ?? null,
                content: message,
                status: r.status,
                sent_by: user.id,
            });
            if (phones.length > 1) await sleep(SEND_SPACING_MS);
        }

        if (rows.length) {
            const { error: logErr } = await admin.from("sms_messages").insert(rows);
            if (logErr) console.error("sms/send: falha ao registar", logErr.message);
        }

        return NextResponse.json({
            ok: true,
            total: phones.length,
            sent,
            failed,
            dryRun: smsIsDryRun(),
        });
    } catch (err) {
        console.error("sms/send error:", err);
        return NextResponse.json({ error: "Não foi possível enviar." }, { status: 500 });
    }
}
