'use client';

import { Trash2, Edit2, CheckCircle2, MessageCircle, ExternalLink, ChevronDown, Phone, Mail, Linkedin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { LeadDetailsModal } from "./lead-details-modal";
import { LeadHistoryModal } from "./lead-history-modal";
import { LeadAmountModal } from "./lead-amount-modal";
import { CrmSettingsModal } from "./crm-settings-modal";
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

// Mock Data
const LEADS_DATA = [
    {
        id: 1,
        name: "James",
        company: "Dwelling Place",
        date: "27/Sep 08:18",
        phone: "+55 11 99999-9999",
        email: "james@dwelling.com",
        linkedin: "linkedin.com/in/james",
        nextStep: { date: "Fri, 09/Jan", progress: 1, total: 5 },
        amount: "1.500,00",
        source: "Instagram",
        custom: "Project A",
        status: "Talking",
        responsible: "Gabriel",
        history: [] as { id: string; message: string; date: Date }[]
    },
    { id: 2, name: "Aldemir", company: "Bulls", date: "27/Sep 08:18", phone: "+55 11 99999-9999", email: "aldemir@bulls.com", linkedin: "linkedin.com/in/aldemir", nextStep: { date: "Fri, 09/Jan", progress: 1, total: 5 }, amount: "30,00", source: "UTM: campaign_x", custom: "Internal", status: "Talking", responsible: "Vini", history: [] },
    { id: 3, name: "Deroba Caires", company: "Alma Candle", date: "27/Sep 11:44", phone: "+55 11 99999-9999", email: "deroba@alma.com", linkedin: "linkedin.com/in/deroba", nextStep: { date: "Fri, 09/Jan", progress: 2, total: 5 }, amount: "30,00", source: "Indication", custom: "", status: "Talking", responsible: "", history: [] },
    { id: 4, name: "Ticianny", company: "PCTec", date: "27/Sep 12:41", phone: "+55 11 99999-9999", email: "ticianny@pctec.com", linkedin: "linkedin.com/in/ticianny", nextStep: { date: "Fri, 09/Jan", progress: 1, total: 5 }, amount: "250,00", source: "LinkedIn", custom: "Project B", status: "Talking", responsible: "Nanda", history: [] },
    { id: 5, name: "Moça AOSA", company: "AOSA", date: "27/Sep 12:41", phone: "+55 11 99999-9999", email: "mosa@aosa.com", linkedin: "linkedin.com/in/mosa", nextStep: { date: "Fri, 09/Jan", progress: 1, total: 5 }, amount: "250,00", source: "Google Ads", custom: "Project A", status: "Talking", responsible: "", history: [] },
    { id: 6, name: "Renato/Chris", company: "Brian", date: "27/Sep 18:49", phone: "+55 11 99999-9999", email: "renato@brian.com", linkedin: "linkedin.com/in/renato", nextStep: { date: "Fri, 09/Jan", progress: 1, total: 5 }, amount: "1.500,00", source: "Instagram", custom: "", status: "Talking", responsible: "Leticia", history: [] },
    { id: 7, name: "Vanil/Iza", company: "PV Brasileira", date: "02/Dec 08:49", phone: "+55 11 99999-9999", email: "vanil@pv.com", linkedin: "linkedin.com/in/vanil", nextStep: { date: "Fri, 09/Jan", progress: 3, total: 5 }, amount: "30,00", source: "", custom: "Internal", status: "Talking", responsible: "", history: [] },
    { id: 8, name: "James", company: "Dwelling Place", date: "27/Sep 08:18", phone: "+55 11 99999-9999", email: "james@dwelling.com", linkedin: "linkedin.com/in/james", nextStep: { date: "Fri, 09/Jan", progress: 1, total: 5 }, amount: "1.500,00", source: "LinkedIn", custom: "Project B", status: "Talking", responsible: "Gabriel", history: [] },
    { id: 9, name: "Aldemir", company: "Bulls", date: "27/Sep 08:18", phone: "+55 11 99999-9999", email: "aldemir@bulls.com", linkedin: "linkedin.com/in/aldemir", nextStep: { date: "Fri, 09/Jan", progress: 1, total: 5 }, amount: "30,00", source: "", custom: "", status: "Talking", responsible: "", history: [] },
    { id: 10, name: "Deroba Caires", company: "Alma Candle", date: "27/Sep 11:44", phone: "+55 11 99999-9999", email: "deroba@alma.com", linkedin: "linkedin.com/in/deroba", nextStep: { date: "Fri, 09/Jan", progress: 2, total: 5 }, amount: "30,00", source: "", custom: "", status: "Talking", responsible: "", history: [] },
    { id: 11, name: "Ticianny", company: "PCTec", date: "27/Sep 12:41", phone: "+55 11 99999-9999", email: "ticianny@pctec.com", linkedin: "linkedin.com/in/ticianny", nextStep: { date: "Fri, 09/Jan", progress: 1, total: 5 }, amount: "250,00", source: "", custom: "", status: "Talking", responsible: "", history: [] },
    { id: 12, name: "Moça AOSA", company: "AOSA", date: "27/Sep 12:41", phone: "+55 11 99999-9999", email: "mosa@aosa.com", linkedin: "linkedin.com/in/mosa", nextStep: { date: "Fri, 09/Jan", progress: 1, total: 5 }, amount: "250,00", source: "", custom: "", status: "Talking", responsible: "", history: [] },
    { id: 13, name: "Renato/Chris", company: "Brian", date: "27/Sep 18:49", phone: "+55 11 99999-9999", email: "renato@brian.com", linkedin: "linkedin.com/in/renato", nextStep: { date: "Fri, 09/Jan", progress: 1, total: 5 }, amount: "1.500,00", source: "", custom: "", status: "Talking", responsible: "", history: [] },
];

// Helper type for HistoryItem since we are using mocking without DB
type LeadType = typeof LEADS_DATA[0];

function parseDateStr(str: string): Date {
    // Expected format: "Fri, 09/Jan"
    try {
        const parts = str.split(',')[1].trim().split('/'); // ["09", "Jan"]
        const day = parseInt(parts[0], 10);
        const monthStr = parts[1];

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

export function CrmTable() {
    const [leads, setLeads] = useState(LEADS_DATA);
    const [selectedLead, setSelectedLead] = useState<LeadType | null>(null);
    const [historyLead, setHistoryLead] = useState<LeadType | null>(null);
    const [amountLead, setAmountLead] = useState<LeadType | null>(null);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);

    const RESPONSIBLES = [
        "Gabriel",
        "Vini",
        "Nanda",
        "Leticia"
    ];

    const SOURCES = [
        "Instagram",
        "LinkedIn",
        "Google Ads",
        "Indication",
        "UTM: campaign_x"
    ];

    const [customFieldName] = useState("Category"); // Mock shared state
    const CUSTOM_OPTIONS = [
        "Project A",
        "Project B",
        "Internal"
    ];

    const [deleteLeadId, setDeleteLeadId] = useState<number | null>(null);

    const handleDeleteLead = () => {
        if (deleteLeadId) {
            setLeads(prev => prev.filter(l => l.id !== deleteLeadId));
            setDeleteLeadId(null);
        }
    };

    const handleMoveToWon = (leadId: number) => {
        setLeads(prev => prev.map(l => l.id === leadId ? { ...l, status: "Won", destination: "Won" } : l));
    };

    const handleMoveToLost = (leadId: number) => {
        setLeads(prev => prev.map(l => l.id === leadId ? { ...l, status: "Lost", destination: "Lost" } : l));
    };

    const handleDateSelect = (leadId: number, newDate: Date | undefined) => {
        if (!newDate) return;
        const newDateStr = formatDateStr(newDate);
        setLeads(prev => prev.map(l => l.id === leadId ? { ...l, nextStep: { ...l.nextStep, date: newDateStr } } : l));
    };

    const handleAddHistoryMessage = (message: string) => {
        if (!historyLead) return;

        const newHistoryItem = {
            id: Date.now().toString(),
            message: message,
            date: new Date()
        };

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
    };

    const handleSaveAmount = (newAmount: string) => {
        if (!amountLead) return;
        setLeads(prev => prev.map(l => l.id === amountLead.id ? { ...l, amount: newAmount } : l));
        setAmountLead(null);
    };

    return (
        <>
            <div className="bg-[#111] rounded-lg border border-white/5 overflow-hidden flex flex-col h-[calc(100vh-280px)]">
                <div className="overflow-y-auto flex-1 custom-scrollbar">
                    <table className="w-full border-collapse">
                        <thead className="bg-[#1E1E1E] sticky top-0 z-10 border-b border-white/5">
                            <tr className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                                <th className="px-4 py-3 text-left w-[18%]">Name</th>
                                <th className="px-4 py-3 text-left w-[16%]">Company</th>
                                <th className="px-4 py-3 text-center w-[40px]"><div className="flex justify-center"><Phone size={14} /></div></th>
                                <th className="px-4 py-3 text-center w-[40px]"><div className="flex justify-center"><Mail size={14} /></div></th>
                                <th className="px-4 py-3 text-center w-[40px]"><div className="flex justify-center"><Linkedin size={14} /></div></th>
                                <th className="px-4 py-3 text-left w-[18%]">Next Step</th>
                                <th className="px-4 py-3 text-center w-[50px]"><div className="flex justify-center"><MessageCircle size={14} /></div></th>
                                <th className="px-4 py-3 text-left w-[10%]">Amount</th>
                                <th className="px-4 py-3 text-left w-[15%]">{customFieldName}</th>
                                <th className="px-4 py-3 text-left w-[15%]">Source</th>
                                <th className="px-4 py-3 text-left w-[100px]">Status</th>
                                <th className="px-4 py-3 text-left w-[15%]">Responsible</th>
                                <th className="px-4 py-3 text-center w-[50px]">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 bg-transparent">
                            {leads.map((lead) => (
                                <tr
                                    key={lead.id}
                                    className="hover:bg-white/5 transition-colors group"
                                >
                                    <td className="px-4 py-3">
                                        <div className="font-medium text-white truncate text-xs">{lead.name}</div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="font-normal text-white/70 truncate text-xs">{lead.company}</div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex justify-center">
                                            <TooltipProvider>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <div className="p-1.5 rounded-md hover:bg-white/10 text-gray-500 hover:text-white transition-colors cursor-pointer">
                                                            <Phone size={14} />
                                                        </div>
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        <p>{lead.phone}</p>
                                                    </TooltipContent>
                                                </Tooltip>
                                            </TooltipProvider>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex justify-center">
                                            <TooltipProvider>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <div className="p-1.5 rounded-md hover:bg-white/10 text-gray-500 hover:text-white transition-colors cursor-pointer">
                                                            <Mail size={14} />
                                                        </div>
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        <p>{lead.email}</p>
                                                    </TooltipContent>
                                                </Tooltip>
                                            </TooltipProvider>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex justify-center">
                                            <TooltipProvider>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <div className="p-1.5 rounded-md hover:bg-white/10 text-gray-500 hover:text-white transition-colors cursor-pointer">
                                                            <Linkedin size={14} />
                                                        </div>
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        <p>{lead.linkedin}</p>
                                                    </TooltipContent>
                                                </Tooltip>
                                            </TooltipProvider>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex flex-col gap-1.5" onClick={(e) => e.stopPropagation()}>
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <button
                                                        className={`text-[11px] font-semibold hover:bg-white/10 rounded px-1 -ml-1 w-fit transition-colors text-left ${parseDateStr(lead.nextStep.date) < new Date(new Date().setHours(0, 0, 0, 0)) ? 'text-red-400' : 'text-gray-400'}`}
                                                    >
                                                        {lead.nextStep.date}
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
                                                    {[...Array(lead.nextStep.total)].map((_, i) => (
                                                        <button
                                                            key={i}
                                                            className={`w-3 h-3 rounded-full transition-all hover:scale-110 focus:outline-none focus:ring-2 focus:ring-[#1C73E8]/50 ${i < lead.nextStep.progress ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]' : 'bg-gray-700 hover:bg-gray-600'}`}
                                                        />
                                                    ))}
                                                </div>
                                                <span className="text-[10px] text-gray-500 ml-1">{lead.nextStep.progress}/{lead.nextStep.total}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex justify-center">
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
                                    <td className="px-4 py-3">
                                        <button
                                            className="font-mono text-gray-300 text-[12px] hover:text-white hover:bg-white/5 rounded px-1.5 py-0.5 transition-colors text-left"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setAmountLead(lead);
                                            }}
                                        >
                                            {lead.amount}
                                        </button>
                                    </td>
                                    <td className="px-4 py-3">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <button
                                                    className="flex items-center gap-1 text-[11px] text-gray-400 hover:text-white transition-colors hover:bg-white/5 px-2 py-1 rounded w-full outline-none"
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    {lead.custom || <span className="text-gray-600 italic">Select...</span>}
                                                    <ChevronDown size={12} className="ml-auto opacity-50" />
                                                </button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent className="w-[180px] p-1 bg-[#1A1A1A] border-white/10 text-white" align="start">
                                                {CUSTOM_OPTIONS.map((opt) => (
                                                    <DropdownMenuItem
                                                        key={opt}
                                                        className="w-full text-left px-2 py-1.5 text-[12px] hover:bg-white/10 rounded-sm transition-colors text-gray-300 hover:text-white cursor-pointer focus:bg-white/10 focus:text-white"
                                                        onClick={() => {
                                                            setLeads(prev => prev.map(l => l.id === lead.id ? { ...l, custom: opt } : l));
                                                        }}
                                                    >
                                                        {opt}
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
                                    <td className="px-4 py-3">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <button
                                                    className="flex items-center gap-1 text-[11px] text-gray-400 hover:text-white transition-colors hover:bg-white/5 px-2 py-1 rounded w-full outline-none"
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    {lead.source || <span className="text-gray-600 italic">Select...</span>}
                                                    <ChevronDown size={12} className="ml-auto opacity-50" />
                                                </button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent className="w-[180px] p-1 bg-[#1A1A1A] border-white/10 text-white" align="start">
                                                {SOURCES.map((src) => (
                                                    <DropdownMenuItem
                                                        key={src}
                                                        className="w-full text-left px-2 py-1.5 text-[12px] hover:bg-white/10 rounded-sm transition-colors text-gray-300 hover:text-white cursor-pointer focus:bg-white/10 focus:text-white"
                                                        onClick={() => {
                                                            setLeads(prev => prev.map(l => l.id === lead.id ? { ...l, source: src } : l));
                                                        }}
                                                    >
                                                        {src}
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
                                    <td className="px-4 py-3">
                                        <div className="bg-[#1C73E8]/10 text-[#1C73E8] border border-[#1C73E8]/20 px-3 py-1 rounded text-[11px] font-bold flex items-center justify-between w-24 hover:bg-[#1C73E8]/20 transition-colors">
                                            {lead.status}
                                            <ChevronDown size={12} />
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <button
                                                    className="flex items-center gap-1 text-[11px] text-gray-400 hover:text-white transition-colors hover:bg-white/5 px-2 py-1 rounded w-full outline-none"
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    {lead.responsible || <span className="text-gray-600 italic">Select...</span>}
                                                    <ChevronDown size={12} className="ml-auto opacity-50" />
                                                </button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent className="w-[180px] p-1 bg-[#1A1A1A] border-white/10 text-white" align="start">
                                                {RESPONSIBLES.map((person) => (
                                                    <DropdownMenuItem
                                                        key={person}
                                                        className="w-full text-left px-2 py-1.5 text-[12px] hover:bg-white/10 rounded-sm transition-colors text-gray-300 hover:text-white cursor-pointer focus:bg-white/10 focus:text-white"
                                                        onClick={() => {
                                                            setLeads(prev => prev.map(l => l.id === lead.id ? { ...l, responsible: person } : l));
                                                        }}
                                                    >
                                                        {person}
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

                                    <td className="px-4 py-3 text-center">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <button className="text-gray-500 hover:text-white transition-colors p-1 rounded hover:bg-white/10 outline-none">
                                                    <MoreHorizontal size={16} />
                                                </button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent className="w-[160px] bg-[#1A1A1A] border-white/10 text-white" align="end">
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
                                                <DropdownMenuSeparator className="bg-white/10" />
                                                <DropdownMenuItem
                                                    className="cursor-pointer hover:bg-red-500/10 text-red-400 hover:text-red-300 text-[12px] focus:bg-red-500/10 focus:text-red-300"
                                                    onClick={() => setDeleteLeadId(lead.id)}
                                                >
                                                    Delete
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table >
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

            <CrmSettingsModal
                isOpen={isSettingsOpen}
                onClose={() => setIsSettingsOpen(false)}
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
