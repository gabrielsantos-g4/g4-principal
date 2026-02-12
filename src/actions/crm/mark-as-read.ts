'use server'

import { createClient } from '@/lib/supabase'
import { revalidatePath } from 'next/cache'

export async function markAsRead(leadId: string | number, status: boolean = true) {
    const supabase = await createClient()

    const { error } = await supabase
        .from('main_crm')
        .update({ is_read_by_responsible: status })
        .eq('id', leadId)

    if (error) {
        console.error('[markAsRead] Error:', error)
        return { success: false, error }
    }

    revalidatePath('/dashboard/support')
    return { success: true }
}
