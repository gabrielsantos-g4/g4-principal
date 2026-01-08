'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard } from 'lucide-react'
import { Agent } from '@/lib/agents'

interface SidebarNavProps {
    agents: Agent[]
}

export function SidebarNav({ agents }: SidebarNavProps) {
    const pathname = usePathname()

    return (
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto custom-scrollbar">
            {/* Dashboard Link */}
            <Link
                href="/dashboard"
                className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-200 mb-4 ${pathname === '/dashboard'
                    ? 'bg-white/10 text-white shadow-[0_0_15px_rgba(28,115,232,0.1)] border border-white/5'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                    }`}
            >
                <LayoutDashboard size={20} className={pathname === '/dashboard' ? 'text-[#1C73E8]' : ''} />
                <span>Dashboard</span>
            </Link>

            {/* Agents List */}
            <div className="space-y-2">
                {agents.map((agent) => {
                    const href = `/dashboard/${agent.slug}`
                    const isActive = pathname === href

                    return (
                        <Link
                            key={agent.id}
                            href={href}
                            className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-200 group ${isActive
                                ? 'bg-white/10 text-white shadow-[0_0_15px_rgba(28,115,232,0.1)] border border-white/5'
                                : 'text-slate-300 hover:text-white hover:bg-slate-800'
                                }`}
                        >
                            <div className={`w-10 h-10 rounded-full overflow-hidden flex-shrink-0 border transition-all ${isActive
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
                                    {agent.role}
                                </span>
                                <span className={`truncate text-xs transition-colors ${isActive ? 'text-[#1C73E8]' : 'text-slate-500 group-hover:text-slate-400'
                                    }`}>
                                    {agent.name}
                                </span>
                            </div>
                        </Link>
                    )
                })}
            </div>
        </nav>
    )
}
