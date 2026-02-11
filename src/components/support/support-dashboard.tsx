"use client";

import { Agent } from "@/lib/agents";
import { SupportTabs } from "./support-tabs";
import { Training } from "@/actions/training-actions";

interface SupportDashboardProps {
    agent: Agent;
    trainings: Training[];
    companyId: string;
    viewerProfile?: any;
}

export function SupportDashboard({ agent, trainings, companyId, viewerProfile }: SupportDashboardProps) {
    return (
        <SupportTabs trainings={trainings} companyId={companyId} agent={agent} viewerProfile={viewerProfile} />
    );
}
