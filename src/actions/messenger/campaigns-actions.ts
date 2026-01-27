"use server"

import { createClient } from "@/lib/supabase"
import { revalidatePath } from "next/cache"
import { getEmpresaId } from "@/lib/get-empresa-id"
import { r2 } from "@/lib/r2"
import { PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"
import { randomUUID } from "crypto"
import { createClient as createClientRaw } from "@supabase/supabase-js"

export type Campaign = {
    id: string
    name: string
    message_priority: 'high' | 'normal'
    message_type: 'text' | 'image' | 'video' | 'audio' | 'document'
    message_template: string
    status: 'draft' | 'sending' | 'sent' | 'paused'
    scheduled_at: string | null
    created_at: string
    message_url?: string | null
}

export async function getCampaigns() {
    const supabase = await createClient()
    const empresaId = await getEmpresaId()

    console.log('DEBUG: getCampaigns called. EmpresaId:', empresaId)

    if (!empresaId) {
        console.log('DEBUG: No empresa_id found.')
        return []
    }

    const { data, error } = await supabase
        .from('camp_campaigns')
        .select('*')
        .eq('empresa_id', empresaId)
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Error fetching campaigns:', error)
        return []
    }

    console.log(`DEBUG: Found ${data?.length} campaigns for empresa ${empresaId}`)
    return data as Campaign[]
}

export async function createCampaign(formData: FormData) {
    const supabase = await createClient()
    const empresaId = await getEmpresaId()

    if (!empresaId) {
        return { error: 'Empresa não identificada.' }
    }

    const name = formData.get('name') as string
    const messageTemplate = formData.get('message_template') as string
    const messageType = formData.get('message_type') as string || 'text'
    const messageUrl = formData.get('message_url') as string | null

    if (!name || !messageTemplate) {
        return { error: 'Nome e Mensagem são obrigatórios.' }
    }

    const { error } = await supabase
        .from('camp_campaigns')
        .insert({
            empresa_id: empresaId,
            name,
            message_template: messageTemplate,
            status: 'draft',
            message_type: messageType,
            message_url: messageUrl
        })

    if (error) {
        console.error('Error creating campaign:', error)
        return { error: 'Erro ao criar campanha.' }
    }

    revalidatePath('/dashboard/messenger/campaigns')
    return { success: true }
}

export async function updateCampaign(formData: FormData) {
    const supabase = await createClient()
    const empresaId = await getEmpresaId()

    if (!empresaId) {
        return { error: 'Empresa não identificada.' }
    }

    const id = formData.get('id') as string
    const name = formData.get('name') as string
    const messageTemplate = formData.get('message_template') as string
    const messageType = formData.get('message_type') as string
    const messageUrl = formData.get('message_url') as string | null

    if (!id || !name || !messageTemplate) {
        return { error: 'Dados inválidos.' }
    }

    const updateData: any = {
        name,
        message_template: messageTemplate,
        message_type: messageType,
    }

    if (messageUrl) {
        updateData.message_url = messageUrl
    }

    const { error } = await supabase
        .from('camp_campaigns')
        .update(updateData)
        .eq('id', id)
        .eq('empresa_id', empresaId)

    if (error) {
        console.error('Error updating campaign:', error)
        return { error: 'Erro ao atualizar campanha.' }
    }

    revalidatePath('/dashboard/messenger/campaigns')
    return { success: true }
}

export async function deleteCampaign(id: string) {
    const supabase = await createClient()
    const empresaId = await getEmpresaId()

    if (!empresaId) return { error: 'Unauthorized' }

    // Fetch campaign to get message_url before deleting
    const { data: campaign } = await supabase
        .from('camp_campaigns')
        .select('id, message_url, empresa_id')
        .eq('id', id)
        .single()

    // Delete file from R2 if exists
    if (campaign?.message_url) {
        try {
            const key = campaign.message_url.replace(`https://${process.env.NEXT_PUBLIC_R2_PUBLIC_DOMAIN}/`, '')
            if (key) {
                await r2.send(new DeleteObjectCommand({
                    Bucket: process.env.R2_BUCKET_NAME,
                    Key: key,
                }))
            }
        } catch (error) {
            console.error('Error deleting file from R2:', error)
        }
    }

    // Create Admin Client to bypass RLS for deletion (if RLS prevents it, otherwise standard client works)
    // Assuming standard client works if user owns it. If not, we use raw client.
    // Sticking to standard client first. If fails, user should check policy.

    // UPDATE: Using admin client as seen in previous logic to ensure deletion works if policies are tight.
    const supabaseAdmin = createClientRaw(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!, // Using SERVICE_ROLE_KEY from env
        {
            auth: {
                autoRefreshToken: false,
                persistSession: false,
            },
        }
    )

    const { error } = await supabaseAdmin
        .from('camp_campaigns')
        .delete()
        .eq('id', id)
        .eq('empresa_id', empresaId) // Security check

    if (error) {
        console.error('Error deleting campaign:', error)
        return { error: 'Erro ao excluir campanha.' }
    }

    revalidatePath('/dashboard/messenger/campaigns')
    return { success: true }
}

export async function getPresignedUrl(fileName: string, contentType: string) {
    const empresaId = await getEmpresaId()

    if (!empresaId) {
        return { error: 'Empresa não identificada.' }
    }

    const fileExtension = fileName.split('.').pop()
    const key = `${empresaId}/${randomUUID()}.${fileExtension}`

    const command = new PutObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME,
        Key: key,
        ContentType: contentType,
    })

    const url = await getSignedUrl(r2, command, { expiresIn: 3600 })

    return { url, key }
}

export async function triggerCampaign(
    campaignId: string,
    instanceIds: string[],
    listId: string,
    alternate: boolean
) {
    const empresaId = await getEmpresaId()

    if (!empresaId) {
        return { error: 'Empresa não identificada.' }
    }

    try {
        const payload = {
            empresa: empresaId,
            list: listId,
            template: campaignId,
            instancia: instanceIds,
            alternate: alternate ? 'yes' : 'no'
        }

        const response = await fetch('https://hook.startg4.com/webhook/fd8eeda1-4471-4294-8afb-d6517f821a99', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload)
        })

        if (!response.ok) {
            throw new Error(`Webhook error: ${response.statusText}`)
        }

        return { success: true }
    } catch (error: any) {
        console.error('Error triggering campaign:', error)
        return { error: 'Erro ao disparar campanha: ' + error.message }
    }
}
