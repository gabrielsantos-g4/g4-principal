'use client';

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { X, MessageSquare, Globe } from "lucide-react"
import { OmnichannelInbox } from "@/components/support/omnichannel/omnichannel-inbox"

interface GlobalInboxModalProps {
    isOpen: boolean
    onClose: () => void
    viewerProfile?: any
}

export function GlobalInboxModal({ isOpen, onClose, viewerProfile }: GlobalInboxModalProps) {
    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent
                showCloseButton={false}
                className="bg-[#0f0f0f] border-white/10 text-white w-[98vw] max-w-[98vw] h-[95vh] max-h-[95vh] sm:max-w-[98vw] flex flex-col p-0 gap-0 overflow-hidden shadow-2xl"
            >
                <DialogHeader className="p-4 border-b border-white/5 bg-[#141414] shrink-0">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-[#1C73E8]/10 flex items-center justify-center text-[#1C73E8] border border-[#1C73E8]/20 shadow-[0_0_15px_rgba(28,115,232,0.1)]">
                                <Globe size={20} />
                            </div>
                            <div>
                                <DialogTitle className="text-lg font-bold flex items-center gap-2">
                                    Emily Hub: Centralized Inbox
                                    <span className="px-1.5 py-0.5 rounded text-[10px] bg-[#1C73E8] text-white font-bold uppercase tracking-wider">
                                        Beta
                                    </span>
                                </DialogTitle>
                                <p className="text-xs text-gray-400">
                                    Unified view of all conversations from AI Agents and Human Specialists.
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-white/10 rounded-full transition-all duration-200 group active:scale-95"
                        >
                            <X size={20} className="text-gray-400 group-hover:text-white" />
                        </button>
                    </div>
                </DialogHeader>

                <div className="flex-1 bg-[#0a0a0a] p-4 overflow-hidden">
                    <div className="h-full w-full rounded-xl border border-white/10 overflow-hidden bg-[#111] shadow-inner">
                        <OmnichannelInbox mode="global" viewerProfile={viewerProfile} />
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
