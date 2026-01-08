'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2 } from 'lucide-react'

interface SaveReportModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onConfirm: (name: string) => Promise<void>
}

export function SaveReportModal({ open, onOpenChange, onConfirm }: SaveReportModalProps) {
    const [name, setName] = useState('')
    const [loading, setLoading] = useState(false)

    async function handleConfirm() {
        if (!name.trim()) return

        setLoading(true)
        try {
            await onConfirm(name)
            setName('') // Reset input on success
            onOpenChange(false) // Close modal
        } catch (error) {
            console.error('Failed to save', error)
            // Error handling is typically done by the parent via toast, 
            // but we could add local error state here if needed
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px] bg-slate-900 border-slate-700 text-slate-100">
                <DialogHeader>
                    <DialogTitle>Save Report</DialogTitle>
                    <DialogDescription className="text-slate-400">
                        Give this report a name for easy future identification.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="name" className="text-right">
                            Name
                        </Label>
                        <Input
                            id="name"
                            placeholder="Ex: Q1 2025 Campaign"
                            className="col-span-3 bg-slate-800 border-slate-600 text-white"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            disabled={loading}
                            autoFocus
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading} className="border-slate-600 text-slate-300 hover:bg-slate-800 hover:text-white">
                        Cancel
                    </Button>
                    <Button onClick={handleConfirm} disabled={!name.trim() || loading} className="bg-orange-600 hover:bg-orange-700 text-white">
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
