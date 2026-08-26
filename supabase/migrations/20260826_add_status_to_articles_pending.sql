-- Permite arquivar notícias pendentes (tirar da vista principal sem
-- eliminar), tal como já existe para articles publicados.
ALTER TABLE basededados.articles_pending
    ADD COLUMN IF NOT EXISTS status text DEFAULT 'active';
