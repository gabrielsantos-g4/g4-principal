'use server'

import { createClient } from '@/lib/supabase'
import { revalidatePath } from 'next/cache'

export async function requestResearch() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { error: 'Unauthorized' }
    }

    // Get company ID from profile
    const { data: profile } = await supabase
        .from('main_profiles')
        .select('empresa_id')
        .eq('id', user.id)
        .single()

    if (!profile?.empresa_id) {
        console.error('FAIL: No company found for user', user.id)
        return { error: `Debug Error: User ${user.email} (${user.id}) found, but has no company linked. Profile data: ${JSON.stringify(profile)}` }
    }

    // Get current ICP config to get the name
    const { data: icp } = await supabase
        .from('outreach_icp')
        .select('example_ideal_companies')
        .eq('empresa_id', profile.empresa_id)
        .single()

    const icpName = icp?.example_ideal_companies || 'New Research Request'

    // Calculate deadline (7 days from now)
    const now = new Date()
    const deadline = new Date(now)
    deadline.setDate(deadline.getDate() + 7)

    const { error } = await supabase
        .from('outreach_demands')
        .insert({
            empresa_id: profile.empresa_id,
            icp_name: icpName,
            request_date: now.toISOString(),
            deadline: deadline.toISOString(),
            email_to_send: user.email,
            status: 'Pending'
        })

    if (error) {
        console.error('Error creating demand:', error)
        return { error: 'Failed to request research' }
    }

    revalidatePath('/dashboard/[slug]', 'page')
    return { success: true }
}
