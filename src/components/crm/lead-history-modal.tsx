"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { format } from "date-fns";
import { Send } from "lucide-react";

interface HistoryItem {
    id: string;
    message: string;
    date: Date;
    userId?: string;
}

interface LeadHistoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    leadName?: string;
    history: HistoryItem[];
    onAddMessage: (message: string) => void;
    messagingUsers?: { id: string; name: string }[];
}

export function LeadHistoryModal({ isOpen, onClose, leadName, history, onAddMessage, messagingUsers = [] }: LeadHistoryModalProps) {
    const [newMessage, setNewMessage] = useState("");

    const handleSubmit = () => {
        if (!newMessage.trim()) return;
        onAddMessage(newMessage);
        setNewMessage("");
    };



    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px] bg-[#111] text-white p-6 border border-white/10 rounded-lg">
                <DialogHeader className="mb-4">
                    <DialogTitle className="text-xl font-bold flex items-center gap-2">
                        History for <span className="text-[#1C73E8]">{leadName}</span>
                    </DialogTitle>
                </DialogHeader>

                <div className="flex flex-col gap-4">
                    {/* History List */}
                    <div className="flex flex-col gap-3 h-[300px] overflow-y-auto custom-scrollbar pr-2 mb-2">
                        {history.length === 0 ? (
                            <div className="text-gray-500 text-sm italic text-center py-4 flex flex-col items-center justify-center h-full opacity-50">
                                <span>No history yet</span>
                            </div>
                        ) : (
                            history.slice().reverse().map((item) => (
                                <div key={item.id} className="bg-white/5 p-3 rounded-md border border-white/5">
                                    <div className="flex items-center justify-between mb-1">
                                        <div className="text-[10px] text-gray-400 font-medium">
                                            {item.userId && messagingUsers.length > 0
                                                ? messagingUsers.find(u => u.id === item.userId)?.name || 'Agent'
                                                : 'Agent'}
                                        </div>
                                        <div className="text-[10px] text-gray-500 font-mono">
                                            {format(item.date, "dd/MMM/yyyy HH:mm")}
                                        </div>
                                    </div>
                                    <p className="text-sm text-gray-200 whitespace-pre-wrap leading-relaxed">{item.message}</p>
                                </div>
                            ))
                        )}
                    </div>

                    {/* New Message Input */}
                    <div className="flex items-center gap-2 pt-4 border-t border-white/10">
                        <textarea
                            placeholder="Type a new message..."
                            className="bg-black/20 border-white/10 text-sm text-white focus-visible:ring-[#1C73E8] flex-1 rounded-md px-3 py-2 min-h-[40px] max-h-[120px] resize-none focus:outline-none focus:ring-1 custom-scrollbar"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            onInput={(e) => {
                                const target = e.target as HTMLTextAreaElement;
                                target.style.height = "auto";
                                target.style.height = `${target.scrollHeight}px`;
                            }}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSubmit();
                                    // Reset height after submit
                                    const target = e.target as HTMLTextAreaElement;
                                    setTimeout(() => {
                                        target.style.height = "auto";
                                    }, 0);
                                }
                            }}
                            rows={1}
                        />
                        <Button
                            onClick={handleSubmit}
                            disabled={!newMessage.trim()}
                            className="bg-[#1C73E8] hover:bg-[#1557B0] text-white h-10 w-10 p-0 rounded-md shrink-0"
                        >
                            <Send size={16} />
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
