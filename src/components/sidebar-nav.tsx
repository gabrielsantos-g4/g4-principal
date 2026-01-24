'use client'

import { LogOut, User, CreditCard, Ban, ArrowUpRight, LayoutDashboard, BadgeDollarSign, MoreHorizontal, Plus } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Agent } from '@/lib/agents'
import { GabrielExpertiseDialog } from '@/components/gabriel-expertise-dialog'
import { PricingModal } from '@/components/pricing-modal'
import { AgentsOverviewDialog } from '@/components/dashboard/agents-overview-dialog'
import { useState } from 'react'
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
    user: {
        name: string
        role: string
        avatar: string
        companyName: string
        email: string
    }
}

export function SidebarNav({ agents, activeAgents, user }: SidebarNavProps) {
    const pathname = usePathname()
    const [isPricingOpen, setIsPricingOpen] = useState(false)
    const { isCollapsed } = useSidebar()

    const visibleAgents = activeAgents
        ? agents.filter(a => activeAgents.includes(a.id))
        : agents

    return (
        <nav className={`flex-1 min-h-0 p-4 space-y-4 overflow-y-auto custom-scrollbar ${isCollapsed ? 'px-2' : ''}`}>
            <PricingModal open={isPricingOpen} onOpenChange={setIsPricingOpen} />

            {/* ORCHESTRATION */}
            <div className="space-y-2">
                {!isCollapsed && (
                    <div className="px-4 text-[10px] font-medium text-slate-500 uppercase tracking-wider">
                        Orchestration
                    </div>
                )}

                {/* User Profile (Orchestrator) */}
                <div className="relative group">
                    <Link
                        href="/dashboard/orchestrator"
                        className={`w-full flex items-center gap-3 py-3 rounded-lg transition-all duration-200 text-left outline-none ${pathname === '/dashboard/orchestrator'
                            ? 'bg-white/10 text-white shadow-[0_0_15px_rgba(28,115,232,0.1)] border border-white/5'
                            : 'text-slate-300 hover:text-white hover:bg-white/5 border border-transparent'
                            } ${isCollapsed ? 'justify-center px-0' : 'px-4'}`}
                    >
                        <div className={`w-10 h-10 rounded-full overflow-hidden border transition-all shrink-0 ${pathname === '/dashboard/orchestrator'
                            ? 'border-[#1C73E8]'
                            : 'border-white/10 group-hover:border-[#1C73E8]'
                            }`}>
                            <img
                                src={user.avatar}
                                alt={user.name}
                                className="w-full h-full object-cover"
                            />
                        </div>

                        {!isCollapsed && (
                            <div className="flex flex-col overflow-hidden">
                                <span className={`text-sm font-bold truncate transition-colors leading-tight ${pathname === '/dashboard/orchestrator' ? 'text-white' : 'text-slate-300 group-hover:text-white'
                                    }`}>{user.name}</span>
                                <span className="text-xs text-slate-400 truncate leading-tight">Orchestrator, Principal</span>
                            </div>
                        )}
                    </Link>
                </div>

                {
                    visibleAgents.filter(a => a.category === 'orchestration').map(agent => (
                        <AgentLink key={agent.id} agent={agent} pathname={pathname} isCollapsed={isCollapsed} />
                    ))
                }

            </div>

            {/* STRATEGY */}
            {visibleAgents.some(a => a.category === 'strategy') && (
                <div className="space-y-2">
                    {!isCollapsed && (
                        <div className="px-4 text-[10px] font-medium text-slate-500 uppercase tracking-wider">
                            Strategy
                        </div>
                    )}
                    {
                        visibleAgents.filter(a => a.category === 'strategy').map(agent => (
                            <AgentLink key={agent.id} agent={agent} pathname={pathname} isCollapsed={isCollapsed} />
                        ))
                    }
                </div>
            )}

            {/* EXECUTION */}
            {visibleAgents.some(a => a.category === 'execution') && (
                <div className="space-y-2">
                    {!isCollapsed && (
                        <div className="px-4 text-[10px] font-medium text-slate-500 uppercase tracking-wider">
                            Execution
                        </div>
                    )}
                    {
                        visibleAgents.filter(a => a.category === 'execution').map(agent => (
                            <AgentLink key={agent.id} agent={agent} pathname={pathname} isCollapsed={isCollapsed} />
                        ))
                    }
                </div>
            )}

            {/* THE GOLD MINE */}
            {visibleAgents.some(a => a.category === 'the-gold-mine') && (
                <div className="space-y-2">
                    {!isCollapsed && (
                        <div className="px-4 text-[10px] font-medium text-slate-500 uppercase tracking-wider">
                            The Gold Mine
                        </div>
                    )}
                    {
                        visibleAgents.filter(a => a.category === 'the-gold-mine').map(agent => (
                            <AgentLink key={agent.id} agent={agent} pathname={pathname} isCollapsed={isCollapsed} />
                        ))
                    }
                </div>
            )}

            {/* PROFESSIONAL SERVICES */}
            <div className="space-y-2">
                {!isCollapsed && (
                    <div className="px-4 text-[10px] font-medium text-slate-500 uppercase tracking-wider">
                        Professional Services
                    </div>
                )}

                <GabrielExpertiseDialog>
                    <button className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-200 group text-left ${isCollapsed ? 'justify-center px-2' : ''} hover:bg-slate-800`}>
                        <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 border border-white/10 group-hover:border-white/30 transition-all">
                            <img
                                src={user.avatar}
                                alt={user.name}
                                className="w-full h-full object-cover"
                            />
                        </div>

                        {!isCollapsed && (
                            <div className="flex flex-col overflow-hidden">
                                <span className="truncate text-sm font-medium text-slate-200 group-hover:text-white transition-colors">
                                    Gabriel Santos
                                </span>
                                <span className="text-xs text-slate-500 group-hover:text-slate-400 transition-colors whitespace-normal leading-tight">
                                    Fractional Full-Stack Marketer and Sales Dev
                                </span>
                            </div>
                        )}
                    </button>
                </GabrielExpertiseDialog>
            </div>

            {/* FOOTER */}
            <div className="pt-4 mt-2 border-t border-white/5 px-2 pb-8">
                <div className={`flex flex-col gap-2 opacity-50 hover:opacity-100 transition-opacity ${isCollapsed ? 'items-center' : ''}`}>
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]" />
                        {!isCollapsed && (
                            <span className="text-[10px] font-medium text-slate-400 uppercase tracking-widest">
                                System Operational
                            </span>
                        )}
                    </div>
                    {!isCollapsed && (
                        <div className="text-[10px] text-slate-600 font-medium">
                            g4 AI Agents v0.1.13
                        </div>
                    )}
                </div>
            </div>

        </nav>
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
