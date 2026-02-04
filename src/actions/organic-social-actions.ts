'use server'

import { createClient } from '@/lib/supabase'
import { revalidatePath } from 'next/cache'

export async function getContentPillars() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return []

    const { data } = await supabase
        .from('organic_content_pillars')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

    return data || []
}

export async function createContentPillar(title: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { error: 'Unauthorized' }

    const { error } = await supabase
        .from('organic_content_pillars')
        .insert({
            user_id: user.id,
            title
        })

    if (error) return { error: error.message }
    revalidatePath('/dashboard')
    return { success: true }
}

export async function deleteContentPillar(id: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { error: 'Unauthorized' }

    const { error } = await supabase
        .from('organic_content_pillars')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)

    if (error) return { error: error.message }
    revalidatePath('/dashboard')
    return { success: true }
}

export async function getPillarChats(pillarId: string) {
    const supabase = await createClient()

    // Auth check implicitly handled by RLS, but rigorous check here for business logic if needed

    const { data } = await supabase
        .from('organic_content_chats')
        .select('*')
        .eq('pillar_id', pillarId)
        .order('created_at', { ascending: false })

    return data || []
}

export async function createPillarChat(pillarId: string, title: string) {
    const supabase = await createClient()

    // We can just rely on RLS for pillar ownership check, or do a double check
    // Ideally we check if pillar belongs to user first, but RLS prevents insert if not allowed? 
    // Wait, my RLS policy for 'insert' on chats checks:
    // exists (select 1 from pillars where id = chat.pillar_id and user_id = auth.uid())
    // So if the pillar doesn't belong to the user, the insert will fail. Secure.

    const { data, error } = await supabase
        .from('organic_content_chats')
        .insert({
            pillar_id: pillarId,
            title,
            messages: []
        })
        .select()
        .single()

    if (error) return { error: error.message }
    revalidatePath('/dashboard')
    return { success: true, chat: data }
}

export async function deletePillarChat(chatId: string) {
    const supabase = await createClient()

    const { error } = await supabase
        .from('organic_content_chats')
        .delete()
        .eq('id', chatId)
    // RLS handles ownership via the pillar join

    if (error) return { error: error.message }
    revalidatePath('/dashboard')
    return { success: true }
}

// --- MASTER CHATS ("The Strategist") ---

export async function getMasterChats() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return []

    const { data } = await supabase
        .from('organic_master_chats')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

    return data || []
}

export async function createMasterChat(title: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { error: 'Unauthorized' }

    const { data, error } = await supabase
        .from('organic_master_chats')
        .insert({
            user_id: user.id,
            title,
            messages: []
        })
        .select()
        .single()

    if (error) return { error: error.message }
    revalidatePath('/dashboard')
    return { success: true, chat: data }
}

export async function deleteMasterChat(id: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { error: 'Unauthorized' }

    const { error } = await supabase
        .from('organic_master_chats')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)

    if (error) return { error: error.message }
    revalidatePath('/dashboard')
    return { success: true }
}

export async function updateMasterChatMessages(chatId: string, messages: any[]) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { error: 'Unauthorized' }

    const { error } = await supabase
        .from('organic_master_chats')
        .update({ messages, updated_at: new Date().toISOString() })
        .eq('id', chatId)
        .eq('user_id', user.id)

    if (error) return { error: error.message }
    return { success: true }
}

// --- CONTENT ITEMS (Idea Children / Scripts) ---

export async function getContentItems(pillarId: string) {
    const supabase = await createClient()

    const { data } = await supabase
        .from('organic_content_items')
        .select('*')
        .eq('pillar_id', pillarId)
        .order('created_at', { ascending: false })

    return data || []
}

export async function createContentItem(pillarId: string, item: { title: string, content?: string, format?: string }) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { error: 'Unauthorized' }

    const { data, error } = await supabase
        .from('organic_content_items')
        .insert({
            pillar_id: pillarId,
            user_id: user.id,
            title: item.title,
            content: item.content,
            format: item.format,
            status: 'draft'
        })
        .select()
        .single()

    if (error) return { error: error.message }
    revalidatePath('/dashboard')
    return { success: true, item: data }
}

export async function deleteContentItem(id: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { error: 'Unauthorized' }

    const { error } = await supabase
        .from('organic_content_items')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)

    if (error) return { error: error.message }
    revalidatePath('/dashboard')
    return { success: true }
}
