-- ==============================================================================
-- 1. ESTRUTURA BASE (Tabelas e Triggers)
-- ==============================================================================

-- 1.1 Trigger para criação automática de usuário
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  new_empresa_id uuid;
begin
  -- Cria uma nova empresa para o usuário (evita erro se já existir algo similar, mas aqui é novo user)
  insert into public.ads_empresas (name)
  values (coalesce(new.raw_user_meta_data->>'company_name', 'Minha Empresa'))
  returning id into new_empresa_id;

  -- Cria o perfil do usuário vinculado à empresa
  insert into public.ads_profiles (id, empresa_id, name, role)
  values (new.id, new_empresa_id, coalesce(new.raw_user_meta_data->>'full_name', 'Novo Usuário'), 'admin');

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 1.2 Tabela ads_reports
-- Nota: Para garantir a nova coluna title, vamos adicionar se não existir ou criar a tabela
create table if not exists public.ads_reports (
  id uuid not null default gen_random_uuid (),
  empresa_id uuid not null,
  title text not null, -- Nome amigável do relatório
  status text not null default 'processing',
  payload jsonb null,
  summary text null,
  currency text null,
  total_spent numeric null,
  row_count int null,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  
  constraint ads_reports_pkey primary key (id),
  constraint ads_reports_empresa_id_fkey foreign KEY (empresa_id) references ads_empresas (id) on delete cascade
);

create index if not exists idx_ads_reports_empresa_id on public.ads_reports(empresa_id);
create index if not exists idx_ads_reports_status on public.ads_reports(status);

-- Se a tabela já existia sem title, adiciona a coluna (idempotente)
do $$ 
begin 
  if not exists (select 1 from information_schema.columns where table_name='ads_reports' and column_name='title') then 
    alter table public.ads_reports add column title text not null default 'Relatório sem Nome'; 
  end if; 
end $$;

-- ==============================================================================
-- 2. ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

-- Habilitar RLS em todas as tabelas (seguro rodar múltiplas vezes)
alter table public.ads_empresas enable row level security;
alter table public.ads_profiles enable row level security;
alter table public.ads_reports enable row level security;

-- --- Policies: ads_profiles ---
drop policy if exists "Users can view own profile" on public.ads_profiles;
create policy "Users can view own profile" on public.ads_profiles
  for select using (auth.uid() = id);

drop policy if exists "Users can update own profile" on public.ads_profiles;
create policy "Users can update own profile" on public.ads_profiles
  for update using (auth.uid() = id);

-- --- Policies: ads_empresas ---
drop policy if exists "Users can view own empresa" on public.ads_empresas;
create policy "Users can view own empresa" on public.ads_empresas
  for select using (
    id in (
      select empresa_id from public.ads_profiles 
      where id = auth.uid()
    )
  );

drop policy if exists "Admins can update own empresa" on public.ads_empresas;
create policy "Admins can update own empresa" on public.ads_empresas
  for update using (
    id in (
      select empresa_id from public.ads_profiles 
      where id = auth.uid() and role = 'admin'
    )
  );

-- --- Policies: ads_reports ---
drop policy if exists "Users can view company reports" on public.ads_reports;
create policy "Users can view company reports" on public.ads_reports
  for select using (
    empresa_id in (
      select empresa_id from public.ads_profiles 
      where id = auth.uid()
    )
  );

drop policy if exists "Users can insert company reports" on public.ads_reports;
create policy "Users can insert company reports" on public.ads_reports
  for insert with check (
    empresa_id in (
      select empresa_id from public.ads_profiles 
      where id = auth.uid()
    )
  );
