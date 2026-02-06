'use server'

import { createClient } from '@/lib/supabase'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

export async function signup(formData: FormData) {
    const name = formData.get('name') as string
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const companyName = formData.get('company_name') as string

    if (!name || !email || !password || !companyName) {
        return { error: 'Por favor, preencha todos os campos' }
    }


    const supabase = await createClient()

    // 1. Create User using Admin Client (Force Creation & Confirm)
    // This bypasses "fake success" states from public signUp and allows immediate login
    const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

    const adminAuthClient = createSupabaseClient(
        supabaseUrl,
        supabaseKey,
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

    // 2. Create Company (Admin Role)
    // We use the user's name to generate a default company name
    const { data: companyData, error: companyError } = await adminAuthClient
        .from('main_empresas')
        .insert({
            name: companyName,
        })
        .select()
        .single()

    if (companyError) {
        console.error('Company creation failed:', companyError)
        await adminAuthClient.auth.admin.deleteUser(adminData.user.id)
        return { error: `Falha na criação da empresa: ${companyError.message}` }
    }

    // 3. Create Profile linked to Company (Admin Role)
    const { error: profileError } = await adminAuthClient
        .from('main_profiles')
        .insert({
            id: adminData.user.id,
            empresa_id: companyData.id,
            name: name,
            role: 'admin', // First user is Admin
            active_agents: []
        })

    if (profileError) {
        console.error('Profile creation failed:', profileError)
        // Rollback
        await adminAuthClient.from('main_empresas').delete().eq('id', companyData.id)
        await adminAuthClient.auth.admin.deleteUser(adminData.user.id)
        return { error: `Falha na configuração do perfil: ${profileError.message}` }
    }

    // 4. Trigger Webhook (with 3s timeout to avoid hanging)
    try {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 3000)

        await fetch('https://hook.startg4.com/webhook/6f6a4cea-825a-4da8-b501-104c708bb7b8', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ empresa_id: companyData.id }),
            signal: controller.signal
        })
        clearTimeout(timeoutId)
    } catch (whError) {
        console.error('Webhook trigger failed or timed out:', whError)
        // We do not fail the signup because of webhook failure, just log it.
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
