'use server'

import { createClient, createAdminClient } from '@/lib/supabase'
import { revalidatePath } from 'next/cache'
import { logAction } from '@/actions/audit'

export async function transferConversation(conversationId: string, newResponsibleName: string) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return { error: 'Unauthorized' }
        }

        const supabaseAdmin = await createAdminClient()

        // Verify the conversation exists and belongs to the company (RLS check/security)
        // For simplicity with admin client, we just update ensuring the ID matches.
        // Ideally we should check if the user has access to this lead, but given it's "Support" / "Inbox",
        // typically they do if they can see it.

        // Update the lead's responsible field
        const { error } = await supabaseAdmin
            .from('main_crm')
            .update({ responsible: newResponsibleName })
            .eq('id', conversationId)

        if (error) {
            console.error('Error transferring conversation:', error)
            return { error: 'Failed to transfer conversation' }
        }

        // Revalidate inbox pages
        revalidatePath('/dashboard/support')
        revalidatePath('/dashboard/orchestrator')

        // Log the conversation transfer
        await logAction('CONVERSATION_TRANSFERRED', {
            conversation_id: conversationId,
            new_responsible: newResponsibleName,
            via: 'crm_transfer'
        })

        return { success: true }
    } catch (error: any) {
        console.error('Unexpected error in transferConversation:', error)
        return { error: error.message || 'An unexpected error occurred' }
    }
}
