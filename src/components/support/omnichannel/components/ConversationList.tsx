
import { useState } from "react";
import { Search, ListFilter, Check, ChevronDown, MessageSquare, LogOut } from "lucide-react";
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

export interface Conversation {
    id: string;
    leadId?: number;
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
    messages: any[];
    status: "New" | "Won" | "Lost" | "Talk to" | "Talking" | "Talk Later" | "Not interested" | "Client";
    nextStep: { date: string; progress: number; total: number };
    amount: string;
    product: string;
    qualification_status: "mql" | "sql" | "nq" | "pending";
    qualification_details?: any;
    source: string;
    temperature?: string;
    history: { id: string; message: string; date: Date; userId?: string }[];
    custom?: string;
    quem_atende?: string;
    responsibleId?: string | null;
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
    instanceAvatar?: string;
}

const CHANNEL_ICONS: Record<string, string> = {
    whatsapp: "💬",
    linkedin: "💼",
    instagram: "📸",
    facebook: "👥",
    email: "✉️",
    sms: "📱",
    phone: "📞",
    web: "🌐"
};

const STATUS_COLORS: Record<string, string> = {
    New: "bg-blue-500",
    Talking: "bg-emerald-500",
    "Talk to": "bg-yellow-500",
    "Talk Later": "bg-orange-500",
    Won: "bg-green-500",
    Lost: "bg-red-500",
    "Not interested": "bg-gray-500",
    Client: "bg-purple-500",
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
    onInboxChange,
    instanceAvatar
}: ConversationListProps) {

    const availableStatuses = Array.from(new Set(conversations.map(c => c.status))).filter(Boolean).sort();

    const toggleUnread = async (convId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        const conversation = conversations.find(c => c.id === convId);
        if (!conversation) return;

        const isCurrentlyUnread = conversation.unreadCount > 0 || manuallyUnreadIds.has(convId);
        setManuallyUnreadIds(prev => {
            const newSet = new Set(prev);
            if (!isCurrentlyUnread) {
                newSet.add(convId);
            } else {
                newSet.delete(convId);
            }
            return newSet;
        });
        await markAsRead(convId, isCurrentlyUnread);
    };

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
        if (filterStatus === 'unread') matchesReadStatus = isUnread;
        else if (filterStatus === 'read') matchesReadStatus = !isUnread;

        let matchesStatusFilter = true;
        if (statusFilter) matchesStatusFilter = conv.status === statusFilter;

        return matchesSearch && matchesReadStatus && matchesStatusFilter;
    });

    const unreadTotal = conversations.filter(c => c.unreadCount > 0 || manuallyUnreadIds.has(c.id)).length;

    return (
        <div className="w-[300px] border-r border-white/8 flex flex-col bg-[#111] h-full overflow-hidden shrink-0">
            {/* Header */}
            <div className="p-4 border-b border-white/8 space-y-3">
                {mode === 'global' ? (
                    <div className="flex items-center gap-3 px-2 py-2 bg-[#1C73E8]/8 rounded-xl border border-[#1C73E8]/15">
                        <div className="h-9 w-9 bg-[#1C73E8] rounded-lg flex items-center justify-center text-white shadow-[0_0_15px_rgba(28,115,232,0.25)] shrink-0">
                            <MessageSquare size={18} />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className="text-sm font-bold text-white leading-tight">Global Inbox</h3>
                            <p className="text-[10px] text-[#1C73E8]/80 uppercase tracking-wider font-semibold">Unified View</p>
                        </div>
                        {unreadTotal > 0 && (
                            <span className="shrink-0 h-5 min-w-[20px] bg-[#1C73E8] rounded-full flex items-center justify-center text-[10px] font-bold text-white px-1.5">
                                {unreadTotal}
                            </span>
                        )}
                    </div>
                ) : (
                    accessibleInboxes.length > 0 && onInboxChange ? (
                        <div className="flex items-center gap-2">
                            <Select value={targetUserId} onValueChange={onInboxChange}>
                                <SelectTrigger className="w-full h-14 bg-white/5 border-white/10 text-white p-2 flex items-center gap-3">
                                    <div className="flex items-center gap-3 flex-1 min-w-0 text-left">
                                        <Avatar className="h-9 w-9 border border-[#1C73E8]/40">
                                            <AvatarImage src={targetUser?.avatar || targetUser?.avatar_url} />
                                            <AvatarFallback className="text-xs font-bold">{targetUser?.name?.[0] || '?'}</AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-[10px] text-gray-500 font-medium uppercase tracking-wider leading-tight">Conversations of</p>
                                            <h3 className="text-sm text-white font-bold truncate leading-tight">{targetUser?.name || 'Select User'}</h3>
                                        </div>
                                    </div>
                                </SelectTrigger>
                                <SelectContent className="bg-[#1A1A1A] border-white/10 text-white max-h-[300px]">
                                    {accessibleInboxes.map((inbox) => (
                                        <SelectItem key={inbox.id} value={inbox.id} className="cursor-pointer focus:bg-white/10 focus:text-white">
                                            <div className="flex items-center gap-2">
                                                <Avatar className="h-6 w-6 border border-white/10">
                                                    <AvatarImage src={inbox.avatar} />
                                                    <AvatarFallback className="text-[9px]">{inbox.name[0]}</AvatarFallback>
                                                </Avatar>
                                                <span>{inbox.name}</span>
                                                {inbox.type === 'agent' && <Badge variant="secondary" className="bg-purple-500/20 text-purple-300 ml-auto text-[10px] px-1 h-5">Agent</Badge>}
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    ) : targetUser ? (
                        <div className="flex items-center gap-3 px-2 py-1.5 bg-white/4 rounded-xl border border-white/8">
                            <Avatar className="h-9 w-9 border border-[#1C73E8]/40">
                                <AvatarImage src={instanceAvatar || targetUser.avatar_url || targetUser.avatar} />
                                <AvatarFallback className="text-xs font-bold">{targetUser.name ? targetUser.name[0] : '?'}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                                <p className="text-[10px] text-gray-500 font-medium uppercase tracking-wider leading-tight">Conversations of</p>
                                <h3 className="text-sm text-white font-bold truncate leading-tight">{targetUser.name || 'Agent'}</h3>
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center justify-between px-1">
                            <h3 className="font-bold text-white">Inbox</h3>
                            {unreadTotal > 0 && (
                                <span className="h-5 min-w-[20px] bg-[#1C73E8] rounded-full flex items-center justify-center text-[10px] font-bold text-white px-1.5">
                                    {unreadTotal}
                                </span>
                            )}
                        </div>
                    )
                )}

                {/* Search */}
                <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-gray-600" />
                    <Input
                        placeholder="Search conversations..."
                        className="pl-8 bg-white/4 border-white/8 text-white text-sm h-9 placeholder:text-gray-600 focus-visible:ring-[#1C73E8]/30 focus-visible:border-[#1C73E8]/40 transition-all"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                {/* Filter row */}
                <div className="flex items-center justify-between">
                    <div className="flex gap-1.5">
                        {(['all', 'unread', 'read'] as const).map((status) => (
                            <button
                                key={status}
                                onClick={() => setFilterStatus(status)}
                                className={cn(
                                    "text-[11px] px-2.5 py-1 rounded-full font-medium capitalize transition-all",
                                    filterStatus === status
                                        ? "bg-[#1C73E8]/20 text-[#6ea8fe] border border-[#1C73E8]/30"
                                        : "text-gray-600 hover:text-gray-400 border border-transparent"
                                )}
                            >
                                {status}
                            </button>
                        ))}
                    </div>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                className={cn(
                                    "h-7 w-7 rounded-lg transition-all",
                                    statusFilter ? "text-[#1C73E8] bg-[#1C73E8]/10" : "text-gray-600 hover:text-gray-400 hover:bg-white/5"
                                )}
                            >
                                <ListFilter size={14} />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-52 bg-[#1a1a1a] border-white/10 text-white">
                            <DropdownMenuItem onClick={() => setStatusFilter(null)} className="cursor-pointer hover:bg-white/5 focus:bg-white/5 text-xs">
                                <span className={!statusFilter ? "font-bold text-[#1C73E8]" : "text-gray-300"}>All Statuses</span>
                                {!statusFilter && <Check size={12} className="ml-auto text-[#1C73E8]" />}
                            </DropdownMenuItem>
                            <Separator className="my-1 bg-white/8" />
                            {availableStatuses.map(status => (
                                <DropdownMenuItem
                                    key={status}
                                    onClick={() => setStatusFilter(status)}
                                    className="cursor-pointer hover:bg-white/5 focus:bg-white/5 text-xs"
                                >
                                    <div className="flex items-center gap-2">
                                        <div className={cn("w-1.5 h-1.5 rounded-full", STATUS_COLORS[status] || "bg-gray-500")} />
                                        <span className={statusFilter === status ? "font-bold text-[#1C73E8]" : "text-gray-300"}>{status}</span>
                                    </div>
                                    {statusFilter === status && <Check size={12} className="ml-auto text-[#1C73E8]" />}
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            {/* Conversation List */}
            <ScrollArea className="flex-1">
                <div className="flex flex-col">
                    {isLoading ? (
                        // Loading skeletons
                        <div className="flex flex-col gap-0">
                            {[...Array(5)].map((_, i) => (
                                <div key={i} className="flex items-center gap-3 p-4 border-b border-white/5 animate-pulse">
                                    <div className="w-10 h-10 rounded-full bg-white/8 shrink-0" />
                                    <div className="flex-1 space-y-2">
                                        <div className="h-3 bg-white/8 rounded w-3/4" />
                                        <div className="h-2.5 bg-white/5 rounded w-full" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : filteredConversations.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 gap-3 text-center px-6">
                            <div className="text-3xl opacity-20">🔍</div>
                            <p className="text-gray-600 text-sm">No conversations found</p>
                            {searchQuery && <p className="text-gray-700 text-xs">Try a different search term</p>}
                        </div>
                    ) : (
                        filteredConversations.map(conv => {
                            const isUnread = conv.unreadCount > 0 || manuallyUnreadIds.has(conv.id);
                            const isSelected = selectedConversationId === conv.id;
                            const channelIcon = CHANNEL_ICONS[conv.channel] || "💬";
                            const statusColor = STATUS_COLORS[conv.status] || "bg-gray-500";

                            return (
                                <div
                                    key={conv.id}
                                    onClick={() => {
                                        onSelectConversation(conv.id);
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
                                        "flex items-start gap-3 px-4 py-3.5 text-left border-b border-white/5 relative group cursor-pointer transition-all duration-150",
                                        isSelected
                                            ? "bg-[#1C73E8]/8 border-l-2 border-l-[#1C73E8] pl-[14px]"
                                            : "hover:bg-white/[0.025] border-l-2 border-l-transparent"
                                    )}
                                >
                                    {/* Context menu (hover) */}
                                    <div className="absolute right-2 top-2 z-20 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-6 w-6 rounded-full bg-[#2a2a2a] hover:bg-[#333] text-gray-400 hover:text-white"
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    <ChevronDown size={12} />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="bg-[#2a2a2a] border-white/10 text-white w-40">
                                                <DropdownMenuItem
                                                    onClick={(e) => toggleUnread(conv.id, e)}
                                                    className="hover:bg-white/10 cursor-pointer text-xs"
                                                >
                                                    {isUnread ? "✓  Mark as read" : "●  Mark as unread"}
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>

                                    {/* Avatar + channel icon */}
                                    <div className="relative shrink-0">
                                        <Avatar className={cn("h-10 w-10", isUnread ? "border-2 border-[#25D366]/60" : "border border-white/10")}>
                                            <AvatarImage src={conv.contact.avatar} />
                                            <AvatarFallback className={cn("text-xs font-bold", isSelected ? "bg-[#1C73E8]/20 text-[#6ea8fe]" : "bg-white/5 text-gray-400")}>
                                                {conv.contact.name[0]}
                                            </AvatarFallback>
                                        </Avatar>
                                        <span className="absolute -bottom-0.5 -right-0.5 text-[10px] leading-none">{channelIcon}</span>
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0 overflow-hidden pr-6">
                                        <div className="flex items-center justify-between gap-2 mb-0.5">
                                            <h4 className={cn("text-sm truncate leading-tight", isUnread ? "text-white font-semibold" : "text-gray-300 font-medium")}>
                                                {conv.contact.name}
                                            </h4>
                                            <span className={cn("text-[11px] whitespace-nowrap shrink-0", isUnread ? "text-[#25D366] font-semibold" : "text-gray-600")}>
                                                {conv.lastMessageAt
                                                    ? new Date(conv.lastMessageAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                                    : ""}
                                            </span>
                                        </div>
                                        <div className="overflow-hidden">
                                            <p className={cn("text-[12px] truncate leading-tight", isUnread ? "text-gray-300" : "text-gray-600")}>
                                                {conv.permission === 'assigned' && <span className="text-[#1C73E8] font-medium">You: </span>}
                                                {conv.lastMessage}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Unread count badge (WhatsApp style) */}
                                    {isUnread && (
                                        <div className="absolute right-3 bottom-3.5 min-w-[18px] h-[18px] bg-[#25D366] rounded-full flex items-center justify-center px-1 shadow-[0_0_8px_rgba(37,211,102,0.4)]">
                                            <span className="text-[10px] font-bold text-white leading-none">
                                                {conv.unreadCount > 0 ? conv.unreadCount : ""}
                                            </span>
                                        </div>
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
