'use server';

import { createClient, createAdminClient } from "@/lib/supabase";
import { getEmpresaId } from "@/lib/get-empresa-id";
import { AGENTS } from "@/lib/agents";
import { unstable_noStore as noStore } from 'next/cache';

export async function getConversations(targetUserId?: string) {
    noStore(); // Prevent Next.js from caching this response
    const empresaId = await getEmpresaId();
    if (!empresaId) return [];

    const supabaseAdmin = await createAdminClient();

    let responsibleName: string | undefined;
    let isAdmin = false;

    // 1. Determine context: admin sees all, agent sees all, member sees own inbox
    if (targetUserId) {
        // Check if it's an AI Agent — agents see ALL conversations (they serve the whole company)
        const agent = AGENTS.find(a => a.id === targetUserId);
        if (agent) {
            // Agent inbox: show all conversations, no responsible filter needed
            isAdmin = true; // reuse admin path (no filter)
        } else {
            // Human member inbox: filter by their name
            const { data: profile } = await supabaseAdmin
                .from('main_profiles')
                .select('name')
                .eq('id', targetUserId)
                .single();
            if (profile) responsibleName = profile.name;
        }
    } else {
        // No target — check if current user is admin
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            const { data: profile } = await supabaseAdmin
                .from('main_profiles')
                .select('name, role')
                .eq('id', user.id)
                .single();
            if (profile?.role === 'admin') {
                isAdmin = true;
            } else if (profile) {
                responsibleName = profile.name;
            }
        }
    }

    // 2. Query camp_conversas filtered by empresa_id
    const leadSelect = `
            id,
            contact_id,
            instance_id,
            created_at,
            updated_at,
            main_crm!camp_conversas_contact_id_fkey (
                id,
                name,
                phone,
                email,
                company,
                role,
                status,
                next_step,
                amount,
                product,
                qualification_status,
                source,
                history_log,
                custom_field,
                quem_atende,
                conversation_channel,
                is_read_by_responsible,
                ctt_jid,
                responsible
            )
        `;

    const leadSelectInner = `
            id,
            contact_id,
            instance_id,
            created_at,
            updated_at,
            main_crm!camp_conversas_contact_id_fkey!inner (
                id,
                name,
                phone,
                email,
                company,
                role,
                status,
                next_step,
                amount,
                product,
                qualification_status,
                source,
                history_log,
                custom_field,
                quem_atende,
                conversation_channel,
                is_read_by_responsible,
                ctt_jid,
                responsible
            )
        `;

    let query = supabaseAdmin
        .from('camp_conversas')
        .select(leadSelect)
        .eq('empresa_id', empresaId)
        .order('updated_at', { ascending: false });

    if (responsibleName) {
        query = supabaseAdmin
            .from('camp_conversas')
            .select(leadSelectInner)
            .eq('empresa_id', empresaId)
            .ilike('main_crm.responsible', responsibleName)
            .order('updated_at', { ascending: false });
    } else if (!isAdmin) {
        // Not admin and no responsible name resolved — no access
        return [];
    }
    // If isAdmin and no responsibleName, query stays as the default (all conversations)

    const { data: conversations, error } = await query;

    if (error) {
        console.error("Error fetching inbox conversations:", error);
        return [];
    }

    if (!conversations) return [];


    // Helper to fetch last message for a conversation
    const fetchLastMessage = async (conversationId: string) => {
        const { data: lastMsg } = await supabaseAdmin
            .from('camp_mensagens')
            .select('body, created_at, status, media_url')
            .eq('conversa_id', conversationId)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();
        return lastMsg;
    };

    // 4. Transform to Conversation objects
    // We need to fetch last messages in parallel for efficiency
    const payload = await Promise.all(conversations.map(async (conv: any) => {
        const lead = conv.main_crm;

        if (!lead) return null; // Should not happen with inner join, but safe guard

        // Determine channel
        const rawChannel = lead.conversation_channel?.toLowerCase() || 'whatsapp';
        let channel = rawChannel;
        if (channel === 'webchat') channel = 'web';
        if (channel === 'phone') channel = 'sms';

        // Get Last Message
        let lastMessage = "New conversation";
        let lastMessageAt = conv.updated_at ? new Date(conv.updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "";

        // Try to fetch real last message from camp_mensagens
        const lastMsg = await fetchLastMessage(conv.id);

        const messages = [];

        if (lastMsg) {
            lastMessage = lastMsg.body || (lastMsg.media_url ? '[Media]' : 'Message');
            lastMessageAt = new Date(lastMsg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

            messages.push({
                id: `msg-${conv.id}-last`,
                content: lastMessage,
                senderId: 'contact', // simplified
                timestamp: lastMessageAt,
                status: lastMsg.status || 'read',
                type: 'text'
            });
        } else if (Array.isArray(lead.history_log) && lead.history_log.length > 0) {
            // Fallback to history log if no chat messages
            const lastLog = lead.history_log[lead.history_log.length - 1];
            lastMessage = lastLog.message || "Interacted";
            if (lastLog.date) {
                lastMessageAt = new Date(lastLog.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            }
            messages.push({
                id: `msg-${lead.id}-${lastLog.id || 'last'}`,
                content: lastMessage,
                senderId: 'me',
                timestamp: lastMessageAt,
                status: 'read',
                type: 'text'
            });
        }


        return {
            id: conv.id, // This is now the camp_conversas ID (UUID)
            leadId: lead.id, // CRM Lead ID
            channel: channel,
            contact: {
                id: `c-${lead.id}`,
                name: (lead.name && lead.name.trim() !== "")
                    ? lead.name
                    : (lead.phone && lead.phone.trim() !== "")
                        ? lead.phone
                        : (lead.ctt_jid ? lead.ctt_jid.split('@')[0] : "Desconhecido"),
                avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(lead.name || 'U')}&background=random`,
                company: lead.company || "",
                role: lead.role || "",
                email: lead.email || "",
                phone: lead.phone || "",
                tags: []
            },
            lastMessage: lastMessage,
            lastMessageAt: lastMessageAt,
            unreadCount: lead.is_read_by_responsible ? 0 : 1,
            messages: messages,

            // CRM Fields
            status: lead.status || "New",
            nextStep: lead.next_step || { date: "Pending", progress: 0, total: 6 },
            amount: lead.amount?.toString() || "0",
            product: lead.product || "[]",
            qualification_status: lead.qualification_status?.toLowerCase() || "pending",
            source: lead.source || "",
            history: Array.isArray(lead.history_log) ? lead.history_log : [],
            custom: lead.custom_field || "",
            quem_atende: lead.quem_atende
        };
    }));

    return payload.filter(Boolean);
}
