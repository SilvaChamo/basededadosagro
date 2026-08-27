-- O formulário de artigos já geria "tags" há muito tempo, mas a coluna
-- nunca chegou a existir na tabela real — cada guardar falhava com
-- "Could not find the 'tags' column of 'articles' in the schema cache".
ALTER TABLE basededados.articles
    ADD COLUMN IF NOT EXISTS tags text[] DEFAULT '{}';
