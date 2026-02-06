'use server'

import { createClient, createAdminClient } from '@/lib/supabase'

export interface AuditLogEntry {
    id: string
    created_at: string
    action: string
    details: any
    user: {
        id: string
        name: string
        email: string
    } | null
}

export async function getAuditLogs(): Promise<AuditLogEntry[]> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return []

    // Use Admin Client to ensure we can read all logs for the company
    const supabaseAdmin = await createAdminClient()

    const { data: profile } = await supabaseAdmin
        .from('main_profiles')
        .select('empresa_id')
        .eq('id', user.id)
        .single()

    if (!profile?.empresa_id) return []

    // 1. Fetch raw logs
    const { data: logs, error } = await supabaseAdmin
        .from('audit_logs')
        .select('*')
        .eq('empresa_id', profile.empresa_id)
        .order('created_at', { ascending: false })
        .limit(100)

    if (error) {
        console.error('Error fetching audit logs:', error)
        return []
    }

    if (!logs || logs.length === 0) return []

    // 2. Fetch user details manually to avoid cross-schema join issues
    const userIds = Array.from(new Set(logs.map((l: any) => l.user_id)))

    const { data: profiles } = await supabaseAdmin
        .from('main_profiles')
        .select('id, name, email') // Assuming email is in main_profiles, IF NOT we might need another way or just use name
        .in('id', userIds)

    // Map profiles for easy lookup
    const profileMap = new Map(profiles?.map((p: any) => [p.id, p]))

    // 3. Hydrate missing lead names for existing leads (Best Effort for old logs)
    const leadIdsToFetch = new Set<number>()
    logs.forEach((log: any) => {
        // Check if it's a lead-related action AND missing the name snapshot
        if (log.details?.lead_id && !log.details.name && typeof log.details.lead_id === 'number') {
            leadIdsToFetch.add(log.details.lead_id)
        }
    })

    let leadMap = new Map<number, string>()
    if (leadIdsToFetch.size > 0) {
        const { data: leads } = await supabaseAdmin
            .from('main_crm')
            .select('id, name')
            .in('id', Array.from(leadIdsToFetch))

        if (leads) {
            leads.forEach((l: any) => leadMap.set(l.id, l.name))
        }
    }

    // 4. Construct result
    return logs.map((log: any) => {
        const userProfile = profileMap.get(log.user_id)

        // Patch details if name was fetched
        let finalDetails = { ...log.details }
        if (finalDetails.lead_id && !finalDetails.name && leadMap.has(finalDetails.lead_id)) {
            finalDetails.name = leadMap.get(finalDetails.lead_id)
        }

        return {
            id: log.id,
            created_at: log.created_at,
            action: log.action,
            details: finalDetails,
            user: {
                id: log.user_id,
                name: userProfile?.name || 'Unknown',
                email: userProfile?.email || 'Unknown'
            }
        }
    })
}

export async function logAction(action: string, details: any) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) return

        const supabaseAdmin = await createAdminClient()

        const { data: profile } = await supabaseAdmin
            .from('main_profiles')
            .select('empresa_id')
            .eq('id', user.id)
            .single()

        if (!profile?.empresa_id) return

        await supabaseAdmin
            .from('audit_logs')
            .insert({
                empresa_id: profile.empresa_id,
                user_id: user.id,
                action,
                details
            })

    } catch (error) {
        console.error('Error logging action:', error)
        // Fail silently to avoid breaking the main flow
    }
}
