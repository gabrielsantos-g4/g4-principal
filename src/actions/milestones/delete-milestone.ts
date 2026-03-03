'use server'

import { createClient } from '@/lib/supabase'

export async function deleteMilestone(id: string) {
    if (!id) return { error: 'Milestone ID is required.' }

    const supabase = await createClient()

    const { error } = await supabase
        .from('project_milestones')
        .delete()
        .eq('id', id)

    if (error) {
        console.error('Error deleting project milestone:', error)
        return { error: 'Failed to delete milestone.' }
    }

    return { success: true }
}
