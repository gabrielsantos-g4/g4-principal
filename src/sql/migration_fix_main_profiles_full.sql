-- Migration: Reset and Fix main_profiles RLS Policies
-- Objective: Eliminar recursão infinita (Infinite Recursion) limpando políticas antigas e recriando de forma segura.

BEGIN;

-- 1. Helper function (garantir que existe e é SECURITY DEFINER)
CREATE OR REPLACE FUNCTION public.get_user_company_id()
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN (
    SELECT empresa_id
    FROM public.main_profiles
    WHERE id = auth.uid()
  );
END;
$$;

-- 2. Drop de TODAS as políticas de main_profiles para garantir limpeza
--    Executado dinamicamente para não precisar saber o nome exato da política problemática.
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'main_profiles') LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.main_profiles', r.policyname);
  END LOOP;
END $$;

-- 3. Recriar Políticas Seguras

-- A. Ver o próprio perfil
CREATE POLICY "Users can view own profile" ON public.main_profiles
  FOR SELECT USING (auth.uid() = id);

-- B. Atualizar o próprio perfil
CREATE POLICY "Users can update own profile" ON public.main_profiles
  FOR UPDATE USING (auth.uid() = id);

-- C. Ver colegas da mesma empresa (SEM RECURSÃO)
--    Usa a função get_user_company_id() para evitar self-join com RLS
CREATE POLICY "Users can view colleagues" ON public.main_profiles
  FOR SELECT USING (
    empresa_id = public.get_user_company_id()
  );

COMMIT;
