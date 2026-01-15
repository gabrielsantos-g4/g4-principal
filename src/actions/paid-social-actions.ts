'use server'

import { createClient } from '@/lib/supabase'

export async function sendCampaignSetupEmail(formData: any) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return { success: false, error: 'User not authenticated' }
        }

        // Get company/user details for the email
        const { data: profile } = await supabase
            .from('main_profiles')
            .select('full_name, company_name')
            .eq('id', user.id)
            .single()

        const companyName = profile?.company_name || 'Unknown Company'
        const userName = profile?.full_name || user.email

        const emailSubject = 'Demanda de Setup de Campanha Paid Social'
        const emailBody = `
            Company: ${companyName}
            User: ${userName}
            
            Campaign Details:
            ----------------
            Channel: ${formData.channel}
            Campaign Name: ${formData.campaignName}
            Context: ${formData.context}
            
            Ad Groups:
            ${JSON.stringify(formData.adGroups, null, 2)}
            
            Specific Fields:
            ${JSON.stringify(formData.channelSpecifics, null, 2)}
        `

        // Simulate sending email
        console.log(`
            [MOCK EMAIL SENDING]
            To: gabriel@startg4.com
            Subject: ${emailSubject}
            Body:
            ${emailBody}
        `)

        return { success: true }
    } catch (error) {
        console.error('Error sending campaign email:', error)
        return { success: false, error: 'Failed to send details' }
    }
}
