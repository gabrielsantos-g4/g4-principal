import { cn } from "@/lib/utils"
import { Message } from "@/actions/messenger/conversations-actions"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Check, CheckCheck, Clock } from "lucide-react"

interface ChatBubbleProps {
    message: Message
    isMe: boolean
}

export function ChatBubble({ message, isMe }: ChatBubbleProps) {
    return (
        <div className={cn("flex w-full mb-4", isMe ? "justify-end" : "justify-start")}>
            <div
                className={cn(
                    "max-w-[70%] rounded-lg px-4 py-2 relative shadow-sm",
                    isMe
                        ? "bg-[#005c4b] text-[#e9edef] rounded-tr-none"
                        : "bg-[#202c33] text-[#e9edef] rounded-tl-none"
                )}
            >
                {/* Media Content */}
                {message.media_url && (
                    <div className="mb-2 rounded-lg overflow-hidden">
                        {message.media_type === "image" && (
                            <img src={message.media_url} alt="Media" className="w-full h-auto object-cover max-h-[300px]" />
                        )}
                        {message.media_type === "video" && (
                            <video src={message.media_url} controls className="w-full h-auto max-h-[300px]" />
                        )}
                        {message.media_type === "audio" && (
                            <audio src={message.media_url} controls className="w-full mt-1" />
                        )}
                        {message.media_type === "document" && (
                            <a
                                href={message.media_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 p-2 bg-black/20 rounded border border-white/10 hover:bg-black/40 transition-colors"
                            >
                                <span className="text-sm underline">Ver Documento</span>
                            </a>
                        )}
                    </div>
                )}

                {/* Text Content */}
                <p className="whitespace-pre-wrap break-words text-sm leading-relaxed">
                    {message.body}
                </p>

                {/* Metadata (Time + Status) */}
                <div className={cn("flex items-center gap-1 mt-1 text-[10px]", isMe ? "justify-end text-[#8696a0]" : "justify-end text-[#8696a0]")}>
                    <span>
                        {format(new Date(message.created_at), "HH:mm", { locale: ptBR })}
                    </span>
                    {isMe && (
                        <span>
                            {message.status === 'read' && <CheckCheck className="w-3.5 h-3.5 text-[#53bdeb]" />}
                            {message.status === 'delivered' && <CheckCheck className="w-3.5 h-3.5" />}
                            {message.status === 'sent' && <Check className="w-3.5 h-3.5" />}
                            {(message.status === 'pending' || !message.status) && <Clock className="w-3 h-3" />}
                        </span>
                    )}
                </div>
            </div>
        </div>
    )
}
