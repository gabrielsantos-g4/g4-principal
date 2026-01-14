"use client"

import { Conversation, Message, sendMessage } from "@/actions/messenger/conversations-actions"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { MoreVertical, Paperclip, SendHorizontal, Smile } from "lucide-react"
import { useEffect, useRef, useState, useTransition } from "react"
import { ChatBubble } from "./chat-bubble"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase-client"

interface ChatWindowProps {
    conversation: Conversation
    initialMessages: Message[]
}

export function ChatWindow({ conversation, initialMessages }: ChatWindowProps) {
    const [messages, setMessages] = useState<Message[]>(initialMessages)
    const [newMessage, setNewMessage] = useState("")
    const [isPending, startTransition] = useTransition()
    const scrollRef = useRef<HTMLDivElement>(null)
    const supabase = createClient()

    // Realtime subscription
    useEffect(() => {
        const channel = supabase
            .channel(`chat:${conversation.id}`)
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'camp_mensagens',
                filter: `conversa_id=eq.${conversation.id}`
            }, (payload) => {
                const newMessage = payload.new as Message
                // Avoid duplicating if we already have it (e.g. from optimistic update that resolved)
                setMessages(prev => {
                    if (prev.some(m => m.id === newMessage.id)) return prev
                    return [...prev, newMessage]
                })
            })
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [conversation.id, supabase])

    // Scroll to bottom on load and new message
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight
        }
    }, [messages])

    // Update messages when initialMessages change (e.g. switching conv)
    useEffect(() => {
        setMessages(initialMessages)
    }, [initialMessages])

    const handleSend = async (e?: React.FormEvent) => {
        e?.preventDefault()
        if (!newMessage.trim() || isPending) return

        const tempId = crypto.randomUUID()
        const messageBody = newMessage.trim()

        // Optimistic update
        const optimisticMessage: Message = {
            id: tempId,
            conversa_id: conversation.id,
            body: messageBody,
            direction: 'OUT',
            media_type: 'text',
            media_url: null,
            created_at: new Date().toISOString(),
            status: 'pending'
        }

        setMessages(prev => [...prev, optimisticMessage])
        setNewMessage("")

        startTransition(async () => {
            const result = await sendMessage(conversation.id, messageBody)

            if (result.error) {
                toast.error(result.error)
                // Remove optimistic message on error
                setMessages(prev => prev.filter(m => m.id !== tempId))
            } else if (result.message) {
                // Replace optimistic message with real one
                setMessages(prev => prev.map(m => m.id === tempId ? (result.message as Message) : m))
            }
        })
    }

    return (
        <div className="flex flex-col h-full bg-[#0b141a] w-full relative">
            {/* Background Pattern */}
            <div
                className="absolute inset-0 opacity-[0.06] pointer-events-none"
                style={{
                    backgroundImage: "url('https://static.whatsapp.net/rsrc.php/v3/yl/r/gi_DckOUM5a.png')",
                    backgroundRepeat: 'repeat',
                }}
            />

            {/* Header */}
            <div className="h-16 bg-[#202c33] flex items-center justify-between px-4 py-2 border-b border-[#2f3b43] z-10 shrink-0">
                <div className="flex items-center gap-3 cursor-pointer">
                    <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-[#6a7175] text-[#d1d7db]">
                            {conversation.contact_name.substring(0, 1).toUpperCase()}
                        </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col justify-center">
                        <h3 className="text-[#e9edef] font-medium text-base leading-tight">
                            {conversation.contact_name}
                        </h3>
                        {/* <span className="text-xs text-[#8696a0]">visto por último hoje às 12:00</span> */}
                        <span className="text-xs text-[#8696a0]">{conversation.contact_phone}</span>
                    </div>
                </div>
                <div className="flex items-center gap-4 text-[#aebac1]">
                    {/* <Search className="w-5 h-5 cursor-pointer" /> */}
                    <MoreVertical className="w-5 h-5 cursor-pointer" />
                </div>
            </div>

            {/* Messages Area */}
            <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto custom-scrollbar p-6 z-10 space-y-2 relative"
            >
                {messages.map((msg, index) => {
                    // Check if previous message was from same sender
                    // const isSameSenderAsPrevious = index > 0 && messages[index - 1].direction === msg.direction

                    return (
                        <ChatBubble
                            key={msg.id}
                            message={msg}
                            isMe={msg.direction === 'OUT'}
                        />
                    )
                })}
            </div>

            {/* Footer / Input Area */}
            <div className="bg-[#202c33] p-3 flex items-center gap-2 z-10 shrink-0 min-h-[62px]">
                <Button variant="ghost" size="icon" className="text-[#8696a0] hover:bg-transparent hover:text-[#aebac1]">
                    <Smile className="w-6 h-6" />
                </Button>
                <Button variant="ghost" size="icon" className="text-[#8696a0] hover:bg-transparent hover:text-[#aebac1]">
                    <Paperclip className="w-6 h-6" />
                </Button>

                <form
                    className="flex-1 mx-2"
                    onSubmit={handleSend}
                >
                    <Input
                        className="w-full bg-[#2a3942] border-none text-[#d1d7db] placeholder:text-[#8696a0] rounded-lg px-4 py-2 focus-visible:ring-0 focus-visible:ring-offset-0"
                        placeholder="Digite uma mensagem"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                    />
                </form>

                {newMessage.trim() ? (
                    <Button
                        variant="ghost"
                        size="icon"
                        className="text-[#8696a0] hover:bg-transparent hover:text-[#aebac1]"
                        onClick={() => handleSend()}
                    >
                        <SendHorizontal className="w-6 h-6" />
                    </Button>
                ) : (
                    // Mic button placeholder if empty
                    null
                )}
            </div>
        </div>
    )
}
