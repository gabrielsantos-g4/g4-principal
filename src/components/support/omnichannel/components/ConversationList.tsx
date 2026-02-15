
import { useState } from "react";
import { Search, Filter, ListFilter, Check, ChevronDown, MessageSquare, LogOut } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { cn, formatWhatsAppDate } from "@/lib/utils";
import { signout } from "@/app/login/actions";
import { markAsRead } from "@/actions/crm/mark-as-read";

// Reusing types locally or importing if they were exported. 
// For now, defining minimal interfaces based on usage.
export interface Conversation {
    id: string;
    contact: {
        id: string;
        name: string;
        avatar?: string;
        email?: string;
        phone?: string;
        company?: string;
        role?: string;
        lastSeen?: string;
        tags?: string[];
    };
    channel: "whatsapp" | "linkedin" | "instagram" | "facebook" | "email" | "sms" | "web" | "phone";
    lastMessage: string;
    lastMessageAt: string;
    unreadCount: number;
    messages: any[]; // Changed from Message[] to any[] temporarily to avoid circular dep or extra complexity
    // CRM Fields
    status: "New" | "Won" | "Lost" | "Talk to" | "Talking" | "Talk Later" | "Not interested" | "Client";
    nextStep: { date: string; progress: number; total: number };
    amount: string;
    product: string;
    qualification_status: "mql" | "sql" | "nq" | "pending";
    qualification_details?: any; // JSONB
    source: string;
    history: { id: string; message: string; date: Date }[];
    custom?: string;
    quem_atende?: string;
    permission?: string;
}

interface ConversationListProps {
    conversations: Conversation[];
    isLoading: boolean;
    selectedConversationId: string | null;
    onSelectConversation: (id: string) => void;
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    filterStatus: 'all' | 'unread' | 'read';
    setFilterStatus: (status: 'all' | 'unread' | 'read') => void;
    statusFilter: string | null;
    setStatusFilter: (status: string | null) => void;
    manuallyUnreadIds: Set<string>;
    setManuallyUnreadIds: React.Dispatch<React.SetStateAction<Set<string>>>;
    mode: 'individual' | 'global';
    targetUser: any;
    targetUserId?: string;
    accessibleInboxes?: any[];
    onInboxChange?: (id: string) => void;
}

const CHANNEL_COLORS: Record<string, string> = {
    whatsapp: "bg-[#25D366]",
    linkedin: "bg-[#0A66C2]",
    instagram: "bg-[#E4405F]",
    facebook: "bg-[#1877F2]",
    email: "bg-orange-500",
    sms: "bg-purple-500",
    phone: "bg-blue-500",
    web: "bg-gray-400"
};

