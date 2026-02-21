
import { useRef, useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Play, Send, ArrowLeftRight, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Conversation } from "./ConversationList";

interface ChatAreaProps {
    selectedConversation: Conversation | undefined;
    messages: any[];
    isMessagesLoading: boolean;
    currentUserId: string | null;
    isSending: boolean;
    onSendMessage: (text: string) => void;
    onToggleResponsibility: (status?: string) => void;
    isToggling: boolean;
    onUpload?: (file: File) => void;
    onToggleQuemAtende?: () => void;
    isTogglingQuemAtende?: boolean;
    isAgentInbox?: boolean;
    agentAvatar?: string;
    agentName?: string;
    instanceAvatar?: string;
}

const CHANNEL_COLORS: Record<string, string> = {
    whatsapp: "text-[#25D366]",
    linkedin: "text-[#0A66C2]",
    instagram: "text-[#E4405F]",
    facebook: "text-[#1877F2]",
    email: "text-orange-400",
    sms: "text-purple-400",
    phone: "text-blue-400",
    web: "text-gray-400"
};

const CHANNEL_ICONS: Record<string, string> = {
    whatsapp: "💬",
    linkedin: "💼",
    instagram: "📸",
    facebook: "👥",
    email: "✉️",
    sms: "📱",
    phone: "📞",
    web: "🌐"
};

function formatMsgTime(timestamp: string): string {
    if (!timestamp) return "";
    try {
        const d = new Date(timestamp);
        if (isNaN(d.getTime())) return "";
        return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', hour12: false });
    } catch {
        return "";
    }
}

