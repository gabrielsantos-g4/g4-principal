import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CalendarDays, MessageSquare, Share2, ThumbsUp } from "lucide-react"

const dummyPlans = [
    {
        id: 1,
        title: "LinkedIn Brand Awareness",
        status: "Active",
        period: "Jan 1 - Jan 31",
        description: "Focus on establishing thought leadership through daily industry insights and team culture showcasing.",
        stats: { posts: 12, engagement: "High" }
    },
    {
        id: 2,
        title: "Instagram Product Launch",
        status: "Draft",
        period: "Feb 1 - Feb 14",
        description: "Visual campaign for the new feature rollout. Mix of Reels and Carousels.",
        stats: { posts: 8, engagement: "Pending" }
    },
    {
        id: 3,
        title: "Twitter Community Management",
        status: "Review",
        period: "Ongoing",
        description: "Daily engagement with community replies and trending topic participation.",
        stats: { posts: 45, engagement: "Medium" }
    }
]

export function PlanningView() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {dummyPlans.map((plan) => (
                <Card key={plan.id} className="bg-white/5 border-white/10 hover:border-white/20 transition-all">
                    <CardHeader>
                        <div className="flex justify-between items-start mb-2">
                            <Badge variant={plan.status === 'Active' ? 'default' : 'secondary'} className={plan.status === 'Active' ? 'bg-[#1C73E8]' : ''}>
                                {plan.status}
                            </Badge>
                            <span className="text-xs text-slate-400 flex items-center gap-1">
                                <CalendarDays className="w-3 h-3" />
                                {plan.period}
                            </span>
                        </div>
                        <CardTitle className="text-lg text-white">{plan.title}</CardTitle>
                        <CardDescription className="text-slate-400 mt-2 line-clamp-3">
                            {plan.description}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-4 text-sm text-slate-400 mt-2 pt-4 border-t border-white/5">
                            <div className="flex items-center gap-1">
                                <MessageSquare className="w-4 h-4" />
                                <span>{plan.stats.posts} Posts</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <ThumbsUp className="w-4 h-4" />
                                <span>{plan.stats.engagement} impact</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ))}

            {/* Add New Plan Card */}
            <button className="h-full min-h-[200px] rounded-xl border-2 border-dashed border-white/10 flex flex-col items-center justify-center gap-2 hover:bg-white/5 transition-all group">
                <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-slate-400 group-hover:text-white group-hover:bg-[#1C73E8] transition-all">
                    <span className="text-2xl">+</span>
                </div>
                <span className="text-slate-400 font-medium group-hover:text-white">New Strategy Plan</span>
            </button>
        </div>
    )
}
