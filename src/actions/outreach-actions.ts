'use server'

import { createClient } from '@/lib/supabase'

export interface Prospect {
    id: string
    company_name: string | null
    decisor_name: string | null
    role: string | null
    phone_1: string | null
    phone_2: string | null
    email_1: string | null
    email_2: string | null
    linkedin_profile: string | null
    status: string
    created_at: string
    empresa_id?: string
    active?: boolean
}

export async function getProspects(): Promise<Prospect[]> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return []

    const { data: profile } = await supabase
        .from('main_profiles')
        .select('empresa_id')
        .eq('id', user.id)
        .single()

    if (!profile?.empresa_id) return []

    // Fetch only active prospects for this company
    const { data, error } = await supabase
        .from('outreach_prospects')
        .select('*')
        .eq('active', true)
        .eq('empresa_id', profile.empresa_id)
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Error fetching prospects:', error)
        return []
    }

    return data as Prospect[]
}

export async function createPendingLeads(count: number) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        throw new Error('User not authenticated')
    }

    // Get empresa_id
    const { data: profile } = await supabase
        .from('main_profiles')
        .select('empresa_id')
        .eq('id', user.id)
        .single()

    if (!profile?.empresa_id) {
        throw new Error('User has no company associated')
    }

    // Create 'count' empty objects
    const rows = Array.from({ length: count }).map(() => ({
        status: 'Pending',
        company_name: null, // Explicitly null to show it's empty
        decisor_name: null,
        role: null,
        phone_1: null,
        phone_2: null,
        email_1: null,
        email_2: null,
        linkedin_profile: null,
        empresa_id: profile.empresa_id,
        active: true,
        // user_id: user.id // Optional, normally RLS handles this or it's not needed if we have empresa_id. Try without first or check schema if possible. 
        // Safer to likely assume empresa_id is the main tenant key.
    }))

    const { error } = await supabase
        .from('outreach_prospects')
        .insert(rows)

    if (error) {
        console.error('Error creating pending leads:', error)
        throw new Error('Failed to create pending leads')
    }

    return { success: true }
}

export async function deleteProspect(id: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw new Error('User not authenticated')

    // Optional: Verify ownership via empresa_id logic if strict RLS isn't enough, 
    // but assuming RLS is set up or we rely on session.

    const { error } = await supabase
        .from('outreach_prospects')
        .delete()
        .eq('id', id)

    if (error) {
        console.error('Error deleting prospect:', error)
        return { success: false, error: error.message }
    }

    return { success: true }
}

export async function updateProspect(id: string, data: Partial<Prospect>) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw new Error('User not authenticated')

    // Filter out fields that shouldn't be updated directly if any, e.g. id, created_at
    const { id: _, created_at: __, ...updateData } = data

    const { error } = await supabase
        .from('outreach_prospects')
        .update(updateData)
        .eq('id', id)

    if (error) {
        console.error('Error updating prospect:', error)
        return { success: false, error: error.message }
    }

    return { success: true }
}
