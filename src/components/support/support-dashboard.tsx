"use client";

import { Agent } from "@/lib/agents";
import { SupportHeader } from "./support-header";
import { KnowledgeBaseUpload } from "./knowledge-base-upload";
import { TrainingsList } from "./trainings-list";
import { FineTuneForm } from "./fine-tune-form";
import { ChannelsConfig } from "./channels-config";

interface SupportDashboardProps {
    agent: Agent;
}

export function SupportDashboard({ agent }: SupportDashboardProps) {
    return (
        <div className="flex-1 overflow-y-auto bg-black p-4 lg:p-6">
            <div className="max-w-[1600px] mx-auto">
                <div className="flex flex-col gap-6">
                    <KnowledgeBaseUpload />
                    <TrainingsList />
                    <FineTuneForm />
                    <ChannelsConfig />
                </div>
            </div>
        </div>
    );
}
