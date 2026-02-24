# Realtime Fixes Summary

## Problem
Error: "mismatch between server and client bindings for postgres changes"

## Root Cause
React Strict Mode mounts components twice in development, causing duplicate channel subscriptions with the same name. When a channel with the same name already exists but with different bindings, Supabase Realtime throws this error.

## Solutions Applied

### 1. Fixed Channel Names with Timestamps
Added unique timestamps to all Realtime channel names to prevent conflicts:

- **instances-table.tsx**: `realtime-instances-${empresaId}-${Date.now()}`
- **connect-instance-dialog.tsx**: `instance-connect-${instance.id}-${Date.now()}`
- **chat-window.tsx**: `chat-${conversation.id}-${Date.now()}`
- **omnichannel-inbox.tsx**: Already fixed with `omnichannel-leads-${empresaId}-${Date.now()}`

### 2. Fixed Database Configuration
- Set REPLICA IDENTITY FULL on `camp_instances` table
- Verified all tables (`main_crm`, `camp_mensagens`, `camp_conversas`, `camp_instances`) are in the Realtime publication

### 3. Verification Steps
Run this SQL to verify configuration:
```sql
-- Check REPLICA IDENTITY
SELECT 
    n.nspname as schema,
    c.relname as table_name,
    CASE c.relreplident
        WHEN 'd' THEN 'default'
        WHEN 'n' THEN 'nothing'
        WHEN 'f' THEN 'full'
        WHEN 'i' THEN 'index'
    END as replica_identity
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE c.relname IN ('main_crm', 'camp_mensagens', 'camp_conversas', 'camp_instances')
AND n.nspname = 'public';

-- Check Realtime publication
SELECT * FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime'
AND tablename IN ('main_crm', 'camp_mensagens', 'camp_conversas', 'camp_instances');
```

## Next Steps
1. **Reload the page** to clear old channel subscriptions
2. If error persists, check browser console for the specific channel causing the issue
3. Verify that the error is gone by checking the console logs

## Files Modified
- `src/components/messenger/instances-table.tsx`
- `src/components/messenger/instances/connect-instance-dialog.tsx`
- `src/components/messenger/chat/chat-window.tsx`
- Database: `camp_instances` table (REPLICA IDENTITY FULL)
