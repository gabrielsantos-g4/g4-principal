"use server"

import { createClient } from "@/lib/supabase-client"
import { revalidatePath } from "next/cache"
import { getEmpresaId } from "@/lib/get-empresa-id"

export async function getSettings() {
    const supabase = await createClient()
    const empresaId = await getEmpresaId()

    if (!empresaId) return null

    const { data } = await supabase
        .from('main_empresas')
        .select('wpp_name')
        .eq('id', empresaId)
        .single()

    return data
}

export async function updateSettings(formData: FormData) {
    const supabase = await createClient()
    const empresaId = await getEmpresaId()

    if (!empresaId) return { error: 'Empresa não identificada' }

    const wppName = formData.get('wpp_name') as string

    const { error } = await supabase
        .from('main_empresas')
        .update({ wpp_name: wppName })
        .eq('id', empresaId)

    if (error) {
        console.error('Error updating settings:', error)
        return { error: 'Erro ao salvar configurações.' }
    }

    revalidatePath('/dashboard/messenger/settings')
    return { success: true }
}
