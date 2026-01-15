'use client'

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MessageSquareText, Lightbulb, Copy } from "lucide-react"

const IDEAS_AND_SCRIPTS = [
    {
        id: 1,
        type: "Idea",
        title: "Behind the Scenes - Office Tour",
        content: "Show the new studio setup and introduce the video team. Focus on the high-tech equipment to imply quality.",
        date: "Today"
    },
    {
        id: 2,
        type: "Script",
        title: "Product Launch Teaser Hook",
        content: "\"Stop scrolling if you want to double your leads in 2026. Here is the exact strategy we used...\"",
        date: "Yesterday"
    },
    {
        id: 3,
        type: "Idea",
        title: "Customer Success Story - TechCorp",
        content: "Interview John from TechCorp about how they reduced churn by 15%. Key takeaway: personalization at scale.",
        date: "2 days ago"
    },
    {
        id: 4,
        type: "Script",
        title: "Objection Handling - Pricing",
        content: "\"Expensive? Let's break down the cost of NOT solving this problem. You are losing $5k/month on inefficiencies...\"",
        date: "Last week"
    },
    {
        id: 5,
        type: "Idea",
        title: "Trend Jacking - AI News",
        content: "React to the latest OpenAI announcement. Position our product as the bridge between raw AI and business utility.",
        date: "Last week"
    }
]

export function PlanningView() {
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-white">Ideas & Scripts</h3>
                <button className="bg-[#1C73E8] px-4 py-2 rounded-lg text-sm font-medium text-white hover:bg-[#1557b0] transition-colors flex items-center gap-2">
                    <Lightbulb className="w-4 h-4" />
                    New Idea
                </button>
            </div>

            <div className="grid gap-4">
                {IDEAS_AND_SCRIPTS.map((item) => (
                    <Card key={item.id} className="bg-white/5 border-white/10 hover:border-white/20 transition-all group">
                        <CardContent className="p-6">
                            <div className="flex justify-between items-start gap-4">
                                <div className="space-y-2 flex-1">
                                    <div className="flex items-center gap-2">
                                        <Badge
                                            variant="secondary"
                                            className={`${item.type === 'Idea'
                                                    ? 'bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500/20'
                                                    : 'bg-purple-500/10 text-purple-400 hover:bg-purple-500/20'
                                                } border-0 rounded-md px-2 py-0.5`}
                                        >
                                            <div className="flex items-center gap-1.5">
                                                {item.type === 'Idea' ? <Lightbulb className="w-3 h-3" /> : <MessageSquareText className="w-3 h-3" />}
                                                {item.type}
                                            </div>
                                        </Badge>
                                        <span className="text-sm text-slate-500">{item.date}</span>
                                    </div>
                                    <h4 className="text-lg font-semibold text-white">{item.title}</h4>
                                    <p className="text-slate-300 text-sm leading-relaxed">{item.content}</p>
                                </div>
                                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button className="p-2 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white" title="Copy to clipboard">
                                        <Copy className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
}
