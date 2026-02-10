'use server'

import { createAdminClient, createClient } from '@/lib/supabase'
import { revalidatePath } from 'next/cache'
import { syncResponsibles } from '@/actions/crm/sync-responsibles'

export async function updateActiveAgents(activeAgentIds: string[]) {
    const supabase = await createClient()
    const supabaseAdmin = await createAdminClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { error: 'Unauthorized' }
    }

    // Fetch profile first to get empresa_id
    const { data: profile } = await supabaseAdmin
        .from('main_profiles')
        .select('empresa_id')
        .eq('id', user.id)
        .single()

    if (!profile) return { error: 'Profile not found' }

    const { error: updateError } = await supabaseAdmin
        .from('main_profiles')
        .update({ active_agents: activeAgentIds })
        .eq('id', user.id)

    if (updateError) {
        console.error('Error updating active agents:', updateError)
        return { error: updateError.message }
    }

    await syncResponsibles(profile.empresa_id)

    revalidatePath('/', 'layout')
    return { success: true }
}
