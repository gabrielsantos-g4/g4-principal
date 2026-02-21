"use client"

import { motion } from "framer-motion"

interface AgentsOverviewProps {
    userName?: string
}

export function AgentsOverview({ userName }: AgentsOverviewProps) {
    const firstName = userName?.split(' ')[0] || 'there'

    return (
        <div className="w-full min-h-[80vh] flex flex-col items-center justify-center p-6 relative">
            {/* Background Gradient Effect */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-zinc-500/10 blur-[120px] rounded-full pointer-events-none" />

            <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="flex flex-col items-center gap-3 relative z-10 text-center"
            >
                <h1 className="text-3xl font-medium text-white tracking-tight">
                    Hi, {firstName}. What are we doing today?
                </h1>
                <p className="text-sm text-slate-500">
                    Select an agent from the sidebar to get started.
                </p>
            </motion.div>
        </div>
    )
}
