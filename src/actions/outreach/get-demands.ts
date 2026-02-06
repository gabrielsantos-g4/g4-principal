'use server'

import { createClient, createAdminClient } from '@/lib/supabase'

export async function getDemands() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return []

    // Use admin client for reliable fetching (bypass RLS if needed)
    const supabaseAdmin = await createAdminClient()

    const { data: profile } = await supabaseAdmin
        .from('main_profiles')
        .select('empresa_id')
        .eq('id', user.id)
        .single()

    if (!profile?.empresa_id) {
        console.log('DEBUG: getDemands - No company found for user', user.id)
        return []
    }

    const { data, error } = await supabaseAdmin
        .from('outreach_demands')
        .select('*')
        .eq('empresa_id', profile.empresa_id)
        .order('created_at', { ascending: false })

    if (error) {
        console.error('DEBUG: getDemands - Error fetching demands:', error)
        return []
    }

    console.log(`DEBUG: getDemands - Found ${data?.length} demands for company ${profile.empresa_id}`)
    return data || []
}
