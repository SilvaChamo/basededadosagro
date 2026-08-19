-- Segunda ronda de correcções de RLS na basededadosagro, depois de uma
-- auditoria completa a todas as políticas do schema `basededados`.
--
-- 1) CRÍTICO: "Dono pode gerir o proprio perfil" (profiles, uid()=id, ALL,
--    sem restrição de coluna) permitia a qualquer utilizador autenticado
--    mudar a sua própria `role` para 'admin' ou o seu `plan` para Premium
--    com um UPDATE directo — sem passar pelo painel admin nem pelo
--    pagamento M-Pesa. Um trigger agora repõe estas duas colunas ao valor
--    antigo sempre que quem escreve não é o service_role.
CREATE OR REPLACE FUNCTION basededados.protect_privileged_profile_columns()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    IF auth.role() IS DISTINCT FROM 'service_role' THEN
        NEW.role := OLD.role;
        NEW.plan := OLD.plan;
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS protect_privileged_profile_columns_trigger ON basededados.profiles;
CREATE TRIGGER protect_privileged_profile_columns_trigger
BEFORE UPDATE ON basededados.profiles
FOR EACH ROW
EXECUTE FUNCTION basededados.protect_privileged_profile_columns();

-- 2) forum_comments / forum_topics: a política de INSERT só verificava
--    role()='authenticated' (qualquer sessão válida), nunca uid()=user_id
--    — um utilizador conseguia publicar um comentário/tópico com o
--    user_id de outra pessoa (personificação).
DROP POLICY IF EXISTS "Autenticados criam comentarios" ON basededados.forum_comments;
CREATE POLICY "Autenticados criam comentarios" ON basededados.forum_comments
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Autenticados criam topicos" ON basededados.forum_topics;
CREATE POLICY "Autenticados criam topicos" ON basededados.forum_topics
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- 3) articles_pending: "authenticated_read"/"authenticated_delete" não
--    tinham restrição nenhuma — qualquer conta (não só a equipa
--    editorial) conseguia ver e apagar a fila de notícias por rever.
--    Mesmo critério já usado em articles.
DROP POLICY IF EXISTS "authenticated_read" ON basededados.articles_pending;
CREATE POLICY "authenticated_read" ON basededados.articles_pending
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM basededados.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role IN ('admin', 'editor', 'contribuidor')
        )
    );

DROP POLICY IF EXISTS "authenticated_delete" ON basededados.articles_pending;
CREATE POLICY "authenticated_delete" ON basededados.articles_pending
    FOR DELETE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM basededados.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role IN ('admin', 'editor', 'contribuidor')
        )
    );
