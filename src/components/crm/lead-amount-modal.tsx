"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";

interface LeadAmountModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentAmount: string; // Assuming amount is stored as string based on mock data "1.500,00"
    onSave: (newAmount: string) => void;
}

export function LeadAmountModal({ isOpen, onClose, currentAmount, onSave }: LeadAmountModalProps) {
    const [amount, setAmount] = useState(currentAmount);

    useEffect(() => {
        setAmount(currentAmount);
    }, [currentAmount, isOpen]);

    const handleSave = () => {
        onSave(amount);
        onClose();
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleSave();
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[400px] bg-[#111] text-white p-6 border border-white/10 rounded-lg">
                <DialogHeader className="mb-4">
                    <DialogTitle className="text-xl font-bold">Edit Amount</DialogTitle>
                </DialogHeader>

                <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-bold text-gray-400">Value</label>
                        <Input
                            className="bg-black/20 border-white/10 h-10 text-sm text-white focus-visible:ring-[#1C73E8]"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            onKeyDown={handleKeyDown}
                            autoFocus
                        />
                    </div>
                    <div className="flex justify-end gap-2 mt-2">
                        <Button variant="outline" onClick={onClose} className="h-9 px-4 font-bold border-white/10 bg-transparent text-gray-400 hover:text-white hover:bg-white/5 rounded-sm">
                            Cancel
                        </Button>
                        <Button onClick={handleSave} className="h-9 px-6 font-bold bg-[#1C73E8] text-white hover:bg-[#1557B0] border-none shadow-none rounded-sm">
                            Save
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
