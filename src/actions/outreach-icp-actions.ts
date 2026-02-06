'use server'

import { createClient, createAdminClient } from '@/lib/supabase'
import { revalidatePath } from 'next/cache'

// Fetches the most recently created ICP to pre-fill the form
export async function getICP() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return null

    const supabaseAdmin = await createAdminClient()

    // Get the main_profile to find the empresa_id
    const { data: profile } = await supabaseAdmin
        .from('main_profiles')
        .select('empresa_id')
        .eq('id', user.id)
        .single()

    if (!profile?.empresa_id) return null

    const { data: icp } = await supabaseAdmin
        .from('outreach_icp')
        .select('*')
        .eq('empresa_id', profile.empresa_id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

    return icp
}

// Fetches all saved ICPs for the "Saved Configurations" list
export async function getSavedICPs() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return []

    const supabaseAdmin = await createAdminClient()

    const { data: profile } = await supabaseAdmin
        .from('main_profiles')
        .select('empresa_id')
        .eq('id', user.id)
        .single()

    if (!profile?.empresa_id) return []

    const { data: icps } = await supabaseAdmin
        .from('outreach_icp')
        .select('*')
        .eq('empresa_id', profile.empresa_id)
        .order('created_at', { ascending: false })

    return icps || []
}

export async function saveICP(formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { error: 'Unauthorized' }

    console.log('--- Save ICP Debug ---')
    console.log('Auth User ID:', user.id)

    const supabaseAdmin = await createAdminClient()

    const { data: profile } = await supabaseAdmin
        .from('main_profiles')
        .select('empresa_id')
        .eq('id', user.id)
        .single()

    console.log('Profile Result:', profile)

    if (!profile?.empresa_id) {
        console.error('FAIL: No company found for user')
        return { error: `Debug Error: User ${user.email} (${user.id}) found, but has no company linked. Profile data: ${JSON.stringify(profile)}` }
    }

    const data = {
        empresa_id: profile.empresa_id,
        name: formData.get('name') as string || 'Untitled Configuration',
        // Parse JSON strings for multi-select fields (sent as stringified arrays from client)
        company_headcount: JSON.parse(formData.get('company_headcount') as string || '[]'),
        company_type: JSON.parse(formData.get('company_type') as string || '[]'),
        function_or_area: JSON.parse(formData.get('function_or_area') as string || '[]'),
        seniority_level: JSON.parse(formData.get('seniority_level') as string || '[]'),

        // Text fields remain as strings
        example_ideal_companies: formData.get('example_ideal_companies') as string,
        company_headquarter_location: formData.get('company_headquarter_location') as string,
        job_title: formData.get('job_title') as string,
        additional_instruction: formData.get('additional_instruction') as string,
    }

    // Always insert a new record for now (Save As logic)
    // Future improvement: Pass an ID to update an existing preset
    const { error } = await supabaseAdmin
        .from('outreach_icp')
        .insert(data)

    if (error) {
        console.error('Error saving ICP:', error)
        return { error: 'Failed to save ICP' }
    }

    revalidatePath('/dashboard/[slug]', 'page')
    return { success: true }
}
