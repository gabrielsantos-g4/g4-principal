'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Line, LineChart, Area, AreaChart } from "recharts"

const DATA_REACH = [
    { name: "Instagram", value: 12500 },
    { name: "LinkedIn", value: 8900 },
    { name: "Twitter", value: 4500 },
    { name: "YouTube", value: 15300 },
    { name: "TikTok", value: 22100 },
]

const DATA_ENGAGEMENT = [
    { name: "Mon", ig: 400, li: 240, yt: 150 },
    { name: "Tue", ig: 300, li: 139, yt: 220 },
    { name: "Wed", ig: 200, li: 980, yt: 229 },
    { name: "Thu", ig: 278, li: 390, yt: 200 },
    { name: "Fri", ig: 189, li: 480, yt: 218 },
    { name: "Sat", ig: 239, li: 380, yt: 250 },
    { name: "Sun", ig: 349, li: 430, yt: 310 },
]

const DATA_GROWTH = [
    { name: "Week 1", followers: 12000 },
    { name: "Week 2", followers: 12400 },
    { name: "Week 3", followers: 12900 },
    { name: "Week 4", followers: 13500 },
]

const DATA_CLICKS = [
    { name: "IG Bio", value: 450 },
    { name: "LI Post", value: 320 },
    { name: "YT Desc", value: 550 },
    { name: "Twitter", value: 120 },
]

export function ReportView() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Chart 1: Total Reach by Channel */}
            <Card className="bg-white/5 border-white/10">
                <CardHeader>
                    <CardTitle className="text-white">Total Reach</CardTitle>
                    <CardDescription>Impressions across all channels</CardDescription>
                </CardHeader>
                <CardContent className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={DATA_REACH}>
                            <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value / 1000}k`} />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#171717', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                                itemStyle={{ color: '#fff' }}
                            />
                            <Bar dataKey="value" fill="#1C73E8" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            {/* Chart 2: Engagement Trends */}
            <Card className="bg-white/5 border-white/10">
                <CardHeader>
                    <CardTitle className="text-white">Engagement Rate</CardTitle>
                    <CardDescription>Weekly interaction breakdown</CardDescription>
                </CardHeader>
                <CardContent className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={DATA_ENGAGEMENT}>
                            <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#171717', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                                itemStyle={{ color: '#fff' }}
                            />
                            <Line type="monotone" dataKey="ig" stroke="#E1306C" strokeWidth={2} dot={false} />
                            <Line type="monotone" dataKey="li" stroke="#0077B5" strokeWidth={2} dot={false} />
                            <Line type="monotone" dataKey="yt" stroke="#FF0000" strokeWidth={2} dot={false} />
                        </LineChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            {/* Chart 3: Follower Growth */}
            <Card className="bg-white/5 border-white/10">
                <CardHeader>
                    <CardTitle className="text-white">Profile Growth</CardTitle>
                    <CardDescription>New followers over the last 30 days</CardDescription>
                </CardHeader>
                <CardContent className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={DATA_GROWTH}>
                            <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value / 1000}k`} />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#171717', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                                itemStyle={{ color: '#fff' }}
                            />
                            <Area type="monotone" dataKey="followers" stroke="#10B981" fill="#10B981" fillOpacity={0.2} />
                        </AreaChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            {/* Chart 4: Traffic Sources */}
            <Card className="bg-white/5 border-white/10">
                <CardHeader>
                    <CardTitle className="text-white">Link Clicks</CardTitle>
                    <CardDescription>Traffic driven to website</CardDescription>
                </CardHeader>
                <CardContent className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={DATA_CLICKS} layout="vertical">
                            <XAxis type="number" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis dataKey="name" type="category" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} width={80} />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#171717', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                                itemStyle={{ color: '#fff' }}
                            />
                            <Bar dataKey="value" fill="#F59E0B" radius={[0, 4, 4, 0]} barSize={20} />
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
        </div>
    )
}
