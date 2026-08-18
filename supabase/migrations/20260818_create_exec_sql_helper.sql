-- Função auxiliar para permitir correr SQL arbitrário a partir do
-- Supabase JS client via `supabase.rpc('exec_sql', { sql })`, tal como já é
-- assumido (mas nunca de facto definido nesta instância) pelos scripts do
-- projecto irmão `visualdesign` (ex: scratch/apply-backup-migrations.mjs).
--
-- SECURITY DEFINER faz esta função correr com os privilégios de quem a
-- criou (equivalente a superuser nesta instância self-hosted) — por isso é
-- crítico restringir EXECUTE só ao `service_role` (chave secreta usada
-- apenas no backend, nunca exposta ao browser). Sem essa restrição,
-- qualquer pedido feito com a chave `anon` conseguiria correr SQL arbitrário
-- na base de dados inteira.
CREATE OR REPLACE FUNCTION public.exec_sql(sql text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    EXECUTE sql;
END;
$$;

REVOKE ALL ON FUNCTION public.exec_sql(text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.exec_sql(text) FROM anon;
REVOKE ALL ON FUNCTION public.exec_sql(text) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.exec_sql(text) TO service_role;

NOTIFY pgrst, 'reload schema';
