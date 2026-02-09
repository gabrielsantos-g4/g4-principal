'use server'

import { createClient, createAdminClient } from '@/lib/supabase'
import { revalidatePath } from 'next/cache'

export async function createCompanyUser(formData: FormData) {
    try {
        const supabase = await createClient()
        const supabaseAdmin = await createAdminClient()

        const name = formData.get('name') as string
        const email = formData.get('email') as string
        const password = formData.get('password') as string

        if (!name || !email || !password) {
            return { error: 'Missing required fields' }
        }

        // 1. Verify current user is admin
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return { error: 'Unauthorized' }

        // Use admin client to bypass RLS for profile check
        const { data: profile } = await supabaseAdmin
            .from('main_profiles')
            .select('role, empresa_id')
            .eq('id', user.id)
            .single()

        // Debug
        console.log('[createCompanyUser] User:', user.id)
        console.log('[createCompanyUser] Profile:', profile)

        if (!profile) {
            return { error: `Profile not found for User ID: ${user.id}. Please contact support.` }
        }

        if (profile.role !== 'admin') {
            return { error: 'Permission denied' }
        }   // }

        // 2. Create user in auth.users
        let targetUserId = ''

        // Check if user already exists
        // Note: ensure we can find by email. listUsers doesn't filter by email directly in all versions, 
        // maybe verify the error message or try to fetch by email first if feasible.
        // Actually, createAdminClient gives full access. 
        // Better strategy: Try create. If fails, try to get user by email.

        const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
            user_metadata: { name }
        })

        if (createError) {
            // If user already exists, check if we can recover/link
            if (createError.message.includes('already been registered')) {
                // Fetch existing user to get ID - This is tricky with Supabase Admin SDK sometimes not having listUsers filters easily available depending on version.
                // But we can assume the email is what we sent.
                // CAUTION: This assumes we own this user. In a multi-tenant real SAAS, we should be careful.
                // For this project, if they are active in another company, this might be an issue.
                // But let's try to find their profile first.

                // We can't query auth.users from here easily without SQL or specific admin call.
                // Let's assume we can't easily get the ID if create fails without a "getUserByEmail" admin function.
                // Supabase Admin usually has `listUsers` or `getUserById`. 
                // We will return a clear error for now, OR valid "orphan" recovery if we had the ID.

                // Actually, we can assume the user input correct email.
                return { error: 'User already exists using this email.' }
            }
            return { error: createError.message }
        }

        targetUserId = newUser.user.id

        // 3. Create profile linked to company
        const { error: profileError } = await supabaseAdmin
            .from('main_profiles')
            .insert({
                id: targetUserId,
                email: email,
                name: name,
                role: (formData.get('role') as string) || 'member',
                empresa_id: profile.empresa_id,
                active_agents: JSON.parse((formData.get('active_agents') as string) || '[]'),
                has_messaging_access: formData.get('has_messaging_access') === 'true',
                avatar_url: formData.get('avatar_url') as string
            })

        if (profileError) {
            // If we just created the auth user, we should roll back
            if (newUser) {
                await supabaseAdmin.auth.admin.deleteUser(targetUserId)
            }
            return { error: 'Failed to create profile: ' + profileError.message }
        }

        // 4. Log action
        await supabaseAdmin.from('audit_logs').insert({
            empresa_id: profile.empresa_id,
            user_id: user.id,
            action: 'USER_CREATED',
            details: { target_user_id: targetUserId, target_email: email }
        })

        revalidatePath('/settings/team')
        return { success: true }
    } catch (err: any) {
        console.error('[createCompanyUser] Unexpected error:', err)
        return { error: 'Server error: ' + (err.message || 'Unknown') }
    }
}

