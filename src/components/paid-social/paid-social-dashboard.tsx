'use client'

import { useState, useEffect } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useForm, useFieldArray, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Plus, Trash2, Save, Send, FileText, BarChart2, ArrowLeft, TrendingUp, Users, Target, Layout } from "lucide-react"
import { sendCampaignSetupEmail } from '@/actions/paid-social-actions'
import { toast } from "sonner"
import { FileUpload } from "@/components/dashboard/file-upload"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Line, LineChart, CartesianGrid, Legend, Area, AreaChart } from "recharts"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { DashboardClient } from '@/components/dashboard/dashboard-client'
import { PaidSocialSettings } from './paid-social-settings'
import { fetchLinkedInMetrics } from '@/actions/paid-social-mcp-actions'

// --- Schemas ---

const adSchema = z.object({
    utmLink: z.string().optional(), // Relaxed validation
    primaryText: z.string().optional(),
    headline: z.string().optional(),
    media: z.string().optional(), // For now, storing file name or fake path
})

const adGroupSchema = z.object({
    name: z.string().min(1, "Group Name is required"),
    audience: z.string().min(1, "Audience is required"),
    budget: z.string().min(1, "Budget is required"),
    ads: z.array(adSchema).min(1, "At least one ad is required")
})

const campaignSchema = z.object({
    channel: z.enum(["LinkedIn", "Meta", "Reddit"]),
    campaignName: z.string().min(1, "Campaign Name is required"),
    channelSpecifics: z.record(z.string(), z.string()), // For dynamic fields
    adGroups: z.array(adGroupSchema).min(1, "At least one Ad Group is required")
})

type CampaignFormValues = z.infer<typeof campaignSchema>

interface SubmittedAd {
    id: string
    campaignName: string
    media?: string
    primaryText?: string
    submittedAt: string
    deliveredAt: string
    previewLink?: string
}

interface Report {
    id: string
    name: string
    date: string
    status: 'Completed' | 'Draft'
    content?: string // Fallback
    data?: any // Structured data for charts
}

const INITIAL_REPORTS: Report[] = [
    {
        id: '1',
        name: 'Q4 Performance Review',
        date: 'Dec 15, 2025',
        status: 'Completed',
        data: {
            metrics: {
                spend: 50000,
                impressions: 2500000,
                clicks: 45000,
                conversions: 1200,
                roas: 3.2,
                cpa: 41.66
            },
            performance: [
                { date: 'Oct', spend: 12000, roas: 2.8, conversions: 300 },
                { date: 'Nov', spend: 18000, roas: 3.5, conversions: 500 },
                { date: 'Dec', spend: 20000, roas: 3.1, conversions: 400 },
            ],
            platforms: [
                { name: 'Meta', value: 30000 },
                { name: 'LinkedIn', value: 15000 },
                { name: 'Reddit', value: 5000 },
            ],
            demographics: [
                { name: '18-24', value: 15 },
                { name: '25-34', value: 45 },
                { name: '35-44', value: 25 },
                { name: '45+', value: 15 },
            ]
        }
    },
    {
        id: '2',
        name: 'November Campaign Analysis',
        date: 'Nov 30, 2025',
        status: 'Completed',
        data: {
            metrics: { spend: 18000, impressions: 900000, clicks: 18000, conversions: 500, roas: 3.5, cpa: 36.00 },
            performance: [
                { date: 'Week 1', spend: 4000, roas: 3.2, conversions: 110 },
                { date: 'Week 2', spend: 4500, roas: 3.4, conversions: 130 },
                { date: 'Week 3', spend: 5000, roas: 3.8, conversions: 160 },
                { date: 'Week 4', spend: 4500, roas: 3.6, conversions: 100 },
            ],
            platforms: [
                { name: 'Meta', value: 12000 },
                { name: 'LinkedIn', value: 6000 },
            ]
        }
    },
    {
        id: '3',
        name: 'Competitor Benchmarking',
        date: 'Oct 12, 2025',
        status: 'Draft',
        content: 'Initial data collection on top 3 competitors. Pending further manual review.'
    },
]

const MOCK_CAMPAIGNS = [
    { id: 'cmp_1', name: 'Summer Sale 2024', status: 'active', budget: 5000, spend: 3200, impressions: 150000, clicks: 7500, conversions: 300, roas: 4.5 },
    { id: 'cmp_2', name: 'New Product Launch', status: 'paused', budget: 3000, spend: 1500, impressions: 80000, clicks: 3000, conversions: 100, roas: 3.0 },
    { id: 'cmp_3', name: 'Brand Awareness Q3', status: 'active', budget: 7000, spend: 5000, impressions: 250000, clicks: 9000, conversions: 150, roas: 2.5 },
]

