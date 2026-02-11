import { getCrmData } from "@/actions/crm/get-crm-data";
import { getCrmSettings } from "@/actions/crm/get-crm-settings";
import { CrmContainer } from "@/components/crm/crm-container";
import { Agent } from "@/lib/agents";

interface CrmDashboardProps {
    agent?: Agent;
    viewerProfile?: any;
}

export async function CrmDashboard({ agent, viewerProfile }: CrmDashboardProps) {
    const crmData = await getCrmData();
    const settings = await getCrmSettings();

    if (!crmData) {
        return <div className="text-white">Failed to load CRM data. Please try again.</div>;
    }

    const { leads, stats } = crmData;

    return (
        <CrmContainer
            initialLeads={leads}
            stats={stats}
            settings={settings}
            viewerProfile={viewerProfile}
        />
    );
}
