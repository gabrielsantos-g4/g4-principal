'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { Save, Linkedin, Loader2, CheckCircle2, Eye, EyeOff } from "lucide-react"
import { getPlatformConfig, savePlatformConfig } from '@/actions/paid-social-config-actions'

export function PaidSocialSettings() {
    const [loading, setLoading] = useState(false)
    const [fetching, setFetching] = useState(true)
    const [config, setConfig] = useState({
        ad_account_id: '',
        access_token: ''
    })
    const [showToken, setShowToken] = useState(false)

    useEffect(() => {
        const fetchConfig = async () => {
            setFetching(true)
            const result = await getPlatformConfig('linkedin')
            if (result.success && result.data) {
                setConfig({
                    ad_account_id: result.data.config.ad_account_id || '',
                    access_token: result.data.config.access_token || ''
                })
            }
            setFetching(false)
        }
        fetchConfig()
    }, [])

    const handleSave = async () => {
        if (!config.ad_account_id || !config.access_token) {
            toast.error("Please fill in all fields")
            return
        }

        setLoading(true)
        const result = await savePlatformConfig('linkedin', config)

        if (result.success) {
            toast.success("LinkedIn credentials saved successfully")
        } else {
            toast.error(result.error || "Failed to save credentials")
        }
        setLoading(false)
    }

    if (fetching) {
        return (
            <div className="flex items-center justify-center p-12">
                <Loader2 className="w-8 h-8 animate-spin text-[#1C73E8]" />
            </div>
        )
    }

    return (
        <div className="space-y-6 max-w-2xl mx-auto">
            <Card className="bg-white/5 border-white/10 text-white backdrop-blur-sm">
                <CardHeader className="flex flex-row items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-[#0077B5] flex items-center justify-center">
                        <Linkedin className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <CardTitle className="text-xl">LinkedIn Ads Integration</CardTitle>
                        <CardDescription className="text-gray-400">
                            Connect your LinkedIn Ads account to enable real-time dashboard data.
                        </CardDescription>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6 pt-6">
                    <div className="space-y-2">
                        <Label htmlFor="ad-account" className="text-sm font-medium text-gray-300">
                            LinkedIn Ad Account ID
                        </Label>
                        <Input
                            id="ad-account"
                            placeholder="e.g. 123456789"
                            value={config.ad_account_id}
                            onChange={(e) => setConfig(prev => ({ ...prev, ad_account_id: e.target.value }))}
                            className="bg-black/40 border-white/10 focus:border-[#1C73E8] focus:ring-[#1C73E8] transition-all"
                        />
                        <p className="text-[10px] text-gray-500">
                            Found in the URL of your Campaign Manager (e.g., accounts/503xxxxxx).
                        </p>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="token" className="text-sm font-medium text-gray-300">
                            Access Token
                        </Label>
                        <div className="relative group">
                            <Input
                                id="token"
                                type={showToken ? "text" : "password"}
                                placeholder="Paste your developer token here"
                                value={config.access_token}
                                onChange={(e) => setConfig(prev => ({ ...prev, access_token: e.target.value }))}
                                className="bg-black/40 border-white/10 focus:border-[#1C73E8] focus:ring-[#1C73E8] transition-all pr-10"
                            />
                            <button
                                type="button"
                                onClick={() => setShowToken(!showToken)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                            >
                                {showToken ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                        <p className="text-[10px] text-gray-500">
                            Use a Permanent Access Token from LinkedIn Developer Portal.
                        </p>
                    </div>

                    <div className="pt-4">
                        <Button
                            onClick={handleSave}
                            disabled={loading}
                            className="w-full bg-[#1C73E8] hover:bg-[#1557B0] text-white font-medium py-6 transition-all"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Save className="w-4 h-4 mr-2" />
                                    Save Connection
                                </>
                            )}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 flex gap-4">
                <CheckCircle2 className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-blue-200/80">
                    <p className="font-semibold text-blue-300 mb-1">How this works</p>
                    <p>Once connected, our agents will be able to fetch real-time metrics (Impressions, CTR, Spend) from your account to generate the interactive dashboards in the "Results" tab.</p>
                </div>
            </div>
        </div>
    )
}
