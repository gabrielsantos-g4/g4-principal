'use server'

import { createClient, createAdminClient } from '@/lib/supabase'
import { revalidatePath } from 'next/cache'
import { r2 } from "@/lib/r2"
import { PutObjectCommand } from "@aws-sdk/client-s3"

export async function getCompanyDNA() {
    const supabase = await createClient()
    const supabaseAdmin = await createAdminClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return null

    // Get the main_profile to find the empresa_id
    const { data: profile } = await supabaseAdmin
        .from('main_profiles')
        .select('empresa_id')
        .eq('id', user.id)
        .single()

    if (!profile?.empresa_id) return null

    // Get the company details
    const { data: company, error } = await supabaseAdmin
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

    // Get profile using Admin client to bypass RLS for initial check
    const supabaseAdmin = await createAdminClient()
    const { data: profile } = await supabaseAdmin
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

    // 1. Update Company (Only if Admin or Owner)
    // Members should NOT be able to update company details
    let companyUpdateError = null;
    if (['admin', 'owner'].includes(profile.role)) {
        const { data, error } = await supabaseAdmin
            .from('main_empresas')
            .update(updates)
            .eq('id', profile.empresa_id)
            .select()

        if (error) {
            console.error('Error updating company DNA:', error)
            return { error: `Failed to update company: ${error.message}` }
        }
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
        // Enforce RBAC: Members cannot change their name
        if (profile.role === 'member' && profileUpdates.name) {
            delete profileUpdates.name
        }

        // Use Admin client for profile update to ensure it works regardless of specific RLS on updates
        // (Assuming we want to allow avatar updates even if RLS is strict)
        const { error: profileError } = await supabaseAdmin
            .from('main_profiles')
            .update(profileUpdates)
            .eq('id', user.id)

        if (profileError) {
            console.error('Error updating profile:', profileError)
            return { error: `Failed to update profile: ${profileError.message}` }
        }
    }

    // Log the company update
    if (['admin', 'owner'].includes(profile.role)) {
        await supabaseAdmin.from('audit_logs').insert({
            empresa_id: profile.empresa_id,
            user_id: user.id,
            action: 'COMPANY_UPDATED',
            details: { updates: updates }
        })
    }

    // Success if we reached here (either company updated or profile updated or both)
    revalidatePath('/dashboard')
    return { success: true }
}
