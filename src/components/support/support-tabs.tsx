"use client"

import { useState } from "react"
import { GraduationCap, Waypoints, BarChart3, Database, ListChecks } from "lucide-react"
import { KnowledgeBaseUpload } from "./knowledge-base-upload"
import { TrainingsList } from "./trainings-list"
import { FineTuneForm } from "./fine-tune-form"
import { ChannelsConfig } from "./channels-config"
import { Training } from "@/actions/training-actions"
import { QualificationParametersForm } from "./qualification-parameters-form"

interface SupportTabsProps {
    trainings: Training[]
    companyId: string
}

export function SupportTabs({ trainings, companyId }: SupportTabsProps) {
    const [activeTab, setActiveTab] = useState<"training" | "connectors" | "reports" | "parameters">("training")

    return (
        <div className="w-full flex flex-col gap-8">
            {/* Tabs Header */}
            <div className="bg-[#171717] border border-white/10 p-1 rounded-lg flex flex-wrap gap-1 w-fit">
                <button
                    onClick={() => setActiveTab("training")}
                    className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all ${activeTab === "training"
                        ? "bg-[#2a2a2a] text-white shadow-sm"
                        : "text-gray-400 hover:text-white hover:bg-white/5"
                        }`}
                >
                    <GraduationCap size={16} />
                    Trainings
                </button>
                <button
                    onClick={() => setActiveTab("parameters")}
                    className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all ${activeTab === "parameters"
                        ? "bg-[#2a2a2a] text-white shadow-sm"
                        : "text-gray-400 hover:text-white hover:bg-white/5"
                        }`}
                >
                    <ListChecks size={16} />
                    Parameters
                </button>
                <button
                    onClick={() => setActiveTab("connectors")}
                    className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all ${activeTab === "connectors"
                        ? "bg-[#2a2a2a] text-white shadow-sm"
                        : "text-gray-400 hover:text-white hover:bg-white/5"
                        }`}
                >
                    <Waypoints size={16} />
                    Connectors
                </button>
                <button
                    onClick={() => setActiveTab("reports")}
                    className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all ${activeTab === "reports"
                        ? "bg-[#2a2a2a] text-white shadow-sm"
                        : "text-gray-400 hover:text-white hover:bg-white/5"
                        }`}
                >
                    <BarChart3 size={16} />
                    Reports
                </button>
            </div>

            {/* Tab Content */}
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                {activeTab === "training" && (
                    <div className="flex flex-col gap-6 max-w-5xl mx-auto">
                        <KnowledgeBaseUpload companyId={companyId} />
                        <TrainingsList trainings={trainings} />
                        <FineTuneForm companyId={companyId} />
                    </div>
                )}

                {activeTab === "parameters" && (
                    <div className="flex flex-col gap-6 max-w-5xl">
                        <QualificationParametersForm />
                    </div>
                )}

                {activeTab === "connectors" && (
                    <div className="flex flex-col gap-6 max-w-5xl mx-auto">
                        <ChannelsConfig companyId={companyId} />
                    </div>
                )}

                {activeTab === "reports" && (
                    <div className="flex flex-col items-center justify-center h-[50vh] border border-dashed border-white/10 rounded-xl bg-white/5">
                        <BarChart3 size={48} className="text-gray-600 mb-4" />
                        <h3 className="text-xl font-bold text-white mb-2">Reports</h3>
                        <p className="text-gray-400">In progress...</p>
                    </div>
                )}
            </div>
        </div>
    )
}
