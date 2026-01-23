'use client'

import React from 'react'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog'
import { RichViewer } from '@/components/ui/rich-viewer'
import { Button } from '@/components/ui/button'

interface DeliveryViewModalProps {
    isOpen: boolean
    onClose: () => void
    linkContent: string
    materialName: string
}

export function DeliveryViewModal({ isOpen, onClose, linkContent, materialName }: DeliveryViewModalProps) {
    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="bg-[#1A1A1A] border-white/10 text-white sm:max-w-xl w-full">
                <DialogHeader className="mb-4">
                    <DialogTitle className="text-xl font-bold flex items-center gap-3">
                        {materialName}
                    </DialogTitle>
                    <DialogDescription className="text-gray-400">
                        Delivery Notes & Links
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-400 uppercase">Delivery & Feedback</label>
                        <RichViewer content={linkContent} />
                    </div>

                    <div className="flex justify-end pt-4">
                        <Button variant="outline" onClick={onClose} className="border-white/10 hover:bg-white/5 text-gray-300">
                            Close
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
