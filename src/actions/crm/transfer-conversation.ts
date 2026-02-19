'use server'

import { createClient, createAdminClient } from '@/lib/supabase'
import { revalidatePath } from 'next/cache'
import { logAction } from '@/actions/audit'

export async function transferConversation(
    conversationId: string,
    targetUserId: string
) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return { error: 'Unauthorized' }

        const supabaseAdmin = await createAdminClient()

        // 1. Resolve target user name from profile
        const { data: targetProfile } = await supabaseAdmin
            .from('main_profiles')
            .select('name')
            .eq('id', targetUserId)
            .single()

        if (!targetProfile) return { error: 'Target user not found' }

        // 2. Get the lead ID from camp_conversas
        const { data: conv } = await supabaseAdmin
            .from('camp_conversas')
            .select('id, contact_id, main_crm!camp_conversas_contact_id_fkey ( id )')
            .eq('id', conversationId)
            .single()

        if (!conv) return { error: 'Conversation not found' }

        const leadId = (conv as any).main_crm?.id

        // 3. Update main_crm: responsible (name) + responsible_id (uuid)
        if (leadId) {
            const { error: crmError } = await supabaseAdmin
                .from('main_crm')
                .update({
                    responsible: targetProfile.name,
                    responsible_id: targetUserId
                })
                .eq('id', leadId)

            if (crmError) {
                console.error('Error updating main_crm:', crmError)
                return { error: 'Failed to update lead responsible' }
            }
        }

        // 4. Update camp_conversas: responsible_id (uuid)
        const { error: convError } = await supabaseAdmin
            .from('camp_conversas')
            .update({ responsible_id: targetUserId })
            .eq('id', conversationId)

        if (convError) {
            console.error('Error updating camp_conversas:', convError)
            return { error: 'Failed to update conversation responsible' }
        }

        revalidatePath('/dashboard/customer-support')
        revalidatePath('/dashboard/orchestrator')

        await logAction('CONVERSATION_TRANSFERRED', {
            conversation_id: conversationId,
            lead_id: leadId,
            new_responsible_name: targetProfile.name,
            new_responsible_id: targetUserId,
            via: 'inbox_transfer'
        })

        return { success: true }
    } catch (error: any) {
        console.error('Unexpected error in transferConversation:', error)
        return { error: error.message || 'An unexpected error occurred' }
    }
}
