"use client"

import { DashboardHeader } from "@/components/dashboard-header"
import { MobileDashboardLayout } from "@/components/mobile-dashboard-layout"
import { RightSidebar } from "@/components/right-sidebar"
import { OmnichannelInbox } from "@/components/support/omnichannel/omnichannel-inbox"
import { Badge } from "@/components/ui/badge"
import { User } from "lucide-react"

interface UserInboxDashboardProps {
    user: any // The loged in user
    targetUser: {
        id: string
        name: string
        role: string
        avatar_url: string
    }
    companyId: string
    agent?: any // Optional AI agent context
    crmSettings?: any
}

export function UserInboxDashboard({ user, targetUser, companyId, agent, crmSettings }: UserInboxDashboardProps) {
    const isSelf = user.id === targetUser.id

    return (
        <div className="flex-1 min-h-0 bg-black text-white font-sans flex flex-col overflow-hidden">
            <DashboardHeader />
            <MobileDashboardLayout
                rightSidebar={
                    <RightSidebar
                        userId={user?.id}
                        companyId={companyId}
                        userName={(user?.user_metadata?.full_name || user?.user_metadata?.name || 'there').split(' ')[0]}
                        agent={agent || {
                            name: targetUser.name,
                            avatarUrl: targetUser.avatar_url,
                            role: targetUser.role,
                            slug: `user-${targetUser.id}`,
                            description: `Inbox for human specialist ${targetUser.name}`
                        }}
                    />
                }
            >
                <div className="flex-1 flex flex-col min-w-0 h-full p-4">
                    <div className="flex-1 bg-[#111] rounded-xl border border-white/10 overflow-hidden shadow-2xl flex flex-col">
                        <OmnichannelInbox
                            targetUserId={targetUser.id}
                            targetUser={targetUser}
                            crmSettings={crmSettings}
                        />
                    </div>
                </div>
            </MobileDashboardLayout>
        </div>
    )
}
