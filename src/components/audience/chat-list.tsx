'use client'

import { AudienceChat, createChat, deleteChat } from "@/actions/audience-actions"
import { Plus, Trash2, MessageSquare } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { useState, useTransition } from "react"

interface ChatListProps {
    chats: AudienceChat[]
}

export function ChatList({ chats }: ChatListProps) {
    const router = useRouter()
    const searchParams = useSearchParams()
    const activeChatId = searchParams.get('chatId')

    const [isCreateOpen, setIsCreateOpen] = useState(false)
    const [isDeleteOpen, setIsDeleteOpen] = useState(false)
    const [chatToDelete, setChatToDelete] = useState<string | null>(null)
    const [newChatName, setNewChatName] = useState("")
    const [isPending, startTransition] = useTransition()

    const handleCreate = () => {
        if (!newChatName.trim()) return

        startTransition(async () => {
            const res = await createChat(newChatName)
            if (res.success && res.chat) {
                setIsCreateOpen(false)
                setNewChatName("")
                router.push(`?chatId=${res.chat.id}`)
                router.refresh()
            } else {
                alert("Failed to create chat")
            }
        })
    }

    const handleDelete = () => {
        if (!chatToDelete) return

        startTransition(async () => {
            const res = await deleteChat(chatToDelete)
            if (res.success) {
                setIsDeleteOpen(false)
                setChatToDelete(null)
                if (activeChatId === chatToDelete) {
                    router.push('?')
                }
                router.refresh()
            } else {
                alert("Failed to delete chat")
            }
        })
    }

    return (
        <div className="w-[300px] flex flex-col h-full border-r border-white/10 bg-black/40">
            {/* Header / New Chat */}
            <div className="p-4 border-b border-white/10">
                <button
                    onClick={() => setIsCreateOpen(true)}
                    className="w-full flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-white p-3 rounded-lg border border-white/10 transition-colors"
                >
                    <Plus size={18} />
                    <span className="text-sm font-medium">New Audience</span>
                </button>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
                {chats.length === 0 ? (
                    <div className="text-center text-gray-500 text-xs py-8">
                        No chats yet.
                    </div>
                ) : (
                    chats.map(chat => (
                        <div
                            key={chat.id}
                            className={`group flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${activeChatId === chat.id
                                ? 'bg-[#1C73E8]/10 border border-[#1C73E8]/20'
                                : 'hover:bg-white/5 border border-transparent'
                                }`}
                            onClick={() => router.push(`?chatId=${chat.id}`)}
                        >
                            <div className="flex items-center gap-3 overflow-hidden">
                                <MessageSquare size={16} className={activeChatId === chat.id ? 'text-[#1C73E8]' : 'text-gray-500'} />
                                <span className={`text-sm truncate ${activeChatId === chat.id ? 'text-white font-medium' : 'text-gray-300'}`}>
                                    {chat.title || 'Untitled Chat'}
                                </span>
                            </div>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation()
                                    setChatToDelete(chat.id)
                                    setIsDeleteOpen(true)
                                }}
                                className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-500/20 rounded text-gray-500 hover:text-red-400 transition-all"
                            >
                                <Trash2 size={14} />
                            </button>
                        </div>
                    ))
                )}
            </div>

            {/* Create Modal */}
            {isCreateOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
                    <div className="bg-[#0A0A0A] border border-white/10 rounded-xl p-6 w-[400px] animate-in fade-in zoom-in-95 duration-200">
                        <h3 className="text-lg font-bold text-white mb-4">Create New Chat</h3>
                        <input
                            autoFocus
                            type="text"
                            value={newChatName}
                            onChange={(e) => setNewChatName(e.target.value)}
                            placeholder="Chat Name (e.g., HR Pain Points)"
                            className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white outline-none focus:border-[#1C73E8] mb-6"
                            onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                        />
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setIsCreateOpen(false)}
                                className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleCreate}
                                disabled={isPending || !newChatName.trim()}
                                className="px-4 py-2 bg-[#1C73E8] hover:bg-[#1557b0] text-white rounded-lg text-sm font-bold disabled:opacity-50 transition-colors"
                            >
                                {isPending ? 'Saving...' : 'Save'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Modal */}
            {isDeleteOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
                    <div className="bg-[#0A0A0A] border border-white/10 rounded-xl p-6 w-[400px] animate-in fade-in zoom-in-95 duration-200">
                        <h3 className="text-lg font-bold text-white mb-2">Delete Chat?</h3>
                        <p className="text-gray-400 text-sm mb-6">
                            Are you sure you want to delete this conversation? This action cannot be undone.
                        </p>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setIsDeleteOpen(false)}
                                className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDelete}
                                disabled={isPending}
                                className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-lg text-sm font-bold disabled:opacity-50 transition-colors"
                            >
                                {isPending ? 'Deleting...' : 'Delete Forever'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
