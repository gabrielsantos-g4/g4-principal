import { useState } from "react"
import { GraduationCap, Waypoints, BarChart3, Database, ListChecks, MessageSquare, AlertTriangle, Check, Users, Clock, ArrowUpRight, Activity } from "lucide-react"
import { KnowledgeBaseUpload } from "./knowledge-base-upload"
import { TrainingsList } from "./trainings-list"
import { FineTuneForm } from "./fine-tune-form"
import { ChannelsConfig } from "./channels-config"
import { Training } from "@/actions/training-actions"
import { QualificationParametersForm } from "./qualification-parameters-form"
import { OmnichannelInbox } from "./omnichannel/omnichannel-inbox"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Calendar } from "lucide-react"

import { Agent } from "@/lib/agents"

interface SupportTabsProps {
    trainings: Training[]
    companyId: string
    agent?: Agent
    viewerProfile?: any
}

export function SupportTabs({ trainings, companyId, agent, viewerProfile }: SupportTabsProps) {
    const [activeTab, setActiveTab] = useState<"training" | "parameters" | "connectors" | "omnichannel" | "reports">("omnichannel")
    const [timeFrame, setTimeFrame] = useState("30")

    return (
        <div className="w-full flex flex-col gap-8">
            {/* Tabs Header */}
            <div className="bg-[#171717] border border-white/10 p-1 rounded-lg flex flex-wrap gap-1 w-fit">
                <button
                    onClick={() => setActiveTab("omnichannel")}
                    className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all ${activeTab === "omnichannel"
                        ? "bg-[#2a2a2a] text-white shadow-sm"
                        : "text-gray-400 hover:text-white hover:bg-white/5"
                        }`}
                >
                    <MessageSquare size={16} />
                    Chats
                </button>
                <button
                    onClick={() => setActiveTab("training")}
                    className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all ${activeTab === "training"
                        ? "bg-[#2a2a2a] text-white shadow-sm"
                        : "text-gray-400 hover:text-white hover:bg-white/5"
                        }`}
                >
                    <GraduationCap size={16} />
                    Training
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
                    Connections
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
                {activeTab === "omnichannel" && (
                    <div className="flex flex-col gap-6 w-full">
                        <OmnichannelInbox
                            targetUser={agent ? {
                                id: agent.id,
                                name: agent.name,
                                role: agent.role,
                                avatar_url: agent.avatar
                            } : undefined}
                            targetUserId={agent?.id}
                            viewerProfile={viewerProfile}
                        />
                    </div>
                )}

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
                    <div className="flex flex-col gap-6">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-bold text-white">Live Metrics</h3>
                            <div className="w-48">
                                <Select value={timeFrame} onValueChange={setTimeFrame}>
                                    <SelectTrigger className="bg-[#171717] border-white/10 text-white">
                                        <div className="flex items-center gap-2">
                                            <Calendar size={14} className="text-slate-400" />
                                            <SelectValue placeholder="Select period" />
                                        </div>
                                    </SelectTrigger>
                                    <SelectContent className="bg-[#171717] border-white/10 text-white">
                                        <SelectItem value="7">Last 7 days</SelectItem>
                                        <SelectItem value="30">Last 30 days</SelectItem>
                                        <SelectItem value="90">Last 90 days</SelectItem>
                                        <SelectItem value="all">All time</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="bg-[#171717] border border-white/10 p-6 rounded-xl">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
                                        <MessageSquare size={20} />
                                    </div>
                                    <span className="text-[10px] font-bold text-green-500 uppercase tracking-wider bg-green-500/10 px-2 py-1 rounded">Live</span>
                                </div>
                                <h4 className="text-slate-400 text-sm font-medium mb-1">Avg. Response Time</h4>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-2xl font-bold text-white">1.2m</span>
                                    <span className="text-[11px] text-green-500">↓ 15%</span>
                                </div>
                            </div>

                            <div className="bg-[#171717] border border-white/10 p-6 rounded-xl">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="p-2 bg-yellow-500/10 rounded-lg text-yellow-400">
                                        <Users size={20} />
                                    </div>
                                    <span className="text-[10px] font-bold text-green-500 uppercase tracking-wider bg-green-500/10 px-2 py-1 rounded">Live</span>
                                </div>
                                <h4 className="text-slate-400 text-sm font-medium mb-1">Total Conversations</h4>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-2xl font-bold text-white">482</span>
                                    <span className="text-[11px] text-green-500">↑ 12%</span>
                                </div>
                            </div>

                            <div className="bg-[#171717] border border-white/10 p-6 rounded-xl">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="p-2 bg-red-500/10 rounded-lg text-red-400">
                                        <AlertTriangle size={20} />
                                    </div>
                                    <span className="text-[10px] font-bold text-green-500 uppercase tracking-wider bg-green-500/10 px-2 py-1 rounded">Live</span>
                                </div>
                                <h4 className="text-slate-400 text-sm font-medium mb-1">N.Q. Leads</h4>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-2xl font-bold text-white">64</span>
                                    <span className="text-[11px] text-slate-500">vs 58</span>
                                </div>
                            </div>

                            <div className="bg-[#171717] border border-white/10 p-6 rounded-xl">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="p-2 bg-purple-500/10 rounded-lg text-purple-400">
                                        <Check size={20} />
                                    </div>
                                    <span className="text-[10px] font-bold text-green-500 uppercase tracking-wider bg-green-500/10 px-2 py-1 rounded">Live</span>
                                </div>
                                <h4 className="text-slate-400 text-sm font-medium mb-1">MQL</h4>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-2xl font-bold text-white">42</span>
                                    <span className="text-[11px] text-green-500">↑ 8%</span>
                                </div>
                            </div>

                            <div className="bg-[#171717] border border-white/10 p-6 rounded-xl">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="p-2 bg-green-500/10 rounded-lg text-green-400">
                                        <Waypoints size={20} />
                                    </div>
                                    <span className="text-[10px] font-bold text-green-500 uppercase tracking-wider bg-green-500/10 px-2 py-1 rounded">Live</span>
                                </div>
                                <h4 className="text-slate-400 text-sm font-medium mb-1">SQL</h4>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-2xl font-bold text-white">22</span>
                                    <span className="text-[11px] text-green-500">↑ 12%</span>
                                </div>
                            </div>

                            <div className="bg-[#171717] border border-white/10 p-6 rounded-xl">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="p-2 bg-cyan-500/10 rounded-lg text-cyan-400">
                                        <ArrowUpRight size={20} />
                                    </div>
                                    <span className="text-[10px] font-bold text-green-500 uppercase tracking-wider bg-green-500/10 px-2 py-1 rounded">Live</span>
                                </div>
                                <h4 className="text-slate-400 text-sm font-medium mb-1">Conversion Rate</h4>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-2xl font-bold text-white">24.5%</span>
                                    <span className="text-[11px] text-green-500">↑ 4%</span>
                                </div>
                            </div>

                            <div className="bg-[#171717] border border-white/10 p-6 rounded-xl">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="p-2 bg-orange-500/10 rounded-lg text-orange-400">
                                        <Clock size={20} />
                                    </div>
                                    <span className="text-[10px] font-bold text-green-500 uppercase tracking-wider bg-green-500/10 px-2 py-1 rounded">Live</span>
                                </div>
                                <h4 className="text-slate-400 text-sm font-medium mb-1">Avg. Resolution Time</h4>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-2xl font-bold text-white">4.5m</span>
                                    <span className="text-[11px] text-green-500">↓ 8%</span>
                                </div>
                            </div>

                            <div className="bg-[#171717] border border-white/10 p-6 rounded-xl">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400">
                                        <Activity size={20} />
                                    </div>
                                    <span className="text-[10px] font-bold text-green-500 uppercase tracking-wider bg-green-500/10 px-2 py-1 rounded">Live</span>
                                </div>
                                <h4 className="text-slate-400 text-sm font-medium mb-1">Handover Rate</h4>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-2xl font-bold text-white">12.8%</span>
                                    <span className="text-[11px] text-slate-500">vs 11.2%</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
