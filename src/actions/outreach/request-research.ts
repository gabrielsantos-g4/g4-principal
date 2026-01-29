'use server'

import { createClient } from '@/lib/supabase'
import { Resend } from 'resend'
import { revalidatePath } from 'next/cache'

const getResendClient = () => {
    const key = process.env.RESEND_API_KEY
    if (!key) return null
    return new Resend(key)
}

export async function requestResearch(icpData?: any) {
    const resend = getResendClient()
    console.log('DEBUG: Resend client initialized:', !!resend)
    if (!resend) {
        console.warn('DEBUG: RESEND_API_KEY is not defined in process.env')
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { error: 'Unauthorized' }
    }

    // Get company ID from profile
    const { data: profile } = await supabase
        .from('main_profiles')
        .select('empresa_id, name')
        .eq('id', user.id)
        .single()

    if (!profile?.empresa_id) {
        console.error('FAIL: No company found for user', user.id)
        return { error: `Debug Error: User ${user.email} (${user.id}) found, but has no company linked.` }
    }

    // Get company name and current ICP config (if not provided)
    let companyName = 'Unknown Company'
    let icpName = 'New Research Request'

    if (icpData) {
        // Use passed data
        icpName = icpData.example_ideal_companies || 'New Research Request'
        const { data: companyRes } = await supabase.from('main_empresas').select('name').eq('id', profile.empresa_id).single()
        companyName = companyRes?.name || 'Unknown Company'
    } else {
        // Fallback to fetching from DB
        const [companyRes, icpRes] = await Promise.all([
            supabase.from('main_empresas').select('name').eq('id', profile.empresa_id).single(),
            supabase.from('outreach_icp').select('example_ideal_companies').eq('empresa_id', profile.empresa_id).single()
        ])
        companyName = companyRes.data?.name || 'Unknown Company'
        icpName = icpRes.data?.example_ideal_companies || 'New Research Request'
    }

    // Calculate deadline (7 days from now)
    const now = new Date()
    const deadline = new Date(now)
    deadline.setDate(deadline.getDate() + 7)

    const demandData = {
        empresa_id: profile.empresa_id,
        icp_name: icpName,
        request_date: now.toISOString(),
        deadline: deadline.toISOString(),
        email_to_send: user.email,
        status: 'Pending'
    }


    // Build Webhook Payload (Dynamic from inputs)
    const webhookPayload = {
        agent_name: 'Amanda',
        company_headcount: Array.isArray(icpData?.company_headcount) ? icpData.company_headcount : (icpData?.company_headcount ? [icpData.company_headcount] : []),
        example_ideal_companies: icpData?.example_ideal_companies || '',
        company_type: Array.isArray(icpData?.company_type) ? icpData.company_type : (icpData?.company_type ? [icpData.company_type] : []),
        company_headquarter_location: icpData?.company_headquarter_location || '',
        function_or_area: Array.isArray(icpData?.function_or_area) ? icpData.function_or_area : (icpData?.function_or_area ? [icpData.function_or_area] : []),
        job_title: icpData?.job_title || '',
        seniority_level: Array.isArray(icpData?.seniority_level) ? icpData.seniority_level : (icpData?.seniority_level ? [icpData.seniority_level] : []),
        additional_instruction: icpData?.additional_instruction || '',
        user_id: user.id,
        requester: `${companyName} (ID: ${profile.empresa_id}), ${profile.name || user.email} (ID: ${user.id})`
    }

    // Send to Webhook
    try {
        const webhookUrl = 'https://hook.startg4.com/webhook/4a03306f-54de-43b6-a7ed-bf08f0515e6a'
        console.log('Sending to webhook:', webhookUrl, webhookPayload)

        const webhookResponse = await fetch(webhookUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(webhookPayload)
        })

        if (!webhookResponse.ok) {
            console.error('Webhook failed:', await webhookResponse.text())
        } else {
            console.log('Webhook success:', await webhookResponse.json())
        }
    } catch (e) {
        console.error('Error sending to webhook:', e)
    }

    const { error } = await supabase
        .from('outreach_demands')
        .insert(demandData)

    if (error) {
        console.error('Error creating demand:', error)
        return { error: 'Failed to request research' }
    }

    // Build formatted rows for the email
    const icpFields = icpData ? [
        { label: 'Company Headcount', value: Array.isArray(icpData.company_headcount) ? icpData.company_headcount.join(', ') : icpData.company_headcount },
        { label: 'Company Type', value: Array.isArray(icpData.company_type) ? icpData.company_type.join(', ') : icpData.company_type },
        { label: 'Seniority Level', value: Array.isArray(icpData.seniority_level) ? icpData.seniority_level.join(', ') : icpData.seniority_level },
        { label: 'Function or Area', value: Array.isArray(icpData.function_or_area) ? icpData.function_or_area.join(', ') : icpData.function_or_area },
        { label: 'Location', value: icpData.company_headquarter_location },
        { label: 'Job Title', value: icpData.job_title },
        { label: 'Ideal Companies', value: icpData.example_ideal_companies },
        { label: 'Additional Instructions', value: icpData.additional_instruction }
    ] : [
        { label: 'Ideal Companies', value: icpName }
    ]

    const emailRows = icpFields
        .filter(field => field.value && field.value !== '[]')
        .map(field => `
            <tr>
                <td style="padding: 8px 0; font-weight: bold; width: 180px; border-bottom: 1px solid #f0f0f0;">${field.label}:</td>
                <td style="padding: 8px 0; border-bottom: 1px solid #f0f0f0;">${field.value}</td>
            </tr>
        `).join('')

    // Send Email Notification
    if (resend) {
        try {
            const data = await resend.emails.send({
                from: 'Amanda G4 <onboarding@resend.dev>',
                to: ['jgcarnaibapro@gmail.com'],
                subject: `Demanda Amanda/Outreach - (${companyName})`,
                html: `
                    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333; border: 1px solid #1C73E8; border-radius: 8px;">
                        <h1 style="color: #1C73E8; margin-top: 0;">Nova Demanda de Pesquisa</h1>
                        <p>Uma nova solicitação foi feita através da Amanda (Outreach).</p>
                        
                        <div style="background: #f8faff; padding: 15px; border-radius: 6px; margin-bottom: 20px;">
                            <h2 style="font-size: 16px; color: #1C73E8; margin-top: 0;">Resumo da Solicitação</h2>
                            <table style="width: 100%; border-collapse: collapse;">
                                <tr>
                                    <td style="padding: 4px 0; font-weight: bold; width: 120px;">Empresa:</td>
                                    <td style="padding: 4px 0;">${companyName}</td>
                                </tr>
                                <tr>
                                    <td style="padding: 4px 0; font-weight: bold;">Solicitante:</td>
                                    <td style="padding: 4px 0;">${user.email}</td>
                                </tr>
                                <tr>
                                    <td style="padding: 4px 0; font-weight: bold;">Data:</td>
                                    <td style="padding: 4px 0;">${now.toLocaleDateString('pt-BR')} ${now.toLocaleTimeString('pt-BR')}</td>
                                </tr>
                                <tr>
                                    <td style="padding: 4px 0; font-weight: bold;">Prazo:</td>
                                    <td style="padding: 4px 0;">${deadline.toLocaleDateString('pt-BR')}</td>
                                </tr>
                            </table>
                        </div>

                        <h2 style="font-size: 16px; border-bottom: 2px solid #1C73E8; padding-bottom: 5px;">Critérios de Pesquisa (ICP)</h2>
                        <table style="width: 100%; border-collapse: collapse;">
                            ${emailRows}
                        </table>

                        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; text-align: center;">
                            <p style="font-size: 12px; color: #666;">
                                Este é um email automático gerado pelo sistema g4 AI Agents.
                                <br />Force Rebuild ID: ${Date.now()}
                            </p>
                        </div>
                    </div>
                `
            })
            console.log('DEBUG: Email send result:', data)
        } catch (emailError) {
            console.error('DEBUG: Error sending notification email:', emailError)
        }
    } else {
        console.warn('RESEND_API_KEY is not defined. Demand created but email skipped.')
    }

    revalidatePath('/dashboard/[slug]', 'page')
    return { success: true }
}
