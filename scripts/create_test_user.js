const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// 1. Load Environment Variables from .env.local
const envPath = path.resolve(__dirname, '../.env.local');
const envConfig = {};

try {
    const envContent = fs.readFileSync(envPath, 'utf8');
    envContent.split('\n').forEach(line => {
        const [key, value] = line.split('=');
        if (key && value) {
            envConfig[key.trim()] = value.trim().replace(/^["']|["']$/g, ''); // Basic cleanup
        }
    });
} catch (e) {
    console.error('Could not read .env.local file. Ensure you are running this from the project root.');
    process.exit(1);
}

const SUPABASE_URL = envConfig.SUPABASE_URL || envConfig.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = envConfig.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
    console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

async function createTestUser() {
    const email = 'gabriel@startg4.com';
    const password = 'randompassword123'; // The user asked for "151225" but usually we set a temp one or use the one they asked. 
    // Wait, the user explicitly asked for "151225". I will use that.
    const userPassword = '151225';
    const companyName = 'g4 Company';
    const userName = 'Gabriel Santos'; // Inferring name or using generic

    console.log(`Creating user: ${email}...`);

    // 1. Create User in Auth
    const { data: { user }, error: createError } = await supabase.auth.admin.createUser({
        email: email,
        password: userPassword,
        email_confirm: true,
        user_metadata: {
            full_name: userName,
            company_name: companyName
        }
    });

    if (createError) {
        console.error('Error creating user:', createError.message);
        // If user already exists, try to get their ID?
        // For now, let's assume we want a fresh one or just fail if exists.
        return;
    }

    if (!user) {
        console.error('User creation failed silently.');
        return;
    }

    console.log(`User created. ID: ${user.id}`);

    // 2. Create Company in main_empresas
    console.log('Creating Company in main_empresas...');
    const { data: company, error: companyError } = await supabase
        .from('main_empresas')
        .insert({
            name: companyName,
            slug: 'g4-company' // simple slug generation
        })
        .select()
        .single();

    if (companyError) {
        console.error('Error creating company:', companyError.message);
        return;
    }

    console.log(`Company created. ID: ${company.id}`);

    // 3. Create Profile in main_profiles
    console.log('Creating Profile in main_profiles...');
    const { error: profileError } = await supabase
        .from('main_profiles')
        .insert({
            id: user.id,
            empresa_id: company.id,
            name: userName,
            role: 'limitless' // or 'admin'
        });

    if (profileError) {
        console.error('Error creating profile:', profileError.message);
    } else {
        console.log('Profile created successfully!');
    }
}

createTestUser();
