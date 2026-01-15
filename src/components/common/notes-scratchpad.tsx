'use client'

import { useState, useEffect } from 'react'
import { Textarea } from '@/components/ui/textarea'

interface NotesScratchpadProps {
    agentName: string
}

export function NotesScratchpad({ agentName }: NotesScratchpadProps) {
    const [notes, setNotes] = useState('')
    const [isLoaded, setIsLoaded] = useState(false)

    // Load notes from localStorage on mount
    useEffect(() => {
        const savedNotes = localStorage.getItem(`g4_notes_${agentName}`)
        if (savedNotes) {
            setNotes(savedNotes)
        }
        setIsLoaded(true)
    }, [agentName])

    // Save notes to localStorage whenever they change
    useEffect(() => {
        if (isLoaded) {
            localStorage.setItem(`g4_notes_${agentName}`, notes)
        }
    }, [notes, agentName, isLoaded])

    if (!isLoaded) {
        return <div className="animate-pulse bg-white/5 w-full h-full rounded-md" />
    }

    return (
        <div className="flex flex-col h-full w-full">
            <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={`Jot down your ideas, next steps, or strategy drafts for ${agentName} here...`}
                className="flex-1 h-full w-full bg-transparent border-none text-white placeholder:text-gray-500 resize-none focus:ring-0 rounded-none p-6 text-base leading-relaxed"
            />
        </div>
    )
}
