import { createClient } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function PUT(request: Request) {
    const supabase = await createClient()

    try {
        const body = await request.json()
        const { id, status } = body

        if (!id || !status) {
            return NextResponse.json({ error: 'Missing id or status' }, { status: 400 })
        }

        // Verify authentication
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Verify permission (optional, assuming RLS handles checking company ownership via main_profiles)
        // ideally we check if the item belongs to the user's company, but RLS on 'update' works too.

        const { error } = await supabase
            .from('outreach_prospects')
            .update({ status })
            .eq('id', id)

        if (error) {
            console.error('Database update error:', error)
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json({ success: true })
    } catch (e) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
