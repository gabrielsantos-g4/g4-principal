import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog"
import { TagItem } from "@/actions/crm/get-crm-settings"
import { AlertCircle } from "lucide-react"

interface LostLeadModalProps {
    isOpen: boolean
    onClose: () => void
    onConfirm: (reason: string) => void
    reasons: (string | TagItem)[]
}

export function LostLeadModal({ isOpen, onClose, onConfirm, reasons }: LostLeadModalProps) {
    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="bg-[#1A1A1A] border-white/10 text-white max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-red-400">
                        <AlertCircle size={20} />
                        Mark Deal as Lost
                    </DialogTitle>
                    <DialogDescription className="text-gray-400">
                        Yeah, that’s okay. Just select why we lost this lead.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex flex-col gap-4 py-4">
                    <div className="flex flex-wrap gap-2">
                        {reasons.length > 0 ? (
                            reasons.map((reason, index) => {
                                const label = typeof reason === 'string' ? reason : reason.label
                                const displayReason = typeof reason === 'string'
                                    ? { label: reason, bg: 'bg-slate-800', text: 'text-slate-100' }
                                    : reason

                                return (
                                    <button
                                        key={index}
                                        onClick={() => onConfirm(label)}
                                        className={`px-3 py-1.5 rounded-full text-sm font-medium border border-white/10 transition-all hover:scale-105 active:scale-95 ${displayReason.bg} ${displayReason.text} hover:opacity-80`}
                                    >
                                        {label}
                                    </button>
                                )
                            })
                        ) : (
                            <div className="text-sm text-gray-500 italic w-full text-center">
                                No reasons configured. Please add them in CRM Settings.
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex justify-end">
                    <button
                        onClick={onClose}
                        className="text-sm text-gray-400 hover:text-white transition-colors"
                    >
                        Cancel
                    </button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
