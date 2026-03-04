'use server'

import { createClient, createAdminClient } from '@/lib/supabase'

// ─── Types ────────────────────────────────────────────────────────────────────

export type AdShareData = {
    id: string
    name: string
    text: string
    headline: string
    cta: string
    imageUrl?: string
    videoUrl?: string
    mediaType: string
}

export type AdShareLog = {
    id: string
    user_name: string
    avatar_url: string | null
    field: string
    old_value: string
    new_value: string
    edited_at: string
}

// ─── Create a share token for an ad ──────────────────────────────────────────

export async function createAdShare(adData: AdShareData) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return { success: false, error: 'Not authenticated' }

        const admin = await createAdminClient()
        const { data: profile } = await admin
            .from('main_profiles')
            .select('empresa_id')
            .eq('id', user.id)
            .single()

        if (!profile?.empresa_id) return { success: false, error: 'Company not found' }

        const { data, error } = await supabase
            .from('ads_creative_shares')
            .insert({
                empresa_id: profile.empresa_id,
                created_by: user.id,
                ad_data: adData,
            })
            .select('token')
            .single()

        if (error) return { success: false, error: error.message }

        return { success: true, token: data.token }
    } catch (e: any) {
        return { success: false, error: e.message }
    }
}

// ─── Load a share by token (public — for the preview page) ───────────────────

export async function getAdShare(token: string) {
    try {
        const supabase = await createClient()
        const { data, error } = await supabase
            .from('ads_creative_shares')
            .select('id, token, ad_data, created_at, expires_at')
            .eq('token', token)
            .single()

        if (error) return { success: false, error: 'Share not found' }

        // Check expiry
        if (data.expires_at && new Date(data.expires_at) < new Date()) {
            return { success: false, error: 'This preview link has expired.' }
        }

        return { success: true, data }
    } catch (e: any) {
        return { success: false, error: e.message }
    }
}

// ─── Update ad_data and log the edit ─────────────────────────────────────────

export async function updateAdShare(
    token: string,
    field: string,
    oldValue: string,
    newValue: string,
    updatedAdData: AdShareData
) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return { success: false, error: 'Not authenticated' }

        const admin = await createAdminClient()
        const { data: profile } = await admin
            .from('main_profiles')
            .select('empresa_id, name')
            .eq('id', user.id)
            .single()

        if (!profile?.empresa_id) return { success: false, error: 'Company not found' }

        // 1. Update the ad_data
        const { error: updateError } = await supabase
            .from('ads_creative_shares')
            .update({ ad_data: updatedAdData })
            .eq('token', token)

        if (updateError) return { success: false, error: updateError.message }

        // 2. Log the edit in audit_logs
        await supabase
            .from('audit_logs')
            .insert({
                empresa_id: profile.empresa_id,
                user_id: user.id,
                action: 'ad_copy_edited',
                details: {
                    token,
                    field,
                    old_value: oldValue,
                    new_value: newValue,
                    ad_name: updatedAdData.name,
                    editor_name: profile.name,
                },
            })

        return { success: true }
    } catch (e: any) {
        return { success: false, error: e.message }
    }
}

// ─── Get revision logs for a share token ─────────────────────────────────────

export async function getAdShareLogs(token: string): Promise<{ success: boolean; logs?: AdShareLog[]; error?: string }> {
    try {
        const supabase = await createClient()

        const { data, error } = await supabase
            .from('audit_logs')
            .select('id, user_id, details, created_at')
            .eq('action', 'ad_copy_edited')
            .contains('details', { token })
            .order('created_at', { ascending: false })
            .limit(50)

        if (error) return { success: false, error: error.message }

        // Fetch editor names & avatars
        const userIds = [...new Set((data ?? []).map((l: any) => l.user_id).filter(Boolean))]
        let profileMap: Record<string, { name: string; avatar_url: string | null }> = {}

        if (userIds.length > 0) {
            const admin = await createAdminClient()
            const { data: profiles } = await admin
                .from('main_profiles')
                .select('id, name, avatar_url')
                .in('id', userIds)

                ; (profiles ?? []).forEach((p: any) => {
                    profileMap[p.id] = { name: p.name, avatar_url: p.avatar_url }
                })
        }

        const logs: AdShareLog[] = (data ?? []).map((l: any) => ({
            id: l.id,
            user_name: l.details?.editor_name ?? profileMap[l.user_id]?.name ?? 'Unknown',
            avatar_url: profileMap[l.user_id]?.avatar_url ?? null,
            field: l.details?.field ?? 'text',
            old_value: l.details?.old_value ?? '',
            new_value: l.details?.new_value ?? '',
            edited_at: l.created_at,
        }))

        return { success: true, logs }
    } catch (e: any) {
        return { success: false, error: e.message }
    }
}
