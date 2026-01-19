'use server'

import { createClient } from '@/lib/supabase'
import { revalidatePath } from 'next/cache'

export async function saveChatMessage({
    empresa_id,
    user_id,
    agent_name,
    message,
    sender
}: {
    empresa_id: string
    user_id: string
    agent_name: string
    message: string
    sender: 'AGENT' | 'USER'
}) {
    const supabase = await createClient()

    const { error } = await supabase
        .from('main_agents_chat')
        .insert({
            empresa_id,
            user_id,
            agent_name,
            message,
            sender
        })

    if (error) {
        console.error('Error saving chat message:', error)
        return { success: false, error: error.message }
    }

    return { success: true }
}

export async function getChatMessages({
    empresa_id,
    agent_name
}: {
    empresa_id: string
    agent_name: string
}) {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('main_agents_chat')
        .select('*')
        .eq('empresa_id', empresa_id)
        .eq('agent_name', agent_name)
        .order('created_at', { ascending: true })

    if (error) {
        console.error('Error fetching chat messages:', error)
        return { success: false, error: error.message }
    }

    return {
        success: true,
        messages: data.map(msg => ({
            id: msg.id,
            role: msg.sender === 'USER' ? 'user' : 'assistant',
            content: msg.message
        }))
    }
}
