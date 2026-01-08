import { DashboardHeader } from '@/components/dashboard-header'
import { RightSidebar } from '@/components/right-sidebar'
import { DashboardClient } from '@/components/dashboard/dashboard-client'

export default function PaidSocialPage() {
    return (
        <div className="h-screen bg-black text-white font-sans flex flex-col overflow-hidden">
            {/* Top Bar */}
            <DashboardHeader />

            {/* Main Content Body - Flex Row */}
            <div className="flex flex-1 min-h-0">
                {/* Left Content (Legacy Dashboard) - Scrollable */}
                <div className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar bg-black p-6">
                    {/* Wrapping the legacy Dashboard in a dark container, might need deeper CSS tweaks in DashboardClient */}
                    <DashboardClient />
                </div>

                {/* Right Sidebar */}
                <RightSidebar
                    agent={{
                        name: 'Paid Social Agent',
                        avatarUrl: 'https://i.pinimg.com/736x/30/66/80/30668098a6571721adaccd7de8b0e4df.jpg',
                        role: 'Performance Analyst'
                    }}
                />
            </div>
        </div>
    )
}
