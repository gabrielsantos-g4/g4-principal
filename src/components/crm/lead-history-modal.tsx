"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { format } from "date-fns";
import { Send } from "lucide-react";

interface HistoryItem {
    id: string;
    message: string;
    date: Date;
}

interface LeadHistoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    leadName?: string;
    history: HistoryItem[];
    onAddMessage: (message: string) => void;
}

export function LeadHistoryModal({ isOpen, onClose, leadName, history, onAddMessage }: LeadHistoryModalProps) {
    const [newMessage, setNewMessage] = useState("");

    const handleSubmit = () => {
        if (!newMessage.trim()) return;
        onAddMessage(newMessage);
        setNewMessage("");
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleSubmit();
        }
    }

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
                                    <div className="text-[10px] text-gray-500 mb-1 font-mono">
                                        {format(item.date, "dd/MMM/yyyy HH:mm")}
                                    </div>
                                    <p className="text-sm text-gray-200 whitespace-pre-wrap leading-relaxed">{item.message}</p>
                                </div>
                            ))
                        )}
                    </div>

                    {/* New Message Input */}
                    <div className="flex items-center gap-2 pt-4 border-t border-white/10">
                        <Input
                            placeholder="Type a new message..."
                            className="bg-black/20 border-white/10 h-10 text-sm text-white focus-visible:ring-[#1C73E8] flex-1"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            onKeyDown={handleKeyDown}
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
