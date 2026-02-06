"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { ICPForm } from "./icp-form"
import { ProspectsGrid } from "./prospects-grid"
import { LayoutList, Target, RefreshCw } from "lucide-react"

interface OutreachTabsProps {
    initialIcp: any
    initialProspects: any[] | null
    initialDemands?: any[]
    initialSavedIcps?: any[]
}

export function OutreachTabs({ initialIcp, initialProspects, initialDemands = [], initialSavedIcps = [] }: OutreachTabsProps) {
    const router = useRouter();
    const hasLeads = initialProspects && initialProspects.length > 0
    const [activeTab, setActiveTab] = useState<"targeting" | "leads">((initialIcp || hasLeads) ? "leads" : "targeting")
    const hasICP = !!initialIcp

    return (
        <div className="w-full mx-auto flex flex-col gap-8">
            <div className="flex items-center justify-between">
                {/* Tabs Header */}
                <div className="flex items-center gap-1 bg-[#171717] p-1 rounded-lg border border-white/10 w-fit">
                    <button
                        onClick={() => setActiveTab("targeting")}
                        className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === "targeting"
                            ? "bg-[#2a2a2a] text-white shadow-sm"
                            : "text-gray-400 hover:text-white hover:bg-white/5"
                            }`}
                    >
                        <Target size={16} />
                        Targeting (Demand)
                    </button>
                    <button
                        onClick={() => setActiveTab("leads")}
                        className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === "leads"
                            ? "bg-[#2a2a2a] text-white shadow-sm"
                            : "text-gray-400 hover:text-white hover:bg-white/5"
                            }`}
                    >
                        <LayoutList size={16} />
                        Leads List
                    </button>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => {
                            toast.promise(new Promise((resolve) => {
                                router.refresh();
                                setTimeout(resolve, 1000); // Fake delay for UX perception
                            }), {
                                loading: 'Refreshing...',
                                success: 'List updated',
                                error: 'Failed to refresh'
                            });
                        }}
                        className="p-1.5 hover:bg-white/10 rounded-md text-gray-400 hover:text-white transition-colors"
                        title="Refresh list"
                    >
                        <RefreshCw size={16} />
                    </button>
                </div>
            </div>

            {/* Tab Content */}
            <div className="flex-1">
                {activeTab === "targeting" ? (
                    <ICPForm
                        key={hasICP ? 'edit' : 'create'}
                        initialData={initialIcp}
                        initialDemands={initialDemands}
                        initialSavedIcps={initialSavedIcps}
                    />
                ) : (
                    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                        {(hasICP || hasLeads) ? (
                            <ProspectsGrid data={initialProspects || []} />
                        ) : (
                            <div className="flex flex-col items-center justify-center p-12 text-center border border-dashed border-white/10 rounded-xl bg-white/5">
                                <Target size={48} className="text-gray-600 mb-4" />
                                <h3 className="text-xl font-bold text-white mb-2">No leads generated yet</h3>
                                <p className="text-gray-400 max-w-md mb-6">
                                    Define your targeting criteria in the "Targeting" tab first to start generating leads.
                                </p>
                                <button
                                    onClick={() => setActiveTab("targeting")}
                                    className="bg-[#1C73E8] text-white px-6 py-2 rounded-lg hover:bg-[#1557b0] transition-colors font-medium"
                                >
                                    Go to Targeting
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}
