import { Agent } from "@/lib/agents";
import { CrmHeader } from "./crm-header";
import { CrmStats } from "./crm-stats";
import { CrmFilters } from "./crm-filters";
import { CrmTable } from "./crm-table";

interface CrmDashboardProps {
    agent: Agent;
}

export function CrmDashboard({ agent }: CrmDashboardProps) {
    return (
        <div className="flex-1 overflow-y-auto bg-black p-4 lg:p-6">
            <div className="max-w-[1600px] mx-auto">
                <CrmHeader agent={agent} />
                <CrmStats />
                <CrmFilters />
                <CrmTable />
            </div>
        </div>
    );
}
