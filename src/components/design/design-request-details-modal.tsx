'use client'

import React, { useState, useTransition } from 'react'
import { updateDesignRequest } from '@/actions/design-actions'
import { toast } from 'sonner'
import { Loader2, Save } from 'lucide-react'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog'
import { useRouter } from 'next/navigation'
import { RichViewer } from '@/components/ui/rich-viewer'
import { RichInput } from '@/components/ui/rich-input'

interface DesignRequestDetailsModalProps {
    isOpen: boolean
    onClose: () => void
    request: any | null // Using any loosely here to match typical usage, but proper type is DesignRequest
    onSave?: (id: string, updates: Partial<any>) => Promise<void>
}

export function DesignRequestDetailsModal({ isOpen, onClose, request, onSave }: DesignRequestDetailsModalProps) {
    const router = useRouter()
    const [isPending, startTransition] = useTransition()
    const [formData, setFormData] = useState({
        status: request?.status || 'pending',
        delivery_link: request?.delivery_link || '',
        notes: request?.notes || ''
    })

    if (!request) return null

    const handleSave = async () => {
        startTransition(async () => {
            try {
                // Determine updates
                const updates = {
                    status: formData.status,
                    delivery_link: formData.delivery_link,
                    notes: formData.notes
                }

                if (onSave) {
                    await onSave(request.id, updates)
                } else {
                    // Fallback if no parent handler, though list handles it usually
                    const res = await updateDesignRequest(request.id, updates)
                    if (!res.success) throw new Error("Update failed")
                    router.refresh()
                }

                toast.success("Request updated")
                onClose()
            } catch (error) {
                console.error(error)
                toast.error("Failed to update request")
            }
        })
    }

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="bg-[#1A1A1A] border-white/10 text-white sm:max-w-[95vw] w-full max-h-[95vh] overflow-y-auto">
                <DialogHeader className="mb-4">
                    <DialogTitle className="text-xl font-bold flex items-center gap-3">
                        <span>{request.material_name}</span>
                        <div className={`text-xs px-2 py-1 rounded-full border ${request.status === 'approved' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                            request.status === 'for_approval' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                                request.status === 'in_progress' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                                    request.status === 'cancelled' || request.status === 'rejected' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                                        'bg-gray-500/10 text-gray-400 border-gray-500/20'
                            }`}>
                            {request.status.toUpperCase().replace('_', ' ')}
                        </div>
                    </DialogTitle>
                    <DialogDescription className="text-gray-400">
                        Request ID: {request.id} • Created: {new Date(request.created_at).toLocaleDateString()}
                    </DialogDescription>
                </DialogHeader>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column (2/3): Request Details */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Section: Project Info */}
                        <div className="space-y-4 bg-white/5 p-4 rounded-xl border border-white/5">
                            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2 border-b border-white/5 pb-2">Project Info</h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <span className="text-xs font-bold text-gray-500 uppercase">Objective</span>
                                    <p className="text-gray-200 text-sm">{request.objective || '-'}</p>
                                </div>
                                <div className="space-y-1">
                                    <span className="text-xs font-bold text-gray-500 uppercase">Deadline</span>
                                    <p className="text-gray-200 text-sm">{request.deadline || '-'}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <span className="text-xs font-bold text-gray-500 uppercase">Format</span>
                                    <div className="flex flex-wrap gap-1">
                                        {request.file_format && Array.isArray(request.file_format) && request.file_format.length > 0
                                            ? request.file_format.map((f: string, i: number) => (
                                                <span key={i} className="text-xs bg-white/10 px-2 py-0.5 rounded text-gray-300">{f}</span>
                                            ))
                                            : <span className="text-gray-500 text-xs">-</span>
                                        }
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <span className="text-xs font-bold text-gray-500 uppercase">Aspect Ratio</span>
                                    <div className="flex flex-wrap gap-1">
                                        {request.aspect_ratio && Array.isArray(request.aspect_ratio) && request.aspect_ratio.length > 0
                                            ? request.aspect_ratio.map((r: string, i: number) => (
                                                <span key={i} className="text-xs bg-white/10 px-2 py-0.5 rounded text-gray-300">{r}</span>
                                            ))
                                            : <span className="text-gray-500 text-xs">-</span>
                                        }
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Section: Copy & Content */}
                        <div className="space-y-4 bg-white/5 p-4 rounded-xl border border-white/5">
                            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2 border-b border-white/5 pb-2">Copy & Content</h3>

                            <div className="space-y-3">
                                <div className="space-y-1">
                                    <span className="text-xs font-bold text-gray-500 uppercase">Headline</span>
                                    <p className="text-gray-200 text-sm bg-black/20 p-2 rounded">{request.headline || '-'}</p>
                                </div>
                                <div className="space-y-1">
                                    <span className="text-xs font-bold text-gray-500 uppercase">Subheadline</span>
                                    <p className="text-gray-200 text-sm bg-black/20 p-2 rounded">{request.subheadline || '-'}</p>
                                </div>
                                <div className="space-y-1">
                                    <span className="text-xs font-bold text-gray-500 uppercase">Call to Action (CTA)</span>
                                    <p className="text-gray-200 text-sm bg-black/20 p-2 rounded">{request.call_to_action || '-'}</p>
                                </div>
                                <div className="space-y-1">
                                    <span className="text-xs font-bold text-gray-500 uppercase">Required Info</span>
                                    <p className="text-gray-200 text-sm bg-black/20 p-2 rounded whitespace-pre-wrap">{request.required_info || '-'}</p>
                                </div>
                                <div className="space-y-1">
                                    <span className="text-xs font-bold text-gray-500 uppercase">Notes</span>
                                    <p className="text-gray-200 text-sm bg-black/20 p-2 rounded whitespace-pre-wrap">{request.notes || '-'}</p>
                                </div>
                            </div>
                        </div>

                        {/* Section: Assets */}
                        <div className="space-y-4 bg-white/5 p-4 rounded-xl border border-white/5">
                            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2 border-b border-white/5 pb-2">Assets</h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <span className="text-xs font-bold text-gray-500 uppercase">Images / Files</span>
                                    <div className="space-y-1">
                                        {request.images && Array.isArray(request.images) && request.images.length > 0 ? (
                                            request.images.map((img: string, i: number) => (
                                                <a key={i} href={img} target="_blank" rel="noopener noreferrer" className="block text-sm text-blue-400 hover:text-blue-300 truncate underline">
                                                    {img}
                                                </a>
                                            ))
                                        ) : <span className="text-gray-500 text-xs italic">No images provided</span>}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <span className="text-xs font-bold text-gray-500 uppercase">References</span>
                                    <div className="space-y-1">
                                        {request.reference_files && Array.isArray(request.reference_files) && request.reference_files.length > 0 ? (
                                            request.reference_files.map((ref: string, i: number) => (
                                                <a key={i} href={ref} target="_blank" rel="noopener noreferrer" className="block text-sm text-blue-400 hover:text-blue-300 truncate underline">
                                                    {ref}
                                                </a>
                                            ))
                                        ) : <span className="text-gray-500 text-xs italic">No references provided</span>}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Section: Delivery & Feedback (New) */}
                        {request.delivery_link && (
                            <div className="space-y-4 bg-emerald-500/5 p-4 rounded-xl border border-emerald-500/20">
                                <h3 className="text-sm font-bold text-emerald-400 uppercase tracking-wider mb-2 border-b border-emerald-500/20 pb-2">
                                    Delivery & Feedback
                                </h3>
                                <div>
                                    <span className="text-xs font-bold text-gray-500 uppercase block mb-1">Notes & Links</span>
                                    <RichViewer content={request.delivery_link} />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right Column (1/3): Fulfillment Actions */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-blue-500/5 border border-blue-500/20 p-5 rounded-xl sticky top-4">
                            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 border-b border-blue-500/20 pb-2">Fulfillment</h3>

                            <div className="space-y-5">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-400 uppercase">Status</label>
                                    <select
                                        value={formData.status}
                                        onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                                        className="w-full bg-black/40 border border-white/10 text-white text-sm rounded-lg px-3 py-2.5 outline-none focus:ring-1 focus:ring-blue-500"
                                    >
                                        <option value="to_do">To Do</option>
                                        <option value="in_progress">In Progress</option>
                                        <option value="for_approval">For Approval</option>
                                        <option value="approved">Approved</option>
                                        <option value="cancelled">Cancelled</option>
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-400 uppercase">Delivery Notes & Links</label>
                                    <RichInput
                                        value={formData.delivery_link}
                                        onChange={(val) => setFormData(prev => ({ ...prev, delivery_link: val }))}
                                        placeholder="Add notes, links (paste URL over text for smart link), or feedback here..."
                                    />
                                    <p className="text-[10px] text-gray-500">
                                        Paste a URL over selected text to embed as a link.
                                    </p>
                                </div>

                                <div className="pt-4 flex flex-col gap-3">
                                    <button
                                        onClick={handleSave}
                                        disabled={isPending}
                                        className="w-full py-2.5 text-sm font-bold text-white bg-[#1C73E8] rounded-lg hover:bg-[#1557b0] transition-colors flex items-center justify-center gap-2"
                                    >
                                        {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                        Save & Update
                                    </button>
                                    <button
                                        onClick={onClose}
                                        disabled={isPending}
                                        className="w-full py-2 text-sm font-medium text-gray-400 hover:text-white transition-colors"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            </DialogContent>
        </Dialog>
    )
}
