'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react'
import { Card } from '@/components/ui/card'

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MOCK_EVENTS = [
    { day: 5, title: "Product Teaser", type: "Reel", color: "bg-purple-500/20 text-purple-400 border-purple-500/30" },
    { day: 8, title: "Team Culture", type: "Post", color: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
    { day: 12, title: "Industry News", type: "Article", color: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" },
    { day: 15, title: "Webinar Promo", type: "Story", color: "bg-orange-500/20 text-orange-400 border-orange-500/30" },
    { day: 22, title: "Customer Story", type: "Video", color: "bg-pink-500/20 text-pink-400 border-pink-500/30" },
    { day: 26, title: "Weekly Recap", type: "Carousel", color: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
]

export function ScheduleView() {
    const [currentDate, setCurrentDate] = useState(new Date())

    return (
        <div className="space-y-6">
            {/* Calendar Header */}
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white">
                    {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                </h2>
                <div className="flex items-center gap-2">
                    <button className="p-2 hover:bg-white/10 rounded-full text-slate-400 hover:text-white transition-colors">
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button className="px-4 py-1.5 text-sm bg-white/10 hover:bg-white/20 rounded-md text-white transition-colors">
                        Today
                    </button>
                    <button className="p-2 hover:bg-white/10 rounded-full text-slate-400 hover:text-white transition-colors">
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Calendar Grid */}
            <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
                {/* Days Header */}
                <div className="grid grid-cols-7 border-b border-white/10 bg-black/20">
                    {DAYS.map(day => (
                        <div key={day} className="py-3 text-center text-sm font-medium text-slate-500">
                            {day}
                        </div>
                    ))}
                </div>

                {/* Calendar Cells */}
                <div className="grid grid-cols-7 auto-rows-[140px] divide-x divide-white/10 bg-black/40">
                    {/* Empty cells for padding (simplified for demo) */}
                    <div className="bg-white/[0.02]" />
                    <div className="bg-white/[0.02]" />

                    {/* Days 1-31 */}
                    {Array.from({ length: 31 }).map((_, i) => {
                        const day = i + 1
                        const events = MOCK_EVENTS.filter(e => e.day === day)

                        return (
                            <div key={day} className="p-2 relative group hover:bg-white/[0.02] transition-colors border-b border-white/10">
                                <span className="text-sm text-slate-400 font-medium block mb-2">{day}</span>

                                <div className="space-y-1">
                                    {events.map((event, idx) => (
                                        <div
                                            key={idx}
                                            className={`text-xs p-1.5 rounded border mb-1 truncate cursor-pointer hover:opacity-80 transition-opacity ${event.color}`}
                                        >
                                            {event.title}
                                        </div>
                                    ))}
                                </div>

                                {/* Add Button (Hover) */}
                                <button className="absolute bottom-2 right-2 w-6 h-6 rounded-full bg-[#1C73E8] text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
                                    +
                                </button>
                            </div>
                        )
                    })}

                    {/* Trailing empty cells */}
                    <div className="bg-white/[0.02]" />
                    <div className="bg-white/[0.02]" />
                </div>
            </div>
        </div>
    )
}
