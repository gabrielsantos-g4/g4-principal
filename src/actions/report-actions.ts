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
