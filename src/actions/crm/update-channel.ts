'use server'

import { createClient, createAdminClient } from '@/lib/supabase'
import { revalidatePath } from 'next/cache'
import { getEmpresaId } from '@/lib/get-empresa-id'

export async function updateChannel(leadId: number, channel: string) {
    const supabase = await createClient()
    const supabaseAdmin = await createAdminClient()
    const empresaId = await getEmpresaId()

    if (!empresaId) return { error: 'Empresa ID not found' }

    try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return { error: 'Unauthorized' }

        // Update main_crm
        const { error } = await supabaseAdmin
            .from('main_crm')
            .update({ conversation_channel: channel })
            .eq('id', leadId)
            .eq('empresa_id', empresaId)

        if (error) {
            console.error('Error updating channel:', error)
            return { error: 'Failed to update channel' }
        }

        revalidatePath('/dashboard')
        revalidatePath('/crm')

        return { success: true }
    } catch (error) {
        console.error('Server error updating channel:', error)
        return { error: 'Internal server error' }
    }
}
