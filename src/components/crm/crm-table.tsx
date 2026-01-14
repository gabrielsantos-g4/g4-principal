'use client';

import { Trash2, Edit2, CheckCircle2, MessageCircle, ExternalLink, ChevronDown, Phone, Mail, Linkedin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { LeadDetailsModal } from "./lead-details-modal";
import { LeadHistoryModal } from "./lead-history-modal";
import { LeadAmountModal } from "./lead-amount-modal";
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
        status: "Talking",
        history: [] as { id: string; message: string; date: Date }[]
    },
    { id: 2, name: "Aldemir", company: "Bulls", date: "27/Sep 08:18", phone: "+55 11 99999-9999", email: "aldemir@bulls.com", linkedin: "linkedin.com/in/aldemir", nextStep: { date: "Fri, 09/Jan", progress: 1, total: 5 }, amount: "30,00", status: "Talking", history: [] },
    { id: 3, name: "Deroba Caires", company: "Alma Candle", date: "27/Sep 11:44", phone: "+55 11 99999-9999", email: "deroba@alma.com", linkedin: "linkedin.com/in/deroba", nextStep: { date: "Fri, 09/Jan", progress: 2, total: 5 }, amount: "30,00", status: "Talking", history: [] },
    { id: 4, name: "Ticianny", company: "PCTec", date: "27/Sep 12:41", phone: "+55 11 99999-9999", email: "ticianny@pctec.com", linkedin: "linkedin.com/in/ticianny", nextStep: { date: "Fri, 09/Jan", progress: 1, total: 5 }, amount: "250,00", status: "Talking", history: [] },
    { id: 5, name: "Moça AOSA", company: "AOSA", date: "27/Sep 12:41", phone: "+55 11 99999-9999", email: "mosa@aosa.com", linkedin: "linkedin.com/in/mosa", nextStep: { date: "Fri, 09/Jan", progress: 1, total: 5 }, amount: "250,00", status: "Talking", history: [] },
    { id: 6, name: "Renato/Chris", company: "Brian", date: "27/Sep 18:49", phone: "+55 11 99999-9999", email: "renato@brian.com", linkedin: "linkedin.com/in/renato", nextStep: { date: "Fri, 09/Jan", progress: 1, total: 5 }, amount: "1.500,00", status: "Talking", history: [] },
    { id: 7, name: "Vanil/Iza", company: "PV Brasileira", date: "02/Dec 08:49", phone: "+55 11 99999-9999", email: "vanil@pv.com", linkedin: "linkedin.com/in/vanil", nextStep: { date: "Fri, 09/Jan", progress: 3, total: 5 }, amount: "30,00", status: "Talking", history: [] },
    { id: 8, name: "James", company: "Dwelling Place", date: "27/Sep 08:18", phone: "+55 11 99999-9999", email: "james@dwelling.com", linkedin: "linkedin.com/in/james", nextStep: { date: "Fri, 09/Jan", progress: 1, total: 5 }, amount: "1.500,00", status: "Talking", history: [] },
    { id: 9, name: "Aldemir", company: "Bulls", date: "27/Sep 08:18", phone: "+55 11 99999-9999", email: "aldemir@bulls.com", linkedin: "linkedin.com/in/aldemir", nextStep: { date: "Fri, 09/Jan", progress: 1, total: 5 }, amount: "30,00", status: "Talking", history: [] },
    { id: 10, name: "Deroba Caires", company: "Alma Candle", date: "27/Sep 11:44", phone: "+55 11 99999-9999", email: "deroba@alma.com", linkedin: "linkedin.com/in/deroba", nextStep: { date: "Fri, 09/Jan", progress: 2, total: 5 }, amount: "30,00", status: "Talking", history: [] },
    { id: 11, name: "Ticianny", company: "PCTec", date: "27/Sep 12:41", phone: "+55 11 99999-9999", email: "ticianny@pctec.com", linkedin: "linkedin.com/in/ticianny", nextStep: { date: "Fri, 09/Jan", progress: 1, total: 5 }, amount: "250,00", status: "Talking", history: [] },
    { id: 12, name: "Moça AOSA", company: "AOSA", date: "27/Sep 12:41", phone: "+55 11 99999-9999", email: "mosa@aosa.com", linkedin: "linkedin.com/in/mosa", nextStep: { date: "Fri, 09/Jan", progress: 1, total: 5 }, amount: "250,00", status: "Talking", history: [] },
    { id: 13, name: "Renato/Chris", company: "Brian", date: "27/Sep 18:49", phone: "+55 11 99999-9999", email: "renato@brian.com", linkedin: "linkedin.com/in/renato", nextStep: { date: "Fri, 09/Jan", progress: 1, total: 5 }, amount: "1.500,00", status: "Talking", history: [] },
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
                                <th className="px-4 py-3 text-left w-[12%]">
                                    <div className="flex items-center gap-1.5"><MessageCircle size={14} /> Amount</div>
                                </th>
                                <th className="px-4 py-3 text-left w-[100px]">Status</th>
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
                                        <div className="flex items-center gap-1.5 font-mono text-gray-300 text-[12px]">
                                            <div
                                                className="cursor-pointer hover:bg-white/10 p-1.5 rounded-full transition-colors text-[#1C73E8]"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setHistoryLead(lead);
                                                }}
                                            >
                                                <MessageCircle size={14} />
                                            </div>
                                            <button
                                                className="hover:text-white hover:bg-white/5 rounded px-1.5 py-0.5 transition-colors text-left"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setAmountLead(lead);
                                                }}
                                            >
                                                {lead.amount}
                                            </button>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="bg-[#1C73E8]/10 text-[#1C73E8] border border-[#1C73E8]/20 px-3 py-1 rounded text-[11px] font-bold flex items-center justify-between w-24 hover:bg-[#1C73E8]/20 transition-colors">
                                            {lead.status}
                                            <ChevronDown size={12} />
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

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
        </>
    );
}
