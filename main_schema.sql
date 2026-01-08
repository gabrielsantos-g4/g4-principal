-- ==============================================================================
-- MIGRATION: MAIN APP SCHEMA
-- Criação das tabelas principais para a arquitetura modular
-- ==============================================================================

-- 1. Tabela main_empresas
create table if not exists public.main_empresas (
  id uuid not null default gen_random_uuid (),
  name text not null,
  slug text null, -- para urls amigáveis das empresas (ex: app.com/g4-educacao)
  
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  
  constraint main_empresas_pkey primary key (id)
);

-- Indice para slug (opcional, mas recomendado)
create unique index if not exists idx_main_empresas_slug on public.main_empresas (slug);


-- 2. Tabela main_profiles
create table if not exists public.main_profiles (
  id uuid not null, -- Vinculado 1:1 com auth.users
  empresa_id uuid null, -- Empresa principal (pode ser null se o user for convidado depois)
  name text null,
  role text not null default 'member', -- admin, member, owner
  avatar_url text null,
  
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  
  constraint main_profiles_pkey primary key (id),
  constraint main_profiles_id_fkey foreign key (id) references auth.users (id) on delete cascade,
  constraint main_profiles_empresa_id_fkey foreign key (empresa_id) references public.main_empresas (id) on delete set null
);

-- Indice para FK
create index if not exists idx_main_profiles_empresa_id on public.main_profiles(empresa_id);


-- ==============================================================================
-- 3. ROW LEVEL SECURITY (RLS)
-- ==============================================================================

alter table public.main_empresas enable row level security;
alter table public.main_profiles enable row level security;

-- Policies: main_profiles
-- Usuário vê o próprio perfil
create policy "Users can view own profile" on public.main_profiles
  for select using (auth.uid() = id);

-- Usuário atualiza o próprio perfil
create policy "Users can update own profile" on public.main_profiles
  for update using (auth.uid() = id);


-- Policies: main_empresas
-- Usuário vê a empresa a qual está vinculado
create policy "Users can view own empresa" on public.main_empresas
  for select using (
    id in (
      select empresa_id from public.main_profiles 
      where id = auth.uid()
    )
  );
  
-- Admin da empresa pode editar dados da empresa
create policy "Admins can update own empresa" on public.main_empresas
  for update using (
    id in (
      select empresa_id from public.main_profiles 
      where id = auth.uid() and role = 'admin'
    )
  );

-- ==============================================================================
-- 4. ADAPTAÇÃO DA TRIGGER DE NOVO USUÁRIO (Opcional - Migração)
-- ==============================================================================

-- Esta função substitui ou complementa a lógica antiga de criar ads_profiles.
-- RECOMENDAÇÃO: Rode este bloco apenas se quiser que novos cadastros JÁ usem a estrutura nova.

create or replace function public.handle_new_user_main()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  new_empresa_id uuid;
begin
  -- 1. Cria a empresa na tabela MAIN
  insert into public.main_empresas (name)
  values (coalesce(new.raw_user_meta_data->>'company_name', 'Minha Empresa'))
  returning id into new_empresa_id;

  -- 2. Cria o perfil na tabela MAIN
  insert into public.main_profiles (id, empresa_id, name, role)
  values (new.id, new_empresa_id, coalesce(new.raw_user_meta_data->>'full_name', 'Novo Usuário'), 'admin');

  -- 3. (Legado Compatibility) Mantém a criação nas tabelas antigas para não quebrar o módulo ADS
  -- Se você for migrar totalmente via código, isso pode ser removido depois.
  insert into public.ads_empresas (id, name)
  values (new_empresa_id, coalesce(new.raw_user_meta_data->>'company_name', 'Minha Empresa'));
  
  insert into public.ads_profiles (id, empresa_id, name, role)
  values (new.id, new_empresa_id, coalesce(new.raw_user_meta_data->>'full_name', 'Novo Usuário'), 'admin');

  return new;
end;
$$;

-- Para ativar a nova trigger, descomente as linhas abaixo:
-- drop trigger if exists on_auth_user_created on auth.users;
-- create trigger on_auth_user_created
--   after insert on auth.users
--   for each row execute procedure public.handle_new_user_main();
