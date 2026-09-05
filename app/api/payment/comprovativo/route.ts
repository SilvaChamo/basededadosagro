import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { createAdminClient } from '@/utils/supabase/admin';

// Comprovativo de transferência bancária/Visa — ao contrário do M-Pesa, isto
// NUNCA confirma nada sozinho: fica "pending" até um admin aprovar à mão em
// /admin/pagamentos (ver app/api/admin/payment-proofs/[id]/route.ts). Usa o
// cliente admin (service_role) para o upload e a escrita, tal como o M-Pesa,
// para não depender de nenhuma política de storage no bucket do cliente.

const ALLOWED_TYPES: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
    'application/pdf': 'pdf',
};
const MAX_SIZE_BYTES = 8 * 1024 * 1024; // 8MB — a imagem já chega comprimida (<50kb); o PDF não passa por compressão.

// Nomes de plano válidos, juntando os dois sítios que enviam para aqui
// (registo-empresa e checkout/planos). Isto por si só não prova que o
// "amount" enviado é o preço certo desse plano — os dois formulários têm
// tabelas de preço próprias (e o checkout ainda soma o destaque de forma
// diferente consoante o ciclo de facturação) — mas pelo menos recusa nomes
// inventados, e o "amount" fica sempre limitado a um intervalo plausível.
// A validação definitiva continua a ser humana: o admin vê o comprovativo
// (imagem/PDF) ao lado do valor e plano reclamados antes de aprovar, em
// /admin/pagamentos — nada é atribuído sem essa aprovação.
const VALID_PLAN_NAMES = new Set(['Gratuito', 'Free', 'Básico', 'Premium', 'Business Vendedor', 'Parceiro']);
const MAX_AMOUNT = 100_000; // MT — generoso para qualquer plano/ciclo anual, recusa valores absurdos

export async function POST(request: Request) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return NextResponse.json({ error: 'É necessário iniciar sessão para enviar um comprovativo' }, { status: 401 });
        }

        const form = await request.formData();
        const file = form.get('file');
        const amount = form.get('amount');
        const planName = form.get('planName');
        const itemType = form.get('itemType');

        if (!(file instanceof File)) {
            return NextResponse.json({ error: 'Anexe um ficheiro (imagem ou PDF).' }, { status: 400 });
        }
        if (!amount || !planName || !itemType) {
            return NextResponse.json({ error: 'Faltam dados do pagamento (valor, plano ou item).' }, { status: 400 });
        }
        if (itemType !== 'plan' && itemType !== 'highlight' && itemType !== 'both') {
            return NextResponse.json({ error: 'Item de pagamento inválido.' }, { status: 400 });
        }
        if (!VALID_PLAN_NAMES.has(String(planName))) {
            return NextResponse.json({ error: 'Plano inválido.' }, { status: 400 });
        }
        const amountNumber = Number(amount);
        if (!Number.isFinite(amountNumber) || amountNumber <= 0 || amountNumber > MAX_AMOUNT) {
            return NextResponse.json({ error: 'Valor de pagamento inválido.' }, { status: 400 });
        }
        const ext = ALLOWED_TYPES[file.type];
        if (!ext) {
            return NextResponse.json({ error: 'Formato não suportado. Envie uma imagem (JPG, PNG, WebP) ou um PDF.' }, { status: 400 });
        }
        if (file.size > MAX_SIZE_BYTES) {
            return NextResponse.json({ error: 'Ficheiro demasiado grande (máximo 8MB).' }, { status: 400 });
        }

        const adminClient = createAdminClient();
        const path = `comprovativos/${user.id}-${Date.now()}.${ext}`;
        const bytes = new Uint8Array(await file.arrayBuffer());

        const { error: uploadError } = await adminClient.storage
            .from('public-assets')
            .upload(path, bytes, { contentType: file.type, upsert: false });
        if (uploadError) {
            console.error('Erro ao guardar comprovativo:', uploadError);
            return NextResponse.json({ error: 'Não foi possível guardar o ficheiro.' }, { status: 500 });
        }

        const { data: { publicUrl } } = adminClient.storage.from('public-assets').getPublicUrl(path);
        const reference = `COMP${Date.now().toString(36).toUpperCase()}${Math.random().toString(36).slice(2, 6).toUpperCase()}`;

        const { error: insertError } = await adminClient.from('payment_transactions').insert({
            user_id: user.id,
            reference,
            plan_name: String(planName),
            amount: Number(amount) || 0,
            phone: null,
            status: 'pending',
            method: 'visa',
            item_type: itemType,
            receipt_url: publicUrl,
        });
        if (insertError) {
            console.error('Erro ao registar comprovativo:', insertError);
            return NextResponse.json({ error: 'Ficheiro guardado, mas houve um erro ao registar o pedido. Tente novamente.' }, { status: 500 });
        }

        return NextResponse.json({ success: true, reference });
    } catch (error: any) {
        console.error('Erro ao processar comprovativo:', error);
        return NextResponse.json({ error: error.message || 'Erro interno' }, { status: 500 });
    }
}
