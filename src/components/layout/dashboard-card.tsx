import React from "react"
import { cn } from "@/lib/utils"

interface DashboardCardProps {
    children: React.ReactNode
    className?: string
}

export function DashboardCard({ children, className }: DashboardCardProps) {
    return (
        <div className={cn(
            "flex-1 bg-[#111] rounded-xl border border-white/10 overflow-hidden shadow-2xl flex flex-col h-full",
            className
        )}>
            {children}
        </div>
    )
}
