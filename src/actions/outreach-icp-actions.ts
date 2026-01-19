'use server'

import { createClient } from '@/lib/supabase'
import { revalidatePath } from 'next/cache'

export async function getICP() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return null

    // Get the main_profile to find the empresa_id
    const { data: profile } = await supabase
        .from('main_profiles')
        .select('empresa_id')
        .eq('id', user.id)
        .single()

    if (!profile?.empresa_id) return null

    const { data: icp } = await supabase
        .from('outreach_icp')
        .select('*')
        .eq('empresa_id', profile.empresa_id)
        .single()

    return icp
}

export async function saveICP(formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { error: 'Unauthorized' }

    console.log('--- Save ICP Debug ---')
    console.log('Auth User ID:', user.id)

    const { data: profile } = await supabase
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

    const { error } = await supabase
        .from('outreach_icp')
        .upsert(data, { onConflict: 'empresa_id' })

    if (error) {
        console.error('Error saving ICP:', error)
        return { error: 'Failed to save ICP' }
    }

    revalidatePath('/dashboard/[slug]', 'page')
    return { success: true }
}
