'use server'

import { createClient } from '@/lib/supabase'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

export async function signup(formData: FormData) {
    const name = formData.get('name') as string
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    if (!name || !email || !password) {
        return { error: 'Por favor, preencha todos os campos' }
    }


    const supabase = await createClient()

    // 1. Create User using Admin Client (Force Creation & Confirm)
    // This bypasses "fake success" states from public signUp and allows immediate login
    const adminAuthClient = createSupabaseClient(
        process.env.SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        {
            auth: {
                autoRefreshToken: false,
                persistSession: false
            }
        }
    )

    const { data: adminData, error: createError } = await adminAuthClient.auth.admin.createUser({
        email,
        password,
        email_confirm: true // Auto-confirm the email so they can login immediately
    })

    if (createError) {
        console.error('Admin Create User failed:', createError)
        // Check if error is due to existing user
        if (createError.message.includes('already has been registered') || createError.status === 400 || createError.status === 422) {
            return { error: 'Este e-mail já está cadastrado. Por favor, faça login.' }
        }
        return { error: createError.message }
    }

    if (!adminData.user) {
        return { error: 'Falha ao criar conta (Dados não retornados)' }
    }

    // 2. Create Profile (Admin Role)
    const { error: profileError } = await adminAuthClient
        .from('main_profiles')
        .insert({
            id: adminData.user.id,
            name: name,
        })

    if (profileError) {
        console.error('Profile creation failed:', profileError)
        // Rollback user if profile fails? For now, report error.
        // Ideally we should delete the user here to keep state clean.
        await adminAuthClient.auth.admin.deleteUser(adminData.user.id)
        return { error: `Falha na configuração do perfil: ${profileError.message}` }
    }

    // 3. Log the user in (Get Session Cookies)
    const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
    })

    if (signInError) {
        return { error: 'Conta criada, mas o login automático falhou. Tente entrar manualmente.' }
    }

    revalidatePath('/', 'layout')
    redirect('/dashboard')
}
