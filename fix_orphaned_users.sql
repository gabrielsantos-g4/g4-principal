-- SCRIPT DE CORREÇÃO DE USUÁRIOS ÓRFÃOS
-- Este script deve ser rodado UMA VEZ no SQL Editor do Supabase.
-- Ele identifica usuários na tabela auth.users que NÃO tem correspondência em ads_profiles
-- e cria automaticamente a empresa e perfil para eles.

do $$
declare
  r record;
  new_empresa_id uuid;
begin
  for r in 
    select * from auth.users 
    where id not in (select id from public.ads_profiles)
  loop
    -- 1. Cria Empresa Padrão
    insert into public.ads_empresas (name)
    values ('Minha Empresa (Recuperada)')
    returning id into new_empresa_id;

    -- 2. Cria Perfil
    insert into public.ads_profiles (id, empresa_id, name, role)
    values (
        r.id, 
        new_empresa_id, 
        coalesce(r.raw_user_meta_data->>'full_name', r.email, 'Usuário Recuperado'),
        'admin'
    );
    
    raise notice 'Usuário recuperado: %', r.id;
  end loop;
end;
$$;
