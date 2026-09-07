-- Registo de e-mails individuais (Painel -> Interações -> E-mails). Os
-- enviados vêm do compositor individual (/api/emails/send); os recebidos
-- são sincronizados por IMAP da conta admin@basededadosagro.com. As
-- campanhas continuam noutra tabela (email_campaigns).
CREATE TABLE IF NOT EXISTS basededados.email_messages (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    direction text NOT NULL CHECK (direction IN ('outbound', 'inbound')),
    address text NOT NULL,             -- a outra parte: "para" (out) / "de" (in)
    from_address text,                 -- remetente usado (out) / caixa que recebeu (in)
    cc text,                           -- lista separada por vírgulas
    bcc text,                          -- lista separada por vírgulas (só outbound)
    subject text NOT NULL DEFAULT '(sem assunto)',
    html text,                         -- corpo em HTML
    snippet text,                      -- resumo em texto simples para a lista
    status text NOT NULL DEFAULT 'sent',   -- sent | failed | sent_mock | received
    detail text,                      -- erro SMTP / nota
    provider_id text,                 -- Message-ID (evita duplicar no sync IMAP)
    attachments jsonb NOT NULL DEFAULT '[]'::jsonb,
    read_at timestamptz,
    deleted_at timestamptz,
    sent_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_email_messages_created
    ON basededados.email_messages (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_email_messages_box
    ON basededados.email_messages (direction, deleted_at, created_at DESC);
CREATE UNIQUE INDEX IF NOT EXISTS idx_email_messages_provider
    ON basededados.email_messages (provider_id) WHERE provider_id IS NOT NULL;

ALTER TABLE basededados.email_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Email msgs só service role" ON basededados.email_messages;
CREATE POLICY "Email msgs só service role" ON basededados.email_messages
    FOR ALL TO service_role
    USING (true)
    WITH CHECK (true);

NOTIFY pgrst, 'reload schema';
