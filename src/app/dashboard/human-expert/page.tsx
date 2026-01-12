'use client'

import {
    Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis,
    BarChart, Bar, Cell,
    Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
    RadialBarChart, RadialBar, Legend
} from 'recharts'
import { BrainCircuit, TrendingUp, Users, Target } from 'lucide-react'

// Mock Data for Charts
const efficiencyData = [
    { name: 'Optimization', uv: 100, fill: '#1C73E8' },
    { name: 'Uptime', uv: 98, fill: '#10B981' },
    { name: 'Accuracy', uv: 95, fill: '#F59E0B' },
]

const growthData = [
    { month: 'Jan', revenue: 4000 },
    { month: 'Feb', revenue: 3000 },
    { month: 'Mar', revenue: 5000 },
    { month: 'Apr', revenue: 7500 },
    { month: 'May', revenue: 9000 },
    { month: 'Jun', revenue: 12000 },
]

const funnelData = [
    { name: 'Awareness', value: 1000 },
    { name: 'Interest', value: 800 },
    { name: 'Consideration', value: 600 },
    { name: 'Intent', value: 400 },
    { name: 'Purchase', value: 200 },
]

const radarData = [
    { subject: 'Strategy', A: 120, fullMark: 150 },
    { subject: 'Tech', A: 98, fullMark: 150 },
    { subject: 'Creative', A: 86, fullMark: 150 },
    { subject: 'Analytics', A: 99, fullMark: 150 },
    { subject: 'Leadership', A: 85, fullMark: 150 },
    { subject: 'Execution', A: 65, fullMark: 150 },
]

export default function HumanExpertPage() {
    return (
        <div className="p-8 bg-black min-h-screen text-white overflow-y-auto">
            <div className="max-w-7xl mx-auto">
                <div className="mb-10">
                    <h1 className="text-3xl font-bold mb-2">Human Orchestration Services</h1>
                    <p className="text-gray-400">Premium strategic oversight and operational excellence by Gabriel Santos.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                    {/* CARD 1: Agent Orchestration */}
                    <div className="bg-[#111] border border-white/5 rounded-2xl p-6 hover:border-[#1C73E8]/30 transition-colors group">
                        <div className="flex items-start justify-between mb-6">
                            <div>
                                <h2 className="text-xl font-bold mb-1 group-hover:text-[#1C73E8] transition-colors">Agent Orchestration & Tuning</h2>
                                <p className="text-sm text-gray-400">Ensuring your AI workforce operates at peak performance.</p>
                            </div>
                            <div className="p-3 bg-[#1C73E8]/10 rounded-lg text-[#1C73E8]">
                                <BrainCircuit size={24} />
                            </div>
                        </div>

                        <div className="h-[250px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <RadialBarChart cx="50%" cy="50%" innerRadius="30%" outerRadius="100%" barSize={20} data={efficiencyData}>
                                    <RadialBar
                                        background
                                        dataKey="uv"
                                    />
                                    <Legend iconSize={10} layout="vertical" verticalAlign="middle" wrapperStyle={{ right: 0 }} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#1A1A1A', border: '1px solid #333', borderRadius: '8px' }}
                                        itemStyle={{ color: '#fff' }}
                                    />
                                </RadialBarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* CARD 2: Strategic Growth Mapping */}
                    <div className="bg-[#111] border border-white/5 rounded-2xl p-6 hover:border-[#10B981]/30 transition-colors group">
                        <div className="flex items-start justify-between mb-6">
                            <div>
                                <h2 className="text-xl font-bold mb-1 group-hover:text-[#10B981] transition-colors">Strategic Growth Mapping</h2>
                                <p className="text-sm text-gray-400">Data-driven projections and scalable revenue models.</p>
                            </div>
                            <div className="p-3 bg-[#10B981]/10 rounded-lg text-[#10B981]">
                                <TrendingUp size={24} />
                            </div>
                        </div>

                        <div className="h-[250px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={growthData}>
                                    <defs>
                                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <XAxis dataKey="month" stroke="#333" />
                                    <YAxis stroke="#333" />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#1A1A1A', border: '1px solid #333', borderRadius: '8px' }}
                                        itemStyle={{ color: '#10B981' }}
                                    />
                                    <Area type="monotone" dataKey="revenue" stroke="#10B981" fillOpacity={1} fill="url(#colorRevenue)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* CARD 3: Full-Funnel Architecture */}
                    <div className="bg-[#111] border border-white/5 rounded-2xl p-6 hover:border-[#F59E0B]/30 transition-colors group">
                        <div className="flex items-start justify-between mb-6">
                            <div>
                                <h2 className="text-xl font-bold mb-1 group-hover:text-[#F59E0B] transition-colors">Full-Funnel Architecture</h2>
                                <p className="text-sm text-gray-400">Optimizing every touchpoint from awareness to conversion.</p>
                            </div>
                            <div className="p-3 bg-[#F59E0B]/10 rounded-lg text-[#F59E0B]">
                                <Target size={24} />
                            </div>
                        </div>

                        <div className="h-[250px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart layout="vertical" data={funnelData} margin={{ left: 40 }}>
                                    <XAxis type="number" stroke="#333" />
                                    <YAxis dataKey="name" type="category" stroke="#999" width={100} tick={{ fontSize: 12 }} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#1A1A1A', border: '1px solid #333', borderRadius: '8px' }}
                                        cursor={{ fill: 'transparent' }}
                                    />
                                    <Bar dataKey="value" fill="#F59E0B" radius={[0, 4, 4, 0]} barSize={20} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* CARD 4: Fractional Leadership */}
                    <div className="bg-[#111] border border-white/5 rounded-2xl p-6 hover:border-[#8B5CF6]/30 transition-colors group">
                        <div className="flex items-start justify-between mb-6">
                            <div>
                                <h2 className="text-xl font-bold mb-1 group-hover:text-[#8B5CF6] transition-colors">Fractional Leadership (CMO)</h2>
                                <p className="text-sm text-gray-400">Executive-level guidance without the full-time overhead.</p>
                            </div>
                            <div className="p-3 bg-[#8B5CF6]/10 rounded-lg text-[#8B5CF6]">
                                <Users size={24} />
                            </div>
                        </div>

                        <div className="h-[250px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                                    <PolarGrid stroke="#333" />
                                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#999', fontSize: 10 }} />
                                    <PolarRadiusAxis angle={30} domain={[0, 150]} tick={false} axisLine={false} />
                                    <Radar
                                        name="Gabriel Santos"
                                        dataKey="A"
                                        stroke="#8B5CF6"
                                        fill="#8B5CF6"
                                        fillOpacity={0.4}
                                    />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#1A1A1A', border: '1px solid #333', borderRadius: '8px' }}
                                        itemStyle={{ color: '#8B5CF6' }}
                                    />
                                </RadarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    )
}
