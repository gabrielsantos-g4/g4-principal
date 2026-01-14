"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronDown, Settings, Plus } from "lucide-react";
import { useState } from "react";
import { NewOpportunityModal } from "./new-opportunity-modal";
import { CrmSettingsModal } from "./crm-settings-modal";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

export function CrmFilters() {
    const [activeTab, setActiveTab] = useState<'active' | 'earned' | 'lost'>('active');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);

    return (
        <div className="bg-[#111] p-3 rounded-lg border border-white/5 mb-4">
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-1 bg-[#0c0c0c] p-1 rounded-lg border border-white/5">
                    <Button
                        variant="ghost"
                        onClick={() => setActiveTab('active')}
                        className={`h-7 px-3 rounded-md text-[10px] font-medium transition-all ${activeTab === 'active' ? 'bg-[#1C73E8] text-white hover:bg-[#1557B0]' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                    >
                        Active Leads
                    </Button>
                    <Button
                        variant="ghost"
                        onClick={() => setActiveTab('earned')}
                        className={`h-7 px-3 rounded-md text-[10px] font-medium transition-all ${activeTab === 'earned' ? 'bg-[#1C73E8] text-white hover:bg-[#1557B0]' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                    >
                        Leads Earned
                    </Button>
                    <Button
                        variant="ghost"
                        onClick={() => setActiveTab('lost')}
                        className={`h-7 px-3 rounded-md text-[10px] font-medium transition-all ${activeTab === 'lost' ? 'bg-[#1C73E8] text-white hover:bg-[#1557B0]' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                    >
                        Lost Leads
                    </Button>
                </div>

                {/* Right Toolbar */}
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1 text-gray-400 px-3 cursor-pointer hover:text-white transition-colors border-r border-white/10 pr-4 mr-2">
                        <span className="text-[10px] font-semibold uppercase tracking-wide">Select a Status</span>
                        <ChevronDown size={12} />
                    </div>

                    <TooltipProvider>
                        <div className="flex items-center gap-1">


                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        size="icon"
                                        variant="ghost"
                                        className="h-7 w-7 text-gray-400 hover:text-white hover:bg-white/10"
                                        onClick={() => setIsModalOpen(true)}
                                    >
                                        <Plus size={16} />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>New opportunity</p>
                                </TooltipContent>
                            </Tooltip>

                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        size="icon"
                                        variant="ghost"
                                        className="h-7 w-7 text-gray-400 hover:text-white hover:bg-white/10"
                                        onClick={() => setIsSettingsOpen(true)}
                                    >
                                        <Settings size={16} />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>Settings</p>
                                </TooltipContent>
                            </Tooltip>
                        </div>
                    </TooltipProvider>
                </div>
            </div>

            <div className="flex items-center gap-2">
                <Input
                    placeholder="Search name"
                    className="bg-[#1A1A1A] border-white/10 text-white placeholder:text-gray-500 h-9 text-xs w-40 rounded-md focus:border-white/20 transition-colors"
                />
                <Input
                    placeholder="Search company"
                    className="bg-[#1A1A1A] border-white/10 text-white placeholder:text-gray-500 h-9 text-xs w-40 rounded-md focus:border-white/20 transition-colors"
                />
                <Input
                    placeholder="Search phone"
                    className="bg-[#1A1A1A] border-white/10 text-white placeholder:text-gray-500 h-9 text-xs w-40 rounded-md focus:border-white/20 transition-colors"
                />

                {/* Date Mock */}
                <div className="h-9 px-3 rounded-md bg-[#1A1A1A] border border-white/10 flex items-center text-xs text-gray-400 w-28 justify-center hover:border-white/20 transition-colors cursor-pointer">
                    1/10/2026
                </div>

                {/* Product Mock */}
                <div className="h-9 px-3 rounded-md bg-[#1A1A1A] border border-white/10 flex items-center text-xs text-gray-400 min-w-32 justify-between hover:border-white/20 transition-colors cursor-pointer">
                    <span>Select Product</span>
                    <ChevronDown size={12} className="opacity-50" />
                </div>

                <Button variant="ghost" className="bg-[#1C73E8]/10 text-[#1C73E8] hover:bg-[#1C73E8]/20 h-9 px-6 ml-auto text-xs font-medium rounded-md">
                    Clean
                </Button>
            </div>

            <NewOpportunityModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
            <CrmSettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
        </div>
    );
}
