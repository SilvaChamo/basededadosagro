-- Aprovação manual de comprovativos de pagamento (transferência bancária).
-- Reaproveita a tabela payment_transactions já usada pelo M-Pesa, só
-- acrescentando o que falta para também cobrir este método manual.

ALTER TABLE basededados.payment_transactions
    ADD COLUMN IF NOT EXISTS method text NOT NULL DEFAULT 'mpesa' CHECK (method IN ('mpesa', 'visa')),
    ADD COLUMN IF NOT EXISTS item_type text CHECK (item_type IN ('plan', 'highlight', 'both')),
    ADD COLUMN IF NOT EXISTS receipt_url text;

CREATE INDEX IF NOT EXISTS idx_payment_transactions_method_status
    ON basededados.payment_transactions (method, status);

-- O admin precisa de ver TODAS as transacções pendentes (não só as suas
-- próprias) para as poder aprovar/rejeitar a partir do painel. A política
-- já existente ("Dono pode ver e criar as suas transacções") só deixa cada
-- utilizador ver as dele — esta soma-se, não substitui.
DROP POLICY IF EXISTS "Admin pode ver todas as transacções" ON basededados.payment_transactions;
CREATE POLICY "Admin pode ver todas as transacções" ON basededados.payment_transactions
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM basededados.profiles
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        )
    );

NOTIFY pgrst, 'reload schema';
