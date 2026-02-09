import { useState } from "react";
import { Search, Filter, Phone, Mail, MoreVertical, Send, Paperclip, Mic, Smile, Check, CheckCheck, Clock, User, Building2, Tag, Calendar, MessageSquare } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

// --- Types & Mock Data ---

type ChannelType = "whatsapp" | "instagram" | "email" | "web";

interface Contact {
    id: string;
    name: string;
    avatar?: string;
    email?: string;
    phone?: string;
    company?: string;
    role?: string;
    lastSeen?: string;
    tags?: string[];
}

interface Message {
    id: string;
    content: string;
    senderId: string; // 'me' or contactId
    timestamp: string;
    status: "sent" | "delivered" | "read";
    type: "text" | "image" | "audio";
}

interface Conversation {
    id: string;
    contact: Contact;
    channel: ChannelType;
    lastMessage: string;
    lastMessageAt: string;
    unreadCount: number;
    status: "open" | "closed" | "snoozed";
    messages: Message[];
}

const MOCK_CONVERSATIONS: Conversation[] = [
    {
        id: "1",
        channel: "whatsapp",
        contact: {
            id: "c1",
            name: "Alice Johnson",
            avatar: "https://i.pravatar.cc/150?u=alice",
            company: "TechCorp",
            role: "CTO",
            phone: "+55 11 99999-8888",
            email: "alice@techcorp.com",
            tags: ["VIP", "Interested"],
        },
        lastMessage: "Sounds good, send me the proposal.",
        lastMessageAt: "10:30 AM",
        unreadCount: 2,
        status: "open",
        messages: [
            { id: "m1", content: "Hi Alice, checking in on our last meeting.", senderId: "me", timestamp: "10:00 AM", status: "read", type: "text" },
            { id: "m2", content: "Hey! Yes, I discussed it with the board.", senderId: "c1", timestamp: "10:15 AM", status: "read", type: "text" },
            { id: "m3", content: "Sounds good, send me the proposal.", senderId: "c1", timestamp: "10:30 AM", status: "read", type: "text" },
        ],
    },
    {
        id: "2",
        channel: "instagram",
        contact: {
            id: "c2",
            name: "Bob Smith",
            avatar: "https://i.pravatar.cc/150?u=bob",
            company: "DesignStudio",
            tags: ["Lead", "Cold"],
        },
        lastMessage: "How much for the premium plan?",
        lastMessageAt: "Yesterday",
        unreadCount: 0,
        status: "open",
        messages: [
            { id: "m4", content: "Love your new features!", senderId: "c2", timestamp: "Yesterday", status: "read", type: "text" },
            { id: "m5", content: "Thanks Bob! Glad you like them.", senderId: "me", timestamp: "Yesterday", status: "read", type: "text" },
            { id: "m6", content: "How much for the premium plan?", senderId: "c2", timestamp: "Yesterday", status: "read", type: "text" },
        ],
    },
    {
        id: "3",
        channel: "web",
        contact: {
            id: "c3",
            name: "Visitor #492",
            company: "Unknown",
        },
        lastMessage: "I need help with my invoice.",
        lastMessageAt: "2 days ago",
        unreadCount: 0,
        status: "closed",
        messages: [
            { id: "m7", content: "I need help with my invoice.", senderId: "c3", timestamp: "2 days ago", status: "read", type: "text" },
        ],
    },
];

// --- Components ---

function ChannelIcon({ type }: { type: ChannelType }) {
    switch (type) {
        case "whatsapp": return <div className="bg-green-500/20 p-1 rounded-full"><Phone size={12} className="text-green-500" /></div>;
        case "instagram": return <div className="bg-pink-500/20 p-1 rounded-full"><div className="w-3 h-3 bg-pink-500 rounded-sm" /></div>; // Replace with proper icon
        case "email": return <div className="bg-blue-500/20 p-1 rounded-full"><Mail size={12} className="text-blue-500" /></div>;
        case "web": return <div className="bg-purple-500/20 p-1 rounded-full"><div className="w-3 h-3 bg-purple-500 rounded-full" /></div>;
    }
}

