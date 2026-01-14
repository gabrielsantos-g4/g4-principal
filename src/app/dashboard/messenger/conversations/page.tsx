import { getConversations } from "@/actions/messenger/conversations-actions"
import { ChatLayout } from "@/components/messenger/chat/chat-layout"

export default async function ConversationsPage() {
    const conversations = await getConversations()

    return (
        <div className="h-[calc(100vh-80px)] w-full flex-1 overflow-hidden">
            <ChatLayout conversations={conversations} />
        </div>
    )
}
