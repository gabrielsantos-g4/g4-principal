-- Fix Realtime Configuration for Omnichannel
-- Run this in Supabase SQL Editor

-- 1. Set REPLICA IDENTITY FULL on all tables
ALTER TABLE main_crm REPLICA IDENTITY FULL;
ALTER TABLE camp_mensagens REPLICA IDENTITY FULL;
ALTER TABLE camp_conversas REPLICA IDENTITY FULL;
ALTER TABLE camp_instances REPLICA IDENTITY FULL;

-- 2. Drop and recreate the Realtime publication
DROP PUBLICATION IF EXISTS supabase_realtime;

CREATE PUBLICATION supabase_realtime FOR TABLE 
    main_crm,
    camp_mensagens,
    camp_conversas,
    camp_instances;

-- 3. Verify the configuration
SELECT 
    schemaname,
    tablename,
    relreplident
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
JOIN pg_tables t ON t.tablename = c.relname AND t.schemaname = n.nspname
WHERE tablename IN ('main_crm', 'camp_mensagens', 'camp_conversas', 'camp_instances')
AND schemaname = 'public';

-- Expected output: relreplident should be 'f' (FULL) for all tables

-- 4. Verify publication
SELECT * FROM pg_publication_tables WHERE pubname = 'supabase_realtime';
