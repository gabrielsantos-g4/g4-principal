import { DashboardHeader } from "@/components/dashboard-header"
import { MessengerTabs } from "@/components/messenger/messenger-tabs"

export default function MessengerLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="h-screen bg-black text-white font-sans flex flex-col overflow-hidden">
            {/* Top Bar */}
            <DashboardHeader />

            {/* Messenger Tabs + Content Body */}
            <div className="flex flex-1 flex-col min-h-0 overflow-hidden">
                <MessengerTabs />

                <div className="flex-1 overflow-y-auto custom-scrollbar bg-black">
                    {children}
                </div>
            </div>
        </div>
    )
}
