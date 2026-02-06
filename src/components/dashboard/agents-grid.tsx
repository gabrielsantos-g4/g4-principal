'use client'

import { useState } from 'react'
import { Plus, Check } from 'lucide-react'
import { Agent, AGENTS } from '@/lib/agents'
import { updateActiveAgents } from '@/actions/agent-actions'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

interface AgentsGridProps {
    initialActiveAgents?: string[] | null
    readOnly?: boolean
}

export function AgentsGrid({ initialActiveAgents, readOnly }: AgentsGridProps) {
    // If initialActiveAgents is null/undefined, assume all active (default behavior for new users)
    const defaultSelection = initialActiveAgents ?? AGENTS.map(a => a.id)
    const [selectedAgents, setSelectedAgents] = useState<string[]>(defaultSelection)



    // Safety check - if readOnly, interactions are disabled
    const toggleAgent = async (agentId: string) => {
        if (readOnly) return;

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

    return (
        <div className="w-full">
            <div className="mb-6">
                <h2 className="text-xl font-semibold mb-1 text-white">Select Agents</h2>
                <p className="text-slate-400 text-sm">
                    {readOnly
                        ? "These are the agents active for your company (Managed by Admin)."
                        : "Activate or deactivate an agent to customize your team."}
                </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                {AGENTS.map(agent => {
                    const isActive = selectedAgents.includes(agent.id)
                    return (
                        <TooltipProvider key={agent.id}>
                            <Tooltip delayDuration={200}>
                                <TooltipTrigger asChild>
                                    <div
                                        onClick={() => !readOnly && toggleAgent(agent.id)}
                                        className={cn(
                                            "relative group p-3 rounded-lg border transition-all duration-200 flex flex-col gap-2",
                                            readOnly ? "cursor-default opacity-80" : "cursor-pointer",
                                            isActive
                                                ? "bg-white/5 border-[#1C73E8]/50 ring-1 ring-[#1C73E8]/20"
                                                : "bg-transparent border-white/10",
                                            !readOnly && !isActive && "hover:bg-white/5 hover:border-white/20"
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
                                            {readOnly ? (
                                                <div className={cn(
                                                    "w-full flex items-center justify-center gap-1 h-6 rounded-[4px] text-[9px] uppercase tracking-wide font-bold transition-all border",
                                                    isActive
                                                        ? "bg-[#1C73E8]/50 text-white/50 border-[#1C73E8]/50"
                                                        : "bg-white/5 text-slate-500 border-white/5"
                                                )}>
                                                    {isActive ? "Active" : "Inactive"}
                                                </div>
                                            ) : (
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
                                            )}
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
    )
}
