-- Galeria de multimédia do admin (app/[locale]/admin/galeria) — porta da
-- biblioteca multimédia do projecto de referência "entrecampos". Ao contrário
-- de basededados.media_library (que só regista imagens ligadas a notícias,
-- scope="noticias"), esta tabela guarda metadados (alt/título/legenda/
-- descrição) de QUALQUER ficheiro do bucket "public-assets", indexados só
-- pelo nome/caminho do ficheiro — a galeria lista o storage directamente e
-- cruza com esta tabela pelo file_name, tal como no entrecampos.
CREATE TABLE IF NOT EXISTS basededados.media_details (
    file_name text PRIMARY KEY,
    alt_text text,
    title text,
    caption text,
    description text,
    updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE basededados.media_details ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public read media_details" ON basededados.media_details;
CREATE POLICY "public read media_details" ON basededados.media_details FOR SELECT USING (true);

DROP POLICY IF EXISTS "service role manage media_details" ON basededados.media_details;
CREATE POLICY "service role manage media_details" ON basededados.media_details FOR ALL USING (auth.role() = 'service_role');

NOTIFY pgrst, 'reload schema';
