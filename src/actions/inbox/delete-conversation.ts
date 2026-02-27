"use server";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function deleteConversation(conversationId: string) {
    try {
        const cookieStore = await cookies();
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    get(name: string) {
                        return cookieStore.get(name)?.value;
                    },
                },
            }
        );

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return { success: false, message: "Unauthorized" };
        }

        // First, verify the conversation exists
        const { data: conversation, error: convError } = await supabase
            .from("camp_conversas")
            .select("id")
            .eq("id", conversationId)
            .single();

        if (convError || !conversation) {
            console.error("Conversation not found:", convError);
            return { success: false, message: "Conversation not found" };
        }

        // Delete all messages in the conversation
        const { error: msgErr } = await supabase
            .from("camp_mensagens_n")
            .delete()
            .eq("conversa_id", conversationId);

        if (msgErr) {
            console.error("Error deleting messages:", msgErr);
            // Non-fatal, proceed to delete conversation
        }

        // Finally delete the conversation itself
        const { error: delErr } = await supabase
            .from("camp_conversas")
            .delete()
            .eq("id", conversationId);

        if (delErr) {
            console.error("Error deleting conversation:", delErr);
            return { success: false, message: "Failed to delete conversation" };
        }

        return { success: true };
    } catch (error) {
        console.error("Failed to delete conversation:", error);
        return { success: false, message: "An unexpected error occurred" };
    }
}
