-- Extras da tabela de SMS: motivo de falha (detail) e eliminação suave
-- (deleted_at, para o separador "Eliminadas" do painel).
ALTER TABLE basededados.sms_messages ADD COLUMN IF NOT EXISTS detail text;
ALTER TABLE basededados.sms_messages ADD COLUMN IF NOT EXISTS deleted_at timestamptz;

CREATE INDEX IF NOT EXISTS idx_sms_messages_live
    ON basededados.sms_messages (direction, created_at DESC) WHERE deleted_at IS NULL;

NOTIFY pgrst, 'reload schema';
