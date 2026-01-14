"use client"

import { Conversation, Message, getMessages } from "@/actions/messenger/conversations-actions"
import { useState, useTransition } from "react"
import { ConversationList } from "./conversation-list"
import { ChatWindow } from "./chat-window"
import { Loader2 } from "lucide-react"

interface ChatLayoutProps {
    conversations: Conversation[]
}

export function ChatLayout({ conversations }: ChatLayoutProps) {
    const [selectedId, setSelectedId] = useState<string | null>(null)
    const [messages, setMessages] = useState<Message[]>([])
    const [isLoadingMessages, startTransition] = useTransition()

    const selectedConversation = conversations.find(c => c.id === selectedId)

    const handleSelectConversation = (id: string) => {
        setSelectedId(id)
        startTransition(async () => {
            const msgs = await getMessages(id)
            setMessages(msgs)
        })
    }

    return (
        <div className="flex h-[calc(100vh-4rem)] w-full overflow-hidden bg-[#0b141a]">
            {/* Sidebar List */}
            <ConversationList
                conversations={conversations}
                selectedId={selectedId}
                onSelect={handleSelectConversation}
            />

            {/* Main Window */}
            <div className="flex-1 flex flex-col h-full border-l border-[#2f3b43] relative">
                {selectedConversation ? (
                    isLoadingMessages ? (
                        <div className="flex h-full w-full items-center justify-center bg-[#0b141a] border-l border-[#2f3b43]">
                            <Loader2 className="h-8 w-8 animate-spin text-[#00a884]" />
                        </div>
                    ) : (
                        <ChatWindow
                            conversation={selectedConversation}
                            initialMessages={messages}
                        />
                    )
                ) : (
                    <div className="flex flex-col items-center justify-center h-full bg-[#222e35] text-[#e9edef] border-b-[6px] border-[#00a884]">
                        <div className="max-w-[560px] text-center space-y-6">
                            <h1 className="text-3xl font-light text-[#e9edef]">WhatsApp Web</h1>
                            <p className="text-[#8696a0] text-sm">
                                Envie e receba mensagens sem precisar manter seu celular conectado. <br />
                                Use o WhatsApp em até 4 aparelhos e 1 celular ao mesmo tempo.
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