export async function updateCompanyUser(formData: FormData) {
    const supabase = await createClient()
    const supabaseAdmin = await createAdminClient()

    const userId = formData.get('userId') as string
    const name = formData.get('name') as string
    const email = formData.get('email') as string
    const password = formData.get('password') as string // Optional

    if (!userId || !name || !email) {
        return { error: 'Missing required fields' }
    }

    // 1. Verify current user is admin
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    // Use admin client to bypass RLS for profile check
    const { data: profile } = await supabaseAdmin
        .from('main_profiles')
        .select('role, empresa_id')
        .eq('id', user.id)
        .single()

    if (!profile || profile.role !== 'admin') {
        return { error: 'Permission denied' }
    }

    // Verify target user belongs to same company
    const { data: targetProfile } = await supabaseAdmin
        .from('main_profiles')
        .select('empresa_id')
        .eq('id', userId)
        .single()

    if (!targetProfile || targetProfile.empresa_id !== profile.empresa_id) {
        return { error: 'Target user not found or not in your company' }
    }

    // 2. Update auth data if needed
    const authUpdates: any = { email }
    if (password) authUpdates.password = password

    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
        userId,
        authUpdates
    )

    if (updateError) {
        return { error: updateError.message }
    }

    // 3. Update profile
    const profileData: any = { name, email }

    if (formData.get('role')) profileData.role = formData.get('role') as string
    if (formData.get('avatar_url')) profileData.avatar_url = formData.get('avatar_url') as string
    if (formData.get('has_messaging_access')) {
        profileData.has_messaging_access = formData.get('has_messaging_access') === 'true'
    }
    if (formData.get('active_agents')) {
        profileData.active_agents = JSON.parse(formData.get('active_agents') as string)
    }

    const { error: profileUpdateError } = await supabaseAdmin
        .from('main_profiles')
        .update(profileData)
        .eq('id', userId)

    if (profileUpdateError) {
        return { error: 'Failed to update profile' }
    }

    // 4. Log action
    await supabaseAdmin.from('audit_logs').insert({
        empresa_id: profile.empresa_id,
        user_id: user.id,
        action: 'USER_UPDATED',
        details: { target_user_id: userId, changes: { name, email, password_changed: !!password } }
    })

    revalidatePath('/settings/team')
    return { success: true }
}

export async function getCompanyUsers() {
    const supabase = await createClient()
    const supabaseAdmin = await createAdminClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { users: [], team_order: [] }

    // Use admin client for profile check
    const { data: profile } = await supabaseAdmin
        .from('main_profiles')
        .select('empresa_id')
        .eq('id', user.id)
        .single()

    if (!profile) return { users: [], team_order: [] }

    // Fetch all profiles for this company
    const { data: profiles } = await supabaseAdmin
        .from('main_profiles')
        .select('id, name, email, role, avatar_url, has_messaging_access, active_agents')
        .eq('empresa_id', profile.empresa_id)
        .order('created_at', { ascending: true })

    // Fetch team order from company
    const { data: company } = await supabaseAdmin
        .from('main_empresas')
        .select('team_order')
        .eq('id', profile.empresa_id)
        .single()

    return {
        users: profiles || [],
        team_order: company?.team_order || []
    }
}

export async function deleteCompanyUser(userId: string) {
    const supabase = await createClient()
    const supabaseAdmin = await createAdminClient()

    if (!userId) {
        return { error: 'Missing user ID' }
    }

    // 1. Verify current user is admin
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    // Use admin client to bypass RLS for profile check
    const { data: profile } = await supabaseAdmin
        .from('main_profiles')
        .select('role, empresa_id')
        .eq('id', user.id)
        .single()

    if (!profile || profile.role !== 'admin') {
        return { error: 'Permission denied' }
    }

    // Prevent deleting yourself
    if (userId === user.id) {
        return { error: 'You cannot delete your own account' }
    }

    // Verify target user belongs to same company
    const { data: targetProfile } = await supabaseAdmin
        .from('main_profiles')
        .select('empresa_id, email, name')
        .eq('id', userId)
        .single()

    if (!targetProfile || targetProfile.empresa_id !== profile.empresa_id) {
        // Silently fail or generic error to prevent enumeration/leaks
        return { error: 'User not found' }
    }

    // 2. Delete user from auth.users (Cascade should handle profile, but we rely on Supabase behavior)
    // Note: Deleting from auth.users usually cascades to public tables if FK is set up with ON DELETE CASCADE.
    // Assuming standard Supabase setup. If not, we might need to delete profile manually first.
    // Safe bet: Delete profile first, then auth user, or rely on cascade.
    // Let's try deleting auth user directly.

    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(userId)

    if (deleteError) {
        return { error: deleteError.message }
    }

    // 3. Log action
    await supabaseAdmin.from('audit_logs').insert({
        empresa_id: profile.empresa_id,
        user_id: user.id,
        action: 'USER_DELETED',
        details: { target_user_id: userId, target_email: targetProfile.email, target_name: targetProfile.name }
    })

    revalidatePath('/settings/team')
    return { success: true }
}

export async function updateTeamOrder(order: string[]) {
    try {
        const supabase = await createClient()
        const supabaseAdmin = await createAdminClient()

        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return { error: 'Unauthorized' }

        const { data: profile } = await supabaseAdmin
            .from('main_profiles')
            .select('empresa_id, role')
            .eq('id', user.id)
            .single()

        if (!profile || profile.role !== 'admin') {
            return { error: 'Permission denied' }
        }

        const { error } = await supabaseAdmin
            .from('main_empresas')
            .update({ team_order: order })
            .eq('id', profile.empresa_id)

        if (error) return { error: error.message }

        revalidatePath('/settings/team')
        revalidatePath('/dashboard')
        return { success: true }
    } catch (err: any) {
        return { error: err.message || 'Server error' }
    }
}
