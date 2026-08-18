-- Índices em falta nas colunas realmente usadas em filtros/ordenação —
-- nenhuma destas tabelas tinha índice além da chave primária, por isso
-- qualquer filtro por estas colunas força um sequential scan na tabela
-- toda. É a causa mais provável da lentidão específica desta app: outros
-- sites no mesmo Supabase não têm este padrão de queries.
--
-- Verificado directamente na base de dados em produção (via REST API,
-- coluna a coluna, e cruzado com todos os pontos do código onde cada
-- tabela é filtrada/ordenada) antes de escrever isto — não assumido a
-- partir do nome de migrações antigas. Duas correcções face à primeira
-- versão desta migração, que tinha colunas erradas nunca confirmadas:
--   - companies não tem `deleted_at`; usa `is_archived`/`is_deleted` (bool)
--   - properties não tem `user_id`; usa `deleted_at`/`status`/`company_id`
-- Todas as 6 tabelas abaixo vivem exclusivamente no schema `basededados`
-- (confirmado: nenhuma existe em `public`, que pertence a outro site
-- alojado no mesmo Supabase) — por isso o schema é fixo, sem adivinhação
-- nem risco de indexar por engano uma tabela de outro projecto.
DO $$
DECLARE
    idx record;
BEGIN
    FOR idx IN
        SELECT * FROM (VALUES
            ('articles', 'deleted_at'),
            ('articles', 'status'),
            ('articles', 'created_at'),
            ('articles', 'date'),
            ('articles', 'type'),
            ('articles', 'slug'),
            ('articles_pending', 'date'),
            ('companies', 'user_id'),
            ('companies', 'is_archived'),
            ('companies', 'is_deleted'),
            ('companies', 'created_at'),
            ('companies', 'slug'),
            ('companies', 'type'),
            ('companies', 'is_featured'),
            ('products', 'company_id'),
            ('products', 'user_id'),
            ('products', 'created_at'),
            ('professionals', 'status'),
            ('professionals', 'user_id'),
            ('professionals', 'created_at'),
            ('properties', 'deleted_at'),
            ('properties', 'status'),
            ('properties', 'company_id'),
            ('properties', 'created_at')
        ) AS t(tbl, col)
    LOOP
        IF EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_schema = 'basededados'
              AND table_name = idx.tbl
              AND column_name = idx.col
        ) THEN
            EXECUTE format(
                'CREATE INDEX IF NOT EXISTS %I ON basededados.%I (%I)',
                'idx_' || idx.tbl || '_' || idx.col,
                idx.tbl, idx.col
            );
        END IF;
    END LOOP;
END $$;

NOTIFY pgrst, 'reload schema';
