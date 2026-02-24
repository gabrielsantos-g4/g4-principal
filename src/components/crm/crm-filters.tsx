"use client";

import { Button } from "@/components/ui/button";
import { ChevronDown, Settings, Plus, Calendar as CalendarIcon, RefreshCw, BarChart3, ListFilter, Search, Users, DollarSign, AlertCircle, CalendarClock, MessageSquare, X } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { NewOpportunityModal } from "./new-opportunity-modal";
import { CrmSettingsModal } from "./crm-settings-modal";
import { CrmReportsModal } from "./crm-reports-modal";
import { GlobalInboxModal } from "./global-inbox-modal";
import { PipelineHealthIndicator } from "./pipeline-health-indicator";
import { PipelineHealthSummaryModal } from "./pipeline-health-summary-modal";
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
    DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";

import { CrmSettings, TagItem } from "@/actions/crm/get-crm-settings";
import { CrmFilterState } from "./crm-container";


function FilterDatePicker({ label, value, onSelect, placeholder = "Select date", align = "start" }: {
    label: string,
    value: Date | undefined,
    onSelect: (date: Date | undefined) => void,
    placeholder?: string,
    align?: "start" | "center" | "end"
}) {
    const [open, setOpen] = useState(false);

    return (
        <div className="space-y-1">
            <span className="text-[10px] text-gray-400">{label}</span>
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <button className={cn(
                        "h-8 px-2.5 rounded-md bg-[#1A1A1A] border border-white/10 flex items-center text-xs justify-between hover:border-white/20 transition-colors w-full",
                        value && "text-white border-[#1C73E8] bg-[#1C73E8]/10"
                    )}>
                        <span className={cn(value ? "font-medium" : "text-gray-400")}>
                            {value ? format(value, "dd/MM/yy") : placeholder}
                        </span>
                        <CalendarIcon size={12} className={value ? "text-[#1C73E8]" : "text-gray-400"} />
                    </button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-[#1A1A1A] border-white/10 text-white z-[9999]" align={align}>
                    <Calendar
                        mode="single"
                        selected={value}
                        onSelect={(date) => {
                            onSelect(date);
                            setOpen(false);
                        }}
                        initialFocus
                    />
                </PopoverContent>
            </Popover>
        </div>
    );
}

interface CrmFiltersProps {
    settings: CrmSettings;
    filters: CrmFilterState;
    setFilters: React.Dispatch<React.SetStateAction<CrmFilterState>>;
    leads: Record<string, unknown>[];
    headerStats: {
        totalLeads: number;
        pipelineValue: number;
        qualification: {
            mql: number;
            sql: number;
            not_qualified: number;
        };
        contacts: {
            overdue: number;
            today: number;
            tomorrow: number;
        };
    };
    viewerProfile?: {
        name?: string;
        active_agents?: string[];
    };
}

export function CrmFilters({ settings, filters, setFilters, leads, headerStats, viewerProfile }: CrmFiltersProps) {
    const router = useRouter();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isReportsOpen, setIsReportsOpen] = useState(false);
    const [isGlobalInboxOpen, setIsGlobalInboxOpen] = useState(false);
    const [isPipelineHealthOpen, setIsPipelineHealthOpen] = useState(false);

    const updateFilter = <K extends keyof CrmFilterState>(key: K, value: CrmFilterState[K]) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    const clearFilters = () => {
        setFilters({
            tab: filters.tab, // Keep active tab
            searchGlobal: '',
            searchName: '',
            searchCompany: '',
            searchPhone: '',
            dateRange: undefined,
            createdAtRange: undefined,


            product: [],
            status: '',

            source: '',
            responsible: '',
            customField: '',
            contactFilter: null,
            qualification: ''
        });
    };

    const PRODUCTS = settings.products || [];
    const CUSTOM_OPTIONS = settings.custom_fields?.options || [];
    const customFieldName = settings.custom_fields?.name || "Custom Field";
    const STATUSES = settings.statuses || [];
    const SOURCES = settings.sources || [];
    const RESPONSIBLES = [...(settings.responsibles || [])];

    if (viewerProfile?.active_agents?.includes('customer-jess') && !RESPONSIBLES.some((r: string | TagItem) => (typeof r === 'string' ? r : (r as TagItem).label) === 'Jess')) {
        RESPONSIBLES.push({ label: 'Jess', bg: 'bg-purple-900', text: 'text-purple-100' });
    }

    return (
        <TooltipProvider>
            <div className="@container flex items-center justify-between gap-2 bg-[#111] p-2 rounded-lg border border-white/5 w-full">
                {/* Left: Tabs */}
                <div className="flex items-center gap-1 bg-[#0c0c0c] p-1 rounded-lg border border-white/5 shrink-0">
                    {(['active', 'earned', 'lost'] as const).map((tab) => (
                        <Button
                            key={tab}
                            variant="ghost"
                            onClick={() => updateFilter('tab', tab)}
                            className={`h-7 px-3 rounded-md text-[10px] font-medium transition-all whitespace-nowrap capitalize ${filters.tab === tab ? 'bg-[#1C73E8] text-white hover:bg-[#1557B0]' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                        >
                            {tab === 'active' ? 'Active' : tab === 'earned' ? 'Won' : 'Lost'}
                        </Button>
                    ))}
                </div>

                {/* Center: Search Input */}
                <div className="flex-1 flex items-center gap-2 min-w-0 max-w-[300px] mx-4">
                    <div className="relative w-full">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-500" />
                        <input
                            type="text"
                            placeholder="Search by name, company, or phone..."
                            value={filters.searchGlobal || ''}
                            onChange={(e) => {
                                updateFilter('searchGlobal', e.target.value);
                            }}
                            className={cn(
                                "w-full h-8 pl-9 pr-3 rounded-md border text-xs transition-all",
                                "bg-[#1A1A1A] border-white/10 text-white placeholder:text-gray-500",
                                "focus:outline-none focus:border-[#1C73E8] focus:ring-1 focus:ring-[#1C73E8]/20",
                                filters.searchGlobal && "border-[#1C73E8] bg-[#1C73E8]/5"
                            )}
                        />
                    </div>
                </div>

                {/* Right: Stats, Date, Filters, Actions */}
                <div className="flex items-center gap-1.5 shrink-0 ml-auto">
                    {/* Stats Group 1: Qualification (Hidden on small screens) */}
                    <div className="hidden @[900px]:flex items-center gap-1 bg-[#0c0c0c] p-1 rounded-lg border border-white/5">
                        <div className="flex items-center -space-x-px">
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <button
                                        onClick={() => updateFilter('qualification', '')}
                                        className={cn(
                                            "flex items-center gap-1.5 px-2 py-1 rounded-l transition-colors",
                                            !filters.qualification ? "bg-white/10 text-white" : "text-gray-500 hover:text-white hover:bg-white/5"
                                        )}
                                    >
                                        <Users size={12} />
                                        <span className="text-[10px] font-bold">{headerStats.totalLeads}</span>
                                    </button>
                                </TooltipTrigger>
                                <TooltipContent side="bottom" sideOffset={-5} avoidCollisions={false}>All Leads</TooltipContent>
                            </Tooltip>

                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <button
                                        onClick={() => updateFilter('qualification', filters.qualification === 'mql' ? '' : 'mql')}
                                        className={cn(
                                            "flex items-center gap-1 px-2 py-1 transition-colors border-x border-white/5",
                                            filters.qualification === 'mql' ? "bg-blue-500 font-bold text-white" : "text-gray-500 hover:text-blue-400"
                                        )}
                                    >
                                        <span className="text-[10px] opacity-80">{headerStats.qualification.mql}</span>
                                    </button>
                                </TooltipTrigger>
                                <TooltipContent side="bottom" sideOffset={-5} avoidCollisions={false}>MQL</TooltipContent>
                            </Tooltip>

                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <button
                                        onClick={() => updateFilter('qualification', filters.qualification === 'sql' ? '' : 'sql')}
                                        className={cn(
                                            "flex items-center gap-1 px-2 py-1 transition-colors border-r border-white/5",
                                            filters.qualification === 'sql' ? "bg-emerald-500 font-bold text-white" : "text-gray-500 hover:text-emerald-400"
                                        )}
                                    >
                                        <span className="text-[10px] opacity-80">{headerStats.qualification.sql}</span>
                                    </button>
                                </TooltipTrigger>
                                <TooltipContent side="bottom" sideOffset={-5} avoidCollisions={false}>SQL</TooltipContent>
                            </Tooltip>

                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <button
                                        onClick={() => updateFilter('qualification', filters.qualification === 'nq' ? '' : 'nq')}
                                        className={cn(
                                            "flex items-center gap-1 px-2 py-1 rounded-r transition-colors",
                                            filters.qualification === 'nq' ? "bg-red-500 font-bold text-white" : "text-gray-500 hover:text-red-400"
                                        )}
                                    >
                                        <span className="text-[10px] opacity-80">{headerStats.qualification.not_qualified}</span>
                                    </button>
                                </TooltipTrigger>
                                <TooltipContent side="bottom" sideOffset={-5} avoidCollisions={false}>NQ</TooltipContent>
                            </Tooltip>
                        </div>

                        <div className="w-px h-3 bg-white/10 shrink-0 mx-1" />

                        <div className="flex items-center gap-1 px-1 pr-2">
                            <DollarSign size={12} className="text-emerald-500" />
                            <span className="text-[11px] font-bold text-white whitespace-nowrap">
                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(headerStats.pipelineValue)}
                            </span>
                        </div>
                    </div>

                    {/* Stats Group 2: Contacts (Hidden on medium screens) */}
                    <div className="hidden @[800px]:flex items-center gap-1 bg-[#0c0c0c] p-1 rounded-lg border border-white/5">
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <button
                                    onClick={() => updateFilter('contactFilter', filters.contactFilter === 'overdue' ? null : 'overdue')}
                                    className={cn(
                                        "flex items-center gap-1 px-1.5 py-0.5 rounded transition-colors",
                                        filters.contactFilter === 'overdue' ? "bg-red-500 text-white" : "text-red-400 hover:bg-red-500/10"
                                    )}>
                                    <AlertCircle size={12} />
                                    <span className="text-[10px] font-bold">{headerStats.contacts.overdue}</span>
                                </button>
                            </TooltipTrigger>
                            <TooltipContent side="bottom" sideOffset={-5} avoidCollisions={false}>Overdue</TooltipContent>
                        </Tooltip>

                        <Tooltip>
                            <TooltipTrigger asChild>
                                <button
                                    onClick={() => updateFilter('contactFilter', filters.contactFilter === 'today' ? null : 'today')}
                                    className={cn(
                                        "flex items-center gap-1 px-1.5 py-0.5 rounded transition-colors",
                                        filters.contactFilter === 'today' ? "bg-amber-500 text-white" : "text-amber-400 hover:bg-amber-500/10"
                                    )}>
                                    <CalendarIcon size={12} />
                                    <span className="text-[10px] font-bold">{headerStats.contacts.today}</span>
                                </button>
                            </TooltipTrigger>
                            <TooltipContent side="bottom" sideOffset={-5} avoidCollisions={false}>Today</TooltipContent>
                        </Tooltip>

                        <Tooltip>
                            <TooltipTrigger asChild>
                                <button
                                    onClick={() => updateFilter('contactFilter', filters.contactFilter === 'tomorrow' ? null : 'tomorrow')}
                                    className={cn(
                                        "flex items-center gap-1 px-1.5 py-0.5 rounded transition-colors",
                                        filters.contactFilter === 'tomorrow' ? "bg-blue-500 text-white" : "text-blue-400 hover:bg-blue-500/10"
                                    )}>
                                    <CalendarClock size={12} />
                                    <span className="text-[10px] font-bold">{headerStats.contacts.tomorrow}</span>
                                </button>
                            </TooltipTrigger>
                            <TooltipContent side="bottom" sideOffset={-5} avoidCollisions={false}>Tomorrow</TooltipContent>
                        </Tooltip>
                    </div>

                    <div className="flex items-center gap-1.5">


                        {/* Advanced Filters */}
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    className={cn(
                                        "h-8 px-2.5 border-white/10 bg-[#1A1A1A] text-gray-400 hover:text-white hover:bg-white/5 text-xs font-normal gap-2 transition-colors",
                                        (filters.dateRange?.from || filters.dateRange?.to || filters.createdAtRange?.from || filters.createdAtRange?.to || filters.searchCompany || filters.searchPhone || filters.product.length > 0 || filters.customField || filters.source || filters.status || filters.responsible) && "border-[#1C73E8] text-[#1C73E8] bg-[#1C73E8]/10"
                                    )}>
                                    <ListFilter size={14} />
                                    <span className="hidden md:inline">Filters</span>
                                    {(filters.dateRange?.from || filters.dateRange?.to || filters.createdAtRange?.from || filters.createdAtRange?.to || filters.searchCompany || filters.searchPhone || filters.product.length > 0 || filters.customField || filters.source || filters.status || filters.responsible) && (
                                        <span className="flex h-1.5 w-1.5 rounded-full bg-[#1C73E8]" />
                                    )}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-[320px] p-4 bg-[#111] border-white/10 text-white z-[9999]" align="end">
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] uppercase text-gray-500 font-semibold">Contact Date</label>

                                        <div className="grid grid-cols-2 gap-2">
                                            {/* Start Date */}
                                            <FilterDatePicker
                                                label="From"
                                                value={filters.dateRange?.from}
                                                onSelect={(date) => updateFilter('dateRange', { ...filters.dateRange, from: date, to: filters.dateRange?.to })}
                                                placeholder="Start"
                                            />

                                            {/* End Date */}
                                            <FilterDatePicker
                                                label="To"
                                                value={filters.dateRange?.to}
                                                onSelect={(date) => updateFilter('dateRange', { ...filters.dateRange, from: filters.dateRange?.from, to: date })}
                                                placeholder="End"
                                                align="end"
                                            />
                                        </div>
                                    </div>
                                    {/* Created At Date Filter */}
                                    <div className="space-y-2">
                                        <label className="text-[10px] uppercase text-gray-500 font-semibold">Created Date</label>

                                        <div className="grid grid-cols-2 gap-2">
                                            {/* Start Date */}
                                            <FilterDatePicker
                                                label="From"
                                                value={filters.createdAtRange?.from}
                                                onSelect={(date) => updateFilter('createdAtRange', { ...filters.createdAtRange, from: date, to: filters.createdAtRange?.to })}
                                                placeholder="Start"
                                            />

                                            {/* End Date */}
                                            <FilterDatePicker
                                                label="To"
                                                value={filters.createdAtRange?.to}
                                                onSelect={(date) => updateFilter('createdAtRange', { ...filters.createdAtRange, from: filters.createdAtRange?.from, to: date })}
                                                placeholder="End"
                                                align="end"
                                            />
                                        </div>
                                    </div>

                                    {/* Status Filter */}
                                    <div className="space-y-2">
                                        <label className="text-[10px] uppercase text-gray-500 font-semibold">Status</label>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="outline" className="w-full justify-between h-8 text-xs border-white/10 bg-[#1A1A1A] hover:bg-white/5 hover:text-white text-gray-300">
                                                    {filters.status || "Select status..."}
                                                    <ChevronDown size={14} className="opacity-50" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent className="w-[280px] bg-[#1A1A1A] border-white/10 text-gray-300 z-[9999]">
                                                <DropdownMenuItem onClick={() => updateFilter('status', '')} className="text-xs hover:bg-white/10 hover:text-white cursor-pointer">
                                                    All Statuses
                                                </DropdownMenuItem>
                                                {STATUSES.map((status: any) => (
                                                    <DropdownMenuItem
                                                        key={status.label}
                                                        onClick={() => updateFilter('status', status.label)}
                                                        className={cn(
                                                            "text-xs cursor-pointer mb-1 last:mb-0",
                                                            status.bg,
                                                            status.text,
                                                            "hover:opacity-80 transition-opacity"
                                                        )}
                                                    >
                                                        {status.label}
                                                    </DropdownMenuItem>
                                                ))}
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>

                                    {/* Product Filter */}
                                    <div className="space-y-2">
                                        <label className="text-[10px] uppercase text-gray-500 font-semibold">Products</label>
                                        <div className="flex flex-wrap gap-1">
                                            {PRODUCTS.map((product: any) => {
                                                const isSelected = filters.product.includes(product.name);
                                                return (
                                                    <button
                                                        key={product.name}
                                                        onClick={() => {
                                                            const newProducts = isSelected
                                                                ? filters.product.filter(p => p !== product.name)
                                                                : [...filters.product, product.name];
                                                            updateFilter('product', newProducts);
                                                        }}
                                                        className={cn(
                                                            "text-[10px] px-2 py-1 rounded border transition-colors",
                                                            isSelected
                                                                ? "bg-[#1C73E8] border-[#1C73E8] text-white"
                                                                : "bg-white/5 border-transparent text-gray-400 hover:text-white hover:bg-white/10"
                                                        )}
                                                    >
                                                        {product.name}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* Source Filter */}
                                    <div className="space-y-2">
                                        <label className="text-[10px] uppercase text-gray-500 font-semibold">Source</label>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="outline" className="w-full justify-between h-8 text-xs border-white/10 bg-[#1A1A1A] hover:bg-white/5 hover:text-white text-gray-300">
                                                    {filters.source || "Select source..."}
                                                    <ChevronDown size={14} className="opacity-50" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent className="w-[280px] bg-[#1A1A1A] border-white/10 text-gray-300 max-h-[200px] overflow-y-auto custom-scrollbar z-[9999]">
                                                <DropdownMenuItem onClick={() => updateFilter('source', '')} className="text-xs hover:bg-white/10 hover:text-white cursor-pointer">
                                                    All Sources
                                                </DropdownMenuItem>
                                                {SOURCES.map((source: any) => {
                                                    const label = typeof source === 'string' ? source : source.label;
                                                    const bg = typeof source === 'string' ? '' : source.bg;
                                                    const text = typeof source === 'string' ? '' : source.text;
                                                    return (
                                                        <DropdownMenuItem
                                                            key={label}
                                                            onClick={() => updateFilter('source', label)}
                                                            className={cn(
                                                                "text-xs cursor-pointer mb-1 last:mb-0",
                                                                bg ? `${bg} ${text}` : "hover:bg-white/10 hover:text-white"
                                                            )}
                                                        >
                                                            {label}
                                                        </DropdownMenuItem>
                                                    );
                                                })}
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>

                                    {/* Responsible Filter */}
                                    <div className="space-y-2">
                                        <label className="text-[10px] uppercase text-gray-500 font-semibold">Responsible</label>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="outline" className="w-full justify-between h-8 text-xs border-white/10 bg-[#1A1A1A] hover:bg-white/5 hover:text-white text-gray-300">
                                                    {filters.responsible || "Select responsible..."}
                                                    <ChevronDown size={14} className="opacity-50" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent className="w-[280px] bg-[#1A1A1A] border-white/10 text-gray-300 max-h-[200px] overflow-y-auto custom-scrollbar z-[9999]">
                                                <DropdownMenuItem onClick={() => updateFilter('responsible', '')} className="text-xs hover:bg-white/10 hover:text-white cursor-pointer">
                                                    All Responsibles
                                                </DropdownMenuItem>
                                                {RESPONSIBLES.map((resp: any) => {
                                                    const label = typeof resp === 'string' ? resp : resp.label;
                                                    const bg = typeof resp === 'string' ? '' : resp.bg;
                                                    const text = typeof resp === 'string' ? '' : resp.text;
                                                    return (
                                                        <DropdownMenuItem
                                                            key={label}
                                                            onClick={() => updateFilter('responsible', label)}
                                                            className={cn(
                                                                "text-xs cursor-pointer mb-1 last:mb-0",
                                                                bg ? `${bg} ${text}` : "hover:bg-white/10 hover:text-white"
                                                            )}
                                                        >
                                                            {label}
                                                        </DropdownMenuItem>
                                                    );
                                                })}
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>

                                    {/* Custom Field Filter */}
                                    <div className="space-y-2">
                                        <label className="text-[10px] uppercase text-gray-500 font-semibold">{customFieldName}</label>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="outline" className="w-full justify-between h-8 text-xs border-white/10 bg-[#1A1A1A] hover:bg-white/5 hover:text-white text-gray-300">
                                                    {filters.customField || `Select ${customFieldName.toLowerCase()}...`}
                                                    <ChevronDown size={14} className="opacity-50" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent className="w-[280px] bg-[#1A1A1A] border-white/10 text-gray-300 max-h-[200px] overflow-y-auto custom-scrollbar z-[9999]">
                                                <DropdownMenuItem onClick={() => updateFilter('customField', '')} className="text-xs hover:bg-white/10 hover:text-white cursor-pointer">
                                                    All Options
                                                </DropdownMenuItem>
                                                {CUSTOM_OPTIONS.map((option: any) => {
                                                    const label = typeof option === 'string' ? option : option.label;
                                                    const bg = typeof option === 'string' ? '' : option.bg;
                                                    const text = typeof option === 'string' ? '' : option.text;
                                                    return (
                                                        <DropdownMenuItem
                                                            key={label}
                                                            onClick={() => updateFilter('customField', label)}
                                                            className={cn(
                                                                "text-xs cursor-pointer mb-1 last:mb-0",
                                                                bg ? `${bg} ${text}` : "hover:bg-white/10 hover:text-white"
                                                            )}
                                                        >
                                                            {label}
                                                        </DropdownMenuItem>
                                                    );
                                                })}
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </div>

                                <div className="pt-2 border-t border-white/10 flex justify-between">
                                    <Button variant="ghost" size="sm" onClick={clearFilters} className="text-xs text-gray-400 hover:text-white h-7">Clear All</Button>
                                </div>

                            </PopoverContent>
                        </Popover>

                        {(filters.searchGlobal || filters.searchName || filters.searchCompany || filters.searchPhone || filters.status || filters.source || filters.responsible || filters.product.length > 0 || filters.customField || filters.qualification || filters.contactFilter || filters.dateRange?.from || filters.dateRange?.to || filters.createdAtRange?.from || filters.createdAtRange?.to) && (
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        size="icon"
                                        variant="ghost"
                                        className="h-8 w-8 text-red-500 hover:bg-red-500/10 hover:text-red-400"
                                        onClick={clearFilters}
                                    >
                                        <X size={16} />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent side="bottom" sideOffset={-5} avoidCollisions={false}>Clear All Filters</TooltipContent>
                            </Tooltip>
                        )}

                        <div className="h-6 w-px bg-white/10 shrink-0" />

                        <PipelineHealthIndicator 
                            leads={leads} 
                            settings={settings} 
                            onClick={() => setIsPipelineHealthOpen(true)}
                        />

                        <div className="h-6 w-px bg-white/10 shrink-0" />

                        {/* Toolbar Actions */}
                        <div className="flex items-center gap-0.5">
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button size="icon" variant="ghost" className="h-8 w-8 text-gray-400 hover:text-white hover:bg-white/10" onClick={() => setIsModalOpen(true)}>
                                        <Plus size={16} />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent side="bottom" sideOffset={-5} avoidCollisions={false}>New Opportunity</TooltipContent>
                            </Tooltip>

                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button size="icon" variant="ghost" className="h-8 w-8 text-gray-400 hover:text-white hover:bg-white/10" onClick={() => router.refresh()}>
                                        <RefreshCw size={16} />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent side="bottom" sideOffset={-5} avoidCollisions={false}>Refresh</TooltipContent>
                            </Tooltip>

                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button size="icon" variant="ghost" className="h-8 w-8 text-gray-400 hover:text-white hover:bg-white/10" onClick={() => setIsSettingsOpen(true)}>
                                        <Settings size={16} />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent side="bottom" sideOffset={-5} avoidCollisions={false}>Settings</TooltipContent>
                            </Tooltip>

                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button size="icon" variant="ghost" className="h-8 w-8 text-gray-400 hover:text-white hover:bg-white/10" onClick={() => setIsReportsOpen(true)}>
                                        <BarChart3 size={16} />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent side="bottom" sideOffset={-5} avoidCollisions={false}>Reports</TooltipContent>
                            </Tooltip>

                            <div className="h-4 w-px bg-white/10 mx-1" />

                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        size="icon"
                                        variant="ghost"
                                        className={cn(
                                            "h-8 w-8 transition-all duration-200",
                                            isGlobalInboxOpen
                                                ? "bg-[#1C73E8] text-white shadow-[0_0_10px_rgba(28,115,232,0.4)]"
                                                : "text-gray-400 hover:text-white hover:bg-white/10"
                                        )}
                                        onClick={() => setIsGlobalInboxOpen(true)}
                                    >
                                        <MessageSquare size={16} />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent side="bottom" sideOffset={-5} avoidCollisions={false}>Global Inbox (Emily Hub)</TooltipContent>
                            </Tooltip>
                        </div>
                    </div>
                </div>

                {/* Modals Management */}
                <NewOpportunityModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    settings={settings}
                    leads={leads}
                    currentUserName={viewerProfile?.name}
                />
                <CrmSettingsModal
                    isOpen={isSettingsOpen}
                    onClose={() => setIsSettingsOpen(false)}
                    settings={settings}
                    leads={leads}
                />
                <PipelineHealthSummaryModal
                    isOpen={isPipelineHealthOpen}
                    onClose={() => setIsPipelineHealthOpen(false)}
                    leads={leads}
                    settings={settings}
                />
                <CrmReportsModal
                    isOpen={isReportsOpen}
                    onClose={() => setIsReportsOpen(false)}
                    leads={leads}
                    settings={settings}
                    filters={filters}
                    onFiltersChange={(newFilters) => {
                        Object.entries(newFilters).forEach(([key, value]) => {
                            updateFilter(key as keyof CrmFilterState, value);
                        });
                    }}
                />
                <GlobalInboxModal
                    isOpen={isGlobalInboxOpen}
                    onClose={() => setIsGlobalInboxOpen(false)}
                    viewerProfile={viewerProfile}
                />
            </div>
        </TooltipProvider>
    );
}