export function OmnichannelInbox({ targetUserId, targetUser, mode = 'individual' }: { targetUserId?: string, targetUser?: any, mode?: 'individual' | 'global' }) {
    const [selectedConversationId, setSelectedConversationId] = useState<string | null>(MOCK_CONVERSATIONS[0].id);
    const selectedConversation = MOCK_CONVERSATIONS.find(c => c.id === selectedConversationId);

    // In a real scenario, we would fetch conversations filtered by targetUserId here
    console.log("[OmnichannelInbox] Filtering for User ID:", targetUserId)

    return (
        <div className="flex h-[calc(100vh-120px)] w-full border border-white/10 rounded-xl overflow-hidden bg-[#111]">
            {/* 1. Left Sidebar: Conversation List */}
            <div className="w-80 border-r border-white/10 flex flex-col bg-[#111]">
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
                    ) : targetUser ? (
                        <div className="flex items-center gap-3 p-2 bg-white/5 rounded-lg border border-white/10">
                            <Avatar className="h-10 w-10 border border-[#1C73E8]">
                                <AvatarImage src={targetUser.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(targetUser.name)}&background=random`} />
                                <AvatarFallback>{targetUser.name[0]}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                                <h3 className="text-sm font-bold text-white truncate leading-none mb-1">{targetUser.name}</h3>
                                <p className="text-[10px] text-slate-400 truncate leading-none uppercase tracking-wider font-medium">{targetUser.role}</p>
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center justify-between">
                            <h3 className="font-bold text-white">Inbox</h3>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400">
                                <Filter size={16} />
                            </Button>
                        </div>
                    )}
                    <div className="relative">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                        <Input
                            placeholder="Search..."
                            className="pl-9 bg-white/5 border-white/10 text-white h-9 focus-visible:ring-transparent"
                        />
                    </div>
                    <div className="flex gap-2 text-xs">
                        <Badge variant="secondary" className="bg-white/10 hover:bg-white/20 cursor-pointer">All</Badge>
                        <Badge variant="outline" className="text-gray-400 border-white/10 hover:bg-white/5 cursor-pointer">Unread</Badge>
                        <Badge variant="outline" className="text-gray-400 border-white/10 hover:bg-white/5 cursor-pointer">Open</Badge>
                        {(targetUser || mode === 'global') && (
                            <Button variant="ghost" size="icon" className="h-5 w-5 text-gray-400 ml-auto">
                                <Filter size={12} />
                            </Button>
                        )}
                    </div>
                </div>

                {/* List */}
                <ScrollArea className="flex-1">
                    <div className="flex flex-col">
                        {MOCK_CONVERSATIONS.map(conv => (
                            <button
                                key={conv.id}
                                onClick={() => setSelectedConversationId(conv.id)}
                                className={cn(
                                    "flex items-start gap-3 p-4 text-left transition-colors border-b border-white/5",
                                    selectedConversationId === conv.id ? "bg-white/5" : "hover:bg-white/[0.02]"
                                )}
                            >
                                <div className="relative">
                                    <Avatar>
                                        <AvatarImage src={conv.contact.avatar} />
                                        <AvatarFallback>{conv.contact.name[0]}</AvatarFallback>
                                    </Avatar>
                                    <div className="absolute -bottom-1 -right-1">
                                        <ChannelIcon type={conv.channel} />
                                    </div>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-baseline mb-1">
                                        <span className={cn("font-medium truncate", conv.unreadCount > 0 ? "text-white" : "text-gray-300")}>
                                            {conv.contact.name}
                                        </span>
                                        <span className="text-[10px] text-gray-500 whitespace-nowrap ml-2">
                                            {conv.lastMessageAt}
                                        </span>
                                    </div>
                                    <p className={cn("text-xs truncate", conv.unreadCount > 0 ? "text-gray-200 font-medium" : "text-gray-500")}>
                                        {conv.lastMessage}
                                    </p>
                                </div>
                                {conv.unreadCount > 0 && (
                                    <div className="w-5 h-5 rounded-full bg-[#1C73E8] text-[10px] text-white flex items-center justify-center font-bold">
                                        {conv.unreadCount}
                                    </div>
                                )}
                            </button>
                        ))}
                    </div>
                </ScrollArea>
            </div>

            {/* 2. Middle: Chat Area */}
            <div className="flex-1 flex flex-col bg-[#0f0f0f] relative">
                {selectedConversation ? (
                    <>
                        {/* Chat Header */}
                        <div className="h-16 border-b border-white/10 flex items-center justify-between px-6 bg-[#111]">
                            <div className="flex items-center gap-3">
                                <Avatar className="h-9 w-9">
                                    <AvatarImage src={selectedConversation.contact.avatar} />
                                    <AvatarFallback>{selectedConversation.contact.name[0]}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <h4 className="text-sm font-bold text-white flex items-center gap-2">
                                        {selectedConversation.contact.name}
                                        <Badge variant="outline" className="text-[10px] h-4 px-1 border-white/20 text-gray-400">
                                            {selectedConversation.channel}
                                        </Badge>
                                    </h4>
                                    <p className="text-xs text-green-400 flex items-center gap-1">
                                        <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                                        Online
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button variant="ghost" size="icon" className="text-gray-400">
                                    <Phone size={18} />
                                </Button>
                                <Button variant="ghost" size="icon" className="text-gray-400">
                                    <MoreVertical size={18} />
                                </Button>
                                <Button size="sm" className="bg-[#1C73E8] hover:bg-[#1557b0] ml-2">
                                    Resolve
                                </Button>
                            </div>
                        </div>

                        {/* Messages Area */}
                        <ScrollArea className="flex-1 p-6">
                            <div className="space-y-6">
                                {/* Date Divider */}
                                <div className="flex justify-center">
                                    <span className="text-[10px] text-gray-500 bg-white/5 px-2 py-1 rounded-full">
                                        Today
                                    </span>
                                </div>

                                {selectedConversation.messages.map((msg) => {
                                    const isMe = msg.senderId === "me";
                                    return (
                                        <div key={msg.id} className={cn("flex", isMe ? "justify-end" : "justify-start")}>
                                            <div className={cn(
                                                "max-w-[70%] rounded-2xl px-4 py-2 text-sm",
                                                isMe
                                                    ? "bg-[#1C73E8] text-white rounded-br-none"
                                                    : "bg-white/10 text-gray-200 rounded-bl-none"
                                            )}>
                                                <p>{msg.content}</p>
                                                <div className={cn("flex items-center gap-1 justify-end mt-1", isMe ? "text-blue-200" : "text-gray-500")}>
                                                    <span className="text-[10px]">{msg.timestamp}</span>
                                                    {isMe && <CheckCheck size={12} />}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </ScrollArea>

                        {/* Input Area */}
                        <div className="p-4 bg-[#111] border-t border-white/10">
                            <div className="bg-white/5 rounded-xl flex items-end p-2 border border-white/5 focus-within:border-white/20 transition-colors">
                                <div className="flex gap-1 pb-1">
                                    <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white h-8 w-8 rounded-full">
                                        <Smile size={18} />
                                    </Button>
                                    <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white h-8 w-8 rounded-full">
                                        <Paperclip size={18} />
                                    </Button>
                                </div>
                                <textarea
                                    className="flex-1 bg-transparent border-none focus:ring-0 text-white text-sm resize-none max-h-32 py-2 px-2"
                                    placeholder="Type a message..."
                                    rows={1}
                                />
                                <div className="flex gap-1 pb-1">
                                    <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white h-8 w-8 rounded-full">
                                        <Mic size={18} />
                                    </Button>
                                    <Button size="icon" className="h-8 w-8 rounded-full bg-[#1C73E8] hover:bg-[#1557b0] text-white">
                                        <Send size={14} />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-gray-500">
                        <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4">
                            <Mail size={32} />
                        </div>
                        <p>Select a conversation to start chatting</p>
                    </div>
                )}
            </div>

            {/* 3. Right Sidebar: Customer Context (CRM) */}
            <div className="w-80 border-l border-white/10 bg-[#111] flex flex-col">
                {selectedConversation ? (
                    <>
                        <div className="p-6 text-center border-b border-white/10">
                            <Avatar className="h-20 w-20 mx-auto mb-3">
                                <AvatarImage src={selectedConversation.contact.avatar} />
                                <AvatarFallback className="text-lg">{selectedConversation.contact.name[0]}</AvatarFallback>
                            </Avatar>
                            <h3 className="font-bold text-white text-lg">{selectedConversation.contact.name}</h3>
                            <p className="text-sm text-gray-400">{selectedConversation.contact.role} at {selectedConversation.contact.company}</p>

                            <div className="flex justify-center gap-2 mt-4">
                                <Button size="sm" variant="outline" className="h-8 border-white/10 text-gray-300">
                                    <User size={14} className="mr-2" />
                                    Profile
                                </Button>
                                <Button size="sm" variant="outline" className="h-8 border-white/10 text-gray-300">
                                    <Building2 size={14} className="mr-2" />
                                    Deal
                                </Button>
                            </div>
                        </div>

                        <ScrollArea className="flex-1 p-6">
                            <div className="space-y-6">
                                {/* Info */}
                                <div className="space-y-3">
                                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Contact Info</h4>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex items-center gap-3 text-gray-300">
                                            <Mail size={14} className="text-gray-500" />
                                            {selectedConversation.contact.email || "No email"}
                                        </div>
                                        <div className="flex items-center gap-3 text-gray-300">
                                            <Phone size={14} className="text-gray-500" />
                                            {selectedConversation.contact.phone || "No phone"}
                                        </div>
                                        <div className="flex items-center gap-3 text-gray-300">
                                            <Clock size={14} className="text-gray-500" />
                                            Local time: 11:35 AM
                                        </div>
                                    </div>
                                </div>

                                <Separator className="bg-white/10" />

                                {/* Tags */}
                                <div className="space-y-3">
                                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Tags</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {selectedConversation.contact.tags?.map(tag => (
                                            <Badge key={tag} variant="secondary" className="bg-white/5 hover:bg-white/10 text-gray-300 font-normal">
                                                {tag}
                                            </Badge>
                                        ))}
                                        <Badge variant="outline" className="border-dashed border-white/20 text-gray-500 hover:text-gray-300 cursor-pointer">
                                            + Add
                                        </Badge>
                                    </div>
                                </div>

                                <Separator className="bg-white/10" />

                                {/* Agent Actions */}
                                <div className="space-y-3">
                                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</h4>
                                    <div className="space-y-2">
                                        <Button className="w-full bg-[#1C73E8] hover:bg-[#1557b0] text-white">Create CRM Deal</Button>
                                        <Button variant="outline" className="w-full border-white/10 text-gray-300">Send to Lead Gen</Button>
                                    </div>
                                </div>
                            </div>
                        </ScrollArea>
                    </>
                ) : (
                    <div className="p-8 text-center text-gray-500 text-sm">
                        Select a conversation to view details
                    </div>
                )}
            </div>
        </div>
    );
}
