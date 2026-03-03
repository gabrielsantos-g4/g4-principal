'use server'

import { createClient } from '@/lib/supabase'

export interface UpdateMilestoneInput {
    id: string
    action_title?: string
    description?: string
    deadline?: string | null
    status?: string
    target_metric?: string
    assignees?: string[]
    comments?: string
}

export async function updateMilestone(input: UpdateMilestoneInput) {
    if (!input.id) {
        return { error: 'Milestone ID is required for updating.' }
    }

    const supabase = await createClient()

    const { data: updated, error } = await supabase
        .from('project_milestones')
        .update({
            action_title: input.action_title,
            description: input.description,
            deadline: input.deadline,
            status: input.status,
            target_metric: input.target_metric,
            assignees: input.assignees,
            comments: input.comments,
        })
        .eq('id', input.id)
        .select()
        .single()

    if (error) {
        console.error('Error updating project milestone:', error)
        return { error: 'Failed to update milestone details.' }
    }

    return { data: updated }
}
