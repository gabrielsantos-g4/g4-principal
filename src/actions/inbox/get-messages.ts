'use server';

import { createAdminClient } from "@/lib/supabase";
import { getEmpresaId } from "@/lib/get-empresa-id";
import { unstable_noStore as noStore } from 'next/cache';

export async function getChatMessages(conversationId: string) {
    noStore(); // Prevent Next.js from caching this response
    const empresaId = await getEmpresaId();
    if (!empresaId) return [];

    const supabaseAdmin = await createAdminClient();

    // Directly Fetch Messages from camp_mensagens using the provided conversationId
    // We assume conversationId is the valid UUID from camp_conversas
    const { data: messages, error: messagesError } = await supabaseAdmin
        .from('camp_mensagens')
        .select('*')
        .eq('conversa_id', conversationId)
        .eq('empresa_id', empresaId)
        .order('created_at', { ascending: true });

    if (messagesError) {
        console.error("Error fetching messages:", messagesError);
        return [];
    }

    // Transform to UI Message format
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
