-- Adiciona as categorias de notícias "Ambiente" e "Mercado" (novos filtros do
-- blog) à tabela basededados.news_categories criada em
-- 20260815_news_media_and_categories.sql.

INSERT INTO basededados.news_categories (name, slug) VALUES
    ('Ambiente', 'ambiente'),
    ('Mercado', 'mercado')
ON CONFLICT (name) DO NOTHING;
