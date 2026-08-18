-- Tags livres por artigo/notícia (diferente de `categories`: tags são texto
-- livre digitado no editor, não vêm de uma lista fixa). Usadas na secção
-- "Tags" da página de leitura do artigo (app/[locale]/artigos/[slug]/page.tsx),
-- que antes mostrava valores fixos/hardcoded.

ALTER TABLE basededados.articles ADD COLUMN IF NOT EXISTS tags text[] DEFAULT '{}';

NOTIFY pgrst, 'reload schema';
