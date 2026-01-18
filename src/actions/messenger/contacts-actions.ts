"use server"

import { createClient } from "@/lib/supabase-client"
import { revalidatePath } from "next/cache"
import { getEmpresaId } from "@/lib/get-empresa-id"

export type ContactList = {
    id: string
    created_at: string
    nome: string | null
    empresa: string | null
}

export type Contact = {
    id: string
    created_at: string
    name: string | null
    phone: string
    status?: string | null
    tags?: string[] | null
    campaigns_id?: { id: string; name: string }[] | null
    send_campaigns?: boolean | null
}

export async function getContactLists() {
    const supabase = await createClient()
    const empresaId = await getEmpresaId()

    if (!empresaId) {
        return []
    }

    const { data, error } = await supabase
        .from('camp_list_contacts')
        .select('*')
        .eq('empresa', empresaId)
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Error fetching contact lists:', error)
        return []
    }

    return data as ContactList[]
}

export async function getContactsByListId(listId: string) {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('camp_contacts')
        .select('*')
        .eq('list_id', listId)
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Error fetching contacts for list:', error)
        return []
    }

    return data as Contact[]
}


export async function getContactListCount(listId: string) {
    const supabase = await createClient()

    const { count, error } = await supabase
        .from('camp_contacts')
        .select('*', { count: 'exact', head: true })
        .eq('list_id', listId)

    if (error) {
        console.error('Error fetching count:', error)
        throw new Error('Failed to fetch count')
    }

    return count || 0
}
export async function updateContactSubscription(contactId: string, status: boolean) {
    const supabase = await createClient()

    const { error } = await supabase
        .from('camp_contacts')
        .update({ send_campaigns: status })
        .eq('id', contactId)

    if (error) {
        console.error('Error updating subscription:', error)
        return { error: 'Falha ao atualizar inscrição.' }
    }

    revalidatePath('/dashboard/messenger/contacts/[id]', 'page')
    return { success: true }
}

export async function deleteContactList(id: string) {
    const supabase = await createClient()

    const { error } = await supabase
        .from('camp_list_contacts')
        .delete()
        .eq('id', id)

    if (error) {
        return { error: 'Failed to delete contact list' }
    }

    revalidatePath('/dashboard/messenger/contacts')
    return { success: true }
}

export async function uploadContacts(formData: FormData) {
    // 1. Get user's empresa_id
    const empresaId = await getEmpresaId()

    if (!empresaId) {
        return { error: 'Erro ao identificar a empresa do usuário.' }
    }

    // 2. Prepare FormData for Webhook
    const file = formData.get('file') as File
    const listName = formData.get('list_name') as string

    if (!file) {
        return { error: 'Nenhum arquivo enviado.' }
    }

    const webhookFormData = new FormData()
    webhookFormData.append('file', file)
    webhookFormData.append('empresa_id', empresaId)
    if (listName) {
        webhookFormData.append('list_name', listName)
    }

    // 3. Send to Webhook
    try {
        const response = await fetch('https://hook.startg4.com/webhook/7b533050-ed0c-4cb8-9f95-d677a4a0f6af-upload', {
            method: 'POST',
            body: webhookFormData,
        })

        if (!response.ok) {
            return { error: `Erro no upload: ${response.statusText}` }
        }

        const result = await response.json()
        revalidatePath('/dashboard/messenger/contacts')

        return result

    } catch (e) {
        console.error('Webhook upload error:', e)
        return { error: 'Falha ao enviar arquivo para processamento.' }
    }
}
