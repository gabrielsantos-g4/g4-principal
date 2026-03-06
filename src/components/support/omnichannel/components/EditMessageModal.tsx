import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";
import { cn } from "@/lib/utils";

interface EditMessageModalProps {
    message: { id: string; content: string } | null;
    onClose: () => void;
    onConfirm: (messageId: string, newText: string) => Promise<void>;
}

export function EditMessageModal({ message, onClose, onConfirm }: EditMessageModalProps) {
    const [text, setText] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        if (message) {
            setText(message.content);
            // Auto-resize on open
            setTimeout(() => {
                if (textareaRef.current) {
                    textareaRef.current.style.height = "auto";
                    textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
                }
            }, 50);
        }
    }, [message]);

    async function handleConfirm() {
        if (!message || !text.trim() || text === message.content) return;
        setIsLoading(true);
        try {
            await onConfirm(message.id, text.trim());
            onClose();
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <Dialog open={!!message} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="bg-[#141414] border border-white/10 text-white max-w-lg p-0 gap-0 rounded-2xl overflow-hidden">
                <DialogHeader className="px-5 pt-5 pb-4 border-b border-white/8">
                    <DialogTitle className="flex items-center gap-2 text-sm font-semibold text-white">
                        <div className="w-7 h-7 rounded-lg bg-blue-500/15 flex items-center justify-center">
                            <Pencil size={14} className="text-blue-400" />
                        </div>
                        Edit message
                    </DialogTitle>
                </DialogHeader>

                <div className="px-5 py-4 flex flex-col gap-4">
                    {/* Original message preview */}
                    <div>
                        <p className="text-[11px] text-gray-500 uppercase tracking-wider font-medium mb-2">Original</p>
                        <div className="bg-[#1a1a1a] border border-white/6 rounded-xl px-3.5 py-2.5 text-sm text-gray-400 leading-relaxed whitespace-pre-wrap break-words max-h-32 overflow-y-auto">
                            {message?.content}
                        </div>
                    </div>

                    {/* Editable input */}
                    <div>
                        <p className="text-[11px] text-gray-500 uppercase tracking-wider font-medium mb-2">New text</p>
                        <textarea
                            ref={textareaRef}
                            value={text}
                            onChange={(e) => {
                                setText(e.target.value);
                                e.target.style.height = "auto";
                                e.target.style.height = `${Math.min(e.target.scrollHeight, 200)}px`;
                            }}
                            onKeyDown={(e) => {
                                if (e.key === "Enter" && !e.shiftKey) {
                                    e.preventDefault();
                                    handleConfirm();
                                }
                            }}
                            className={cn(
                                "w-full bg-[#1e1e1e] border border-white/10 rounded-xl px-3.5 py-2.5",
                                "text-sm text-white leading-relaxed resize-none focus:outline-none",
                                "focus:border-[#1C73E8]/50 focus:ring-1 focus:ring-[#1C73E8]/20 transition-all",
                                "min-h-[80px] max-h-[200px]"
                            )}
                            autoFocus
                        />
                    </div>
                </div>

                <div className="px-5 pb-5 flex items-center justify-end gap-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onClose}
                        disabled={isLoading}
                        className="h-8 px-4 text-xs text-gray-400 hover:text-white hover:bg-white/8"
                    >
                        Cancel
                    </Button>
                    <Button
                        size="sm"
                        onClick={handleConfirm}
                        disabled={isLoading || !text.trim() || text === message?.content}
                        className="h-8 px-4 text-xs bg-[#1C73E8] hover:bg-[#1a67d4] text-white disabled:opacity-40"
                    >
                        {isLoading ? (
                            <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : "Confirm"}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
