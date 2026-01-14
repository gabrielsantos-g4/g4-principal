import { createClient } from "@/lib/supabase-client"

export async function getEmpresaId() {
    const supabase = await createClient()

    const { data: user, error: userError } = await supabase.auth.getUser()

    if (userError || !user.user) {
        return null
    }

    const { data: profile } = await supabase
        .from('main_profiles')
        .select('empresa_id')
        .eq('id', user.user.id)
        .single()

    return profile?.empresa_id || null
}
