-- Permite atribuir múltiplas categorias a uma notícia/artigo.
-- `type` mantém-se como categoria principal (compatibilidade com badges e
-- filtros existentes); `categories` guarda o conjunto completo selecionado
-- no editor. Para artigos já existentes, replica-se `type` para `categories`
-- para não perderem a categorização actual.

ALTER TABLE basededados.articles ADD COLUMN IF NOT EXISTS categories text[] DEFAULT '{}';

UPDATE basededados.articles
SET categories = ARRAY[type]
WHERE type IS NOT NULL AND (categories IS NULL OR array_length(categories, 1) IS NULL);
