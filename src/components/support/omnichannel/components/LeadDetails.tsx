
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import { Phone, Mail, Linkedin, Instagram, Facebook, MessageSquare, ChevronDown, MessageCircle, LayoutGrid, GraduationCap, ListChecks, Waypoints, BarChart3, PanelRight } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CrmProductSelect } from "@/components/crm/crm-product-select";
import { LeadHistoryModal } from "@/components/crm/lead-history-modal";
import { LeadAmountModal } from "@/components/crm/lead-amount-modal";
import { toast } from "sonner";
import { useState } from "react";
import { Conversation } from "./ConversationList";
import { MessagingUser } from "@/actions/users/get-messaging-users";
import { updateLead } from "@/actions/crm/update-lead";
import { updateLeadQualification } from "@/actions/crm/update-lead-qualification";
import { updateHistory } from "@/actions/crm/update-history";
import { updateDate } from "@/actions/crm/update-date";
import { updateTouchpoint } from "@/actions/crm/update-touchpoint";
import { cn } from "@/lib/utils";

// Helper functions locally or imported
function parseDateStr(str: string): Date {
    if (!str || str === "Pending") return new Date(8640000000000000);
    const isoDate = new Date(str);
    if (!isNaN(isoDate.getTime()) && str.includes('-')) return isoDate;
    try {
        const parts = str.split(',');
        if (parts.length < 2) return new Date();
        const dateParts = parts[1].trim().split('/');
        if (dateParts.length < 2) return new Date();
        const day = parseInt(dateParts[0], 10);
        const months: Record<string, number> = {
            'Jan': 0, 'Feb': 1, 'Mar': 2, 'Apr': 3, 'May': 4, 'Jun': 5,
            'Jul': 6, 'Aug': 7, 'Sep': 8, 'Oct': 9, 'Nov': 10, 'Dec': 11
        };
        const month = months[dateParts[1]] ?? 0;
        const date = new Date();
        date.setFullYear(new Date().getFullYear(), month, day);
        date.setHours(0, 0, 0, 0);
        return date;
    } catch (e) {
        return new Date();
    }
}

interface LeadDetailsProps {
    selectedConversation: Conversation | undefined;
    crmSettings: any;
    messagingUsers: MessagingUser[];
    currentUserId: string | null;
    onUpdateLead: (updates: Partial<Conversation>) => void; // Simplified update handler
    onTransfer: (userId: string) => void;
    onNavigate?: (tab: string) => void;
}

