'use client'

import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"

interface MultiSelectProps {
    options: string[]
    selected: string[]
    onChange: (selected: string[]) => void
    placeholder?: string
    className?: string
}

export function MultiSelect({ options, selected, onChange, placeholder = "Select...", className }: MultiSelectProps) {
    const [open, setOpen] = React.useState(false)
    // Close dropdown on click outside logic could be added, but relying on simple toggle for now.
    // Ideally use a Popover from a library, but building a simple one here to avoid dependencies if not configured.
    // Adding a simple backdrop for closing which is a common quick fix.

    const toggleSelection = (option: string) => {
        if (selected.includes(option)) {
            onChange(selected.filter((item) => item !== option))
        } else {
            onChange([...selected, option])
        }
    }

    return (
        <div className={cn("relative", className)}>
            {/* Simple Backdrop to close */}
            {open && <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />}

            <button
                type="button"
                onClick={() => setOpen(!open)}
                className="w-full bg-[#1A1A1A] text-left text-gray-200 text-sm rounded bg-opacity-50 border border-white/10 p-2 outline-none focus:ring-1 focus:ring-blue-500 transition-all flex items-center justify-between"
            >
                <span className="truncate">
                    {selected.length === 0
                        ? <span className="text-gray-500">{placeholder}</span>
                        : `${selected.length} selected`
                    }
                </span>
                <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
            </button>

            {open && (
                <div className="absolute w-full z-20 mt-1 bg-[#222] border border-white/10 rounded shadow-xl max-h-60 overflow-auto">
                    {options.map((option) => (
                        <div
                            key={option}
                            onClick={() => toggleSelection(option)}
                            className={cn(
                                "flex items-center px-3 py-2 text-sm cursor-pointer hover:bg-white/10 text-gray-200",
                                selected.includes(option) && "bg-blue-500/20 text-blue-400"
                            )}
                        >
                            <div className={cn(
                                "mr-2 h-4 w-4 border rounded border-white/30 flex items-center justify-center",
                                selected.includes(option) && "bg-blue-500 border-blue-500"
                            )}>
                                {selected.includes(option) && <Check className="h-3 w-3 text-white" />}
                            </div>
                            {option}
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
