import { DashboardHeader } from "@/components/dashboard-header"
import { MessengerTabs } from "@/components/messenger/messenger-tabs"
import { MobileDashboardLayout } from "@/components/mobile-dashboard-layout"
import { RightSidebar } from "@/components/right-sidebar"
import { AGENTS } from "@/lib/agents"
import { createClient } from "@/lib/supabase"
import { MessengerMasterTabs } from "@/components/messenger/messenger-master-tabs"


export default async function MessengerLayout({ children }: { children: React.ReactNode }) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const agent = AGENTS.find(a => a.slug === 'messenger')

    if (!agent) return null

    return (
        <div className="h-screen bg-black text-white font-sans flex flex-col overflow-hidden">
            {/* Top Bar */}
            <DashboardHeader />

            {/* Messenger Tabs + Content Body */}
            <MobileDashboardLayout
                rightSidebar={
                    <RightSidebar
                        key="messenger"
                        userId={user?.id}
                        userName={(user?.user_metadata?.full_name || user?.user_metadata?.name || 'there').split(' ')[0]}
                        agent={{
                            name: agent.name,
                            avatarUrl: agent.avatar,
                            role: agent.role,
                            externalUrl: agent.externalUrl,
                            slug: agent.slug,
                            description: agent.description
                        }}
                    />
                }
            >
                <MessengerMasterTabs>
                    <div className="flex flex-1 flex-col min-h-0 overflow-hidden h-full">
                        <MessengerTabs />

                        <div className="flex-1 overflow-y-auto custom-scrollbar bg-black">
                            {children}
                        </div>
                    </div>
                </MessengerMasterTabs>
            </MobileDashboardLayout>
        </div>
    )
}
