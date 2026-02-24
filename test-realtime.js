// Test script to verify Supabase Realtime connection
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

console.log('Testing Supabase Realtime connection...');
console.log('URL:', supabaseUrl);

// Test channel subscription
const channel = supabase
  .channel('test-channel')
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'main_crm'
  }, (payload) => {
    console.log('Change received!', payload);
  })
  .subscribe((status, err) => {
    console.log('Subscription status:', status);
    if (err) {
      console.error('Subscription error:', err);
    }
    if (status === 'SUBSCRIBED') {
      console.log('✅ Successfully subscribed to Realtime!');
      setTimeout(() => {
        console.log('Cleaning up...');
        supabase.removeChannel(channel);
        process.exit(0);
      }, 3000);
    } else if (status === 'CHANNEL_ERROR') {
      console.error('❌ Failed to subscribe to Realtime');
      process.exit(1);
    }
  });

// Timeout after 10 seconds
setTimeout(() => {
  console.log('Timeout - closing connection');
  supabase.removeChannel(channel);
  process.exit(1);
}, 10000);
