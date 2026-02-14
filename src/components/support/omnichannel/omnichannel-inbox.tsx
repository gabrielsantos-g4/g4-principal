import { useState, useEffect, useRef, useCallback } from "react";
import { getConversations } from "@/actions/inbox/get-conversations";
import { getChatMessages } from "@/actions/inbox/get-messages";
import { sendMessage } from "@/actions/inbox/send-message";
import { toggleResponsibility } from "@/actions/inbox/toggle-responsibility";
import { ConversationList } from "./components/ConversationList";
import { ChatArea } from "./components/ChatArea";
import { LeadDetails } from "./components/LeadDetails";
import { MessageSquare } from "lucide-react";

import { createBrowserClient } from "@supabase/ssr";
import { signout } from "@/app/login/actions";
import { useBrowserNotification } from "@/hooks/use-browser-notification";
import { markAsRead } from "@/actions/crm/mark-as-read";
import { getMessagingUsers } from "@/actions/users/get-messaging-users";


// --- Types & Mock Data ---

import { Conversation } from "./components/ConversationList";






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

import { toast } from "sonner";

export function OmnichannelInbox({
    targetUserId,
    targetUser,
    mode = 'individual',
    crmSettings,
    viewerProfile,
    accessibleInboxes = [],
    onInboxChange,
    onNavigate
}: {
    targetUserId?: string,
    targetUser?: any,
    mode?: 'individual' | 'global',
    crmSettings?: any,
    viewerProfile?: any,
    accessibleInboxes?: any[],
    onInboxChange?: (id: string) => void,
    onNavigate?: (tab: string) => void
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



    // Message Input State
    const [isSending, setIsSending] = useState(false);

    async function handleSendMessage(text: string) {
        if (!text.trim() || !selectedConversation) return;

        setIsSending(true);

        try {
            // Optimistic update could go here, but user relies on Realtime
            const result = await sendMessage(selectedConversation.id, text);
            if (!result.success) {
                toast.error("Failed to send message: " + result.message);
            }
        } catch (error) {
            console.error("Send error:", error);
            toast.error("Failed to send message");
        } finally {
            setIsSending(false);
        }
    }

    const handleUpdateLead = async (updates: Partial<Conversation>) => {
        if (!selectedConversation) return;

        // Optimistic update
        setConversations(prev => prev.map(c =>
            c.id === selectedConversation.id
                ? { ...c, ...updates }
                : c
        ));

        // If updating status, call server action
        if (updates.status) {
            const toastId = toast.loading(`Updating status to ${updates.status}...`);
            try {
                const { updateLead } = await import('@/actions/crm/update-lead');
                const leadId = parseInt(selectedConversation.id);
                if (isNaN(leadId)) throw new Error("Invalid Lead ID");

                const result = await updateLead(leadId, { status: updates.status });

                if (result.success) {
                    toast.success(`Status updated values`, { id: toastId });
                } else {
                    throw new Error(result.error);
                }
            } catch (err: any) {
                toast.error("Failed to update status", { id: toastId, description: err.message });
                // Revert optimistic update for status
                // We'd need the old status value here, but simplified: refresh trigger
                setRefreshTrigger(prev => prev + 1);
            }
        }

        // Handle other updates if needed (e.g. nextStep, amount via other actions)
        // For now, assuming LeadDetails handles most other calls or we extend this as needed.
        // But LeadDetails currently doesn't call server actions for those, so we might need to add them here 
        // if we want 'onUpdateLead' to be the single handler. 
        // Logic for amount/history was in LeadDetails specific modals in original code.
    };
    const [manuallyUnreadIds, setManuallyUnreadIds] = useState<Set<string>>(new Set());



    const [searchQuery, setSearchQuery] = useState("");
    const [filterStatus, setFilterStatus] = useState<'all' | 'unread' | 'read'>('all');
    const [statusFilter, setStatusFilter] = useState<string | null>(null);



    return (
        <div className="flex h-full w-full bg-[#111] overflow-hidden">
            <ConversationList
                conversations={conversations}
                isLoading={isLoading}
                selectedConversationId={selectedConversationId}
                onSelectConversation={(id) => {
                    setSelectedConversationId(id);
                    // Mobile sidebar toggle logic from original could go here if needed
                }}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                // @ts-ignore
                filterStatus={filterStatus}
                // @ts-ignore
                setFilterStatus={setFilterStatus}
                statusFilter={statusFilter}
                setStatusFilter={setStatusFilter}
                manuallyUnreadIds={manuallyUnreadIds}
                setManuallyUnreadIds={setManuallyUnreadIds}
                mode={mode}
                targetUser={targetUser}
                targetUserId={targetUserId}
                // @ts-ignore
                accessibleInboxes={accessibleInboxes}
                // @ts-ignore
                onInboxChange={(val) => {
                    setTargetUserId(val);
                    setSearchQuery("");
                }}
            />

            <ChatArea
                selectedConversation={selectedConversation}
                messages={messages}
                isMessagesLoading={isMessagesLoading}
                currentUserId={currentUserId}
                isSending={isSending}
                onSendMessage={handleSendMessage}
                onToggleResponsibility={handleToggleResponsibility}
                isToggling={isToggling}
            />

            <LeadDetails
                selectedConversation={selectedConversation}
                crmSettings={crmSettings}
                messagingUsers={messagingUsers}
                currentUserId={currentUserId}
                onUpdateLead={handleUpdateLead}
                onTransfer={async (userId) => {
                    if (!selectedConversationId) return;
                    const { transferConversation } = await import('@/actions/crm/transfer-conversation');
                    toast.promise(transferConversation(selectedConversationId, userId), {
                        loading: 'Transferring...',
                        success: () => {
                            setConversations(prev => prev.filter(c => c.id !== selectedConversationId));
                            setSelectedConversationId(null);
                            return 'Conversation transferred';
                        },
                        error: 'Failed to transfer'
                    });
                }}
                onNavigate={onNavigate}
            />
        </div>
    );
}
