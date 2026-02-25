import { cn } from "@/lib/utils"
import { Message } from "@/actions/messenger/conversations-actions"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Check, CheckCheck, Clock } from "lucide-react"

interface ChatBubbleProps {
    message: Message
    isMe: boolean
}

function formatWhatsAppText(text: string): string {
    if (!text) return "";

    // Escape HTML to prevent XSS before applying formatting
    let formatted = text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

    // Replace newlines with <br/> for HTML rendering
    formatted = formatted.replace(/\n/g, '<br/>');

    // Monospace ```text```
    formatted = formatted.replace(/```([\s\S]*?)```/g, '<code class="bg-black/10 dark:bg-white/10 px-1 py-0.5 rounded font-mono text-[13px]">$1</code>');

    // Bold *text* (must not be preceded by alphanumeric character, handles <br/>)
    formatted = formatted.replace(/(^|[\s\W]|<br\/>)\*([^\*]+)\*(?=([\s\W]|<br\/>|$))/g, '$1<strong>$2</strong>');

    // Italic _text_ (must not be preceded by alphanumeric character, handles <br/>)
    formatted = formatted.replace(/(^|[\s\W]|<br\/>)\_([^_]+)\_(?=([\s\W]|<br\/>|$))/g, '$1<em>$2</em>');

    // Strikethrough ~text~ (must not be preceded by alphanumeric character, handles <br/>)
    formatted = formatted.replace(/(^|[\s\W]|<br\/>)\~([^~]+)\~(?=([\s\W]|<br\/>|$))/g, '$1<del>$2</del>');

    return formatted;
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
                <div
                    className="whitespace-pre-wrap break-words text-sm leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: formatWhatsAppText(message.body) }}
                />

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
