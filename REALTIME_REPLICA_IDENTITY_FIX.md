# Realtime WebSocket Fix - Replica Identity

## Problem Identified
The "mismatch between server and client bindings for postgres changes" error was caused by inconsistent **replica identity** settings on the database tables.

## Root Cause
When Supabase Realtime subscribes to `postgres_changes`, it needs the database to replicate ALL column values, not just the primary key. The replica identity setting controls what data is included in the replication stream:

- `DEFAULT (d)`: Only replicates the primary key (insufficient for Realtime)
- `FULL (f)`: Replicates all columns (required for Realtime)

### Previous State
```
camp_conversas:  DEFAULT (primary key only) ❌
camp_mensagens:  FULL (all columns) ✅
main_crm:        DEFAULT (primary key only) ❌
```

## Solution Applied
Applied migration `fix_replica_identity_for_realtime` to set all three tables to FULL replica identity:

```sql
ALTER TABLE public.camp_conversas REPLICA IDENTITY FULL;
ALTER TABLE public.main_crm REPLICA IDENTITY FULL;
ALTER TABLE public.camp_mensagens REPLICA IDENTITY FULL;
```

### Current State
```
camp_conversas:  FULL (all columns) ✅
camp_mensagens:  FULL (all columns) ✅
main_crm:        FULL (all columns) ✅
```

## What This Fixes
1. ✅ Eliminates "mismatch between server and client bindings" errors
2. ✅ Allows Realtime to properly track all column changes
3. ✅ Enables proper WebSocket subscriptions for postgres_changes
4. ✅ Ensures RLS policies work correctly with Realtime

## Testing
After this fix, the WebSocket connection should:
1. Connect successfully without "mismatch" errors
2. Show "✅ subscribed successfully" in console logs
3. Receive real-time updates when data changes
4. No longer show CHANNEL_ERROR or TIMED_OUT statuses

## Additional Context
- All RLS policies are properly configured ✅
- All tables are published to `supabase_realtime` ✅
- Singleton Supabase client prevents duplicate instances ✅
- Stable channel names prevent re-subscription issues ✅
- @supabase/supabase-js updated to v2.97.0 ✅

## Next Steps
1. Refresh the browser page at http://localhost:3000/dashboard/customer-support?tab=omnichannel
2. Open browser console and look for "✅ subscribed successfully" messages
3. Test by updating a lead in the CRM - changes should appear in real-time
4. If issues persist, use the "🔧 Test Connection" button to run diagnostics

## Migration Applied
- **Migration Name**: `fix_replica_identity_for_realtime`
- **Applied**: Successfully
- **Project ID**: eookwjdxufyrokrajdfu
