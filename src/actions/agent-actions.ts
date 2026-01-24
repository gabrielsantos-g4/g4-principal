'use server'

import { createClient } from '@/lib/supabase'
import { revalidatePath } from 'next/cache'

export async function updateActiveAgents(activeAgentIds: string[]) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { error: 'Unauthorized' }
    }

    const { error } = await supabase
        .from('main_profiles')
        .update({ active_agents: activeAgentIds })
        .eq('id', user.id)

    if (error) {
        console.error('Error updating active agents:', error)
        return { error: error.message }
    }

    revalidatePath('/dashboard')
    return { success: true }
}
