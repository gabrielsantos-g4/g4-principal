'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { FileUpload } from '@/components/dashboard/file-upload'
import { uploadAndGetReport } from '@/actions/report-actions'
import { AdsReportData, PriorityAction, AdPerformance } from "@/lib/report-types"
import { Monitor, Pause, TrendingUp, AlertTriangle, Loader2, LayoutDashboard } from "lucide-react"

// Keeping helper constants
const COLORS = {
    scale: '#10b981',
    monitor: '#f59e0b',
    pause: '#ef4444',
    cold: '#3b82f6',
    retargeting: '#8b5cf6'
}

const getAdColor = (category: string) => COLORS[category as keyof typeof COLORS] || '#ccc'

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"

// Helper to parse benchmark range string (e.g., "0.35-0.55%" or "$1.20-$2.50")
function parseBenchmark(benchmarkStr: string): { min: number, max: number } | null {
    if (!benchmarkStr || benchmarkStr === '-') return null
    try {
        const parts = benchmarkStr
            .replace(/[^\d.\-]/g, ' ')
            .split(/[\s-]+/)
            .filter(part => part.trim() !== '')

        if (parts.length === 2) {
            return { min: parseFloat(parts[0]), max: parseFloat(parts[1]) }
        }
    } catch (e) {
        return null
    }
    return null
}

// Helper to determine status based on value, benchmark, and direction
function getMetricStatus(
    value: number,
    benchmarkStr: string,
    type: 'higher-better' | 'lower-better'
): 'good' | 'neutral' | 'bad' | 'neutral-no-benchmark' {
    const range = parseBenchmark(benchmarkStr)
    if (!range) return 'neutral-no-benchmark'

    if (type === 'higher-better') {
        if (value > range.max) return 'good' // Above benchmark is Green
        if (value < range.min) return 'bad'  // Below benchmark is Red
        return 'neutral'                     // Within benchmark is Yellow
    } else {
        // lower-better (CPC, CPM)
        if (value < range.min) return 'good' // Below benchmark is Green (Cheaper)
        if (value > range.max) return 'bad'  // Above benchmark is Red (Expensive)
        return 'neutral'                     // Within benchmark is Yellow
    }
}

