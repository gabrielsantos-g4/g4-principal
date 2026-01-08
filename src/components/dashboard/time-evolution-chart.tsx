'use client'

import { useState, useMemo } from 'react'
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { MonthlyTrendData } from '@/lib/report-types'


interface TimeEvolutionChartProps {
    data: MonthlyTrendData[]
}

const COLORS = [
    '#10b981', // emerald-500
    '#3b82f6', // blue-500
    '#f59e0b', // amber-500
    '#ef4444', // red-500
    '#8b5cf6', // violet-500
    '#ec4899', // pink-500
    '#06b6d4', // cyan-500
]

export function TimeEvolutionChart({ data }: TimeEvolutionChartProps) {
    const [selectedMetric, setSelectedMetric] = useState<'spent' | 'impressions' | 'clicks' | 'ctr' | 'cpc' | 'mixed'>('spent')

    // 1. Identify all unique groups across all months to create lines
    const allGroups = useMemo(() => {
        const groups = new Set<string>()
        data.forEach(month => {
            if (month.groups_breakdown) {
                Object.keys(month.groups_breakdown).forEach(g => groups.add(g))
            }
        })
        return Array.from(groups).sort()
    }, [data])

    // 2. Determine Top 5 Groups by Total Value of the selected metric
    // NOTE: For CTR and CPC, we rank by SPENT to show the most significant groups financially.
    const topGroups = useMemo(() => {
        const groupTotals: Record<string, number> = {}

        data.forEach(month => {
            let source: Record<string, number> | undefined

            if (selectedMetric === 'impressions') {
                source = month.groups_breakdown_impressions
            } else if (selectedMetric === 'clicks') {
                source = month.groups_breakdown_clicks
            } else {
                // For spent, mixed, ctr, cpc -> Use Spent for ranking
                source = month.groups_breakdown
            }

            if (source) {
                Object.entries(source).forEach(([group, value]) => {
                    groupTotals[group] = (groupTotals[group] || 0) + (value as number)
                })
            }
        })

        // If no breakdown data found for selected metric, return empty (will fallback to Total)
        if (Object.keys(groupTotals).length === 0) return []

        return Object.entries(groupTotals)
            .sort(([, a], [, b]) => b - a) // Descending
            .slice(0, 5) // Top 5
            .map(([g]) => g)
    }, [data, selectedMetric])

    // 3. Format data for Recharts
    const chartData = useMemo(() => {
        return data.map(m => {
            let totalVal = 0
            if (selectedMetric === 'spent') totalVal = m.overview.spent
            else if (selectedMetric === 'impressions') totalVal = m.overview.impressions
            else if (selectedMetric === 'clicks') totalVal = m.overview.clicks
            else if (selectedMetric === 'ctr') totalVal = (m.overview.ctr || 0) * 100 // Convert to %
            else if (selectedMetric === 'cpc') totalVal = m.overview.cpc

            const row: any = {
                month: new Date(m.timestamp).toLocaleDateString(undefined, { month: 'short', year: 'numeric', timeZone: 'UTC' }),
                fullDate: m.month,
                spent: m.overview.spent,
                impressions: m.overview.impressions,
                clicks: m.overview.clicks,
                total: selectedMetric !== 'mixed' ? totalVal : 0
            }

            // Add group columns if applicable
            if (topGroups.length > 0) {
                topGroups.forEach(group => {
                    let val = 0
                    if (selectedMetric === 'spent') {
                        val = m.groups_breakdown?.[group] || 0
                    } else if (selectedMetric === 'impressions') {
                        val = m.groups_breakdown_impressions?.[group] || 0
                    } else if (selectedMetric === 'clicks') {
                        val = m.groups_breakdown_clicks?.[group] || 0
                    } else if (selectedMetric === 'ctr') {
                        const c = m.groups_breakdown_clicks?.[group] || 0
                        const i = m.groups_breakdown_impressions?.[group] || 0
                        val = i > 0 ? (c / i) * 100 : 0
                    } else if (selectedMetric === 'cpc') {
                        const s = m.groups_breakdown?.[group] || 0
                        const c = m.groups_breakdown_clicks?.[group] || 0
                        val = c > 0 ? (s / c) : 0
                    }
                    if (val > 0) row[group] = val
                })
            }
            return row
        })
    }, [data, selectedMetric, topGroups])

    const formatYAxis = (value: number) => {
        if (selectedMetric === 'spent' || selectedMetric === 'cpc') return `$${value.toLocaleString(undefined, { notation: "compact" })}`
        if (selectedMetric === 'ctr') return `${value.toFixed(1)}%`
        return value.toLocaleString(undefined, { notation: "compact" })
    }

    const formatTooltip = (value: any, name: any) => {
        if (selectedMetric === 'mixed') {
            if (name === 'Spend ($)') return [`$${value.toLocaleString()}`, name]
            return [value.toLocaleString(), name]
        }

        let formattedValue = value
        if (typeof value === 'number') {
            if (selectedMetric === 'spent' || selectedMetric === 'cpc') formattedValue = `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
            else if (selectedMetric === 'ctr') formattedValue = `${value.toFixed(2)}%`
            else formattedValue = value.toLocaleString()
        }

        return [formattedValue, name === 'total' ? 'Total' : name]
    }

    return (
        <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle>Monthly Evolution</CardTitle>
                        <CardDescription>
                            {selectedMetric === 'mixed'
                                ? 'Comparison of Spend, Impressions, and Clicks'
                                : topGroups.length > 0
                                    ? `${selectedMetric.charAt(0).toUpperCase() + selectedMetric.slice(1)} breakdown by Top 5 Campaign Groups`
                                    : `Total ${selectedMetric} trend over time`}
                        </CardDescription>
                    </div>
                    <div className="relative">
                        <select
                            value={selectedMetric}
                            onChange={(e) => setSelectedMetric(e.target.value as any)}
                            className="w-[180px] appearance-none bg-slate-950 border border-slate-700 text-slate-100 text-sm rounded-md py-2 pl-3 pr-8 focus:outline-none focus:ring-2 focus:ring-slate-400"
                        >
                            <option value="spent">Spend ($)</option>
                            <option value="impressions">Impressions</option>
                            <option value="clicks">Clicks</option>
                            <option value="ctr">CTR (%)</option>
                            <option value="cpc">CPC ($)</option>
                            <option value="mixed">All Metrics (Merge)</option>
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-400">
                            <svg className="h-4 w-4 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                                <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                            </svg>
                        </div>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="h-[400px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                            <XAxis
                                dataKey="month"
                                stroke="#94a3b8"
                                tickLine={false}
                                axisLine={false}
                                tickMargin={10}
                            />

                            {selectedMetric === 'mixed' ? (
                                <>
                                    {/* Left Axis: Spend */}
                                    <YAxis
                                        yAxisId="left"
                                        stroke="#10b981"
                                        tickLine={false}
                                        axisLine={false}
                                        tickFormatter={(val) => `$${val.toLocaleString(undefined, { notation: "compact" })}`}
                                    />
                                    {/* Right Axis: Impressions/Clicks (Log scale might be better but linear is safer for zero values) */}
                                    {/* We will use one axis for Clicks (Right) and maybe another for Impressions? */}
                                    {/* Actually, let's put Clicks on Right and Impressions on separate scale if possible, or same. */}
                                    {/* Impressions (1M) vs Clicks (5k) -> Cannot share axis. */}

                                    <YAxis
                                        yAxisId="right_imps"
                                        orientation="right"
                                        stroke="#3b82f6"
                                        tickLine={false}
                                        axisLine={false}
                                        tickFormatter={(val) => val.toLocaleString(undefined, { notation: "compact" })}
                                    />

                                    {/* We hide the third axis labels to avoid clutter, or offset it? */}
                                    {/* Let's try displaying it offset. */}
                                    <YAxis
                                        yAxisId="right_clicks"
                                        orientation="right"
                                        stroke="#f59e0b"
                                        tickLine={false}
                                        axisLine={false}
                                        tickFormatter={(val) => val.toLocaleString(undefined, { notation: "compact" })}
                                        display="none" // Hide axis visual but keep scale
                                    />
                                </>
                            ) : (
                                <YAxis
                                    stroke="#94a3b8"
                                    tickLine={false}
                                    axisLine={false}
                                    tickFormatter={formatYAxis}
                                />
                            )}

                            <Tooltip
                                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#f8fafc' }}
                                formatter={formatTooltip}
                                labelStyle={{ color: '#94a3b8' }}
                            />
                            <Legend wrapperStyle={{ paddingTop: '20px' }} />

                            {selectedMetric === 'mixed' ? (
                                <>
                                    <Line
                                        yAxisId="left"
                                        type="monotone"
                                        dataKey="spent"
                                        stroke="#10b981"
                                        strokeWidth={2}
                                        dot={{ r: 4, strokeWidth: 0 }}
                                        activeDot={{ r: 6 }}
                                        name="Spend ($)"
                                    />
                                    <Line
                                        yAxisId="right_imps"
                                        type="monotone"
                                        dataKey="impressions"
                                        stroke="#3b82f6"
                                        strokeWidth={2}
                                        dot={{ r: 4, strokeWidth: 0 }}
                                        activeDot={{ r: 6 }}
                                        name="Impressions"
                                    />
                                    <Line
                                        yAxisId="right_clicks"
                                        type="monotone"
                                        dataKey="clicks"
                                        stroke="#f59e0b"
                                        strokeWidth={2}
                                        dot={{ r: 4, strokeWidth: 0 }}
                                        activeDot={{ r: 6 }}
                                        name="Clicks"
                                    />
                                </>
                            ) : topGroups.length > 0 ? (
                                // Show breakdown lines if we have groups
                                topGroups.map((group, index) => (
                                    <Line
                                        key={group}
                                        type="monotone"
                                        dataKey={group}
                                        stroke={COLORS[index % COLORS.length]}
                                        strokeWidth={2}
                                        dot={{ r: 4, strokeWidth: 0 }}
                                        activeDot={{ r: 6 }}
                                    />
                                ))
                            ) : (
                                // Fallback to Total Line if no groups found (or data missing)
                                <Line
                                    type="monotone"
                                    dataKey="total"
                                    stroke={
                                        selectedMetric === 'impressions' ? '#3b82f6' :
                                            selectedMetric === 'clicks' ? '#f59e0b' :
                                                selectedMetric === 'ctr' ? '#8b5cf6' :
                                                    selectedMetric === 'cpc' ? '#ec4899' :
                                                        '#10b981'
                                    }
                                    strokeWidth={3}
                                    dot={{ r: 4, strokeWidth: 0 }}
                                    activeDot={{ r: 6 }}
                                    name={`Total ${selectedMetric.charAt(0).toUpperCase() + selectedMetric.slice(1)}`}
                                />
                            )}
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    )
}
