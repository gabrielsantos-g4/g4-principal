"use server"

import { createClient } from "@/lib/supabase-client"
import { revalidatePath } from "next/cache"

export type Instance = {
    id: string
    name: string
    status: string
    qr_code_base64?: string
    updated_at: string
}

export async function getInstances() {
    const supabase = await createClient()

    const { data: profile } = await supabase
        .from('main_profiles')
        .select('empresa_id')
        .eq('id', (await supabase.auth.getUser()).data.user?.id!)
        .single()

    if (!profile?.empresa_id) {
        return []
    }

    const { data, error } = await supabase
        .from('camp_instances')
        .select('*')
        .eq('empresa_id', profile.empresa_id)
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Error fetching instances:', error)
        return []
    }

    return data as Instance[]
}

export async function createInstance(name: string) {
    const supabase = await createClient()

    const { data: profile } = await supabase
        .from('main_profiles')
        .select('empresa_id')
        .eq('id', (await supabase.auth.getUser()).data.user?.id!)
        .single()

    if (!profile?.empresa_id) {
        return { error: 'Erro ao identificar a empresa do usuário.' }
    }

    // Validate name format
    const nameRegex = /^[a-zA-Z0-9_-]+$/
    if (!nameRegex.test(name)) {
        return { error: 'O nome deve conter apenas letras, números, hífens e underlines.' }
    }

    // Construct the unique name for Waha
    const wahaName = `${name}_${profile.empresa_id}`

    // Check uniqueness
    const { data: existing } = await supabase
        .from('camp_instances')
        .select('id')
        .eq('name', wahaName)
        .single()

    if (existing) {
        return { error: 'Já existe uma instância com este nome.' }
    }

    // Create instance in DB
    const { data, error } = await supabase
        .from('camp_instances')
        .insert({
            empresa_id: profile.empresa_id,
            name: wahaName,
            status: 'STOPPED', // Default status
        })
        .select()
        .single()

    if (error) {
        console.error('Error creating instance:', error)
        return { error: 'Erro ao criar instância. Tente novamente.' }
    }

    revalidatePath('/dashboard/messenger/instances')
    return { success: true, data }
}

export async function startInstanceSession(instanceId: string) {
    const supabase = await createClient()

    // Get instance and verify ownership
    const { data: instance, error } = await supabase
        .from('camp_instances')
        .select('empresa_id')
        .eq('id', instanceId)
        .single()

    if (error || !instance) {
        return { error: 'Instância não encontrada ou sem permissão.' }
    }

    const payload = {
        empresa_id: instance.empresa_id,
        instance_id: instanceId,
        action: 'qrcode'
    }

    try {
        const response = await fetch('https://hook.startg4.com/webhook/e774bcf1-0864-4c1c-aa54-1b4a7dcea8b0-sincronizar', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        })

        if (!response.ok) {
            return { error: `Erro na API: ${response.statusText}` }
        }

        return { success: true }

    } catch (e) {
        console.error('Webhook error:', e)
        return { error: 'Falha ao comunicar com o servidor de integração.' }
    }
}

export async function stopInstanceSession(instanceId: string) {
    const supabase = await createClient()

    const { data: instance, error } = await supabase
        .from('camp_instances')
        .select('empresa_id')
        .eq('id', instanceId)
        .single()

    if (error || !instance) {
        return { error: 'Instância não encontrada ou sem permissão.' }
    }

    const payload = {
        empresa_id: instance.empresa_id,
        instance_id: instanceId,
        action: 'pause'
    }

    try {
        const response = await fetch('https://hook.startg4.com/webhook/e774bcf1-0864-4c1c-aa54-1b4a7dcea8b0-sincronizar', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        })

        if (!response.ok) {
            return { error: `Erro na API: ${response.statusText}` }
        }

        return { success: true }

    } catch (e) {
        console.error('Webhook error:', e)
        return { error: 'Falha ao comunicar com o servidor de integração.' }
    }
}

export async function deleteInstance(instanceId: string) {
    const supabase = await createClient()

    const { data: instance, error: fetchError } = await supabase
        .from('camp_instances')
        .select('empresa_id')
        .eq('id', instanceId)
        .single()

    if (fetchError || !instance) {
        return { error: 'Instância não encontrada ou sem permissão.' }
    }

    // Call Webhook to cleanup on Waha
    const payload = {
        empresa_id: instance.empresa_id,
        instance_id: instanceId,
        action: 'delete'
    }

    try {
        await fetch('https://hook.startg4.com/webhook/e774bcf1-0864-4c1c-aa54-1b4a7dcea8b0-sincronizar', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        })
    } catch (e) {
        console.error('Webhook error (delete):', e)
        // Ensure we still delete from DB
    }

    const { error } = await supabase
        .from('camp_instances')
        .delete()
        .eq('id', instanceId)

    if (error) {
        console.error('Error deleting instance:', error)
        return { error: 'Erro ao excluir instância.' }
    }

    revalidatePath('/dashboard/messenger/instances')
    return { success: true }
}
