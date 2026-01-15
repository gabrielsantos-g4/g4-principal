"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { useEffect, useState } from "react"

interface NotesModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function NotesModal({ open, onOpenChange }: NotesModalProps) {
    const [note, setNote] = useState("")

    // Load saved global note
    useEffect(() => {
        const saved = localStorage.getItem("g4_global_notes")
        if (saved) setNote(saved)
    }, [])

    // Save on change
    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const newValue = e.target.value
        setNote(newValue)
        localStorage.setItem("g4_global_notes", newValue)
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-[98vw] h-[98vh] sm:max-w-[98vw] bg-[#171717] border-white/10 text-white flex flex-col p-6">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold">Project Notes</DialogTitle>
                </DialogHeader>
                <div className="flex-1 mt-4">
                    <Textarea
                        value={note}
                        onChange={handleChange}
                        className="w-full h-full bg-[#1e1e1e] border-none resize-none focus-visible:ring-1 focus-visible:ring-white/20 p-6 text-lg leading-relaxed text-slate-300"
                        placeholder="Start typing your notes here..."
                    />
                </div>
            </DialogContent>
        </Dialog>
    )
}
