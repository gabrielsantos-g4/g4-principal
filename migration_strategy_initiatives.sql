-- ==============================================================================
-- MIGRATION: STRATEGY INITIATIVES
-- Tabela para armazenar os cards do Dashboard de Estratégia
-- ==============================================================================

create table if not exists public.strategy_initiatives (
  id uuid not null default gen_random_uuid(),
  empresa_id uuid not null, -- Vinculo com a empresa (Obrigatório)
  
  title text not null,
  funnel_stage text not null, -- ToFu, MoFu, BoFu
  channel text not null,      -- Organic, Paid, Outreach
  
  link text null,             -- Link de destino
  image_url text null,        -- Imagem de capa
  responsible_image_url text null, -- Foto do responsável
  description text null,      -- Descrição opcional
  
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  
  constraint strategy_initiatives_pkey primary key (id),
  constraint strategy_initiatives_empresa_id_fkey foreign key (empresa_id) references public.main_empresas(id) on delete cascade
);

-- Indices
create index if not exists idx_strategy_initiatives_empresa_id on public.strategy_initiatives(empresa_id);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ==============================================================================

alter table public.strategy_initiatives enable row level security;

-- Policy: Ver apenas da própria empresa
drop policy if exists "Users can view own company initiatives" on public.strategy_initiatives;
create policy "Users can view own company initiatives" on public.strategy_initiatives
  for select using (
    empresa_id in (
      select empresa_id from public.main_profiles
      where id = auth.uid()
    )
  );

-- Policy: Inserir apenas na própria empresa
drop policy if exists "Users can insert own company initiatives" on public.strategy_initiatives;
create policy "Users can insert own company initiatives" on public.strategy_initiatives
  for insert with check (
    empresa_id in (
      select empresa_id from public.main_profiles
      where id = auth.uid()
    )
  );
  
-- Policy: Atualizar apenas da própria empresa
drop policy if exists "Users can update own company initiatives" on public.strategy_initiatives;
create policy "Users can update own company initiatives" on public.strategy_initiatives
  for update using (
    empresa_id in (
      select empresa_id from public.main_profiles
      where id = auth.uid()
    )
  );

-- Policy: Deletar apenas da própria empresa
drop policy if exists "Users can delete own company initiatives" on public.strategy_initiatives;
create policy "Users can delete own company initiatives" on public.strategy_initiatives
  for delete using (
    empresa_id in (
      select empresa_id from public.main_profiles
      where id = auth.uid()
    )
  );
