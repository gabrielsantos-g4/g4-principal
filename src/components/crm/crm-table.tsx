'use client';

import { useRouter } from "next/navigation";

import React, { useState, useMemo, useEffect } from 'react';
import { CrmFilterState } from "./crm-container";
import { formatPhoneNumberIntl } from 'react-phone-number-input';

import { Trash2, Edit2, CheckCircle2, MessageCircle, ExternalLink, ChevronDown, Phone, Mail, Linkedin, Link2, RefreshCw, Globe, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LeadDetailsModal } from "./lead-details-modal";
import { LeadHistoryModal } from "./lead-history-modal";
import { LeadAmountModal } from "./lead-amount-modal";
import { LostLeadModal } from "./lost-lead-modal";
import { CrmSettingsModal } from "./crm-settings-modal";
import { NewOpportunityModal } from "./new-opportunity-modal";
import { CrmProductSelect } from "./crm-product-select";
import { Settings, ArrowUpRight } from "lucide-react";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { Calendar } from "@/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { MoreHorizontal } from "lucide-react";
import { format } from "date-fns";
import { updateTouchpoint } from "@/actions/crm/update-touchpoint";
import { updateDate } from "@/actions/crm/update-date";
import { updateHistory } from "@/actions/crm/update-history";
import { updateLead } from "@/actions/crm/update-lead";
import { deleteLead } from "@/actions/crm/delete-lead";
import { toast } from "sonner";
import { CrmSettings } from "@/actions/crm/get-crm-settings";
import { updateLeadQualification } from "@/actions/crm/update-lead-qualification";

// ... existing imports ...



// Helper type aligned with Database structure
interface LeadType {
    id: number;
    name: string;
    company: string;
    phone: string;
    email: string;
    linkedin: string;
    website?: string;
    role?: string;
    amount: string;
    product: string;
    status: string;
    source: string;
    custom: string;
    responsible: string;
    nextStep: { date: string; progress: number; total: number };
    history: { id: string; message: string; date: Date }[];
    date: string; // Creation date required by Modals
    lost_reason?: string;
    qualification_status?: string;
}

interface CrmTableProps {
    initialLeads: any[];
    settings: CrmSettings;
    filters: CrmFilterState;
}

function parseDateStr(str: string): Date {
    if (!str || str === "Pending") return new Date(8640000000000000); // Max safe integer for "Pending" (future)

    // Try ISO format first
    const isoDate = new Date(str);
    if (!isNaN(isoDate.getTime()) && str.includes('-')) {
        return isoDate;
    }

    // Expected format: "Fri, 09/Jan" or similar from legacy mock
    try {
        const parts = str.split(',');
        if (parts.length < 2) return new Date(); // Fallback

        const dateParts = parts[1].trim().split('/'); // ["09", "Jan"]
        if (dateParts.length < 2) return new Date();

        const day = parseInt(dateParts[0], 10);
        const monthStr = dateParts[1];

        const months: Record<string, number> = {
            'Jan': 0, 'Feb': 1, 'Mar': 2, 'Apr': 3, 'May': 4, 'Jun': 5,
            'Jul': 6, 'Aug': 7, 'Sep': 8, 'Oct': 9, 'Nov': 10, 'Dec': 11
        };

        const month = months[monthStr] ?? 0;
        const year = new Date().getFullYear();

        return new Date(year, month, day);
    } catch (e) {
        return new Date();
    }
}

function formatDateStr(date: Date | undefined): string {
    if (!date) return "";
    return format(date, "EEE, dd/MMM");
}

function getDaysRemaining(dateStr: string): number | null {
    if (!dateStr || dateStr === "Pending") return null;
    const date = parseDateStr(dateStr);

    // If date is the fallback max future date, return null
    if (date.getTime() >= 8640000000000000) return null;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const target = new Date(date);
    target.setHours(0, 0, 0, 0);

    const diffTime = target.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays;
}

