-- Envio de campanhas um-a-um (deixa de ser BCC): contadores de entrega
-- por campanha para o resumo não ter de somar os logs todos, e novo
-- estado 'parcial' (parte entregou, parte falhou).

ALTER TABLE email_campaigns ADD COLUMN IF NOT EXISTS delivered_count INTEGER DEFAULT 0;
ALTER TABLE email_campaigns ADD COLUMN IF NOT EXISTS failed_count INTEGER DEFAULT 0;

ALTER TABLE email_campaigns DROP CONSTRAINT IF EXISTS email_campaigns_status_check;
ALTER TABLE email_campaigns ADD CONSTRAINT email_campaigns_status_check
    CHECK (status IN ('rascunho', 'agendada', 'enviando', 'enviada', 'falhada', 'parcial'));
