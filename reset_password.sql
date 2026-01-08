-- ALERTA: Execute este script no SQL Editor do Supabase

-- 1. Garante que a extensão de criptografia está ativa
create extension if not exists pgcrypto;

-- 2. Atualiza a senha do usuário
-- O comando crypt('...', gen_salt('bf')) gera o hash seguro que o Supabase exige
update auth.users
set encrypted_password = crypt('123456', gen_salt('bf'))
where email = 'guardia.dev@gmail.com';

-- Confirmação (opcional, para você ver que foi alterado)
select email, updated_at from auth.users where email = 'guardia.dev@gmail.com';