export function CrmTable({ initialLeads, settings, filters }: CrmTableProps) {
    const router = useRouter();
    // Transform initial DB leads to UI format
    const transformedLeads: LeadType[] = useMemo(() => initialLeads.map(l => ({
        id: l.id,
        name: l.name,
        company: l.company,
        phone: l.phone,
        email: l.email,
        linkedin: l.linkedin,
        website: l.website,
        role: l.role,
        product: l.product || "",
        amount: l.amount?.toString() || "0",
        status: l.status || "New",
        source: l.source || "",
        custom: l.custom_field || "",
        responsible: l.responsible || "",
        nextStep: l.next_step || { date: "Pending", progress: 0, total: 6 },
        history: Array.isArray(l.history_log) ? l.history_log.map((h: any) => ({
            ...h,
            date: h.date ? new Date(h.date) : new Date()
        })) : [],
        date: l.created_at || new Date().toISOString(),
        qualification_status: l.qualification_status?.toLowerCase()
    })), [initialLeads]);

    const [leads, setLeads] = useState<LeadType[]>(transformedLeads);

    useEffect(() => {
        setLeads(transformedLeads);
    }, [transformedLeads]);
    const [selectedLead, setSelectedLead] = useState<LeadType | null>(null);
    const [historyLead, setHistoryLead] = useState<LeadType | null>(null);
    const [amountLead, setAmountLead] = useState<LeadType | null>(null);
    const [editLead, setEditLead] = useState<LeadType | null>(null);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [deleteLeadId, setDeleteLeadId] = useState<number | null>(null);
    const [lostLeadId, setLostLeadId] = useState<number | null>(null);

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(15);

    // Dynamic settings
    const RESPONSIBLES = settings.responsibles || [];
    const SOURCES = settings.sources || [];
    const customFieldName = settings.custom_fields?.name || "Category";
    const CUSTOM_OPTIONS = settings.custom_fields?.options || [];

    const filteredLeads = useMemo(() => {
        return leads.filter(lead => {
            // Tab Filter
            if (filters.tab === 'active') {
                if (lead.status === 'Won' || lead.status === 'Lost') return false;
            } else if (filters.tab === 'earned') {
                if (lead.status !== 'Won') return false;
            } else if (filters.tab === 'lost') {
                if (lead.status !== 'Lost') return false;
            }

            // Text Search
            if (filters.searchName && !lead.name.toLowerCase().includes(filters.searchName.toLowerCase())) return false;
            if (filters.searchCompany && !lead.company.toLowerCase().includes(filters.searchCompany.toLowerCase())) return false;
            if (filters.searchPhone && !lead.phone?.toLowerCase().includes(filters.searchPhone.toLowerCase())) return false;

            // Product Filter
            if (filters.product?.length > 0 && !filters.product.includes(lead.product)) return false;

            // Custom Field Filter
            if (filters.customField && lead.custom !== filters.customField) return false;

            // Source Filter
            if (filters.source && lead.source !== filters.source) return false;

            // Status Filter (Specific)
            if (filters.status && lead.status !== filters.status) return false;

            // Responsible Filter
            if (filters.responsible && lead.responsible !== filters.responsible) return false;

            // Date Filter
            if (filters.date) {
                const filterDateStr = format(filters.date, "EEE, dd/MMM");
                if (lead.nextStep?.date !== filterDateStr) return false;
            }

            // Contact Filter (Overdue/Today/Tomorrow)
            if (filters.contactFilter) {
                const nextStepDate = parseDateStr(lead.nextStep?.date);
                // Ensure valid date
                if (nextStepDate.getTime() >= 8640000000000000) return false;

                const now = new Date();
                const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                const tomorrowStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
                const dayAfterTomorrowStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 2);

                if (filters.contactFilter === 'overdue') {
                    if (nextStepDate >= todayStart) return false;
                } else if (filters.contactFilter === 'today') {
                    if (nextStepDate < todayStart || nextStepDate >= tomorrowStart) return false;
                } else if (filters.contactFilter === 'tomorrow') {
                    if (nextStepDate < tomorrowStart || nextStepDate >= dayAfterTomorrowStart) return false;
                }
            }

            // Qualification Filter
            if (filters.qualification && lead.qualification_status !== filters.qualification) return false;

            return true;
        });
    }, [leads, filters]);

    // Reset page when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [filters]);

    // Pagination Logic
    const totalItems = filteredLeads.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedLeads = filteredLeads.slice(startIndex, endIndex);


    const renderTag = (value: string | undefined, options: any[]) => {
        if (!value) return <span className="text-gray-500">-</span>;

        // Find option by checking specific properties since we know the structure
        const option = options?.find((o: any) => {
            const label = typeof o === 'string' ? o : o.label;
            return label === value;
        });

        // Use the found option or fallback to the value itself
        const displayOption = option || value;

        if (typeof displayOption === 'string') {
            return <span className="text-gray-300">{displayOption}</span>;
        }

        // It's a TagItem
        return (
            <span className={`px-2 py-0.5 rounded text-[10px] ${displayOption.bg} ${displayOption.text} border border-white/10 whitespace-nowrap`}>
                {displayOption.label}
            </span>
        );
    };

    const handleProgressClick = async (leadId: number, newProgress: number, currentProgress: number) => {
        let finalProgress = newProgress;

        // Toggle logic for the first dot (0 <-> 1)
        if (newProgress === 1 && currentProgress === 1) {
            finalProgress = 0;
        }

        // Optimistic update
        setLeads(prev => prev.map(l => {
            if (l.id === leadId) {
                return {
                    ...l,
                    nextStep: { ...l.nextStep, progress: finalProgress }
                };
            }
            return l;
        }));

        const result = await updateTouchpoint(leadId, finalProgress);
        if (!result.success) {
            toast.error("Failed to update progress");
        }
    };

    const handleDateSelect = async (leadId: number, date: Date | undefined) => {
        if (!date) return;
        const dateStr = format(date, "EEE, dd/MMM");

        // Optimistic update
        setLeads(prev => prev.map(l => {
            if (l.id === leadId) {
                return {
                    ...l,
                    nextStep: { ...l.nextStep, date: dateStr }
                };
            }
            return l;
        }));

        const result = await updateDate(leadId, dateStr);
        if (result.success) {
            toast.success("Date updated");
        } else {
            toast.error("Failed to update date");
        }
    };



    const handleDeleteLead = async () => {
        if (deleteLeadId) {
            const idToDelete = deleteLeadId;
            // Optimistic update
            setLeads(prev => prev.filter(l => l.id !== deleteLeadId));
            setDeleteLeadId(null);

            const result = await deleteLead(idToDelete);

            if (result.success) {
                toast.success("Lead deleted successfully");
            } else {
                toast.error("Failed to delete lead");
                // Optional: Revert optimistic update here if needed, but for deletion it's rare to fail
            }
        }
    };

    const handleMoveToWon = async (leadId: number) => {
        setLeads(prev => prev.map(l => l.id === leadId ? { ...l, status: "Won", destination: "Won" } : l));
        const result = await updateLead(leadId, { status: "Won" });
        if (result.success) {
            toast.success("Nice! Deal won.");
        } else {
            toast.error("Failed to move to Won");
        }
    };

    const handleMoveToLost = (leadId: number) => {
        setLostLeadId(leadId);
    };

    const handleConfirmLost = async (reason: string) => {
        if (!lostLeadId) return;

        const leadId = lostLeadId;

        // Optimistic UI update
        setLeads(prev => prev.map(l => l.id === leadId ? { ...l, status: "Lost", destination: "Lost", lost_reason: reason } : l));
        setLostLeadId(null);

        const result = await updateLead(leadId, { status: "Lost", lost_reason: reason });

        if (result.success) {
            toast.error("No problem. Let’s move forward.", {
                description: `Reason: ${reason}`
            });
        } else {
            toast.error("Failed to move to Lost");
        }
    }

    const handleReturnToLeads = async (leadId: number) => {
        // Optimistic update: Set status to "New" and move to top
        setLeads(prev => {
            const lead = prev.find(l => l.id === leadId);
            if (!lead) return prev;

            const updatedLead = { ...lead, status: "New" };
            // Remove from current position and add to top
            return [updatedLead, ...prev.filter(l => l.id !== leadId)];
        });

        const result = await updateLead(leadId, { status: "New" });
        if (result.success) {
            toast.success("Lead returned to active list");
        } else {
            toast.error("Failed to return lead");
        }
    };

    const handleAddHistoryMessage = async (message: string) => {
        if (!historyLead) return;

        const newHistoryItem = {
            id: Date.now().toString(),
            message: message,
            date: new Date()
        };

        // Optimistic update
        setLeads(prev => prev.map(l => {
            if (l.id === historyLead.id) {
                return {
                    ...l,
                    history: [...(l.history || []), newHistoryItem]
                };
            }
            return l;
        }));

        setHistoryLead(prev => prev ? {
            ...prev,
            history: [...(prev.history || []), newHistoryItem]
        } : null);

        // Server update
        const result = await updateHistory(historyLead.id, message);
        if (!result.success) {
            toast.error("Failed to save history message");
            // Optionally revert optimistic update here
        }
    };

    const handleSaveAmount = async (newAmount: string) => {
        // Legacy: keep for compatibility if needed, but UI now auto-calculates from products
        if (!amountLead) return;
        setLeads(prev => prev.map(l => l.id === amountLead.id ? { ...l, amount: newAmount } : l));

        // Parse amount to number for DB
        const numericAmount = parseFloat(newAmount.replace(/[^0-9.-]+/g, ""));
        if (!isNaN(numericAmount)) {
            const result = await updateLead(amountLead.id, { amount: numericAmount });
            if (!result.success) toast.error("Failed to save amount");
        }

        setAmountLead(null);
    };

    const handleProductChange = async (leadId: number, newProducts: string[], newTotal: number) => {
        // Optimistic update
        const formattedAmount = newTotal.toLocaleString('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2
        });

        // Store products as JSON string if multiple, or simple string if single (or adjust strategy)
        // Strat: Always JSON for robustness, but existing might be simple string.
        // Let's use JSON stringify for the update to support array.
        const productVal = JSON.stringify(newProducts);

        setLeads(prev => prev.map(l => {
            if (l.id === leadId) {
                return {
                    ...l,
                    product: productVal,
                    amount: formattedAmount
                };
            }
            return l;
        }));

        // DB Update
        // We need to update both product (as stringified array) and amount
        const result = await updateLead(leadId, {
            product: productVal,
            amount: newTotal
        });

        if (!result.success) {
            toast.error("Failed to update product/amount");
        }
    };

    return (
        <>
            <div className="bg-[#111] rounded-lg border border-white/5 flex flex-col flex-1 min-h-0 h-full overflow-hidden">
                <div className="w-full flex-1 min-h-0 overflow-y-auto custom-scrollbar">
                    <table className="w-full border-collapse">

                        <thead className="bg-[#1E1E1E] sticky top-0 z-10 border-b border-white/5">
                            <tr className="text-[10px] font-bold text-gray-500 tracking-wider">
                                {/* Name */}
                                <th className="px-3 py-1.5 text-left min-w-[140px]">
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger asChild><span>Name</span></TooltipTrigger>
                                            <TooltipContent><p>Lead's full name</p></TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                </th>
                                {/* Company */}
                                <th className="px-3 py-1.5 text-left min-w-[120px]">
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger asChild><span>Company</span></TooltipTrigger>
                                            <TooltipContent><p>Organization or business entity</p></TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                </th>
                                {/* Role */}
                                <th className="px-3 py-1.5 text-left min-w-[100px]">
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger asChild><span>Role</span></TooltipTrigger>
                                            <TooltipContent><p>Professional job title</p></TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                </th>
                                {/* Phone */}
                                <th className="px-2 py-1.5 text-center w-[36px]">
                                    <div className="flex justify-center">
                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger asChild><div><Phone size={13} /></div></TooltipTrigger>
                                                <TooltipContent><p>Contact phone number</p></TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
                                    </div>
                                </th>
                                {/* Email */}
                                <th className="px-2 py-1.5 text-center w-[36px]">
                                    <div className="flex justify-center">
                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger asChild><div><Mail size={13} /></div></TooltipTrigger>
                                                <TooltipContent><p>Email address</p></TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
                                    </div>
                                </th>
                                {/* LinkedIn */}
                                <th className="px-2 py-1.5 text-center w-[36px]">
                                    <div className="flex justify-center">
                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger asChild><div><Linkedin size={13} /></div></TooltipTrigger>
                                                <TooltipContent><p>LinkedIn profile</p></TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
                                    </div>
                                </th>
                                {/* Website */}
                                <th className="px-2 py-1.5 text-center w-[36px]">
                                    <div className="flex justify-center">
                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger asChild><div><Globe size={13} /></div></TooltipTrigger>
                                                <TooltipContent><p>Company website</p></TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
                                    </div>
                                </th>
                                {/* Next Step */}
                                <th className="px-3 py-1.5 pl-8 text-left min-w-[130px]">
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger asChild><span>Next Step</span></TooltipTrigger>
                                            <TooltipContent><p>Scheduled follow-up action</p></TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                </th>
                                {/* Touchpoints History */}
                                <th className="px-1 py-1.5 text-center w-[44px]">
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <div className="flex justify-center items-center gap-1">
                                                    <Link2 size={13} />
                                                    <MessageCircle size={13} />
                                                </div>
                                            </TooltipTrigger>
                                            <TooltipContent><p>Interaction history & logs</p></TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                </th>
                                {/* Product */}
                                <th className="px-3 py-1.5 text-left min-w-[160px] text-[10px]">
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger asChild><span>Product</span></TooltipTrigger>
                                            <TooltipContent><p>Interested product or service</p></TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                </th>
                                {/* Amount */}
                                <th className="px-3 py-1.5 text-left min-w-[90px]">
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger asChild><span>Amount</span></TooltipTrigger>
                                            <TooltipContent><p>Estimated potential value</p></TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                </th>
                                {/* Category/Custom */}
                                <th className="px-3 py-1.5 text-left min-w-[110px]">
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger asChild><span>{customFieldName}</span></TooltipTrigger>
                                            <TooltipContent><p>Lead classification/segment</p></TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                </th>
                                {/* Qualification */}
                                <th className="px-3 py-1.5 text-left min-w-[110px]">
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger asChild><span>Qualification</span></TooltipTrigger>
                                            <TooltipContent><p>Lead Qualification Status (MQL, SQL, etc)</p></TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                </th>
                                {/* Source */}
                                <th className="px-3 py-1.5 text-left min-w-[110px]">
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger asChild><span>Source</span></TooltipTrigger>
                                            <TooltipContent><p>Origin of the lead</p></TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                </th>
                                {/* Status */}
                                <th className="px-3 py-1.5 text-left min-w-[130px]">
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger asChild><span>Status</span></TooltipTrigger>
                                            <TooltipContent><p>Current pipeline stage</p></TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                </th>
                                {/* Responsible */}
                                <th className="px-3 py-1.5 text-left min-w-[120px]">
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger asChild><span>Responsible</span></TooltipTrigger>
                                            <TooltipContent><p>Assigned team member</p></TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                </th>
                                {/* Actions */}
                                <th className="px-3 py-1.5 text-center w-[50px]">
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger asChild><span>Actions</span></TooltipTrigger>
                                            <TooltipContent><p>Manage or delete lead</p></TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 bg-transparent">
                            {paginatedLeads.length === 0 ? (
                                <tr>
                                    <td colSpan={14} className="text-left py-8 text-gray-500 text-sm px-4">
                                        You haven't registered any leads yet. Register the first one.
                                    </td>
                                </tr>
                            ) : (
                                paginatedLeads.map((lead) => (
                                    <tr
                                        key={lead.id}
                                        className="hover:bg-white/5 transition-colors group"
                                    >
                                        <td className="px-3 py-1">
                                            <div className="font-medium text-white truncate text-[11px] max-w-[130px]">{lead.name}</div>
                                        </td>
                                        <td className="px-3 py-1">
                                            <div className="font-normal text-white/50 truncate text-[11px] max-w-[110px]">{lead.company}</div>
                                        </td>
                                        <td className="px-3 py-1">
                                            <div className="font-normal text-white/50 truncate text-[11px] max-w-[100px]">{lead.role || "-"}</div>
                                        </td>
                                        <td className="px-2 py-1">
                                            <div className="flex justify-center">
                                                <Popover>
                                                    <TooltipProvider>
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <PopoverTrigger asChild>
                                                                    <div className="p-1 rounded-md hover:bg-white/10 text-gray-400 hover:text-white transition-colors cursor-pointer" onClick={(e) => e.stopPropagation()}>
                                                                        <Phone size={14} />
                                                                    </div>
                                                                </PopoverTrigger>
                                                            </TooltipTrigger>
                                                            <TooltipContent>
                                                                <p>{lead.phone}</p>
                                                            </TooltipContent>
                                                        </Tooltip>
                                                    </TooltipProvider>
                                                    <PopoverContent className="w-auto p-3 bg-[#1A1A1A] border-white/10 text-white flex flex-col gap-2 z-[9999]" align="center" onClick={(e) => e.stopPropagation()}>
                                                        <p className="text-sm font-medium text-gray-300 text-center mb-1">{formatPhoneNumberIntl(lead.phone) || lead.phone}</p>
                                                        <div className="flex flex-col gap-1">
                                                            <a href={`tel:${lead.phone}`} className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-white/10 transition-colors text-xs text-white">
                                                                <Phone size={12} /> Make a call
                                                            </a>
                                                            <a href={`sms:${lead.phone}`} className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-white/10 transition-colors text-xs text-white">
                                                                <MessageCircle size={12} /> Send iMessage
                                                            </a>
                                                            <a href={`https://wa.me/${lead.phone?.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-white/10 transition-colors text-xs text-white">
                                                                <svg viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3">
                                                                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                                                                </svg>
                                                                Open WhatsApp
                                                            </a>
                                                        </div>
                                                    </PopoverContent>
                                                </Popover>
                                            </div>
                                        </td>
                                        <td className="px-2 py-1">
                                            <div className="flex justify-center">
                                                <Popover>
                                                    <TooltipProvider>
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <PopoverTrigger asChild>
                                                                    <div className="p-1 rounded-md hover:bg-white/10 text-gray-400 hover:text-white transition-colors cursor-pointer" onClick={(e) => e.stopPropagation()}>
                                                                        <Mail size={14} />
                                                                    </div>
                                                                </PopoverTrigger>
                                                            </TooltipTrigger>
                                                            <TooltipContent>
                                                                <p>{lead.email}</p>
                                                            </TooltipContent>
                                                        </Tooltip>
                                                    </TooltipProvider>
                                                    <PopoverContent className="w-auto p-1.5 bg-[#1A1A1A] border-white/10 text-white z-[9999] flex flex-col gap-1" align="center" onClick={(e) => e.stopPropagation()}>
                                                        <a
                                                            href={`mailto:${lead.email}`}
                                                            className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-white/10 transition-colors text-xs text-white w-full text-left"
                                                        >
                                                            <Mail size={13} />
                                                            Send Email
                                                        </a>
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                navigator.clipboard.writeText(lead.email);
                                                                toast.success("Email copied to clipboard");
                                                            }}
                                                            className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-white/10 transition-colors text-xs text-white w-full text-left"
                                                        >
                                                            <Copy size={13} />
                                                            Copy Email
                                                        </button>
                                                    </PopoverContent>
                                                </Popover>
                                            </div>
                                        </td>
                                        <td className="px-2 py-1">
                                            <div className="flex justify-center">
                                                <TooltipProvider>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <a
                                                                href={lead.linkedin}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="p-1 rounded-md block hover:bg-white/10 text-gray-400 hover:text-white transition-colors cursor-pointer"
                                                                onClick={(e) => e.stopPropagation()}
                                                            >
                                                                <Linkedin size={14} />
                                                            </a>
                                                        </TooltipTrigger>
                                                        <TooltipContent>
                                                            <p>{lead.linkedin}</p>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </TooltipProvider>
                                            </div>
                                        </td>
                                        <td className="px-2 py-1">
                                            <div className="flex justify-center">
                                                {lead.website ? (
                                                    <TooltipProvider>
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <a
                                                                    href={lead.website.startsWith('http') ? lead.website : `https://${lead.website}`}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="p-1 rounded-md block hover:bg-white/10 text-gray-400 hover:text-white transition-colors cursor-pointer"
                                                                    onClick={(e) => e.stopPropagation()}
                                                                >
                                                                    <Globe size={14} />
                                                                </a>
                                                            </TooltipTrigger>
                                                            <TooltipContent>
                                                                <p>{lead.website}</p>
                                                            </TooltipContent>
                                                        </Tooltip>
                                                    </TooltipProvider>
                                                ) : (
                                                    <div className="p-1 rounded-md text-gray-700 cursor-not-allowed">
                                                        <Globe size={13} />
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-3 py-1 pl-8">
                                            <div className="flex flex-col gap-1" onClick={(e) => e.stopPropagation()}>
                                                <Popover>
                                                    <PopoverTrigger asChild>
                                                        <button
                                                            className={`text-[11px] font-semibold hover:bg-white/10 rounded px-1 -ml-1 w-fit transition-colors text-left ${parseDateStr(lead.nextStep.date) < new Date(new Date().setHours(0, 0, 0, 0)) ? 'text-red-400' : 'text-gray-400'}`}
                                                        >
                                                            {lead.nextStep.date}
                                                            {getDaysRemaining(lead.nextStep.date) !== null && (
                                                                <span className="opacity-75"> ({getDaysRemaining(lead.nextStep.date)})</span>
                                                            )}
                                                        </button>
                                                    </PopoverTrigger>
                                                    <PopoverContent className="w-auto p-0" align="start">
                                                        <Calendar
                                                            mode="single"
                                                            selected={parseDateStr(lead.nextStep.date)}
                                                            onSelect={(date) => handleDateSelect(lead.id, date)}
                                                            initialFocus
                                                        />
                                                    </PopoverContent>
                                                </Popover>


                                                <div className="flex items-center gap-1">
                                                    <div className="flex space-x-1.5">
                                                        {[...Array(5)].map((_, i) => {
                                                            const stepIndex = i + 1;
                                                            const isActive = stepIndex <= lead.nextStep.progress && lead.nextStep.progress < 6;
                                                            // Step 5 is MsgSaida (Red), others are Green
                                                            const isMsgSaida = stepIndex === 5;

                                                            let bgColor = 'bg-gray-700 hover:bg-gray-600';
                                                            let shadow = '';

                                                            if (isActive) {
                                                                if (isMsgSaida) {
                                                                    bgColor = 'bg-red-500 hover:bg-red-400';
                                                                    shadow = 'shadow-[0_0_8px_rgba(239,68,68,0.4)]';
                                                                } else {
                                                                    bgColor = 'bg-green-500 hover:bg-green-400';
                                                                    shadow = 'shadow-[0_0_8px_rgba(34,197,94,0.4)]';
                                                                }
                                                            }

                                                            const tooltipText = isMsgSaida ? "Outbound message sent" : `Touch point ${stepIndex} done`;

                                                            return (
                                                                <TooltipProvider key={i}>
                                                                    <Tooltip>
                                                                        <TooltipTrigger asChild>
                                                                            <button
                                                                                onClick={(e) => {
                                                                                    e.stopPropagation();
                                                                                    handleProgressClick(lead.id, stepIndex, lead.nextStep.progress);
                                                                                }}
                                                                                className={`w-3 h-3 rounded-full transition-all hover:scale-110 focus:outline-none focus:ring-2 focus:ring-[#1C73E8]/50 ${bgColor} ${shadow}`}
                                                                            />
                                                                        </TooltipTrigger>
                                                                        <TooltipContent>
                                                                            <p>{tooltipText}</p>
                                                                        </TooltipContent>
                                                                    </Tooltip>
                                                                </TooltipProvider>
                                                            );
                                                        })}
                                                    </div>
                                                    <span className="text-[10px] text-gray-500 ml-1">{lead.nextStep.progress > 5 ? 5 : lead.nextStep.progress}/5</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-1 py-1">
                                            <div className="flex justify-center items-center gap-2">
                                                <TooltipProvider>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleProgressClick(lead.id, 6, lead.nextStep.progress);
                                                                }}
                                                                className={`w-3 h-3 rounded-full transition-all hover:scale-110 focus:outline-none focus:ring-2 focus:ring-[#1C73E8]/50 ${lead.nextStep.progress >= 6 ? 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.4)] hover:bg-blue-400' : 'bg-gray-700 hover:bg-gray-600'}`}
                                                            />
                                                        </TooltipTrigger>
                                                        <TooltipContent>
                                                            <p>Conversation Established</p>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </TooltipProvider>
                                                <div
                                                    className="cursor-pointer hover:bg-white/10 p-1.5 rounded-full transition-colors text-[#1C73E8]"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setHistoryLead(lead);
                                                    }}
                                                >
                                                    <MessageCircle size={14} />
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-3 py-1">
                                            <div onClick={(e) => e.stopPropagation()}>
                                                <CrmProductSelect
                                                    value={lead.product || "[]"}
                                                    options={settings.products || []}
                                                    onChange={(products, total) => handleProductChange(lead.id, products, total)}
                                                />
                                            </div>
                                        </td>
                                        <td className="px-3 py-1">
                                            <button
                                                className="font-mono text-gray-300 text-[12px] hover:text-white hover:bg-white/5 rounded px-1.5 py-0.5 transition-colors text-left"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setAmountLead(lead);
                                                }}
                                            >
                                                {/* Ensure amount is formatted if coming from DB as simple number string */}
                                                {lead.amount?.includes('$') ? lead.amount : (
                                                    (parseFloat(lead.amount) || 0).toLocaleString('en-US', {
                                                        style: 'currency',
                                                        currency: 'USD',
                                                        minimumFractionDigits: 2
                                                    })
                                                )}
                                            </button>
                                        </td>
                                        <td className="px-3 py-1">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <button
                                                        className={`flex items-center justify-between text-[11px] px-2 py-0.5 rounded w-full outline-none transition-colors border ${(() => {
                                                            const opt = CUSTOM_OPTIONS.find((o: any) => (typeof o === 'string' ? o : o.label) === lead.custom);
                                                            return (opt && typeof opt !== 'string' && opt.bg)
                                                                ? `${opt.bg} ${opt.text} border-white/10 font-medium`
                                                                : 'text-gray-400 border-transparent hover:bg-white/5 hover:text-white';
                                                        })()}`}
                                                        onClick={(e) => e.stopPropagation()}
                                                    >
                                                        <span className="whitespace-nowrap overflow-hidden text-ellipsis">
                                                            {lead.custom || <span className="text-gray-600 italic font-normal">Select...</span>}
                                                        </span>
                                                        <ChevronDown size={12} className="ml-2 shrink-0 opacity-50" />
                                                    </button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent className="w-[180px] p-1 bg-[#1A1A1A] border-white/10 text-white" align="start">
                                                    {CUSTOM_OPTIONS.map((opt: any) => {
                                                        const label = typeof opt === 'string' ? opt : opt.label;
                                                        return (
                                                            <DropdownMenuItem
                                                                key={label}
                                                                className="w-full text-left px-2 py-1.5 text-[12px] hover:bg-white/10 rounded-sm transition-colors text-gray-300 hover:text-white cursor-pointer focus:bg-white/10 focus:text-white"
                                                                onClick={async () => {
                                                                    setLeads(prev => prev.map(l => l.id === lead.id ? { ...l, custom: label } : l));
                                                                    const result = await updateLead(lead.id, { custom_field: label });
                                                                    if (!result.success) toast.error("Failed to update category");
                                                                }}
                                                            >
                                                                {typeof opt !== 'string' && (
                                                                    <span className={`w-2 h-2 rounded-full mr-2 ${opt.bg}`} />
                                                                )}
                                                                {label}
                                                            </DropdownMenuItem>
                                                        );
                                                    })}
                                                    <DropdownMenuSeparator className="bg-white/10 my-1" />
                                                    <DropdownMenuItem
                                                        className="w-full text-left px-2 py-1.5 text-[12px] hover:bg-white/10 rounded-sm transition-colors text-blue-400 hover:text-blue-300 cursor-pointer focus:bg-white/10 focus:text-blue-300 flex items-center gap-2"
                                                        onClick={() => setIsSettingsOpen(true)}
                                                    >
                                                        <Settings size={12} />
                                                        Manage...
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </td>
                                        {/* Qualification Column */}
                                        <td className="px-3 py-1">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <button
                                                        className={`flex items-center justify-between text-[11px] px-2 py-0.5 rounded outline-none transition-colors border w-fit ${(() => {
                                                            if (!lead.qualification_status || lead.qualification_status === 'pending') {
                                                                return 'text-gray-500 border-transparent hover:bg-white/5 hover:text-white';
                                                            }
                                                            switch (lead.qualification_status?.toLowerCase()) {
                                                                case 'mql': return "bg-blue-500/10 text-blue-400 border-blue-500/20 font-bold tracking-wider";
                                                                case 'sql': return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 font-bold tracking-wider";
                                                                case 'nq': return "bg-red-500/10 text-red-400 border-red-500/20 font-bold tracking-wider";
                                                                default: return 'text-gray-400 border-transparent';
                                                            }
                                                        })()}`}
                                                        onClick={(e) => e.stopPropagation()}
                                                    >
                                                        <span className="whitespace-nowrap uppercase">
                                                            {lead.qualification_status?.replace('_', ' ') || <span className="text-gray-600 italic font-normal normal-case">-</span>}
                                                        </span>
                                                        <ChevronDown size={12} className="ml-2 shrink-0 opacity-50" />
                                                    </button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent className="w-[150px] p-1 bg-[#1A1A1A] border-white/10 text-white" align="start">
                                                    {[
                                                        { label: 'MQL', value: 'mql', className: 'text-blue-400' },
                                                        { label: 'SQL', value: 'sql', className: 'text-emerald-400' },
                                                        { label: 'NQ', value: 'nq', className: 'text-red-400' }
                                                    ].map((option) => (
                                                        <DropdownMenuItem
                                                            key={option.value}
                                                            className={`w-full text-left px-2 py-1.5 text-[12px] hover:bg-white/10 rounded-sm transition-colors cursor-pointer focus:bg-white/10 focus:text-white ${option.className}`}
                                                            onClick={async () => {
                                                                // Optimistic update
                                                                setLeads(prev => prev.map(l => l.id === lead.id ? { ...l, qualification_status: option.value } : l));

                                                                const result = await updateLeadQualification(lead.id, option.value);
                                                                if (!result.success) {
                                                                    toast.error("Failed to update qualifcation");
                                                                    // Revert if needed, but rarely fails
                                                                }
                                                            }}
                                                        >
                                                            {option.label}
                                                        </DropdownMenuItem>
                                                    ))}
                                                    <DropdownMenuSeparator className="bg-white/10 my-1" />
                                                    <DropdownMenuItem
                                                        className="w-full text-left px-2 py-1.5 text-[12px] hover:bg-white/10 rounded-sm transition-colors text-gray-500 hover:text-gray-300 cursor-pointer focus:bg-white/10"
                                                        onClick={async () => {
                                                            setLeads(prev => prev.map(l => l.id === lead.id ? { ...l, qualification_status: 'pending' } : l));
                                                            await updateLeadQualification(lead.id, 'pending');
                                                        }}
                                                    >
                                                        Clear / Pending
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </td>
                                        <td className="px-3 py-1">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <button
                                                        className={`flex items-center justify-between text-[11px] px-2 py-0.5 rounded w-full outline-none transition-colors border ${(() => {
                                                            const opt = SOURCES.find((o: any) => (typeof o === 'string' ? o : o.label) === lead.source);
                                                            return (opt && typeof opt !== 'string' && opt.bg)
                                                                ? `${opt.bg} ${opt.text} border-white/10 font-medium`
                                                                : 'text-gray-400 border-transparent hover:bg-white/5 hover:text-white';
                                                        })()}`}
                                                        onClick={(e) => e.stopPropagation()}
                                                    >
                                                        <span className="whitespace-nowrap overflow-hidden text-ellipsis">
                                                            {lead.source || <span className="text-gray-600 italic font-normal">Select...</span>}
                                                        </span>
                                                        <ChevronDown size={12} className="ml-2 shrink-0 opacity-50" />
                                                    </button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent className="w-[180px] p-1 bg-[#1A1A1A] border-white/10 text-white" align="start">
                                                    {SOURCES.map((src: any) => {
                                                        const label = typeof src === 'string' ? src : src.label;
                                                        return (
                                                            <DropdownMenuItem
                                                                key={label}
                                                                className="w-full text-left px-2 py-1.5 text-[12px] hover:bg-white/10 rounded-sm transition-colors text-gray-300 hover:text-white cursor-pointer focus:bg-white/10 focus:text-white"
                                                                onClick={async () => {
                                                                    setLeads(prev => prev.map(l => l.id === lead.id ? { ...l, source: label } : l));
                                                                    const result = await updateLead(lead.id, { source: label });
                                                                    if (!result.success) toast.error("Failed to update source");
                                                                }}
                                                            >
                                                                {typeof src !== 'string' && (
                                                                    <span className={`w-2 h-2 rounded-full mr-2 ${src.bg}`} />
                                                                )}
                                                                {label}
                                                            </DropdownMenuItem>
                                                        );
                                                    })}
                                                    <DropdownMenuSeparator className="bg-white/10 my-1" />
                                                    <DropdownMenuItem
                                                        className="w-full text-left px-2 py-1.5 text-[12px] hover:bg-white/10 rounded-sm transition-colors text-blue-400 hover:text-blue-300 cursor-pointer focus:bg-white/10 focus:text-blue-300 flex items-center gap-2"
                                                        onClick={() => setIsSettingsOpen(true)}
                                                    >
                                                        <Settings size={12} />
                                                        Manage...
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </td>
                                        <td className="px-3 py-1">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <button
                                                        className="flex items-center gap-1 text-[11px] w-full outline-none group/status"
                                                        onClick={(e) => e.stopPropagation()}
                                                    >
                                                        {(() => {
                                                            let statusStyle = {
                                                                bg: 'bg-[#1C73E8]/10',
                                                                text: 'text-[#1C73E8]'
                                                            };

                                                            if (lead.status === 'Won') {
                                                                statusStyle = { bg: 'bg-green-500/10', text: 'text-green-500' };
                                                            } else if (lead.status === 'Lost') {
                                                                statusStyle = { bg: 'bg-red-500/10', text: 'text-red-500' };
                                                            } else {
                                                                const found = settings.statuses?.find(s => s.label === lead.status);
                                                                if (found) statusStyle = found;
                                                            }

                                                            return (
                                                                <div className={`${statusStyle.bg} ${statusStyle.text} border border-white/5 px-2 py-0.5 rounded text-[11px] font-bold flex items-center justify-between w-full min-w-fit hover:opacity-80 transition-opacity whitespace-nowrap gap-2`}>
                                                                    <span>{lead.status}</span>
                                                                    <ChevronDown size={12} className="shrink-0" />
                                                                </div>
                                                            );
                                                        })()}
                                                    </button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent className="w-[180px] p-1 bg-[#1A1A1A] border-white/10 text-white" align="start">
                                                    {(settings.statuses || []).map((status: any) => (
                                                        <DropdownMenuItem
                                                            key={status.label}
                                                            className="w-full text-left px-2 py-1.5 text-[12px] hover:bg-white/10 rounded-sm transition-colors text-gray-300 hover:text-white cursor-pointer focus:bg-white/10 focus:text-white"
                                                            onClick={async () => {
                                                                setLeads(prev => prev.map(l => l.id === lead.id ? { ...l, status: status.label } : l));
                                                                const result = await updateLead(lead.id, { status: status.label });
                                                                if (!result.success) toast.error("Failed to update status");
                                                            }}
                                                        >
                                                            <span className={`w-2 h-2 rounded-full mr-2 ${status.bg}`} />
                                                            {status.label}
                                                        </DropdownMenuItem>
                                                    ))}
                                                    <DropdownMenuSeparator className="bg-white/10 my-1" />
                                                    <DropdownMenuItem
                                                        className="w-full text-left px-2 py-1.5 text-[12px] hover:bg-white/10 rounded-sm transition-colors text-blue-400 hover:text-blue-300 cursor-pointer focus:bg-white/10 focus:text-blue-300 flex items-center gap-2"
                                                        onClick={() => setIsSettingsOpen(true)}
                                                    >
                                                        <Settings size={12} />
                                                        Manage...
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </td>
                                        <td className="px-3 py-1">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <button
                                                        className={`flex items-center justify-between text-[11px] px-2 py-0.5 rounded w-full outline-none transition-colors border ${(() => {
                                                            const opt = RESPONSIBLES.find((o: any) => (typeof o === 'string' ? o : o.label) === lead.responsible);
                                                            return (opt && typeof opt !== 'string' && opt.bg)
                                                                ? `${opt.bg} ${opt.text} border-white/10 font-medium`
                                                                : 'text-gray-400 border-transparent hover:bg-white/5 hover:text-white';
                                                        })()}`}
                                                        onClick={(e) => e.stopPropagation()}
                                                    >
                                                        <span className="whitespace-nowrap overflow-hidden text-ellipsis">
                                                            {lead.responsible || <span className="text-gray-600 italic font-normal">Select...</span>}
                                                        </span>
                                                        <ChevronDown size={12} className="ml-2 shrink-0 opacity-50" />
                                                    </button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent className="w-[180px] p-1 bg-[#1A1A1A] border-white/10 text-white" align="start">
                                                    {RESPONSIBLES.map((person: any) => {
                                                        const label = typeof person === 'string' ? person : person.label;
                                                        return (
                                                            <DropdownMenuItem
                                                                key={label}
                                                                className="w-full text-left px-2 py-1.5 text-[12px] hover:bg-white/10 rounded-sm transition-colors text-gray-300 hover:text-white cursor-pointer focus:bg-white/10 focus:text-white"
                                                                onClick={async () => {
                                                                    setLeads(prev => prev.map(l => l.id === lead.id ? { ...l, responsible: label } : l));
                                                                    const result = await updateLead(lead.id, { responsible: label });
                                                                    if (!result.success) toast.error("Failed to update responsible");
                                                                }}
                                                            >
                                                                {typeof person !== 'string' && (
                                                                    <span className={`w-2 h-2 rounded-full mr-2 ${person.bg}`} />
                                                                )}
                                                                {label}
                                                            </DropdownMenuItem>
                                                        );
                                                    })}
                                                    <DropdownMenuSeparator className="bg-white/10 my-1" />
                                                    <DropdownMenuItem
                                                        className="w-full text-left px-2 py-1.5 text-[12px] hover:bg-white/10 rounded-sm transition-colors text-blue-400 hover:text-blue-300 cursor-pointer focus:bg-white/10 focus:text-blue-300 flex items-center gap-2"
                                                        onClick={() => setIsSettingsOpen(true)}
                                                    >
                                                        <Settings size={12} />
                                                        Manage...
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </td>

                                        <td className="px-3 py-1 text-center">
                                            <div className="flex items-center justify-center gap-1">
                                                <button
                                                    className="text-gray-500 hover:text-white transition-colors p-1 rounded hover:bg-white/10 outline-none"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setEditLead(lead);
                                                    }}
                                                >
                                                    <Edit2 size={16} />
                                                </button>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <button className="text-gray-500 hover:text-white transition-colors p-1 rounded hover:bg-white/10 outline-none">
                                                            <MoreHorizontal size={16} />
                                                        </button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent className="w-[160px] bg-[#1A1A1A] border-white/10 text-white" align="end">
                                                        {lead.status === 'Won' || lead.status === 'Lost' ? (
                                                            <DropdownMenuItem
                                                                className="cursor-pointer hover:bg-white/10 text-[12px] focus:bg-white/10 focus:text-white"
                                                                onClick={() => handleReturnToLeads(lead.id)}
                                                            >
                                                                Return to leads
                                                            </DropdownMenuItem>
                                                        ) : (
                                                            <>
                                                                <DropdownMenuItem
                                                                    className="cursor-pointer hover:bg-white/10 text-[12px] focus:bg-white/10 focus:text-white"
                                                                    onClick={() => handleMoveToWon(lead.id)}
                                                                >
                                                                    Move to Won
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem
                                                                    className="cursor-pointer hover:bg-white/10 text-[12px] focus:bg-white/10 focus:text-white"
                                                                    onClick={() => handleMoveToLost(lead.id)}
                                                                >
                                                                    Move to Lost
                                                                </DropdownMenuItem>
                                                            </>
                                                        )}
                                                        <DropdownMenuSeparator className="bg-white/10" />
                                                        <DropdownMenuItem
                                                            className="cursor-pointer hover:bg-red-500/10 text-red-400 hover:text-red-300 text-[12px] focus:bg-red-500/10 focus:text-red-300"
                                                            onClick={() => setDeleteLeadId(lead.id)}
                                                        >
                                                            Delete
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div >

                {/* Pagination Footer */}
                <div className="flex items-center justify-between px-4 py-3 border-t border-white/5 bg-[#1E1E1E]/50 text-xs text-gray-400">
                    <div>
                        Showing <span className="text-white font-medium">{Math.min(startIndex + 1, totalItems)}</span> to <span className="text-white font-medium">{Math.min(endIndex, totalItems)}</span> of <span className="text-white font-medium">{totalItems}</span> results
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <span>Rows per page:</span>
                            <select
                                value={itemsPerPage}
                                onChange={(e) => {
                                    setItemsPerPage(Number(e.target.value));
                                    setCurrentPage(1);
                                }}
                                className="bg-[#1A1A1A] border border-white/10 rounded px-2 py-1 text-white outline-none focus:border-white/20 cursor-pointer"
                            >
                                <option value={15}>15</option>
                                <option value={30}>30</option>
                                <option value={50}>50</option>
                                <option value={100}>100</option>
                            </select>
                        </div>
                        <div className="flex items-center gap-2">
                            <span>Page {currentPage} of {Math.max(1, totalPages)}</span>
                            <div className="flex items-center gap-1">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                    disabled={currentPage === 1}
                                    className="h-6 w-6 p-0 hover:bg-white/10 disabled:opacity-30"
                                >
                                    <span className="sr-only">Previous page</span>
                                    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-4 w-4"><path d="M8.84182 3.13514C9.04327 3.32401 9.05348 3.64042 8.86462 3.84188L5.43521 7.49991L8.86462 11.1579C9.05348 11.3594 9.04327 11.6758 8.84182 11.8647C8.64036 12.0535 8.32394 12.0637 8.13508 11.8623L4.56325 8.05161C4.52254 8.00816 4.4892 7.96024 4.4638 7.90943C4.37944 7.74073 4.41112 7.53755 4.56325 7.37526L8.13508 3.56461C8.32394 3.36315 8.64036 3.37337 8.84182 3.13514Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path></svg>
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                    disabled={currentPage === totalPages || totalPages === 0}
                                    className="h-6 w-6 p-0 hover:bg-white/10 disabled:opacity-30"
                                >
                                    <span className="sr-only">Next page</span>
                                    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-4 w-4"><path d="M6.1584 3.13523C5.95694 3.3241 5.94673 3.64051 6.1356 3.84197L9.565 7.5L6.1356 11.158C5.94673 11.3595 5.95694 11.6759 6.1584 11.8648C6.35986 12.0536 6.67627 12.0638 6.86514 11.8624L10.437 8.05171C10.4777 8.00826 10.511 7.96024 10.5364 7.90953C10.6208 7.74083 10.5891 7.53765 10.437 7.37536L6.86514 3.5647C6.67627 3.36324 6.35986 3.37345 6.1584 3.13523Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path></svg>
                                </Button>
                            </div>
                        </div>
                    </div>
                </div >
            </div >

            <LeadDetailsModal
                isOpen={!!selectedLead}
                onClose={() => setSelectedLead(null)}
                lead={selectedLead}
            />

            <LeadHistoryModal
                isOpen={!!historyLead}
                onClose={() => setHistoryLead(null)}
                leadName={historyLead?.name}
                history={historyLead?.history || []}
                onAddMessage={handleAddHistoryMessage}
            />

            <LeadAmountModal
                isOpen={!!amountLead}
                onClose={() => setAmountLead(null)}
                currentAmount={amountLead?.amount || ""}
                onSave={handleSaveAmount}
            />

            {/* Lost Lead Modal */}
            <LostLeadModal
                isOpen={!!lostLeadId}
                onClose={() => setLostLeadId(null)}
                onConfirm={handleConfirmLost}
                reasons={settings.lost_reasons || []}
            />

            <CrmSettingsModal
                isOpen={isSettingsOpen}
                onClose={() => setIsSettingsOpen(false)}
                settings={settings}
            />

            <NewOpportunityModal
                isOpen={!!editLead}
                onClose={() => setEditLead(null)}
                settings={settings}
                initialData={editLead}
            />

            <AlertDialog open={!!deleteLeadId} onOpenChange={() => setDeleteLeadId(null)}>
                <AlertDialogContent className="bg-[#1A1A1A] border-white/10 text-white">
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription className="text-gray-400">
                            This action cannot be undone. This will permanently delete the lead from your list.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel className="bg-transparent border-white/10 text-white hover:bg-white/5 hover:text-white">Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteLead}
                            className="bg-red-600 hover:bg-red-700 text-white border-0"
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}

