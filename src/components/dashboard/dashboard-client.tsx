'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { FileUpload } from '@/components/dashboard/file-upload'
import { uploadAndGetReport, saveReport } from '@/actions/report-actions'
import { SaveReportModal } from '@/components/save-report-modal'
import { AdsReportData, PriorityAction, AdPerformance } from "@/lib/report-types"
import { toast } from 'sonner'
import { Monitor, Pause, TrendingUp, AlertTriangle, Loader2, LayoutDashboard, Settings, Sparkles, Save, UploadCloud } from "lucide-react"
import { TimeEvolutionChart } from './time-evolution-chart'
import { AiInsightsView } from './ai-insights-view'
import { AdsInsightItem } from '@/lib/insights-types'
import { ReportsList } from '@/components/dashboard/reports-list'

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
// Kept for backward compatibility if needed, but primary logic will shift to numeric
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
    min: number,
    max: number,
    type: 'higher-better' | 'lower-better'
): 'good' | 'neutral' | 'bad' | 'neutral-no-benchmark' {
    if (min === 0 && max === 0) return 'neutral-no-benchmark'

    if (type === 'higher-better') {
        if (value > max) return 'good' // Above benchmark is Green
        if (value < min) return 'bad'  // Below benchmark is Red
        return 'neutral'               // Within benchmark is Yellow
    } else {
        // lower-better (CPC, CPM)
        if (value < min) return 'good' // Below benchmark is Green (Cheaper)
        if (value > max) return 'bad'  // Above benchmark is Red (Expensive)
        return 'neutral'               // Within benchmark is Yellow
    }
}



