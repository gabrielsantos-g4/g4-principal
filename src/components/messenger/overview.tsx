"use client"

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from "recharts"
import { ChartData } from "@/actions/messenger/dashboard-actions"

interface OverviewProps {
    data: ChartData[]
}

export function Overview({ data }: OverviewProps) {
    if (!data || data.length === 0) {
        return (
            <div className="flex h-[350px] items-center justify-center text-gray-500 bg-[#1a1a1a]/50 rounded-lg border border-white/10 border-dashed">
                <p>Nenhum dado disponível para o período.</p>
            </div>
        )
    }

    return (
        <ResponsiveContainer width="100%" height={350}>
            <BarChart data={data}>
                <XAxis
                    dataKey="name"
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                />
                <YAxis
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `${value}`}
                />
                <Tooltip
                    contentStyle={{
                        backgroundColor: '#1a1a1a',
                        borderRadius: '8px',
                        border: '1px solid rgba(255,255,255,0.1)',
                        color: 'white'
                    }}
                    cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                />
                <Legend iconType="circle" />
                <Bar
                    dataKey="sent"
                    name="Enviadas"
                    fill="#3b82f6" // blue-500
                    radius={[4, 4, 0, 0]}
                />
                <Bar
                    dataKey="delivered"
                    name="Entregues"
                    fill="#22c55e" // green-500
                    radius={[4, 4, 0, 0]}
                />
                <Bar
                    dataKey="read"
                    name="Lidas"
                    fill="#a855f7" // purple-500
                    radius={[4, 4, 0, 0]}
                />
            </BarChart>
        </ResponsiveContainer>
    )
}
