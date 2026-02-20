'use server'

import { createClient, createAdminClient } from '@/lib/supabase'
import { revalidatePath } from 'next/cache'

export async function getMotherIdeas() {
    const supabaseAdmin = await createAdminClient()
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return []

    const { data: profile } = await supabaseAdmin
        .from('main_profiles')
        .select('empresa_id')
        .eq('id', user.id)
        .single()

    if (!profile?.empresa_id) return []

    const { data } = await supabaseAdmin
        .from('organic_ideas_parent')
        .select('*')
        .eq('empresa_id', profile.empresa_id)
        .order('order_index', { ascending: true })
        .order('created_at', { ascending: false })

    return data || []
}

export async function createMotherIdea(title: string) {
    const supabaseAdmin = await createAdminClient()
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { error: 'Unauthorized' }

    const { data: profile } = await supabaseAdmin
        .from('main_profiles')
        .select('empresa_id')
        .eq('id', user.id)
        .single()

    if (!profile?.empresa_id) return { error: 'Company not found' }

    const { data, error } = await supabaseAdmin
        .from('organic_ideas_parent')
        .insert({
            user_id: user.id,
            empresa_id: profile.empresa_id,
            title
        })
        .select()
        .single()

    if (error) return { error: error.message }
    revalidatePath('/dashboard')
    return { success: true, idea: data }
}

export async function deleteMotherIdea(id: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { error: 'Unauthorized' }

    const { error } = await supabase
        .from('organic_ideas_parent')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)

    if (error) return { error: error.message }
    revalidatePath('/dashboard')
    return { success: true }
}

export async function updateMotherIdea(id: string, title: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { error: 'Unauthorized' }

    const { data, error } = await supabase
        .from('organic_ideas_parent')
        .update({ title })
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single()

    if (error) return { error: error.message }
    revalidatePath('/dashboard')
    return { success: true, idea: data }
}

export async function reorderMotherIdeas(orderedIds: string[]) {
    const supabaseAdmin = await createAdminClient()
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { error: 'Unauthorized' }

    // Use admin client in a loop or Promise.all to update order_index
    // This is because we don't have a bulk update RPC by default
    const updates = orderedIds.map((id, index) =>
        supabaseAdmin
            .from('organic_ideas_parent')
            .update({ order_index: index })
            .eq('id', id)
            .eq('user_id', user.id)
    )

    await Promise.all(updates)

    revalidatePath('/dashboard')
    return { success: true }
}

export async function getChildIdeas(parentId: string) {
    const supabaseAdmin = await createAdminClient()

    const { data } = await supabaseAdmin
        .from('organic_ideas_child')
        .select('*')
        .eq('parent_id', parentId)
        .order('created_at', { ascending: true })

    return data || []
}

export async function createChildIdea(parentId: string, content: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { error: 'Unauthorized' }

    const { data, error } = await supabase
        .from('organic_ideas_child')
        .insert({
            parent_id: parentId,
            user_id: user.id,
            content
        })
        .select()
        .single()

    if (error) return { error: error.message }
    revalidatePath('/dashboard')
    return { success: true, item: data }
}
export async function updateChildIdea(id: string, updates: { content?: string; content_type?: string | null; format_type?: string | null; script_content?: string | null }) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { error: 'Unauthorized' }

    const { data, error } = await supabase
        .from('organic_ideas_child')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single()

    if (error) return { error: error.message }
    revalidatePath('/dashboard')
    return { success: true, item: data }
}


export async function deleteChildIdea(id: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { error: 'Unauthorized' }

    const { error } = await supabase
        .from('organic_ideas_child')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)

    if (error) return { error: error.message }
    revalidatePath('/dashboard')
    return { success: true }
}

export async function getScheduledPosts() {
    const supabaseAdmin = await createAdminClient()
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return []

    const { data: profile } = await supabaseAdmin
        .from('main_profiles')
        .select('empresa_id')
        .eq('id', user.id)
        .single()

    if (!profile?.empresa_id) return []

    const { data } = await supabaseAdmin
        .from('organic_scheduled_posts')
        .select('*')
        .eq('empresa_id', profile.empresa_id)
        .order('scheduled_date', { ascending: true })

    return data || []
}

export async function createScheduledPost(data: {
    channel: string;
    placement: string;
    caption: string;
    scheduled_date: string;
    scheduled_time: string;
    media_urls?: any[];
    theme_id?: string;
    idea_id?: string;
}) {
    const supabaseAdmin = await createAdminClient()
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { error: 'Unauthorized' }

    const { data: profile } = await supabaseAdmin
        .from('main_profiles')
        .select('empresa_id')
        .eq('id', user.id)
        .single()

    if (!profile?.empresa_id) return { error: 'Company not found' }

    const { error } = await supabaseAdmin
        .from('organic_scheduled_posts')
        .insert({
            ...data,
            empresa_id: profile.empresa_id,
            user_id: user.id,
            status: 'scheduled'
        })

    if (error) return { error: error.message }
    revalidatePath('/dashboard')
    return { success: true }
}

export async function updateScheduledPost(id: string, data: any) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { error: 'Unauthorized' }

    const { error } = await supabase
        .from('organic_scheduled_posts')
        .update(data)
        .eq('id', id)
        .eq('user_id', user.id)

    if (error) return { error: error.message }
    revalidatePath('/dashboard')
    return { success: true }
}