export function ConversationList({
    conversations,
    isLoading,
    selectedConversationId,
    onSelectConversation,
    searchQuery,
    setSearchQuery,
    filterStatus,
    setFilterStatus,
    statusFilter,
    setStatusFilter,
    manuallyUnreadIds,
    setManuallyUnreadIds,
    mode,
    targetUser,
    targetUserId,
    accessibleInboxes = [],
    onInboxChange
}: ConversationListProps) {

    // Helper unique statuses
    const availableStatuses = Array.from(new Set(conversations.map(c => c.status))).filter(Boolean).sort();

    // Toggle unread logic
    const toggleUnread = async (convId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        const conversation = conversations.find(c => c.id === convId);
        if (!conversation) return;

        const isCurrentlyUnread = conversation.unreadCount > 0 || manuallyUnreadIds.has(convId);
        const statusToSet = isCurrentlyUnread; // If unread, mark as read (true) in DB

        setManuallyUnreadIds(prev => {
            const newSet = new Set(prev);
            if (!statusToSet) { // Setting to UNREAD
                newSet.add(convId);
            } else { // Setting to READ
                newSet.delete(convId);
            }
            return newSet;
        });

        await markAsRead(convId, statusToSet);
    };

    // Filter Logic
    const filteredConversations = conversations.filter(conv => {
        let matchesSearch = true;
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            matchesSearch = (
                conv.contact.name.toLowerCase().includes(query) ||
                conv.lastMessage.toLowerCase().includes(query)
            );
        }

        const isUnread = conv.unreadCount > 0 || manuallyUnreadIds.has(conv.id);
        let matchesReadStatus = true;
        if (filterStatus === 'unread') {
            matchesReadStatus = isUnread;
        } else if (filterStatus === 'read') {
            matchesReadStatus = !isUnread;
        }

        let matchesStatusFilter = true;
        if (statusFilter) {
            matchesStatusFilter = conv.status === statusFilter;
        }

        return matchesSearch && matchesReadStatus && matchesStatusFilter;
    });

    return (
        <div className="w-80 border-r border-white/10 flex flex-col bg-[#111] h-full overflow-hidden">
            {/* Header / Search */}
            <div className="p-4 border-b border-white/10 space-y-4">
                {mode === 'global' ? (
                    <div className="flex items-center gap-3 p-2 bg-[#1C73E8]/10 rounded-lg border border-[#1C73E8]/20">
                        <div className="h-10 w-10 bg-[#1C73E8] rounded-lg flex items-center justify-center text-white shadow-[0_0_15px_rgba(28,115,232,0.3)]">
                            <MessageSquare size={20} />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className="text-sm font-bold text-white truncate leading-none mb-1">Global Inbox</h3>
                            <p className="text-[10px] text-[#1C73E8] truncate leading-none uppercase tracking-wider font-bold">Unified View</p>
                        </div>
                    </div>
                ) : (
                    accessibleInboxes.length > 1 && onInboxChange ? (
                        <div className="flex items-center gap-2">
                            <Select value={targetUserId} onValueChange={onInboxChange}>
                                <SelectTrigger className="w-full h-14 bg-white/5 border-white/10 text-white p-2 flex items-center gap-3">
                                    <div className="flex items-center gap-3 flex-1 min-w-0 text-left">
                                        <Avatar className="h-10 w-10 border border-[#1C73E8]">
                                            <AvatarImage src={targetUser?.avatar || targetUser?.avatar_url} />
                                            <AvatarFallback>{targetUser?.name?.[0] || '?'}</AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="text-xs font-bold text-white truncate leading-tight">Inbox of</h3>
                                            <p className="text-sm text-[#1C73E8] truncate leading-tight font-bold">{targetUser?.name || 'Select Inbox'}</p>
                                        </div>
                                    </div>
                                </SelectTrigger>
                                <SelectContent className="bg-[#1A1A1A] border-white/10 text-white max-h-[300px]">
                                    {accessibleInboxes.map((inbox) => (
                                        <SelectItem key={inbox.id} value={inbox.id} className="cursor-pointer focus:bg-white/10 focus:text-white">
                                            <div className="flex items-center gap-2">
                                                <Avatar className="h-6 w-6 border border-white/10">
                                                    <AvatarImage src={inbox.avatar} />
                                                    <AvatarFallback>{inbox.name[0]}</AvatarFallback>
                                                </Avatar>
                                                <span>{inbox.name}</span>
                                                {inbox.type === 'agent' && <Badge variant="secondary" className="bg-purple-500/20 text-purple-300 ml-auto text-[10px] px-1 h-5">Agent</Badge>}
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <form action={signout}>
                                <Button variant="ghost" size="icon" className="h-14 w-10 text-slate-400 hover:text-white hover:bg-white/10 border border-white/10 rounded-lg">
                                    <LogOut size={18} />
                                </Button>
                            </form>
                        </div>
                    ) : targetUser ? (
                        <div className="flex items-center gap-3 p-2 bg-white/5 rounded-lg border border-white/10 relative">
                            <Avatar className="h-10 w-10 border border-[#1C73E8]">
                                <AvatarImage src={targetUser.avatar_url || targetUser.avatar} />
                                <AvatarFallback>{targetUser.name[0]}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                                <h3 className="text-xs font-bold text-white truncate leading-tight">All conversations of</h3>
                                <p className="text-sm text-[#1C73E8] truncate leading-tight font-bold">{targetUser.name}</p>
                            </div>
                            <form action={signout}>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-white hover:bg-white/10">
                                    <LogOut size={16} />
                                </Button>
                            </form>
                        </div>
                    ) : (
                        <div className="flex items-center justify-between">
                            <h3 className="font-bold text-white">Inbox</h3>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400">
                                <Filter size={16} />
                            </Button>
                        </div>
                    )
                )}

                {/* Search Bar */}
                <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                    <Input
                        placeholder="Search..."
                        className="pl-9 bg-white/5 border-white/10 text-white h-9 focus-visible:ring-transparent"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                {/* Filter Controls Row */}
                <div className="flex items-center justify-between">
                    <div className="flex gap-2 text-xs">
                        {(['all', 'unread', 'read'] as const).map((status) => (
                            <Badge
                                key={status}
                                variant={filterStatus === status ? "secondary" : "outline"}
                                className={cn(
                                    "cursor-pointer transition-colors capitalize",
                                    filterStatus === status ? "bg-white/10 hover:bg-white/20" : "text-gray-400 border-white/10 hover:bg-white/5"
                                )}
                                onClick={() => setFilterStatus(status)}
                            >
                                {status}
                            </Badge>
                        ))}
                    </div>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                className={cn(
                                    "h-6 w-6 rounded-full hover:bg-white/10",
                                    statusFilter ? "text-[#1C73E8] bg-white/10" : "text-gray-400"
                                )}
                            >
                                <ListFilter size={16} />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56 bg-[#1f1f1f] border-white/10 text-white">
                            <DropdownMenuItem
                                onClick={() => setStatusFilter(null)}
                                className="cursor-pointer hover:bg-white/5 focus:bg-white/5"
                            >
                                <span className={!statusFilter ? "font-bold text-[#1C73E8]" : ""}>All Statuses</span>
                                {!statusFilter && <Check size={14} className="ml-auto text-[#1C73E8]" />}
                            </DropdownMenuItem>
                            <Separator className="my-1 bg-white/10" />
                            {availableStatuses.map(status => (
                                <DropdownMenuItem
                                    key={status}
                                    onClick={() => setStatusFilter(status)}
                                    className="cursor-pointer hover:bg-white/5 focus:bg-white/5"
                                >
                                    <span className={statusFilter === status ? "font-bold text-[#1C73E8]" : ""}>
                                        {status}
                                    </span>
                                    {statusFilter === status && <Check size={14} className="ml-auto text-[#1C73E8]" />}
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            {/* List */}
            <ScrollArea className="flex-1">
                <div className="flex flex-col">
                    {isLoading ? (
                        <div className="p-4 text-center text-gray-500 text-xs">Loading conversations...</div>
                    ) : filteredConversations.length === 0 ? (
                        <div className="p-4 text-center text-gray-500 text-xs text-gray-400">No conversations found.</div>
                    ) : (
                        filteredConversations.map(conv => {
                            const isUnread = conv.unreadCount > 0 || manuallyUnreadIds.has(conv.id);
                            // Using a simple logic for border color based on channel, similar to previous implementation
                            // Note: Previous implementation used CHANNEL_COLORS for specific UI elements, here refined.

                            return (
                                <div
                                    key={conv.id}
                                    onClick={() => {
                                        onSelectConversation(conv.id);
                                        // Mark as read immediately if it's currently unread
                                        if (conv.unreadCount > 0 || manuallyUnreadIds.has(conv.id)) {
                                            if (manuallyUnreadIds.has(conv.id)) {
                                                setManuallyUnreadIds(prev => {
                                                    const newSet = new Set(prev);
                                                    newSet.delete(conv.id);
                                                    return newSet;
                                                });
                                            }
                                            markAsRead(conv.id, true);
                                        }
                                    }}
                                    className={cn(
                                        "flex items-start gap-3 p-4 text-left transition-colors border-b border-white/5 relative group cursor-pointer",
                                        selectedConversationId === conv.id ? "bg-white/5" : "hover:bg-white/[0.02]"
                                    )}
                                >
                                    <div className="absolute right-2 top-2 z-20 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full hover:bg-white/20">
                                                    <ChevronDown size={14} className="text-gray-400" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="bg-[#2a2a2a] border-white/10 text-white">
                                                <DropdownMenuItem
                                                    onClick={(e) => toggleUnread(conv.id, e)}
                                                    className="hover:bg-white/10 cursor-pointer text-xs"
                                                >
                                                    {isUnread ? "Mark as read" : "Mark as unread"}
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>

                                    <div className="relative flex-shrink-0">
                                        <Avatar className="h-10 w-10 border border-white/10">
                                            <AvatarImage src={conv.contact.avatar} />
                                            <AvatarFallback>{conv.contact.name[0]}</AvatarFallback>
                                        </Avatar>
                                        {/* Channel indicator if needed, simplified for now */}
                                    </div>

                                    <div className="flex-1 min-w-0 overflow-hidden">
                                        <div className="flex justify-between items-start mb-0.5">
                                            <h4 className={cn("text-sm font-medium truncate pr-2", isUnread ? "text-white font-bold" : "text-gray-300")}>
                                                {conv.contact.name}
                                            </h4>
                                            {conv.lastMessageAt && (
                                                <span className={cn("text-[10px] whitespace-nowrap", isUnread ? "text-[#25D366]" : "text-gray-500")}>
                                                    {formatWhatsAppDate(conv.lastMessageAt)}
                                                </span>
                                            )}
                                        </div>
                                        <p className={cn("text-xs truncate", isUnread ? "text-white font-medium" : "text-gray-500")}>
                                            {conv.permission === 'assigned' && <span className="text-[#1C73E8] mr-1">You:</span>}
                                            {conv.lastMessage}
                                        </p>
                                    </div>

                                    {isUnread && (
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 w-2 h-2 bg-[#25D366] rounded-full" />
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>
            </ScrollArea>
        </div>
    );
}
