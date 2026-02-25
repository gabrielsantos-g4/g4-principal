'use server';

import { createClient, createAdminClient } from "@/lib/supabase";
import { getEmpresaId } from "@/lib/get-empresa-id";
import { AGENTS } from "@/lib/agents";
import { unstable_noStore as noStore } from 'next/cache';

export async function getConversations(targetUserId?: string) {
    noStore();
    const empresaId = await getEmpresaId();
    console.log("[getConversations] empresaId:", empresaId, "targetUserId:", targetUserId);
    if (!empresaId) return [];

    const supabaseAdmin = await createAdminClient();

    let responsibleUserId: string | undefined;
    let isAgent = false;

    // 1. Determine context
    if (targetUserId) {
        const agent = AGENTS.find(a => a.id === targetUserId);
        if (agent) {
            isAgent = true; // Agent: sees only unassigned conversations (responsible_id IS NULL)
        } else {
            responsibleUserId = targetUserId; // Any human (including admin): filter by UUID
        }
    } else {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            responsibleUserId = user.id; // Default: filter by own UUID
        }
    }

    // 2. Build query
    const selectFields = `
        id,
        contact_id,
        instance_id,
        responsible_id,
        created_at,
        updated_at,
        main_crm!camp_conversas_contact_id_fkey (
            id,
            name,
            phone,
            email,
            company,
            role,
            linkedin,
            website,
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
        .select(selectFields)
        .eq('empresa_id', empresaId)
        .order('updated_at', { ascending: false });

    if (isAgent) {
        query = query.is('responsible_id', null);
    } else if (responsibleUserId) {
        query = query.eq('responsible_id', responsibleUserId);
    } else {
        return [];
    }

    const { data: conversations, error } = await query;

    if (error) {
        console.error("Error fetching inbox conversations:", error);
        return [];
    }

    console.log("[getConversations] Found conversations:", conversations?.length || 0);

    if (!conversations) return [];

    // Helper to fetch last message
    const fetchLastMessage = async (conversationId: string) => {
        const { data: lastMsg } = await supabaseAdmin
            .from('camp_mensagens_n')
            .select('body, created_at, status, media_url')
            .eq('conversa_id', conversationId)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();
        return lastMsg;
    };

    // 3. Transform to Conversation objects
    const payload = await Promise.all(conversations.map(async (conv: any) => {
        const lead = conv.main_crm;
        if (!lead) return null;

        const rawChannel = lead.conversation_channel?.toLowerCase() || 'whatsapp';
        let channel = rawChannel;
        if (channel === 'webchat') channel = 'web';
        if (channel === 'phone') channel = 'sms';

        let lastMessage = "New conversation";
        let lastMessageAt = conv.updated_at || "";

        const lastMsg = await fetchLastMessage(conv.id);
        const messages = [];

        if (lastMsg) {
            lastMessage = lastMsg.body || (lastMsg.media_url ? '[Media]' : 'Message');
            lastMessageAt = lastMsg.created_at || conv.updated_at || "";
            messages.push({
                id: `msg-${conv.id}-last`,
                content: lastMessage,
                senderId: 'contact',
                timestamp: lastMessageAt,
                status: lastMsg.status || 'read',
                type: 'text'
            });
        } else if (Array.isArray(lead.history_log) && lead.history_log.length > 0) {
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

        // Clean phone: strip JID suffixes like @lid, @s.whatsapp.net, etc.
        const cleanPhone = (lead.phone || '').replace(/@.*$/, '').trim();
        const cleanJid = (lead.ctt_jid || '').replace(/@.*$/, '').trim();

        return {
            id: conv.id,
            leadId: lead.id,
            channel: channel,
            contact: {
                id: `c-${lead.id}`,
                name: (lead.name && lead.name.trim() !== "")
                    ? lead.name
                    : cleanPhone
                        ? cleanPhone
                        : cleanJid
                            ? cleanJid
                            : "Name not yet identified",
                avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(lead.name || 'U')}&background=random`,
                company: lead.company || "",
                role: lead.role || "",
                email: lead.email || "",
                phone: lead.phone || "",
                tags: []
            },
            linkedin: lead.linkedin || "",
            website: lead.website || "",
            lastMessage,
            lastMessageAt,
            unreadCount: lead.is_read_by_responsible ? 0 : 1,
            messages,
            status: lead.status || "New",
            nextStep: lead.next_step || { date: "Pending", progress: 0, total: 6 },
            amount: lead.amount?.toString() || "0",
            product: lead.product || "[]",
            qualification_status: lead.qualification_status?.toLowerCase() || "pending",
            source: lead.source || "",
            history: Array.isArray(lead.history_log) ? lead.history_log : [],
            custom: lead.custom_field || "",
            quem_atende: lead.quem_atende,
            responsibleId: conv.responsible_id || null
        };
    }));

    return payload.filter(Boolean);
}
