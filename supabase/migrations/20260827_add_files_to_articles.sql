-- Documentos "nativos" (sem link externo) precisam de poder anexar os
-- próprios ficheiros (PDF, Word, etc.) para download na página pública —
-- até agora só existia image_url (capa) e source_url (link externo).
ALTER TABLE basededados.articles
    ADD COLUMN IF NOT EXISTS files text[] DEFAULT '{}';
