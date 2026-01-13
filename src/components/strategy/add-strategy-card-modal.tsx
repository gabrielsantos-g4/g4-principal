'use client'

import { useState, useRef } from 'react'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Upload } from 'lucide-react'

export type FunnelStage = 'ToFu' | 'MoFu' | 'BoFu'
export type Channel = 'Organic' | 'Paid' | 'Outreach'

export interface NewCardData {
    funnelStage: FunnelStage
    channel: Channel
    title: string
    link?: string
    image?: string | null
    responsibleImage?: string | null
}

interface AddStrategyCardModalProps {
    onAdd: (data: NewCardData) => void
    children?: React.ReactNode
}

export function AddStrategyCardModal({ onAdd, children }: AddStrategyCardModalProps) {
    const [open, setOpen] = useState(false)
    const [funnelStage, setFunnelStage] = useState<FunnelStage | null>(null)
    const [channel, setChannel] = useState<Channel | null>(null)
    const [title, setTitle] = useState('')
    const [link, setLink] = useState('')
    const [imagePreview, setImagePreview] = useState<string | null>(null)
    const [responsiblePreview, setResponsiblePreview] = useState<string | null>(null)

    const fileInputRef = useRef<HTMLInputElement>(null)
    const responsibleInputRef = useRef<HTMLInputElement>(null)

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, setPreview: (val: string | null) => void) => {
        const file = e.target.files?.[0]
        if (file) {
            const reader = new FileReader()
            reader.onloadend = () => {
                setPreview(reader.result as string)
            }
            reader.readAsDataURL(file)
        }
    }

    const handleSubmit = () => {
        if (!funnelStage || !channel || !title) return;

        onAdd({
            funnelStage,
            channel,
            title,
            link,
            image: imagePreview,
            responsibleImage: responsiblePreview,
        })
        setOpen(false)

        // Reset form
        setFunnelStage(null)
        setChannel(null)
        setTitle('')
        setLink('')
        setImagePreview(null)
        setResponsiblePreview(null)
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {children || (
                    <Button variant="outline" size="sm" className="gap-2">
                        <Plus className="w-4 h-4" /> Insert
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="max-w-4xl bg-[#F5F5F5] text-slate-800 p-8 border-none shadow-2xl overflow-hidden">
                {/* Visual layout based on screenshot */}
                <div className="flex gap-8">

                    {/* Left Side: Funnel Selection */}
                    <div className="flex flex-col gap-4 mt-20 w-32">
                        {['ToFu', 'MoFu', 'BoFu'].map((stage) => (
                            <button
                                key={stage}
                                onClick={() => setFunnelStage(stage as FunnelStage)}
                                className={`h-12 border-2 rounded-md font-semibold transition-all ${funnelStage === stage
                                    ? 'border-[#1C73E8] bg-[#1C73E8]/10 text-[#1C73E8]'
                                    : 'border-slate-300 text-slate-500 hover:border-slate-400'
                                    }`}
                            >
                                {stage}
                            </button>
                        ))}
                    </div>

                    {/* Right Side: Main Content */}
                    <div className="flex-1 flex flex-col">

                        {/* Header: Channel Selection */}
                        <div className="flex flex-col items-center mb-8">
                            <div className="grid grid-cols-[2fr_1fr] w-full max-w-lg mb-2 gap-8">
                                <span className="text-center font-bold tracking-wider uppercase text-sm">Inbound</span>
                                <span className="text-center font-bold tracking-wider uppercase text-sm">Outbound</span>
                            </div>
                            <div className="grid grid-cols-3 gap-4 w-full max-w-xl">
                                {['Organic', 'Paid', 'Outreach'].map((c) => (
                                    <button
                                        key={c}
                                        onClick={() => setChannel(c as Channel)}
                                        className={`h-10 border-2 rounded-md font-semibold transition-all ${channel === c
                                            ? 'border-[#1C73E8] bg-[#1C73E8]/10 text-[#1C73E8]'
                                            : 'border-slate-300 text-slate-500 hover:border-slate-400'
                                            }`}
                                    >
                                        {c}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* White Card Area */}
                        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">

                            {/* Upload Area */}
                            <div
                                onClick={() => fileInputRef.current?.click()}
                                className="w-full h-40 border-2 border-dashed border-slate-200 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-slate-300 transition-colors mb-6 relative overflow-hidden group"
                            >
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    className="hidden"
                                    accept="image/*"
                                    onChange={(e) => handleFileChange(e, setImagePreview)}
                                />
                                {imagePreview ? (
                                    <>
                                        <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white font-medium">Change Image</div>
                                    </>
                                ) : (
                                    <span className="text-slate-600">Click to upload a file</span>
                                )}
                            </div>

                            {/* Inputs */}
                            <div className="flex gap-4 mb-4">
                                <Input
                                    placeholder="Name"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className="flex-1 bg-white border-slate-200"
                                />
                                <div className="flex-none">
                                    <Button
                                        onClick={handleSubmit}
                                        disabled={!funnelStage || !channel || !title}
                                        className="w-24 bg-[#1C73E8] hover:bg-[#1560bd] text-white"
                                    >
                                        Add
                                    </Button>
                                </div>
                            </div>

                            {/* Extra Fields requested by user */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex flex-col gap-1">
                                    <label className="text-xs text-slate-500 font-medium ml-1">Destination Link</label>
                                    <Input
                                        placeholder="https://..."
                                        value={link}
                                        onChange={(e) => setLink(e.target.value)}
                                        className="bg-white border-slate-200 text-xs"
                                    />
                                </div>
                                <div className="flex flex-col gap-1">
                                    <label className="text-xs text-slate-500 font-medium ml-1">Person in Charge</label>
                                    <div className="flex items-center gap-3">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => responsibleInputRef.current?.click()}
                                            className="text-xs text-slate-500 border-slate-200 justify-start"
                                        >
                                            <Upload className="w-3 h-3 mr-2" /> Upload Photo
                                        </Button>
                                        {responsiblePreview && (
                                            <div className="w-8 h-8 rounded-full overflow-hidden border border-slate-200 shadow-sm">
                                                <img src={responsiblePreview} alt="Person" className="w-full h-full object-cover" />
                                            </div>
                                        )}
                                    </div>
                                    <input
                                        type="file"
                                        ref={responsibleInputRef}
                                        className="hidden"
                                        accept="image/*"
                                        onChange={(e) => handleFileChange(e, setResponsiblePreview)}
                                    />
                                </div>
                            </div>

                        </div>

                        {/* Footer Actions */}
                        <div className="flex justify-end mt-4">
                            <Button variant="ghost" className="text-red-500 hover:text-red-600 hover:bg-red-50" onClick={() => setOpen(false)}>
                                Cancel
                            </Button>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
