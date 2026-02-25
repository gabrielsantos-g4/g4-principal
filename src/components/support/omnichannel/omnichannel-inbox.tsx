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
import { AGENTS } from "@/lib/agents";
import { signout } from "@/app/login/actions";
import { useBrowserNotification } from "@/hooks/use-browser-notification";
import { getMessagingUsers, MessagingUser } from "@/actions/users/get-messaging-users";
import { getInstanceAvatarByAgent } from "@/actions/inbox/get-instance-avatar";
import { LostLeadModal } from "@/components/crm/lost-lead-modal";
import { RealtimeDiagnostics } from "./realtime-diagnostics";
import { getSupabaseRealtimeClient } from "@/lib/supabase-realtime";
import { TestRealtimeSimple } from "./test-realtime-simple";

// --- Types & Mock Data ---

import { Conversation } from "./components/ConversationList";

interface Message {
    id: string;
    content: string;
    senderId: string;
    timestamp: string;
    status: string;
    type: string;
    mediaUrl?: string;
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
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
    const [messagingUsers, setMessagingUsers] = useState<MessagingUser[]>([]);
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);
    const [instanceAvatar, setInstanceAvatar] = useState<string | undefined>(undefined);

    // Browser Notification Logic
    const hasUnread = conversations.some(c => c.unreadCount > 0);
    useBrowserNotification(hasUnread);

    // Use singleton Supabase client for Realtime
    const supabase = getSupabaseRealtimeClient();

    // Refs to track channels and prevent duplicates
    const channelsRef = useRef<{ leads: any; messages: any }>({ leads: null, messages: null });
    const isSubscribingRef = useRef(false);

    // Realtime Refresh Logic with Polling Fallback
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [usePolling, setUsePolling] = useState(false);
    const isInitialLoad = useRef(true);
    const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

    // Realtime subscription with automatic fallback to polling
    useEffect(() => {
        if (!crmSettings?.empresa_id || isSubscribingRef.current) return;

        const empresaId = crmSettings.empresa_id;

        // Prevent duplicate subscriptions
        isSubscribingRef.current = true;

        // Get current user
        (async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) setCurrentUserId(user.id);
        })();

        // Use a stable channel ID with a unique suffix to prevent conflicts on remount
        const mountId = Date.now();
        const channelLeadsId = `omnichannel-leads-${empresaId}-${mountId}`;
        const channelMsgsId = `omnichannel-messages-${empresaId}-${mountId}`;

        console.log('[OmnichannelInbox] 🔄 Attempting Realtime connection for empresa:', empresaId);
        console.log('[OmnichannelInbox] Channel IDs:', { channelLeadsId, channelMsgsId });

        // Clean up any existing channels first
        if (channelsRef.current.leads) {
            supabase.removeChannel(channelsRef.current.leads);
            channelsRef.current.leads = null;
        }
        if (channelsRef.current.messages) {
            supabase.removeChannel(channelsRef.current.messages);
            channelsRef.current.messages = null;
        }

        let realtimeFailed = false;

        // Realtime: Lead/CRM updates
        channelsRef.current.leads = supabase
            .channel(channelLeadsId)
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'main_crm',
                    filter: `empresa_id=eq.${empresaId}`
                },
                (payload: any) => {
                    console.log('[OmnichannelInbox] 🔥 Realtime: CRM update detected!', payload);
                    setRefreshTrigger(prev => prev + 1);
                }
            )
            .subscribe((status: string, err?: Error) => {
                if (status === 'SUBSCRIBED') {
                    console.log('[OmnichannelInbox] ✅ Realtime connected successfully');
                    setUsePolling(false);
                }
                if (status === 'CHANNEL_ERROR') {
                    console.warn('[OmnichannelInbox] ⚠️ Realtime failed, enabling polling fallback');
                    realtimeFailed = true;
                    setUsePolling(true);
                }
            });

        // Realtime: New messages
        channelsRef.current.messages = supabase
            .channel(channelMsgsId)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'camp_mensagens_n',
                    filter: `empresa_id=eq.${empresaId}`
                },
                (payload: any) => {
                    console.log('[OmnichannelInbox] 🔥 Realtime: New message detected!', payload);
                    silentReloadMessages();
                    setRefreshTrigger(prev => prev + 1);
                }
            )
            .subscribe((status: string) => {
                if (status === 'CHANNEL_ERROR') {
                    realtimeFailed = true;
                    setUsePolling(true);
                }
            });

        return () => {
            console.log('[OmnichannelInbox] Cleaning up realtime channels');
            isSubscribingRef.current = false;

            if (channelsRef.current.leads) {
                supabase.removeChannel(channelsRef.current.leads);
                channelsRef.current.leads = null;
            }
            if (channelsRef.current.messages) {
                supabase.removeChannel(channelsRef.current.messages);
                channelsRef.current.messages = null;
            }
        };
    }, [crmSettings?.empresa_id]);

    // Message Loading Logic
    const [messages, setMessages] = useState<Message[]>([]);
    const [isMessagesLoading, setIsMessagesLoading] = useState(false);

    // Ref to track current selectedConversationId for Realtime callbacks
    const selectedConversationIdRef = useRef<string | null>(null);
    selectedConversationIdRef.current = selectedConversationId;

    // Silent reload: fetches messages without showing loading indicator
    const silentReloadMessages = useCallback(async () => {
        const convId = selectedConversationIdRef.current;
        console.log('[silentReload] Called for conversation:', convId);
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

    // Polling fallback when Realtime fails
    useEffect(() => {
        if (!targetUserId || !usePolling) return;

        console.log('[OmnichannelInbox] 🔄 Polling mode enabled (refreshing every 5 seconds)');

        pollingIntervalRef.current = setInterval(() => {
            console.log('[OmnichannelInbox] 📊 Polling: Refreshing data...');
            setRefreshTrigger(prev => prev + 1);
            silentReloadMessages(); // Ensure messages in the active chat are also refreshed during polling
        }, 5000); // Poll every 5 seconds

        return () => {
            if (pollingIntervalRef.current) {
                console.log('[OmnichannelInbox] 🛑 Stopping polling');
                clearInterval(pollingIntervalRef.current);
                pollingIntervalRef.current = null;
            }
        };
    }, [targetUserId, usePolling, silentReloadMessages]);

    useEffect(() => {
        let isMounted = true;
        async function fetchData() {
            console.log("[OmnichannelInbox] fetchData called. targetUserId:", targetUserId, "empresaId:", crmSettings?.empresa_id);
            if (!targetUserId || !crmSettings?.empresa_id) {
                console.log("[OmnichannelInbox] fetchData early return - missing IDs");
                if (isInitialLoad.current) setIsLoading(false);
                return;
            }

            // Only show loading spinner on initial load, not on realtime refreshes
            const showLoading = isInitialLoad.current;
            if (showLoading) setIsLoading(true);

            try {
                const [convData, usersData] = await Promise.all([
                    getConversations(targetUserId),
                    getMessagingUsers()
                ]);

                if (isMounted) {
                    setConversations(convData as Conversation[]);
                    setMessagingUsers(usersData);
                    console.log("[OmnichannelInbox] Messaging users loaded:", usersData.length, usersData.map(u => u.name));

                    // Fetch instance avatar if targetUserId is an agent
                    const agent = AGENTS.find(a => a.id === targetUserId);
                    if (agent) {
                        getInstanceAvatarByAgent(agent.name).then(avatar => {
                            if (isMounted && avatar) setInstanceAvatar(avatar);
                        }).catch(err => {
                            console.error("[OmnichannelInbox] Instance avatar fetch failed:", err);
                        });
                    } else {
                        setInstanceAvatar(undefined);
                    }

                    if (convData.length > 0 && !selectedConversationId && convData[0]) {
                        setSelectedConversationId(convData[0].id);
                    }
                }
            } catch (error) {
                console.error("Failed to fetch data", error);
                if (showLoading && isMounted) toast.error("Failed to load inbox");
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                    isInitialLoad.current = false;
                }
            }
        }
        fetchData();
        return () => { isMounted = false; };
    }, [targetUserId, refreshTrigger, crmSettings?.empresa_id]);

    // Initial load when conversation changes (with loading indicator)
    const selectedConversation = conversations.find(c => c.id === selectedConversationId);

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
    const [isLostModalOpen, setIsLostModalOpen] = useState(false);
    const [isTogglingQuemAtende, setIsTogglingQuemAtende] = useState(false);

    async function handleToggleQuemAtende() {
        if (!selectedConversation?.leadId) return;

        setIsTogglingQuemAtende(true);
        try {
            const { updateLead } = await import('@/actions/crm/update-lead');
            const current = (selectedConversation.quem_atende || 'agente').toLowerCase();
            const newValue = current === 'humano' ? 'Agente' : 'Humano';

            const result = await updateLead(selectedConversation.leadId, { quem_atende: newValue });
            if (!result.success) throw new Error(result.error);

            // Optimistic update
            setConversations(prev => prev.map(c =>
                c.id === selectedConversation.id
                    ? { ...c, quem_atende: newValue }
                    : c
            ));
            toast.success(`Transferred to ${newValue}`);
        } catch (error) {
            console.error("Failed to toggle quem_atende", error);
            toast.error("Failed to transfer");
        } finally {
            setIsTogglingQuemAtende(false);
        }
    }

    async function handleToggleResponsibility(status?: string) {
        if (!selectedConversation) return;

        // If status is Lost, open the modal instead of immediate update
        if (status === 'Lost') {
            setIsLostModalOpen(true);
            return;
        }

        setIsToggling(true);
        try {
            // If status provided (Won), update it first
            if (status) {
                const toastId = toast.loading(`Updating status to ${status}...`);
                const { updateLead } = await import('@/actions/crm/update-lead');
                const leadId = selectedConversation.leadId;
                if (leadId) {
                    const result = await updateLead(leadId, { status });
                    if (!result.success) throw new Error(result.error);
                    toast.success("Status updated", { id: toastId });
                }
            }

            const result = await toggleResponsibility(selectedConversation.id, selectedConversation.quem_atende);
            if (result.success) {
                setRefreshTrigger(prev => prev + 1);
            }
        } catch (error) {
            console.error("Failed to toggle responsibility", error);
            toast.error("Failed to update/resolve conversation");
        } finally {
            setIsToggling(false);
        }
    }

    async function handleLostConfirm(reason: string) {
        if (!selectedConversation) return;

        setIsLostModalOpen(false);
        setIsToggling(true);

        try {
            const toastId = toast.loading("Marking as Lost...");
            const { updateLead } = await import('@/actions/crm/update-lead');
            const leadId = selectedConversation.leadId;

            if (leadId) {
                // Update status AND reason
                const result = await updateLead(leadId, {
                    status: 'Lost',
                    lost_reason: reason
                });

                if (!result.success) throw new Error(result.error);

                // Toggle responsibility
                await toggleResponsibility(selectedConversation.id, selectedConversation.quem_atende);

                toast.success("Lead moved to Lost in CRM", { id: toastId });
                setRefreshTrigger(prev => prev + 1);
            }
        } catch (error) {
            console.error("Failed to mark as lost", error);
            toast.error("Failed to update lead");
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
            } else {
                // Force a manual refresh to ensure UI is updated even if Realtime drops
                setRefreshTrigger(prev => prev + 1);
                silentReloadMessages();
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
                const leadId = selectedConversation.leadId;
                if (!leadId) throw new Error("Invalid Lead ID");

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
    const [showDiagnostics, setShowDiagnostics] = useState(false);

    // Show diagnostics on mount if there's an error
    useEffect(() => {
        const timer = setTimeout(() => {
            // Check if we have connection issues
            if (crmSettings?.empresa_id && conversations.length === 0 && !isLoading) {
                console.log('[OmnichannelInbox] Potential connection issue detected');
            }
        }, 5000);
        return () => clearTimeout(timer);
    }, [crmSettings?.empresa_id, conversations.length, isLoading]);

    return (
        <div className="flex h-full w-full bg-[#111] overflow-hidden relative">
            {showDiagnostics && crmSettings?.empresa_id && (
                <div className="absolute inset-0 z-50">
                    <RealtimeDiagnostics empresaId={crmSettings.empresa_id} />
                    <button
                        onClick={() => setShowDiagnostics(false)}
                        className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg"
                    >
                        Close
                    </button>
                </div>
            )}

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
                accessibleInboxes={(() => {
                    // If user is admin and no accessibleInboxes provided, use messagingUsers
                    const inboxes = viewerProfile?.role === 'admin' && accessibleInboxes.length === 0
                        ? messagingUsers.map(u => ({ id: u.id, name: u.name, avatar: u.avatar_url, type: 'user' }))
                        : accessibleInboxes;
                    console.log("[OmnichannelInbox] AccessibleInboxes:", {
                        isAdmin: viewerProfile?.role === 'admin',
                        accessibleInboxesLength: accessibleInboxes.length,
                        messagingUsersLength: messagingUsers.length,
                        finalInboxes: inboxes.length,
                        inboxNames: inboxes.map(i => i.name)
                    });
                    return inboxes;
                })()}
                // @ts-ignore
                onInboxChange={(val) => {
                    onInboxChange?.(val);
                    setSearchQuery("");
                }}
                instanceAvatar={instanceAvatar}
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
                onToggleQuemAtende={handleToggleQuemAtende}
                isTogglingQuemAtende={isTogglingQuemAtende}
                isAgentInbox={!!AGENTS.find(a => a.id === targetUserId)}
                agentAvatar={instanceAvatar || targetUser?.avatar || targetUser?.avatar_url}
                agentName={targetUser?.name}
                instanceAvatar={instanceAvatar}
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

            <LostLeadModal
                isOpen={isLostModalOpen}
                onClose={() => setIsLostModalOpen(false)}
                onConfirm={handleLostConfirm}
                reasons={crmSettings?.lost_reasons || []}
            />
        </div>
    );
}
