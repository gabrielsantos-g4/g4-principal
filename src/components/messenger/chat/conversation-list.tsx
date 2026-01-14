"use client"

import { Conversation } from "@/actions/messenger/conversations-actions"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { useState } from "react"

interface ConversationListProps {
    conversations: Conversation[]
    selectedId: string | null
    onSelect: (id: string) => void
}

export function ConversationList({ conversations, selectedId, onSelect }: ConversationListProps) {
    const [searchTerm, setSearchTerm] = useState("")

    const filteredConversations = conversations.filter(conv =>
        conv.contact_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        conv.contact_phone.includes(searchTerm)
    )

    return (
        <div className="flex flex-col h-full border-r border-[#2f3b43] bg-[#111b21] w-[350px]">
            {/* Header */}
            <div className="h-16 bg-[#202c33] flex items-center justify-between px-4 border-b border-[#2f3b43]">
                <Avatar className="h-10 w-10 cursor-pointer">
                    <AvatarImage src="/placeholder-user.jpg" />
                    <AvatarFallback className="bg-[#6a7175] text-[#d1d7db]">EU</AvatarFallback>
                </Avatar>
                <div className="flex gap-4 text-[#aebac1]">
                    {/* Add icons here if needed like Status, New Chat etc */}
                </div>
            </div>

            {/* Search */}
            <div className="p-2 bg-[#111b21]">
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-4 w-4 text-[#aebac1]" />
                    </div>
                    <Input
                        className="pl-12 bg-[#202c33] border-none text-[#d1d7db] placeholder:text-[#aebac1] h-9 focus-visible:ring-0 rounded-lg"
                        placeholder="Pesquisar ou começar uma nova conversa"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto custom-scrollbar">
                {filteredConversations.length === 0 ? (
                    <div className="text-center text-[#aebac1] p-4 text-sm">
                        Nenhuma conversa encontrada.
                    </div>
                ) : (
                    filteredConversations.map((conv) => (
                        <div
                            key={conv.id}
                            onClick={() => onSelect(conv.id)}
                            className={cn(
                                "flex items-center gap-3 p-3 px-4 cursor-pointer hover:bg-[#202c33] transition-colors border-b border-[#2f3b43] last:border-0",
                                selectedId === conv.id ? "bg-[#2a3942]" : ""
                            )}
                        >
                            <Avatar className="h-12 w-12">
                                <AvatarFallback className="bg-[#6a7175] text-[#d1d7db]">
                                    {conv.contact_name.substring(0, 1).toUpperCase()}
                                </AvatarFallback>
                            </Avatar>

                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-baseline mb-0.5">
                                    <h3 className="text-[#e9edef] font-normal truncate  text-[16px]">
                                        {conv.contact_name}
                                    </h3>
                                    {conv.last_message_at && (
                                        <span className="text-xs text-[#8696a0] shrink-0 ml-2">
                                            {format(new Date(conv.last_message_at), "HH:mm", { locale: ptBR })}
                                        </span>
                                    )}
                                </div>

                                <div className="flex justify-between items-center">
                                    <p className="text-sm text-[#8696a0] truncate">
                                        {conv.last_message || "Nova conversa"}
                                    </p>
                                    {conv.unread_count > 0 && (
                                        <span className="bg-[#00a884] text-[#111b21] text-[10px] font-bold h-5 min-w-[20px] rounded-full flex items-center justify-center px-1 ml-2">
                                            {conv.unread_count}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}
