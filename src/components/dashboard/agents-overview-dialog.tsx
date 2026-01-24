'use client'

import { useState } from 'react'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Plus, Check, Search } from 'lucide-react'
import { Agent, AGENTS } from '@/lib/agents'
import { updateActiveAgents } from '@/actions/agent-actions'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

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
    const [saving, setSaving] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')

    const toggleAgent = (agentId: string) => {
        setSelectedAgents(prev =>
            prev.includes(agentId)
                ? prev.filter(id => id !== agentId)
                : [...prev, agentId]
        )
    }

    const handleSave = async () => {
        setSaving(true)
        try {
            const result = await updateActiveAgents(selectedAgents)
            if (result.error) {
                toast.error('Failed to update agents')
            } else {
                toast.success('Agents updated successfully')
                setOpen(false)
            }
        } catch (error) {
            toast.error('An unexpected error occurred')
        } finally {
            setSaving(false)
        }
    }

    const filteredAgents = AGENTS.filter(agent =>
        agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        agent.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
        agent.category.toLowerCase().includes(searchQuery.toLowerCase())
    )

    // Group by category for cleaner display
    const groupedAgents: Record<string, Agent[]> = {}
    filteredAgents.forEach(agent => {
        if (!groupedAgents[agent.category]) groupedAgents[agent.category] = []
        groupedAgents[agent.category].push(agent)
    })

    const categories = ['orchestration', 'strategy', 'execution', 'the-gold-mine', 'professional-services']

    // Always map 'orchestration' category agents? Or is Orchestrator mandatory?
    // User implied "ligar e desligar um funcionário". Orchestrator seems like the user themselves / main view.
    // Usually Orchestrator (Gabriel) is fixed, but let's see. The user requirement is generic.
    // Let's assume Orchestrator is fixed/always active or just treated like others.
    // I will treat them all as toggleable EXCEPT maybe the Orchestrator profile link itself? 
    // The previous sidebar code hardcodes the user profile link at the top. The agent list is below.
    // So the toggles apply to the `AGENTS` list.

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {children ?? (
                    <Button variant="ghost" size="sm" className="w-full justify-start text-xs text-slate-500 hover:text-white">
                        <Plus className="w-3 h-3 mr-2" /> Manage Agents
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="w-screen h-screen max-w-none rounded-none border-none bg-[#0c0c0c] p-0 flex flex-col overflow-hidden">
                <div className="p-8 border-b border-white/10 flex justify-between items-center shrink-0">
                    <div>
                        <DialogTitle className="text-2xl font-bold text-white tracking-tight">
                            Manage Your AI Team
                        </DialogTitle>
                        <p className="text-slate-400 mt-2">
                            Select the agents you want to work with. Active agents will appear in your sidebar.
                        </p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="relative w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                            <input
                                placeholder="Search agents..."
                                className="w-full bg-white/5 border border-white/10 rounded-full py-2 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-[#1C73E8]"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <Button
                            onClick={handleSave}
                            disabled={saving}
                            className="bg-[#1C73E8] hover:bg-[#1557b0] text-white rounded-full px-8"
                        >
                            {saving ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-8 md:p-12 custom-scrollbar">
                    <div className="space-y-12 pb-20 max-w-[1920px] mx-auto">
                        {categories.map(category => {
                            const categoryAgents = groupedAgents[category]
                            if (!categoryAgents || categoryAgents.length === 0) return null

                            return (
                                <div key={category} className="space-y-6">
                                    <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest border-b border-white/5 pb-2">
                                        {category.replace(/-/g, ' ')}
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
                                        {categoryAgents.map(agent => {
                                            const isActive = selectedAgents.includes(agent.id)
                                            return (
                                                <div
                                                    key={agent.id}
                                                    onClick={() => toggleAgent(agent.id)}
                                                    className={cn(
                                                        "relative group p-4 rounded-xl border transition-all duration-200 cursor-pointer flex items-center gap-4",
                                                        isActive
                                                            ? "bg-white/5 border-[#1C73E8]/50 ring-1 ring-[#1C73E8]/20"
                                                            : "bg-transparent border-white/10 hover:bg-white/5 hover:border-white/20"
                                                    )}
                                                >
                                                    <div className={cn(
                                                        "w-12 h-12 rounded-full overflow-hidden border shrink-0 transition-all",
                                                        isActive ? "border-[#1C73E8]" : "border-white/10"
                                                    )}>
                                                        <img src={agent.avatar} alt={agent.name} className="w-full h-full object-cover grayscale-0" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <h4 className={cn("font-bold text-sm truncate", isActive ? "text-white" : "text-slate-300")}>
                                                            {agent.name}
                                                        </h4>
                                                        <p className="text-xs text-slate-500 truncate">{agent.role}</p>
                                                    </div>

                                                    <div className={cn(
                                                        "w-6 h-6 rounded-full border flex items-center justify-center transition-colors",
                                                        isActive
                                                            ? "bg-[#1C73E8] border-[#1C73E8] text-white"
                                                            : "bg-transparent border-slate-600 text-transparent group-hover:border-slate-400"
                                                    )}>
                                                        <Check size={14} strokeWidth={3} />
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
