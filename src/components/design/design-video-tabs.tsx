"use client"

import { useState } from "react"
import { Palette, Layers, Video, Clapperboard } from "lucide-react"
import { DesignForm } from "./design-form"
import { DesignDeliverables } from "./design-deliverables"
import { VideoForm } from "./video-form"
import { VideoDeliverables } from "./video-deliverables"

export function DesignVideoTabs() {
    const [activeTab, setActiveTab] = useState<"design-request" | "design-deliverables" | "video-request" | "video-deliverables">("design-request")

    return (
        <div className="w-full flex flex-col gap-8">
            {/* Tabs Header */}
            <div className="bg-[#171717] border border-white/10 p-1 rounded-lg flex flex-wrap gap-1 w-fit">
                <button
                    onClick={() => setActiveTab("design-request")}
                    className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all ${activeTab === "design-request"
                            ? "bg-[#2a2a2a] text-white shadow-sm"
                            : "text-gray-400 hover:text-white hover:bg-white/5"
                        }`}
                >
                    <Palette size={16} />
                    Design Request
                </button>
                <button
                    onClick={() => setActiveTab("design-deliverables")}
                    className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all ${activeTab === "design-deliverables"
                            ? "bg-[#2a2a2a] text-white shadow-sm"
                            : "text-gray-400 hover:text-white hover:bg-white/5"
                        }`}
                >
                    <Layers size={16} />
                    Design Deliverables
                </button>
                <button
                    onClick={() => setActiveTab("video-request")}
                    className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all ${activeTab === "video-request"
                            ? "bg-[#2a2a2a] text-white shadow-sm"
                            : "text-gray-400 hover:text-white hover:bg-white/5"
                        }`}
                >
                    <Video size={16} />
                    Video Request
                </button>
                <button
                    onClick={() => setActiveTab("video-deliverables")}
                    className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all ${activeTab === "video-deliverables"
                            ? "bg-[#2a2a2a] text-white shadow-sm"
                            : "text-gray-400 hover:text-white hover:bg-white/5"
                        }`}
                >
                    <Clapperboard size={16} />
                    Video Deliverables
                </button>
            </div>

            {/* Tab Content */}
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                {activeTab === "design-request" && <DesignForm />}
                {activeTab === "design-deliverables" && <DesignDeliverables />}
                {activeTab === "video-request" && <VideoForm />}
                {activeTab === "video-deliverables" && <VideoDeliverables />}
            </div>
        </div>
    )
}
