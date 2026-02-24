"use client"

import { MobileDashboardLayout } from "@/components/mobile-dashboard-layout"
import { RightSidebar } from "@/components/right-sidebar"
import { OmnichannelInbox } from "@/components/support/omnichannel/omnichannel-inbox"
import { Badge } from "@/components/ui/badge"
import { User } from "lucide-react"
import { useRouter } from "next/navigation"

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
    viewerProfile?: any
}

export function UserInboxDashboard({ user, targetUser, companyId, agent, crmSettings, viewerProfile }: UserInboxDashboardProps) {
    const router = useRouter()
    const isSelf = user.id === targetUser.id
    const hasAccess = viewerProfile?.role === 'admin' || viewerProfile?.has_messaging_access

    // MessageSquare icon for restricted state
    const { MessageSquare } = require("lucide-react")

    const handleInboxChange = (userId: string) => {
        // Navigate to the selected user's inbox
        router.push(`/dashboard/user-${userId}`)
    }

    return (
        <div className="flex-1 min-h-0 bg-black text-white font-sans flex flex-col overflow-hidden">
            <MobileDashboardLayout
                withCard={true}
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
                disableMainScroll={true}
            >
                <OmnichannelInbox
                    targetUserId={targetUser.id}
                    targetUser={targetUser}
                    crmSettings={crmSettings}
                    viewerProfile={viewerProfile}
                    onInboxChange={handleInboxChange}
                />
            </MobileDashboardLayout>
        </div>
    )
}
