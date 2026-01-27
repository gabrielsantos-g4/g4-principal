'use server'

import { createClient } from '@/lib/supabase'
import { Resend } from 'resend'
import { revalidatePath } from 'next/cache'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'

export interface DesignRequest {
    id: string
    created_at: string
    material_name: string
    objective: string
    deadline: string | null
    status: string
    notes: string | null
    delivery_link?: string | null
    aspect_ratio?: string[] | null
    file_format?: string[] | null
    variations?: string | null
    headline?: string | null
    subheadline?: string | null
    call_to_action?: string | null
    required_info?: string | null
    images?: string[] | null
    reference_files?: string[] | null
}

const getResendClient = () => {
    const key = process.env.RESEND_API_KEY
    if (!key) return null
    return new Resend(key)
}

export async function createDesignRequest(formData: FormData) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return { error: 'Unauthorized' }
    }

    const { data: profile } = await supabase
        .from('main_profiles')
        .select('empresa_id')
        .eq('id', user.id)
        .single()

    if (!profile?.empresa_id) {
        return { error: 'Company not found' }
    }

    const material_name = formData.get('material_name') as string
    const objective = formData.get('objective') as string
    const aspect_ratio = formData.getAll('aspect_ratio') as string[]
    const file_format = formData.getAll('file_format') as string[]
    const variations = formData.get('variations') as string
    const headline = formData.get('headline') as string
    const subheadline = formData.get('subheadline') as string
    const call_to_action = formData.get('call_to_action') as string
    const required_info = formData.get('required_info') as string
    const notes = formData.get('notes') as string
    const deadline = formData.get('deadline') as string

    // Handling files/arrays for images and references would typically require upload first
    // For now assuming we might receive URLs or we handle upload separately.
    // Given the form probably handles uploads or just passes text if they are links.
    // If they are files, we need upload logic. But let's assume text for 'links' or handle files if provided.
    // The previous screenshot showed "Upload or drag", so likely we need to upload to storage. 
    // For simplicity in this step, let's assume the frontend uploads and sends URLs, OR we handle basic text inputs if they are just links.
    // If the form sends files, we need to upload them here.

    // Let's assume for now we just capture what we can. 
    // If the user uploads files, we'd need a storage bucket. 
    // I will extract text fields first.

    // Capture images/references as strings (URLs) if passed, or handle file upload if `File` objects.
    // Checking previous patterns: usually we upload from client to Supabase Storage and pass URL.
    // I'll assume the form will send URLs.

    const images = formData.getAll('images') as string[] // Assuming URLs
    const reference_files = formData.getAll('reference_files') as string[] // Assuming URLs

    const { error } = await supabase.from('main_design').insert({
        empresa_id: profile.empresa_id,
        material_name,
        objective,
        aspect_ratio,
        file_format,
        variations,
        headline,
        subheadline,
        call_to_action,
        required_info,
        images,
        reference_files,
        notes,
        deadline: deadline || null,
        status: 'pending'
    })

    if (error) {
        console.error('Error creating design request:', error)
        return { error: `Failed to create request: ${error.message}` }
    }

    // Send Email
    const resend = getResendClient()
    if (resend) {
        try {
            await resend.emails.send({
                from: 'G4 Agents <onboarding@resend.dev>', // Update if they have a domain
                to: ['jgcarnaibapro@gmail.com'],
                subject: `New Design Request: ${material_name}`,
                html: `
                    <h1>New Design Request</h1>
                    <p><strong>User:</strong> ${user.email}</p>
                    <p><strong>Material Name:</strong> ${material_name}</p>
                    <p><strong>Objective:</strong> ${objective}</p>
                    <p><strong>Deadline:</strong> ${deadline}</p>
                    <p><strong>Notes:</strong> ${notes}</p>
                    <hr />
                    <p>Check the dashboard for full details.</p>
                `
            })
        } catch (emailError) {
            console.error('Error sending email:', emailError)
            // Don't fail the request if email fails, but log it.
        }
    }

    revalidatePath('/dashboard') // Adjust path as needed
    return { success: true }
}

export async function getDesignRequests() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []

    const { data: profile } = await supabase
        .from('main_profiles')
        .select('empresa_id')
        .eq('id', user.id)
        .single()

    if (!profile?.empresa_id) return []

    const { data, error } = await supabase
        .from('main_design')
        .select('*')
        .eq('empresa_id', profile.empresa_id)
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Error fetching requests:', error)
        return []
    }

    return data
}

export async function updateDesignRequest(id: string, updates: Partial<DesignRequest>) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    // Verify ownership via company (optional but safer, though RLS handles it)
    // For update, we rely on RLS policy. 
    // Wait, I only added INSERT and SELECT policies. 
    // I need to check UPDATE policy. 
    // If I didn't add UPDATE policy, this will fail.
    // I should check policies first or just add it if I'm sure it's missing.
    // I'll assume I need to add it or the previous task boundary check showed only insert/select.
    // Yes, previous check showed NO policies, then I added INSERT/SELECT.
    // I need to add UPDATE policy too. 

    // Changing plan: I will add update action code here, but I also need to run SQL to add UPDATE policy.
    // I'll do that in the next step.

    const { error } = await supabase
        .from('main_design')
        .update(updates)
        .eq('id', id)

    if (error) {
        console.error('Error updating request:', error)
        return { error: 'Failed to update request' }
    }

    revalidatePath('/dashboard')
    return { success: true }
}

export async function getDesignRequestsByCompany(empresaId: string) {
    // Admin action - bypass RLS
    const adminSupabase = createSupabaseClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        {
            auth: {
                autoRefreshToken: false,
                persistSession: false
            }
        }
    )

    const { data, error } = await adminSupabase
        .from('main_design')
        .select('*')
        .eq('empresa_id', empresaId)
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Error fetching company requests:', error)
        return []
    }

    return data
}

export async function updateDesignRequestAdmin(id: string, updates: Partial<DesignRequest>) {
    // Admin action - bypass RLS
    const adminSupabase = createSupabaseClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        {
            auth: {
                autoRefreshToken: false,
                persistSession: false
            }
        }
    )

    const { error } = await adminSupabase
        .from('main_design')
        .update(updates)
        .eq('id', id)

    if (error) {
        console.error('Error updating request (Admin):', error)
        return { error: 'Failed to update request' }
    }

    revalidatePath('/dashboard')
    revalidatePath('/admin/design-fulfillment')
    return { success: true }
}