export function LeadDetails({
    selectedConversation,
    crmSettings,
    messagingUsers,
    currentUserId,
    onUpdateLead,
    onTransfer,
    onNavigate
}: LeadDetailsProps) {
    const [historyLead, setHistoryLead] = useState<any | null>(null);
    const [amountLead, setAmountLead] = useState<any | null>(null);

    // Derived settings
    const STATUSES = crmSettings?.statuses || [
        { label: "New", bg: "bg-blue-500/10", text: "text-blue-500" },
        { label: "Talking", bg: "bg-green-500/10", text: "text-green-500" },
        { label: "Won", bg: "bg-green-500/10", text: "text-green-500" },
        { label: "Lost", bg: "bg-red-500/10", text: "text-red-500" }
    ];
    const SOURCES = crmSettings?.sources || ["Instagram", "LinkedIn", "Google Ads"];

    // Real handlers
    const ensureId = (id: string) => {
        const numId = parseInt(id);
        return isNaN(numId) ? null : numId;
    };

    const handleDateSelect = async (date: Date | undefined) => {
        if (!date || !selectedConversation) return;
        const id = ensureId(selectedConversation.id);
        if (!id) return;

        // Optimistic
        const newNextStep = { ...selectedConversation.nextStep, date: date.toISOString() };
        onUpdateLead({ nextStep: newNextStep });
        toast.success(`Date updated to ${format(date, "EEE, dd/MMM")}`);

        await updateDate(id, date.toISOString());
    };

    const handleProgressClick = async (step: number) => {
        if (!selectedConversation) return;
        const id = ensureId(selectedConversation.id);
        if (!id) return;

        // Optimistic
        const newNextStep = { ...selectedConversation.nextStep, progress: step };
        onUpdateLead({ nextStep: newNextStep });
        toast.success(`Progress updated to step ${step}`);

        await updateTouchpoint(id, step);
    };

    const handleProductChange = async (products: string[], total: number) => {
        if (!selectedConversation) return;
        const id = ensureId(selectedConversation.id);
        if (!id) return;

        onUpdateLead({ product: JSON.stringify(products), amount: total.toString() });
        toast.success("Product updated");

        await updateLead(id, { product: JSON.stringify(products), amount: total });
    };

    const handleSaveAmount = async (amount: string) => {
        if (!selectedConversation) return;
        const id = ensureId(selectedConversation.id);
        if (!id) return;

        const numAmount = parseFloat(amount.replace(/[^0-9.-]+/g, ""));
        onUpdateLead({ amount: amount });
        setAmountLead(null);
        toast.success(`Amount saved`);

        await updateLead(id, { amount: numAmount });
    };

    const handleAddHistoryMessage = async (msg: string) => {
        if (!selectedConversation) return;
        const id = ensureId(selectedConversation.id);
        if (!id) return;

        // Optimistic update could be tricky for history array, but we can try if needed.
        // For now just rely on toast and revalidation (which might be slow).
        // Better:
        const newItem = { id: Date.now().toString(), message: msg, date: new Date() };
        onUpdateLead({ history: [...selectedConversation.history, newItem] });

        setHistoryLead(null);
        toast.success("History note added");

        await updateHistory(id, msg);
    };

    const handleStatusChange = async (newStatus: string) => {
        if (!selectedConversation) return;
        const id = ensureId(selectedConversation.id);
        if (!id) return;

        onUpdateLead({ status: newStatus as any });
        await updateLead(id, { status: newStatus });
    }

    const handleQualificationChange = async (newStatus: string) => {
        if (!selectedConversation) return;
        const id = ensureId(selectedConversation.id);
        if (!id) return;

        onUpdateLead({ qualification_status: newStatus as any });
        await updateLeadQualification(id, newStatus);
    }

    const handleSourceChange = async (newSource: string) => {
        if (!selectedConversation) return;
        const id = ensureId(selectedConversation.id);
        if (!id) return;

        onUpdateLead({ source: newSource });
        await updateLead(id, { source: newSource });
    }


    if (!selectedConversation) {
        return (
            <div className="w-12 border-l border-white/10 bg-[#111] h-full flex items-center justify-center text-gray-500 text-sm">
                <PanelRight size={16} className="opacity-20" />
            </div>
        );
    }

    return (
        <div className="border-l border-white/10 bg-[#111] flex h-full w-80 overflow-hidden">
            {/* Content Area */}
            <div className="flex-1 flex flex-col min-w-0 opacity-100 visible">
                <div className="flex-1 overflow-y-auto">
                    <div className="p-6 text-center">
                        <Avatar className="h-20 w-20 mx-auto mb-3">
                            <AvatarImage src={selectedConversation.contact.avatar} />
                            <AvatarFallback className="text-lg">{selectedConversation.contact.name[0]}</AvatarFallback>
                        </Avatar>
                        <h3 className="font-bold text-white text-lg truncate px-2">{selectedConversation.contact.name}</h3>
                        <p className="text-sm text-gray-400 font-medium mb-1 truncate px-2">{selectedConversation.contact.company}</p>

                        {/* Channel specific info */}
                        <p className="text-xs text-gray-500">
                            {(selectedConversation.channel === 'whatsapp' || selectedConversation.channel === 'sms') && (
                                <span className="flex items-center justify-center gap-2">
                                    <Phone size={12} />
                                    {/* @ts-ignore - dynamic prop */}
                                    {selectedConversation.contact.phone}
                                </span>
                            )}
                            {(selectedConversation.channel === 'email') && (
                                <span className="flex items-center justify-center gap-2">
                                    <Mail size={12} />
                                    {/* @ts-ignore */}
                                    {selectedConversation.contact.email}
                                </span>
                            )}
                            {(selectedConversation.channel === 'linkedin') && (
                                <span className="flex items-center justify-center gap-2">
                                    <Linkedin size={12} />
                                    /in/{selectedConversation.contact.name.toLowerCase().replace(/\s+/g, '')}
                                </span>
                            )}
                            {(selectedConversation.channel === 'instagram') && (
                                <span className="flex items-center justify-center gap-2">
                                    <Instagram size={12} />
                                    @{selectedConversation.contact.name.toLowerCase().replace(/\s+/g, '')}
                                </span>
                            )}
                            {(selectedConversation.channel === 'facebook') && (
                                <span className="flex items-center justify-center gap-2">
                                    <Facebook size={12} />
                                    /{selectedConversation.contact.name.toLowerCase().replace(/\s+/g, '')}
                                </span>
                            )}
                            {(selectedConversation.channel === 'web') && (
                                <span className="flex items-center justify-center gap-2">
                                    <MessageSquare size={12} />
                                    Global Visitor
                                </span>
                            )}
                        </p>
                    </div>

                    <div className="px-6 pb-6 flex flex-col gap-8">
                        <div className="flex flex-col gap-6">
                            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Deal Info</h4>

                            {/* Next Step & Date */}
                            <div className="space-y-2">
                                <span className="text-xs text-gray-400">Next Step</span>

                                {/* Unified Block with Date Below */}
                                <div className="flex flex-col gap-2">
                                    <div className="relative flex items-center justify-center gap-3 bg-white/5 p-3 rounded-lg w-full min-h-[70px]">
                                        <div className="flex space-x-2">
                                            {[...Array(5)].map((_, i) => {
                                                const stepIndex = i + 1;
                                                // @ts-ignore
                                                const isActive = stepIndex <= (selectedConversation.nextStep?.progress || 0);
                                                const isMsgSaida = stepIndex === 5;
                                                let bgColor = 'bg-gray-700';
                                                let shadow = '';
                                                if (isActive) {
                                                    if (isMsgSaida) { bgColor = 'bg-red-500'; shadow = 'shadow-[0_0_8px_rgba(239,68,68,0.4)]'; }
                                                    else { bgColor = 'bg-green-500'; shadow = 'shadow-[0_0_8px_rgba(34,197,94,0.4)]'; }
                                                }
                                                return (
                                                    <button key={i} onClick={() => handleProgressClick(stepIndex)} className={`w-3 h-3 rounded-full transition-all ${bgColor} ${shadow}`} />
                                                );
                                            })}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {/* @ts-ignore */}
                                            <button onClick={() => handleProgressClick(6)} className={`w-3 h-3 rounded-full transition-all ${(selectedConversation.nextStep?.progress || 0) >= 6 ? 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.4)]' : 'bg-gray-700'}`} />
                                        </div>

                                        {/* History Icon (Keep here, user only mentioned moving menu icon) */}
                                        <div className="absolute right-2 top-1/2 -translate-y-1/2">
                                            <div className="cursor-pointer hover:bg-white/10 p-1 rounded-full text-[#1C73E8]" onClick={() => setHistoryLead(selectedConversation)}>
                                                <MessageCircle size={14} />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex justify-end">
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                {/* @ts-ignore */}
                                                <button className={`text-xs font-bold hover:bg-white/10 rounded px-2 py-1 transition-colors ${parseDateStr(selectedConversation.nextStep?.date || "Pending") < new Date(new Date().setHours(0, 0, 0, 0)) ? 'text-red-400' : 'text-gray-400'}`}>
                                                    {selectedConversation.nextStep?.date ? format(parseDateStr(selectedConversation.nextStep?.date), "EEE, dd/MMM") : "Set Date"}
                                                </button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0" align="end">
                                                <Calendar mode="single" selected={parseDateStr(selectedConversation.nextStep?.date || "Pending")} onSelect={handleDateSelect} initialFocus />
                                            </PopoverContent>
                                        </Popover>
                                    </div>
                                </div>
                            </div>

                            {/* Product & Amount Stacked */}
                            <div className="flex flex-col gap-3">
                                <div className="space-y-1.5">
                                    <span className="text-xs text-gray-400">Product</span>
                                    {/* @ts-ignore */}
                                    <CrmProductSelect value={selectedConversation.product || "[]"} options={crmSettings?.products || []} onChange={handleProductChange} />
                                </div>
                                <div className="space-y-1.5">
                                    <span className="text-xs text-gray-400">Amount</span>
                                    <button
                                        className="w-full text-left font-mono text-xs bg-white/5 hover:bg-white/10 p-2 rounded text-gray-200 h-[34px] flex items-center"
                                        onClick={() => setAmountLead(selectedConversation)}
                                    >
                                        {/* @ts-ignore */}
                                        {selectedConversation.amount ? (
                                            <span>
                                                {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(parseFloat(selectedConversation.amount))}
                                            </span>
                                        ) : (
                                            <span className="text-gray-500">Set Amount</span>
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* Qualification */}
                            <div className="space-y-1.5">
                                <span className="text-xs text-gray-400">Qualification</span>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <button className={`flex items-center justify-between text-xs px-2 py-2 rounded w-full outline-none transition-colors border ${(() => {
                                            // @ts-ignore
                                            switch (selectedConversation.qualification_status?.toLowerCase()) {
                                                case 'mql': return "bg-blue-500/10 text-blue-400 border-blue-500/20 font-bold";
                                                case 'sql': return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 font-bold";
                                                case 'nq': return "bg-red-500/10 text-red-400 border-red-500/20 font-bold";
                                                default: return 'text-gray-400 border-white/5 bg-white/5';
                                            }
                                        })()}`}>
                                            {/* @ts-ignore */}
                                            <span className="uppercase">{selectedConversation.qualification_status || "Pending"}</span>
                                            <ChevronDown size={12} className="opacity-50" />
                                        </button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent className="w-[200px] bg-[#1A1A1A] border-white/10 text-white">
                                        <DropdownMenuItem className="text-blue-400" onClick={() => handleQualificationChange('mql')}>MQL</DropdownMenuItem>
                                        <DropdownMenuItem className="text-emerald-400" onClick={() => handleQualificationChange('sql')}>SQL</DropdownMenuItem>
                                        <DropdownMenuItem className="text-red-400" onClick={() => handleQualificationChange('nq')}>NQ</DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>

                            {/* Source */}
                            <div className="space-y-1.5">
                                <span className="text-xs text-gray-400">Source</span>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <button className="flex items-center justify-between text-xs px-2 py-2 rounded w-full outline-none transition-colors border border-white/5 bg-white/5 text-gray-300 hover:bg-white/10">
                                            {/* @ts-ignore */}
                                            <span>{selectedConversation.source}</span>
                                            <ChevronDown size={12} className="opacity-50" />
                                        </button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent className="w-[200px] bg-[#1A1A1A] border-white/10 text-white">
                                        {SOURCES.map((s: any) => (
                                            <DropdownMenuItem
                                                key={typeof s === 'string' ? s : s.label}
                                                onClick={() => handleSourceChange(typeof s === 'string' ? s : s.label)}
                                            >
                                                {typeof s === 'string' ? s : s.label}
                                            </DropdownMenuItem>
                                        ))}
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>

                            {/* Status Section */}
                            <div className="space-y-1.5 pt-2">
                                <span className="text-xs text-gray-400">Status/Action</span>
                                <Select
                                    value={selectedConversation.status}
                                    onValueChange={handleStatusChange}
                                >
                                    <SelectTrigger className="w-full bg-white/5 border-white/10 text-white h-9">
                                        <SelectValue placeholder="Select Status" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-[#1a1a1a] border-white/10 text-white">
                                        {STATUSES.map((s: any) => (
                                            <SelectItem
                                                key={s.label}
                                                value={s.label}
                                                className="focus:bg-white/10 focus:text-white cursor-pointer"
                                            >
                                                <div className="flex items-center">
                                                    <div className={`w-2 h-2 rounded-full mr-2 ${s.bg}`} />
                                                    <span className="text-white">{s.label}</span>
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-1.5">
                                <div className="flex flex-col gap-1">
                                    <span className="text-xs text-gray-400">Transfer to</span>
                                    {selectedConversation.quem_atende && (
                                        <span className="text-[10px] text-gray-500 italic">
                                            Conversation is with <span className="text-gray-300">{selectedConversation.quem_atende}</span>. Transfer to:
                                        </span>
                                    )}
                                </div>
                                <Select
                                    value={""}
                                    onValueChange={onTransfer}
                                >
                                    <SelectTrigger className="w-full bg-white/5 border-white/10 text-white h-9">
                                        <SelectValue placeholder="Select Responsible" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-[#1a1a1a] border-white/10 text-white">
                                        {messagingUsers
                                            .filter(user => user.id !== currentUserId)
                                            .map((user) => (
                                                <SelectItem
                                                    key={user.id}
                                                    value={user.id}
                                                    className="focus:bg-white/10 focus:text-white cursor-pointer"
                                                >
                                                    <div className="flex items-center gap-2">
                                                        <span>{user.name}</span>
                                                    </div>
                                                </SelectItem>
                                            ))}
                                    </SelectContent>
                                </Select>
                            </div>

                        </div>
                    </div>
                </div>
            </div>


            <LeadHistoryModal
                isOpen={!!historyLead}
                onClose={() => setHistoryLead(null)}
                leadName={historyLead?.contact.name}
                history={historyLead?.history || []}
                onAddMessage={handleAddHistoryMessage}
            />

            <LeadAmountModal
                isOpen={!!amountLead}
                onClose={() => setAmountLead(null)}
                currentAmount={amountLead?.amount || ""}
                onSave={handleSaveAmount}
            />
        </div>
    );
}