const MOCK_AD_GROUPS = [
    { id: 'ag_1', name: 'Retargeting Audience', campaign_id: 'cmp_1', status: 'active', budget: 2000, spend: 1800, impressions: 90000, clicks: 4500, conversions: 180, roas: 5.0 },
    { id: 'ag_2', name: 'Lookalike Audience', campaign_id: 'cmp_1', status: 'active', budget: 3000, spend: 1400, impressions: 60000, clicks: 3000, conversions: 120, roas: 3.5 },
    { id: 'ag_3', name: 'Interest Targeting - Tech Enthusiasts', campaign_id: 'cmp_2', status: 'paused', budget: 1500, spend: 500, impressions: 40000, clicks: 1500, conversions: 50, roas: 2.0 },
]

const MOCK_ADS = [
    { id: 'ad_1', name: 'Summer Sale - Image Ad 1', ad_group_id: 'ag_1', status: 'active', creative: 'image1.jpg', copy: 'Get 50% off all summer items!', clicks: 2000, impressions: 50000, conversions: 100, roas: 6.0 },
    { id: 'ad_2', name: 'Summer Sale - Video Ad', ad_group_id: 'ag_1', status: 'active', creative: 'video1.mp4', copy: 'Don\'t miss out on our summer deals!', clicks: 2500, impressions: 70000, conversions: 80, roas: 4.0 },
    { id: 'ad_3', name: 'New Product Launch - Main Ad', ad_group_id: 'ag_3', status: 'paused', creative: 'product_main.jpg', copy: 'Introducing the future of tech!', clicks: 1000, impressions: 30000, conversions: 20, roas: 3.0 },
]

const performanceData = [
    { date: 'Mon', spend: 1200, conversions: 42 },
    { date: 'Tue', spend: 1450, conversions: 51 },
    { date: 'Wed', spend: 1100, conversions: 38 },
    { date: 'Thu', spend: 1680, conversions: 58 },
    { date: 'Fri', spend: 1890, conversions: 66 },
    { date: 'Sat', spend: 1420, conversions: 49 },
    { date: 'Sun', spend: 1210, conversions: 41 },
]

// --- Component ---

