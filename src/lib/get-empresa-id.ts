import { createClient, createAdminClient } from "@/lib/supabase"

export async function getEmpresaId() {
    const supabase = await createClient()
    const supabaseAdmin = await createAdminClient()

    const { data: user, error: userError } = await supabase.auth.getUser()

    if (userError || !user.user) {
        return null
    }


    const { data: profile } = await supabaseAdmin // Use admin client
        .from('main_profiles')
        .select('empresa_id')
        .eq('id', user.user.id)
        .single()

    return profile?.empresa_id || null
}
