'use client'

import { useState } from 'react'
import * as DialogPrimitive from "@radix-ui/react-dialog"
import {
    Dialog,
    DialogTrigger,
    DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Plus, Check, MinusCircle, PlusCircle, X } from 'lucide-react'
import { Agent, AGENTS } from '@/lib/agents'
import { updateActiveAgents } from '@/actions/agent-actions'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

interface AgentsOverviewDialogProps {
    children?: React.ReactNode
    initialActiveAgents?: string[] | null // id list
}

export function AgentsOverviewDialog({ children, initialActiveAgents }: AgentsOverviewDialogProps) {
    // If initialActiveAgents is null/undefined, assume all active (default behavior for new users)
    // Actually, user said "ao criar a conta... deve vir com todos".
    // So if null, we select all.
    const defaultSelection = initialActiveAgents ?? AGENTS.map(a => a.id)

    const [open, setOpen] = useState(false)
    const [selectedAgents, setSelectedAgents] = useState<string[]>(defaultSelection)

    const toggleAgent = async (agentId: string) => {
        const isSelected = selectedAgents.includes(agentId)
        const newSelection = isSelected
            ? selectedAgents.filter(id => id !== agentId)
            : [...selectedAgents, agentId]

        // Optimistic update
        setSelectedAgents(newSelection)

        // Auto-save
        try {
            const result = await updateActiveAgents(newSelection)
            if (result.error) {
                toast.error('Failed to save changes')
                // Revert to previous state if error
                setSelectedAgents(selectedAgents)
            } else {
                toast.success('Team updated successfully')
            }
        } catch (error) {
            toast.error('Failed to save changes')
            setSelectedAgents(selectedAgents)
        }
    }

    // Group by category for cleaner display
    const groupedAgents: Record<string, Agent[]> = {}
    AGENTS.forEach(agent => {
        if (!groupedAgents[agent.category]) groupedAgents[agent.category] = []
        groupedAgents[agent.category].push(agent)
    })

    const categories = ['orchestration', 'strategy', 'execution', 'the-gold-mine', 'professional-services']

    return (
        <Dialog open={open} onOpenChange={setOpen} modal={false}>
            <DialogTrigger asChild>
                {children ?? (
                    <Button variant="ghost" size="sm" className="w-full justify-start text-xs text-slate-500 hover:text-white">
                        <Plus className="w-3 h-3 mr-2" /> Manage Agents
                    </Button>
                )}
            </DialogTrigger>

            <DialogPrimitive.Portal>
                <DialogPrimitive.Content
                    className={cn(
                        "fixed z-[9999] bg-[#0c0c0c] p-0 flex flex-col overflow-hidden outline-none shadow-2xl",
                        "top-4 bottom-4 right-4 left-[264px] rounded-2xl border border-white/10",
                        "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 duration-200"
                    )}
                >
                    <DialogPrimitive.Close className="absolute right-6 top-6 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground z-50">
                        <X className="h-5 w-5 text-slate-400 hover:text-white" />
                        <span className="sr-only">Close</span>
                    </DialogPrimitive.Close>

                    <div className="p-8 border-b border-white/10 shrink-0">
                        <div>
                            <DialogTitle className="text-2xl font-bold text-white tracking-tight">
                                Build your team
                            </DialogTitle>
                            <p className="text-slate-400 mt-2">
                                Activate or deactivate an agent to customize your menu and keep only the agents you want. You can change this at any time.
                            </p>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-8 md:p-12 custom-scrollbar">
                        <div className="max-w-[1920px] mx-auto">
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3">
                                {AGENTS.map(agent => {
                                    const isActive = selectedAgents.includes(agent.id)
                                    return (
                                        <TooltipProvider key={agent.id}>
                                            <Tooltip delayDuration={200}>
                                                <TooltipTrigger asChild>
                                                    <div
                                                        onClick={() => toggleAgent(agent.id)}
                                                        className={cn(
                                                            "relative group p-3 rounded-lg border transition-all duration-200 flex flex-col gap-2 cursor-pointer",
                                                            isActive
                                                                ? "bg-white/5 border-[#1C73E8]/50 ring-1 ring-[#1C73E8]/20"
                                                                : "bg-transparent border-white/10 hover:bg-white/5 hover:border-white/20"
                                                        )}
                                                    >
                                                        <div className="flex items-center gap-2.5">
                                                            <div className={cn(
                                                                "w-8 h-8 rounded-full overflow-hidden border shrink-0 transition-all",
                                                                isActive ? "border-[#1C73E8]" : "border-white/10"
                                                            )}>
                                                                <img src={agent.avatar} alt={agent.name} className="w-full h-full object-cover grayscale-0" />
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <h4 className={cn("font-bold text-xs truncate leading-tight", isActive ? "text-white" : "text-slate-300")}>
                                                                    {agent.name}
                                                                </h4>
                                                                <p className="text-[9px] text-slate-500 truncate leading-tight mt-0.5">{agent.role}</p>
                                                            </div>
                                                        </div>

                                                        <div className="pt-1">
                                                            <button
                                                                className={cn(
                                                                    "w-full flex items-center justify-center gap-1 h-6 rounded-[4px] text-[9px] uppercase tracking-wide font-bold transition-all border",
                                                                    isActive
                                                                        ? "bg-[#1C73E8] text-white border-[#1C73E8] shadow-sm shadow-[#1C73E8]/20"
                                                                        : "bg-white/5 text-slate-400 border-white/5 group-hover:bg-white/10 group-hover:text-white"
                                                                )}
                                                            >
                                                                {isActive ? (
                                                                    <>
                                                                        <Check size={9} strokeWidth={3} />
                                                                        On Team
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <Plus size={9} strokeWidth={3} />
                                                                        Add
                                                                    </>
                                                                )}
                                                            </button>
                                                        </div>
                                                    </div>
                                                </TooltipTrigger>
                                                <TooltipContent className="bg-[#111] border-white/10 text-white z-[10002]">
                                                    <p>{agent.description}</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
                                    )
                                })}
                            </div>
                        </div>
                    </div>
                </DialogPrimitive.Content>
            </DialogPrimitive.Portal>
        </Dialog>
    )
}