export function PaidSocialDashboard({ initialTab = "setup" }: { initialTab?: string }) {
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isProcessing, setIsProcessing] = useState(false)
    const [activeTab, setActiveTab] = useState(initialTab)
    const [activeReportTab, setActiveReportTab] = useState("my-reports")
    const [submittedAds, setSubmittedAds] = useState<SubmittedAd[]>([])
    const [selectedReport, setSelectedReport] = useState<Report | null>(null)
    const [isLoadingMetrics, setIsLoadingMetrics] = useState(false)
    const [realMetrics, setRealMetrics] = useState<any>(null)

    // Sync activeTab with prop from parent (page.tsx URL state)
    useEffect(() => {
        if (initialTab) {
            setActiveTab(initialTab)
        }
    }, [initialTab])

    useEffect(() => {
        if (activeTab === 'results') {
            const loadData = async () => {
                setIsLoadingMetrics(true)
                const result = await fetchLinkedInMetrics()
                if (result.success) {
                    setRealMetrics(result.data)
                } else {
                    console.error("Failed to load real metrics:", result.error)
                    // Keep mock data if real fails, but notify if there's a config issue
                    if (result.error?.includes('configuration not found')) {
                        toast.info("Conecte sua conta do LinkedIn na aba Settings para ver dados reais.")
                    }
                }
                setIsLoadingMetrics(false)
            }
            loadData()
        }
    }, [activeTab])
    const [reports, setReports] = useState<Report[]>(INITIAL_REPORTS)

    const form = useForm<CampaignFormValues>({
        resolver: zodResolver(campaignSchema),
        defaultValues: {
            channel: "Meta",
            campaignName: "",
            channelSpecifics: { objective: "Awareness" },
            adGroups: [
                {
                    name: "Group 1",
                    audience: "",
                    budget: "",
                    ads: [{ utmLink: "", primaryText: "", headline: "" }]
                }
            ]
        }
    })

    const { control, register, handleSubmit, watch, setValue, formState: { errors } } = form

    const { fields: adGroupFields, append: appendAdGroup, remove: removeAdGroup } = useFieldArray({
        control,
        name: "adGroups"
    })

    const selectedChannel = watch("channel")

    // Update default objective when channel changes
    const objectiveOptions: Record<string, string[]> = {
        "Meta": ["Awareness", "Traffic", "Leads", "Sales", "App Promotion"],
        "LinkedIn": ["Brand Awareness", "Website Visits", "Engagement", "Video Views", "Lead Generation", "Website Conversions", "Job Applicants"],
        "Reddit": ["Brand Awareness", "Traffic", "Conversions", "Video Views", "App Installs"]
    }

    const currentObjectives = objectiveOptions[selectedChannel] || objectiveOptions["Meta"]

    const handleFileUpload = async (file: File) => {
        setIsProcessing(true)
        try {
            // Simulate processing delay
            await new Promise(resolve => setTimeout(resolve, 2000))

            const newReport: Report = {
                id: Math.random().toString(36).substr(2, 9),
                name: file.name.replace('.csv', '') + ' Analysis',
                date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
                status: 'Completed',
                // Generate mock rich data for new uploads
                data: {
                    metrics: { spend: 1540, impressions: 45000, clicks: 850, conversions: 42, roas: 2.8, cpa: 36.66 },
                    performance: [
                        { date: 'Week 1', spend: 300, roas: 2.1, conversions: 8 },
                        { date: 'Week 2', spend: 450, roas: 2.9, conversions: 12 },
                        { date: 'Week 3', spend: 400, roas: 3.2, conversions: 14 },
                        { date: 'Week 4', spend: 390, roas: 2.7, conversions: 8 },
                    ],
                    platforms: [
                        { name: 'LinkedIn', value: 800 },
                        { name: 'Meta', value: 740 },
                    ]
                }
            }

            setReports(prev => [newReport, ...prev])
            toast.success("File processed successfully! New report generated.")
            setActiveReportTab("my-reports")
            setSelectedReport(newReport)
        } catch (error) {
            toast.error("Failed to process file.")
        } finally {
            setIsProcessing(false)
        }
    }

    const onSubmit = async (data: CampaignFormValues) => {
        setIsSubmitting(true)
        try {
            const result = await sendCampaignSetupEmail(data)
            if (result.success) {
                toast.success("Campaign setup request sent successfully!")

                // Add to history
                const newAds: SubmittedAd[] = []
                data.adGroups.forEach(group => {
                    group.ads.forEach((ad, index) => {
                        newAds.push({
                            id: Math.random().toString(36).substr(2, 9),
                            campaignName: data.campaignName, // All ads share the campaign name
                            media: ad.media,
                            primaryText: ad.primaryText,
                            submittedAt: new Date().toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' }),
                            deliveredAt: new Date(Date.now() + 86400000 * 2).toLocaleDateString('pt-BR'), // Mock +2 days
                            previewLink: ad.utmLink
                        })
                    })
                })
                setSubmittedAds(prev => [...newAds, ...prev])

                form.reset()
            } else {
                toast.error("Failed to send request: " + result.error)
            }
        } catch (error) {
            toast.error("An unexpected error occurred.")
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="w-full h-full bg-black text-white font-sans p-6 overflow-hidden flex flex-col">
            <Tabs defaultValue="setup" value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">

                <TabsContent value="setup" className="flex-1 overflow-y-auto pr-2 custom-scrollbar pb-20">
                    <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-[1600px] space-y-8">

                        {/* 1. Basic Info */}
                        <div className="space-y-4 p-5 bg-white/5 rounded-lg border border-white/10">
                            <h2 className="text-xl font-semibold flex items-center gap-2">
                                <FileText size={20} className="text-blue-400" />
                                Campaign Basics
                            </h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm text-gray-400">Channel</label>
                                    <select
                                        {...register("channel")}
                                        className="w-full bg-black border border-white/20 rounded-md p-2 text-white focus:border-blue-500 outline-none"
                                        onChange={(e) => {
                                            register("channel").onChange(e);
                                            // Reset objective when channel changes
                                            const newChannel = e.target.value;
                                            const defaultObj = (objectiveOptions[newChannel] || [])[0] || "";
                                            setValue("channelSpecifics.objective", defaultObj);
                                        }}
                                    >
                                        <option value="Meta">Meta (Facebook/Instagram)</option>
                                        <option value="LinkedIn">LinkedIn</option>
                                        <option value="Reddit">Reddit</option>
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm text-gray-400">Campaign Name</label>
                                    <input
                                        {...register("campaignName")}
                                        placeholder="e.g., Q1 Awareness Campaign"
                                        className="w-full bg-black border border-white/20 rounded-md p-2 text-white focus:border-blue-500 outline-none placeholder:text-gray-600"
                                    />
                                    {errors.campaignName && <span className="text-red-500 text-xs">{errors.campaignName.message}</span>}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm text-gray-400">Campaign Objective</label>
                                <select
                                    onChange={(e) => setValue('channelSpecifics.objective', e.target.value)}
                                    // Default value is handled by react-hook-form via setValue, but we can set defaultValue for UI sync
                                    defaultValue={currentObjectives[0]}
                                    className="w-full bg-black border border-white/20 rounded-md p-2 text-white focus:border-blue-500 outline-none"
                                >
                                    {currentObjectives.map((obj) => (
                                        <option key={obj} value={obj}>{obj}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* 2. Ad Groups */}
                        <div className="space-y-6">
                            <div className="flex justify-between items-center">
                                <h2 className="text-xl font-semibold flex items-center gap-2">
                                    <BarChart2 size={20} className="text-green-400" />
                                    Ad Groups
                                </h2>
                                <button
                                    type="button"
                                    onClick={() => appendAdGroup({ name: "", audience: "", budget: "", ads: [{ utmLink: "", primaryText: "", headline: "" }] })}
                                    className="flex items-center gap-2 text-xs bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-full transition-colors"
                                >
                                    <Plus size={14} /> Add Group
                                </button>
                            </div>

                            {adGroupFields.map((field, index) => (
                                <AdGroupItem
                                    key={field.id}
                                    index={index}
                                    control={control}
                                    register={register}
                                    remove={removeAdGroup}
                                    errors={errors}
                                    setValue={setValue}
                                    watch={watch}
                                />
                            ))}
                        </div>

                        <div className="pt-4 pb-12">
                            <button
                                type="button"
                                onClick={handleSubmit(onSubmit, (errors) => {
                                    console.error("Form errors:", errors)
                                    // Log explicit errors to help user
                                    const errorCtx = Object.keys(errors).map(k => {
                                        if (k === 'adGroups') {
                                            // Check deep errors if possible, but just generic warning for now
                                            return 'Ad Groups (check Name, Audience, Budget)'
                                        }
                                        return k
                                    }).join(", ")
                                    toast.error(`Please fill required fields: ${errorCtx}`)
                                })}
                                disabled={isSubmitting}
                                className="bg-[#1C73E8] hover:bg-blue-600 text-white font-medium py-2.5 px-6 rounded-lg flex items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isSubmitting ? (
                                    <>Saving...</>
                                ) : (
                                    <>
                                        <Save size={18} />
                                        Save & Send Request
                                    </>
                                )}
                            </button>
                        </div>

                        {/* Submitted Requests List */}
                        {submittedAds.length > 0 && (
                            <div className="border-t border-white/10 pt-8 mt-8">
                                <h3 className="text-lg font-semibold text-white mb-6">Recent Requests</h3>
                                <div className="space-y-3">
                                    {/* Header Row */}
                                    <div className="grid grid-cols-12 gap-4 px-4 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        <div className="col-span-1">Preview</div>
                                        <div className="col-span-3">Campaign</div>
                                        <div className="col-span-3">Caption</div>
                                        <div className="col-span-2">Submitted</div>
                                        <div className="col-span-2">Delivery</div>
                                        <div className="col-span-1 text-right">Link</div>
                                    </div>

                                    {submittedAds.map((ad) => (
                                        <div key={ad.id} className="grid grid-cols-12 gap-4 items-center p-4 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-colors">
                                            {/* Preview */}
                                            <div className="col-span-1">
                                                <div className="w-10 h-10 bg-black/50 rounded flex items-center justify-center overflow-hidden border border-white/10">
                                                    {ad.media ? (
                                                        <span className="text-[10px] text-gray-400">IMG</span>
                                                    ) : (
                                                        <FileText size={16} className="text-gray-500" />
                                                    )}
                                                </div>
                                            </div>

                                            {/* Campaign */}
                                            <div className="col-span-3 text-sm font-medium text-white truncate">
                                                {ad.campaignName}
                                            </div>

                                            {/* Caption */}
                                            <div className="col-span-3 text-sm text-gray-400 truncate">
                                                {ad.primaryText || <span className="italic opacity-50">No caption</span>}
                                            </div>

                                            {/* Submitted */}
                                            <div className="col-span-2 text-xs text-gray-400">
                                                {ad.submittedAt}
                                            </div>

                                            {/* Delivery */}
                                            <div className="col-span-2 text-xs text-green-400">
                                                {ad.deliveredAt}
                                            </div>

                                            {/* Link */}
                                            <div className="col-span-1 flex justify-end">
                                                <a
                                                    href={ad.previewLink || "#"}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-blue-400 hover:text-blue-300 p-2 hover:bg-blue-500/10 rounded-full transition-colors"
                                                    title="View Preview"
                                                >
                                                    <Send size={14} className="transform -rotate-45" />
                                                </a>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </form>
                </TabsContent>

                <TabsContent value="results" className="flex-1 flex flex-col min-h-0 overflow-y-auto custom-scrollbar pb-20">
                    {isLoadingMetrics ? (
                        <div className="flex flex-col items-center justify-center p-20 gap-4">
                            <div className="w-12 h-12 border-4 border-[#1C73E8] border-t-transparent rounded-full animate-spin"></div>
                            <p className="text-gray-400 animate-pulse">Fetching real-time LinkedIn data...</p>
                        </div>
                    ) : (
                        <div className="space-y-8 max-w-[1600px]">
                            {/* Summary Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                <Card className="bg-white/5 border-white/10 text-white backdrop-blur-sm">
                                    <CardHeader className="pb-2">
                                        <CardDescription className="text-gray-400">Total Spend</CardDescription>
                                        <CardTitle className="text-2xl font-bold">
                                            ${(realMetrics?.metrics?.spend ?? 0).toLocaleString()}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-xs text-green-400 flex items-center gap-1">
                                            <TrendingUp size={12} />
                                            +12.5% vs last month
                                        </div>
                                    </CardContent>
                                </Card>
                                <Card className="bg-white/5 border-white/10 text-white backdrop-blur-sm">
                                    <CardHeader className="pb-2">
                                        <CardDescription className="text-gray-400">Impressions</CardDescription>
                                        <CardTitle className="text-2xl font-bold">
                                            {(realMetrics?.metrics?.impressions ?? 0).toLocaleString()}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-xs text-gray-500 flex items-center gap-1">
                                            Avg. CPM: ${realMetrics?.metrics?.impressions > 0 ? (realMetrics.metrics.spend / (realMetrics.metrics.impressions / 1000)).toFixed(2) : "0.00"}
                                        </div>
                                    </CardContent>
                                </Card>
                                <Card className="bg-white/5 border-white/10 text-white backdrop-blur-sm">
                                    <CardHeader className="pb-2">
                                        <CardDescription className="text-gray-400">CTR</CardDescription>
                                        <CardTitle className="text-2xl font-bold">
                                            {realMetrics?.metrics?.impressions ? ((realMetrics.metrics.clicks / realMetrics.metrics.impressions) * 100).toFixed(2) : "0.00"}%
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-xs text-green-400 flex items-center gap-1">
                                            <TrendingUp size={12} />
                                            Live status
                                        </div>
                                    </CardContent>
                                </Card>
                                <Card className="bg-white/5 border-white/10 text-white backdrop-blur-sm">
                                    <CardHeader className="pb-2">
                                        <CardDescription className="text-gray-400">Conversions</CardDescription>
                                        <CardTitle className="text-2xl font-bold">
                                            {realMetrics?.metrics?.conversions ?? 0}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-xs text-blue-400 flex items-center gap-1">
                                            CPA: ${realMetrics?.metrics?.conversions ? (realMetrics.metrics.spend / realMetrics.metrics.conversions).toFixed(2) : "0.00"}
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Performance Chart */}
                            <Card className="bg-white/5 border-white/10 text-white overflow-hidden">
                                <CardHeader>
                                    <CardTitle className="text-lg">Performance Over Time</CardTitle>
                                </CardHeader>
                                <CardContent className="h-[400px] w-full pt-4">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={realMetrics?.performance || performanceData}>
                                            <defs>
                                                <linearGradient id="colorSpend" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#1C73E8" stopOpacity={0.3} />
                                                    <stop offset="95%" stopColor="#1C73E8" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                                            <XAxis
                                                dataKey="date"
                                                stroke="#94a3b8"
                                                fontSize={12}
                                                tickLine={false}
                                                axisLine={false}
                                            />
                                            <YAxis
                                                stroke="#94a3b8"
                                                fontSize={12}
                                                tickLine={false}
                                                axisLine={false}
                                                tickFormatter={(value) => `$${value}`}
                                            />
                                            <Tooltip
                                                contentStyle={{ backgroundColor: '#111', border: '1px solid #333', borderRadius: '8px' }}
                                                itemStyle={{ color: '#fff' }}
                                            />
                                            <Area
                                                type="monotone"
                                                dataKey="spend"
                                                stroke="#1C73E8"
                                                strokeWidth={2}
                                                fillOpacity={1}
                                                fill="url(#colorSpend)"
                                            />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </CardContent>
                            </Card>

                            {/* Detailed Campaigns List */}
                            <div className="space-y-4 pt-4">
                                <h3 className="text-lg font-semibold flex items-center gap-2">
                                    <Layout size={18} className="text-blue-400" />
                                    Campaign Breakdown
                                </h3>
                                <div className="grid grid-cols-1 gap-3">
                                    {realMetrics?.performance?.length > 1 ? (
                                        realMetrics.performance.slice(1).map((item: any, idx: number) => (
                                            <div key={idx} className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400 font-bold">
                                                        {(item.name || item.date).substring(0, 1)}
                                                    </div>
                                                    <div>
                                                        <p className="font-medium">{item.name || item.date}</p>
                                                        <p className="text-xs text-gray-500">Status: Active</p>
                                                    </div>
                                                </div>
                                                <div className="flex gap-12 text-right">
                                                    <div>
                                                        <p className="text-xs text-gray-400 uppercase">Spend</p>
                                                        <p className="font-semibold">${item.spend.toLocaleString()}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-gray-400 uppercase">ROAS</p>
                                                        <p className="font-semibold text-green-400">{item.roas.toFixed(2)}x</p>
                                                    </div>
                                                    <div className="w-20">
                                                        <p className="text-xs text-gray-400 uppercase">Conv.</p>
                                                        <p className="font-semibold">{item.conversions}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="p-8 text-center text-gray-500 border border-dashed border-white/10 rounded-xl">
                                            No active campaigns found for this period.
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="import" className="flex-1 flex flex-col min-h-0 overflow-y-auto custom-scrollbar pb-20">
                    <DashboardClient />
                </TabsContent>

                <TabsContent value="settings" className="flex-1 overflow-y-auto pr-2 custom-scrollbar pb-20">
                    <PaidSocialSettings />
                </TabsContent>
            </Tabs>
        </div>
    )
}

function AdGroupItem({ index, control, register, remove, errors, setValue, watch }: any) {
    const { fields: adFields, append: appendAd, remove: removeAd } = useFieldArray({
        control,
        name: `adGroups.${index}.ads`
    })

    return (
        <div className="p-5 bg-white/5 rounded-lg border border-white/10 relative group">
            <button
                type="button"
                onClick={() => remove(index)}
                className="absolute top-4 right-4 text-gray-600 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                title="Remove Group"
            >
                <Trash2 size={16} />
            </button>

            <h4 className="text-sm font-semibold text-gray-300 mb-4 uppercase tracking-wider">Group {index + 1}</h4>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="space-y-2">
                    <label className="text-xs text-gray-400">Group Name</label>
                    <input
                        {...register(`adGroups.${index}.name`)}
                        placeholder="e.g., Prospecting - LAL 1%"
                        className="w-full bg-black border border-white/20 rounded-md p-2 text-white text-sm focus:border-blue-500 outline-none"
                    />
                    {errors.adGroups?.[index]?.name && <span className="text-red-500 text-[10px]">{errors.adGroups[index].name.message}</span>}
                </div>
                <div className="space-y-2">
                    <label className="text-xs text-gray-400">Audience</label>
                    <input
                        {...register(`adGroups.${index}.audience`)}
                        placeholder="e.g., Lookalike 1% + Interests"
                        className="w-full bg-black border border-white/20 rounded-md p-2 text-white text-sm focus:border-blue-500 outline-none"
                    />
                    {errors.adGroups?.[index]?.audience && <span className="text-red-500 text-[10px]">{errors.adGroups[index].audience.message}</span>}
                </div>
                <div className="space-y-2">
                    <label className="text-xs text-gray-400">Budget</label>
                    <input
                        {...register(`adGroups.${index}.budget`)}
                        placeholder="e.g., $100/day"
                        className="w-full bg-black border border-white/20 rounded-md p-2 text-white text-sm focus:border-blue-500 outline-none"
                    />
                    {errors.adGroups?.[index]?.budget && <span className="text-red-500 text-[10px]">{errors.adGroups[index].budget.message}</span>}
                </div>
            </div>

            {/* Ads List */}
            <div className="bg-black/20 rounded p-3 border border-white/5">
                <div className="flex justify-between items-center mb-2">
                    <label className="text-xs text-gray-500 font-medium">Ads creatives</label>
                    <button
                        type="button"
                        onClick={() => appendAd({ utmLink: "", primaryText: "", headline: "" })}
                        className="text-[10px] bg-white/10 hover:bg-white/20 px-2 py-1 rounded text-gray-300"
                    >
                        + Add Ad
                    </button>
                </div>

                <div className="space-y-3">
                    {adFields.map((ad: any, adIndex: number) => (
                        <AdItem
                            key={ad.id}
                            groupIndex={index}
                            adIndex={adIndex}
                            register={register}
                            control={control}
                            removeAd={() => removeAd(adIndex)}
                            watch={watch}
                            setValue={setValue}
                        />
                    ))}
                </div>
            </div>
        </div>
    )
}

function AdItem({ groupIndex, adIndex, register, removeAd, watch, setValue }: any) {
    const [isEditing, setIsEditing] = useState(false)

    // Watch values for preview
    const headline = watch(`adGroups.${groupIndex}.ads.${adIndex}.headline`)
    const primaryText = watch(`adGroups.${groupIndex}.ads.${adIndex}.primaryText`)
    const media = watch(`adGroups.${groupIndex}.ads.${adIndex}.media`)

    // Simple display name logic
    const displayName = headline || primaryText || `Ad ${adIndex + 1}`

    if (!isEditing) {
        return (
            <div className="flex items-center justify-between p-3 bg-white/5 rounded border border-white/10 hover:border-white/20 transition-all">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/10 rounded flex items-center justify-center text-gray-500 overflow-hidden">
                        {media ? <img src="/placeholder-image-icon.png" className="w-full h-full object-cover" /> : <FileText size={16} />}
                    </div>
                    <div className="flex flex-col">
                        <span className="text-sm font-medium text-white">{displayName}</span>
                        <span className="text-xs text-gray-500">Click Edit to configure</span>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={() => setIsEditing(true)}
                        className="text-xs bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 px-3 py-1.5 rounded"
                    >
                        Edit
                    </button>
                    <button
                        type="button"
                        onClick={removeAd}
                        className="text-gray-500 hover:text-red-400 p-1.5"
                    >
                        <Trash2 size={14} />
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="p-4 bg-white/5 rounded border border-blue-500/50 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-start mb-4">
                <h5 className="text-sm font-semibold text-blue-400">Editing Ad {adIndex + 1}</h5>
                <button type="button" onClick={() => setIsEditing(false)} className="text-gray-500 hover:text-white">
                    <XIcon size={16} />
                </button>
            </div>

            <div className="space-y-4">
                {/* Media Upload Simulation */}
                <div className="space-y-2">
                    <label className="text-xs text-gray-400">Ad Media (Image/Video)</label>
                    <div className="border border-dashed border-white/20 rounded-lg p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-white/5 transition-colors">
                        <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center mb-2">
                            <Plus size={20} className="text-gray-400" />
                        </div>
                        <span className="text-xs text-gray-400">Click to upload media</span>
                        <input
                            type="file"
                            className="hidden"
                            onChange={(e) => {
                                // Simulate upload
                                const file = e.target.files?.[0]
                                if (file) setValue(`adGroups.${groupIndex}.ads.${adIndex}.media`, file.name)
                            }}
                        />
                        {media && <span className="text-xs text-blue-400 mt-2">{media}</span>}
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-xs text-gray-400">Primary Text (Top)</label>
                    <textarea
                        {...register(`adGroups.${groupIndex}.ads.${adIndex}.primaryText`)}
                        placeholder="The text that appears above the creative..."
                        rows={3}
                        className="w-full bg-black border border-white/20 rounded p-2 text-sm text-white focus:border-blue-500 outline-none"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-xs text-gray-400">Headline (Footer)</label>
                    <input
                        {...register(`adGroups.${groupIndex}.ads.${adIndex}.headline`)}
                        placeholder="The bold headline at the bottom..."
                        className="w-full bg-black border border-white/20 rounded p-2 text-sm text-white focus:border-blue-500 outline-none"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-xs text-gray-400">Destination Link (UTM)</label>
                    <input
                        {...register(`adGroups.${groupIndex}.ads.${adIndex}.utmLink`)}
                        placeholder="https://example.com/page?utm_source=..."
                        className="w-full bg-black border border-white/20 rounded p-2 text-sm text-white focus:border-blue-500 outline-none"
                    />
                </div>

                <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-white/10">
                    <button
                        type="button"
                        onClick={() => setIsEditing(false)} // "Cancel" logic -> just close
                        className="px-3 py-1.5 text-xs text-gray-400 hover:text-white transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={() => setIsEditing(false)} // "Save" logic -> just close (data is already bound)
                        className="px-3 py-1.5 text-xs bg-blue-600 hover:bg-blue-500 text-white rounded transition-colors"
                    >
                        Save Ad
                    </button>
                </div>
            </div>
        </div>
    )
}

function XIcon({ size }: { size: number }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
    )
}

function PaidSocialReportView({ data }: { data: any }) {
    return (
        <div className="space-y-6">
            {/* Top Metrics Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <Card className="bg-black/20 border-white/10">
                    <CardContent className="p-4">
                        <p className="text-xs text-gray-400 mb-1">Total Spend</p>
                        <p className="text-lg font-bold text-white">${data.metrics.spend.toLocaleString()}</p>
                    </CardContent>
                </Card>
                <Card className="bg-black/20 border-white/10">
                    <CardContent className="p-4">
                        <p className="text-xs text-gray-400 mb-1">Impressions</p>
                        <p className="text-lg font-bold text-white">{(data.metrics.impressions / 1000).toFixed(1)}k</p>
                    </CardContent>
                </Card>
                <Card className="bg-black/20 border-white/10">
                    <CardContent className="p-4">
                        <p className="text-xs text-gray-400 mb-1">Clicks</p>
                        <p className="text-lg font-bold text-white">{data.metrics.clicks.toLocaleString()}</p>
                    </CardContent>
                </Card>
                <Card className="bg-black/20 border-white/10">
                    <CardContent className="p-4">
                        <p className="text-xs text-gray-400 mb-1">Conversions</p>
                        <p className="text-lg font-bold text-green-400">{data.metrics.conversions}</p>
                    </CardContent>
                </Card>
                <Card className="bg-black/20 border-white/10">
                    <CardContent className="p-4">
                        <p className="text-xs text-gray-400 mb-1">ROAS</p>
                        <p className="text-lg font-bold text-blue-400">{data.metrics.roas}x</p>
                    </CardContent>
                </Card>
                <Card className="bg-black/20 border-white/10">
                    <CardContent className="p-4">
                        <p className="text-xs text-gray-400 mb-1">CPA</p>
                        <p className="text-lg font-bold text-white">${data.metrics.cpa}</p>
                    </CardContent>
                </Card>
            </div>

            <Tabs defaultValue="overview" className="w-full">
                <TabsList className="bg-black/20 border border-white/10 w-full justify-start h-auto p-1">
                    <TabsTrigger value="overview" className="gap-2 data-[state=active]:bg-white/10"><TrendingUp size={14} /> Performance</TabsTrigger>
                    <TabsTrigger value="creative" className="gap-2 data-[state=active]:bg-white/10"><Layout size={14} /> Creative</TabsTrigger>
                    <TabsTrigger value="audience" className="gap-2 data-[state=active]:bg-white/10"><Users size={14} /> Audience</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="mt-6 space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <Card className="bg-black/20 border-white/10">
                            <CardHeader>
                                <CardTitle className="text-base text-white">Spend vs ROAS Trend</CardTitle>
                            </CardHeader>
                            <CardContent className="h-[300px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={data.performance}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                                        <XAxis dataKey="date" stroke="#666" tickLine={false} axisLine={false} />
                                        <YAxis yAxisId="left" stroke="#666" tickLine={false} axisLine={false} tickFormatter={val => `$${val}`} />
                                        <YAxis yAxisId="right" orientation="right" stroke="#666" tickLine={false} axisLine={false} />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: '#111', border: '1px solid #333' }}
                                        />
                                        <Legend />
                                        <Line yAxisId="left" type="monotone" dataKey="spend" stroke="#3b82f6" name="Spend" />
                                        <Line yAxisId="right" type="monotone" dataKey="roas" stroke="#10b981" name="ROAS" />
                                    </LineChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>

                        <Card className="bg-black/20 border-white/10">
                            <CardHeader>
                                <CardTitle className="text-base text-white">Platform Breakdown</CardTitle>
                            </CardHeader>
                            <CardContent className="h-[300px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={data.platforms} layout="vertical">
                                        <CartesianGrid strokeDasharray="3 3" stroke="#333" horizontal={false} />
                                        <XAxis type="number" stroke="#666" tickLine={false} axisLine={false} />
                                        <YAxis dataKey="name" type="category" stroke="#fff" tickLine={false} axisLine={false} width={80} />
                                        <Tooltip
                                            cursor={{ fill: 'transparent' }}
                                            contentStyle={{ backgroundColor: '#111', border: '1px solid #333' }}
                                        />
                                        <Bar dataKey="value" fill="#f59e0b" radius={[0, 4, 4, 0]} barSize={32} name="Spend" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="creative" className="mt-6 flex flex-col items-center justify-center p-12 text-gray-500 border border-dashed border-white/10 rounded">
                    <Layout size={40} className="mb-4 opacity-50" />
                    <p>Creative analysis details would appear here.</p>
                </TabsContent>

                <TabsContent value="audience" className="mt-6 flex flex-col items-center justify-center p-12 text-gray-500 border border-dashed border-white/10 rounded">
                    <Users size={40} className="mb-4 opacity-50" />
                    <p>Audience demographic insights would appear here.</p>
                </TabsContent>
            </Tabs>
        </div>
    )
}
