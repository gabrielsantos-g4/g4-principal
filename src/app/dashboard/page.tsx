import { AgentsOverview } from "@/components/dashboard/agents-overview"
import { DashboardHeader } from "@/components/dashboard-header"

export default function DashboardPage() {
    return (
        <div className="flex flex-col h-full bg-[#09090b]">
            <DashboardHeader />
            <AgentsOverview />
        </div>
    )
}
