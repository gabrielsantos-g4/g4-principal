import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

// Note: We use a direct Supabase client with Service Role here to bypass RLS if needed,
// or just standard client if Policy allows update by everyone (unsafe) or uses ID match.
// Ideally, we use the Service Role Key for webhooks.

export async function POST(req: Request) {
    try {
        const body = await req.json()

        // Strategy: We need the ID. 
        // 1. It might be in the body as `request_id` (if configured in automation)
        // 2. OR `id`
        // 3. OR `meta.request_id`

        // Let's check common places
        const requestId = body.request_id || body.id || body.meta?.request_id

        if (!requestId) {
            return NextResponse.json({ error: 'Missing request_id in payload' }, { status: 400 })
        }

        // Initialize Admin Client (Service Role) to ensure we can write to any user's report
        const supabase = createClient(
            process.env.SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        )

        const { error } = await supabase
            .from('ads_reports')
            .update({
                status: 'completed',
                payload: body,
                updated_at: new Date().toISOString()
            })
            .eq('id', requestId)

        if (error) {
            console.error('DB Update Error:', error)
            return NextResponse.json({ error: 'Failed to update database' }, { status: 500 })
        }

        return NextResponse.json({ success: true })
    } catch (err: any) {
        console.error('Webhook Error:', err)
        return NextResponse.json({ error: err.message }, { status: 500 })
    }
}
