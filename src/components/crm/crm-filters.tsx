"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronDown, Settings, Plus, Calendar as CalendarIcon, X, RefreshCw, BarChart3, ListFilter, Search, Users, DollarSign, AlertCircle, CalendarClock, Eraser, MessageSquare, Building2, Phone } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { NewOpportunityModal } from "./new-opportunity-modal";
import { CrmSettingsModal } from "./crm-settings-modal";
import { CrmReportsModal } from "./crm-reports-modal";
import { GlobalInboxModal } from "./global-inbox-modal";
import { CrmSearchModal } from "./crm-search-modal";
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

import { CrmSettings } from "@/actions/crm/get-crm-settings";
import { CrmFilterState } from "./crm-container";

interface CrmFiltersProps {
    settings: CrmSettings;
    filters: CrmFilterState;
    setFilters: React.Dispatch<React.SetStateAction<CrmFilterState>>;
    leads: any[];
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
}

export function CrmFilters({ settings, filters, setFilters, leads, headerStats }: CrmFiltersProps) {
    const router = useRouter();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isReportsOpen, setIsReportsOpen] = useState(false);
    const [isGlobalInboxOpen, setIsGlobalInboxOpen] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);

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
    const RESPONSIBLES = settings.responsibles || [];

    return (
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

            {/* Center: Search Button */}
            <div className="flex-1 flex items-center gap-2 min-w-0 max-w-[200px] mx-4">
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <button
                                onClick={() => setIsSearchOpen(true)}
                                className={cn(
                                    "flex items-center gap-2 px-3 py-1.5 rounded-md border transition-all h-8 w-full",
                                    (filters.searchName || filters.searchCompany || filters.searchPhone)
                                        ? "bg-[#1C73E8]/10 border-[#1C73E8] text-[#1C73E8] shadow-[0_0_0_1px_rgba(28,115,232,0.2)]"
                                        : "bg-[#1A1A1A] border-white/10 text-gray-400 hover:border-white/20 hover:text-white"
                                )}
                            >
                                <Search size={14} />
                                <span className="text-xs font-medium truncate">
                                    {filters.searchName || filters.searchCompany || filters.searchPhone ? 'Filtering...' : 'Search'}
                                </span>
                            </button>
                        </TooltipTrigger>
                        <TooltipContent>Search by Name, Company, or Phone</TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            </div>

            {/* Right: Stats, Date, Filters, Actions */}
            <div className="flex items-center gap-1.5 shrink-0 ml-auto">
                {/* Stats Group 1: Qualification (Hidden on small screens) */}
                <div className="hidden @[900px]:flex items-center gap-1 bg-[#0c0c0c] p-1 rounded-lg border border-white/5">
                    <div className="flex items-center -space-x-px">
                        <TooltipProvider>
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
                                <TooltipContent><p>All Leads</p></TooltipContent>
                            </Tooltip>
                        </TooltipProvider>

                        <TooltipProvider>
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
                                <TooltipContent><p>MQL</p></TooltipContent>
                            </Tooltip>
                        </TooltipProvider>

                        <TooltipProvider>
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
                                <TooltipContent><p>SQL</p></TooltipContent>
                            </Tooltip>
                        </TooltipProvider>

                        <TooltipProvider>
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
                                <TooltipContent><p>NQ</p></TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
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
                    <TooltipProvider>
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
                            <TooltipContent><p>Overdue</p></TooltipContent>
                        </Tooltip>
                    </TooltipProvider>

                    <TooltipProvider>
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
                            <TooltipContent><p>Today</p></TooltipContent>
                        </Tooltip>
                    </TooltipProvider>

                    <TooltipProvider>
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
                            <TooltipContent><p>Tomorrow</p></TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </div>

                <div className="flex items-center gap-1.5">
                    {/* Date Picker */}
                    <Popover>
                        <PopoverTrigger asChild>
                            <button className={cn(
                                "h-8 px-2.5 rounded-md bg-[#1A1A1A] border border-white/10 flex items-center text-xs justify-center hover:border-white/20 transition-colors cursor-pointer whitespace-nowrap gap-2",
                                filters.date && "text-white border-[#1C73E8] bg-[#1C73E8]/10"
                            )}>
                                <CalendarIcon size={14} className={filters.date ? "text-[#1C73E8]" : "text-gray-400"} />
                                <span className={cn("hidden sm:inline", filters.date ? "font-medium" : "text-gray-400")}>
                                    {filters.date ? format(filters.date, "dd/MM") : "Date"}
                                </span>
                            </button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0 bg-[#1A1A1A] border-white/10 text-white z-[9999]" align="end">
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

                    {/* Advanced Filters */}
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant="outline"
                                className={cn(
                                    "h-8 px-2.5 border-white/10 bg-[#1A1A1A] text-gray-400 hover:text-white hover:bg-white/5 text-xs font-normal gap-2 transition-colors",
                                    (filters.searchCompany || filters.searchPhone || filters.product.length > 0 || filters.customField || filters.source || filters.status || filters.responsible) && "border-[#1C73E8] text-[#1C73E8] bg-[#1C73E8]/10"
                                )}>
                                <ListFilter size={14} />
                                <span className="hidden md:inline">Filters</span>
                                {(filters.searchCompany || filters.searchPhone || filters.product.length > 0 || filters.customField || filters.source || filters.status || filters.responsible) && (
                                    <span className="flex h-1.5 w-1.5 rounded-full bg-[#1C73E8]" />
                                )}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[320px] p-4 bg-[#111] border-white/10 text-white z-[9999]" align="end">
                            <div className="space-y-4">
                                <h4 className="font-medium text-sm text-gray-400 mb-2">Advanced Filters</h4>

                                <div className="space-y-2">
                                    <label className="text-[10px] uppercase text-gray-500 font-semibold">Properties</label>

                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <div className="h-8 px-3 rounded-md bg-[#1A1A1A] border border-white/10 flex items-center text-xs text-gray-400 w-full justify-between hover:border-white/20 cursor-pointer">
                                                <span className="truncate">{filters.product?.length > 0 ? `${filters.product.length} selected` : "Product"}</span>
                                                <ChevronDown size={12} />
                                            </div>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent className="w-[280px] bg-[#1A1A1A] border-white/10 text-white z-[9999]">
                                            <DropdownMenuItem onClick={() => updateFilter('product', [])} className="text-xs">All Products</DropdownMenuItem>
                                            {PRODUCTS.map((prod: any) => (
                                                <DropdownMenuCheckboxItem
                                                    key={prod.name}
                                                    checked={filters.product?.includes(prod.name)}
                                                    onCheckedChange={(checked) => {
                                                        const current = filters.product || [];
                                                        updateFilter('product', checked ? [...current, prod.name] : current.filter(p => p !== prod.name));
                                                    }}
                                                    className="text-xs"
                                                >
                                                    {prod.name}
                                                </DropdownMenuCheckboxItem>
                                            ))}
                                        </DropdownMenuContent>
                                    </DropdownMenu>

                                    <div className="grid grid-cols-2 gap-2">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <div className="h-8 px-3 rounded-md bg-[#1A1A1A] border border-white/10 flex items-center text-xs text-gray-400 w-full justify-between hover:border-white/20 cursor-pointer">
                                                    <span className="truncate">{filters.customField || `${customFieldName}`}</span>
                                                    <ChevronDown size={12} />
                                                </div>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent className="w-[200px] bg-[#1A1A1A] border-white/10 text-white z-[9999]">
                                                <DropdownMenuItem onClick={() => updateFilter('customField', '')} className="text-xs">All</DropdownMenuItem>
                                                {CUSTOM_OPTIONS.map((opt: any) => (
                                                    <DropdownMenuItem key={typeof opt === 'string' ? opt : opt.label} onClick={() => updateFilter('customField', typeof opt === 'string' ? opt : opt.label)} className="text-xs">
                                                        {typeof opt !== 'string' && <span className={`w-2 h-2 rounded-full mr-2 ${opt.bg}`} />}
                                                        {typeof opt === 'string' ? opt : opt.label}
                                                    </DropdownMenuItem>
                                                ))}
                                            </DropdownMenuContent>
                                        </DropdownMenu>

                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <div className="h-8 px-3 rounded-md bg-[#1A1A1A] border border-white/10 flex items-center text-xs text-gray-400 w-full justify-between hover:border-white/20 cursor-pointer">
                                                    <span className="truncate">{filters.source || "Source"}</span>
                                                    <ChevronDown size={12} />
                                                </div>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent className="w-[200px] bg-[#1A1A1A] border-white/10 text-white z-[9999]">
                                                <DropdownMenuItem onClick={() => updateFilter('source', '')} className="text-xs">All</DropdownMenuItem>
                                                {SOURCES.map((s: any) => (
                                                    <DropdownMenuItem key={typeof s === 'string' ? s : s.label} onClick={() => updateFilter('source', typeof s === 'string' ? s : s.label)} className="text-xs">
                                                        {typeof s !== 'string' && <span className={`w-2 h-2 rounded-full mr-2 ${s.bg}`} />}
                                                        {typeof s === 'string' ? s : s.label}
                                                    </DropdownMenuItem>
                                                ))}
                                            </DropdownMenuContent>
                                        </DropdownMenu>

                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <div className="h-8 px-3 rounded-md bg-[#1A1A1A] border border-white/10 flex items-center text-xs text-gray-400 w-full justify-between hover:border-white/20 cursor-pointer">
                                                    <span className="truncate">{filters.status || "Status"}</span>
                                                    <ChevronDown size={12} />
                                                </div>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent className="w-[200px] bg-[#1A1A1A] border-white/10 text-white z-[9999]">
                                                <DropdownMenuItem onClick={() => updateFilter('status', '')} className="text-xs">All</DropdownMenuItem>
                                                {STATUSES.map((s: any) => (
                                                    <DropdownMenuItem key={s.label} onClick={() => updateFilter('status', s.label)} className="text-xs">
                                                        <span className={`w-2 h-2 rounded-full mr-2 ${s.bg}`} />
                                                        {s.label}
                                                    </DropdownMenuItem>
                                                ))}
                                            </DropdownMenuContent>
                                        </DropdownMenu>

                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <div className="h-8 px-3 rounded-md bg-[#1A1A1A] border border-white/10 flex items-center text-xs text-gray-400 w-full justify-between hover:border-white/20 cursor-pointer">
                                                    <span className="truncate">{filters.responsible || "Responsible"}</span>
                                                    <ChevronDown size={12} />
                                                </div>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent className="w-[200px] bg-[#1A1A1A] border-white/10 text-white z-[9999]">
                                                <DropdownMenuItem onClick={() => updateFilter('responsible', '')} className="text-xs">All</DropdownMenuItem>
                                                {RESPONSIBLES.map((r: any) => (
                                                    <DropdownMenuItem key={typeof r === 'string' ? r : r.label} onClick={() => updateFilter('responsible', typeof r === 'string' ? r : r.label)} className="text-xs">
                                                        {typeof r !== 'string' && <span className={`w-2 h-2 rounded-full mr-2 ${r.bg}`} />}
                                                        {typeof r === 'string' ? r : r.label}
                                                    </DropdownMenuItem>
                                                ))}
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </div>

                                <div className="pt-2 border-t border-white/10 flex justify-between">
                                    <Button variant="ghost" size="sm" onClick={clearFilters} className="text-xs text-gray-400 hover:text-white h-7">Clear All</Button>
                                </div>
                            </div>
                        </PopoverContent>
                    </Popover>

                    <div className="h-6 w-px bg-white/10 shrink-0" />

                    {/* Toolbar Actions */}
                    <div className="flex items-center gap-0.5">
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button size="icon" variant="ghost" className="h-8 w-8 text-gray-400 hover:text-white hover:bg-white/10" onClick={() => setIsModalOpen(true)}>
                                        <Plus size={16} />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent><p>New Opportunity</p></TooltipContent>
                            </Tooltip>

                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button size="icon" variant="ghost" className="h-8 w-8 text-gray-400 hover:text-white hover:bg-white/10" onClick={() => router.refresh()}>
                                        <RefreshCw size={16} />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent><p>Refresh</p></TooltipContent>
                            </Tooltip>

                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button size="icon" variant="ghost" className="h-8 w-8 text-gray-400 hover:text-white hover:bg-white/10" onClick={() => setIsSettingsOpen(true)}>
                                        <Settings size={16} />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent><p>Settings</p></TooltipContent>
                            </Tooltip>

                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button size="icon" variant="ghost" className="h-8 w-8 text-gray-400 hover:text-white hover:bg-white/10" onClick={() => setIsReportsOpen(true)}>
                                        <BarChart3 size={16} />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent><p>Reports</p></TooltipContent>
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
                                <TooltipContent><p>Global Inbox (Emily Hub)</p></TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>
                </div>
            </div>

            {/* Modals Management */}
            <NewOpportunityModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                settings={settings}
                leads={leads}
            />
            <CrmSettingsModal
                isOpen={isSettingsOpen}
                onClose={() => setIsSettingsOpen(false)}
                settings={settings}
            />
            <CrmReportsModal
                isOpen={isReportsOpen}
                onClose={() => setIsReportsOpen(false)}
                leads={leads}
                settings={settings}
            />
            <GlobalInboxModal
                isOpen={isGlobalInboxOpen}
                onClose={() => setIsGlobalInboxOpen(false)}
            />
            <CrmSearchModal
                open={isSearchOpen}
                onOpenChange={setIsSearchOpen}
                searchName={filters.searchName}
                searchCompany={filters.searchCompany}
                searchPhone={filters.searchPhone || ''}
                onSearchNameChange={(value) => updateFilter('searchName', value)}
                onSearchCompanyChange={(value) => updateFilter('searchCompany', value)}
                onSearchPhoneChange={(value) => updateFilter('searchPhone', value)}
            />
        </div>
    );
}
