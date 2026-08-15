-- Galeria de imagens e categorias geridas para a Central de Notícias.
-- NOTA: os clientes Supabase deste projecto (utils/supabase/admin.ts e
-- utils/supabase/client.ts) apontam sempre para o schema "basededados"
-- (db: { schema: 'basededados' }), não "public". As tabelas têm de viver
-- nesse schema para serem visíveis via supabase.from(...).

-- Categorias de notícias (substitui a constante CATEGORIES hardcoded no código)
CREATE TABLE IF NOT EXISTS basededados.news_categories (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL UNIQUE,
    slug text NOT NULL UNIQUE,
    created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE basededados.news_categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public read news_categories" ON basededados.news_categories;
CREATE POLICY "public read news_categories" ON basededados.news_categories FOR SELECT USING (true);

DROP POLICY IF EXISTS "service role manage news_categories" ON basededados.news_categories;
CREATE POLICY "service role manage news_categories" ON basededados.news_categories FOR ALL USING (auth.role() = 'service_role');

INSERT INTO basededados.news_categories (name, slug) VALUES
    ('Notícia', 'noticia'),
    ('Guia', 'guia'),
    ('Dicas', 'dicas'),
    ('Internacional', 'internacional'),
    ('Evento', 'evento'),
    ('Oportunidade', 'oportunidade'),
    ('Curiosidade', 'curiosidade'),
    ('Recursos', 'recursos'),
    ('Mulher Agro', 'mulher-agro')
ON CONFLICT (name) DO NOTHING;

-- Galeria real de imagens de notícias (metadados sobre os ficheiros no bucket
-- "public-assets": a que notícia pertencem, texto alternativo, legenda, etc.)
CREATE TABLE IF NOT EXISTS basededados.media_library (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    bucket text NOT NULL DEFAULT 'public-assets',
    path text NOT NULL,
    url text NOT NULL,
    filename text NOT NULL,
    size bigint,
    mime_type text,
    alt_text text,
    caption text,
    scope text NOT NULL DEFAULT 'noticias',
    article_id uuid REFERENCES basededados.articles(id) ON DELETE SET NULL,
    uploaded_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    UNIQUE (bucket, path)
);

CREATE INDEX IF NOT EXISTS media_library_scope_idx ON basededados.media_library(scope);
CREATE INDEX IF NOT EXISTS media_library_article_idx ON basededados.media_library(article_id);

ALTER TABLE basededados.media_library ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "service role manage media_library" ON basededados.media_library;
CREATE POLICY "service role manage media_library" ON basededados.media_library FOR ALL USING (auth.role() = 'service_role');
