'use server'

import { createClient } from '@/lib/supabase'
import { revalidatePath } from 'next/cache'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'

export interface CompanySearchResult {
    id: string
    name: string
    users: { id: string, email: string }[]
}

/**
 * Searches for companies by name OR by user email.
 * Uses Service Role Key to bypass RLS since this is an admin action.
 */
export async function searchCompanies(query: string): Promise<CompanySearchResult[]> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    // Initialize Admin Client to bypass RLS
    // NOTE: This key is only available server-side, which is safe here in a server action.
    const adminSupabase = createSupabaseClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        {
            auth: {
                autoRefreshToken: false,
                persistSession: false
            }
        }
    )

    let companyIds = new Set<string>()
    const sanitizedQuery = query?.trim() || ''

    // 1. Search Profiles by Email (Primary)
    if (sanitizedQuery.length >= 2) {
        const { data: profiles } = await adminSupabase
            .from('main_profiles')
            .select('empresa_id')
            .ilike('email', `%${sanitizedQuery}%`)
            .not('empresa_id', 'is', null)
            .limit(10)

        profiles?.forEach(p => companyIds.add(p.empresa_id))
    }

    // 2. Search Companies by Name (Secondary)
    if (sanitizedQuery.length >= 2) {
        // Corrected column name: 'name' instead of 'nome_fantasia'
        const { data: companies } = await adminSupabase
            .from('main_empresas')
            .select('id')
            .ilike('name', `%${sanitizedQuery}%`)
            .limit(10)

        companies?.forEach(c => companyIds.add(c.id))
    }

    // Default: fetch recent if search is empty or no results from search yet (and query is empty)
    if (companyIds.size === 0 && sanitizedQuery.length < 2) {
        const { data: companies } = await adminSupabase
            .from('main_empresas')
            .select('id')
            .limit(10)
            .order('created_at', { ascending: false }) // Show newest first

        companies?.forEach(c => companyIds.add(c.id))
    }

    if (companyIds.size === 0) return []

    const uniqueIds = Array.from(companyIds).slice(0, 10)

    // 3. Fetch Full Details (using admin client)
    const results: CompanySearchResult[] = []

    for (const id of uniqueIds) {
        const { data: company, error } = await adminSupabase
            .from('main_empresas')
            .select('id, name')
            .eq('id', id)
            .single()

        if (error || !company) continue

        const { data: users } = await adminSupabase
            .from('main_profiles')
            .select('id, email')
            .eq('empresa_id', id)

        results.push({
            id: company.id,
            name: company.name || 'Unnamed Company',
            users: (users || []).map(u => ({
                id: u.id,
                email: u.email || 'No Email'
            }))
        })
    }

    return results
}

/**
 * Uploads a list of prospects for a specific company.
 */
export async function uploadProspects(empresaId: string, prospects: any[]) {
    const supabase = await createClient()

    if (!empresaId) return { error: 'Company ID is required' }
    if (!prospects || prospects.length === 0) return { error: 'No prospects to upload' }

    // Map fields to table schema
    const rows = prospects.map(p => ({
        empresa_id: empresaId,
        company_name: p.company_name,
        decisor_name: p.decisor_name,
        role: p.role,
        phone_1: p.phone_1,
        phone_2: p.phone_2,
        email_1: p.email_1,
        email_2: p.email_2,
        linkedin_profile: p.linkedin_profile,
        status: p.status || 'Pending',
        // created_at will be default now()
    }))

    const { error } = await supabase
        .from('outreach_prospects')
        .insert(rows)

    if (error) {
        console.error('Error uploading prospects:', error)
        return { error: 'Failed to upload prospects: ' + error.message }
    }

    // Revalidate dashboard to show new leads immediately if the user is looking
    revalidatePath('/dashboard/outreach')

    return { success: true, count: rows.length }
}
