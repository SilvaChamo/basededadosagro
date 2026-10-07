-- Redes sociais das empresas (Facebook, Instagram, LinkedIn, X, YouTube, TikTok, WhatsApp).
-- Preenchida pela recolha automática (scripts/scrapegraph) apenas quando está vazia.
-- Formato: {"facebook": "https://...", "linkedin": "https://..."}
-- NÃO APLICADA AUTOMATICAMENTE — aplicar só com autorização.

ALTER TABLE public.companies
  ADD COLUMN IF NOT EXISTS social_links jsonb NOT NULL DEFAULT '{}'::jsonb;
