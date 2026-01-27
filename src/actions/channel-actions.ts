'use server'

import { createClient } from '@/lib/supabase'

export interface ChannelCategory {
    id: string
    name: string
}

export interface ChannelOption {
    id: string
    category_id: string
    name: string
    is_custom?: boolean
    end_date?: string | null
}

export async function getChannelCategories(): Promise<ChannelCategory[]> {
    console.log('Fetching channel categories...')
    const supabase = await createClient()

    try {
        const { data, error } = await supabase
            .from('strategy_channel_categories')
            .select('*')
            .order('name')

        if (error) {
            console.error('Error fetching categories:', error)
            return []
        }

        return data || []
    } catch (error) {
        console.error('Exception fetching categories:', error)
        return []
    }
}

const DEFAULT_CHANNELS: ChannelOption[] = [
    { id: '1', category_id: '1', name: 'LinkedIn' },
    { id: '2', category_id: '1', name: 'Instagram' },
    { id: '3', category_id: '1', name: 'Facebook' },
    { id: '4', category_id: '2', name: 'Google Ads' },
    { id: '5', category_id: '2', name: 'LinkedIn Ads' },
    { id: '6', category_id: '2', name: 'Meta Ads' },
    { id: '7', category_id: '3', name: 'Email Marketing' },
    { id: '8', category_id: '3', name: 'Cold Outreach' },
    { id: '9', category_id: '3', name: 'WhatsApp' },
    { id: '10', category_id: '4', name: 'YouTube' },
    { id: '11', category_id: '4', name: 'TikTok' },
    { id: '12', category_id: '4', name: 'Podcast' },
    { id: '13', category_id: '5', name: 'Blog / SEO' },
    { id: '14', category_id: '5', name: 'Newsletter' },
    { id: '15', category_id: '6', name: 'Events' }
]

export async function getChannels(): Promise<ChannelOption[]> {
    console.log('Fetching channels...')
    const supabase = await createClient()

    try {
        const { data: dbChannels, error } = await supabase
            .from('strategy_channels')
            .select('*, strategy_channel_categories!inner(name)')
            .neq('strategy_channel_categories.name', 'Campaigns')
            .order('name')

        if (error) {
            console.error('Error fetching channels:', error)
            return DEFAULT_CHANNELS
        }

        const dbData = dbChannels || []

        // Merge defaults with DB data (DB takes precedence if duplicate names exist, though unlikely for custom)
        // We want to keep all defaults visible + any custom channels user added.

        // Create a map of existing names in DB to avoid duplicates
        const dbChannelNames = new Set(dbData.map(c => c.name.toLowerCase()))

        const missingDefaults = DEFAULT_CHANNELS.filter(dc => !dbChannelNames.has(dc.name.toLowerCase()))

        // Combine: Defaults (that aren't in DB) + DB Channels
        const combined = [...missingDefaults, ...dbData].sort((a, b) => a.name.localeCompare(b.name))

        console.log('Fetched channels count (merged):', combined.length)
        return combined
    } catch (error) {
        console.error('Exception fetching channels:', error)
        return DEFAULT_CHANNELS
    }
}

export async function createChannel(name: string): Promise<ChannelOption | null> {
    const supabase = await createClient()

    // 1. Get 'Custom' category
    const { data: catData } = await supabase
        .from('strategy_channel_categories')
        .select('id')
        .eq('name', 'Custom')
        .single()

    // Default to first category if 'Custom' missing (fallback)
    let categoryId = catData?.id
    if (!categoryId) {
        const { data: firstCat } = await supabase.from('strategy_channel_categories').select('id').limit(1).single()
        categoryId = firstCat?.id
    }

    if (!categoryId) throw new Error('No categories found')

    const { data, error } = await supabase
        .from('strategy_channels')
        .insert({
            name,
            category_id: categoryId,
            is_custom: true
        })
        .select()
        .single()

    if (error) {
        console.error('Error creating channel:', error)
        return null
    }

    return data
}

export async function deleteChannel(id: string): Promise<boolean> {
    const supabase = await createClient()
    const { error } = await supabase
        .from('strategy_channels')
        .delete()
        .eq('id', id)

    if (error) {
        console.error('Error deleting channel:', error)
        return false
    }
    return true
}
