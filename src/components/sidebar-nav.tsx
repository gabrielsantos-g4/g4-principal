'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard } from 'lucide-react'
import { Agent } from '@/lib/agents'
import { GabrielExpertiseDialog } from '@/components/gabriel-expertise-dialog'

interface SidebarNavProps {
    agents: Agent[]
}

export function SidebarNav({ agents }: SidebarNavProps) {
    const pathname = usePathname()

    return (
        <nav className="flex-1 p-4 space-y-6 overflow-y-auto custom-scrollbar">
            {/* Dashboard Link */}
            {/* Dashboard Link Removed */
            /* <Link
                href="/dashboard"
                className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-200 ${pathname === '/dashboard'
                    ? 'bg-white/10 text-white shadow-[0_0_15px_rgba(28,115,232,0.1)] border border-white/5'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                    }`}
            >
                <LayoutDashboard size={20} className={pathname === '/dashboard' ? 'text-[#1C73E8]' : ''} />
                <span>Dashboard</span>
            </Link> */}

            {/* STRATEGY */}
            <div className="space-y-2">
                <div className="px-4 text-[10px] font-medium text-slate-500 uppercase tracking-wider">
                    Strategy
                </div>
                {agents.filter(a => a.category === 'strategy').map(agent => (
                    <AgentLink key={agent.id} agent={agent} pathname={pathname} />
                ))}
            </div>

            {/* EXECUTION */}
            <div className="space-y-2">
                <div className="px-4 text-[10px] font-medium text-slate-500 uppercase tracking-wider">
                    Execution
                </div>
                {agents.filter(a => a.category === 'execution').map(agent => (
                    <AgentLink key={agent.id} agent={agent} pathname={pathname} />
                ))}
            </div>

            {/* BUSINESS SECTION (The Gold Mine) */}
            <div className="space-y-2">
                <div className="px-4 text-[10px] font-bold text-[#FFD700] uppercase tracking-wider opacity-80 flex items-center gap-2">
                    <span>✨ The Gold Mine</span>
                </div>
                {agents.filter(a => a.category === 'business').map(agent => (
                    <Link
                        key={agent.id}
                        href={`/dashboard/${agent.slug}`}
                        className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 group border ${pathname === `/dashboard/${agent.slug}`
                            ? 'bg-gradient-to-r from-yellow-500/10 to-transparent border-yellow-500/20 shadow-[0_0_20px_rgba(255,215,0,0.1)]'
                            : 'border-transparent hover:bg-white/5'
                            }`}
                    >
                        <div className={`w-12 h-12 rounded-full overflow-hidden flex-shrink-0 border-2 transition-all ${pathname === `/dashboard/${agent.slug}`
                            ? 'border-[#FFD700] shadow-lg scale-105'
                            : 'border-[#FFD700]/30 group-hover:border-[#FFD700]/70'
                            }`}>
                            <img
                                src={agent.avatar}
                                alt={agent.name}
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-sm font-bold text-[#FFD700] group-hover:text-[#FFE55C] transition-colors">
                                {agent.name}
                            </span>
                            <span className="text-xs text-slate-400 group-hover:text-slate-300">
                                {agent.role}
                            </span>
                        </div>
                    </Link>
                ))}
            </div>

            {/* BI & DATA ANALYSIS */}
            <div className="space-y-2">
                <div className="px-4 text-[10px] font-medium text-slate-500 uppercase tracking-wider">
                    BI & Data Analysis
                </div>
                {agents.filter(a => a.category === 'bi').map(agent => (
                    <AgentLink key={agent.id} agent={agent} pathname={pathname} />
                ))}
            </div>

            {/* HUMAN EXPERT */}
            <div className="pt-4 mt-4 border-t border-white/5">
                <div className="px-4 mb-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    Fractional Full-Stack Marketer
                </div>

                <GabrielExpertiseDialog>
                    <button className="w-full flex items-center gap-3 px-4 py-3 mx-2 rounded-lg transition-all duration-200 text-slate-300 hover:text-white hover:bg-white/5 group">
                        <div className="relative">
                            <div className="w-10 h-10 rounded-full overflow-hidden border border-white/10 group-hover:border-[#1C73E8] transition-colors">
                                <img
                                    src="/gabriel-santos.png"
                                    alt="Gabriel Santos"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-[#0c0c0c] rounded-full"></div>
                        </div>

                        <div className="flex flex-col">
                            <span className="text-sm font-bold text-white group-hover:text-[#1C73E8] transition-colors">Gabriel Santos</span>
                            <span className="text-[10px] text-slate-500 font-medium uppercase tracking-wider leading-tight">Fractional Full Stack Marketer</span>
                        </div>
                    </button>
                </GabrielExpertiseDialog>
            </div>
        </nav>
    )
}

function AgentLink({ agent, pathname }: { agent: Agent, pathname: string }) {
    const href = `/dashboard/${agent.slug}`
    const isActive = pathname === href

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
