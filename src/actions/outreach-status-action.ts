'use server'

import { createClient } from '@/lib/supabase'
import { revalidatePath } from 'next/cache'

export async function updateProspectStatus(id: string, newStatus: string) {
    const supabase = await createClient()

    const { error } = await supabase
        .from('outreach_prospects')
        .update({ status: newStatus })
        .eq('id', id)

    if (error) {
        console.error('Error updating prospect status:', error)
        return { success: false, error: error.message }
    }

    revalidatePath('/dashboard/outreach') // Adjust path if dynamic slug needs matching
    revalidatePath('/dashboard/[slug]', 'page')
    return { success: true }
}
