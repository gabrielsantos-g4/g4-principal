"use client"

import { useState, useEffect } from "react"
import { StickyNote, type LucideIcon, PenTool, MousePointer2, Type, Box as BoxIcon, ArrowRight, LayoutTemplate } from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { NotesModal } from "./tools/notes-modal"
import { WhiteboardModal } from "./tools/whiteboard-modal"

export function HeaderTools() {
    const [isNotesOpen, setIsNotesOpen] = useState(false)
    const [isWhiteboardOpen, setIsWhiteboardOpen] = useState(false)
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) return null

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <button className="p-2 border border-white/20 rounded text-gray-400 hover:text-white hover:bg-white/5 transition-colors flex items-center justify-center h-9 w-9" title="Notes & Draw">
                        <StickyNote size={16} />
                    </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-[#171717] border-white/10 text-white">
                    <DropdownMenuItem
                        className="cursor-pointer hover:bg-white/5 focus:bg-white/5 focus:text-white"
                        onClick={() => setIsNotesOpen(true)}
                    >
                        <StickyNote className="mr-2 h-4 w-4" />
                        <span>Notes</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        className="cursor-pointer hover:bg-white/5 focus:bg-white/5 focus:text-white"
                        onClick={() => setIsWhiteboardOpen(true)}
                    >
                        <LayoutTemplate className="mr-2 h-4 w-4" />
                        <span>Whiteboard</span>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            <NotesModal open={isNotesOpen} onOpenChange={setIsNotesOpen} />
            <WhiteboardModal open={isWhiteboardOpen} onOpenChange={setIsWhiteboardOpen} />
        </>
    )
}
