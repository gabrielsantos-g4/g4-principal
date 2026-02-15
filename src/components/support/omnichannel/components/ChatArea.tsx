
import { useRef, useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreVertical, Phone, Paperclip, Mic, Smile, Send, Check, CheckCheck, Clock, Download, FileAudio, Play, Pause } from "lucide-react";
import { cn } from "@/lib/utils";
import { Conversation } from "./ConversationList"; // Assuming type sharing

interface ChatAreaProps {
    selectedConversation: Conversation | undefined;
    messages: any[];
    isMessagesLoading: boolean;
    currentUserId: string | null;
    isSending: boolean;
    onSendMessage: (text: string) => void;
    onToggleResponsibility: (status?: string) => void;
    isToggling: boolean;
    onUpload?: (file: File) => void; // Placeholder for future
}

const CHANNEL_COLORS: Record<string, string> = {
    whatsapp: "text-[#25D366]",
    linkedin: "text-[#0A66C2]",
    instagram: "text-[#E4405F]",
    facebook: "text-[#1877F2]",
    email: "text-orange-500",
    sms: "text-purple-500",
    phone: "text-blue-500",
    web: "text-gray-400"
};

export function ChatArea({
    selectedConversation,
    messages,
    isMessagesLoading,
    currentUserId,
    isSending,
    onSendMessage,
    onToggleResponsibility,
    isToggling,
    onUpload
}: ChatAreaProps) {
    const scrollRef = useRef<HTMLDivElement>(null);
    const [messageInput, setMessageInput] = useState("");

    // Auto-scroll to bottom
    useEffect(() => {
        if (scrollRef.current) {
            const scrollContainer = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]');
            if (scrollContainer) {
                scrollContainer.scrollTop = scrollContainer.scrollHeight;
            }
        }
    }, [messages, selectedConversation]);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            if (messageInput.trim()) {
                onSendMessage(messageInput);
                setMessageInput("");
            }
        }
    };

    const handleSendClick = () => {
        if (messageInput.trim()) {
            onSendMessage(messageInput);
            setMessageInput("");
        }
    }

    if (!selectedConversation) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-500 bg-[#0f0f0f]">
                <p>Select a conversation to start chatting</p>
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col bg-[#0f0f0f] relative h-full overflow-hidden">
            {/* Chat Header */}
            <div className="h-16 border-b border-white/10 flex items-center justify-between px-6 bg-[#111]">
                <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9">
                        <AvatarImage src={selectedConversation.contact.avatar} />
                        <AvatarFallback>{selectedConversation.contact.name[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                        <h4 className="text-sm font-bold text-white flex items-center gap-2">
                            {selectedConversation.contact.name}
                        </h4>
                        <div className="text-xs text-gray-400 flex items-center gap-1">
                            Talking via <span className={cn("font-bold capitalize", CHANNEL_COLORS[selectedConversation.channel] || "text-white")}>
                                {selectedConversation.channel}
                            </span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <DropdownMenu>
                        {/* More options could go here */}
                    </DropdownMenu>

                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant="secondary"
                                size="sm"
                                disabled={isToggling}
                                className={cn(
                                    "ml-2 transition-all bg-white/10 text-gray-300 hover:bg-white/20"
                                )}
                            >
                                {isToggling ? (
                                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                ) : (
                                    "Resolve"
                                )}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-44 p-1.5 bg-[#1A1A1A] border-white/10" align="end">
                            <div className="flex flex-col gap-0.5">
                                <p className="text-[10px] text-gray-500 px-2 py-1 mb-0.5 font-medium uppercase tracking-wider">Resolve</p>

                                <button
                                    onClick={() => onToggleResponsibility('Won')}
                                    className="flex items-center gap-2 w-full text-left px-2 py-1.5 text-xs text-green-400 hover:bg-green-500/10 rounded transition-colors"
                                >
                                    <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                                    Move to Won
                                </button>

                                <button
                                    onClick={() => onToggleResponsibility('Lost')}
                                    className="flex items-center gap-2 w-full text-left px-2 py-1.5 text-xs text-red-400 hover:bg-red-500/10 rounded transition-colors"
                                >
                                    <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                                    Move to Lost
                                </button>

                                <div className="h-px bg-white/10 my-0.5" />

                                <button
                                    onClick={() => onToggleResponsibility()}
                                    className="flex items-center gap-2 w-full text-left px-2 py-1.5 text-xs text-gray-300 hover:bg-white/10 rounded transition-colors"
                                >
                                    <div className="w-1.5 h-1.5 rounded-full bg-gray-500" />
                                    Keep Status
                                </button>
                            </div>
                        </PopoverContent>
                    </Popover>
                </div>
            </div>

            {/* Messages Area */}
            <ScrollArea className="flex-1 px-4 py-6" ref={scrollRef}>
                <div className="space-y-6 max-w-3xl mx-auto">
                    {/* Date Separator (Mock) */}
                    <div className="flex justify-center">
                        <span className="bg-[#1f1f1f] text-gray-400 text-[10px] px-3 py-1 rounded-full uppercase tracking-wider font-medium border border-white/5">
                            Today
                        </span>
                    </div>

                    {isMessagesLoading ? (
                        <div className="text-center text-gray-300 text-sm mt-10">Loading messages...</div>
                    ) : messages.length === 0 ? (
                        <div className="text-center text-gray-500 text-sm mt-10">No messages yet.</div>
                    ) : (
                        messages.map((msg) => {
                            const isMe = msg.type === 'notes' ? true : msg.senderId === 'me' || msg.senderId === currentUserId; // simplified check
                            // Note: Original code had complex logic for 'notes' type messages style.
                            // For simplicity in refactor, handling basic text/media messages.
                            // If 'type' is missing in msg, duplicate default to text.

                            if (msg.type === 'notes') {
                                return (
                                    <div key={msg.id} className="flex justify-center my-4">
                                        <div className="bg-[#1C73E8]/10 border border-[#1C73E8]/20 text-[#1C73E8] text-xs px-4 py-2 rounded-lg flex items-center gap-2 max-w-[80%]">
                                            <span className="font-bold">Note:</span>
                                            {msg.content}
                                        </div>
                                    </div>
                                )
                            }

                            return (
                                <div
                                    key={msg.id}
                                    className={cn(
                                        "flex gap-3 max-w-[85%]", // Reduced max-width for better readability
                                        isMe ? "ml-auto flex-row-reverse" : ""
                                    )}
                                >
                                    {/* Avatar logic... */}

                                    <div className={cn(
                                        "group relative px-4 py-2 text-sm shadow-sm",
                                        isMe
                                            ? "bg-[#1C73E8] text-white rounded-2xl rounded-tr-sm"
                                            : "bg-[#1f1f1f] text-gray-200 border border-white/5 rounded-2xl rounded-tl-sm"
                                    )}>
                                        {/* Message Content */}
                                        {msg.type === 'image' ? (
                                            <div className="mb-1 rounded-lg overflow-hidden bg-black/20">
                                                <img src={msg.mediaUrl || msg.content} alt="Image" className="max-w-xs object-cover" />
                                            </div>
                                        ) : msg.type === 'audio' ? (
                                            <div className="flex items-center gap-3 min-w-[200px]">
                                                <button className="h-8 w-8 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors">
                                                    <Play size={14} className="fill-current ml-0.5" />
                                                </button>
                                                <div className="flex-1 h-1 bg-black/20 rounded-full overflow-hidden">
                                                    <div className="w-1/3 h-full bg-white/80" />
                                                </div>
                                                <span className="text-[10px] opacity-70">0:12</span>
                                            </div>
                                        ) : (
                                            <div className="whitespace-pre-wrap leading-relaxed">{msg.content}</div>
                                        )}

                                        {/* Metadata */}
                                        <div className={cn(
                                            "flex items-center justify-end gap-1 mt-1 text-[10px]",
                                            isMe ? "text-blue-100/70" : "text-gray-500"
                                        )}>
                                            <span>{msg.timestamp}</span>
                                            {isMe && (
                                                <span>
                                                    {msg.status === 'read' ? <CheckCheck size={12} className="text-white" /> :
                                                        msg.status === 'delivered' ? <CheckCheck size={12} /> :
                                                            <Check size={12} />}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </ScrollArea>

            {/* Input Area */}
            <div className="p-4 bg-[#111] border-t border-white/10">
                <div className="flex items-end gap-2 bg-[#1f1f1f] p-2 rounded-xl border border-white/5 focus-within:border-[#1C73E8]/50 focus-within:ring-1 focus-within:ring-[#1C73E8]/50 transition-all">
                    <textarea
                        className="flex-1 bg-transparent border-none text-white placeholder:text-gray-500 focus:ring-0 resize-none min-h-[40px] max-h-[200px] py-2.5 px-3 custom-scrollbar"
                        placeholder="Type a message..."
                        rows={1}
                        value={messageInput}
                        onChange={(e) => {
                            setMessageInput(e.target.value);
                            // Auto-grow
                            e.target.style.height = 'auto';
                            e.target.style.height = `${e.target.scrollHeight}px`;
                        }}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSendClick();
                            }
                        }}
                    />
                    <Button
                        size="icon"
                        className={cn(
                            "h-10 w-10 shrink-0 rounded-lg transition-all transform",
                            messageInput.trim()
                                ? "bg-[#1C73E8] hover:bg-[#1C73E8]/90 text-white shadow-lg hover:scale-105"
                                : "bg-white/5 text-gray-500 cursor-not-allowed"
                        )}
                        onClick={handleSendClick}
                        disabled={isSending || !messageInput.trim()}
                    >
                        <Send size={18} className={cn("ml-0.5", isSending && "animate-pulse")} />
                    </Button>
                </div>
            </div>
        </div>
    );
}
