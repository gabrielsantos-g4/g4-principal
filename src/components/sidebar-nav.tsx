'use client'

import { LogOut, User, CreditCard, Ban, ArrowUpRight, LayoutDashboard, BadgeDollarSign } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Agent } from '@/lib/agents'
import { GabrielExpertiseDialog } from '@/components/gabriel-expertise-dialog'
import { PricingModal } from '@/components/pricing-modal'
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
    user: {
        name: string
        role: string
        avatar: string
        companyName: string
        email: string
    }
}

export function SidebarNav({ agents, user }: SidebarNavProps) {
    const pathname = usePathname()
    const [isPricingOpen, setIsPricingOpen] = useState(false)
    const { isCollapsed } = useSidebar()

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
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button
                            className={`w-full flex items-center gap-3 py-3 rounded-lg transition-all duration-200 group text-left outline-none ${pathname === '/dashboard/orchestrator'
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
                                    <span className="text-xs text-slate-400 truncate leading-tight">{user.companyName}</span>

                                </div>
                            )}
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        className="w-64 bg-[#111] border-white/10 text-white mb-2 ml-4"
                        align="start"
                        side="right"
                        sideOffset={10}
                        style={{ zIndex: 99999 }}
                    >
                        <DropdownMenuLabel className="font-normal p-3">
                            <div className="flex flex-col space-y-1">
                                <p className="text-sm font-medium leading-none text-white">{user.name}</p>
                                <p className="text-xs leading-none text-gray-500">{user.email}</p>
                                <p className="text-xs leading-none text-gray-500">{user.companyName}</p>
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator className="bg-white/10" />

                        <DropdownMenuItem asChild className="cursor-pointer focus:bg-white/10 focus:text-white group p-2 rounded-md">
                            <Link href="/dashboard/orchestrator" className="flex items-center w-full">
                                <User className="mr-2 h-4 w-4 text-gray-400 group-hover:text-white" />
                                <span>Profile</span>
                            </Link>
                        </DropdownMenuItem>

                        <DropdownMenuItem
                            className="cursor-pointer focus:bg-white/10 focus:text-white group p-2 rounded-md"
                            onSelect={() => {
                                setIsPricingOpen(true)
                            }}
                        >
                            <BadgeDollarSign className="mr-2 h-4 w-4 text-gray-400 group-hover:text-white" />
                            <span>Pricing</span>
                        </DropdownMenuItem>

                        <DropdownMenuItem className="cursor-pointer focus:bg-white/10 focus:text-white group p-2 rounded-md">
                            <CreditCard className="mr-2 h-4 w-4 text-gray-400 group-hover:text-white" />
                            <span>Billing</span>
                        </DropdownMenuItem>

                        <DropdownMenuItem asChild className="cursor-pointer focus:bg-white/10 focus:text-white group p-2 rounded-md">
                            <a href={`mailto:${user.name.toLowerCase().replace(' ', '.')}.g4@example.com`} className="w-full flex items-center">
                                <ArrowUpRight className="mr-2 h-4 w-4 text-gray-400 group-hover:text-white" />
                                <span>Support</span>
                            </a>
                        </DropdownMenuItem>

                        <DropdownMenuSeparator className="bg-white/10" />

                        <DropdownMenuItem asChild className="cursor-pointer focus:bg-white/10 focus:text-white group text-red-400 focus:text-red-400 p-2 rounded-md">
                            <form action={signout} className="w-full flex items-center">
                                <button type="submit" className="flex items-center w-full">
                                    <LogOut className="mr-2 h-4 w-4" />
                                    <span>Logout</span>
                                </button>
                            </form>
                        </DropdownMenuItem>

                        <DropdownMenuItem className="cursor-pointer focus:bg-white/10 focus:text-white group text-red-500 focus:text-red-500 p-2 rounded-md">
                            <Ban className="mr-2 h-4 w-4" />
                            <span>Deactivate account</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>

                {agents.filter(a => a.category === 'orchestration').map(agent => (
                    <AgentLink key={agent.id} agent={agent} pathname={pathname} isCollapsed={isCollapsed} />
                ))}
            </div>

            {/* STRATEGY */}
            <div className="space-y-2">
                {!isCollapsed && (
                    <div className="px-4 text-[10px] font-medium text-slate-500 uppercase tracking-wider">
                        Strategy
                    </div>
                )}
                {agents.filter(a => a.category === 'strategy').map(agent => (
                    <AgentLink key={agent.id} agent={agent} pathname={pathname} isCollapsed={isCollapsed} />
                ))}
            </div>

            {/* EXECUTION */}
            <div className="space-y-2">
                {!isCollapsed && (
                    <div className="px-4 text-[10px] font-medium text-slate-500 uppercase tracking-wider">
                        Execution
                    </div>
                )}
                {agents.filter(a => a.category === 'execution').map(agent => (
                    <AgentLink key={agent.id} agent={agent} pathname={pathname} isCollapsed={isCollapsed} />
                ))}
            </div>

            {/* THE GOLD MINE */}
            <div className="space-y-2">
                {!isCollapsed && (
                    <div className="px-4 text-[10px] font-medium text-slate-500 uppercase tracking-wider">
                        The Gold Mine
                    </div>
                )}
                {agents.filter(a => a.category === 'the-gold-mine').map(agent => (
                    <AgentLink key={agent.id} agent={agent} pathname={pathname} isCollapsed={isCollapsed} />
                ))}
            </div>

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
            <div className="pt-6 mt-6 border-t border-white/5 px-2 pb-8">
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
