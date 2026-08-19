-- Acompanha cada tentativa de pagamento M-Pesa, desde o pedido (STK Push)
-- até à confirmação — necessário porque o pedido inicial ao M-Pesa só
-- confirma que o pedido foi ENVIADO ao telemóvel, não que foi pago; a
-- confirmação real vem depois, consultada por queryTransactionStatus.
CREATE TABLE IF NOT EXISTS basededados.payment_transactions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    reference text NOT NULL UNIQUE,
    plan_name text NOT NULL,
    amount numeric NOT NULL,
    phone text,
    status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
    provider_response jsonb,
    created_at timestamptz NOT NULL DEFAULT now(),
    completed_at timestamptz
);

CREATE INDEX IF NOT EXISTS idx_payment_transactions_user_id ON basededados.payment_transactions (user_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_reference ON basededados.payment_transactions (reference);

ALTER TABLE basededados.payment_transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Dono pode ver e criar as suas transacções" ON basededados.payment_transactions;
CREATE POLICY "Dono pode ver e criar as suas transacções" ON basededados.payment_transactions
    FOR ALL TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Escrita admin (service role)" ON basededados.payment_transactions;
CREATE POLICY "Escrita admin (service role)" ON basededados.payment_transactions
    FOR ALL TO service_role
    USING (true)
    WITH CHECK (true);

NOTIFY pgrst, 'reload schema';