export function DashboardClient({ initialData }: { initialData?: AdsReportData | null }) {
    const [view, setView] = useState<'current' | 'history'>('current')
    const [reportData, setReportData] = useState<AdsReportData | null>(initialData || null)
    const [loading, setLoading] = useState(false)
    const [filterStatus, setFilterStatus] = useState<'all' | 'scale' | 'monitor' | 'pause'>('all')
    const [summaryStatus, setSummaryStatus] = useState<'all' | 'scale' | 'monitor' | 'pause' | null>(null)
    const [selectedAd, setSelectedAd] = useState<AdPerformance | null>(null)
    const [statusMessage, setStatusMessage] = useState<string>('')

    const [error, setError] = useState<string | null>(null)
    const [saveModalOpen, setSaveModalOpen] = useState(false)
    const [configModalOpen, setConfigModalOpen] = useState(false)
    const [isGeneratingInsights, setIsGeneratingInsights] = useState(false)
    const [insightResult, setInsightResult] = useState<AdsInsightItem | null>(null)

    // Default Configuration
    const [efficiencyConfig, setEfficiencyConfig] = useState({
        ctr: { min: 0.35, max: 0.55 },     // Percentage values (0.35 means 0.35%)
        cpc: { min: 1.20, max: 2.50 },     // Dollar values
        cpm: { min: 6.00, max: 10.00 },    // Dollar values
        spend: { min: 0, max: 0 },         // Dollar values
        impressions: { min: 0, max: 0 },   // Count values
        clicks: { min: 0, max: 0 }         // Count values
    })

    // Temporary state for the modal inputs
    const [tempConfig, setTempConfig] = useState(efficiencyConfig)

    const handleOpenConfig = () => {
        setTempConfig(efficiencyConfig)
        setConfigModalOpen(true)
    }

    const handleSaveConfig = () => {
        setEfficiencyConfig(tempConfig)
        setConfigModalOpen(false)
        toast.success('Benchmarks updated successfully!')
    }

    const handleSaveReport = async (name: string) => {
        if (!reportData) return

        const result = await saveReport(reportData, name)

        if (result.error) {
            toast.error('Error saving: ' + result.error)
        } else {
            toast.success('Report saved successfully!')
            setSaveModalOpen(false)
        }
    }

    const handleGenerateInsights = async () => {
        if (!reportData) return
        setIsGeneratingInsights(true)
        toast.info('Generating AI Insights...', { description: 'Sending data to analysis engine.' })

        // Helper to optimize payload size
        const optimizeReportForAI = (data: AdsReportData) => {
            const cleanAds = (data.ads?.by_ctr_ranked || [])
                .filter(ad => ad.status_bucket !== 'pause') // Filter out likely irrelevant paused ads for insights
                .slice(0, 20) // Only top 20 relevant ads
                .map(ad => ({
                    name: ad.creative_name.substring(0, 50),
                    campaign: ad.campaign_name.substring(0, 50),
                    ctr: `${((ad.ctr_percent || 0) * 100).toFixed(2)}%`,
                    spend: Math.round(ad.spent || 0),
                    status: ad.status_bucket
                }));

            const cleanCampaigns = (data.campaigns?.overview_by_campaign || [])
                .slice(0, 15) // Top 15 campaigns
                .map(c => ({
                    name: c.campaign_name.substring(0, 50),
                    group: c.group_name,
                    spend: Math.round(c.spent || 0),
                    impressions: c.impressions,
                    clicks: c.clicks,
                    ctr: `${((c.ctr_percent || 0) * 100).toFixed(2)}%`,
                    cpc: (c.cpc || 0).toFixed(2)
                }));

            // Monthly trends usually small enough, but good to round numbers
            const cleanTrends = (data.monthly_trends || []).map((t, index) => ({
                month: t.month || `Month ${index + 1}`, // Fallback if name missing
                spend: Math.round(t.overview?.spent || 0), // Ensure number
                impressions: t.overview?.impressions || 0,
                clicks: t.overview?.clicks || 0,
                groups: t.groups_breakdown // Keep breakdown as it's key for logic
            }));

            return {
                period: { start: data.meta.start_date, end: data.meta.end_date },
                overview: {
                    total_spend: Math.round(data.overview.total_spent || 0),
                    total_impressions: data.overview.total_impressions,
                    total_clicks: data.overview.total_clicks,
                    ctr: `${((data.overview.ctr_percent || 0) * 100).toFixed(2)}%`,
                    cpc: (data.overview.avg_cpc || 0).toFixed(2),
                    cpm: (data.overview.avg_cpm || 0).toFixed(2)
                },
                top_campaigns: cleanCampaigns,
                top_ads: cleanAds,
                monthly_trends: cleanTrends
            };
        }

        try {
            const optimizedData = optimizeReportForAI(reportData);

            const response = await fetch('https://hook.startg4.com/webhook/4b04af52-2fa1-45a6-ace7-717bfdc00359', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(optimizedData)
            })

            if (response.ok) {
                const data = await response.json()

                // Parsing logic for complex n8n response structure
                let finalInsights = null

                try {
                    // Scenario 1: Direct JSON object (Ideal)
                    if (data.insights) {
                        finalInsights = data.insights[0]
                    }
                    // Scenario 2: New simplified n8n format { output: "stringified_json" }
                    else if (data.output && typeof data.output === 'string') {
                        const parsed = JSON.parse(data.output)
                        finalInsights = parsed.insights ? parsed.insights[0] : parsed
                    }
                    // Scenario 2b: Simplified n8n format { output: { insights: ... } } (Already parsed object)
                    else if (data.output && typeof data.output === 'object' && data.output.insights) {
                        finalInsights = data.output.insights[0]
                    }
                    // Scenario 3: Nested n8n output structure (e.g. [ { output: [ { content: ... } ] } ])
                    else if (Array.isArray(data) && data[0]?.output && Array.isArray(data[0].output)) {
                        // Find the message part
                        const messagePart = data[0].output.find((o: any) => o.type === 'message' || (o.content && o.content[0]?.text))
                        if (messagePart && messagePart.content && messagePart.content[0]?.text) {
                            const rawText = messagePart.content[0].text
                            const parsed = JSON.parse(rawText)
                            finalInsights = parsed.insights ? parsed.insights[0] : parsed
                        }
                    }
                    // Scenario 3: Fallback array
                    else if (Array.isArray(data) && data.length > 0) {
                        // Check if the first item is the insight object itself
                        if (data[0].analysis) {
                            finalInsights = data[0]
                        }
                    }

                    if (finalInsights) {
                        setInsightResult(finalInsights)
                        toast.success('Insights received!', { description: 'Analysis complete.' })
                    } else {
                        console.warn('Could not parse insights from:', data)
                        toast.warning('Structure mismatch.', { description: 'Received data but could not parse insights.' })
                    }

                } catch (err) {
                    console.error('Error extracting insights:', err)
                    toast.error('Parse Error', { description: 'Could not decode the AI response.' })
                }

            } else {
                toast.error('Failed to start analysis.', { description: `Status: ${response.status}` })
            }
        } catch (error) {
            console.error('Error sending insights request:', error)
            toast.error('Network error.', { description: 'Could not reach the insights server.' })
        } finally {
            setIsGeneratingInsights(false)
        }
    }

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

    const handleReportSelect = (data: AdsReportData) => {
        setReportData(data)
        setView('current')
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    if (!reportData && view === 'current') {
        return (
            <div className="h-full bg-black text-white p-6 md:p-8 flex flex-col">
                <div className="flex justify-center mb-8">
                    <div className="flex bg-white/5 p-1 rounded-lg border border-white/10">
                        <button
                            onClick={() => setView('current')}
                            className="px-6 py-2 rounded-md text-sm font-medium transition-all bg-[#1C73E8] hover:bg-[#1557b0] text-white shadow-lg"
                        >
                            New Analysis
                        </button>
                        <button
                            onClick={() => setView('history')}
                            className="px-6 py-2 rounded-md text-sm font-medium transition-all text-gray-400 hover:text-white"
                        >
                            My Reports
                        </button>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto space-y-8 w-full flex-1 flex flex-col justify-center">


                    {loading ? (
                        <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-white/10 rounded-lg bg-white/5">
                            <Loader2 className="w-10 h-10 text-[#1C73E8] animate-spin mb-4" />
                            <p className="text-gray-300">{statusMessage}</p>
                        </div>
                    ) : (
                        <div className="h-[60vh] flex items-center justify-center">
                            <FileUpload onFileSelect={handleFileSelect} loading={loading} error={error} />
                        </div>
                    )}
                </div>
            </div>
        )
    }

    // Handle History View
    if (view === 'history') {
        return (
            <div className="min-h-screen bg-black text-white p-6 md:p-8">
                <div className="flex justify-center mb-8">
                    <div className="flex bg-white/5 p-1 rounded-lg border border-white/10">
                        <button
                            onClick={() => setView('current')}
                            className="px-6 py-2 rounded-md text-sm font-medium transition-all text-gray-400 hover:text-white"
                        >
                            {reportData ? 'Current Analysis' : 'New Analysis'}
                        </button>
                        <button
                            onClick={() => setView('history')}
                            className="px-6 py-2 rounded-md text-sm font-medium transition-all bg-[#1C73E8] hover:bg-[#1557b0] text-white shadow-lg"
                        >
                            My Reports
                        </button>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto">
                    <ReportsList onSelectReport={handleReportSelect} />
                </div>
            </div>
        )
    }

    const { overview, campaigns, ads, insights } = reportData!

    // ... rest of dashboard logic


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
            benchmark: efficiencyConfig.spend.min === 0 ? '-' : `$${efficiencyConfig.spend.min}-$${efficiencyConfig.spend.max}`,
            status: getMetricStatus(overview.total_spent || 0, efficiencyConfig.spend.min, efficiencyConfig.spend.max, 'higher-better')
        },
        {
            metric: 'Impressions',
            value: (overview.total_impressions || 0).toLocaleString(undefined, { notation: "compact" }),
            benchmark: efficiencyConfig.impressions.min === 0 ? '-' : `${efficiencyConfig.impressions.min}-${efficiencyConfig.impressions.max}`,
            status: getMetricStatus(overview.total_impressions || 0, efficiencyConfig.impressions.min, efficiencyConfig.impressions.max, 'higher-better')
        },
        {
            metric: 'Clicks',
            value: (overview.total_clicks || 0).toLocaleString(),
            benchmark: efficiencyConfig.clicks.min === 0 ? '-' : `${efficiencyConfig.clicks.min}-${efficiencyConfig.clicks.max}`,
            status: getMetricStatus(overview.total_clicks || 0, efficiencyConfig.clicks.min, efficiencyConfig.clicks.max, 'higher-better')
        },
        {
            metric: 'CTR',
            value: `${((overview.ctr_percent || 0) * 100).toFixed(2)}%`,
            benchmark: `${efficiencyConfig.ctr.min}-${efficiencyConfig.ctr.max}%`,
            status: getMetricStatus((overview.ctr_percent || 0) * 100, efficiencyConfig.ctr.min, efficiencyConfig.ctr.max, 'higher-better')
        },
        {
            metric: 'CPC',
            value: `$${(overview.avg_cpc || 0).toFixed(2)}`,
            benchmark: `$${efficiencyConfig.cpc.min}-$${efficiencyConfig.cpc.max}`,
            status: getMetricStatus(overview.avg_cpc || 0, efficiencyConfig.cpc.min, efficiencyConfig.cpc.max, 'lower-better')
        },
        {
            metric: 'eCPM',
            value: `$${(overview.avg_cpm || 0).toFixed(2)}`,
            benchmark: `$${efficiencyConfig.cpm.min}-$${efficiencyConfig.cpm.max}`,
            status: getMetricStatus(overview.avg_cpm || 0, efficiencyConfig.cpm.min, efficiencyConfig.cpm.max, 'lower-better')
        }
    ]

    const budgetData = [
        { name: 'Spent', value: overview.total_spent || 0 },
        { name: 'Remaining', value: 0 }
    ]

    return (
        <div className="w-full text-white pb-8">
            <div className="flex justify-center mb-8">
                <div className="flex bg-white/5 p-1 rounded-lg border border-white/10">
                    <button
                        onClick={() => setView('current')}
                        className="px-6 py-2 rounded-md text-sm font-medium transition-all bg-[#1C73E8] hover:bg-[#1557b0] text-white shadow-lg"
                    >
                        Current Analysis
                    </button>
                    <button
                        onClick={() => setView('history')}
                        className="px-6 py-2 rounded-md text-sm font-medium transition-all text-gray-400 hover:text-white"
                    >
                        My Reports
                    </button>
                </div>
            </div>
            <div className="w-full space-y-8">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
                >
                    <div className="flex items-center gap-4">
                        <div className="flex flex-col">
                            {reportData?.meta?.start_date && reportData?.meta?.end_date ? (
                                <p className="text-slate-300 text-lg font-medium">
                                    Report Period: <span className="text-white">{new Date(reportData.meta.start_date).toLocaleDateString(undefined, { timeZone: 'UTC' })} - {new Date(reportData.meta.end_date).toLocaleDateString(undefined, { timeZone: 'UTC' })}</span>
                                </p>
                            ) : null}
                            <p className="text-gray-500 text-sm">
                                Generated on {reportData?.meta?.date_generated ? new Date(reportData.meta.date_generated).toLocaleDateString() : 'N/A'}
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={handleOpenConfig}
                            className="p-2 text-slate-400 hover:text-white border border-slate-700 rounded-md hover:bg-slate-800 transition-colors"
                            title="Configure Efficiency Benchmarks"
                        >
                            <Settings size={20} />
                        </button>
                        <button
                            onClick={() => setSaveModalOpen(true)}
                            className="p-2 text-white bg-[#1C73E8] hover:bg-[#1557b0] border border-[#1C73E8] rounded-md transition-colors shadow-sm"
                            title="Save Analysis"
                        >
                            <Save size={20} />
                        </button>
                        <button
                            onClick={() => setReportData(null)}
                            className="p-2 text-slate-400 hover:text-white border border-slate-700 rounded-md hover:bg-slate-800 transition-colors"
                            title="Upload New File"
                        >
                            <UploadCloud size={20} />
                        </button>
                    </div>
                </motion.div>

                <Tabs defaultValue="overview" className="space-y-4">
                    <TabsList className="bg-white/5 border border-white/10">
                        <TabsTrigger value="overview">Overview</TabsTrigger>
                        <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
                        <TabsTrigger value="evolution">Evolution</TabsTrigger>
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
                                    <Card className="bg-white/5 border border-white/10 relative overflow-hidden">
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
                                            <div className="text-2xl font-bold text-white">{item.value}</div>
                                            <div className="text-xs text-gray-500 mt-1 flex items-center gap-1">
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
                            <Card className="bg-white/5 border border-white/10">
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
                                                        <span className="text-sm font-bold text-white whitespace-nowrap">
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

                            <Card className="bg-white/5 border border-white/10">
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
                                                        <span className="text-sm font-bold text-white whitespace-nowrap">
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
                            <Card className="bg-white/5 border border-white/10">
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
                                                        <span className="text-sm font-bold text-white whitespace-nowrap">
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

                            <Card className="bg-white/5 border border-white/10">
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
                                                        <span className="text-sm font-bold text-white whitespace-nowrap">
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
                        <Card className="bg-white/5 border border-white/10">
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
                                                className="flex items-center justify-between p-4 bg-black/50 border border-white/10 hover:border-slate-700 transition-colors cursor-pointer group"
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className={`w-2 h-2 rounded-full ${ad.status_bucket === 'scale' ? 'bg-emerald-500' :
                                                        ad.status_bucket === 'pause' ? 'bg-red-500' :
                                                            'bg-amber-500'
                                                        }`} />
                                                    <div>
                                                        <p className="font-medium text-slate-200">{ad.creative_name.substring(0, 50)}</p>
                                                        <p className="text-xs text-gray-500 mt-1">{ad.campaign_name.substring(0, 60)}...</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-8 text-right">
                                                    <div>
                                                        <p className="text-xs text-gray-500">CTR</p>
                                                        <p className={`font-mono font-medium ${(ad.ctr_percent || 0) * 100 > 1 ? 'text-emerald-400' : 'text-slate-300'
                                                            }`}>
                                                            {((ad.ctr_percent || 0) * 100).toFixed(2)}%
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-gray-500">Spend</p>
                                                        <p className="font-mono text-slate-300">
                                                            ${(ad.spent || 0).toLocaleString()}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-gray-500">Action</p>
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
                                        <div className="text-center py-10 text-gray-500">
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
                                <Card key={idx} className="bg-white/5 border border-white/10 hover:border-slate-700 transition-colors">
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



                    <TabsContent value="evolution" className="space-y-4">
                        {reportData?.monthly_trends && reportData.monthly_trends.length > 0 ? (
                            <>
                                <TimeEvolutionChart data={reportData.monthly_trends} />
                                <div className="flex justify-end mt-4">
                                    <button
                                        onClick={handleGenerateInsights}
                                        disabled={isGeneratingInsights}
                                        className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-md transition-colors shadow-sm border border-indigo-500/50"
                                    >
                                        {isGeneratingInsights ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : (
                                            <Sparkles className="w-4 h-4" />
                                        )}
                                        {isGeneratingInsights ? 'Generating...' : 'AI Insights'}
                                    </button>
                                </div>
                            </>
                        ) : (
                            <Card className="bg-white/5 border border-white/10">
                                <CardContent className="flex flex-col items-center justify-center h-64 text-slate-400">
                                    <p>No monthly trend data available.</p>
                                    <p className="text-sm">Please ensure your data upload covers multiple months.</p>
                                </CardContent>
                            </Card>
                        )}

                        {/* AI Insights Result Section */}
                        {insightResult && (
                            <div className="mt-8 pt-8 border-t border-slate-800">
                                <AiInsightsView data={insightResult} />
                            </div>
                        )}
                    </TabsContent>

                </Tabs>
            </div>

            <SaveReportModal
                open={saveModalOpen}
                onOpenChange={setSaveModalOpen}
                onConfirm={handleSaveReport}
            />

            {/* Configuration Modal */}
            <Dialog open={configModalOpen} onOpenChange={setConfigModalOpen}>
                <DialogContent className="sm:max-w-[500px] bg-slate-900 border-slate-700 text-slate-100 max-h-[90vh] overflow-y-auto custom-scrollbar">
                    <DialogHeader>
                        <DialogTitle>Efficiency Benchmarks</DialogTitle>
                        <DialogDescription className="text-slate-400">
                            Configure the ranges to define "Great" vs "Poor" performance.
                            Values falling between Min and Max will be considered "Average".
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-6 py-4">
                        {/* CTR Config */}
                        <div className="space-y-3">
                            <h4 className="font-medium text-sm text-slate-300 border-b border-slate-800 pb-1">CTR (Click-Through Rate) % - Higher is better</h4>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs text-gray-500">Min (Below this is Poor)</label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            step="0.01"
                                            className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-sm text-white"
                                            value={tempConfig.ctr.min}
                                            onChange={(e) => setTempConfig({ ...tempConfig, ctr: { ...tempConfig.ctr, min: parseFloat(e.target.value) } })}
                                        />
                                        <span className="absolute right-3 top-2 text-slate-600 text-xs">%</span>
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs text-gray-500">Max (Above this is Great)</label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            step="0.01"
                                            className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-sm text-white"
                                            value={tempConfig.ctr.max}
                                            onChange={(e) => setTempConfig({ ...tempConfig, ctr: { ...tempConfig.ctr, max: parseFloat(e.target.value) } })}
                                        />
                                        <span className="absolute right-3 top-2 text-slate-600 text-xs">%</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* CPC Config */}
                        <div className="space-y-3">
                            <h4 className="font-medium text-sm text-slate-300 border-b border-slate-800 pb-1">CPC (Cost Per Click) $ - Lower is better</h4>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs text-gray-500">Min (Below this is Great)</label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-2 text-slate-600 text-xs">$</span>
                                        <input
                                            type="number"
                                            step="0.01"
                                            className="w-full bg-slate-950 border border-slate-700 rounded p-2 pl-6 text-sm text-white"
                                            value={tempConfig.cpc.min}
                                            onChange={(e) => setTempConfig({ ...tempConfig, cpc: { ...tempConfig.cpc, min: parseFloat(e.target.value) } })}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs text-gray-500">Max (Above this is Poor)</label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-2 text-slate-600 text-xs">$</span>
                                        <input
                                            type="number"
                                            step="0.01"
                                            className="w-full bg-slate-950 border border-slate-700 rounded p-2 pl-6 text-sm text-white"
                                            value={tempConfig.cpc.max}
                                            onChange={(e) => setTempConfig({ ...tempConfig, cpc: { ...tempConfig.cpc, max: parseFloat(e.target.value) } })}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* eCPM Config */}
                        <div className="space-y-3">
                            <h4 className="font-medium text-sm text-slate-300 border-b border-slate-800 pb-1">eCPM (Cost Per Mille) $ - Lower is better</h4>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs text-gray-500">Min (Below this is Great)</label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-2 text-slate-600 text-xs">$</span>
                                        <input
                                            type="number"
                                            step="0.01"
                                            className="w-full bg-slate-950 border border-slate-700 rounded p-2 pl-6 text-sm text-white"
                                            value={tempConfig.cpm.min}
                                            onChange={(e) => setTempConfig({ ...tempConfig, cpm: { ...tempConfig.cpm, min: parseFloat(e.target.value) } })}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs text-gray-500">Max (Above this is Poor)</label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-2 text-slate-600 text-xs">$</span>
                                        <input
                                            type="number"
                                            step="0.01"
                                            className="w-full bg-slate-950 border border-slate-700 rounded p-2 pl-6 text-sm text-white"
                                            value={tempConfig.cpm.max}
                                            onChange={(e) => setTempConfig({ ...tempConfig, cpm: { ...tempConfig.cpm, max: parseFloat(e.target.value) } })}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/* Spend Config */}
                        <div className="space-y-3">
                            <h4 className="font-medium text-sm text-slate-300 border-b border-slate-800 pb-1">Total Spend $ - Higher is better</h4>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs text-gray-500">Min (Below this is Poor)</label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-2 text-slate-600 text-xs">$</span>
                                        <input
                                            type="number"
                                            className="w-full bg-slate-950 border border-slate-700 rounded p-2 pl-6 text-sm text-white"
                                            value={tempConfig.spend.min}
                                            onChange={(e) => setTempConfig({ ...tempConfig, spend: { ...tempConfig.spend, min: parseFloat(e.target.value) } })}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs text-gray-500">Max (Above this is Great)</label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-2 text-slate-600 text-xs">$</span>
                                        <input
                                            type="number"
                                            className="w-full bg-slate-950 border border-slate-700 rounded p-2 pl-6 text-sm text-white"
                                            value={tempConfig.spend.max}
                                            onChange={(e) => setTempConfig({ ...tempConfig, spend: { ...tempConfig.spend, max: parseFloat(e.target.value) } })}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Impressions Config */}
                        <div className="space-y-3">
                            <h4 className="font-medium text-sm text-slate-300 border-b border-slate-800 pb-1">Impressions - Higher is better</h4>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs text-gray-500">Min (Below this is Poor)</label>
                                    <input
                                        type="number"
                                        className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-sm text-white"
                                        value={tempConfig.impressions.min}
                                        onChange={(e) => setTempConfig({ ...tempConfig, impressions: { ...tempConfig.impressions, min: parseFloat(e.target.value) } })}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs text-gray-500">Max (Above this is Great)</label>
                                    <input
                                        type="number"
                                        className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-sm text-white"
                                        value={tempConfig.impressions.max}
                                        onChange={(e) => setTempConfig({ ...tempConfig, impressions: { ...tempConfig.impressions, max: parseFloat(e.target.value) } })}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Clicks Config */}
                        <div className="space-y-3">
                            <h4 className="font-medium text-sm text-slate-300 border-b border-slate-800 pb-1">Clicks - Higher is better</h4>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs text-gray-500">Min (Below this is Poor)</label>
                                    <input
                                        type="number"
                                        className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-sm text-white"
                                        value={tempConfig.clicks.min}
                                        onChange={(e) => setTempConfig({ ...tempConfig, clicks: { ...tempConfig.clicks, min: parseFloat(e.target.value) } })}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs text-gray-500">Max (Above this is Great)</label>
                                    <input
                                        type="number"
                                        className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-sm text-white"
                                        value={tempConfig.clicks.max}
                                        onChange={(e) => setTempConfig({ ...tempConfig, clicks: { ...tempConfig.clicks, max: parseFloat(e.target.value) } })}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-2">
                        <button
                            onClick={() => setConfigModalOpen(false)}
                            className="px-4 py-2 text-sm text-slate-400 hover:text-white hover:bg-slate-800 rounded-md transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSaveConfig}
                            className="px-4 py-2 text-sm font-bold text-white bg-[#1C73E8] hover:bg-[#1557b0] rounded-md transition-colors shadow-sm"
                        >
                            Apply Changes
                        </button>
                    </div>
                </DialogContent>
            </Dialog>

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
                                <p className="text-xs text-gray-500 mb-1">Campaign</p>
                                <p className="text-sm font-medium text-slate-200">{selectedAd.campaign_name}</p>
                            </div>

                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                <div className="p-4 rounded-lg bg-slate-900/50 border border-slate-800">
                                    <p className="text-xs text-gray-500">Impressions</p>
                                    <p className="text-lg font-mono font-bold text-slate-200 truncate" title={((selectedAd.impressions || 0).toLocaleString())}>
                                        {(selectedAd.impressions || 0).toLocaleString()}
                                    </p>
                                </div>
                                <div className="p-4 rounded-lg bg-slate-900/50 border border-slate-800">
                                    <p className="text-xs text-gray-500">Clicks</p>
                                    <p className="text-lg font-mono font-bold text-slate-200 truncate" title={((selectedAd.clicks || 0).toLocaleString())}>
                                        {(selectedAd.clicks || 0).toLocaleString()}
                                    </p>
                                </div>
                                <div className="p-4 rounded-lg bg-slate-900/50 border border-slate-800">
                                    <p className="text-xs text-gray-500">Spend</p>
                                    <p className="text-lg font-mono font-bold text-slate-200 truncate" title={`$${(selectedAd.spent || 0).toLocaleString()}`}>
                                        ${(selectedAd.spent || 0).toLocaleString()}
                                    </p>
                                </div>
                                <div className="p-4 rounded-lg bg-slate-900/50 border border-slate-800">
                                    <p className="text-xs text-gray-500">CTR</p>
                                    <p className={`text-lg font-mono font-bold truncate ${(selectedAd.ctr_percent || 0) * 100 > 1 ? 'text-emerald-400' : 'text-slate-200'
                                        }`}>
                                        {((selectedAd.ctr_percent || 0) * 100).toFixed(2)}%
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 rounded-lg bg-slate-900/50 border border-slate-800">
                                    <p className="text-xs text-gray-500">CPC (Cost Per Click)</p>
                                    <p className="text-lg font-mono font-bold text-slate-200">
                                        ${((selectedAd.spent || 0) / (selectedAd.clicks || 1)).toFixed(2)}
                                    </p>
                                </div>
                                <div className="p-4 rounded-lg bg-slate-900/50 border border-slate-800">
                                    <p className="text-xs text-gray-500">CPM (Cost Per Mille)</p>
                                    <p className="text-lg font-mono font-bold text-slate-200">
                                        ${((selectedAd.spent || 0) / ((selectedAd.impressions || 1) / 1000)).toFixed(2)}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                                <span className="text-sm text-gray-500">Status Recommendation</span>
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
                                            <p className="text-[10px] text-gray-500 uppercase tracking-widest">Ads Count</p>
                                            <p className="text-xl font-mono font-bold text-slate-200">{filteredAds.length}</p>
                                        </div>
                                        <div className="p-3 rounded-lg bg-slate-900/50 border border-slate-800">
                                            <p className="text-[10px] text-gray-500 uppercase tracking-widest">Spend</p>
                                            <p className="text-xl font-mono font-bold text-slate-200 truncate" title={`$${totalSpent.toLocaleString()}`}>
                                                ${totalSpent.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                            </p>
                                        </div>
                                        <div className="p-3 rounded-lg bg-slate-900/50 border border-slate-800">
                                            <p className="text-[10px] text-gray-500 uppercase tracking-widest">Impr.</p>
                                            <p className="text-xl font-mono font-bold text-slate-200 truncate" title={totalImpressions.toLocaleString()}>
                                                {totalImpressions.toLocaleString(undefined, { notation: "compact" })}
                                            </p>
                                        </div>
                                        <div className="p-3 rounded-lg bg-slate-900/50 border border-slate-800">
                                            <p className="text-[10px] text-gray-500 uppercase tracking-widest">Clicks</p>
                                            <p className="text-xl font-mono font-bold text-slate-200">
                                                {totalClicks.toLocaleString()}
                                            </p>
                                        </div>
                                        <div className="p-3 rounded-lg bg-slate-900/50 border border-slate-800">
                                            <p className="text-[10px] text-gray-500 uppercase tracking-widest">Avg CPC</p>
                                            <p className="text-xl font-mono font-bold text-slate-200">
                                                ${avgCPC.toFixed(2)}
                                            </p>
                                        </div>
                                        <div className="p-3 rounded-lg bg-slate-900/50 border border-slate-800">
                                            <p className="text-[10px] text-gray-500 uppercase tracking-widest">Avg CTR</p>
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
                                                <thead className="text-xs text-gray-500 uppercase bg-slate-950 sticky top-0">
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
        </div >
    )
}
