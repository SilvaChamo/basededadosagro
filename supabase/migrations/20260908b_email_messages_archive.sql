-- "Arquivar" um e-mail recebido: tira-o da Entrada sem o eliminar.
ALTER TABLE basededados.email_messages
    ADD COLUMN IF NOT EXISTS archived_at timestamptz;

CREATE INDEX IF NOT EXISTS idx_email_messages_archived
    ON basededados.email_messages (archived_at)
    WHERE archived_at IS NOT NULL;

NOTIFY pgrst, 'reload schema';
