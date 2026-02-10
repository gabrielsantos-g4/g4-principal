'use server';

import { createClient, createAdminClient } from "@/lib/supabase";
import { getEmpresaId } from "@/lib/get-empresa-id";

export async function getConversations(targetUserId?: string) {
    const empresaId = await getEmpresaId();
    if (!empresaId) return [];

    const supabaseAdmin = await createAdminClient();

    let responsibleName: string | undefined;

    // 1. Determine the "Responsible" name to filter by
    if (targetUserId) {
        // Special Case: Agent IDs (start with 'customer-' typically, or just check known agents)
        // If the ID matches a known agent alias, we skip profile lookup and use the name directly.
        if (targetUserId === 'customer-jess' || targetUserId === 'jess') {
            responsibleName = 'Jess';
        } else {
            const { data: profile } = await supabaseAdmin
                .from('main_profiles')
                .select('name')
                .eq('id', targetUserId)
                .single();
            if (profile) responsibleName = profile.name;
        }
    } else {
        // Fallback to current user if no target provided (e.g. "My Inbox")
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            const { data: profile } = await supabaseAdmin
                .from('main_profiles')
                .select('name')
                .eq('id', user.id)
                .single();
            if (profile) responsibleName = profile.name;
        }
    }

    if (!responsibleName) {
        return [];
    }

    const { data: leads, error } = await supabaseAdmin
        .from('main_crm')
        .select('*')
        .eq('empresa_id', empresaId)
        .eq('responsible', responsibleName)
        .order('created_at', { ascending: false });

    if (error) {
        console.error("Error fetching inbox leads:", error);
        return [];
    }

    if (!leads) return [];

    // 3. Transform to Conversation objects
    return leads.map(lead => {
        // Determine channel
        const rawChannel = lead.conversation_channel?.toLowerCase() || 'whatsapp';
        // Map to valid ChannelType: "whatsapp" | "linkedin" | "instagram" | "facebook" | "email" | "sms" | "web" | "phone"
        // Note: "Phone" was just added to CRM, but Inbox might need update to support it in ChannelType if strict.
        let channel = rawChannel;
        // Inbox types: "whatsapp" | "linkedin" | "instagram" | "facebook" | "email" | "sms" | "web"
        // "webchat" -> "web"
        if (channel === 'webchat') channel = 'web';
        if (channel === 'phone') channel = 'sms'; // Temporary fallback or need to add 'phone' to inbox types. Let's use 'sms' or 'whatsapp' as fallback/proxy for now if type is strict, but better to add 'phone' to type.

        // Construct messages from history or default
        const messages = [];
        let lastMessage = "New lead assigned";
        let lastMessageAt = lead.created_at ? new Date(lead.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "";

        if (Array.isArray(lead.history_log) && lead.history_log.length > 0) {
            // Get last history item
            const lastLog = lead.history_log[lead.history_log.length - 1];
            lastMessage = lastLog.message || "Interacted";
            if (lastLog.date) {
                lastMessageAt = new Date(lastLog.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            }

            // Add as a pseudo-message
            messages.push({
                id: `msg-${lead.id}-${lastLog.id || 'last'}`,
                content: lastMessage,
                senderId: 'me', // Assume history is mostly me/system
                timestamp: lastMessageAt,
                status: 'read',
                type: 'text'
            });
        } else {
            messages.push({
                id: `msg-${lead.id}-welcome`,
                content: `Start conversation with ${lead.name} on ${channel}`,
                senderId: 'system',
                timestamp: lastMessageAt,
                status: 'sent',
                type: 'text'
            });
        }

        return {
            id: lead.id.toString(),
            channel: channel,
            contact: {
                id: `c-${lead.id}`,
                name: lead.name || "Unknown",
                avatar: lead.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(lead.name || 'U')}&background=random`,
                company: lead.company || "",
                role: lead.role || "",
                email: lead.email || "",
                phone: lead.phone || "",
                tags: []
            },
            lastMessage: lastMessage,
            lastMessageAt: lastMessageAt,
            unreadCount: 0, // Default to read
            messages: messages,

            // CRM Fields
            status: lead.status || "New",
            nextStep: lead.next_step || { date: "Pending", progress: 0, total: 6 },
            amount: lead.amount?.toString() || "0",
            product: lead.product || "[]",
            qualification_status: lead.qualification_status?.toLowerCase() || "pending",
            source: lead.source || "",
            history: Array.isArray(lead.history_log) ? lead.history_log : [],
            custom: lead.custom_field || ""
        };
    });
}
