-- ==============================================================================
-- FIX REALTIME RLS POLICIES
-- Este script corrige as políticas RLS para permitir conexões Realtime
-- ==============================================================================

-- 1. Verificar e habilitar RLS nas tabelas de mensagens
ALTER TABLE public.camp_mensagens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.camp_conversas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.main_crm ENABLE ROW LEVEL SECURITY;

-- 2. Remover políticas antigas que podem estar causando conflito
DROP POLICY IF EXISTS "Users can view messages" ON public.camp_mensagens;
DROP POLICY IF EXISTS "Users can insert messages" ON public.camp_mensagens;
DROP POLICY IF EXISTS "Users can view conversations" ON public.camp_conversas;
DROP POLICY IF EXISTS "Users can view crm" ON public.main_crm;
DROP POLICY IF EXISTS "Users can update crm" ON public.main_crm;

-- 3. Criar políticas RLS para camp_mensagens
-- Permitir SELECT para usuários da mesma empresa
CREATE POLICY "Users can view messages from own company" 
ON public.camp_mensagens
FOR SELECT
USING (
  empresa_id IN (
    SELECT empresa_id 
    FROM public.main_profiles 
    WHERE id = auth.uid()
  )
);

-- Permitir INSERT para usuários da mesma empresa
CREATE POLICY "Users can insert messages for own company" 
ON public.camp_mensagens
FOR INSERT
WITH CHECK (
  empresa_id IN (
    SELECT empresa_id 
    FROM public.main_profiles 
    WHERE id = auth.uid()
  )
);

-- Permitir UPDATE para usuários da mesma empresa
CREATE POLICY "Users can update messages from own company" 
ON public.camp_mensagens
FOR UPDATE
USING (
  empresa_id IN (
    SELECT empresa_id 
    FROM public.main_profiles 
    WHERE id = auth.uid()
  )
);

-- 4. Criar políticas RLS para camp_conversas
-- Permitir SELECT para usuários da mesma empresa
CREATE POLICY "Users can view conversations from own company" 
ON public.camp_conversas
FOR SELECT
USING (
  empresa_id IN (
    SELECT empresa_id 
    FROM public.main_profiles 
    WHERE id = auth.uid()
  )
);

-- Permitir UPDATE para usuários da mesma empresa
CREATE POLICY "Users can update conversations from own company" 
ON public.camp_conversas
FOR UPDATE
USING (
  empresa_id IN (
    SELECT empresa_id 
    FROM public.main_profiles 
    WHERE id = auth.uid()
  )
);

-- 5. Criar políticas RLS para main_crm
-- Permitir SELECT para usuários da mesma empresa
CREATE POLICY "Users can view crm from own company" 
ON public.main_crm
FOR SELECT
USING (
  empresa_id IN (
    SELECT empresa_id 
    FROM public.main_profiles 
    WHERE id = auth.uid()
  )
);

-- Permitir UPDATE para usuários da mesma empresa
CREATE POLICY "Users can update crm from own company" 
ON public.main_crm
FOR UPDATE
USING (
  empresa_id IN (
    SELECT empresa_id 
    FROM public.main_profiles 
    WHERE id = auth.uid()
  )
);

-- Permitir INSERT para usuários da mesma empresa
CREATE POLICY "Users can insert crm for own company" 
ON public.main_crm
FOR INSERT
WITH CHECK (
  empresa_id IN (
    SELECT empresa_id 
    FROM public.main_profiles 
    WHERE id = auth.uid()
  )
);

-- ==============================================================================
-- 6. HABILITAR REALTIME PARA AS TABELAS
-- ==============================================================================

-- Verificar se as tabelas estão na publicação do Realtime
-- Execute este comando no Supabase SQL Editor:

-- ALTER PUBLICATION supabase_realtime ADD TABLE public.camp_mensagens;
-- ALTER PUBLICATION supabase_realtime ADD TABLE public.camp_conversas;
-- ALTER PUBLICATION supabase_realtime ADD TABLE public.main_crm;

-- Nota: Se você receber erro "publication already contains relation", 
-- significa que a tabela já está habilitada para Realtime.

-- ==============================================================================
-- 7. VERIFICAR CONFIGURAÇÃO
-- ==============================================================================

-- Para verificar se as tabelas estão na publicação do Realtime:
-- SELECT * FROM pg_publication_tables WHERE pubname = 'supabase_realtime';

-- Para verificar as políticas RLS:
-- SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
-- FROM pg_policies
-- WHERE tablename IN ('camp_mensagens', 'camp_conversas', 'main_crm');
