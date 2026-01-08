-- ==============================================================================
-- MIGRATION: UPDATE RLS POLICIES FOR ADS_REPORTS
-- Objetivo: Permitir que usuários autenticados via main_profiles acessem os relatórios antigos.
-- ==============================================================================

-- 1. Habilitar RLS (garantia)
alter table public.ads_reports enable row level security;

-- 2. Remover políticas antigas (se existirem, para evitar conflitos ou "double check" desnecessário)
drop policy if exists "Users can insert reports for own company" on public.ads_reports;
drop policy if exists "Users can view reports for own company" on public.ads_reports;
drop policy if exists "Users can delete own reports" on public.ads_reports;

-- 3. Criar Novas Políticas Baseadas em main_profiles

-- INSERT: Permitir salvar relatório se o usuário pertencer à empresa (via main_profiles)
create policy "Main Users can insert reports" on public.ads_reports
  for insert with check (
    empresa_id in (
      select empresa_id from public.main_profiles
      where id = auth.uid()
    )
  );

-- SELECT: Permitir ver relatórios da própria empresa
create policy "Main Users can view reports" on public.ads_reports
  for select using (
    empresa_id in (
      select empresa_id from public.main_profiles
      where id = auth.uid()
    )
  );

-- DELETE: Opcional - Permitir deletar reports (apenas admins ou quem criou?)
-- Por simplicidade, vamos permitir deletar se for da mesma empresa (ou restrinja a admins se preferir)
create policy "Main Users can delete reports" on public.ads_reports
  for delete using (
    empresa_id in (
      select empresa_id from public.main_profiles
      where id = auth.uid()
    )
  );
