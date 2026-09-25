-- Script de Atualização dos Indicadores Macroeconómicos Oficiais do Sector Agrário
-- Projeto: Base de Dados Agro (Moçambique 2025/2026)

-- 1. Atualizar Tabela: dashboard_indicators (Hero & Sidebar)
INSERT INTO public.dashboard_indicators (slug, title, value, trend, location)
VALUES 
  ('hero-companies', 'Directório de Empresas', '950+', 'Mais de 950 empresas ativas no mercado', 'hero'),
  ('hero-production', 'Produção Agrária 2025/2026', '20M+', '+5% de crescimento anual', 'hero'),
  ('hero-economy', 'PIB Agrícola (Q2 2025)', '91.4B', '24% do PIB Nacional', 'hero'),
  ('hero-jobs', 'Emprego Agrícola', '70%', '70% da força laboral nacional', 'hero'),
  ('sidebar-companies', 'Empresas Ativas', '950+', 'Insumos, Tech e Serviços', 'sidebar'),
  ('sidebar-production', 'Produção Anual', '20M+ Tons', 'Crescimento +5%', 'sidebar'),
  ('sidebar-economy', 'PIB Agrícola', '91.4B MZN', '24% do PIB Nacional', 'sidebar')
ON CONFLICT (slug) 
DO UPDATE SET 
  title = EXCLUDED.title,
  value = EXCLUDED.value,
  trend = EXCLUDED.trend,
  location = EXCLUDED.location;

-- 2. Inserir/Atualizar Estatísticas Agregadas em agricultural_stats
INSERT INTO public.agricultural_stats (category, province, label, value, variation, year)
VALUES
  ('empresas', 'Todas', 'Empresas Ativas Cadastradas', 950, 8.5, '2025'),
  ('producao', 'Todas', 'Produção Agrária Total (Toneladas)', 20000000, 5.0, '2025'),
  ('economia', 'Todas', 'PIB Agrícola (Milhões de MZN)', 91400, 4.2, '2025'),
  ('emprego', 'Todas', 'Participação na Força Laboral (%)', 70, 0.0, '2025')
ON CONFLICT DO NOTHING;
