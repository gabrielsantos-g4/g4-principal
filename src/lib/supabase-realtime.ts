import { createBrowserClient } from '@supabase/ssr';

// Singleton instance for Supabase Realtime client
let supabaseRealtimeInstance: ReturnType<typeof createBrowserClient> | null = null;

/**
 * Get or create a singleton Supabase client for Realtime subscriptions
 * This prevents "mismatch between server and client bindings" errors
 */
export function getSupabaseRealtimeClient() {
  if (!supabaseRealtimeInstance) {
    supabaseRealtimeInstance = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }
  return supabaseRealtimeInstance;
}

/**
 * Reset the singleton instance (useful for testing or when auth changes)
 */
export function resetSupabaseRealtimeClient() {
  supabaseRealtimeInstance = null;
}
