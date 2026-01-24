"use client"

import { AGENTS } from "@/lib/agents"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { useState } from "react"
import { Search, ArrowUp } from "lucide-react"

export function AgentsOverview() {
    const [search, setSearch] = useState("")

    // Filter agents
    const filteredAgents = AGENTS.filter(agent =>
        agent.name.toLowerCase().includes(search.toLowerCase()) ||
        agent.role.toLowerCase().includes(search.toLowerCase()) ||
        agent.description.toLowerCase().includes(search.toLowerCase()) ||
        agent.keywords?.some(keyword => keyword.toLowerCase().includes(search.toLowerCase()))
    )

    return (
        <div className="w-full min-h-[80vh] flex flex-col items-center justify-center p-6 relative">

            {/* Background Gradient Effect - Stronger Dark Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-zinc-500/20 blur-[100px] rounded-full pointer-events-none" />

            {/* Main Content */}
            <div className="w-full max-w-2xl flex flex-col items-center gap-8 relative z-10">
                <h1 className="text-3xl font-medium text-white text-center tracking-tight">
                    What are we going to work on today?
                </h1>

                {/* Search Input - Pill Shape */}
                <div className="w-full relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-zinc-500/30 to-gray-500/30 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="relative bg-[#09090b] hover:bg-[#121212] border border-white/10 transition-colors rounded-full h-14 px-4 flex items-center justify-between shadow-lg">

                        {/* Left: Input */}
                        <div className="flex items-center gap-3 flex-1 pl-2">
                            <input
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Type area or agent..."
                                className="w-full bg-transparent text-lg text-white placeholder:text-gray-500 focus:outline-none font-light h-full"
                                autoFocus
                            />
                        </div>

                        {/* Right: Actions */}
                        <div className="flex items-center gap-3 pl-4">
                            <button className="bg-blue-600 hover:bg-blue-500 text-white rounded-full w-9 h-9 flex items-center justify-center transition-colors">
                                <ArrowUp className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Results Grid - Only show if searching */}
                {search.length > 0 && (
                    <div className="w-full mt-8 grid grid-cols-1 md:grid-cols-2 gap-3">
                        <AnimatePresence>
                            {filteredAgents.map((agent) => (
                                <motion.div
                                    key={agent.id}
                                    layout
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    transition={{ duration: 0.1 }}
                                >
                                    <Link
                                        href={`/dashboard/${agent.slug}`}
                                        className="block group"
                                    >
                                        <div className="bg-[#18181b] hover:bg-[#27272a] rounded-xl p-3 flex items-center gap-3 transition-colors border border-white/5">
                                            <div className="w-8 h-8 rounded-full bg-gray-900 overflow-hidden border border-white/10 shrink-0">
                                                <img
                                                    src={agent.avatar}
                                                    alt={agent.name}
                                                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all"
                                                />
                                            </div>
                                            <div className="flex flex-col min-w-0">
                                                <span className="text-white font-medium text-sm truncate group-hover:text-blue-400 transition-colors">
                                                    {agent.name}
                                                </span>
                                                <span className="text-[10px] text-gray-500 uppercase tracking-wider truncate">
                                                    {agent.role}
                                                </span>
                                            </div>
                                        </div>
                                    </Link>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}

                {search.length > 0 && filteredAgents.length === 0 && (
                    <div className="text-gray-500 text-sm">
                        No agents found matching &quot;{search}&quot;
                    </div>
                )}
            </div>
        </div>
    )
}
