import { createClient } from '@/lib/supabase'
import { NextResponse } from 'next/server'
import { openai } from '@ai-sdk/openai'
import { streamText, generateText } from 'ai'

export async function POST(req: Request) {
    try {
        const { messages, company_id, user_name } = await req.json()

        if (!messages || !company_id) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
        }

        const supabase = await createClient()

        // 1. Fetch Mother Ideas with their children to provide as context
        const { data: motherIdeas, error: motherError } = await supabase
            .from('organic_ideas_parent')
            .select(`
                id,
                title,
                theme_id,
                status,
                organic_ideas_child (
                    id,
                    content,
                    content_type,
                    format_type,
                    script_content
                )
            `)
            .eq('empresa_id', company_id)

        if (motherError) {
            console.error('Error fetching ideas context:', motherError)
        }

        // 2. Format Context
        let contextString = "The user has no content pillars saved yet."

        if (motherIdeas && motherIdeas.length > 0) {
            contextString = motherIdeas.map((mother: any) => {
                let text = `Content Pillar: "${mother.title}"\n`
                if (mother.organic_ideas_child && mother.organic_ideas_child.length > 0) {
                    text += `  Child Ideas:\n`
                    mother.organic_ideas_child.forEach((child: any) => {
                        text += `    - Idea: ${child.content}\n`
                        if (child.content_type) text += `      Angle: ${child.content_type}\n`
                        if (child.format_type) text += `      Format: ${child.format_type}\n`
                        if (child.script_content) text += `      Script/Notes: ${child.script_content}\n`
                    })
                } else {
                    text += `  (No child ideas yet)\n`
                }
                return text
            }).join('\n')
        }

        // 3. System Prompt
        const systemPrompt = `You are Lauren, the Organic Social Media manager for G4 Educação.
Your goal is to help the user (${user_name || 'the user'}) plan, schedule, and strategize organic content.
Always be direct, helpful, and use an encouraging tone.
You have access to the user's current Content Pillars and their Child Ideas in the database.

CURRENT SAVED ORGANIC content:
------------------------
${contextString}
------------------------

When the user asks for suggestions, ideas, or angles, refer heavily to the context above to generate highly relevant and contextual answers. Do not make up content pillars that aren't there, but do suggest new ideas or angles to expand upon existing pillars if asked.`

        // Extract the last message to send as prompt
        // Or send the whole conversation history
        const result = await streamText({
            model: openai('gpt-4o'),
            system: systemPrompt,
            messages,
        });

        return result.toTextStreamResponse();

    } catch (error: any) {
        console.error('API /chats/organic Error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
