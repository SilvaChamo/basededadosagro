-- Constraint UNIQUE em companies.user_id.
--
-- Sem isto, qualquer `INSERT ... ON CONFLICT (user_id)` (o upsert do
-- supabase-js com { onConflict: 'user_id' }) rebenta com:
--   "there is no unique or exclusion constraint matching the ON CONFLICT
--    specification"
-- — foi o erro que impedia gravar a empresa em /registo-empresa e fazia o
-- upsert do /checkout falhar em silêncio.
--
-- Seguro de aplicar: a coluna já é única entre os valores não-nulos (as
-- empresas importadas/semente têm user_id NULL, e UNIQUE trata NULLs como
-- distintos, por isso continuam a poder coexistir).
--
-- Idempotente — pode correr mais do que uma vez sem erro.

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'companies_user_id_key'
          AND conrelid = 'basededados.companies'::regclass
    ) THEN
        ALTER TABLE basededados.companies
            ADD CONSTRAINT companies_user_id_key UNIQUE (user_id);
    END IF;
END $$;

NOTIFY pgrst, 'reload schema';
