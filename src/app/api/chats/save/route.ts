import { createClient } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { empresa_id, user_id, agent_name, message, sender } = body

        if (!empresa_id || !user_id || !agent_name || !message || !sender) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            )
        }

        const supabase = await createClient()

        const { error } = await supabase
            .from('main_agents_chat')
            .insert({
                empresa_id,
                user_id,
                agent_name,
                message,
                sender
            })

        if (error) {
            console.error('Error saving chat message:', error)
            return NextResponse.json(
                { error: error.message },
                { status: 500 }
            )
        }

        return NextResponse.json({ success: true })
    } catch (error: any) {
        console.error('Unexpected error in /api/chats/save:', error)
        return NextResponse.json(
            { error: error.message || 'Internal Server Error' },
            { status: 500 }
        )
    }
}
