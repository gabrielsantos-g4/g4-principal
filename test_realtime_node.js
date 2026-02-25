const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase credentials in .env.local");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
    console.log("Adding instance_wa_chaterly to supabase_realtime publication...");

    // Try to use a known rest endpoint or rpc workaround
    // Unfortunately, supabase-js doesn't allow executing raw SQL directly.
    // BUT the error mismatch between server and client bindings for postgres changes
    // is usually indeed fixed by properly resetting the publication.

    // Since we don't have direct SQL access through the API and MCP is forbidden,
    // we can create an edge function or use an existing one to execute SQL? No.

    // Wait, let's see if the realtime works at all for other tables? No, the issue
    // REALTIME_ROOT_CAUSE_FOUND implies it's a supabase-js / backend mismatch bug with list_changes
    // that happens for *all* tables on this project.

    // Let's test the error in code to see if it's identical
    const channel = supabase.channel('whatsapp-test')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'instance_wa_chaterly' }, payload => {
            console.log('Change received!', payload)
        })
        .subscribe((status, err) => {
            console.log("Status:", status);
            if (err) console.error("Error:", err);
            process.exit(0);
        });
}

run();
