'use client'

import { Search, TrendingUp, BarChart2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Keyword {
    id: string
    term: string
    vol: number
    difficulty: number
    intent: 'Info' | 'Commercial' | 'Trans'
}

const MOCK_KEYWORDS: Keyword[] = [
    { id: '1', term: 'sales funnel optimization', vol: 1200, difficulty: 45, intent: 'Info' },
    { id: '2', term: 'best crm for startups', vol: 800, difficulty: 65, intent: 'Commercial' },
    { id: '3', term: 'lead generation strategies 2024', vol: 2400, difficulty: 55, intent: 'Info' },
    { id: '4', term: 'email maketing automation', vol: 3500, difficulty: 30, intent: 'Trans' },
    { id: '5', term: 'customer retention metrics', vol: 600, difficulty: 40, intent: 'Info' },
]

interface KeywordListProps {
    onSelect: (keyword: Keyword) => void
    selectedId?: string
}

export function KeywordList({ onSelect, selectedId }: KeywordListProps) {
    return (
        <div className="h-full flex flex-col border-r border-white/10 bg-black/20 w-80 shrink-0">
            <div className="p-4 border-b border-white/10">
                <h3 className="font-semibold text-white mb-4">Target Keywords</h3>
                <div className="relative">
                    <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                    <input
                        type="text"
                        placeholder="Search keywords..."
                        className="w-full bg-white/5 border border-white/10 rounded-md py-2 pl-9 pr-4 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-[#1C73E8]/50 transition-colors"
                    />
                </div>
            </div>

            <div className="flex-1 overflow-y-auto">
                {MOCK_KEYWORDS.map(kw => (
                    <button
                        key={kw.id}
                        onClick={() => onSelect(kw)}
                        className={cn(
                            "w-full text-left p-4 border-b border-white/5 hover:bg-white/5 transition-colors group",
                            selectedId === kw.id ? "bg-white/5 border-l-2 border-l-[#1C73E8]" : "border-l-2 border-l-transparent"
                        )}
                    >
                        <div className="flex justify-between items-start mb-1">
                            <span className={cn(
                                "font-medium truncate pr-2",
                                selectedId === kw.id ? "text-white" : "text-slate-300 group-hover:text-white"
                            )}>
                                {kw.term}
                            </span>
                            <span className={cn(
                                "text-[10px] px-1.5 py-0.5 rounded uppercase font-bold tracking-wider",
                                kw.intent === 'Info' ? "bg-blue-500/10 text-blue-400" :
                                    kw.intent === 'Commercial' ? "bg-purple-500/10 text-purple-400" :
                                        "bg-emerald-500/10 text-emerald-400"
                            )}>
                                {kw.intent.charAt(0)}
                            </span>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-slate-500 mt-2">
                            <div className="flex items-center gap-1" title="Search Volume">
                                <TrendingUp className="w-3 h-3" />
                                <span>{kw.vol.toLocaleString()}</span>
                            </div>
                            <div className="flex items-center gap-1" title="Keyword Difficulty">
                                <BarChart2 className="w-3 h-3" />
                                <span className={cn(
                                    kw.difficulty > 60 ? "text-red-400" : kw.difficulty > 30 ? "text-amber-400" : "text-emerald-400"
                                )}>
                                    KD {kw.difficulty}
                                </span>
                            </div>
                        </div>
                    </button>
                ))}
            </div>

            <div className="p-4 border-t border-white/10">
                <button className="w-full py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-md text-sm text-slate-300 transition-colors">
                    + Add New Keyword
                </button>
            </div>
        </div>
    )
}
