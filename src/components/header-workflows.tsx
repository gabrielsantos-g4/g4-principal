"use client"

import { useState } from "react"
import { GitFork, ArrowRight, Target, Users, Mail, MessageSquare, Zap, BarChart, RefreshCw, Send } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

export function HeaderWorkflows() {
    const [isOpen, setIsOpen] = useState(false)

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="p-2 border border-white/20 rounded text-gray-400 hover:text-white hover:bg-white/5 transition-colors flex items-center justify-center h-9 w-9"
                title="Workflows"
            >
                <GitFork size={16} className="transform rotate-90" />
            </button>

            <WorkflowModal open={isOpen} onOpenChange={setIsOpen} />
        </>
    )
}

interface WorkflowModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
}

function WorkflowModal({ open, onOpenChange }: WorkflowModalProps) {
    const workflows = [
        { title: "Generate leads from organic traffic", icon: Target },
        { title: "Generate leads from paid traffic", icon: Zap },
        { title: "Build cold lead lists for outreach", icon: Users },
        { title: "Send outbound message sequences to cold lists", icon: Send },
        { title: "Follow up with existing leads", icon: MessageSquare },
        { title: "Qualify and score incoming leads", icon: BarChart },
        { title: "Convert website visitors into SQLs", icon: ArrowRight },
        { title: "Nurture leads through email sequences", icon: Mail },
        { title: "Reactivate dormant opportunities", icon: RefreshCw },
        { title: "Accelerate pipeline velocity", icon: Zap }, // Using Zap again or maybe generic
    ]

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-[98vw] h-[98vh] sm:max-w-[98vw] bg-[#0c0c0c] border-white/5 text-white flex flex-col p-12">
                <DialogHeader className="mb-12">
                    <DialogTitle className="text-3xl font-light tracking-tight text-white/90">Marketing & Sales Workflows</DialogTitle>
                </DialogHeader>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 overflow-y-auto pr-2 pb-12">
                    {workflows.map((workflow, index) => (
                        <div
                            key={index}
                            className="bg-transparent border border-white/5 rounded-2xl p-8 hover:border-white/20 hover:bg-white/5 cursor-pointer transition-all duration-300 group flex flex-col gap-6"
                        >
                            <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-zinc-400 group-hover:text-white group-hover:bg-white/10 transition-colors">
                                <workflow.icon size={22} strokeWidth={1.5} />
                            </div>
                            <h3 className="text-xl font-light text-zinc-300 group-hover:text-white leading-snug">
                                {workflow.title}
                            </h3>
                        </div>
                    ))}
                </div>
            </DialogContent>
        </Dialog>
    )
}