export function ChatArea({
    selectedConversation,
    messages,
    isMessagesLoading,
    currentUserId,
    isSending,
    onSendMessage,
    onToggleResponsibility,
    isToggling,
    onToggleQuemAtende,
    isTogglingQuemAtende,
    isAgentInbox,
    agentAvatar,
    agentName,
    instanceAvatar
}: ChatAreaProps) {
    const scrollRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
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

    const handleSendClick = () => {
        if (messageInput.trim()) {
            onSendMessage(messageInput);
            setMessageInput("");
            if (textareaRef.current) {
                textareaRef.current.style.height = 'auto';
            }
        }
    };

    if (!selectedConversation) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center bg-[#0f0f0f] gap-4">
                <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-2xl">
                    💬
                </div>
                <p className="text-gray-500 text-sm">Select a conversation to start chatting</p>
            </div>
        );
    }

    const channelIcon = CHANNEL_ICONS[selectedConversation.channel] || "💬";
    const channelColor = CHANNEL_COLORS[selectedConversation.channel] || "text-white";

    return (
        <div className="flex-1 flex flex-col bg-[#0d0d0d] relative h-full overflow-hidden">
            {/* Chat Header */}
            <div className="h-[65px] border-b border-white/8 flex items-center justify-between px-5 bg-[#111] shrink-0 shadow-sm">
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Avatar className="h-9 w-9 border border-white/10">
                            <AvatarImage src={selectedConversation.contact.avatar} />
                            <AvatarFallback className="text-xs font-bold bg-[#1C73E8]/20 text-[#1C73E8]">
                                {selectedConversation.contact.name[0]}
                            </AvatarFallback>
                        </Avatar>
                        <span className="absolute -bottom-0.5 -right-0.5 text-[10px] leading-none">{channelIcon}</span>
                    </div>
                    <div>
                        <h4 className="text-sm font-semibold text-white leading-tight">
                            {selectedConversation.contact.name}
                        </h4>
                        <div className="flex items-center gap-1.5 text-[12px]">
                            <span>{channelIcon}</span>
                            <span className={cn("font-semibold capitalize", channelColor)}>
                                {selectedConversation.channel}
                            </span>
                            {selectedConversation.contact.company && (
                                <>
                                    <span className="text-gray-700">·</span>
                                    <span className="text-gray-500 truncate max-w-[120px]">{selectedConversation.contact.company}</span>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {isAgentInbox && (
                        <Button
                            size="sm"
                            variant="ghost"
                            className={cn(
                                "h-8 shrink-0 rounded-lg transition-all text-xs gap-1.5 px-3 border",
                                selectedConversation.quem_atende?.toLowerCase() === 'humano'
                                    ? "bg-purple-600/10 text-purple-300 hover:bg-purple-600/20 border-purple-500/20"
                                    : "bg-emerald-600/10 text-emerald-300 hover:bg-emerald-600/20 border-emerald-500/20"
                            )}
                            onClick={onToggleQuemAtende}
                            disabled={isTogglingQuemAtende}
                        >
                            {isTogglingQuemAtende ? (
                                <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <>
                                    <ArrowLeftRight size={12} />
                                    {selectedConversation.quem_atende?.toLowerCase() === 'humano' ? 'To Agent' : 'To Human'}
                                </>
                            )}
                        </Button>
                    )}

                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant="secondary"
                                size="sm"
                                disabled={isToggling}
                                className="h-8 bg-white/8 text-gray-300 hover:bg-white/15 border border-white/10 text-xs gap-1.5 rounded-lg transition-all"
                            >
                                {isToggling ? (
                                    <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                ) : (
                                    <>Resolve <ChevronDown size={12} className="opacity-60" /></>
                                )}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-44 p-1.5 bg-[#1A1A1A] border-white/10" align="end">
                            <div className="flex flex-col gap-0.5">
                                <p className="text-[10px] text-gray-500 px-2 py-1 mb-0.5 font-medium uppercase tracking-wider">Move to</p>

                                <button
                                    onClick={() => onToggleResponsibility('Won')}
                                    className="flex items-center gap-2 w-full text-left px-2 py-1.5 text-xs text-emerald-400 hover:bg-emerald-500/10 rounded transition-colors"
                                >
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                    Won
                                </button>

                                <button
                                    onClick={() => onToggleResponsibility('Lost')}
                                    className="flex items-center gap-2 w-full text-left px-2 py-1.5 text-xs text-red-400 hover:bg-red-500/10 rounded transition-colors"
                                >
                                    <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                                    Lost
                                </button>

                                <div className="h-px bg-white/8 my-0.5" />

                                <button
                                    onClick={() => onToggleResponsibility()}
                                    className="flex items-center gap-2 w-full text-left px-2 py-1.5 text-xs text-gray-400 hover:bg-white/8 rounded transition-colors"
                                >
                                    <div className="w-1.5 h-1.5 rounded-full bg-gray-600" />
                                    Keep Status
                                </button>
                            </div>
                        </PopoverContent>
                    </Popover>
                </div>
            </div>

            {/* Messages Area */}
            <ScrollArea className="flex-1 px-4 py-5" ref={scrollRef}>
                <div className="space-y-1 max-w-3xl mx-auto">
                    {/* Date label */}
                    <div className="flex justify-center mb-5">
                        <span className="bg-[#1a1a1a] text-gray-500 text-[10px] px-3 py-1 rounded-full uppercase tracking-wider font-medium border border-white/5">
                            Today
                        </span>
                    </div>

                    {isMessagesLoading ? (
                        <div className="flex flex-col gap-3 px-4 pt-4">
                            {[...Array(4)].map((_, i) => (
                                <div key={i} className={cn("flex gap-2 max-w-[70%] animate-pulse", i % 2 === 0 ? "" : "ml-auto flex-row-reverse")}>
                                    <div className="w-7 h-7 rounded-full bg-white/8 shrink-0" />
                                    <div className={cn("h-10 rounded-2xl bg-white/8 flex-1", i % 2 === 0 ? "rounded-tl-sm" : "rounded-tr-sm")} />
                                </div>
                            ))}
                        </div>
                    ) : messages.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
                            <div className="text-4xl opacity-30">💬</div>
                            <p className="text-gray-600 text-sm">No messages yet</p>
                            <p className="text-gray-700 text-xs">Start the conversation below</p>
                        </div>
                    ) : (
                        messages.map((msg, index) => {
                            const isMe = msg.type === 'notes' ? true : msg.senderId === 'me' || msg.senderId === currentUserId;
                            const prevMsg = messages[index - 1];
                            const nextMsg = messages[index + 1];
                            const isSameAsPrev = prevMsg && (prevMsg.senderId === msg.senderId);
                            const isSameAsNext = nextMsg && (nextMsg.senderId === msg.senderId);

                            if (msg.type === 'notes') {
                                return (
                                    <div key={msg.id} className="flex justify-center my-3">
                                        <div className="bg-[#1C73E8]/10 border border-[#1C73E8]/15 text-[#6ea8fe] text-xs px-4 py-2 rounded-xl flex items-center gap-2 max-w-[80%] italic">
                                            <span className="font-semibold not-italic text-[#1C73E8]">Note:</span>
                                            {msg.content}
                                        </div>
                                    </div>
                                );
                            }

                            return (
                                <div
                                    key={msg.id}
                                    className={cn(
                                        "flex gap-2 max-w-[78%] items-end",
                                        isMe ? "ml-auto flex-row-reverse" : "",
                                        isSameAsPrev ? "mt-0.5" : "mt-3"
                                    )}
                                >
                                    {/* Avatar: show only on last message in a sequence */}
                                    <div className="w-6 shrink-0">
                                        {!isSameAsNext && (
                                            <Avatar className="h-6 w-6 border border-white/10">
                                                <AvatarImage src={isMe ? (instanceAvatar || agentAvatar) : selectedConversation.contact.avatar} />
                                                <AvatarFallback className="text-[9px]">
                                                    {isMe ? (agentName?.[0] || 'A') : selectedConversation.contact.name[0]}
                                                </AvatarFallback>
                                            </Avatar>
                                        )}
                                    </div>

                                    {/* Bubble */}
                                    <div className={cn(
                                        "group relative px-3.5 py-2.5 text-sm shadow-sm max-w-full",
                                        isMe
                                            ? cn(
                                                "bg-[#1C73E8] text-white",
                                                isSameAsPrev && isSameAsNext ? "rounded-2xl rounded-tr-md rounded-br-md" :
                                                    isSameAsPrev ? "rounded-2xl rounded-tr-md" :
                                                        isSameAsNext ? "rounded-2xl rounded-br-md" :
                                                            "rounded-2xl rounded-tr-sm"
                                            )
                                            : cn(
                                                "bg-[#1e1e1e] text-gray-200 border border-white/6",
                                                isSameAsPrev && isSameAsNext ? "rounded-2xl rounded-tl-md rounded-bl-md" :
                                                    isSameAsPrev ? "rounded-2xl rounded-tl-md" :
                                                        isSameAsNext ? "rounded-2xl rounded-bl-md" :
                                                            "rounded-2xl rounded-tl-sm"
                                            )
                                    )}>
                                        {/* Message Content */}
                                        {msg.type === 'image' ? (
                                            <div className="mb-1 rounded-lg overflow-hidden bg-black/20">
                                                <img src={msg.mediaUrl || msg.content} alt="Image" className="max-w-[240px] object-cover rounded-lg" />
                                            </div>
                                        ) : msg.type === 'audio' ? (
                                            <div className="flex items-center gap-3 min-w-[180px]">
                                                <button className="h-8 w-8 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors shrink-0">
                                                    <Play size={13} className="fill-current ml-0.5" />
                                                </button>
                                                <div className="flex-1 h-0.5 bg-black/20 rounded-full overflow-hidden">
                                                    <div className="w-1/3 h-full bg-white/70 rounded-full" />
                                                </div>
                                                <span className="text-[10px] opacity-60 shrink-0">0:12</span>
                                            </div>
                                        ) : (
                                            <div className="whitespace-pre-wrap leading-relaxed break-words">{msg.content}</div>
                                        )}

                                        {/* Timestamp + status */}
                                        <div className={cn(
                                            "flex items-center justify-end gap-1 mt-1 text-[10px]",
                                            isMe ? "text-blue-100/50" : "text-gray-600"
                                        )}>
                                            <span>{formatMsgTime(msg.timestamp)}</span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </ScrollArea>

            {/* Input Area */}
            <div className="p-3 bg-[#111] border-t border-white/8 shrink-0">
                <div className="flex items-end gap-2 bg-[#1a1a1a] px-3 py-2 rounded-xl border border-white/8 focus-within:border-[#1C73E8]/40 focus-within:ring-1 focus-within:ring-[#1C73E8]/20 transition-all duration-200">
                    <textarea
                        ref={textareaRef}
                        className="flex-1 bg-transparent text-white placeholder:text-gray-600 text-sm focus:outline-none resize-none min-h-[38px] max-h-[160px] py-2 leading-relaxed"
                        placeholder="Type a message..."
                        rows={1}
                        value={messageInput}
                        onChange={(e) => {
                            setMessageInput(e.target.value);
                            e.target.style.height = 'auto';
                            e.target.style.height = `${Math.min(e.target.scrollHeight, 160)}px`;
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
                            "h-9 w-9 shrink-0 rounded-lg transition-all duration-200",
                            messageInput.trim()
                                ? "bg-[#1C73E8] hover:bg-[#1a67d4] text-white shadow-[0_0_15px_rgba(28,115,232,0.3)]"
                                : "bg-white/5 text-gray-600 cursor-not-allowed"
                        )}
                        onClick={handleSendClick}
                        disabled={isSending || !messageInput.trim()}
                    >
                        <Send size={16} className={cn("ml-0.5", isSending && "animate-pulse")} />
                    </Button>
                </div>
                <p className="text-[10px] text-gray-700 mt-1.5 ml-1">Press <kbd className="text-gray-600 bg-white/5 px-1 rounded text-[9px]">↵ Enter</kbd> to send · <kbd className="text-gray-600 bg-white/5 px-1 rounded text-[9px]">⇧ Shift+Enter</kbd> for new line</p>
            </div>
        </div>
    );
}
