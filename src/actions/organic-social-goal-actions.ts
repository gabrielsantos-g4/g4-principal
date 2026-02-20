'use server'

import { createClient } from '@/lib/supabase'
import { revalidatePath } from 'next/cache'

export async function getOrganicSocialGoal(companyId: string) {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from('main_empresas')
        .select('organic_social_goal, organic_social_goal_updated_by, organic_social_goal_updated_at')
        .eq('id', companyId)
        .single()
    if (error) return null
    return data
}

export async function saveOrganicSocialGoal(companyId: string, goal: string, updatedByName: string) {
    const supabase = await createClient()
    const { error } = await supabase
        .from('main_empresas')
        .update({
            organic_social_goal: goal,
            organic_social_goal_updated_by: updatedByName,
            organic_social_goal_updated_at: new Date().toISOString(),
        })
        .eq('id', companyId)
    if (error) throw new Error(error.message)
    revalidatePath('/dashboard/organic-social')
}
