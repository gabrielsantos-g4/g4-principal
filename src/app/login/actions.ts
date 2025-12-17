'use server'

import { createClient } from '@/lib/supabase'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

export async function login(formData: FormData) {
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    const supabase = await createClient()

    const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
    })

    if (error) {
        return { error: error.message }
    }

    // Verificar perfil (opcional por enquanto, mas boa prática)
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
        const { data: profile, error: profileError } = await supabase
            .from('ads_profiles')
            .select('*')
            .eq('id', user.id)
            .single()

        // Se quiser, logar ou tratar ausência de perfil aqui
    }

    revalidatePath('/', 'layout')
    redirect('/dashboard')
}
