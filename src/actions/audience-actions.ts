'use server'

import { createClient } from '@/lib/supabase'
import { revalidatePath } from 'next/cache'

export interface AudienceChat {
    id: string
    created_at: string
    title: string | null
    company_id: string
}

export interface AudienceMessage {
    id: string
    created_at: string
    chat_id: string
    role: 'user' | 'assistant'
    content: string
}

export async function getChats() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return []

    // Get company_id via main_profiles
    const { data: profile } = await supabase
        .from('main_profiles')
        .select('empresa_id')
        .eq('id', user.id)
        .single()

    if (!profile?.empresa_id) return []

    const { data } = await supabase
        .from('audience_chats')
        .select('*')
        .eq('company_id', profile.empresa_id)
        .order('created_at', { ascending: false })

    return data as AudienceChat[] || []
}

export async function createChat(title: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { error: 'Unauthorized' }

    const { data: profile } = await supabase
        .from('main_profiles')
        .select('empresa_id')
        .eq('id', user.id)
        .single()

    if (!profile?.empresa_id) return { error: 'No company found' }

    const { data, error } = await supabase
        .from('audience_chats')
        .insert({
            title,
            company_id: profile.empresa_id
        })
        .select()
        .single()

    if (error) {
        return { error: error.message }
    }

    revalidatePath('/dashboard/audience-channels')
    return { success: true, chat: data }
}

export async function deleteChat(chatId: string) {
    const supabase = await createClient()
    const { error } = await supabase
        .from('audience_chats')
        .delete()
        .eq('id', chatId)

    if (error) {
        return { error: error.message }
    }

    revalidatePath('/dashboard/audience-channels')
    return { success: true }
}

export async function getMessages(chatId: string) {
    const supabase = await createClient()
    const { data } = await supabase
        .from('audience_messages')
        .select('*')
        .eq('chat_id', chatId)
        .order('created_at', { ascending: true })

    return data as AudienceMessage[] || []
}

export async function sendMessage(chatId: string, content: string, role: 'user' | 'assistant') {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { error: 'Unauthorized' }

    const { data: profile } = await supabase
        .from('main_profiles')
        .select('empresa_id')
        .eq('id', user.id)
        .single()

    if (!profile?.empresa_id) return { error: 'No company found' }

    // Insert into DB
    const { data, error } = await supabase
        .from('audience_messages')
        .insert({
            chat_id: chatId,
            company_id: profile.empresa_id,
            role,
            content
        })
        .select()
        .single()

    if (error) {
        return { error: error.message }
    }

    // Trigger Webhook for User messages
    let aiResponseText = null

    if (role === 'user') {
        try {
            const response = await fetch('https://hook.startg4.com/webhook/394f2dc6-c295-4d7e-9dc0-e314b3024359-mensagem', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    titulo: chatId,
                    mensagem: content,
                    supabase_id: profile.empresa_id
                })
            })

            if (response.ok) {
                const data = await response.json()
                // Supports 'message', 'mensagem', 'response', or 'text' keys
                aiResponseText = data.message || data.mensagem || data.response || data.text
            }
        } catch (webhookError) {
            console.error('Failed to send message to webhook:', webhookError)
        }
    }

    // No revalidatePath needed usually for chat messages as we update optimistic or local state, 
    // but good for persistence checks
    return { success: true, message: data, aiResponse: aiResponseText }
}
