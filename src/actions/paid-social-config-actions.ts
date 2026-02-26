'use server'

import { createClient, createAdminClient } from '@/lib/supabase'
import { revalidatePath } from 'next/cache'

export async function getPlatformConfig(platform: string) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            throw new Error('User not authenticated')
        }

        const supabaseAdmin = await createAdminClient()
        const { data: profile } = await supabaseAdmin
            .from('main_profiles')
            .select('empresa_id')
            .eq('id', user.id)
            .single()

        if (!profile?.empresa_id) {
            return { success: false, error: 'Company not found' }
        }

        const { data, error } = await supabase
            .from('paid_social_configs')
            .select('*')
            .eq('empresa_id', profile.empresa_id)
            .eq('platform', platform)
            .single()

        if (error && error.code !== 'PGRST116') { // PGRST116 is "No rows found"
            console.error(`Error fetching ${platform} config:`, error)
            return { success: false, error: error.message }
        }

        return { success: true, data: data || null }
    } catch (error: any) {
        console.error(`Unexpected error fetching ${platform} config:`, error)
        return { success: false, error: error.message }
    }
}

export async function savePlatformConfig(platform: string, config: any) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            throw new Error('User not authenticated')
        }

        const supabaseAdmin = await createAdminClient()
        const { data: profile } = await supabaseAdmin
            .from('main_profiles')
            .select('empresa_id')
            .eq('id', user.id)
            .single()

        if (!profile?.empresa_id) {
            return { success: false, error: 'Company not found' }
        }

        const { data, error } = await supabase
            .from('paid_social_configs')
            .upsert({
                empresa_id: profile.empresa_id,
                platform,
                config,
                updated_at: new Date().toISOString()
            }, {
                onConflict: 'empresa_id, platform'
            })
            .select()
            .single()

        if (error) {
            console.error(`Error saving ${platform} config:`, error)
            return { success: false, error: error.message }
        }

        revalidatePath('/dashboard/[slug]', 'page')
        return { success: true, data }
    } catch (error: any) {
        console.error(`Unexpected error saving ${platform} config:`, error)
        return { success: false, error: error.message }
    }
}
