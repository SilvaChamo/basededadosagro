-- Corrige 3 falhas de RLS confirmadas por auditoria directa à base de dados
-- em 2026-08-19 (ver conversa) — todas em tabelas que o próprio código do
-- basededadosagro usa (confirmado por grep antes de aplicar isto).
--
-- Não mexe em roles/role_capabilities/role_menu_visibility/role_redirects/
-- plans/capabilities/produtos/stores/video_ads — essas não têm RLS nem estão
-- restritas, mas não são usadas pelo código deste projecto (confirmado por
-- grep) e muito provavelmente pertencem ao projecto irmão "entrecampos" na
-- mesma instância Supabase partilhada; mexer aí sem confirmar primeiro podia
-- partir esse outro site.

-- 1. articles: authenticated_insert/update/delete deixam de aceitar
-- qualquer conta autenticada e passam a exigir um perfil de admin/editor/
-- contribuidor (os únicos papéis com acesso a /admin, ver lib/roles.ts).
-- Antes disto, qualquer visitante com conta registada conseguia inserir,
-- editar ou apagar directamente qualquer notícia publicada, contornando o
-- fluxo de aprovação (Pendentes -> Editor) do painel admin.
DROP POLICY IF EXISTS "authenticated_insert" ON basededados.articles;
CREATE POLICY "authenticated_insert" ON basededados.articles
    FOR INSERT TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM basededados.profiles
            WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'editor', 'contribuidor')
        )
    );

DROP POLICY IF EXISTS "authenticated_update" ON basededados.articles;
CREATE POLICY "authenticated_update" ON basededados.articles
    FOR UPDATE TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM basededados.profiles
            WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'editor', 'contribuidor')
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM basededados.profiles
            WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'editor', 'contribuidor')
        )
    );

DROP POLICY IF EXISTS "authenticated_delete" ON basededados.articles;
CREATE POLICY "authenticated_delete" ON basededados.articles
    FOR DELETE TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM basededados.profiles
            WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'editor', 'contribuidor')
        )
    );

-- 2. deleted_presentations: a política chamava-se "Dono pode ver" mas só
-- verificava "está autenticado", não "é o dono" — qualquer utilizador
-- conseguia ver as apresentações eliminadas de qualquer outro utilizador
-- (8 linhas reais expostas neste momento). Corrigido para exigir user_id
-- = auth.uid(), igual ao padrão já usado em presentations.
DROP POLICY IF EXISTS "Dono pode ver" ON basededados.deleted_presentations;
CREATE POLICY "Dono pode ver" ON basededados.deleted_presentations
    FOR ALL TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- 3. quotations: tinha leitura pública (SELECT true, nem exigia sessão) numa
-- tabela com nome, email e telefone de quem pede orçamento. A tabela não é
-- usada em lado nenhum do código actual (grep confirma) e está vazia, por
-- isso a correcção mais segura é remover a leitura pública por agora —
-- quem construir esta funcionalidade decide depois a política certa
-- (provavelmente "dono da empresa vê os pedidos dirigidos a si").
DROP POLICY IF EXISTS "Leitura publica" ON basededados.quotations;

NOTIFY pgrst, 'reload schema';
