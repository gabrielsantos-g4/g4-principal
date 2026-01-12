"use client";

import { Button } from "@/components/ui/button";
import { Settings, LogOut } from "lucide-react";
import { Agent } from "@/lib/agents";
import { useState } from "react";
import { NewOpportunityModal } from "./new-opportunity-modal";
import { CrmSettingsModal } from "./crm-settings-modal";

interface CrmHeaderProps {
    agent: Agent;
}

export function CrmHeader({ agent }: CrmHeaderProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);

    return (
        <div className="flex items-center justify-between bg-[#111] p-4 rounded-lg border border-white/5 mb-4">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-[#FFD700] shadow-[0_0_15px_rgba(255,215,0,0.3)]">
                    <img src={agent.avatar} alt={agent.name} className="w-full h-full object-cover" />
                </div>
                <div>
                    <h1 className="text-lg font-bold text-white leading-tight">{agent.role}</h1>
                    <p className="text-xs text-[#FFD700] font-medium leading-tight">{agent.name}</p>
                </div>
            </div>
            <div className="flex items-center gap-2">
                <Button className="bg-[#1C73E8] hover:bg-[#1557B0] text-white font-semibold h-8 text-xs px-4">
                    Full List
                </Button>
                <Button
                    variant="ghost"
                    className="text-gray-400 hover:text-white h-8 text-xs px-3"
                    onClick={() => setIsModalOpen(true)}
                >
                    New opportunity
                </Button>
                <Button
                    size="icon"
                    variant="ghost"
                    className="text-gray-400 hover:text-white h-8 w-8"
                    onClick={() => setIsSettingsOpen(true)}
                >
                    <Settings size={16} />
                </Button>
            </div>

            <NewOpportunityModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
            <CrmSettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
        </div>
    );
}
