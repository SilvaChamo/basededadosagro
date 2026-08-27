-- Estado editorial escolhido no editor (Documentos e Notícias), independente
-- da coluna de ciclo de vida `status` (active/archived/deleted, usada nas
-- listas do admin):
--   NULL ou 'published' -> publicado, visível no site público
--   'review'            -> pendente para revisão (escondido do público)
--   'draft'             -> rascunho (escondido do público)
--
-- Continua a aparecer nas listas do admin (o admin não filtra por esta
-- coluna) para poder ser revisto e publicado mais tarde.
ALTER TABLE basededados.articles
    ADD COLUMN IF NOT EXISTS publish_status text;

CREATE INDEX IF NOT EXISTS idx_articles_publish_status
    ON basededados.articles (publish_status);
