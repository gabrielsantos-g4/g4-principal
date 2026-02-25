"use server"

import { createClient } from "@/lib/supabase"
import { revalidatePath } from "next/cache"

export type Conversation = {
    id: string
    contact_id: string
    contact_name: string
    contact_phone: string
    instance_id: string
    last_message?: string
    last_message_at?: string
    unread_count: number
}

export type Message = {
    id: string
    conversa_id: string
    body: string
    direction: 'IN' | 'OUT'
    media_type: 'text' | 'image' | 'video' | 'audio' | 'document' | null
    media_url: string | null
    created_at: string
    status: 'sent' | 'delivered' | 'read' | 'failed' | 'pending'
}

export async function getConversations() {
    const supabase = await createClient()

    const { data: profile } = await supabase
        .from('main_profiles')
        .select('empresa_id')
        .eq('id', (await supabase.auth.getUser()).data.user?.id!)
        .single()

    if (!profile?.empresa_id) {
        return []
    }

    // Fetch conversations with contact details
    const { data: conversations, error } = await supabase
        .from('camp_conversas')
        .select(`
            id,
            contact_id,
            instance_id,
            created_at,
            main_crm!camp_conversas_contact_id_fkey (
                name,
                phone
            )
        `)
        .eq('empresa_id', profile.empresa_id)
        .order('updated_at', { ascending: false })

    if (error) {
        console.error('Error fetching conversations:', error)
        return []
    }

    // For each conversation, fetch the last message to display as snippet
    const formattedConversations: Conversation[] = await Promise.all(conversations.map(async (conv: any) => {
        const { data: lastMsg } = await supabase
            .from('camp_mensagens_n')
            .select('body, created_at')
            .eq('conversa_id', conv.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .single()

        return {
            id: conv.id,
            contact_id: conv.contact_id,
            contact_name: conv.main_crm?.name || conv.main_crm?.phone || 'Desconhecido',
            contact_phone: conv.main_crm?.phone || '',
            instance_id: conv.instance_id,
            last_message: lastMsg?.body || (lastMsg ? 'Mídia' : ''),
            last_message_at: lastMsg?.created_at,
            unread_count: 0 // TODO: Implement unread count logic
        }
    }))

    // Sort by last message time
    return formattedConversations.sort((a, b) => {
        const dateA = a.last_message_at ? new Date(a.last_message_at).getTime() : 0
        const dateB = b.last_message_at ? new Date(b.last_message_at).getTime() : 0
        return dateB - dateA
    })
}

export async function getMessages(conversationId: string) {
    const supabase = await createClient()

    const { data: profile } = await supabase
        .from('main_profiles')
        .select('empresa_id')
        .eq('id', (await supabase.auth.getUser()).data.user?.id!)
        .single()

    if (!profile?.empresa_id) {
        return []
    }

    const { data, error } = await supabase
        .from('camp_mensagens_n')
        .select('*')
        .eq('conversa_id', conversationId)
        .eq('empresa_id', profile.empresa_id)
        .order('created_at', { ascending: true })

    if (error) {
        console.error('Error fetching messages:', error)
        return []
    }

    return data as Message[]
}

export async function sendMessage(conversationId: string, body: string) {
    const supabase = await createClient()

    const { data: profile } = await supabase
        .from('main_profiles')
        .select('empresa_id')
        .eq('id', (await supabase.auth.getUser()).data.user?.id!)
        .single()

    if (!profile?.empresa_id) {
        return { error: 'Empresa não identificada.' }
    }

    // 1. Insert message into DB
    const { data: message, error } = await supabase
        .from('camp_mensagens_n')
        .insert({
            conversa_id: conversationId,
            empresa_id: profile.empresa_id,
            body: body,
            direction: 'OUT',
            status: 'pending',
            media_type: 'text'
        })
        .select()
        .single()

    if (error) {
        console.error('Error sending message (DB):', error)
        return { error: 'Erro ao salvar mensagem.' }
    }

    // 2. Update conversation updated_at
    await supabase
        .from('camp_conversas')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', conversationId)

    // 3. Trigger sending API (Placeholder for now, assuming external job picks it up or we call webhook)
    // In a real scenario, we would call the WAHA API or similar here.
    // For now, we rely on the database insertion.

    // We can simulate a webhook call if needed, similar to campaigns.

    revalidatePath('/dashboard/messenger/conversations')
    return { success: true, message }
}
