"use client";

import { Button } from "@/components/ui/button";
import { ChevronDown, Settings, Plus, Calendar as CalendarIcon, RefreshCw, BarChart3, ListFilter, Search, Users, DollarSign, AlertCircle, CalendarClock, Clock, X, CheckCircle2, Check } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { NewOpportunityModal } from "./new-opportunity-modal";
import { CrmSettingsModal } from "./crm-settings-modal";
import { CrmReportsModal } from "./crm-reports-modal";
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
            untagged: number;
        };
        contacts: {
            overdue: number;
            today: number;
            tomorrow: number;
            pending: number;
        };
    };
    viewerProfile?: {
        name?: string;
        active_agents?: string[];
    };
}

const formatPipelineValue = (value: number) => {
    if (value >= 1000000) {
        return (value / 1000000).toLocaleString('pt-BR', { maximumFractionDigits: 1 }) + 'mi';
    }
    return value.toLocaleString('pt-BR', { maximumFractionDigits: 0 });
};

export function CrmFilters({ settings, filters, setFilters, leads, headerStats, viewerProfile }: CrmFiltersProps) {
    const router = useRouter();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isReportsOpen, setIsReportsOpen] = useState(false);
    const [isPipelineHealthOpen, setIsPipelineHealthOpen] = useState(false);
    const [isQualificationOpen, setIsQualificationOpen] = useState(false);
    const [isContactsOpen, setIsContactsOpen] = useState(false);

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
            status: [],
            source: [],
            responsible: [],
            customField: [],
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
                {/* Left: Search Input */}
                <div className="flex items-center gap-1.5 flex-1 min-w-[200px] max-w-full">
                    <div className="relative flex-1 max-w-[400px]">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-500" />
                        <input
                            type="text"
                            placeholder="Search by name, company, or phone..."
                            value={filters.searchGlobal || ''}
                            onChange={(e) => {
                                updateFilter('searchGlobal', e.target.value);
                            }}
                            className={cn(
                                "w-full h-8 pl-9 pr-8 rounded-md border text-xs transition-all",
                                "bg-[#1A1A1A] border-white/10 text-white placeholder:text-gray-500",
                                "focus:outline-none focus:border-[#1C73E8] focus:ring-1 focus:ring-[#1C73E8]/20",
                                filters.searchGlobal && "border-[#1C73E8] bg-[#1C73E8]/5"
                            )}
                        />
                        {filters.searchGlobal && (
                            <button
                                onClick={() => updateFilter('searchGlobal', '')}
                                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-white rounded-md hover:bg-white/10 transition-colors"
                                title="Clear search"
                            >
                                <X size={12} />
                            </button>
                        )}
                    </div>

                    {(filters.searchName || filters.searchCompany || filters.searchPhone || filters.status?.length > 0 || filters.source?.length > 0 || filters.responsible?.length > 0 || filters.product.length > 0 || filters.customField?.length > 0 || filters.qualification || filters.contactFilter || filters.dateRange?.from || filters.dateRange?.to || filters.createdAtRange?.from || filters.createdAtRange?.to) && !filters.searchGlobal && (
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    size="icon"
                                    variant="outline"
                                    className="h-8 w-8 border-red-500/20 bg-red-500/10 text-red-500 hover:text-red-400 hover:bg-red-500/20 transition-colors shrink-0"
                                    onClick={clearFilters}
                                >
                                    <X size={16} />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent side="bottom" sideOffset={4} className="bg-[#111] border-white/5 text-[11px] font-medium text-gray-300 px-2 py-1 shadow-none rounded">Clear All Filters</TooltipContent>
                        </Tooltip>
                    )}
                </div>

                {/* Right: Modal Tabs, Stats, Date, Filters, Actions */}
                <div className="flex items-center gap-1.5 shrink-0 ml-auto">
                    {/* Filter: Active/Won/Lost */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="ghost"
                                className="h-8 px-3 rounded-md text-xs font-medium text-white bg-[#1C73E8] hover:bg-[#1557B0] border border-[#1C73E8] transition-colors gap-1.5 capitalize"
                            >
                                {filters.tab === 'active' ? 'Active' : filters.tab === 'earned' ? 'Won' : 'Lost'}
                                <ChevronDown size={14} className="opacity-70" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-[140px] bg-[#1A1A1A] border-white/10 text-gray-300 z-[9999]">
                            <DropdownMenuItem onClick={() => updateFilter('tab', 'active')} className={cn("text-xs cursor-pointer select-none transition-colors", filters.tab === 'active' ? "bg-blue-500/10 text-blue-500" : "text-gray-300 hover:bg-blue-500/10 hover:text-blue-500")}>
                                <div className="flex items-center gap-2 w-full">
                                    <span className={filters.tab === 'active' ? 'font-medium' : ''}>Active</span>
                                    {filters.tab === 'active' && <CheckCircle2 size={12} className="ml-auto text-blue-500" />}
                                </div>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => updateFilter('tab', 'earned')} className={cn("text-xs cursor-pointer select-none transition-colors", filters.tab === 'earned' ? "bg-emerald-500/10 text-emerald-500" : "text-gray-300 hover:bg-emerald-500/10 hover:text-emerald-500")}>
                                <div className="flex items-center gap-2 w-full">
                                    <span className={filters.tab === 'earned' ? 'font-medium' : ''}>Won</span>
                                    {filters.tab === 'earned' && <CheckCircle2 size={12} className="ml-auto text-emerald-500" />}
                                </div>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => updateFilter('tab', 'lost')} className={cn("text-xs cursor-pointer select-none transition-colors", filters.tab === 'lost' ? "bg-red-500/10 text-red-500" : "text-gray-300 hover:bg-red-500/10 hover:text-red-500")}>
                                <div className="flex items-center gap-2 w-full">
                                    <span className={filters.tab === 'lost' ? 'font-medium' : ''}>Lost</span>
                                    {filters.tab === 'lost' && <CheckCircle2 size={12} className="ml-auto text-red-500" />}
                                </div>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                    {/* Stats Group 1: Qualification */}
                    <Popover open={isQualificationOpen} onOpenChange={setIsQualificationOpen}>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <div className="inline-flex" tabIndex={0}>
                                    <PopoverTrigger asChild>
                                        <button className={cn(
                                            "flex items-center gap-1.5 h-8 px-3 rounded-md border text-xs font-medium transition-colors cursor-pointer",
                                            filters.qualification ? "bg-[#1C73E8] border-[#1C73E8] text-white" : "bg-[#1A1A1A] border-white/10 text-gray-300 hover:text-white hover:bg-white/5"
                                        )}>
                                            <Users size={14} />
                                            <span>
                                                {filters.qualification === 'mql' ? headerStats.qualification.mql :
                                                    filters.qualification === 'sql' ? headerStats.qualification.sql :
                                                        filters.qualification === 'nq' ? headerStats.qualification.not_qualified :
                                                            filters.qualification === 'untagged' ? headerStats.qualification.untagged :
                                                                headerStats.totalLeads}
                                            </span>
                                            <ChevronDown size={14} className="opacity-50" />
                                        </button>
                                    </PopoverTrigger>
                                </div>
                            </TooltipTrigger>
                            <TooltipContent side="bottom" sideOffset={4} className="bg-[#111] border-white/5 text-[11px] font-medium text-gray-300 px-2 py-1 shadow-none rounded">Lead Organization</TooltipContent>
                        </Tooltip>
                        <PopoverContent className="w-56 p-2 bg-[#111] border-white/10 text-white z-[9999]" align="start">
                            <div className="space-y-1">
                                <button
                                    onClick={() => { updateFilter('qualification', ''); setIsQualificationOpen(false); }}
                                    className={cn(
                                        "flex items-center justify-between w-full px-2 py-1.5 rounded text-[11px] transition-colors",
                                        !filters.qualification ? "bg-white/10 text-white font-bold" : "text-gray-400 hover:bg-white/5 hover:text-white"
                                    )}
                                >
                                    <div className="flex items-center gap-2">
                                        <Users size={12} />
                                        <span>All Leads</span>
                                    </div>
                                    <span>{headerStats.totalLeads}</span>
                                </button>
                                <button
                                    onClick={() => { updateFilter('qualification', 'mql'); setIsQualificationOpen(false); }}
                                    className={cn(
                                        "flex items-center justify-between w-full px-2 py-1.5 rounded text-[11px] transition-colors",
                                        filters.qualification === 'mql' ? "bg-blue-500 text-white font-bold" : "text-blue-400 hover:bg-blue-500/10"
                                    )}
                                >
                                    <span>MQL (Marketing)</span>
                                    <span>{headerStats.qualification.mql}</span>
                                </button>
                                <button
                                    onClick={() => { updateFilter('qualification', 'sql'); setIsQualificationOpen(false); }}
                                    className={cn(
                                        "flex items-center justify-between w-full px-2 py-1.5 rounded text-[11px] transition-colors",
                                        filters.qualification === 'sql' ? "bg-emerald-500 text-white font-bold" : "text-emerald-400 hover:bg-emerald-500/10"
                                    )}
                                >
                                    <span>SQL (Sales)</span>
                                    <span>{headerStats.qualification.sql}</span>
                                </button>
                                <button
                                    onClick={() => { updateFilter('qualification', 'nq'); setIsQualificationOpen(false); }}
                                    className={cn(
                                        "flex items-center justify-between w-full px-2 py-1.5 rounded text-[11px] transition-colors",
                                        filters.qualification === 'nq' ? "bg-red-500 text-white font-bold" : "text-red-400 hover:bg-red-500/10"
                                    )}
                                >
                                    <span>NQ (Not Qualified)</span>
                                    <span>{headerStats.qualification.not_qualified}</span>
                                </button>
                                <button
                                    onClick={() => { updateFilter('qualification', 'untagged'); setIsQualificationOpen(false); }}
                                    className={cn(
                                        "flex items-center justify-between w-full px-2 py-1.5 rounded text-[11px] transition-colors mt-2 border-t border-white/10 pt-2",
                                        filters.qualification === 'untagged' ? "bg-gray-700 text-white font-bold" : "text-gray-400 hover:bg-white/10"
                                    )}
                                >
                                    <span>Untagged</span>
                                    <span>{headerStats.qualification.untagged}</span>
                                </button>
                            </div>
                        </PopoverContent>
                    </Popover>



                    <Tooltip>
                        <TooltipTrigger asChild>
                            <div className="flex items-center gap-1.5 h-8 px-3 rounded-md border border-white/10 bg-[#1A1A1A] cursor-pointer hover:bg-white/5 transition-colors">
                                <DollarSign size={14} className="text-emerald-500" />
                                <span className="text-xs tracking-tight font-medium text-white whitespace-nowrap">
                                    {formatPipelineValue(headerStats.pipelineValue)}
                                </span>
                            </div>
                        </TooltipTrigger>
                        <TooltipContent side="bottom" sideOffset={4} className="bg-[#111] border-white/5 text-[11px] font-medium text-gray-300 px-2 py-1 shadow-none rounded">
                            <span className="font-semibold text-emerald-400">
                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(headerStats.pipelineValue)}
                            </span>
                        </TooltipContent>
                    </Tooltip>



                    {/* Stats Group 2: Contacts */}
                    <Popover open={isContactsOpen} onOpenChange={setIsContactsOpen}>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <div className="inline-flex" tabIndex={0}>
                                    <PopoverTrigger asChild>
                                        <button className={cn(
                                            "flex items-center gap-1.5 h-8 px-3 rounded-md border text-xs font-medium transition-colors cursor-pointer",
                                            filters.contactFilter ? (
                                                filters.contactFilter === 'overdue' ? "bg-red-500 border-red-500 text-white" :
                                                    filters.contactFilter === 'today' ? "bg-amber-500 border-amber-500 text-white" :
                                                        filters.contactFilter === 'tomorrow' ? "bg-blue-500 border-blue-500 text-white" :
                                                            "bg-gray-500 border-gray-500 text-white"
                                            ) : "bg-[#1A1A1A] border-white/10 text-gray-300 hover:text-white hover:bg-white/5"
                                        )}>
                                            {filters.contactFilter === 'today' ? <CalendarIcon size={14} /> :
                                                filters.contactFilter === 'tomorrow' ? <CalendarClock size={14} /> :
                                                    filters.contactFilter === 'pending' ? <Clock size={14} /> :
                                                        <AlertCircle size={14} />}
                                            <span>
                                                {filters.contactFilter === 'today' ? headerStats.contacts.today :
                                                    filters.contactFilter === 'tomorrow' ? headerStats.contacts.tomorrow :
                                                        filters.contactFilter === 'pending' ? headerStats.contacts.pending :
                                                            headerStats.contacts.overdue}
                                            </span>
                                            <ChevronDown size={14} className="opacity-50" />
                                        </button>
                                    </PopoverTrigger>
                                </div>
                            </TooltipTrigger>
                            <TooltipContent side="bottom" sideOffset={4} className="bg-[#111] border-white/5 text-[11px] font-medium text-gray-300 px-2 py-1 shadow-none rounded">Contact Organization</TooltipContent>
                        </Tooltip>
                        <PopoverContent className="w-56 p-2 bg-[#111] border-white/10 text-white z-[9999]" align="start">
                            <div className="space-y-1">
                                <button
                                    onClick={() => { updateFilter('contactFilter', null); setIsContactsOpen(false); }}
                                    className={cn(
                                        "flex items-center justify-between w-full px-2 py-1.5 rounded text-[11px] transition-colors",
                                        !filters.contactFilter ? "bg-white/10 text-white font-bold" : "text-gray-400 hover:bg-white/5 hover:text-white"
                                    )}
                                >
                                    <div className="flex items-center gap-2">
                                        <CalendarIcon size={12} />
                                        <span>All Contact Dates</span>
                                    </div>
                                    <span>{headerStats.totalLeads}</span>
                                </button>
                                <button
                                    onClick={() => { updateFilter('contactFilter', filters.contactFilter === 'overdue' ? null : 'overdue'); setIsContactsOpen(false); }}
                                    className={cn(
                                        "flex items-center justify-between w-full px-2 py-1.5 rounded text-[11px] transition-colors",
                                        filters.contactFilter === 'overdue' ? "bg-red-500 text-white font-bold" : "text-red-400 hover:bg-red-500/10"
                                    )}
                                >
                                    <div className="flex items-center gap-2">
                                        <AlertCircle size={12} />
                                        <span>Overdue (Late contacts)</span>
                                    </div>
                                    <span>{headerStats.contacts.overdue}</span>
                                </button>
                                <button
                                    onClick={() => { updateFilter('contactFilter', filters.contactFilter === 'today' ? null : 'today'); setIsContactsOpen(false); }}
                                    className={cn(
                                        "flex items-center justify-between w-full px-2 py-1.5 rounded text-[11px] transition-colors",
                                        filters.contactFilter === 'today' ? "bg-amber-500 text-white font-bold" : "text-amber-400 hover:bg-amber-500/10"
                                    )}
                                >
                                    <div className="flex items-center gap-2">
                                        <CalendarIcon size={12} />
                                        <span>Today's Contacts</span>
                                    </div>
                                    <span>{headerStats.contacts.today}</span>
                                </button>
                                <button
                                    onClick={() => { updateFilter('contactFilter', filters.contactFilter === 'tomorrow' ? null : 'tomorrow'); setIsContactsOpen(false); }}
                                    className={cn(
                                        "flex items-center justify-between w-full px-2 py-1.5 rounded text-[11px] transition-colors",
                                        filters.contactFilter === 'tomorrow' ? "bg-blue-500 text-white font-bold" : "text-blue-400 hover:bg-blue-500/10"
                                    )}
                                >
                                    <div className="flex items-center gap-2">
                                        <CalendarClock size={12} />
                                        <span>Tomorrow's Contacts</span>
                                    </div>
                                    <span>{headerStats.contacts.tomorrow}</span>
                                </button>
                                <button
                                    onClick={() => { updateFilter('contactFilter', filters.contactFilter === 'pending' ? null : 'pending'); setIsContactsOpen(false); }}
                                    className={cn(
                                        "flex items-center justify-between w-full px-2 py-1.5 rounded text-[11px] transition-colors mt-2 border-t border-white/10 pt-2",
                                        filters.contactFilter === 'pending' ? "bg-gray-500 text-white font-bold" : "text-gray-400 hover:bg-white/10"
                                    )}
                                >
                                    <div className="flex items-center gap-2">
                                        <Clock size={12} />
                                        <span>Pending Contacts</span>
                                    </div>
                                    <span>{headerStats.contacts.pending}</span>
                                </button>
                            </div>
                        </PopoverContent>
                    </Popover>
                </div>

                <div className="flex items-center gap-1.5">


                    {/* Advanced Filters */}
                    <Popover>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <div className="inline-flex" tabIndex={0}>
                                    <PopoverTrigger asChild>
                                        <Button
                                            size="icon"
                                            variant="outline"
                                            className="h-8 w-8 relative border-white/10 bg-[#1A1A1A] text-gray-400 hover:text-white hover:bg-white/5 transition-colors">
                                            <ListFilter size={16} />
                                        </Button>
                                    </PopoverTrigger>
                                </div>
                            </TooltipTrigger>
                            <TooltipContent side="bottom" sideOffset={4} className="bg-[#111] border-white/5 text-[11px] font-medium text-gray-300 px-2 py-1 shadow-none rounded">Advanced Filters</TooltipContent>
                        </Tooltip>
                        <PopoverContent className="w-[320px] p-4 bg-[#111] border-white/10 text-white z-[9999] max-h-[85vh] overflow-y-auto custom-scrollbar" align="end">
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
                                    <div className="flex flex-wrap gap-1">
                                        {STATUSES.map((status: any) => {
                                            const isSelected = filters.status?.includes(status.label);
                                            return (
                                                <button
                                                    key={status.label}
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        const newStatus = isSelected
                                                            ? filters.status.filter((s: string) => s !== status.label)
                                                            : [...(filters.status || []), status.label];
                                                        updateFilter('status', newStatus);
                                                    }}
                                                    className={cn(
                                                        "text-[10px] px-2 py-1 rounded border transition-colors flex items-center gap-1.5",
                                                        isSelected
                                                            ? "bg-[#1C73E8] border-[#1C73E8] text-white"
                                                            : "bg-white/5 border-transparent text-gray-400 hover:text-white hover:bg-white/10"
                                                    )}
                                                >
                                                    {!isSelected && <span className={cn("w-1.5 h-1.5 rounded-full", status.bg)}></span>}
                                                    {status.label}
                                                </button>
                                            );
                                        })}
                                    </div>
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
                                    <div className="flex flex-wrap gap-1">
                                        {SOURCES.map((source: any) => {
                                            const label = typeof source === 'string' ? source : source.label;
                                            const isSelected = filters.source?.includes(label);
                                            return (
                                                <button
                                                    key={label}
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        const newSource = isSelected
                                                            ? filters.source.filter((s: string) => s !== label)
                                                            : [...(filters.source || []), label];
                                                        updateFilter('source', newSource);
                                                    }}
                                                    className={cn(
                                                        "text-[10px] px-2 py-1 rounded border transition-colors",
                                                        isSelected
                                                            ? "bg-[#1C73E8] border-[#1C73E8] text-white"
                                                            : "bg-white/5 border-transparent text-gray-400 hover:text-white hover:bg-white/10"
                                                    )}
                                                >
                                                    {label}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Responsible Filter */}
                                <div className="space-y-2">
                                    <label className="text-[10px] uppercase text-gray-500 font-semibold">Responsible</label>
                                    <div className="flex flex-wrap gap-1">
                                        {RESPONSIBLES.map((resp: any) => {
                                            const label = typeof resp === 'string' ? resp : resp.label;
                                            const isSelected = filters.responsible?.includes(label);
                                            return (
                                                <button
                                                    key={label}
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        const newResp = isSelected
                                                            ? filters.responsible.filter((r: string) => r !== label)
                                                            : [...(filters.responsible || []), label];
                                                        updateFilter('responsible', newResp);
                                                    }}
                                                    className={cn(
                                                        "text-[10px] px-2 py-1 rounded border transition-colors",
                                                        isSelected
                                                            ? "bg-[#1C73E8] border-[#1C73E8] text-white"
                                                            : "bg-white/5 border-transparent text-gray-400 hover:text-white hover:bg-white/10"
                                                    )}
                                                >
                                                    {label}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Custom Field Filter */}
                                <div className="space-y-2">
                                    <label className="text-[10px] uppercase text-gray-500 font-semibold">{customFieldName}</label>
                                    <div className="flex flex-wrap gap-1">
                                        {CUSTOM_OPTIONS.map((option: any) => {
                                            const label = typeof option === 'string' ? option : option.label;
                                            const isSelected = filters.customField?.includes(label);
                                            return (
                                                <button
                                                    key={label}
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        const newOpt = isSelected
                                                            ? filters.customField.filter((o: string) => o !== label)
                                                            : [...(filters.customField || []), label];
                                                        updateFilter('customField', newOpt);
                                                    }}
                                                    className={cn(
                                                        "text-[10px] px-2 py-1 rounded border transition-colors",
                                                        isSelected
                                                            ? "bg-[#1C73E8] border-[#1C73E8] text-white"
                                                            : "bg-white/5 border-transparent text-gray-400 hover:text-white hover:bg-white/10"
                                                    )}
                                                >
                                                    {label}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>

                            <div className="pt-2 border-t border-white/10 flex justify-between">
                                <Button variant="ghost" size="sm" onClick={clearFilters} className="text-xs text-gray-400 hover:text-white h-7">Clear All</Button>
                            </div>

                        </PopoverContent>
                    </Popover>





                    {/* Toolbar Actions */}
                    <div className="flex items-center gap-0.5">
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button size="icon" variant="outline" className="h-8 w-8 border-white/10 bg-[#1A1A1A] text-gray-400 hover:text-white hover:bg-white/5 transition-colors" onClick={() => setIsModalOpen(true)}>
                                    <Plus size={16} />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent side="bottom" sideOffset={4} className="bg-[#111] border-white/5 text-[11px] font-medium text-gray-300 px-2 py-1 shadow-none rounded">New Opportunity</TooltipContent>
                        </Tooltip>

                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button size="icon" variant="outline" className="h-8 w-8 border-white/10 bg-[#1A1A1A] text-gray-400 hover:text-white hover:bg-white/5 transition-colors" onClick={() => router.refresh()}>
                                    <RefreshCw size={16} />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent side="bottom" sideOffset={4} className="bg-[#111] border-white/5 text-[11px] font-medium text-gray-300 px-2 py-1 shadow-none rounded">Refresh</TooltipContent>
                        </Tooltip>

                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button size="icon" variant="outline" className="h-8 w-8 border-white/10 bg-[#1A1A1A] text-gray-400 hover:text-white hover:bg-white/5 transition-colors" onClick={() => setIsSettingsOpen(true)}>
                                    <Settings size={16} />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent side="bottom" sideOffset={4} className="bg-[#111] border-white/5 text-[11px] font-medium text-gray-300 px-2 py-1 shadow-none rounded">Settings</TooltipContent>
                        </Tooltip>

                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button size="icon" variant="outline" className="h-8 w-8 border-white/10 bg-[#1A1A1A] text-gray-400 hover:text-white hover:bg-white/5 transition-colors" onClick={() => setIsReportsOpen(true)}>
                                    <BarChart3 size={16} />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent side="bottom" sideOffset={4} className="bg-[#111] border-white/5 text-[11px] font-medium text-gray-300 px-2 py-1 shadow-none rounded">Reports</TooltipContent>
                        </Tooltip>

                        <PipelineHealthIndicator
                            leads={leads}
                            settings={settings}
                            onClick={() => setIsPipelineHealthOpen(true)}
                        />
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
        </TooltipProvider>
    );
}
