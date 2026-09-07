-- Registo de SMS enviados e recebidos (via httpSMS). Os enviados vêm do
-- ecrã Painel -> Interações -> Enviar SMS; os recebidos chegam pelo webhook
-- /api/sms/incoming que o httpSMS chama quando o telemóvel recebe um SMS.
CREATE TABLE IF NOT EXISTS basededados.sms_messages (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    direction text NOT NULL CHECK (direction IN ('outbound', 'inbound')),
    phone text NOT NULL,              -- a outra parte: destinatário (out) / remetente (in)
    from_phone text,                  -- número do gateway usado / que recebeu
    content text NOT NULL,
    status text NOT NULL DEFAULT 'sent',   -- sent | failed | sent_mock | received
    provider_id text,                -- message_id no httpSMS (evita duplicar no webhook)
    sent_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_sms_messages_created
    ON basededados.sms_messages (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_sms_messages_direction
    ON basededados.sms_messages (direction, created_at DESC);
CREATE UNIQUE INDEX IF NOT EXISTS idx_sms_messages_provider
    ON basededados.sms_messages (provider_id) WHERE provider_id IS NOT NULL;

ALTER TABLE basededados.sms_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "SMS msgs só service role" ON basededados.sms_messages;
CREATE POLICY "SMS msgs só service role" ON basededados.sms_messages
    FOR ALL TO service_role
    USING (true)
    WITH CHECK (true);

NOTIFY pgrst, 'reload schema';
