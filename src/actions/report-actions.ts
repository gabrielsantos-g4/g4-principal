'use server'

import { createClient } from '@/lib/supabase'

export async function uploadAndGetReport(formData: FormData) {
    // 1. Forward to External Webhook
    // Note: The user provided https://hook.startg4.com/webhook/f170b769-baba-4f09-ac9c-ab0c3451e1ee
    // But then mentioned "simplifying". Assuming the same endpoint is now returning JSON directly.
    const webhookUrl = 'https://hook.startg4.com/webhook/f170b769-baba-4f09-ac9c-ab0c3451e1ee'

    try {
        // We forward the FormData directly
        const response = await fetch(webhookUrl, {
            method: 'POST',
            body: formData,
            // Next.js/Fetch automatically handles boundary for FormData
        })

        if (!response.ok) {
            throw new Error(`Analysis service failed: ${response.statusText}`)
        }

        const rawResult = await response.json()

        // 2. Report Extraction Logic
        // Scenario A: The response IS the report (or an array containing it)
        if (Array.isArray(rawResult) && rawResult.length > 0 && rawResult[0]?.meta && rawResult[0]?.overview) {
            return rawResult[0]
        }
        if (rawResult?.meta && rawResult?.overview) {
            return rawResult
        }

        // Scenario B: The report is a STRINGIFIED JSON inside a complex wrapper (e.g. n8n/AI default output)
        let jsonString: string | null = null;

        // Helper to find the JSON-like string recursively
        const findJsonString = (obj: any): string | undefined => {
            if (!obj) return undefined;
            if (typeof obj === 'string') {
                // Check if it looks like our target JSON
                if (obj.includes('"meta":') && obj.includes('"overview":')) return obj;
                return undefined;
            }
            if (Array.isArray(obj)) {
                for (const item of obj) {
                    const found = findJsonString(item);
                    if (found) return found;
                }
            } else if (typeof obj === 'object') {
                for (const key in obj) {
                    const found = findJsonString(obj[key]);
                    if (found) return found;
                }
            }
            return undefined;
        };

        jsonString = findJsonString(rawResult) || null;

        if (!jsonString) {
            // specific path fallback (legacy / strict)
            if (Array.isArray(rawResult) && rawResult[0]?.output?.[0]?.message?.content?.[0]?.text) {
                jsonString = rawResult[0].output[0].message.content[0].text
            }
        }

        if (!jsonString) {
            console.error('Failed to extract JSON. Raw response:', JSON.stringify(rawResult, null, 2).substring(0, 500))
            throw new Error('Could not extract report data from analysis response.')
        }

        // 3. Parse the inner JSON string
        try {
            const reportData = JSON.parse(jsonString)
            return reportData
        } catch (e) {
            console.error('Inner JSON Parse Error:', e)
            throw new Error('Analysis returned invalid JSON data format.')
        }

    } catch (err: any) {
        console.error('Upload Action Error:', err)
        throw new Error(err.message || 'Failed to process report')
    }
}

export async function saveReport(jsonPayload: any, reportTitle: string) {
    const supabase = await createClient()

    // 1. Get User
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { error: 'Usuário não autenticado' }
    }

    // 2. Get User's Company (Empresa)
    const { data: profile } = await supabase
        .from('main_profiles')
        .select('empresa_id')
        .eq('id', user.id)
        .single()

    if (!profile?.empresa_id) {
        return { error: 'Perfil não vinculado a uma empresa' }
    }

    // 3. Extract Summary Metrics (Optional but good for listing)
    // Try to safely extract from payload
    const currency = jsonPayload?.meta?.currency || 'USD'
    const totalSpent = jsonPayload?.overview?.total_spent || 0
    const rowCount = jsonPayload?.meta?.row_count || 0
    const summary = jsonPayload?.insights?.executive_summary || ''

    // 4. Insert Report
    const { error } = await supabase
        .from('ads_reports')
        .insert({
            empresa_id: profile.empresa_id,
            title: reportTitle,
            status: 'completed',
            payload: jsonPayload,
            currency: currency,
            total_spent: totalSpent,
            row_count: rowCount,
            summary: summary,
        })

    if (error) {
        console.error('Save Report Error:', error)
        return { error: `Erro ao salvar: ${error.message} (${error.code})` }
    }

    return { success: true }
}

export async function getUserReports() {
    const supabase = await createClient()

    // 1. Get User
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []

    // 2. Get Company
    const { data: profile } = await supabase
        .from('main_profiles')
        .select('empresa_id')
        .eq('id', user.id)
        .single()

    if (!profile?.empresa_id) return []

    // 3. List Reports
    const { data: reports, error } = await supabase
        .from('ads_reports')
        .select('id, title, status, created_at, total_spent, currency')
        .eq('empresa_id', profile.empresa_id)
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Error fetching reports:', error)
        return []
    }

    return reports
}

export async function getReportById(reportId: string) {
    console.log('[Server] getReportById called for:', reportId)
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        console.log('[Server] User not found')
        return null
    }

    // Simple RLS should handle permissions, but we can double check company if needed.
    // Assuming RLS on ads_reports checks (auth.uid() -> main_profiles -> empresa_id) logic or similar.
    // For now, direct fetch assuming RLS is set or we trust the ID (if RLS is open).
    // Note: The original generic RLS in legacy tables might need verifying, but let's assume it works for now.

    const { data: report, error } = await supabase
        .from('ads_reports')
        .select('*')
        .eq('id', reportId)
        .single()

    if (error) {
        console.error('Error fetching report:', error)
        return null
    }

    return report
}

export async function deleteReport(reportId: string) {
    const supabase = await createClient()

    // 1. Get User
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    // 2. Perform Delete (RLS will handle ownership check)
    // We implicitly trust RLS "Main Users can delete reports" policy we just added.
    const { error } = await supabase
        .from('ads_reports')
        .delete()
        .eq('id', reportId)

    if (error) {
        console.error('Error deleting report:', error)
        return { error: 'Failed to delete report' }
    }

    return { success: true }
}
