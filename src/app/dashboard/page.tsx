import { AgentsOverview } from "@/components/dashboard/agents-overview"
import { DashboardHeader } from "@/components/dashboard-header"

export default function DashboardPage() {
    return (
        <div className="flex flex-col h-full bg-[#09090b]">
            <DashboardHeader />
            <div className="flex-1 overflow-y-auto">
                <AgentsOverview />
            </div>
        </div>
    )
}
