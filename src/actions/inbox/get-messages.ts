'use server';

import { createAdminClient } from "@/lib/supabase";
import { getEmpresaId } from "@/lib/get-empresa-id";
import { unstable_noStore as noStore } from 'next/cache';

export async function getChatMessages(leadId: string | number) {
    noStore(); // Prevent Next.js from caching this response
    const empresaId = await getEmpresaId();
    if (!empresaId) return [];

    const supabaseAdmin = await createAdminClient();

    // 1. Get Lead to find JID
    const { data: lead, error: leadError } = await supabaseAdmin
        .from('main_crm')
        .select('ctt_jid, phone')
        .eq('id', leadId)
        .eq('empresa_id', empresaId)
        .single();

    if (leadError || !lead) {
        console.error("Error fetching lead or lead not found:", leadError);
        return [];
    }

    const jid = lead.ctt_jid || lead.phone;
    if (!jid) return [];

    // 2. Find Conversation in camp_conversas
    const { data: conversa, error: conversaError } = await supabaseAdmin
        .from('camp_conversas')
        .select('id')
        .eq('remote_jid', jid)
        .eq('empresa_id', empresaId)
        .single();

    if (conversaError || !conversa) {
        // Conversation might not exist yet in camp_conversas if it's new from CRM?
        // Or maybe just no messages.
        return [];
    }

    // 3. Fetch Messages from camp_mensagens
    const { data: messages, error: messagesError } = await supabaseAdmin
        .from('camp_mensagens')
        .select('*')
        .eq('conversa_id', conversa.id)
        .eq('empresa_id', empresaId)
        .order('created_at', { ascending: true });

    if (messagesError) {
        console.error("Error fetching messages:", messagesError);
        return [];
    }

    // 4. Transform to UI Message format
    return messages?.map(msg => ({
        id: msg.id,
        content: msg.body || (msg.media_url ? '[Media]' : ''),
        senderId: (msg.direction === 'outbound' || msg.direction === 'OUT') ? 'me' : 'contact',
        timestamp: new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: msg.status || 'sent',
        type: msg.media_type === 'image' || msg.media_type === 'video' || msg.media_type === 'audio' ? msg.media_type : 'text',
        mediaUrl: msg.media_url
    })) || [];
}
