-- ==============================================================================
-- TESTE DE CONEXÃO REALTIME
-- Execute este script para verificar a configuração do Realtime
-- ==============================================================================

-- 1. Verificar se as tabelas estão na publicação do Realtime
SELECT 
    schemaname,
    tablename,
    pubname
FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime'
    AND tablename IN ('camp_mensagens', 'camp_conversas', 'main_crm')
ORDER BY tablename;

-- 2. Verificar as políticas RLS
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies
WHERE tablename IN ('camp_mensagens', 'camp_conversas', 'main_crm')
ORDER BY tablename, cmd;

-- 3. Verificar se RLS está habilitado
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
    AND tablename IN ('camp_mensagens', 'camp_conversas', 'main_crm');

-- 4. Verificar se há dados nas tabelas
SELECT 
    'camp_mensagens' as table_name,
    COUNT(*) as row_count,
    COUNT(DISTINCT empresa_id) as distinct_empresas
FROM public.camp_mensagens
UNION ALL
SELECT 
    'camp_conversas',
    COUNT(*),
    COUNT(DISTINCT empresa_id)
FROM public.camp_conversas
UNION ALL
SELECT 
    'main_crm',
    COUNT(*),
    COUNT(DISTINCT empresa_id)
FROM public.main_crm;

-- 5. Verificar configuração do Realtime no nível do banco
SELECT 
    name,
    setting
FROM pg_settings
WHERE name LIKE '%wal%' OR name LIKE '%replication%'
ORDER BY name;
