"use strict";

import * as React from "react"
import { Copy, Check, X } from "lucide-react"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogClose,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

interface ExamplePillProps {
    content: string
}

export function ExamplePill({ content }: ExamplePillProps) {
    const [copied, setCopied] = React.useState(false)

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(content)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        } catch (err) {
            console.error("Failed to copy:", err)
        }
    }

    return (
        <Dialog>
            <DialogTrigger asChild>
                <button
                    type="button"
                    className="inline-flex items-center justify-center rounded-full bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 text-[10px] font-medium text-blue-400 hover:bg-blue-500/20 hover:text-blue-300 transition-colors ml-2 cursor-pointer"
                >
                    Example
                </button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md bg-[#111] border-white/10 text-white p-0 gap-0 overflow-hidden">
                <div className="p-4 border-b border-white/10 flex items-center justify-between bg-[#171717]">
                    <DialogTitle className="text-sm font-semibold tracking-wide">EXAMPLE CONTENT</DialogTitle>
                    <DialogClose className="text-gray-400 hover:text-white transition-colors">
                        <X size={16} />
                        <span className="sr-only">Close</span>
                    </DialogClose>
                </div>

                <div className="p-6 bg-[#0A0A0A]">
                    <div className="bg-white/5 border border-white/10 rounded-lg p-4 relative group">
                        <pre className="text-sm text-gray-300 whitespace-pre-wrap font-sans leading-relaxed">
                            {content}
                        </pre>

                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                                onClick={handleCopy}
                                className="p-2 bg-black/50 hover:bg-black/80 text-white rounded-md border border-white/10 backdrop-blur-sm transition-all"
                                title="Copy to clipboard"
                            >
                                {copied ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
                            </button>
                        </div>
                    </div>
                </div>

                <div className="p-4 border-t border-white/10 bg-[#171717] flex justify-end">
                    <button
                        onClick={handleCopy}
                        className="flex items-center gap-2 px-4 py-2 bg-white text-black text-xs font-bold rounded-lg hover:bg-gray-200 transition-colors"
                    >
                        {copied ? (
                            <>
                                <Check size={14} />
                                COPIED!
                            </>
                        ) : (
                            <>
                                <Copy size={14} />
                                COPY CONTENT
                            </>
                        )}
                    </button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
