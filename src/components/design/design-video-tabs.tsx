"use client"

import { useState } from "react"
import { Palette, Layers, Video, Clapperboard } from "lucide-react"
import { DesignForm } from "./design-form"
import { DesignDeliverables } from "./design-deliverables"
import { VideoForm } from "./video-form"
import { VideoDeliverables } from "./video-deliverables"
import { DesignHistoryList } from "./design-history-list"

export function DesignVideoTabs({ initialRequests = [], company, user, activeTab: propActiveTab }: { initialRequests?: any[], company?: any, user?: any, activeTab?: string }) {
    const activeTab = propActiveTab || "design-request"

    return (
        <div className="w-full flex flex-col gap-8">
            {/* Tab Content */}
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                {activeTab === "design-request" && (
                    <div className="space-y-12">
                        <DesignForm company={company} user={user} />
                    </div>
                )}
                {activeTab === "design-deliverables" && <DesignDeliverables requests={initialRequests} />}
                {activeTab === "video-request" && <VideoForm />}
                {activeTab === "video-deliverables" && <VideoDeliverables />}
            </div>
        </div>
    )
}
