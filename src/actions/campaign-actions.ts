'use server'

import { createClient } from '@/lib/supabase'
import { ChannelOption } from './channel-actions'

export async function getCampaigns(): Promise<ChannelOption[]> {
    console.log('Fetching campaigns...')
    const supabase = await createClient()

    try {
        const { data, error } = await supabase
            .from('strategy_channels')
            .select(`
                *,
                strategy_channel_categories!inner(name)
            `)
            .eq('strategy_channel_categories.name', 'Campaigns')
            .order('name')

        if (error) {
            console.error('Error fetching campaigns:', error)
            return []
        }

        return data || []
    } catch (error) {
        console.error('Exception fetching campaigns:', error)
        return []
    }
}

export async function createCampaign(name: string, endDate?: string | null): Promise<ChannelOption | null> {
    const supabase = await createClient()

    // 1. Get 'Campaigns' category
    const { data: catData } = await supabase
        .from('strategy_channel_categories')
        .select('id')
        .eq('name', 'Campaigns')
        .single()

    if (!catData?.id) {
        console.error('Campaigns category not found')
        return null
    }

    const { data, error } = await supabase
        .from('strategy_channels')
        .insert({
            name,
            category_id: catData.id,
            is_custom: true, // Campaigns are always user-generated/custom lists
            end_date: endDate || null
        })
        .select()
        .single()

    if (error) {
        console.error('Error creating campaign:', error)
        return null
    }

    return data
}

export async function updateCampaign(id: string, name: string, endDate?: string | null): Promise<ChannelOption | null> {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('strategy_channels')
        .update({
            name,
            end_date: endDate || null
        })
        .eq('id', id)
        .select()
        .single()

    if (error) {
        console.error('Error updating campaign:', error)
        return null
    }

    return data
}
