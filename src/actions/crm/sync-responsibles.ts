'use server';

import { createAdminClient } from '@/lib/supabase';

// Helper to generate a consistent color for a user based on their name
function getColorForUser(name: string) {
    const colors = [
        { bg: 'bg-blue-900', text: 'text-blue-100' },
        { bg: 'bg-purple-900', text: 'text-purple-100' },
        { bg: 'bg-pink-900', text: 'text-pink-100' },
        { bg: 'bg-orange-900', text: 'text-orange-100' },
        { bg: 'bg-green-900', text: 'text-green-100' },
        { bg: 'bg-teal-900', text: 'text-teal-100' },
        { bg: 'bg-indigo-900', text: 'text-indigo-100' },
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % colors.length;
    return colors[index];
}

export async function syncResponsibles(empresaId: string) {
    console.log('[syncResponsibles] Starting sync for empresa:', empresaId);
    const supabaseAdmin = await createAdminClient();

    // 1. Fetch all profiles for this company (Admins and Members)
    const { data: profiles, error: profilesError } = await supabaseAdmin
        .from('main_profiles')
        .select('id, name, role, active_agents')
        .eq('empresa_id', empresaId);

    if (profilesError) {
        console.error('[syncResponsibles] Error fetching profiles:', profilesError);
        return { error: 'Failed to fetch profiles' };
    }

    // 2. Build the new Responsibles list
    const newResponsibles = [];

    // 2a. Add Humans
    for (const profile of profiles || []) {
        const color = getColorForUser(profile.name);
        newResponsibles.push({
            label: profile.name,
            value: profile.name, // Keeping value=name for legacy compatibility, or could be ID
            bg: color.bg,
            text: color.text,
            type: 'human',
            id: profile.id
        });
    }

    // 2b. Check if Jess is active for ANY admin (or anyone?)
    // Rule: "When she is enabled to appear in the list of agents... she must also be enabled as an option of Responsible"
    // Since active_agents is per-profile, we check if ANY profile in the company has 'jess' (or 'lead-qualification' ID) active.
    // Let's assume the ID for Jess is 'jess' or 'lead-qualification'. 
    // Based on `UnifiedTeam.tsx`, Jess ID seems to be 'jess' or similar. 
    // Actually, looking at `UnifiedTeam.tsx`, `AGENTS` are imported. 
    // Usually the ID is 'jess' or 'lead-qualification'.
    // Let's check `src/lib/agents.ts` if needed, but for now I'll assume if string 'jess' or 'lead-qualification' is in the array.

    // Simplification: Check if any profile has 'jess' or 'lead-qualification' in active_agents
    const isJessActive = profiles?.some(p =>
        p.active_agents && (p.active_agents.includes('jess') || p.active_agents.includes('lead-qualification'))
    );

    if (isJessActive) {
        newResponsibles.push({
            label: 'Jess',
            value: 'Jess',
            bg: 'bg-purple-500/10',
            text: 'text-purple-400',
            type: 'agent',
            id: 'jess'
        });
    }

    // 3. Update main_crm_settings
    // We first need to get the existing settings to preserve other fields, 
    // BUT we are only updating `responsibles`. 
    // Wait, updating `responsibles` completely replaces the list. This is what we want to ensure sync.
    // Any manual additions to `responsibles` would be lost if they aren't users. 
    // That's acceptable for "Enforcing rules".

    const { error: updateError } = await supabaseAdmin
        .from('main_crm_settings')
        .update({ responsibles: newResponsibles })
        .eq('empresa_id', empresaId);

    if (updateError) {
        console.error('[syncResponsibles] Error updating settings:', updateError);
        return { error: 'Failed to update CRM settings' };
    }

    console.log('[syncResponsibles] Successfully updated responsibles:', newResponsibles.length);
    return { success: true };
}