export function DashboardClient() {
    const [reportData, setReportData] = useState<AdsReportData | null>(null)
    const [loading, setLoading] = useState(false)
    const [filterStatus, setFilterStatus] = useState<'all' | 'scale' | 'monitor' | 'pause'>('all')
    const [summaryStatus, setSummaryStatus] = useState<'all' | 'scale' | 'monitor' | 'pause' | null>(null)
    const [selectedAd, setSelectedAd] = useState<AdPerformance | null>(null)
    const [statusMessage, setStatusMessage] = useState<string>('')
    const [error, setError] = useState<string | null>(null)

    const handleFileSelect = useCallback(async (file: File) => {
        setLoading(true)
        setError(null)
        setStatusMessage('Uploading and analyzing data... This may take up to a minute.')

        try {
            const formData = new FormData()
            formData.append('file', file)

            // Direct synchronous call
            const data = await uploadAndGetReport(formData)

            setReportData(data)
            setLoading(false)

        } catch (err: any) {
            setError(err.message || 'Analysis failed. Please try again.')
            setLoading(false)
        }
    }, [])

    if (!reportData) {
        return (
            <div className="min-h-screen bg-slate-950 text-slate-50 p-6 md:p-8">
                <div className="max-w-7xl mx-auto space-y-8">
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-8"
                    >
                        <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">
                            Ads Performance Dashboard
                        </h1>
                        <p className="text-slate-400 text-lg">Import data to view report</p>
                    </motion.div>

                    {loading ? (
                        <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-slate-800 rounded-lg bg-slate-900/50">
                            <Loader2 className="w-10 h-10 text-orange-500 animate-spin mb-4" />
                            <p className="text-slate-300">{statusMessage}</p>
                        </div>
                    ) : (
                        <FileUpload onFileSelect={handleFileSelect} loading={loading} error={error} />
                    )}
                </div>
            </div>
        )
    }

    const { overview, campaigns, ads, insights } = reportData

    // Safety fallback for arrays
    const campaignOverview = campaigns?.overview_by_campaign || []
    const adsList = ads?.by_ctr_ranked || []
    const priorityActions = insights?.priority_actions || []

    // Derive Chart Data from valid campaign overview data
    // Sort by Spend for a generic top campaigns view, or by specific metrics for specific charts
    // Aggregate spend by group
    const groupSpendMap = [...campaignOverview].reduce((acc, campaign) => {
        const group = campaign.group_name || 'Other';
        acc[group] = (acc[group] || 0) + (campaign.spent || 0);
        return acc;
    }, {} as Record<string, number>);

    const topGroupsBySpend = Object.entries(groupSpendMap)
        .map(([group_name, spent]) => ({ group_name, spent }))
        .sort((a, b) => b.spent - a.spent);

    // Standardize all charts to follow Spend Order (highest spend first)
    // This ensures consistent colors and order across all 4 charts as requested

    // Group Maps (already created above for Spend) are reused here for lookup
    // 1. Spend Map (already done)
    // 2. Impressions Map
    const groupImpressionsMap = [...campaignOverview].reduce((acc, campaign) => {
        const group = campaign.group_name || 'Other';
        acc[group] = (acc[group] || 0) + (campaign.impressions || 0);
        return acc;
    }, {} as Record<string, number>);

    // 3. Clicks Map
    const groupClicksMap = [...campaignOverview].reduce((acc, campaign) => {
        const group = campaign.group_name || 'Other';
        acc[group] = (acc[group] || 0) + (campaign.clicks || 0);
        return acc;
    }, {} as Record<string, number>);

    // 4. CTR Calculation Helper
    const getCTRForGroup = (groupName: string) => {
        const clicks = groupClicksMap[groupName] || 0;
        const impressions = groupImpressionsMap[groupName] || 0;
        return impressions > 0 ? (clicks / impressions) * 100 : 0;
    };

    // Calculate Global Maxs for Bar Scaling (independent of sort order)
    const maxImpressions = Math.max(...Object.values(groupImpressionsMap));
    const maxClicks = Math.max(...Object.values(groupClicksMap));
    const maxCTR = Math.max(...Object.keys(groupSpendMap).map(g => getCTRForGroup(g)));

    const ctrData = [...campaignOverview]
        .sort((a, b) => (b.ctr_percent || 0) - (a.ctr_percent || 0))
        .slice(0, 5)
        .map(c => ({
            campaign_name: c.campaign_name.length > 20 ? c.campaign_name.substring(0, 20) + '...' : c.campaign_name,
            ctr_percent: (c.ctr_percent || 0) * 100 // Convert to percentage number for chart (e.g. 0.005 -> 0.5)
        }))

    const cpcData = [...campaignOverview]
        .filter(c => (c.cpc || 0) > 0)
        .sort((a, b) => (b.cpc || 0) - (a.cpc || 0))
        .slice(0, 5)
        .map(c => ({
            campaign_name: c.campaign_name.length > 20 ? c.campaign_name.substring(0, 20) + '...' : c.campaign_name,
            cpc: c.cpc || 0
        }))

    // Calculate metrics with status
    const overallMetrics = [
        {
            metric: 'Total Spend',
            value: `$${(overview.total_spent || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}`,
            benchmark: '-',
            status: 'neutral-no-benchmark' as const
        },
        {
            metric: 'Impressions',
            value: (overview.total_impressions || 0).toLocaleString(undefined, { notation: "compact" }),
            benchmark: '-',
            status: 'neutral-no-benchmark' as const
        },
        {
            metric: 'Clicks',
            value: (overview.total_clicks || 0).toLocaleString(),
            benchmark: '-',
            status: 'neutral-no-benchmark' as const
        },
        {
            metric: 'CTR',
            value: `${((overview.ctr_percent || 0) * 100).toFixed(2)}%`,
            benchmark: '0.35-0.55%',
            status: getMetricStatus((overview.ctr_percent || 0) * 100, '0.35-0.55%', 'higher-better')
        },
        {
            metric: 'CPC',
            value: `$${(overview.avg_cpc || 0).toFixed(2)}`,
            benchmark: '$1.20-$2.50',
            status: getMetricStatus(overview.avg_cpc || 0, '$1.20-$2.50', 'lower-better')
        },
        {
            metric: 'eCPM',
            value: `$${(overview.avg_cpm || 0).toFixed(2)}`,
            benchmark: '$6-$10',
            status: getMetricStatus(overview.avg_cpm || 0, '$6-$10', 'lower-better')
        }
    ]

    const budgetData = [
        { name: 'Spent', value: overview.total_spent || 0 },
        { name: 'Remaining', value: 0 }
    ]

    return (
        <div className="min-h-screen bg-slate-950 text-slate-50 p-6 md:p-8">
            <div className="max-w-7xl mx-auto space-y-8">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
                >
                    <div>
                        <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">
                            Ads Performance Dashboard
                        </h1>
                        <p className="text-slate-400 text-lg">
                            Generated on {reportData.meta.date_generated ? new Date(reportData.meta.date_generated).toLocaleDateString() : 'N/A'}
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setReportData(null)}
                            className="px-4 py-2 text-sm text-slate-400 hover:text-white border border-slate-700 rounded-md hover:bg-slate-800 transition-colors"
                        >
                            Upload New File
                        </button>
                    </div>
                </motion.div>

                <Tabs defaultValue="overview" className="space-y-4">
                    <TabsList className="bg-slate-900 border-slate-800">
                        <TabsTrigger value="overview">Overview</TabsTrigger>
                        <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
                        <TabsTrigger value="ads">Ads Performance</TabsTrigger>
                        <TabsTrigger value="actions">Priority Actions</TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview" className="space-y-4">
                        {/* KPI Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {overallMetrics.map((item, index) => (
                                <motion.div
                                    key={item.metric}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                >
                                    <Card className="bg-slate-900 border-slate-800 relative overflow-hidden">
                                        <CardHeader className="pb-2">
                                            <div className="flex justify-between items-start">
                                                <CardTitle className="text-sm font-medium text-slate-400">{item.metric}</CardTitle>
                                                {item.status !== 'neutral-no-benchmark' && (
                                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${item.status === 'good' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                                                        item.status === 'bad' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                                                            'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                                        }`}>
                                                        {item.status === 'good' ? 'Great' : item.status === 'bad' ? 'Poor' : 'Avg'}
                                                    </span>
                                                )}
                                            </div>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="text-2xl font-bold text-slate-50">{item.value}</div>
                                            <div className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                                                <span>Benchmark: {item.benchmark}</span>
                                            </div>
                                        </CardContent>
                                        {/* Decorative gradient based on status */}
                                        {item.status !== 'neutral-no-benchmark' && (
                                            <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${item.status === 'good' ? 'from-transparent via-emerald-500 to-transparent opacity-50' :
                                                item.status === 'bad' ? 'from-transparent via-red-500 to-transparent opacity-50' :
                                                    'from-transparent via-amber-500 to-transparent opacity-50'
                                                }`} />
                                        )}
                                    </Card>
                                </motion.div>
                            ))}
                        </div>

                        {/* Executive Summary Hidden */}

                    </TabsContent>

                    <TabsContent value="campaigns" className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Card className="bg-slate-900 border-slate-800">
                                <CardHeader>
                                    <CardTitle>Spend by Campaign Group</CardTitle>
                                    <CardDescription>Where your budget is going (Grouped)</CardDescription>
                                </CardHeader>
                                <CardContent className="h-[300px]">
                                    <div className="flex flex-col gap-4 h-full overflow-y-auto pr-2">
                                        {topGroupsBySpend.map((group, index) => {
                                            const maxSpent = Math.max(...topGroupsBySpend.map(g => g.spent || 0))
                                            const percentage = ((group.spent || 0) / maxSpent) * 100
                                            const color = Object.values(COLORS)[index % 5]

                                            return (
                                                <div key={group.group_name} className="relative group">
                                                    <div className="flex justify-between items-start mb-1 z-10 relative">
                                                        <span className="text-sm text-slate-200 font-medium line-clamp-2 mr-2" title={group.group_name}>
                                                            {group.group_name}
                                                        </span>
                                                        <span className="text-sm font-bold text-slate-50 whitespace-nowrap">
                                                            ${(group.spent || 0).toLocaleString()}
                                                        </span>
                                                    </div>

                                                    {/* Progress Bar Container */}
                                                    <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                                                        <div
                                                            className="h-full rounded-full transition-all duration-500 ease-out"
                                                            style={{
                                                                width: `${percentage}%`,
                                                                backgroundColor: color
                                                            }}
                                                        />
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="bg-slate-900 border-slate-800">
                                <CardHeader>
                                    <CardTitle>Impressions by Campaign Group</CardTitle>
                                    <CardDescription>Reach by Group (Grouped)</CardDescription>
                                </CardHeader>
                                <CardContent className="h-[300px]">
                                    <div className="flex flex-col gap-4 h-full overflow-y-auto pr-2">
                                        {topGroupsBySpend.map((spendGroup, index) => {
                                            // Look up real values for this group
                                            const groupName = spendGroup.group_name;
                                            const impressions = groupImpressionsMap[groupName] || 0;

                                            // Calculate bar percentage relative to MAX value of this metric (not sorted list)
                                            const percentage = maxImpressions > 0 ? (impressions / maxImpressions) * 100 : 0;
                                            const color = Object.values(COLORS)[index % 5]; // Maintain consistent color by index

                                            return (
                                                <div key={groupName} className="relative group">
                                                    <div className="flex justify-between items-start mb-1 z-10 relative">
                                                        <span className="text-sm text-slate-200 font-medium line-clamp-2 mr-2" title={groupName}>
                                                            {groupName}
                                                        </span>
                                                        <span className="text-sm font-bold text-slate-50 whitespace-nowrap">
                                                            {impressions.toLocaleString()}
                                                        </span>
                                                    </div>

                                                    {/* Progress Bar Container */}
                                                    <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                                                        <div
                                                            className="h-full rounded-full transition-all duration-500 ease-out"
                                                            style={{
                                                                width: `${percentage}%`,
                                                                backgroundColor: color
                                                            }}
                                                        />
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Card className="bg-slate-900 border-slate-800">
                                <CardHeader>
                                    <CardTitle>Clicks by Campaign Group</CardTitle>
                                    <CardDescription>Engagement by Group (Grouped)</CardDescription>
                                </CardHeader>
                                <CardContent className="h-[300px]">
                                    <div className="flex flex-col gap-4 h-full overflow-y-auto pr-2">
                                        {topGroupsBySpend.map((spendGroup, index) => {
                                            const groupName = spendGroup.group_name;
                                            const clicks = groupClicksMap[groupName] || 0;

                                            const percentage = maxClicks > 0 ? (clicks / maxClicks) * 100 : 0;
                                            const color = Object.values(COLORS)[index % 5];

                                            return (
                                                <div key={groupName} className="relative group">
                                                    <div className="flex justify-between items-start mb-1 z-10 relative">
                                                        <span className="text-sm text-slate-200 font-medium line-clamp-2 mr-2" title={groupName}>
                                                            {groupName}
                                                        </span>
                                                        <span className="text-sm font-bold text-slate-50 whitespace-nowrap">
                                                            {clicks.toLocaleString()}
                                                        </span>
                                                    </div>

                                                    {/* Progress Bar Container */}
                                                    <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                                                        <div
                                                            className="h-full rounded-full transition-all duration-500 ease-out"
                                                            style={{
                                                                width: `${percentage}%`,
                                                                backgroundColor: color
                                                            }}
                                                        />
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="bg-slate-900 border-slate-800">
                                <CardHeader>
                                    <CardTitle>CTR by Campaign Group</CardTitle>
                                    <CardDescription>Click-Through Rate by Group (Grouped)</CardDescription>
                                </CardHeader>
                                <CardContent className="h-[300px]">
                                    <div className="flex flex-col gap-4 h-full overflow-y-auto pr-2">
                                        {topGroupsBySpend.map((spendGroup, index) => {
                                            const groupName = spendGroup.group_name;
                                            const ctr = getCTRForGroup(groupName);

                                            const percentage = maxCTR > 0 ? (ctr / maxCTR) * 100 : 0;
                                            const color = Object.values(COLORS)[index % 5];

                                            return (
                                                <div key={groupName} className="relative group">
                                                    <div className="flex justify-between items-start mb-1 z-10 relative">
                                                        <span className="text-sm text-slate-200 font-medium line-clamp-2 mr-2" title={groupName}>
                                                            {groupName}
                                                        </span>
                                                        <span className="text-sm font-bold text-slate-50 whitespace-nowrap">
                                                            {ctr.toFixed(2)}%
                                                        </span>
                                                    </div>

                                                    {/* Progress Bar Container */}
                                                    <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                                                        <div
                                                            className="h-full rounded-full transition-all duration-500 ease-out"
                                                            style={{
                                                                width: `${percentage}%`,
                                                                backgroundColor: color
                                                            }}
                                                        />
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    <TabsContent value="ads" className="space-y-4">
                        <Card className="bg-slate-900 border-slate-800">
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle>Ad Creative Performance</CardTitle>
                                        <CardDescription>Ranked by Click-Through Rate (CTR)</CardDescription>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <button
                                            onClick={() => setSummaryStatus(filterStatus)}
                                            className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-md transition-all shadow-sm border border-indigo-500/50"
                                            title={`Summarize ${filterStatus} ads`}
                                        >
                                            <LayoutDashboard className="w-3.5 h-3.5" />
                                            <span>Summarize</span>
                                        </button>
                                        <div className="h-4 w-px bg-slate-800" />
                                        <div className="flex gap-2 bg-slate-950 p-1 rounded-lg border border-slate-800">
                                            {(['all', 'scale', 'monitor', 'pause'] as const).map((status) => (
                                                <button
                                                    key={status}
                                                    onClick={() => setFilterStatus(status)}
                                                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${filterStatus === status
                                                        ? 'bg-primary text-primary-foreground shadow-sm'
                                                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                                                        }`}
                                                >
                                                    {status.charAt(0).toUpperCase() + status.slice(1)}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="h-[400px] overflow-y-auto pr-2 space-y-3 custom-scrollbar">
                                    {ads?.by_ctr_ranked
                                        ?.filter(ad => filterStatus === 'all' || ad.status_bucket === filterStatus)
                                        .map((ad, idx) => (
                                            <div
                                                key={idx}
                                                onClick={() => setSelectedAd(ad)}
                                                className="flex items-center justify-between p-4 bg-slate-950/50 rounded-lg border border-slate-800 hover:border-slate-700 transition-colors cursor-pointer group"
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className={`w-2 h-2 rounded-full ${ad.status_bucket === 'scale' ? 'bg-emerald-500' :
                                                        ad.status_bucket === 'pause' ? 'bg-red-500' :
                                                            'bg-amber-500'
                                                        }`} />
                                                    <div>
                                                        <p className="font-medium text-slate-200">{ad.creative_name.substring(0, 50)}</p>
                                                        <p className="text-xs text-slate-500 mt-1">{ad.campaign_name.substring(0, 60)}...</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-8 text-right">
                                                    <div>
                                                        <p className="text-xs text-slate-500">CTR</p>
                                                        <p className={`font-mono font-medium ${(ad.ctr_percent || 0) * 100 > 1 ? 'text-emerald-400' : 'text-slate-300'
                                                            }`}>
                                                            {((ad.ctr_percent || 0) * 100).toFixed(2)}%
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-slate-500">Spend</p>
                                                        <p className="font-mono text-slate-300">
                                                            ${(ad.spent || 0).toLocaleString()}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-slate-500">Action</p>
                                                        <span className={`text-xs px-2 py-1 rounded-full uppercase font-bold tracking-wider ${ad.status_bucket === 'scale' ? 'bg-emerald-500/20 text-emerald-400' :
                                                            ad.status_bucket === 'pause' ? 'bg-red-500/20 text-red-400' :
                                                                'bg-amber-500/20 text-amber-400'
                                                            }`}>
                                                            {ad.status_bucket}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    {ads?.by_ctr_ranked?.filter(ad => filterStatus === 'all' || ad.status_bucket === filterStatus).length === 0 && (
                                        <div className="text-center py-10 text-slate-500">
                                            No ads found with status "{filterStatus}"
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="actions" className="space-y-4">
                        <div className="grid gap-4">
                            {priorityActions.map((action, idx) => (
                                <Card key={idx} className="bg-slate-900 border-slate-800 hover:border-slate-700 transition-colors">
                                    <div className={`h-1 w-full rounded-t-lg ${action.severity === 'high' ? 'bg-red-500' :
                                        action.severity === 'medium' ? 'bg-orange-500' :
                                            'bg-blue-500'
                                        }`} />
                                    <CardHeader>
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <CardTitle className="text-lg flex items-center gap-2">
                                                    {action.title}
                                                </CardTitle>
                                                <CardDescription className="mt-1">{action.why}</CardDescription>
                                            </div>
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium border ${action.severity === 'high' ? 'bg-red-500/10 border-red-500/20 text-red-400' :
                                                action.severity === 'medium' ? 'bg-orange-500/10 border-orange-500/20 text-orange-400' :
                                                    'bg-blue-500/10 border-blue-500/20 text-blue-400'
                                                }`}>
                                                {action.severity.toUpperCase()}
                                            </span>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="bg-slate-950/50 p-4 rounded-md border border-slate-800">
                                            <p className="text-sm text-slate-400 font-mono">
                                                {action.supporting_stats || 'No stats available'}
                                            </p>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </TabsContent>
                </Tabs>
            </div>

            {/* Detail Modal */}
            <Dialog open={!!selectedAd} onOpenChange={(open) => !open && setSelectedAd(null)}>
                <DialogContent className="w-full max-w-4xl sm:max-w-4xl bg-slate-950 border-slate-800">
                    <DialogHeader>
                        <DialogTitle className="text-xl leading-normal">{selectedAd?.creative_name}</DialogTitle>
                        <DialogDescription className="pt-2">
                            Full performance metrics for this creative.
                        </DialogDescription>
                    </DialogHeader>

                    {selectedAd && (
                        <div className="space-y-6 mt-4">
                            <div className="p-4 rounded-lg bg-slate-900/50 border border-slate-800">
                                <p className="text-xs text-slate-500 mb-1">Campaign</p>
                                <p className="text-sm font-medium text-slate-200">{selectedAd.campaign_name}</p>
                            </div>

                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                <div className="p-4 rounded-lg bg-slate-900/50 border border-slate-800">
                                    <p className="text-xs text-slate-500">Impressions</p>
                                    <p className="text-lg font-mono font-bold text-slate-200 truncate" title={((selectedAd.impressions || 0).toLocaleString())}>
                                        {(selectedAd.impressions || 0).toLocaleString()}
                                    </p>
                                </div>
                                <div className="p-4 rounded-lg bg-slate-900/50 border border-slate-800">
                                    <p className="text-xs text-slate-500">Clicks</p>
                                    <p className="text-lg font-mono font-bold text-slate-200 truncate" title={((selectedAd.clicks || 0).toLocaleString())}>
                                        {(selectedAd.clicks || 0).toLocaleString()}
                                    </p>
                                </div>
                                <div className="p-4 rounded-lg bg-slate-900/50 border border-slate-800">
                                    <p className="text-xs text-slate-500">Spend</p>
                                    <p className="text-lg font-mono font-bold text-slate-200 truncate" title={`$${(selectedAd.spent || 0).toLocaleString()}`}>
                                        ${(selectedAd.spent || 0).toLocaleString()}
                                    </p>
                                </div>
                                <div className="p-4 rounded-lg bg-slate-900/50 border border-slate-800">
                                    <p className="text-xs text-slate-500">CTR</p>
                                    <p className={`text-lg font-mono font-bold truncate ${(selectedAd.ctr_percent || 0) * 100 > 1 ? 'text-emerald-400' : 'text-slate-200'
                                        }`}>
                                        {((selectedAd.ctr_percent || 0) * 100).toFixed(2)}%
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 rounded-lg bg-slate-900/50 border border-slate-800">
                                    <p className="text-xs text-slate-500">CPC (Cost Per Click)</p>
                                    <p className="text-lg font-mono font-bold text-slate-200">
                                        ${((selectedAd.spent || 0) / (selectedAd.clicks || 1)).toFixed(2)}
                                    </p>
                                </div>
                                <div className="p-4 rounded-lg bg-slate-900/50 border border-slate-800">
                                    <p className="text-xs text-slate-500">CPM (Cost Per Mille)</p>
                                    <p className="text-lg font-mono font-bold text-slate-200">
                                        ${((selectedAd.spent || 0) / ((selectedAd.impressions || 1) / 1000)).toFixed(2)}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                                <span className="text-sm text-slate-500">Status Recommendation</span>
                                <span className={`px-4 py-1.5 rounded-full text-sm font-bold uppercase tracking-wider ${selectedAd.status_bucket === 'scale' ? 'bg-emerald-500/20 text-emerald-400' :
                                    selectedAd.status_bucket === 'pause' ? 'bg-red-500/20 text-red-400' :
                                        'bg-amber-500/20 text-amber-400'
                                    }`}>
                                    {selectedAd.status_bucket}
                                </span>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Summary Modal */}
            <Dialog open={!!summaryStatus} onOpenChange={(open) => !open && setSummaryStatus(null)}>
                <DialogContent className="w-full max-w-7xl sm:max-w-7xl bg-slate-950 border-slate-800 max-h-[85vh] overflow-y-auto custom-scrollbar">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <span>Performance Summary:</span>
                            <span className={`uppercase font-bold ${summaryStatus === 'scale' ? 'text-emerald-400' :
                                summaryStatus === 'pause' ? 'text-red-400' :
                                    summaryStatus === 'monitor' ? 'text-amber-400' :
                                        'text-slate-200'
                                }`}>
                                {summaryStatus === 'all' ? 'All Ads' : summaryStatus}
                            </span>
                        </DialogTitle>
                        <DialogDescription>
                            Aggregated performance metrics for all {summaryStatus === 'all' ? '' : summaryStatus} creatives.
                        </DialogDescription>
                    </DialogHeader>

                    {summaryStatus && ads?.by_ctr_ranked && (
                        (() => {
                            const filteredAds = ads.by_ctr_ranked.filter(ad =>
                                summaryStatus === 'all' || ad.status_bucket === summaryStatus
                            )

                            const totalSpent = filteredAds.reduce((acc, ad) => acc + (ad.spent || 0), 0)
                            const totalImpressions = filteredAds.reduce((acc, ad) => acc + (ad.impressions || 0), 0)
                            const totalClicks = filteredAds.reduce((acc, ad) => acc + (ad.clicks || 0), 0)
                            // Weighted Average CTR = Total Clicks / Total Impressions
                            const avgCTR = totalImpressions > 0 ? totalClicks / totalImpressions : 0
                            const avgCPC = totalClicks > 0 ? totalSpent / totalClicks : 0
                            const avgCPM = totalImpressions > 0 ? (totalSpent / totalImpressions) * 1000 : 0

                            return (
                                <div className="space-y-6 mt-4">
                                    {/* Summary Cards */}
                                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                                        <div className="p-3 rounded-lg bg-slate-900/50 border border-slate-800">
                                            <p className="text-[10px] text-slate-500 uppercase tracking-widest">Ads Count</p>
                                            <p className="text-xl font-mono font-bold text-slate-200">{filteredAds.length}</p>
                                        </div>
                                        <div className="p-3 rounded-lg bg-slate-900/50 border border-slate-800">
                                            <p className="text-[10px] text-slate-500 uppercase tracking-widest">Spend</p>
                                            <p className="text-xl font-mono font-bold text-slate-200 truncate" title={`$${totalSpent.toLocaleString()}`}>
                                                ${totalSpent.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                            </p>
                                        </div>
                                        <div className="p-3 rounded-lg bg-slate-900/50 border border-slate-800">
                                            <p className="text-[10px] text-slate-500 uppercase tracking-widest">Impr.</p>
                                            <p className="text-xl font-mono font-bold text-slate-200 truncate" title={totalImpressions.toLocaleString()}>
                                                {totalImpressions.toLocaleString(undefined, { notation: "compact" })}
                                            </p>
                                        </div>
                                        <div className="p-3 rounded-lg bg-slate-900/50 border border-slate-800">
                                            <p className="text-[10px] text-slate-500 uppercase tracking-widest">Clicks</p>
                                            <p className="text-xl font-mono font-bold text-slate-200">
                                                {totalClicks.toLocaleString()}
                                            </p>
                                        </div>
                                        <div className="p-3 rounded-lg bg-slate-900/50 border border-slate-800">
                                            <p className="text-[10px] text-slate-500 uppercase tracking-widest">Avg CPC</p>
                                            <p className="text-xl font-mono font-bold text-slate-200">
                                                ${avgCPC.toFixed(2)}
                                            </p>
                                        </div>
                                        <div className="p-3 rounded-lg bg-slate-900/50 border border-slate-800">
                                            <p className="text-[10px] text-slate-500 uppercase tracking-widest">Avg CTR</p>
                                            <p className={`text-xl font-mono font-bold ${avgCTR * 100 > 1 ? 'text-emerald-400' : 'text-slate-200'}`}>
                                                {(avgCTR * 100).toFixed(2)}%
                                            </p>
                                        </div>
                                    </div>

                                    {/* Ads List Table */}
                                    <div className="rounded-md border border-slate-800 overflow-hidden">
                                        <div className="bg-slate-900/50 px-4 py-3 border-b border-slate-800">
                                            <h4 className="text-sm font-medium text-slate-300">Detailed Breakdown</h4>
                                        </div>
                                        <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
                                            <table className="w-full text-sm text-left">
                                                <thead className="text-xs text-slate-500 uppercase bg-slate-950 sticky top-0">
                                                    <tr>
                                                        <th className="px-4 py-3">Creative Name</th>
                                                        <th className="px-4 py-3 text-right">Spend</th>
                                                        <th className="px-4 py-3 text-right">CTR</th>
                                                        <th className="px-4 py-3 text-right">CPC</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {filteredAds.map((ad, idx) => (
                                                        <tr key={idx} className="border-b border-slate-800/50 hover:bg-slate-900/30 transition-colors">
                                                            <td className="px-4 py-3 font-medium text-slate-300 max-w-[200px] truncate" title={ad.creative_name}>
                                                                {ad.creative_name}
                                                            </td>
                                                            <td className="px-4 py-3 text-right font-mono text-slate-400">
                                                                ${(ad.spent || 0).toLocaleString()}
                                                            </td>
                                                            <td className={`px-4 py-3 text-right font-mono font-bold ${(ad.ctr_percent || 0) * 100 > 1 ? 'text-emerald-500' : 'text-slate-400'}`}>
                                                                {((ad.ctr_percent || 0) * 100).toFixed(2)}%
                                                            </td>
                                                            <td className="px-4 py-3 text-right font-mono text-slate-400">
                                                                ${((ad.spent || 0) / (ad.clicks || 1)).toFixed(2)}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            )
                        })()
                    )}
                </DialogContent>
            </Dialog>
        </div>
    )
}
