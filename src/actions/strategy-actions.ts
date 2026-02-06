'use server'

import { createClient, createAdminClient } from '@/lib/supabase'
import { revalidatePath } from 'next/cache'

export async function createInitiative(formData: FormData) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            throw new Error('Unauthorized')
        }

        // Get company_id
        const { data: profile } = await supabase
            .from('main_profiles')
            .select('empresa_id')
            .eq('id', user.id)
            .single()

        if (!profile?.empresa_id) {
            throw new Error('User has no company linked')
        }

        const title = formData.get('title') as string
        const funnelStage = formData.get('funnelStage') as string
        const channel = formData.get('channel') as string
        const link = formData.get('link') as string
        const channelsJson = formData.get('channels') as string

        let channels = []
        try {
            channels = channelsJson ? JSON.parse(channelsJson) : []
        } catch (e) {
            console.error('Error parsing channels JSON:', e)
            channels = []
        }

        const image = formData.get('image') as File | null
        const responsibleImage = formData.get('responsibleImage') as File | null
        const campaign = formData.get('campaign') as string | null

        let imageUrl = null
        let responsibleImageUrl = null

        // Upload Main Image
        if (image && image.size > 0) {
            const fileExt = image.name.split('.').pop()
            const fileName = `${profile.empresa_id}/${Date.now()}-main.${fileExt}`

            const { error: uploadError } = await supabase.storage
                .from('strategy-assets')
                .upload(fileName, image)

            if (uploadError) {
                console.error('Error uploading image:', uploadError)
                return { error: 'Failed to upload image' }
            }

            const { data: { publicUrl } } = supabase.storage
                .from('strategy-assets')
                .getPublicUrl(fileName)

            imageUrl = publicUrl
        }

        // Upload Responsible Image
        if (responsibleImage && responsibleImage.size > 0) {
            const fileExt = responsibleImage.name.split('.').pop()
            const fileName = `${profile.empresa_id}/${Date.now()}-responsible.${fileExt}`

            const { error: uploadError } = await supabase.storage
                .from('strategy-assets')
                .upload(fileName, responsibleImage)

            if (uploadError) {
                console.error('Error uploading responsible image:', uploadError)
                return { error: 'Failed to upload responsible image' }
            }

            const { data: { publicUrl } } = supabase.storage
                .from('strategy-assets')
                .getPublicUrl(fileName)

            responsibleImageUrl = publicUrl
        }

        // Insert into DB
        const { error } = await supabase
            .from('strategy_initiatives')
            .insert({
                empresa_id: profile.empresa_id,
                title,
                funnel_stage: funnelStage,
                channel,
                link: link || null,
                image_url: imageUrl,
                responsible_image_url: responsibleImageUrl,
                channels: channels,
                campaign: campaign || null
            })


        if (error) {
            console.error('Error inserting initiative:', error)
            return { error: error.message }
        }

        revalidatePath('/dashboard/strategy-overview')
        return { success: true }
    } catch (error: any) {
        console.error('Unexpected error in createInitiative:', error)
        return { error: error.message || 'An unexpected error occurred' }
    }
}

export async function deleteInitiative(id: string) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error('Unauthorized')

        const { data: profile } = await supabase.from('main_profiles').select('empresa_id').eq('id', user.id).single()
        if (!profile?.empresa_id) throw new Error('Unauthorized')

        const { error } = await supabase.from('strategy_initiatives').delete().eq('id', id).eq('empresa_id', profile.empresa_id)

        if (error) {
            console.error('Error deleting initiative:', error)
            return { error: error.message }
        }

        revalidatePath('/dashboard/strategy-overview')
        return { success: true }
    } catch (error: any) {
        console.error('Unexpected error in deleteInitiative:', error)
        return { error: error.message || 'An unexpected error occurred' }
    }
}

export async function updateInitiative(id: string, formData: FormData) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            throw new Error('Unauthorized')
        }

        const { data: profile } = await supabase
            .from('main_profiles')
            .select('empresa_id')
            .eq('id', user.id)
            .single()

        if (!profile?.empresa_id) {
            throw new Error('Unauthorized')
        }

        const title = formData.get('title') as string
        const funnelStage = formData.get('funnelStage') as string
        const channel = formData.get('channel') as string
        const link = formData.get('link') as string
        const channelsJson = formData.get('channels') as string

        let channels = []
        try {
            channels = channelsJson ? JSON.parse(channelsJson) : []
        } catch (e) {
            console.error('Error parsing channels JSON:', e)
            channels = []
        }

        const image = formData.get('image') as File | null
        const responsibleImage = formData.get('responsibleImage') as File | null
        const campaign = formData.get('campaign') as string | null

        const updates: any = {
            title,
            funnel_stage: funnelStage,
            channel,
            link: link || null,
            channels, // Update channels
            campaign: campaign || null
        }

        if (image && image.size > 0) {
            const fileExt = image.name.split('.').pop()
            const fileName = `${profile.empresa_id}/${Date.now()}-main.${fileExt}`
            const { error: uploadError } = await supabase.storage
                .from('strategy-assets')
                .upload(fileName, image)

            if (!uploadError) {
                const { data: { publicUrl } } = supabase.storage
                    .from('strategy-assets')
                    .getPublicUrl(fileName)
                updates.image_url = publicUrl
            }
        }

        if (responsibleImage && responsibleImage.size > 0) {
            const fileExt = responsibleImage.name.split('.').pop()
            const fileName = `${profile.empresa_id}/${Date.now()}-responsible.${fileExt}`
            const { error: uploadError } = await supabase.storage
                .from('strategy-assets')
                .upload(fileName, responsibleImage)

            if (!uploadError) {
                const { data: { publicUrl } } = supabase.storage
                    .from('strategy-assets')
                    .getPublicUrl(fileName)
                updates.responsible_image_url = publicUrl
            }
        }

        const { error } = await supabase
            .from('strategy_initiatives')
            .update(updates)
            .eq('id', id)
            .eq('empresa_id', profile.empresa_id)

        if (error) {
            console.error('Error updating initiative:', error)
            return { error: error.message }
        }

        revalidatePath('/dashboard/strategy-overview')
        return { success: true }
    } catch (error: any) {
        console.error('Unexpected error in updateInitiative:', error)
        return { error: error.message || 'An unexpected error occurred' }
    }
}

export async function getInitiatives() {
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

    const { data } = await supabaseAdmin
        .from('strategy_initiatives')
        .select('*')
        .eq('empresa_id', profile.empresa_id)
        .order('created_at', { ascending: false })

    return data || []
}
