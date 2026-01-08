'use server'

import { createClient } from '@/lib/supabase'
import { revalidatePath } from 'next/cache'

export async function getCompanyDNA() {
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

    // Get the company details
    const { data: company, error } = await supabase
        .from('main_empresas')
        .select('*')
        .eq('id', profile.empresa_id)
        .single()

    if (error) {
        console.error('Error fetching company DNA:', error)
        return null
    }

    return company
}

export async function updateCompanyDNA(formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { error: 'Unauthorized' }
    }

    // Get profile to check permission/company
    const { data: profile } = await supabase
        .from('main_profiles')
        .select('empresa_id, role')
        .eq('id', user.id)
        .single()

    if (!profile?.empresa_id) {
        return { error: 'No company associated with user' }
    }

    // Extract fields
    const website = formData.get('website') as string
    const usefulLinks = formData.get('useful_links') as string
    const icp = formData.get('icp') as string
    const brandVoice = formData.get('brand_voice') as string
    const companyName = formData.get('company_name') as string // User might want to edit name too based on "Acme Corp" input

    const updates: any = {
        company_website: website,
        useful_links: usefulLinks,
        ideal_customer_profile: icp,
        brand_voice: brandVoice,
        updated_at: new Date().toISOString(),
    }

    if (companyName) {
        updates.name = companyName
    }

    const { data, error } = await supabase
        .from('main_empresas')
        .update(updates)
        .eq('id', profile.empresa_id)
        .select()

    if (error) {
        console.error('Error updating company DNA:', error)
        return { error: `Failed to update: ${error.message}` }
    }

    if (!data || data.length === 0) {
        return { error: 'No changes saved. You might not have permission (Admin role required) or the company was not found.' }
    }

    revalidatePath('/dashboard')
    return { success: true }
}
