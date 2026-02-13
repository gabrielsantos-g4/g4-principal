import { useState, useEffect, useRef, useCallback } from "react";
import { getConversations } from "@/actions/inbox/get-conversations";
import { getChatMessages } from "@/actions/inbox/get-messages";
import { sendMessage } from "@/actions/inbox/send-message";
import { toggleResponsibility } from "@/actions/inbox/toggle-responsibility";
import { getMessagingUsers, MessagingUser } from "@/actions/users/get-messaging-users";
import { Search, Filter, Phone, Mail, MoreVertical, Send, Paperclip, Mic, Smile, Check, CheckCheck, Clock, User, Building2, Tag, MessageSquare, MessageCircle, Linkedin, Instagram, Facebook, Smartphone, ChevronDown, LogOut } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createBrowserClient } from "@supabase/ssr";
import { signout } from "@/app/login/actions";
import { useBrowserNotification } from "@/hooks/use-browser-notification";
import { markAsRead } from "@/actions/crm/mark-as-read";

// --- Types & Mock Data ---

type ChannelType = "whatsapp" | "linkedin" | "instagram" | "facebook" | "email" | "sms" | "web" | "phone";

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";

const CHANNELS_ORDER: ChannelType[] = ["whatsapp", "linkedin", "web", "instagram", "facebook", "email", "sms"];

function ChannelIcon({ type, status = "Open" }: { type: ChannelType, status?: string }) {
    switch (type) {
        case "whatsapp": return <div className="bg-white p-1 rounded-full shadow-[0_1px_2px_rgba(0,0,0,0.1)]"><MessageCircle size={14} className="text-[#25D366] fill-current" /></div>;
        case "linkedin": return <div className="bg-white p-1 rounded-full shadow-[0_1px_2px_rgba(0,0,0,0.1)]"><Linkedin size={14} className="text-[#0A66C2] fill-current" /></div>;
        case "instagram": return <div className="bg-white p-1 rounded-full shadow-[0_1px_2px_rgba(0,0,0,0.1)]"><Instagram size={14} className="text-[#E4405F]" /></div>;
        case "facebook": return <div className="bg-white p-1 rounded-full shadow-[0_1px_2px_rgba(0,0,0,0.1)]"><Facebook size={14} className="text-[#1877F2] fill-current" /></div>;
        case "email": return <div className="bg-white p-1 rounded-full shadow-[0_1px_2px_rgba(0,0,0,0.1)]"><Mail size={14} className="text-orange-500 fill-current" /></div>;
        case "sms": return <div className="bg-white p-1 rounded-full shadow-[0_1px_2px_rgba(0,0,0,0.1)]"><MessageSquare size={14} className="text-purple-500 fill-current" /></div>;
        case "phone": return <div className="bg-white p-1 rounded-full shadow-[0_1px_2px_rgba(0,0,0,0.1)]"><Phone size={14} className="text-blue-500 fill-current" /></div>;
        default: return <div className="bg-white p-1 rounded-full shadow-[0_1px_2px_rgba(0,0,0,0.1)]"><MessageSquare size={14} className="text-gray-400 fill-current" /></div>;
    }
}

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
    messages: Message[];
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
}



// Helper functions (copied from crm-table.tsx)
function parseDateStr(str: string): Date {
    if (!str || str === "Pending") return new Date(8640000000000000); // Far future
    // Try ISO format first
    const isoDate = new Date(str);
    if (!isNaN(isoDate.getTime()) && str.includes('-')) return isoDate;

    // Try "EEE, dd/MMM" format (e.g., "Mon, 12/Oct")
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

        // Assume current year
        const date = new Date();
        date.setFullYear(new Date().getFullYear(), month, day);
        date.setHours(0, 0, 0, 0);
        return date;
    } catch (e) {
        return new Date();
    }
}

function getDaysRemaining(dateStr: string): number | null {
    if (!dateStr || dateStr === "Pending") return null;
    const date = parseDateStr(dateStr);

    // Check if it's the "far future" dummy date
    if (date.getTime() >= 8640000000000000) return null;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const target = new Date(date);
    target.setHours(0, 0, 0, 0);

    const diffTime = target.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
}

// (removed duplicate imports)
import { LostLeadModal } from "@/components/crm/lost-lead-modal";
import { LeadHistoryModal } from "@/components/crm/lead-history-modal";
import { LeadAmountModal } from "@/components/crm/lead-amount-modal";
import { CrmProductSelect } from "@/components/crm/crm-product-select";
import { toast } from "sonner";

