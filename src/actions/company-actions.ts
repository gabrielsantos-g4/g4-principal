'use server'

import { createClient } from '@/lib/supabase'
import { revalidatePath } from 'next/cache'
import { r2 } from "@/lib/r2"
import { PutObjectCommand } from "@aws-sdk/client-s3"

export async function getCompanyDNA() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return null

    // Get the main_profile to find the empresa_id
    const { data: profile } = await supabase
        .from('main_profiles')
        .select('empresa_id')
        .eq('id', user.id)
        .single()

    if (!profile?.empresa_id) return null

    // Get the company details
    const { data: company, error } = await supabase
        .from('main_empresas')
        .select('*')
        .eq('id', profile.empresa_id)
        .single()

    if (error) {
        console.error('Error fetching company DNA:', error)
        return null
    }

    return company
}

export async function updateCompanyDNA(formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { error: 'Unauthorized' }
    }

    // Get profile to check permission/company
    const { data: profile } = await supabase
        .from('main_profiles')
        .select('empresa_id, role')
        .eq('id', user.id)
        .single()

    if (!profile?.empresa_id) {
        return { error: 'No company associated with user' }
    }

    // Extract fields
    const website = formData.get('website') as string
    const usefulLinks = formData.get('useful_links') as string
    const icp = formData.get('icp') as string
    const brandVoice = formData.get('brand_voice') as string
    const companyName = formData.get('company_name') as string
    const userName = formData.get('user_name') as string
    const avatarFile = formData.get('avatar_file') as File
    const companySize = formData.get('company_size') as string
    const mainChallenge = formData.get('main_challenge') as string
    const mainGoal = formData.get('main_goal') as string

    const updates: any = {
        company_website: website,
        useful_links: usefulLinks,
        ideal_customer_profile: icp,
        brand_voice: brandVoice,
        company_size: companySize,
        main_challenge: mainChallenge,
        main_goal: mainGoal,
        updated_at: new Date().toISOString(),
    }

    if (companyName) {
        updates.name = companyName
    }

    // 1. Update Company
    const { data, error } = await supabase
        .from('main_empresas')
        .update(updates)
        .eq('id', profile.empresa_id)
        .select()

    if (error) {
        console.error('Error updating company DNA:', error)
        return { error: `Failed to update company: ${error.message}` }
    }

    // 2. Handle User Profile Updates (Name & Avatar)
    let avatarUrl = null
    if (avatarFile && avatarFile.size > 0) {
        try {
            const buffer = Buffer.from(await avatarFile.arrayBuffer())
            const timestamp = Date.now()
            const cleanName = avatarFile.name.replace(/[^a-zA-Z0-9.]/g, '_')
            const key = `${profile.empresa_id}/avatars/${user.id}/${timestamp}-${cleanName}`

            const command = new PutObjectCommand({
                Bucket: process.env.R2_BUCKET_NAME,
                Key: key,
                Body: buffer,
                ContentType: avatarFile.type,
                ACL: 'public-read', // Ensure public access if needed, or rely on bucket policy
            })

            await r2.send(command)
            avatarUrl = `https://${process.env.NEXT_PUBLIC_R2_PUBLIC_DOMAIN}/${key}`
        } catch (uploadError: any) {
            console.error('Avatar upload failed:', uploadError)
            return { error: `Failed to upload avatar: ${uploadError?.message}` }
        }
    }

    const profileUpdates: any = {
        updated_at: new Date().toISOString(),
    }

    if (userName) profileUpdates.name = userName
    if (avatarUrl) profileUpdates.avatar_url = avatarUrl

    if (Object.keys(profileUpdates).length > 1) { // updated_at is always there
        const { error: profileError } = await supabase
            .from('main_profiles')
            .update(profileUpdates)
            .eq('id', user.id)

        if (profileError) {
            console.error('Error updating profile:', profileError)
            return { error: `Failed to update profile: ${profileError.message}` }
        }
    }



    if (!data || data.length === 0) {
        return { error: 'No changes saved. You might not have permission (Admin role required) or the company was not found.' }
    }

    revalidatePath('/dashboard')
    return { success: true }
}
