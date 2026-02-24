import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Phone, Mail, Linkedin, Instagram, Facebook, MessageSquare, ChevronDown, ChevronUp, MessageCircle, LayoutGrid, GraduationCap, ListChecks, Waypoints, BarChart3, PanelRight, Plus, Trash2, GripVertical, Globe, Briefcase, User, Edit2, Check, X } from "lucide-react";
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
    const [editingField, setEditingField] = useState<string | null>(null);
    const [editValues, setEditValues] = useState<Record<string, string>>({});
    const [historyExpanded, setHistoryExpanded] = useState(false);

    // Derived settings
    const STATUSES = crmSettings?.statuses || [
        { label: "New", bg: "bg-blue-500/10", text: "text-blue-500" },
        { label: "Talking", bg: "bg-green-500/10", text: "text-green-500" },
        { label: "Won", bg: "bg-green-500/10", text: "text-green-500" },
        { label: "Lost", bg: "bg-red-500/10", text: "text-red-500" }
    ];
    const SOURCES = crmSettings?.sources || ["Instagram", "LinkedIn", "Google Ads"];

    // Real handlers
    const ensureId = (leadId?: number) => {
        return leadId || null;
    };

    const handleFieldEdit = (field: string, currentValue: string) => {
        setEditingField(field);
        setEditValues({ ...editValues, [field]: currentValue || '' });
    };

    const handleFieldSave = async (field: string) => {
        if (!selectedConversation) return;
        const id = ensureId(selectedConversation.leadId);
        if (!id) {
            toast.error('Invalid lead ID');
            return;
        }

        const value = editValues[field];
        
        // Optimistic update
        onUpdateLead({ 
            contact: { 
                ...selectedConversation.contact, 
                [field]: value 
            } 
        } as any);

        toast.promise(
            updateLead(id, { [field]: value }),
            {
                loading: 'Updating...',
                success: () => {
                    setEditingField(null);
                    return `${field} updated`;
                },
                error: 'Failed to update'
            }
        );
    };

    const handleFieldCancel = () => {
        setEditingField(null);
        setEditValues({});
    };

    const handleDateSelect = async (date: Date | undefined) => {
        if (!date || !selectedConversation) return;
        const id = ensureId(selectedConversation.leadId);
        if (!id) return;

        // Optimistic
        const newNextStep = { ...selectedConversation.nextStep, date: date.toISOString() };
        onUpdateLead({ nextStep: newNextStep });
        toast.success(`Date updated to ${format(date, "EEE, dd/MMM")}`);

        await updateDate(id, date.toISOString());
    };

    const handleProgressClick = async (step: number) => {
        if (!selectedConversation) return;
        const id = ensureId(selectedConversation.leadId);
        if (!id) return;

        // Optimistic
        const newNextStep = { ...selectedConversation.nextStep, progress: step };
        onUpdateLead({ nextStep: newNextStep });
        toast.success(`Progress updated to step ${step}`);

        await updateTouchpoint(id, step);
    };

    const handleProductChange = async (products: string[], total: number) => {
        if (!selectedConversation) return;
        const id = ensureId(selectedConversation.leadId);
        if (!id) return;

        onUpdateLead({ product: JSON.stringify(products), amount: total.toString() });
        toast.success("Product updated");

        await updateLead(id, { product: JSON.stringify(products), amount: total });
    };

    const handleSaveAmount = async (amount: string) => {
        if (!selectedConversation) return;
        const id = ensureId(selectedConversation.leadId);
        if (!id) return;

        const numAmount = parseFloat(amount.replace(/[^0-9.-]+/g, ""));
        onUpdateLead({ amount: amount });
        setAmountLead(null);
        toast.success(`Amount saved`);

        await updateLead(id, { amount: numAmount });
    };

    const handleAddHistoryMessage = async (msg: string) => {
        if (!selectedConversation) return;
        const id = ensureId(selectedConversation.leadId);
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
        const id = ensureId(selectedConversation.leadId);
        if (!id) return;

        console.log('[LeadDetails] Updating status to:', newStatus, 'for lead ID:', id);

        // Optimistic update
        onUpdateLead({ status: newStatus as any });
        
        toast.promise(
            updateLead(id, { status: newStatus }),
            {
                loading: 'Updating status...',
                success: () => {
                    console.log('[LeadDetails] Status updated successfully');
                    return `Status updated to ${newStatus}`;
                },
                error: (err) => {
                    console.error('[LeadDetails] Failed to update status:', err);
                    return 'Failed to update status';
                }
            }
        );
    }

    const handleQualificationChange = async (newStatus: string) => {
        if (!selectedConversation) return;
        const id = ensureId(selectedConversation.leadId);
        if (!id) return;

        console.log('[LeadDetails] Updating qualification to:', newStatus, 'for lead ID:', id);

        // Optimistic update
        onUpdateLead({ qualification_status: newStatus as any });
        
        toast.promise(
            updateLeadQualification(id, newStatus),
            {
                loading: 'Updating qualification...',
                success: () => {
                    console.log('[LeadDetails] Qualification updated successfully');
                    return `Qualification updated to ${newStatus.toUpperCase()}`;
                },
                error: (err) => {
                    console.error('[LeadDetails] Failed to update qualification:', err);
                    return 'Failed to update qualification';
                }
            }
        );
    }

    const handleSourceChange = async (newSource: string) => {
        if (!selectedConversation) return;
        const id = ensureId(selectedConversation.leadId);
        if (!id) return;

        console.log('[LeadDetails] Updating source to:', newSource, 'for lead ID:', id);

        // Optimistic update
        onUpdateLead({ source: newSource });
        
        toast.promise(
            updateLead(id, { source: newSource }),
            {
                loading: 'Updating source...',
                success: () => {
                    console.log('[LeadDetails] Source updated successfully');
                    return `Source updated to ${newSource}`;
                },
                error: (err) => {
                    console.error('[LeadDetails] Failed to update source:', err);
                    return 'Failed to update source';
                }
            }
        );
    }

    const handleCustomFieldChange = async (newValue: string) => {
        if (!selectedConversation) return;
        const id = ensureId(selectedConversation.leadId);
        if (!id) return;

        console.log('[LeadDetails] Updating custom field to:', newValue, 'for lead ID:', id);

        // Optimistic update
        onUpdateLead({ custom: newValue });
        
        toast.promise(
            updateLead(id, { custom_field: newValue }),
            {
                loading: 'Updating...',
                success: () => {
                    console.log('[LeadDetails] Custom field updated successfully');
                    return `${crmSettings?.custom_fields?.name || 'Custom field'} updated`;
                },
                error: (err) => {
                    console.error('[LeadDetails] Failed to update custom field:', err);
                    return 'Failed to update';
                }
            }
        );
    }



    if (!selectedConversation) {
        return (
            <div className="w-12 border-l border-white/8 bg-[#111] h-full flex items-center justify-center">
                <div className="w-0.5 h-12 bg-white/5 rounded-full" />
            </div>
        );
    }

    return (
        <div className="border-l border-white/8 bg-[#111] flex h-full w-[260px] overflow-hidden shrink-0">
            {/* Content Area */}
            <div className="flex-1 flex flex-col min-w-0 opacity-100 visible">
                <div className="flex-1 overflow-y-auto">
                    {/* Contact Header */}
                    <div className="p-4 border-b border-white/5">
                        <Avatar className="h-14 w-14 mx-auto mb-3 border-2 border-white/10">
                            <AvatarImage src={selectedConversation.contact.avatar} />
                            <AvatarFallback className="text-base font-bold bg-[#1C73E8]/15 text-[#6ea8fe]">{selectedConversation.contact.name[0]}</AvatarFallback>
                        </Avatar>
                    </div>

                    {/* Editable Contact Fields */}
                    <div className="px-4 py-3 space-y-3 border-b border-white/5">
                        {/* Name */}
                        <div className="space-y-1">
                            <div className="flex items-center justify-between">
                                <label className="text-[10px] text-gray-500 font-medium uppercase tracking-wider flex items-center gap-1">
                                    <User size={10} />
                                    Name
                                </label>
                                {editingField !== 'name' && (
                                    <button 
                                        onClick={() => handleFieldEdit('name', selectedConversation.contact.name)}
                                        className="text-gray-600 hover:text-white transition-colors"
                                    >
                                        <Edit2 size={11} />
                                    </button>
                                )}
                            </div>
                            {editingField === 'name' ? (
                                <div className="flex gap-1">
                                    <Input
                                        value={editValues.name || ''}
                                        onChange={(e) => setEditValues({ ...editValues, name: e.target.value })}
                                        className="h-7 text-xs bg-white/5 border-white/10 text-white"
                                        autoFocus
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') handleFieldSave('name');
                                            if (e.key === 'Escape') handleFieldCancel();
                                        }}
                                    />
                                    <Button size="icon" className="h-7 w-7 bg-green-600 hover:bg-green-700" onClick={() => handleFieldSave('name')}>
                                        <Check size={12} />
                                    </Button>
                                    <Button size="icon" variant="ghost" className="h-7 w-7" onClick={handleFieldCancel}>
                                        <X size={12} />
                                    </Button>
                                </div>
                            ) : (
                                <p className="text-sm text-white font-medium truncate">{selectedConversation.contact.name || '-'}</p>
                            )}
                        </div>

                        {/* Company */}
                        <div className="space-y-1">
                            <div className="flex items-center justify-between">
                                <label className="text-[10px] text-gray-500 font-medium uppercase tracking-wider flex items-center gap-1">
                                    <Briefcase size={10} />
                                    Company
                                </label>
                                {editingField !== 'company' && (
                                    <button 
                                        onClick={() => handleFieldEdit('company', selectedConversation.contact.company || '')}
                                        className="text-gray-600 hover:text-white transition-colors"
                                    >
                                        <Edit2 size={11} />
                                    </button>
                                )}
                            </div>
                            {editingField === 'company' ? (
                                <div className="flex gap-1">
                                    <Input
                                        value={editValues.company || ''}
                                        onChange={(e) => setEditValues({ ...editValues, company: e.target.value })}
                                        className="h-7 text-xs bg-white/5 border-white/10 text-white"
                                        autoFocus
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') handleFieldSave('company');
                                            if (e.key === 'Escape') handleFieldCancel();
                                        }}
                                    />
                                    <Button size="icon" className="h-7 w-7 bg-green-600 hover:bg-green-700" onClick={() => handleFieldSave('company')}>
                                        <Check size={12} />
                                    </Button>
                                    <Button size="icon" variant="ghost" className="h-7 w-7" onClick={handleFieldCancel}>
                                        <X size={12} />
                                    </Button>
                                </div>
                            ) : (
                                <p className="text-xs text-gray-400 truncate">{selectedConversation.contact.company || '-'}</p>
                            )}
                        </div>

                        {/* Role */}
                        <div className="space-y-1">
                            <div className="flex items-center justify-between">
                                <label className="text-[10px] text-gray-500 font-medium uppercase tracking-wider">Role</label>
                                {editingField !== 'role' && (
                                    <button 
                                        onClick={() => handleFieldEdit('role', selectedConversation.contact.role || '')}
                                        className="text-gray-600 hover:text-white transition-colors"
                                    >
                                        <Edit2 size={11} />
                                    </button>
                                )}
                            </div>
                            {editingField === 'role' ? (
                                <div className="flex gap-1">
                                    <Input
                                        value={editValues.role || ''}
                                        onChange={(e) => setEditValues({ ...editValues, role: e.target.value })}
                                        className="h-7 text-xs bg-white/5 border-white/10 text-white"
                                        autoFocus
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') handleFieldSave('role');
                                            if (e.key === 'Escape') handleFieldCancel();
                                        }}
                                    />
                                    <Button size="icon" className="h-7 w-7 bg-green-600 hover:bg-green-700" onClick={() => handleFieldSave('role')}>
                                        <Check size={12} />
                                    </Button>
                                    <Button size="icon" variant="ghost" className="h-7 w-7" onClick={handleFieldCancel}>
                                        <X size={12} />
                                    </Button>
                                </div>
                            ) : (
                                <p className="text-xs text-gray-400 truncate">{selectedConversation.contact.role || '-'}</p>
                            )}
                        </div>

                        {/* Phone */}
                        <div className="space-y-1">
                            <div className="flex items-center justify-between">
                                <label className="text-[10px] text-gray-500 font-medium uppercase tracking-wider flex items-center gap-1">
                                    <Phone size={10} />
                                    Phone
                                </label>
                                {editingField !== 'phone' && (
                                    <button 
                                        onClick={() => handleFieldEdit('phone', selectedConversation.contact.phone || '')}
                                        className="text-gray-600 hover:text-white transition-colors"
                                    >
                                        <Edit2 size={11} />
                                    </button>
                                )}
                            </div>
                            {editingField === 'phone' ? (
                                <div className="flex gap-1">
                                    <Input
                                        value={editValues.phone || ''}
                                        onChange={(e) => setEditValues({ ...editValues, phone: e.target.value })}
                                        className="h-7 text-xs bg-white/5 border-white/10 text-white"
                                        autoFocus
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') handleFieldSave('phone');
                                            if (e.key === 'Escape') handleFieldCancel();
                                        }}
                                    />
                                    <Button size="icon" className="h-7 w-7 bg-green-600 hover:bg-green-700" onClick={() => handleFieldSave('phone')}>
                                        <Check size={12} />
                                    </Button>
                                    <Button size="icon" variant="ghost" className="h-7 w-7" onClick={handleFieldCancel}>
                                        <X size={12} />
                                    </Button>
                                </div>
                            ) : (
                                <p className="text-xs text-gray-400 truncate">{selectedConversation.contact.phone || '-'}</p>
                            )}
                        </div>

                        {/* Email */}
                        <div className="space-y-1">
                            <div className="flex items-center justify-between">
                                <label className="text-[10px] text-gray-500 font-medium uppercase tracking-wider flex items-center gap-1">
                                    <Mail size={10} />
                                    Email
                                </label>
                                {editingField !== 'email' && (
                                    <button 
                                        onClick={() => handleFieldEdit('email', selectedConversation.contact.email || '')}
                                        className="text-gray-600 hover:text-white transition-colors"
                                    >
                                        <Edit2 size={11} />
                                    </button>
                                )}
                            </div>
                            {editingField === 'email' ? (
                                <div className="flex gap-1">
                                    <Input
                                        value={editValues.email || ''}
                                        onChange={(e) => setEditValues({ ...editValues, email: e.target.value })}
                                        className="h-7 text-xs bg-white/5 border-white/10 text-white"
                                        autoFocus
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') handleFieldSave('email');
                                            if (e.key === 'Escape') handleFieldCancel();
                                        }}
                                    />
                                    <Button size="icon" className="h-7 w-7 bg-green-600 hover:bg-green-700" onClick={() => handleFieldSave('email')}>
                                        <Check size={12} />
                                    </Button>
                                    <Button size="icon" variant="ghost" className="h-7 w-7" onClick={handleFieldCancel}>
                                        <X size={12} />
                                    </Button>
                                </div>
                            ) : (
                                <p className="text-xs text-gray-400 truncate">{selectedConversation.contact.email || '-'}</p>
                            )}
                        </div>

                        {/* LinkedIn */}
                        <div className="space-y-1">
                            <div className="flex items-center justify-between">
                                <label className="text-[10px] text-gray-500 font-medium uppercase tracking-wider flex items-center gap-1">
                                    <Linkedin size={10} />
                                    LinkedIn
                                </label>
                                {editingField !== 'linkedin' && (
                                    <button 
                                        onClick={() => handleFieldEdit('linkedin', (selectedConversation as any).linkedin || '')}
                                        className="text-gray-600 hover:text-white transition-colors"
                                    >
                                        <Edit2 size={11} />
                                    </button>
                                )}
                            </div>
                            {editingField === 'linkedin' ? (
                                <div className="flex gap-1">
                                    <Input
                                        value={editValues.linkedin || ''}
                                        onChange={(e) => setEditValues({ ...editValues, linkedin: e.target.value })}
                                        className="h-7 text-xs bg-white/5 border-white/10 text-white"
                                        placeholder="linkedin.com/in/..."
                                        autoFocus
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') handleFieldSave('linkedin');
                                            if (e.key === 'Escape') handleFieldCancel();
                                        }}
                                    />
                                    <Button size="icon" className="h-7 w-7 bg-green-600 hover:bg-green-700" onClick={() => handleFieldSave('linkedin')}>
                                        <Check size={12} />
                                    </Button>
                                    <Button size="icon" variant="ghost" className="h-7 w-7" onClick={handleFieldCancel}>
                                        <X size={12} />
                                    </Button>
                                </div>
                            ) : (
                                <p className="text-xs text-gray-400 truncate">{(selectedConversation as any).linkedin || '-'}</p>
                            )}
                        </div>

                        {/* Website */}
                        <div className="space-y-1">
                            <div className="flex items-center justify-between">
                                <label className="text-[10px] text-gray-500 font-medium uppercase tracking-wider flex items-center gap-1">
                                    <Globe size={10} />
                                    Website
                                </label>
                                {editingField !== 'website' && (
                                    <button 
                                        onClick={() => handleFieldEdit('website', (selectedConversation as any).website || '')}
                                        className="text-gray-600 hover:text-white transition-colors"
                                    >
                                        <Edit2 size={11} />
                                    </button>
                                )}
                            </div>
                            {editingField === 'website' ? (
                                <div className="flex gap-1">
                                    <Input
                                        value={editValues.website || ''}
                                        onChange={(e) => setEditValues({ ...editValues, website: e.target.value })}
                                        className="h-7 text-xs bg-white/5 border-white/10 text-white"
                                        placeholder="https://..."
                                        autoFocus
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') handleFieldSave('website');
                                            if (e.key === 'Escape') handleFieldCancel();
                                        }}
                                    />
                                    <Button size="icon" className="h-7 w-7 bg-green-600 hover:bg-green-700" onClick={() => handleFieldSave('website')}>
                                        <Check size={12} />
                                    </Button>
                                    <Button size="icon" variant="ghost" className="h-7 w-7" onClick={handleFieldCancel}>
                                        <X size={12} />
                                    </Button>
                                </div>
                            ) : (
                                <p className="text-xs text-gray-400 truncate">{(selectedConversation as any).website || '-'}</p>
                            )}
                        </div>
                    </div>

                    <div className="px-4 pb-6 pt-4 flex flex-col gap-6">
                        <div className="flex flex-col gap-6">


                            {/* Next Step & Date */}
                            <div className="space-y-2">
                                {/* Unified Horizontal Block */}
                                <div className="flex flex-col gap-1">
                                    <span className="text-xs text-gray-500 font-medium ml-1">Next Step</span>
                                    <div className="flex items-center justify-between w-full">
                                        {/* Dots Group */}
                                        <div className="flex items-center gap-1.5">
                                            {/* 5 Touchpoint Dots */}
                                            <div className="flex space-x-1">
                                                {[...Array(5)].map((_, i) => {
                                                    const stepIndex = i + 1;
                                                    // @ts-ignore
                                                    const isActive = stepIndex <= (selectedConversation.nextStep?.progress || 0);
                                                    const isMsgSaida = stepIndex === 5;
                                                    let bgColor = 'bg-gray-800';
                                                    let shadow = '';
                                                    if (isActive) {
                                                        if (isMsgSaida) { bgColor = 'bg-red-500'; shadow = 'shadow-[0_0_8px_rgba(239,68,68,0.4)]'; }
                                                        else { bgColor = 'bg-green-500'; shadow = 'shadow-[0_0_8px_rgba(34,197,94,0.4)]'; }
                                                    }
                                                    return (
                                                        <button key={i} onClick={() => handleProgressClick(stepIndex)} className={`w-2.5 h-2.5 rounded-full transition-all ${bgColor} ${shadow}`} />
                                                    );
                                                })}
                                            </div>

                                            {/* Blue Dot (Established) */}
                                            {/* @ts-ignore */}
                                            <button onClick={() => handleProgressClick(6)} className={`w-2.5 h-2.5 rounded-full transition-all ${(selectedConversation.nextStep?.progress || 0) >= 6 ? 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.4)]' : 'bg-gray-800'}`} />
                                        </div>

                                        {/* Actions Group */}
                                        <div className="flex items-center gap-2">
                                            {/* Comment Icon */}
                                            <div className="cursor-pointer text-gray-500 hover:text-white transition-colors" onClick={() => setHistoryLead(selectedConversation)}>
                                                <MessageCircle size={14} />
                                            </div>

                                            {/* Date */}
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    {/* @ts-ignore */}
                                                    <button className={`text-xs font-bold hover:bg-white/5 rounded px-1.5 py-0.5 transition-colors ${parseDateStr(selectedConversation.nextStep?.date || "Pending") < new Date(new Date().setHours(0, 0, 0, 0)) ? 'text-red-400' : 'text-gray-300'}`}>
                                                        {selectedConversation.nextStep?.date ? format(parseDateStr(selectedConversation.nextStep?.date), "dd/MMM") : "Set Date"}
                                                    </button>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-auto p-0" align="end">
                                                    <Calendar mode="single" selected={parseDateStr(selectedConversation.nextStep?.date || "Pending")} onSelect={handleDateSelect} initialFocus />
                                                </PopoverContent>
                                            </Popover>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Internal Messages Preview */}
                            {selectedConversation.history && selectedConversation.history.length > 0 && (
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs text-gray-400">Internal Notes</span>
                                        <button
                                            onClick={() => setHistoryExpanded(!historyExpanded)}
                                            className="text-gray-500 hover:text-white transition-colors"
                                        >
                                            {historyExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                                        </button>
                                    </div>
                                    
                                    <div className={cn(
                                        "space-y-2 overflow-hidden transition-all",
                                        historyExpanded ? "max-h-[400px] overflow-y-auto" : "max-h-[80px]"
                                    )}>
                                        {selectedConversation.history.slice().reverse().slice(0, historyExpanded ? undefined : 1).map((note: any) => (
                                            <div key={note.id} className="bg-white/5 border border-white/10 rounded-md p-2 space-y-1">
                                                <div className="flex items-center justify-between text-[10px]">
                                                    <span className="text-gray-400 font-medium">
                                                        {note.userId ? (messagingUsers.find(u => u.id === note.userId)?.name || 'Agent') : 'Agent'}
                                                    </span>
                                                    <span className="text-gray-500">
                                                        {note.date ? format(new Date(note.date), "dd/MM/yy HH:mm") : ''}
                                                    </span>
                                                </div>
                                                <p className={cn(
                                                    "text-xs text-gray-300",
                                                    !historyExpanded && "line-clamp-2"
                                                )}>
                                                    {note.message}
                                                </p>
                                            </div>
                                        ))}
                                        {!historyExpanded && selectedConversation.history.length > 1 && (
                                            <p className="text-[10px] text-gray-500 text-center italic">
                                                +{selectedConversation.history.length - 1} more
                                            </p>
                                        )}
                                    </div>
                                </div>
                            )}

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
                                        className="w-full text-left font-mono text-xs bg-white/5 hover:bg-white/10 border border-white/10 px-3 rounded-md text-gray-200 h-9 flex items-center"
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
                                        <button className={`flex items-center justify-between text-xs px-3 h-9 rounded-md w-full outline-none transition-colors border ${(() => {
                                            // @ts-ignore
                                            switch (selectedConversation.qualification_status?.toLowerCase()) {
                                                case 'lead': return "bg-slate-500/10 text-slate-400 border-slate-500/20 font-bold";
                                                case 'mql': return "bg-blue-500/10 text-blue-400 border-blue-500/20 font-bold";
                                                case 'sql': return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 font-bold";
                                                case 'nq': return "bg-red-500/10 text-red-400 border-red-500/20 font-bold";
                                                default: return 'text-gray-400 border-white/10 bg-white/5';
                                            }
                                        })()}`}>
                                            {/* @ts-ignore */}
                                            <span className="uppercase">{selectedConversation.qualification_status || "Pending"}</span>
                                            <ChevronDown size={14} className="opacity-50" />
                                        </button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent className="w-[200px] bg-[#1A1A1A] border-white/10 text-white">
                                        <DropdownMenuItem className="text-slate-400 cursor-pointer" onClick={() => handleQualificationChange('lead')}>
                                            <div className="flex items-center">
                                                <div className="w-2 h-2 rounded-full mr-2 bg-slate-500" />
                                                LEAD
                                            </div>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem className="text-blue-400 cursor-pointer" onClick={() => handleQualificationChange('mql')}>
                                            <div className="flex items-center">
                                                <div className="w-2 h-2 rounded-full mr-2 bg-blue-500" />
                                                MQL
                                            </div>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem className="text-emerald-400 cursor-pointer" onClick={() => handleQualificationChange('sql')}>
                                            <div className="flex items-center">
                                                <div className="w-2 h-2 rounded-full mr-2 bg-emerald-500" />
                                                SQL
                                            </div>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem className="text-red-400 cursor-pointer" onClick={() => handleQualificationChange('nq')}>
                                            <div className="flex items-center">
                                                <div className="w-2 h-2 rounded-full mr-2 bg-red-500" />
                                                NQ
                                            </div>
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>

                            {/* Source */}
                            <div className="space-y-1.5">
                                <span className="text-xs text-gray-400">Source</span>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <button className="flex items-center justify-between text-xs px-3 h-9 rounded-md w-full outline-none transition-colors border border-white/10 bg-white/5 text-gray-300 hover:bg-white/10">
                                            <div className="flex items-center">
                                                {(() => {
                                                    const currentSource = SOURCES.find((s: any) => {
                                                        const label = typeof s === 'string' ? s : s.label;
                                                        return label === selectedConversation.source;
                                                    });
                                                    const bgColor = currentSource 
                                                        ? (typeof currentSource === 'string' ? "bg-slate-500" : (currentSource.bg?.replace('/10', '') || "bg-slate-500"))
                                                        : "bg-slate-500";
                                                    
                                                    return <div className={`w-2 h-2 rounded-full mr-2 ${bgColor}`} />;
                                                })()}
                                                {/* @ts-ignore */}
                                                <span>{selectedConversation.source}</span>
                                            </div>
                                            <ChevronDown size={14} className="opacity-50" />
                                        </button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent className="w-[200px] bg-[#1A1A1A] border-white/10 text-white">
                                        {SOURCES.map((s: any) => {
                                            const label = typeof s === 'string' ? s : s.label;
                                            const bgColor = typeof s === 'string' ? "bg-slate-500" : (s.bg?.replace('/10', '') || "bg-slate-500");

                                            return (
                                                <DropdownMenuItem
                                                    key={label}
                                                    onClick={() => handleSourceChange(label)}
                                                    className="cursor-pointer"
                                                >
                                                    <div className="flex items-center">
                                                        <div className={`w-2 h-2 rounded-full mr-2 ${bgColor}`} />
                                                        {label}
                                                    </div>
                                                </DropdownMenuItem>
                                            )
                                        })}
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>

                            {/* Custom Field */}
                            <div className="space-y-1.5">
                                <span className="text-xs text-gray-400">{crmSettings?.custom_fields?.name || 'Custom Field'}</span>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <button className="flex items-center justify-between text-xs px-3 h-9 rounded-md w-full outline-none transition-colors border border-white/10 bg-white/5 text-gray-300 hover:bg-white/10">
                                            <div className="flex items-center">
                                                {(() => {
                                                    const CUSTOM_OPTIONS = crmSettings?.custom_fields?.options || [];
                                                    const currentOption = CUSTOM_OPTIONS.find((opt: any) => {
                                                        const label = typeof opt === 'string' ? opt : opt.label;
                                                        return label === selectedConversation.custom;
                                                    });
                                                    const bgColor = currentOption 
                                                        ? (typeof currentOption === 'string' ? "bg-slate-500" : (currentOption.bg?.replace('/10', '') || "bg-slate-500"))
                                                        : "bg-slate-500";
                                                    
                                                    return <div className={`w-2 h-2 rounded-full mr-2 ${bgColor}`} />;
                                                })()}
                                                {/* @ts-ignore */}
                                                <span>{selectedConversation.custom || 'Select'}</span>
                                            </div>
                                            <ChevronDown size={14} className="opacity-50" />
                                        </button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent className="w-[200px] bg-[#1A1A1A] border-white/10 text-white">
                                        {(crmSettings?.custom_fields?.options || []).map((opt: any) => {
                                            const label = typeof opt === 'string' ? opt : opt.label;
                                            const bgColor = typeof opt === 'string' ? "bg-slate-500" : (opt.bg?.replace('/10', '') || "bg-slate-500");

                                            return (
                                                <DropdownMenuItem
                                                    key={label}
                                                    onClick={() => handleCustomFieldChange(label)}
                                                    className="cursor-pointer"
                                                >
                                                    <div className="flex items-center">
                                                        <div className={`w-2 h-2 rounded-full mr-2 ${bgColor}`} />
                                                        {label}
                                                    </div>
                                                </DropdownMenuItem>
                                            )
                                        })}
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
                                    <SelectTrigger className="w-full bg-white/5 border-white/10 text-white h-9 px-3 rounded-md">
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
                                    {selectedConversation.responsibleId && (
                                        <span className="text-[10px] text-gray-500 italic">
                                            Conversation is with <span className="text-gray-300">
                                                {messagingUsers.find(u => u.id === selectedConversation.responsibleId)?.name || 'Unknown'}
                                            </span>. Transfer to:
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
                                            .filter(user => user.id !== selectedConversation.responsibleId)
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
                messagingUsers={messagingUsers}
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
