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

    // ...

    // 1. Determine the "Responsible" name to filter by
    if (targetUserId) {
        // Check if it's an Agent
        const agent = AGENTS.find(a => a.id === targetUserId);

        if (agent) {
            responsibleName = agent.name;
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

    // If no responsible name found, and we are an admin (deduced by context or lack of specific target), we might want ALL.
    // However, the original logic returned [] if !responsibleName.
    // Let's modify: if targetUserId is explicitly provided but not found -> return [].
    // If targetUserId is NOT provided, and current user is Admin -> Return ALL? 
    // Or simpler: If targetUserId is provided, filter by it. If not, check if user is admin to return all, or just return own.

    // For now, let's stick to the requested fix: "Admin view not working". 
    // If I am admin, I might want to see EVERYTHING if I haven't selected a specific inbox.
    // But `OmnichannelInbox` passes `targetUserId`.
    // If `targetUserId` is missing, it falls back to current user.

    // Let's check if the user is admin to bypass "responsible" filter if needed?
    // Actually, if `targetUserId` is passed, we MUST filter by it (it's the "Inbox of X" view).
    // If `targetUserId` is undefined, it usually means "My Inbox".

    // The issue might be that for Admin, `responsibleName` might be null if they don't have a profile with a name that matches `responsible` column?
    // OR, admins expect to see ALL conversations when they first load?

    // Let's verify what `responsibleName` resolves to.

    let query = supabaseAdmin
        .from('main_crm')
        .select('*')
        .eq('empresa_id', empresaId)
        .order('created_at', { ascending: false });

    if (responsibleName) {
        query = query.ilike('responsible', responsibleName);
    } else {
        // If we couldn't find a responsible name (e.g. admin without a matching profile name in leads), 
        // we previously returned empty. 
        // IF the user is admin, maybe we should return ALL?
        // But `getConversations` runs on server. We can check role.
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        let isAdmin = false;
        if (user) {
            const { data: profile } = await supabaseAdmin.from('main_profiles').select('role').eq('id', user.id).single();
            if (profile?.role === 'admin') isAdmin = true;
        }

        if (!isAdmin) {
            return [];
        }
        // If admin and no responsible identified (and no specific target), fetching ALL.
    }

    const { data: leads, error } = await query;

    if (error) {
        console.error("Error fetching inbox leads:", error);
        return [];
    }

    if (!leads) return [];

    // DEBUG: Log first few leads to check is_read_by_responsible
    if (leads.length > 0) {
        console.log(`[getConversations] Fetched ${leads.length} leads for ${responsibleName}`);
        leads.slice(0, 3).forEach(l => {
            console.log(`- Lead: ${l.name} | is_read_by_responsible: ${l.is_read_by_responsible} | mapped unread: ${l.is_read_by_responsible ? 0 : 1}`);
        });
    }

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
            unreadCount: lead.is_read_by_responsible ? 0 : 1, // 0 if read, 1 if unread
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
            quem_atende: lead.quem_atende // Pass this new field
        };
    });
}