export function OmnichannelInbox({
    targetUserId,
    targetUser,
    mode = 'individual',
    crmSettings,
    viewerProfile,
    accessibleInboxes = [],
    onInboxChange
}: {
    targetUserId?: string,
    targetUser?: any,
    mode?: 'individual' | 'global',
    crmSettings?: any,
    viewerProfile?: any,
    accessibleInboxes?: any[],
    onInboxChange?: (id: string) => void
}) {
    // Permission Check
    const hasAccess = viewerProfile?.role === 'admin' || viewerProfile?.has_messaging_access;

    const DebugBanner = () => (
        <div className="bg-red-900/90 text-white p-2 text-[10px] font-mono border-b border-red-500/50 w-full z-50 flex justify-between">
            <span>[DEBUG] ID: {viewerProfile?.id?.substring(0, 8)}... | Role: {viewerProfile?.role} | Target: {targetUserId?.substring(0, 8) || 'Current'}</span>
            <span>Refresh Trigger: {refreshTrigger} | Convs: {conversations.length}</span>
        </div>
    );

    if (!hasAccess) {
        return (
            <div className="flex flex-col h-full bg-[#111]">
                <DebugBanner />
                <div className="flex flex-col items-center justify-center p-8 text-center flex-1">
                    <div className="bg-white/5 p-4 rounded-full mb-6">
                        <MessageSquare size={48} className="text-gray-500" />
                    </div>
                    <h3 className="text-xl font-medium text-white mb-2">Access Restricted</h3>
                    <p className="text-gray-400 max-w-md">
                        You don’t have access to messages yet, but you can still collaborate with your team using the panel on the left.
                    </p>
                </div>
            </div>
        )
    }
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
    const [messagingUsers, setMessagingUsers] = useState<MessagingUser[]>([]);
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);

    // Browser Notification Logic
    const hasUnread = conversations.some(c => c.unreadCount > 0);
    useBrowserNotification(hasUnread);

    useEffect(() => {
        const supabase = createBrowserClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );

        // Get current user
        supabase.auth.getUser().then(({ data: { user } }) => {
            if (user) setCurrentUserId(user.id);
        });

        // Realtime: Lead/CRM updates
        const channelLeads = supabase
            .channel(`inbox-leads-${Date.now()}`)
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'main_crm' },
                (payload) => {
                    console.log('[RT leads]', payload);
                    setRefreshTrigger(prev => prev + 1);
                }
            )
            .subscribe((status) => {
                console.log('[RT leads] status:', status);
            });

        // Realtime: New messages — directly reload messages
        const channelMsgs = supabase
            .channel(`inbox-messages-${Date.now()}`)
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'camp_mensagens' },
                (payload) => {
                    console.log('[RT messages] new message:', payload);
                    silentReloadMessages();
                    setRefreshTrigger(prev => prev + 1);
                }
            )
            .subscribe((status) => {
                console.log('[RT messages] status:', status);
            });

        return () => {
            supabase.removeChannel(channelLeads);
            supabase.removeChannel(channelMsgs);
        };
    }, []);

    // Realtime Refresh Logic
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    useEffect(() => {
        let isMounted = true;
        async function fetchData() {
            setIsLoading(true);
            try {
                // Fetch real data in parallel
                const [convData, usersData] = await Promise.all([
                    getConversations(targetUserId),
                    getMessagingUsers()
                ]);

                if (isMounted) {
                    setConversations(convData as Conversation[]);
                    setMessagingUsers(usersData);

                    // Select first if none selected
                    if (convData.length > 0 && !selectedConversationId) {
                        setSelectedConversationId(convData[0].id);
                    }
                }
            } catch (error) {
                console.error("Failed to fetch data", error);
                toast.error("Failed to load inbox");
            } finally {
                if (isMounted) setIsLoading(false);
            }
        }
        fetchData();
        return () => { isMounted = false; };
    }, [targetUserId, refreshTrigger]);

    const selectedConversation = conversations.find(c => c.id === selectedConversationId);

    // Message Loading Logic
    const [messages, setMessages] = useState<Message[]>([]);
    const [isMessagesLoading, setIsMessagesLoading] = useState(false);

    // Ref to track current selectedConversationId for Realtime callbacks
    const selectedConversationIdRef = useRef<string | null>(null);
    selectedConversationIdRef.current = selectedConversationId;

    // Silent reload: fetches messages without showing loading indicator
    const silentReloadMessages = useCallback(async () => {
        const convId = selectedConversationIdRef.current;
        if (!convId) return;
        try {
            const dbMessages = await getChatMessages(convId);
            if (dbMessages && dbMessages.length > 0) {
                setMessages(dbMessages as Message[]);
            }
        } catch (error) {
            console.error('[silentReload] Failed:', error);
        }
    }, []);

    // Initial load when conversation changes (with loading indicator)
    useEffect(() => {
        if (!selectedConversationId) {
            setMessages([]);
            return;
        }

        let isMounted = true;

        async function loadMessages() {
            setIsMessagesLoading(true);
            try {
                const dbMessages = await getChatMessages(selectedConversationId!);
                if (isMounted) {
                    if (dbMessages && dbMessages.length > 0) {
                        setMessages(dbMessages as Message[]);
                    } else {
                        const conv = conversations.find(c => c.id === selectedConversationId);
                        setMessages(conv?.messages || []);
                    }
                }
            } catch (error) {
                console.error('Failed to load messages', error);
            } finally {
                if (isMounted) setIsMessagesLoading(false);
            }
        }

        loadMessages();
        return () => { isMounted = false; };
    }, [selectedConversationId]);


    // Handle Responsibility Toggle
    const [isToggling, setIsToggling] = useState(false);

    async function handleToggleResponsibility() {
        if (!selectedConversation) return;

        setIsToggling(true);
        try {
            const result = await toggleResponsibility(selectedConversation.id, selectedConversation.quem_atende);
            if (result.success) {
                // Optimistic update or refresh
                // For now, simpler to trigger a refresh via router or re-fetch conversations
                setRefreshTrigger(prev => prev + 1); // This will re-fetch list and update properties
            }
        } catch (error) {
            console.error("Failed to toggle responsibility", error);
        } finally {
            setIsToggling(false);
        }
    }

    // State for Lost Lead Modal
    const [isLostModalOpen, setIsLostModalOpen] = useState(false);

    // Message Input State
    const [messageInput, setMessageInput] = useState("");
    const [isSending, setIsSending] = useState(false);

    async function handleSendMessage() {
        if (!messageInput.trim() || !selectedConversation) return;

        const text = messageInput;
        setMessageInput(""); // Clear immediately for UX
        setIsSending(true);

        try {
            // Optimistic update could go here, but user relies on Realtime
            const result = await sendMessage(selectedConversation.id, text);
            if (!result.success) {
                toast.error("Failed to send message: " + result.message);
                setMessageInput(text); // Restore on failure
            }
        } catch (error) {
            console.error("Send error:", error);
            toast.error("Failed to send message");
            setMessageInput(text);
        } finally {
            setIsSending(false);
        }
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    // CRM Modal States
    const [historyLead, setHistoryLead] = useState<any | null>(null);
    const [amountLead, setAmountLead] = useState<any | null>(null);

    // Derived settings for dropdowns (using crmSettings or defaults)
    const STATUSES = crmSettings?.statuses || [
        { label: "New", bg: "bg-blue-500/10", text: "text-blue-500" },
        { label: "Talking", bg: "bg-green-500/10", text: "text-green-500" },
        { label: "Won", bg: "bg-green-500/10", text: "text-green-500" },
        { label: "Lost", bg: "bg-red-500/10", text: "text-red-500" }
    ];
    const SOURCES = crmSettings?.sources || ["Instagram", "LinkedIn", "Google Ads"];

    // Mock handlers
    const handleDateSelect = (date: Date | undefined) => { if (date) toast.success(`Date updated to ${format(date, "EEE, dd/MMM")}`); };
    const handleProgressClick = (step: number) => { toast.success(`Progress updated to step ${step}`); };
    const handleProductChange = (products: string[], total: number) => { toast.success("Product updated"); };
    const handleSaveAmount = (amount: string) => { setAmountLead(null); toast.success(`Amount saved: ${amount}`); };
    const handleAddHistoryMessage = (msg: string) => { setHistoryLead(null); toast.success("History note added"); };



    const handleResolve = (action: 'Won' | 'Lost') => {
        if (!selectedConversation) return;

        if (action === 'Won') {
            toast.success("Nice! Deal won.");
            // In a real app: await updateLead(selectedConversation.id, { status: 'Won' });
            // For now, we just update local mock state visualization or remove it
        } else {
            setIsLostModalOpen(true);
        }
    };

    const handleConfirmLost = (reason: string) => {
        setIsLostModalOpen(false);
        toast.error("No problem. Let’s move forward.", {
            description: `Reason: ${reason}`
        });
        // In a real app: await updateLead(selectedConversation.id, { status: 'Lost', lost_reason: reason });
    };

    const handleStatusChange = async (newStatus: string) => {
        if (!selectedConversation) return;

        // Optimistic update
        const oldStatus = selectedConversation.status;
        setConversations(prev => prev.map(c =>
            c.id === selectedConversation.id
                ? { ...c, status: newStatus as any }
                : c
        ));

        const toastId = toast.loading(`Updating status to ${newStatus}...`);

        try {
            const { updateLead } = await import('@/actions/crm/update-lead');
            // Ensure ID is number if needed, but safe check
            const leadId = parseInt(selectedConversation.id);
            if (isNaN(leadId)) throw new Error("Invalid Lead ID");

            const result = await updateLead(leadId, { status: newStatus });

            if (result.success) {
                toast.success(`Status updated to ${newStatus}`, { id: toastId });
            } else {
                throw new Error(result.error);
            }
        } catch (err: any) {
            toast.error("Failed to update status", { id: toastId, description: err.message });
            // Revert optimistic update
            setConversations(prev => prev.map(c =>
                c.id === selectedConversation.id
                    ? { ...c, status: oldStatus }
                    : c
            ));
        }
    }
    const [manuallyUnreadIds, setManuallyUnreadIds] = useState<Set<string>>(new Set());

    const toggleUnread = async (convId: string, e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent opening conversation
        const conversation = conversations.find(c => c.id === convId);
        if (!conversation) return;

        // DB field is is_read_by_responsible.
        // If we want to mark as UNREAD, we need is_read_by_responsible = FALSE.
        // Currently read (unreadCount == 0) -> Mark as unread -> FALSE
        // Currently unread (unreadCount > 0) -> Mark as read -> TRUE

        // Check current local state (optimistic or real)
        const isCurrentlyUnread = conversation.unreadCount > 0 || manuallyUnreadIds.has(convId);

        // If currently unread, we want to mark as read (true). 
        // If currently read, we want to mark as unread (false).
        const targetDbStatus = isCurrentlyUnread; // true = read, false = unread ?? Wait.
        // markAsRead(..., true) -> sets is_read_by_responsible = true (READ)
        // markAsRead(..., false) -> sets is_read_by_responsible = false (UNREAD)

        // If isCurrentlyUnread is TRUE, we want to mark as READ (is_read_by_responsible = TRUE).
        // If isCurrentlyUnread is FALSE, we want to mark as UNREAD (is_read_by_responsible = FALSE).
        // So targetDbStatus = isCurrentlyUnread?

        // Let's trace:
        // Case 1: Message is Unread (isCurrentlyUnread = true). User clicks "Mark as read".
        // We want DB is_read_by_responsible = true.
        // So passed arg should be `true`. `isCurrentlyUnread` is `true`. Matches.

        // Case 2: Message is Read (isCurrentlyUnread = false). User clicks "Mark as unread".
        // We want DB is_read_by_responsible = false.
        // So passed arg should be `false`. `isCurrentlyUnread` is `false`. Matches.

        const statusToSet = isCurrentlyUnread;

        // Optimistic Update
        setManuallyUnreadIds(prev => {
            const newSet = new Set(prev);
            if (!statusToSet) { // If setting to UNREAD (false)
                newSet.add(convId);
            } else { // If setting to READ (true)
                newSet.delete(convId);
            }
            return newSet;
        });

        // Call Server Action
        await markAsRead(convId, statusToSet);
    };

    const [searchQuery, setSearchQuery] = useState("");
    const [filterStatus, setFilterStatus] = useState<'all' | 'unread' | 'read'>('all');

    // --- Filter Logic ---
    const filteredConversations = conversations.filter(conv => {
        // 1. Search Query
        let matchesSearch = true;
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            matchesSearch = (
                conv.contact.name.toLowerCase().includes(query) ||
                conv.lastMessage.toLowerCase().includes(query)
            );
        }

        // 2. Status Filter
        const isUnread = conv.unreadCount > 0 || manuallyUnreadIds.has(conv.id);
        let matchesStatus = true;
        if (filterStatus === 'unread') {
            matchesStatus = isUnread;
        } else if (filterStatus === 'read') {
            matchesStatus = !isUnread;
        }

        return matchesSearch && matchesStatus;
    });

    return (
        <div className="flex h-full w-full bg-[#111] overflow-hidden">
            <LostLeadModal
                isOpen={isLostModalOpen}
                onClose={() => setIsLostModalOpen(false)}
                onConfirm={handleConfirmLost}
                reasons={crmSettings?.lost_reasons || ["Price too high", "Competitor", "Features missing", "Bad timing"]}
            />
            {/* 1. Left Sidebar: Conversation List */}
            <div className="w-80 border-r border-white/10 flex flex-col bg-[#111] h-full overflow-hidden">
                {/* ... existing sidebar code ... */}
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
                                    <AvatarImage src={targetUser.avatar_url || targetUser.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(targetUser.name)}&background=random`} />
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
                    <div className="relative">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                        <Input
                            placeholder="Search..."
                            className="pl-9 bg-white/5 border-white/10 text-white h-9 focus-visible:ring-transparent"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-2 text-xs">
                        <Badge
                            variant={filterStatus === 'all' ? "secondary" : "outline"}
                            className={cn(
                                "cursor-pointer transition-colors",
                                filterStatus === 'all' ? "bg-white/10 hover:bg-white/20" : "text-gray-400 border-white/10 hover:bg-white/5"
                            )}
                            onClick={() => setFilterStatus('all')}
                        >
                            All
                        </Badge>
                        <Badge
                            variant={filterStatus === 'unread' ? "secondary" : "outline"}
                            className={cn(
                                "cursor-pointer transition-colors",
                                filterStatus === 'unread' ? "bg-white/10 hover:bg-white/20" : "text-gray-400 border-white/10 hover:bg-white/5"
                            )}
                            onClick={() => setFilterStatus('unread')}
                        >
                            Unread
                        </Badge>
                        <Badge
                            variant={filterStatus === 'read' ? "secondary" : "outline"}
                            className={cn(
                                "cursor-pointer transition-colors",
                                filterStatus === 'read' ? "bg-white/10 hover:bg-white/20" : "text-gray-400 border-white/10 hover:bg-white/5"
                            )}
                            onClick={() => setFilterStatus('read')}
                        >
                            Read
                        </Badge>
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
                                return (
                                    <div
                                        key={conv.id}
                                        onClick={() => {
                                            setSelectedConversationId(conv.id);
                                            // Mark as read immediately if it's currently unread
                                            if (conv.unreadCount > 0 || manuallyUnreadIds.has(conv.id)) {
                                                // Optimistic update
                                                // If needed we can clear manuallyUnreadIds too
                                                if (manuallyUnreadIds.has(conv.id)) {
                                                    setManuallyUnreadIds(prev => {
                                                        const newSet = new Set(prev);
                                                        newSet.delete(conv.id);
                                                        return newSet;
                                                    });
                                                }
                                                // Server action
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
                                                <AvatarFallback>{conv.contact.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                                            </Avatar>
                                            <div className="absolute -bottom-1 -right-1 z-10">
                                                <ChannelIcon type={conv.channel} />
                                            </div>
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-baseline mb-0.5">
                                                <span className={cn("truncate", isUnread ? "font-bold text-white" : "font-medium text-gray-300")}>
                                                    {conv.contact.name}
                                                </span>
                                                <span className={cn("text-[10px] whitespace-nowrap ml-2", isUnread ? "text-[#00A884] font-bold" : "text-gray-500")}>
                                                    {conv.lastMessageAt}
                                                </span>
                                            </div>
                                            <div className="flex justify-between items-center text-xs text-gray-400">
                                                <span className={cn("truncate max-w-[180px]", isUnread && "font-medium text-white")}>
                                                    {/* Prefix: "You: " if last message was from me */}
                                                    {conv.messages[conv.messages.length - 1]?.senderId === 'me' && "You: "}
                                                    {conv.lastMessage}
                                                </span>
                                                {isUnread && (
                                                    <div className="h-2 w-2 rounded-full bg-[#00A884] flex-shrink-0 ml-2 shadow-[0_0_4px_rgba(0,168,132,0.6)]" />
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </ScrollArea>
            </div >

            {/* 2. Middle: Chat Area */}
            < div className="flex-1 flex flex-col bg-[#0f0f0f] relative" >
                {
                    selectedConversation ? (
                        <>
                            {/* Chat Header */}
                            < div className="h-16 border-b border-white/10 flex items-center justify-between px-6 bg-[#111]" >
                                <div className="flex items-center gap-3">
                                    <Avatar className="h-9 w-9">
                                        <AvatarImage src={selectedConversation.contact.avatar} />
                                        <AvatarFallback>{selectedConversation.contact.name[0]}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <h4 className="text-sm font-bold text-white flex items-center gap-2">
                                            {selectedConversation.contact.name}
                                        </h4>
                                        <div className="text-xs text-gray-400 flex items-center gap-1">
                                            Talking on <Badge variant="secondary" className="bg-white/10 hover:bg-white/20 text-gray-300 border-0 px-1.5 h-5 flex items-center gap-1">
                                                {selectedConversation.channel === 'whatsapp' && <MessageSquare size={10} />}
                                                <span className="capitalize">{selectedConversation.channel}</span>
                                            </Badge>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button size="sm" className="bg-[#1C73E8] hover:bg-[#1557b0] ml-2">
                                                Resolve
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="bg-[#1A1A1A] border-white/10 text-white">
                                            <DropdownMenuItem onClick={() => handleResolve('Won')} className="focus:bg-white/10 cursor-pointer">
                                                Move to Won
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => handleResolve('Lost')} className="focus:bg-white/10 cursor-pointer text-red-400 focus:text-red-400">
                                                Move to Lost
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </div >

                            {/* Messages Area */}
                            <ScrollArea className="flex-1 p-6">
                                <div className="space-y-6">
                                    {/* Date Divider */}
                                    <div className="flex justify-center">
                                        <span className="text-[10px] text-gray-500 bg-white/5 px-2 py-1 rounded-full">
                                            Today
                                        </span>
                                    </div>

                                    {isMessagesLoading ? (
                                        <div className="flex justify-center p-4">
                                            <div className="w-6 h-6 border-2 border-[#1C73E8] border-t-transparent rounded-full animate-spin" />
                                        </div>
                                    ) : messages.length === 0 ? (
                                        <div className="text-center text-gray-500 text-xs mt-10">
                                            No messages yet.
                                        </div>
                                    ) : (
                                        messages.map((msg) => {
                                            const isMe = msg.senderId === "me";
                                            return (
                                                <div key={msg.id} className={cn("flex", isMe ? "justify-end" : "justify-start")}>
                                                    <div className={cn(
                                                        "max-w-[70%] rounded-2xl px-4 py-2 text-sm",
                                                        isMe
                                                            ? "bg-[#1C73E8] text-white rounded-br-none"
                                                            : "bg-white/10 text-gray-200 rounded-bl-none"
                                                    )}>
                                                        <p className="whitespace-pre-wrap">{msg.content}</p>
                                                        <div className={cn("flex items-center gap-1 justify-end mt-1", isMe ? "text-blue-200" : "text-gray-500")}>
                                                            <span className="text-[10px]">{msg.timestamp}</span>
                                                            {isMe && <CheckCheck size={12} />}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    )}
                                </div>
                            </ScrollArea>

                            <div className="p-4 bg-[#111] border-t border-white/10 flex gap-4 items-end">
                                <div className="bg-white/5 rounded-xl flex items-end p-2 border border-white/5 focus-within:border-white/20 transition-colors flex-1">
                                    <div className="flex gap-1 pb-1">
                                        <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white h-8 w-8 rounded-full">
                                            <Smile size={18} />
                                        </Button>
                                        <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white h-8 w-8 rounded-full">
                                            <Paperclip size={18} />
                                        </Button>
                                    </div>
                                    <textarea
                                        className="flex-1 bg-transparent border-none focus:ring-0 text-white text-sm resize-none max-h-32 py-2 px-2 whitespace-pre-wrap scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent"
                                        placeholder="Type a message..."
                                        rows={1}
                                        value={messageInput}
                                        onChange={(e) => setMessageInput(e.target.value)}
                                        onKeyDown={handleKeyDown}
                                        disabled={isSending}
                                    />
                                    <div className="flex gap-1 pb-1">
                                        <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white h-8 w-8 rounded-full">
                                            <Mic size={18} />
                                        </Button>
                                        <Button
                                            size="icon"
                                            className="h-8 w-8 rounded-full bg-[#1C73E8] hover:bg-[#1557b0] text-white disabled:opacity-50 disabled:cursor-not-allowed"
                                            onClick={handleSendMessage}
                                            disabled={!messageInput.trim() || isSending}
                                        >
                                            <Send size={14} />
                                        </Button>
                                    </div>
                                </div>

                                {(targetUser?.name === 'Jess' || targetUser?.name === 'Jess AI' || true) && (
                                    (() => {
                                        const status = selectedConversation.quem_atende?.toLowerCase() || 'agente'; // Default to agent if null
                                        const isAgent = status === 'agente' || status === 'agent';

                                        // Only show if it's one of these (or default)
                                        // Logic:
                                        // If 'Agente' -> Show "Take Over" (Red)
                                        // If 'Humano' -> Show "Agent Resumes" (Green/Blue)

                                        if (isAgent) {
                                            return (
                                                <Button
                                                    variant="outline"
                                                    onClick={handleToggleResponsibility}
                                                    disabled={isToggling}
                                                    className="h-[50px] border-red-500/20 bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:text-red-300 font-bold px-6 whitespace-nowrap"
                                                >
                                                    {isToggling ? "Updating..." : "Take Over Conversation"}
                                                </Button>
                                            );
                                        } else {
                                            return (
                                                <Button
                                                    variant="outline"
                                                    onClick={handleToggleResponsibility}
                                                    disabled={isToggling}
                                                    className="h-[50px] border-green-500/20 bg-green-500/10 text-green-400 hover:bg-green-500/20 hover:text-green-300 font-bold px-6 whitespace-nowrap"
                                                >
                                                    {isToggling ? "Updating..." : "Agent Resumes Contact"}
                                                </Button>
                                            );
                                        }
                                    })()
                                )}
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-gray-500">
                            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4">
                                <Mail size={32} />
                            </div>
                            <p>Select a conversation to start chatting</p>
                        </div>
                    )
                }
            </div >

            {/* 3. Right Sidebar: Customer Context (CRM) */}
            < div className="w-80 border-l border-white/10 bg-[#111] flex flex-col" >
                {
                    selectedConversation ? (
                        <>
                            <div className="p-6 text-center border-b border-white/10">
                                <Avatar className="h-20 w-20 mx-auto mb-3">
                                    <AvatarImage src={selectedConversation.contact.avatar} />
                                    <AvatarFallback className="text-lg">{selectedConversation.contact.name[0]}</AvatarFallback>
                                </Avatar>
                                <h3 className="font-bold text-white text-lg">{selectedConversation.contact.name}</h3>
                                <p className="text-sm text-gray-400 font-medium mb-1">{selectedConversation.contact.company}</p>

                                {/* Channel specific info */}
                                <p className="text-xs text-gray-500">
                                    {(selectedConversation.channel === 'whatsapp' || selectedConversation.channel === 'sms') && (
                                        <span className="flex items-center justify-center gap-2">
                                            <Phone size={12} />
                                            {selectedConversation.contact.phone}
                                        </span>
                                    )}
                                    {(selectedConversation.channel === 'email') && (
                                        <span className="flex items-center justify-center gap-2">
                                            <Mail size={12} />
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

                            <ScrollArea className="flex-1 p-6">
                                <div className="space-y-6">
                                    {/* CRM Fields Mirror */}
                                    <div className="space-y-4">
                                        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Deal Info</h4>

                                        {/* Next Step & Date */}
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs text-gray-400">Next Step</span>
                                                <div className="flex items-center gap-1">
                                                    <Popover>
                                                        <PopoverTrigger asChild>
                                                            <button className={`text-[11px] font-semibold hover:bg-white/10 rounded px-1 transition-colors ${parseDateStr(selectedConversation.nextStep.date) < new Date(new Date().setHours(0, 0, 0, 0)) ? 'text-red-400' : 'text-gray-400'}`}>
                                                                {selectedConversation.nextStep.date}
                                                            </button>
                                                        </PopoverTrigger>
                                                        <PopoverContent className="w-auto p-0" align="end">
                                                            <Calendar mode="single" selected={parseDateStr(selectedConversation.nextStep.date)} onSelect={handleDateSelect} initialFocus />
                                                        </PopoverContent>
                                                    </Popover>
                                                </div>
                                            </div>

                                            {/* Progress Dots */}
                                            <div className="flex items-center justify-between bg-white/5 p-2 rounded-lg">
                                                <div className="flex space-x-1.5">
                                                    {[...Array(5)].map((_, i) => {
                                                        const stepIndex = i + 1;
                                                        const isActive = stepIndex <= selectedConversation.nextStep.progress;
                                                        const isMsgSaida = stepIndex === 5;
                                                        let bgColor = 'bg-gray-700';
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
                                                <div className="flex items-center gap-2">
                                                    <button onClick={() => handleProgressClick(6)} className={`w-2.5 h-2.5 rounded-full transition-all ${selectedConversation.nextStep.progress >= 6 ? 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.4)]' : 'bg-gray-700'}`} />
                                                    <div className="cursor-pointer hover:bg-white/10 p-1 rounded-full text-[#1C73E8]" onClick={() => setHistoryLead(selectedConversation)}>
                                                        <MessageCircle size={12} />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Product & Amount */}
                                        <div className="grid grid-cols-2 gap-2">
                                            <div className="space-y-1">
                                                <span className="text-xs text-gray-400">Product</span>
                                                <CrmProductSelect value={selectedConversation.product || "[]"} options={crmSettings?.products || []} onChange={handleProductChange} />
                                            </div>
                                            <div className="space-y-1">
                                                <span className="text-xs text-gray-400">Amount</span>
                                                <button
                                                    className="w-full text-left font-mono text-xs bg-white/5 hover:bg-white/10 p-2 rounded text-gray-200"
                                                    onClick={() => setAmountLead(selectedConversation)}
                                                >
                                                    {selectedConversation.amount}
                                                </button>
                                            </div>
                                        </div>

                                        {/* Qualification */}
                                        <div className="space-y-1">
                                            <span className="text-xs text-gray-400">Qualification</span>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <button className={`flex items-center justify-between text-xs px-2 py-1.5 rounded w-full outline-none transition-colors border ${(() => {
                                                        switch (selectedConversation.qualification_status?.toLowerCase()) {
                                                            case 'mql': return "bg-blue-500/10 text-blue-400 border-blue-500/20 font-bold";
                                                            case 'sql': return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 font-bold";
                                                            case 'nq': return "bg-red-500/10 text-red-400 border-red-500/20 font-bold";
                                                            default: return 'text-gray-400 border-white/5 bg-white/5';
                                                        }
                                                    })()}`}>
                                                        <span className="uppercase">{selectedConversation.qualification_status || "Pending"}</span>
                                                        <ChevronDown size={12} className="opacity-50" />
                                                    </button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent className="w-[200px] bg-[#1A1A1A] border-white/10 text-white">
                                                    <DropdownMenuItem className="text-blue-400">MQL</DropdownMenuItem>
                                                    <DropdownMenuItem className="text-emerald-400">SQL</DropdownMenuItem>
                                                    <DropdownMenuItem className="text-red-400">NQ</DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>

                                        {/* Source */}
                                        <div className="space-y-1">
                                            <span className="text-xs text-gray-400">Source</span>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <button className="flex items-center justify-between text-xs px-2 py-1.5 rounded w-full outline-none transition-colors border border-white/5 bg-white/5 text-gray-300 hover:bg-white/10">
                                                        <span>{selectedConversation.source}</span>
                                                        <ChevronDown size={12} className="opacity-50" />
                                                    </button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent className="w-[200px] bg-[#1A1A1A] border-white/10 text-white">
                                                    {SOURCES.map((s: any) => (
                                                        <DropdownMenuItem key={typeof s === 'string' ? s : s.label}>
                                                            {typeof s === 'string' ? s : s.label}
                                                        </DropdownMenuItem>
                                                    ))}
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>


                                    </div>
                                </div>
                            </ScrollArea>

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

                            {/* Footer Actions */}
                            <div className="p-4 border-t border-white/10 bg-[#111] space-y-4">
                                {/* Status Section */}
                                <div className="space-y-1">
                                    <label className="text-[10px] uppercase text-gray-500 font-bold">Status</label>
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

                                <div className="space-y-1">
                                    <label className="text-[10px] uppercase text-gray-500 font-bold">Transfer conversation to</label>
                                    <Select
                                        value={selectedConversation.contact.name === 'Jess' ? 'Jess' : ''}
                                        onValueChange={async (value) => {
                                            if (!selectedConversation) return;

                                            const toastId = toast.loading(`Transferring to ${value}...`);
                                            try {
                                                const { transferConversation } = await import('@/actions/crm/transfer-conversation');
                                                const result = await transferConversation(selectedConversation.id, value);

                                                if (result.success) {
                                                    toast.success(`Transferred to ${value}`, { id: toastId });
                                                    // Remove from list or refresh
                                                    setConversations(prev => prev.filter(c => c.id !== selectedConversation.id));
                                                    setSelectedConversationId(null);
                                                } else {
                                                    toast.error('Failed to transfer', { id: toastId });
                                                }
                                            } catch (err) {
                                                toast.error('Error transferring conversation', { id: toastId });
                                            }
                                        }}
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
                                                        value={user.name}
                                                        className="focus:bg-white/10 focus:text-white cursor-pointer"
                                                    >
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-2 h-2 rounded-full bg-blue-500" />
                                                            <span className="text-white">{user.name}</span>
                                                        </div>
                                                    </SelectItem>
                                                ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="p-8 text-center text-gray-500 text-sm">
                            Select a conversation to view details
                        </div>
                    )}
            </div >
        </div >
    );
}
