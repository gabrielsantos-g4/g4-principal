'use server'

import { createClient } from '@/lib/supabase'
import { revalidatePath } from 'next/cache'

export interface Competitor {
    id: string
    user_id: string
    name: string
    website: string | null
    other_link: string | null
    instagram_profile: string | null
    linkedin_profile: string | null
    youtube_channel: string | null
    created_at: string
    updated_at: string
}

export async function getCompetitors(): Promise<Competitor[]> {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('competitors')
        .select('*')
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Error fetching competitors:', error)
        return []
    }

    return data || []
}

export async function getCompetitor(id: string): Promise<Competitor | null> {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('competitors')
        .select('*')
        .eq('id', id)
        .single()

    if (error) {
        console.error('Error fetching competitor:', error)
        return null
    }

    return data
}

export async function createCompetitor(name: string): Promise<Competitor | null> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        console.error('No user found')
        return null
    }

    const { data, error } = await supabase
        .from('competitors')
        .insert([
            {
                user_id: user.id,
                name
            }
        ])
        .select()
        .single()

    if (error) {
        console.error('Error creating competitor:', error)
        return null
    }

    revalidatePath('/dashboard/competitors-analysis')
    return data
}

export async function updateCompetitor(
    id: string,
    updates: Partial<Omit<Competitor, 'id' | 'user_id' | 'created_at' | 'updated_at'>>
): Promise<Competitor | null> {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('competitors')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

    if (error) {
        console.error('Error updating competitor:', error)
        return null
    }

    revalidatePath('/dashboard/competitors-analysis')
    return data
}

export async function deleteCompetitor(id: string): Promise<boolean> {
    const supabase = await createClient()

    const { error } = await supabase
        .from('competitors')
        .delete()
        .eq('id', id)

    if (error) {
        console.error('Error deleting competitor:', error)
        return false
    }

    revalidatePath('/dashboard/competitors-analysis')
    return true
}
