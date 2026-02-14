'use client'

import { LogOut, User, CreditCard, Ban, ArrowUpRight, LayoutDashboard, BadgeDollarSign, MoreHorizontal, Plus } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Agent } from '@/lib/agents'
import { GabrielExpertiseDialog } from '@/components/gabriel-expertise-dialog'
import { PricingModal } from '@/components/pricing-modal'
import { useState, useEffect } from 'react'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { signout } from '@/app/login/actions'
import { useSidebar } from '@/components/providers/sidebar-provider'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

interface SidebarNavProps {
    agents: Agent[]
    activeAgents: string[] | null
    teamOrder: string[]
    humanMembers: any[]
    user: {
        id: string
        name: string
        role: string
        avatar: string
        companyName: string
        email: string
    }
    loggedUser: {
        id: string
        name: string
        role: string
    }
}

export function SidebarNav({ agents, activeAgents, teamOrder, humanMembers, user, loggedUser }: SidebarNavProps) {
    const pathname = usePathname()
    const [isPricingOpen, setIsPricingOpen] = useState(false)
    const { isCollapsed } = useSidebar()
    const [isMounted, setIsMounted] = useState(false)

    useEffect(() => {
        setIsMounted(true)
    }, [])

    const sidebarCollapsed = isMounted ? isCollapsed : false

    const visibleAgents = activeAgents
        ? agents.filter(a => activeAgents.includes(a.id))
        : agents

    // Build unified list based on teamOrder
    // We prioritize teamOrder if it exists
    const sortedItems = (() => {
        if (!teamOrder || teamOrder.length === 0) {
            // Default combined order if no custom order defined:
            // 1. Gabriel (Human Specialist)
            // 2. Other Human Specialists
            // 3. AI Agents (by category)
            const result: any[] = []

            const gabriel = agents.find(a => a.id === 'professional-gabriel')
            const isGabrielActive = !activeAgents || activeAgents.includes('professional-gabriel')
            if (gabriel && isGabrielActive) result.push({ type: 'human', data: gabriel, id: 'agent-professional-gabriel' })

            humanMembers.forEach(m => {
                // Skip the orchestrator (who is fixed at the top)
                if (m.id !== user.id) {
                    result.push({ type: 'human', data: m, id: `user-${m.id}` })
                }
            })

            visibleAgents.filter(a => a.id !== 'professional-gabriel').forEach(a => {
                result.push({ type: 'agent', data: a, id: `agent-${a.id}` })
            })

            return result
        }

        return teamOrder.map(id => {
            if (id === 'agent-professional-gabriel') {
                const gabriel = agents.find(a => a.id === 'professional-gabriel')
                const isGabrielActive = !activeAgents || activeAgents.includes('professional-gabriel')
                return (gabriel && isGabrielActive) ? { type: 'human', data: gabriel, id } : null
            } else if (id.startsWith('user-')) {
                const userId = id.replace('user-', '')
                // Skip the orchestrator (the one at the top is always the fixed orchestrator profile)
                if (userId === user.id) return null
                const member = humanMembers.find(m => m.id === userId)
                return member ? { type: 'human', data: member, id } : null
            } else if (id.startsWith('agent-')) {
                const agentId = id.replace('agent-', '')
                const agent = visibleAgents.find(a => a.id === agentId)
                return agent ? { type: 'agent', data: agent, id } : null
            }
            return null
        }).filter(Boolean)
    })()

    return (
        <nav className={`flex-1 min-h-0 p-4 space-y-4 overflow-y-auto custom-scrollbar ${sidebarCollapsed ? 'px-2' : ''}`}>
            <PricingModal open={isPricingOpen} onOpenChange={setIsPricingOpen} />

            {/* ORCHESTRATION / MAIN TOP */}
            <div className="space-y-2">

                {/* User Profile (Orchestrator) - Fixed Top */}
                <div className="relative group">
                    <Link
                        href="/dashboard/orchestrator?tab=chats"
                        className={`w-full flex items-center gap-3 py-3 rounded-lg transition-all duration-200 text-left outline-none ${pathname === '/dashboard/orchestrator'
                            ? 'bg-white/10 text-white shadow-[0_0_15px_rgba(28,115,232,0.1)] border border-white/5'
                            : 'text-slate-300 hover:text-white hover:bg-white/5 border border-transparent'
                            } ${sidebarCollapsed ? 'justify-center px-0' : 'px-4'}`}
                    >
                        <div className={`w-10 h-10 rounded-full overflow-hidden border transition-all shrink-0 relative ${pathname === '/dashboard/orchestrator'
                            ? 'border-[#1C73E8]'
                            : 'border-white/10 group-hover:border-[#1C73E8]'
                            } ${user.id === loggedUser.id ? 'ring-2 ring-[#1C73E8] ring-offset-2 ring-offset-[#0C0C0C] shadow-[0_0_15px_rgba(28,115,232,0.4)]' : ''}`}>
                            <img
                                src={user.avatar}
                                alt={user.name}
                                className="w-full h-full object-cover"
                            />
                            {user.id === loggedUser.id && (
                                <div className="absolute inset-0 rounded-full animate-pulse border-2 border-white/20 pointer-events-none" />
                            )}
                        </div>

                        {!sidebarCollapsed && (
                            <div className="flex flex-col overflow-hidden">
                                <div className="flex items-center gap-1.5">
                                    <span className={`text-sm font-bold truncate transition-colors leading-tight ${pathname === '/dashboard/orchestrator' ? 'text-white' : 'text-slate-300 group-hover:text-white'
                                        }`}>{user.name}</span>
                                    {user.id === loggedUser.id && (
                                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_5px_rgba(28,115,232,0.8)]" />
                                    )}
                                </div>
                                <span className="text-xs text-slate-400 truncate leading-tight">{user.role || 'Orchestrator'}</span>
                            </div>
                        )}
                    </Link>
                </div>

                {/* Team Members List */}
                <div className="space-y-1">
                    {sortedItems.map((item: any) => {
                        if (item.type === 'human') {
                            if (item.id === 'agent-professional-gabriel') {
                                return (
                                    <GabrielExpertiseDialog key={item.id}>
                                        <button className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-200 group text-left ${sidebarCollapsed ? 'justify-center px-2' : ''} hover:bg-slate-800`}>
                                            <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 border border-white/10 group-hover:border-white/30 transition-all">
                                                <img
                                                    src={item.data.avatar}
                                                    alt={item.data.name}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>

                                            {!sidebarCollapsed && (
                                                <div className="flex flex-col overflow-hidden">
                                                    <span className="truncate text-sm font-medium text-slate-200 group-hover:text-white transition-colors">
                                                        {item.data.name}
                                                    </span>
                                                    <span className="text-xs text-slate-500 group-hover:text-slate-400 transition-colors whitespace-normal leading-tight">
                                                        {(item.data.job_title || item.data.role)?.replace('Fractional ', '')}
                                                    </span>
                                                </div>
                                            )}
                                        </button>
                                    </GabrielExpertiseDialog>
                                )
                            }
                            return <HumanLink key={item.id} member={item.data} pathname={pathname} isCollapsed={sidebarCollapsed} id={item.id} isLoggedUser={item.data.id === loggedUser.id} />
                        }
                        return <AgentLink key={item.id} agent={item.data} pathname={pathname} isCollapsed={sidebarCollapsed} />
                    })}
                </div>
            </div>
        </nav>
    )
}

function HumanLink({ member, pathname, isCollapsed, id, isLoggedUser }: { member: any, pathname: string, isCollapsed: boolean, id: string, isLoggedUser: boolean }) {
    const avatarUrl = member.avatar_url || (member.avatar) || `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&background=random`
    const href = `/dashboard/${id}`
    const isActive = pathname === href || pathname.startsWith(`${href}/`)

    if (isCollapsed) {
        return (
            <TooltipProvider>
                <Tooltip delayDuration={0}>
                    <TooltipTrigger asChild>
                        <Link
                            href={href}
                            className={`flex justify-center items-center p-2 rounded-lg transition-all duration-200 group w-full ${isActive
                                ? 'bg-white/10 text-white shadow-[0_0_15px_rgba(28,115,232,0.1)] border border-white/5'
                                : 'text-slate-300 hover:text-white hover:bg-slate-800 opacity-60 hover:opacity-100'
                                }`}
                        >
                            <div className={`w-8 h-8 rounded-full overflow-hidden flex-shrink-0 border transition-all relative ${isActive
                                ? 'border-[#1C73E8] scale-105 shadow-sm'
                                : 'border-white/10 group-hover:border-white/30'
                                } ${isLoggedUser ? 'ring-2 ring-blue-500 ring-offset-1 ring-offset-[#0C0C0C]' : ''}`}>
                                <img src={avatarUrl} alt={member.name} className="w-full h-full object-cover" />
                                {isLoggedUser && (
                                    <div className="absolute inset-0 rounded-full animate-pulse border border-white/30 pointer-events-none" />
                                )}
                            </div>
                        </Link>
                    </TooltipTrigger>
                    <TooltipContent side="right" className="bg-[#111] border-white/10 text-white">
                        <p className="font-medium">{member.name}</p>
                        <p className="text-xs text-slate-400">{member.job_title || 'Member'}</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        )
    }

    return (
        <Link
            href={href}
            className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-200 group ${isActive
                ? 'bg-white/10 text-white shadow-[0_0_15px_rgba(28,115,232,0.1)] border border-white/5'
                : 'text-slate-300 hover:text-white hover:bg-slate-800 opacity-80 hover:opacity-100'
                }`}
        >
            <div className={`w-8 h-8 rounded-full overflow-hidden flex-shrink-0 border transition-all relative ${isActive
                ? 'border-[#1C73E8] scale-105 shadow-sm'
                : 'border-white/10 group-hover:border-white/30'
                } ${isLoggedUser ? 'ring-2 ring-blue-500 ring-offset-1 ring-offset-[#0C0C0C] bg-blue-500/10' : ''}`}>
                <img src={avatarUrl} alt={member.name} className="w-full h-full object-cover" />
                {isLoggedUser && (
                    <div className="absolute inset-0 rounded-full animate-pulse border border-white/30 pointer-events-none" />
                )}
            </div>
            <div className="flex flex-col overflow-hidden">
                <div className="flex items-center gap-1.5">
                    <span className={`truncate text-sm font-medium transition-colors ${isActive ? 'text-white' : 'text-slate-200'}`}>
                        {member.name}
                    </span>
                    {isLoggedUser && (
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_5px_rgba(28,115,232,0.8)]" />
                    )}
                </div>
                <span className={`truncate text-xs transition-colors ${isActive ? 'text-[#1C73E8]' : 'text-slate-500 group-hover:text-slate-400'}`}>
                    {(member.job_title || 'Member').replace('Fractional ', '')}
                </span>
            </div>
        </Link>
    )
}

function AgentLink({ agent, pathname, isCollapsed }: { agent: Agent, pathname: string, isCollapsed: boolean }) {
    const href = `/dashboard/${agent.slug}`
    const isActive = pathname === href || pathname.startsWith(`${href}/`)

    if (isCollapsed) {
        return (
            <TooltipProvider>
                <Tooltip delayDuration={0}>
                    <TooltipTrigger asChild>
                        <Link
                            href={href}
                            className={`flex justify-center items-center p-2 rounded-lg transition-all duration-200 group w-full ${isActive
                                ? 'bg-white/10 text-white shadow-[0_0_15px_rgba(28,115,232,0.1)] border border-white/5'
                                : 'text-slate-300 hover:text-white hover:bg-slate-800'
                                }`}
                        >
                            <div className={`w-8 h-8 rounded-full overflow-hidden flex-shrink-0 border transition-all ${isActive
                                ? 'border-[#1C73E8] scale-105 shadow-sm'
                                : 'border-white/10 group-hover:border-white/30'
                                }`}>
                                <img
                                    src={agent.avatar}
                                    alt={agent.name}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        </Link>
                    </TooltipTrigger>
                    <TooltipContent side="right" className="bg-[#111] border-white/10 text-white">
                        <p className="font-medium">{agent.name}</p>
                        <p className="text-xs text-slate-400">{agent.role}</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        )
    }

    return (
        <Link
            href={href}
            className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-200 group ${isActive
                ? 'bg-white/10 text-white shadow-[0_0_15px_rgba(28,115,232,0.1)] border border-white/5'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
        >
            <div className={`w-8 h-8 rounded-full overflow-hidden flex-shrink-0 border transition-all ${isActive
                ? 'border-[#1C73E8] scale-105 shadow-sm'
                : 'border-white/10 group-hover:border-white/30'
                }`}>
                <img
                    src={agent.avatar}
                    alt={agent.name}
                    className="w-full h-full object-cover"
                />
            </div>
            <div className="flex flex-col overflow-hidden">
                <span className={`truncate text-sm font-medium transition-colors ${isActive ? 'text-white' : 'text-slate-200'
                    }`}>
                    {agent.name}
                </span>
                <span className={`truncate text-xs transition-colors ${isActive ? 'text-[#1C73E8]' : 'text-slate-500 group-hover:text-slate-400'
                    }`}>
                    {agent.role}
                </span>
            </div>
        </Link>
    )
}
