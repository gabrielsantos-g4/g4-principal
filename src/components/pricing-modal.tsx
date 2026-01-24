'use client'

import { Dialog, DialogContent } from "@/components/ui/dialog"
import { PricingContent } from "@/components/pricing-content"

interface PricingModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function PricingModal({ open, onOpenChange }: PricingModalProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[96vw] bg-[#0A0A0A] border-white/10 text-white p-0 overflow-hidden flex flex-col h-[95vh]">
                <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
                    <PricingContent />
                </div>

                <div className="p-4 border-t border-white/10 bg-[#0A0A0A] flex justify-end">
                    <button
                        onClick={() => onOpenChange(false)}
                        className="px-6 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors text-sm font-medium"
                    >
                        Close
                    </button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
