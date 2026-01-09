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
}

export async function getProspects(): Promise<Prospect[]> {
    const supabase = await createClient()

    // Assuming user is authenticated and RLS policies filter by empresa_id automatically
    const { data, error } = await supabase
        .from('outreach_prospects')
        .select('*')
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
