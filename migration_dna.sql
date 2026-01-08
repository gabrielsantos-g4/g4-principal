-- ==============================================================================
-- MIGRATION: ADD COMPANY DNA FIELDS
-- Adiciona colunas para o DNA da Empresa na tabela main_empresas
-- ==============================================================================

alter table public.main_empresas
add column if not exists company_website text,
add column if not exists useful_links text, -- Multi-line text
add column if not exists ideal_customer_profile text,
add column if not exists brand_voice text;

-- Comentários para documentação (opcional)
comment on column public.main_empresas.useful_links is 'One link per line (social media, resources, etc.)';
comment on column public.main_empresas.ideal_customer_profile is 'Description of size, industry, role, pain points, budget';
comment on column public.main_empresas.brand_voice is 'Tone, style, language, personality';
