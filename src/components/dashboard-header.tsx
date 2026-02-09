import { ArrowUpRight, Calendar } from 'lucide-react'
import { HeaderTools } from '@/components/header-tools'
import { HeaderWorkflows } from '@/components/header-workflows'

export function DashboardHeader() {

    return (
        <div className="hidden md:flex justify-between items-center h-16 px-8 border-b border-white/10 shrink-0 bg-[#171717] sticky top-0 z-50">
            <div className="flex items-center gap-4">
                <div className="bg-yellow-900/20 text-yellow-500 text-xs px-2 py-0.5 rounded flex items-center gap-2">
                    <span>⚠️</span> This platform and all agents are in beta.
                </div>
            </div>
            <div className="flex items-center gap-6">
                <div className="flex gap-3 text-xs font-bold tracking-wider items-center">
                    <HeaderWorkflows />
                    <HeaderTools />
                </div>
            </div>
        </div>
    )
}
