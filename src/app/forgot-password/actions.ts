'use server'

import { createClient } from '@/lib/supabase'

export async function resetPassword(formData: FormData) {
    const email = formData.get('email') as string

    if (!email) {
        return { error: 'Por favor, insira seu e-mail.' }
    }

    const supabase = await createClient()

    // We use the public client here, as it's a standard auth flow
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/callback?next=/update-password`,
    })

    if (error) {
        console.error('Reset password error:', error)
        // For security, sometimes we don't want to reveal if email exists, 
        // but for this internal tool, giving feedback is fine.
        return { error: error.message }
    }

    return { success: 'Verifique seu e-mail para o link de redefinição.' }
}
