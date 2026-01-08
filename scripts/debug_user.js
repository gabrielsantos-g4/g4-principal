const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Manual .env parser
const envPath = path.resolve(__dirname, '../.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
    // Basic parser: splits by first '='
    const parts = line.split('=');
    if (parts.length >= 2) {
        const key = parts[0].trim();
        const val = parts.slice(1).join('=').trim();
        if (key && !key.startsWith('#')) {
            env[key] = val;
        }
    }
});

const SUPABASE_URL = env['NEXT_PUBLIC_SUPABASE_URL'] || env['SUPABASE_URL'];
const SERVICE_ROLE_KEY = env['SUPABASE_SERVICE_ROLE_KEY'];

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
    console.error('Missing credentials in .env.local');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

async function debugUser() {
    const email = 'gabriel@startg4.com';

    console.log(`Fetching user ${email}...`);

    // 1. Get Auth User ID
    const { data: { users }, error: authError } = await supabase.auth.admin.listUsers();

    if (authError) {
        console.error('Error fetching auth users:', authError);
        return;
    }

    const user = users.find(u => u.email === email);

    if (!user) {
        console.error('User not found in Auth!');
        return;
    }

    console.log('Auth User ID:', user.id);

    // 2. Check main_profiles
    const { data: profile, error: profileError } = await supabase
        .from('main_profiles')
        .select('*')
        .eq('id', user.id)
        .single();

    if (profileError) {
        console.error('Error fetching profile:', profileError);
        // Try creating profile if missing?
    } else {
        console.log('Current Profile:', profile);
    }

    // 3. Fix Role if needed
    if (profile && profile.role !== 'admin') {
        console.log(`Current role is '${profile.role}'. Updating to 'admin'...`);
        const { error: updateError } = await supabase
            .from('main_profiles')
            .update({ role: 'admin' })
            .eq('id', user.id);

        if (updateError) {
            console.error('Failed to update role:', updateError);
        } else {
            console.log('SUCCESS: Role updated to admin.');
        }
    } else if (profile) {
        console.log('User is already configured as ADMIN.');
    }
}

debugUser();
