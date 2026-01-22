const { createClient } = require('@supabase/supabase-js');

// Hardcoded for script simplicity based on viewed .env.local
const SUPABASE_URL = 'https://eookwjdxufyrokrajdfu.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVvb2t3amR4dWZ5cm9rcmFqZGZ1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTE5NjgzMiwiZXhwIjoyMDcwNzcyODMyfQ.NAm-SZuucaZ78x-VOl3vdvdGT0qt7MqDjp9pwZo7l7U';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function migrate() {
    console.log("Starting migration...");

    const { data: leads, error } = await supabase
        .from('main_crm')
        .select('id, next_step');

    if (error) {
        console.error("Error fetching leads:", error);
        return;
    }

    console.log(`Found ${leads.length} leads. Updating...`);

    for (const lead of leads) {
        let currentNextStep = lead.next_step || { date: 'Pending', progress: 0, total: 5 };

        // Ensure it's an object
        if (typeof currentNextStep === 'string') {
            try {
                currentNextStep = JSON.parse(currentNextStep);
            } catch (e) {
                currentNextStep = { date: 'Pending', progress: 0, total: 5 };
            }
        }

        // Update total to 6
        const updatedNextStep = {
            ...currentNextStep,
            total: 6
        };

        const { error: updateError } = await supabase
            .from('main_crm')
            .update({ next_step: updatedNextStep })
            .eq('id', lead.id);

        if (updateError) {
            console.error(`Error updating lead ${lead.id}:`, updateError);
        } else {
            // process.stdout.write('.');
        }
    }

    console.log("\nMigration complete.");
}

migrate();
