"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronDown, Settings, Plus, Calendar as CalendarIcon, X } from "lucide-react";
import { useState } from "react";
import { NewOpportunityModal } from "./new-opportunity-modal";
import { CrmSettingsModal } from "./crm-settings-modal";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { CrmSettings } from "@/actions/crm/get-crm-settings";
import { CrmFilterState } from "./crm-container";

interface CrmFiltersProps {
    settings: CrmSettings;
    filters: CrmFilterState;
    setFilters: React.Dispatch<React.SetStateAction<CrmFilterState>>;
}

export function CrmFilters({ settings, filters, setFilters }: CrmFiltersProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);

    const updateFilter = (key: keyof CrmFilterState, value: any) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    const clearFilters = () => {
        setFilters({
            tab: filters.tab, // Keep active tab
            searchName: '',
            searchCompany: '',
            searchPhone: '',
            date: undefined,
            product: '',
            status: '',
            source: '',
            responsible: '',
            customField: ''
        });
    };

    const PRODUCTS = settings.products || [];
    const CUSTOM_OPTIONS = settings.custom_fields?.options || [];
    const customFieldName = settings.custom_fields?.name || "Custom Field";
    const STATUSES = settings.statuses || [];
    const SOURCES = settings.sources || [];
    const RESPONSIBLES = settings.responsibles || [];

    return (
        <div className="bg-[#111] p-3 rounded-lg border border-white/5 mb-4">
            <div className="flex flex-wrap items-center justify-between mb-3 gap-3">
                <div className="flex items-center gap-1 bg-[#0c0c0c] p-1 rounded-lg border border-white/5 overflow-x-auto max-w-full">
                    {(['active', 'earned', 'lost'] as const).map((tab) => (
                        <Button
                            key={tab}
                            variant="ghost"
                            onClick={() => updateFilter('tab', tab)}
                            className={`h-7 px-3 rounded-md text-[10px] font-medium transition-all whitespace-nowrap capitalize ${filters.tab === tab ? 'bg-[#1C73E8] text-white hover:bg-[#1557B0]' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                        >
                            {tab === 'active' ? 'Active Leads' : tab === 'earned' ? 'Leads Earned' : 'Lost Leads'}
                        </Button>
                    ))}
                </div>

                {/* Right Toolbar */}
                <div className="flex items-center gap-4 ml-auto">
                    <TooltipProvider>
                        <div className="flex items-center gap-1">
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        size="icon"
                                        variant="ghost"
                                        className="h-7 w-7 text-gray-400 hover:text-white hover:bg-white/10 flex-shrink-0"
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
                                        className="h-7 w-7 text-gray-400 hover:text-white hover:bg-white/10 flex-shrink-0"
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

            <div className="flex flex-wrap items-center gap-2">
                <Input
                    placeholder="Search name"
                    value={filters.searchName}
                    onChange={(e) => updateFilter('searchName', e.target.value)}
                    className="bg-[#1A1A1A] border-white/10 text-white placeholder:text-gray-500 h-9 text-xs min-w-[150px] flex-1 rounded-md focus:border-white/20 transition-colors"
                />
                <Input
                    placeholder="Search company"
                    value={filters.searchCompany}
                    onChange={(e) => updateFilter('searchCompany', e.target.value)}
                    className="bg-[#1A1A1A] border-white/10 text-white placeholder:text-gray-500 h-9 text-xs min-w-[150px] flex-1 rounded-md focus:border-white/20 transition-colors"
                />
                <Input
                    placeholder="Search phone"
                    value={filters.searchPhone}
                    onChange={(e) => updateFilter('searchPhone', e.target.value)}
                    className="bg-[#1A1A1A] border-white/10 text-white placeholder:text-gray-500 h-9 text-xs min-w-[150px] flex-1 rounded-md focus:border-white/20 transition-colors"
                />

                {/* Date Picker */}
                <Popover>
                    <PopoverTrigger asChild>
                        <button className={cn(
                            "h-9 px-3 rounded-md bg-[#1A1A1A] border border-white/10 flex items-center text-xs min-w-[150px] flex-1 justify-center hover:border-white/20 transition-colors cursor-pointer whitespace-nowrap gap-2",
                            !filters.date && "text-gray-400",
                            filters.date && "text-white"
                        )}>
                            <CalendarIcon size={14} />
                            {filters.date ? format(filters.date, "PPP") : <span>Pick a date</span>}
                        </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 bg-[#1A1A1A] border-white/10 text-white">
                        <Calendar
                            mode="single"
                            selected={filters.date}
                            onSelect={(date) => updateFilter('date', date)}
                            initialFocus
                        />
                        {filters.date && (
                            <div className="p-2 border-t border-white/10">
                                <Button
                                    variant="ghost"
                                    className="w-full h-8 text-xs text-red-400 hover:text-red-300 hover:bg-red-900/10"
                                    onClick={() => updateFilter('date', undefined)}
                                >
                                    Clear Date
                                </Button>
                            </div>
                        )}
                    </PopoverContent>
                </Popover>

                {/* Product Dropdown */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <div className="h-9 px-3 rounded-md bg-[#1A1A1A] border border-white/10 flex items-center text-xs text-gray-400 min-w-[150px] flex-1 justify-between hover:border-white/20 transition-colors cursor-pointer whitespace-nowrap">
                            <span className={filters.product ? "text-white" : ""}>
                                {filters.product || "Select Product"}
                            </span>
                            <ChevronDown size={12} className="opacity-50" />
                        </div>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-[200px] p-1 bg-[#1A1A1A] border-white/10 text-white">
                        <DropdownMenuItem
                            className="w-full text-left px-2 py-1.5 text-[12px] hover:bg-white/10 rounded-sm transition-colors text-gray-300 hover:text-white cursor-pointer"
                            onClick={() => updateFilter('product', '')}
                        >
                            All Products
                        </DropdownMenuItem>
                        {PRODUCTS.map((prod: any) => {
                            // Correctly handle product object
                            const label = prod.name;
                            return (
                                <DropdownMenuItem
                                    key={label}
                                    className="w-full text-left px-2 py-1.5 text-[12px] hover:bg-white/10 rounded-sm transition-colors text-gray-300 hover:text-white cursor-pointer"
                                    onClick={() => updateFilter('product', label)}
                                >
                                    {label}
                                </DropdownMenuItem>
                            );
                        })}
                    </DropdownMenuContent>
                </DropdownMenu>

                {/* Custom Field Dropdown */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <div className="h-9 px-3 rounded-md bg-[#1A1A1A] border border-white/10 flex items-center text-xs text-gray-400 min-w-[150px] flex-1 justify-between hover:border-white/20 transition-colors cursor-pointer whitespace-nowrap">
                            <span className={filters.customField ? "text-white" : ""}>
                                {filters.customField || `Select ${customFieldName}`}
                            </span>
                            <ChevronDown size={12} className="opacity-50" />
                        </div>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-[200px] p-1 bg-[#1A1A1A] border-white/10 text-white">
                        <DropdownMenuItem
                            className="w-full text-left px-2 py-1.5 text-[12px] hover:bg-white/10 rounded-sm transition-colors text-gray-300 hover:text-white cursor-pointer"
                            onClick={() => updateFilter('customField', '')}
                        >
                            All {customFieldName}s
                        </DropdownMenuItem>
                        {CUSTOM_OPTIONS.map((opt: any) => {
                            const label = typeof opt === 'string' ? opt : opt.label;
                            return (
                                <DropdownMenuItem
                                    key={label}
                                    className="w-full text-left px-2 py-1.5 text-[12px] hover:bg-white/10 rounded-sm transition-colors text-gray-300 hover:text-white cursor-pointer"
                                    onClick={() => updateFilter('customField', label)}
                                >
                                    {typeof opt !== 'string' && <span className={`w-2 h-2 rounded-full mr-2 ${opt.bg}`} />}
                                    {label}
                                </DropdownMenuItem>
                            );
                        })}
                    </DropdownMenuContent>
                </DropdownMenu>

                {/* Source Dropdown */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <div className="h-9 px-3 rounded-md bg-[#1A1A1A] border border-white/10 flex items-center text-xs text-gray-400 min-w-[150px] flex-1 justify-between hover:border-white/20 transition-colors cursor-pointer whitespace-nowrap">
                            <span className={filters.source ? "text-white" : ""}>
                                {filters.source || "Select Source"}
                            </span>
                            <ChevronDown size={12} className="opacity-50" />
                        </div>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-[200px] p-1 bg-[#1A1A1A] border-white/10 text-white">
                        <DropdownMenuItem
                            className="w-full text-left px-2 py-1.5 text-[12px] hover:bg-white/10 rounded-sm transition-colors text-gray-300 hover:text-white cursor-pointer"
                            onClick={() => updateFilter('source', '')}
                        >
                            All Sources
                        </DropdownMenuItem>
                        {SOURCES.map((source: any) => {
                            const label = typeof source === 'string' ? source : source.label;
                            return (
                                <DropdownMenuItem
                                    key={label}
                                    className="w-full text-left px-2 py-1.5 text-[12px] hover:bg-white/10 rounded-sm transition-colors text-gray-300 hover:text-white cursor-pointer"
                                    onClick={() => updateFilter('source', label)}
                                >
                                    {typeof source !== 'string' && <span className={`w-2 h-2 rounded-full mr-2 ${source.bg}`} />}
                                    {label}
                                </DropdownMenuItem>
                            );
                        })}
                    </DropdownMenuContent>
                </DropdownMenu>

                {/* Status Dropdown */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <div className="h-9 px-3 rounded-md bg-[#1A1A1A] border border-white/10 flex items-center text-xs text-gray-400 min-w-[150px] flex-1 justify-between hover:border-white/20 transition-colors cursor-pointer whitespace-nowrap">
                            <span className={filters.status ? "text-white" : ""}>
                                {filters.status || "Select Status"}
                            </span>
                            <ChevronDown size={12} className="opacity-50" />
                        </div>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-[200px] p-1 bg-[#1A1A1A] border-white/10 text-white">
                        <DropdownMenuItem
                            className="w-full text-left px-2 py-1.5 text-[12px] hover:bg-white/10 rounded-sm transition-colors text-gray-300 hover:text-white cursor-pointer"
                            onClick={() => updateFilter('status', '')}
                        >
                            All Statuses
                        </DropdownMenuItem>
                        {STATUSES.map((status: any) => (
                            <DropdownMenuItem
                                key={status.label}
                                className="w-full text-left px-2 py-1.5 text-[12px] hover:bg-white/10 rounded-sm transition-colors text-gray-300 hover:text-white cursor-pointer"
                                onClick={() => updateFilter('status', status.label)}
                            >
                                <span className={`w-2 h-2 rounded-full mr-2 ${status.bg}`} />
                                {status.label}
                            </DropdownMenuItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>

                {/* Responsible Dropdown */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <div className="h-9 px-3 rounded-md bg-[#1A1A1A] border border-white/10 flex items-center text-xs text-gray-400 min-w-[150px] flex-1 justify-between hover:border-white/20 transition-colors cursor-pointer whitespace-nowrap">
                            <span className={filters.responsible ? "text-white" : ""}>
                                {filters.responsible || "Select Responsible"}
                            </span>
                            <ChevronDown size={12} className="opacity-50" />
                        </div>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-[200px] p-1 bg-[#1A1A1A] border-white/10 text-white">
                        <DropdownMenuItem
                            className="w-full text-left px-2 py-1.5 text-[12px] hover:bg-white/10 rounded-sm transition-colors text-gray-300 hover:text-white cursor-pointer"
                            onClick={() => updateFilter('responsible', '')}
                        >
                            All Responsibles
                        </DropdownMenuItem>
                        {RESPONSIBLES.map((resp: any) => {
                            const label = typeof resp === 'string' ? resp : resp.label;
                            return (
                                <DropdownMenuItem
                                    key={label}
                                    className="w-full text-left px-2 py-1.5 text-[12px] hover:bg-white/10 rounded-sm transition-colors text-gray-300 hover:text-white cursor-pointer"
                                    onClick={() => updateFilter('responsible', label)}
                                >
                                    {typeof resp !== 'string' && <span className={`w-2 h-2 rounded-full mr-2 ${resp.bg}`} />}
                                    {label}
                                </DropdownMenuItem>
                            );
                        })}
                    </DropdownMenuContent>
                </DropdownMenu>

                <Button
                    variant="ghost"
                    onClick={clearFilters}
                    className="bg-[#1C73E8]/10 text-[#1C73E8] hover:bg-[#1C73E8]/20 h-9 px-6 ml-auto text-xs font-medium rounded-md whitespace-nowrap"
                >
                    Clean
                </Button>
            </div>

            <NewOpportunityModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                settings={settings}
            />

            <CrmSettingsModal
                isOpen={isSettingsOpen}
                onClose={() => setIsSettingsOpen(false)}
                settings={settings}
            />
        </div>
    );
}
