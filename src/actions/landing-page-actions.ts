'use server'

import { createClient } from '@/lib/supabase'

export async function saveLandingPageContent(empresaId: string, content: string) {
    const supabase = await createClient()

    // Upsert — uma entrada por empresa
    const { error } = await supabase
        .from('landing_page')
        .upsert({ empresa_id: empresaId, content, updated_at: new Date().toISOString() }, {
            onConflict: 'empresa_id',
        })

    if (error) return { error: error.message }
    return { success: true }
}

export async function getLandingPageContent(empresaId: string): Promise<string> {
    const supabase = await createClient()
    const { data } = await supabase
        .from('landing_page')
        .select('content')
        .eq('empresa_id', empresaId)
        .single()
    return data?.content ?? ''
}
