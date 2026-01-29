'use client'

import { useState } from 'react'
import { MultiSelect } from '@/components/ui/multi-select'

import { createDesignRequest } from '@/actions/design-actions'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

export function DesignForm({ company, user }: { company?: any, user?: any }) {
    const [formData, setFormData] = useState({
        materialName: '',
        objective: '',
        aspectRatio: [] as string[],
        fileFormat: [] as string[],
        variations: '',
        headline: '',
        subheadline: '',
        callToAction: '',
        requiredInfo: '',
        imageLinks: '',
        referenceLinks: '',
        notes: '',
        deadlineDate: '',
        deadlineTime: ''
    })

    const [isSubmitting, setIsSubmitting] = useState(false)

    const aspectRatioOptions = [
        { value: '1:1', label: '1:1 (Square)' },
        { value: '16:9', label: '16:9 (Landscape)' },
        { value: '9:16', label: '9:16 (Portrait)' },
        { value: '4:5', label: '4:5 (Instagram)' },
        { value: 'custom', label: 'Custom' }
    ]

    const fileFormatOptions = [
        { value: 'png', label: 'PNG' },
        { value: 'jpg', label: 'JPG' },
        { value: 'svg', label: 'SVG' },
        { value: 'mp4', label: 'MP4 (Video)' },
        { value: 'gif', label: 'GIF' },
        { value: 'pdf', label: 'PDF' }
    ]

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)

        try {
            // Construct requester string
            const companyName = company?.name || 'Unknown Company'
            const companyId = company?.id || 'unknown-id'
            const userName = user?.name || user?.email || 'Unknown User'
            const userId = user?.id || 'unknown-id'

            const requester = `${companyName} (ID: ${companyId}), ${userName} (ID: ${userId})`

            const payload = {
                agent_name: 'Melinda',
                material_name: formData.materialName,
                objective: formData.objective,
                aspect_ratio: formData.aspectRatio,
                file_format: formData.fileFormat,
                variations: formData.variations,
                headline: formData.headline,
                subheadline: formData.subheadline,
                call_to_action: formData.callToAction,
                required_info: formData.requiredInfo,
                image_links: formData.imageLinks,
                reference_links: formData.referenceLinks,
                notes: formData.notes,
                deadline_date: formData.deadlineDate,
                deadline_time: formData.deadlineTime,
                requester: requester
            }

            const response = await fetch('https://hook.startg4.com/webhook/4a03306f-54de-43b6-a7ed-bf08f0515e6a', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload)
            })

            if (!response.ok) {
                throw new Error('Webhook submission failed')
            }

            // Also call original server action if needed for persistence, 
            // but user request implies replacing functionality with webhook.
            // If we want to keep local record, we might still want to call createDesignRequest.
            // However, the prompt asks to "send a post... to webhook", implying this is the primary action.
            // I'll stick to just the webhook for now as requested, OR call both if I want to be safe.
            // Given "Need that when user clicks... send a post...", I'll assume ONLY webhook is strictly required,
            // but keeping database record is usually desired in this app.
            // Let's TRY to keep the DB record creation as well just in case, but wrapped in try/catch so it doesn't block.
            // Actually, `createDesignRequest` likely saves to Supabase. If I remove it, the "Design Deliverables" tab might be empty.
            // I will execute `createDesignRequest` as well to ensure data consistency in the app.

            // Prepare FormData for the existing server action (to keep app functioning as before)
            const data = new FormData()
            data.append('material_name', formData.materialName)
            data.append('objective', formData.objective)
            formData.aspectRatio.forEach(val => data.append('aspect_ratio', val))
            formData.fileFormat.forEach(val => data.append('file_format', val))
            data.append('variations', formData.variations)
            data.append('headline', formData.headline)
            data.append('subheadline', formData.subheadline)
            data.append('call_to_action', formData.callToAction)
            data.append('required_info', formData.requiredInfo)
            if (formData.imageLinks) {
                formData.imageLinks.split(/[\n,]+/).map(s => s.trim()).filter(Boolean).forEach(link => {
                    data.append('images', link)
                })
            }
            if (formData.referenceLinks) {
                formData.referenceLinks.split(/[\n,]+/).map(s => s.trim()).filter(Boolean).forEach(link => {
                    data.append('reference_files', link)
                })
            }
            data.append('notes', formData.notes)
            if (formData.deadlineDate && formData.deadlineTime) {
                data.append('deadline', `${formData.deadlineDate} ${formData.deadlineTime}`)
            } else if (formData.deadlineDate) {
                data.append('deadline', formData.deadlineDate)
            }

            await createDesignRequest(data)

            toast.success('Design request sent successfully!')
            handleCancel() // Reset form

        } catch (error) {
            console.error(error)
            toast.error('Failed to submit request')
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleCancel = () => {
        setFormData({
            materialName: '',
            objective: '',
            aspectRatio: [],
            fileFormat: [],
            variations: '',
            headline: '',
            subheadline: '',
            callToAction: '',
            requiredInfo: '',
            imageLinks: '',
            referenceLinks: '',
            notes: '',
            deadlineDate: '',
            deadlineTime: ''
        })
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6 max-w-[1400px] mx-auto">
            {/* Top Section - Core Info & Meta */}
            <div className="grid grid-cols-12 gap-6">
                {/* Material Name - Span 5 */}
                <div className="col-span-5 space-y-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-white">
                        <svg className="w-4 h-4 text-[#1C73E8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Material Name
                    </label>
                    <input
                        type="text"
                        value={formData.materialName}
                        onChange={(e) => setFormData({ ...formData, materialName: e.target.value })}
                        placeholder="e.g., Holiday Campaign, Week X Promotion"
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#1C73E8] transition-colors"
                    />
                </div>

                {/* Objective - Span 5 */}
                <div className="col-span-5 space-y-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-white">
                        <svg className="w-4 h-4 text-[#1C73E8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Objective
                        <svg className="w-3.5 h-3.5 text-gray-500 cursor-help" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </label>
                    <input
                        type="text"
                        value={formData.objective}
                        onChange={(e) => setFormData({ ...formData, objective: e.target.value })}
                        placeholder="e.g., drive traffic..."
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#1C73E8] transition-colors"
                    />
                </div>

                {/* Variations - Span 2 */}
                <div className="col-span-2 space-y-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-white">
                        <svg className="w-4 h-4 text-[#1C73E8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        Variations
                    </label>
                    <select
                        value={formData.variations}
                        onChange={(e) => setFormData({ ...formData, variations: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#1C73E8] transition-colors"
                    >
                        <option value="">Select</option>
                        <option value="1">1</option>
                        <option value="2">2</option>
                        <option value="3">3</option>
                        <option value="5">5</option>
                        <option value="10">10</option>
                    </select>
                </div>
            </div>

            {/* Second Row - Specs */}
            <div className="grid grid-cols-3 gap-6">
                <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-white">
                        <svg className="w-4 h-4 text-[#1C73E8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-3zM14 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1h-4a1 1 0 01-1-1v-3z" />
                        </svg>
                        Aspect Ratio
                    </label>
                    <MultiSelect
                        options={aspectRatioOptions}
                        value={formData.aspectRatio}
                        onChange={(value) => setFormData({ ...formData, aspectRatio: value })}
                        placeholder="Select one or more"
                    />
                </div>

                <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-white">
                        <svg className="w-4 h-4 text-[#1C73E8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                        File Format
                    </label>
                    <MultiSelect
                        options={fileFormatOptions}
                        value={formData.fileFormat}
                        onChange={(value) => setFormData({ ...formData, fileFormat: value })}
                        placeholder="Select one or more"
                    />
                </div>

                <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-white">
                        <svg className="w-4 h-4 text-[#1C73E8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        Deadline
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                        <input
                            type="date"
                            value={formData.deadlineDate}
                            onChange={(e) => setFormData({ ...formData, deadlineDate: e.target.value })}
                            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#1C73E8] transition-colors"
                        />
                        <input
                            type="time"
                            value={formData.deadlineTime}
                            onChange={(e) => setFormData({ ...formData, deadlineTime: e.target.value })}
                            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#1C73E8] transition-colors"
                        />
                    </div>
                </div>
            </div>

            {/* Third Section - Copy Details */}
            <div className="grid grid-cols-12 gap-6">
                {/* Headline - Span 3 */}
                <div className="col-span-3 space-y-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-white">
                        <svg className="w-4 h-4 text-[#1C73E8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                        </svg>
                        Headline
                    </label>
                    <input
                        type="text"
                        maxLength={50}
                        value={formData.headline}
                        onChange={(e) => setFormData({ ...formData, headline: e.target.value })}
                        placeholder="e.g., Discover Product X"
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#1C73E8] transition-colors"
                    />
                </div>

                {/* Subheadline - Span 5 */}
                <div className="col-span-5 space-y-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-white">
                        <svg className="w-4 h-4 text-[#1C73E8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                        </svg>
                        Subheadline
                    </label>
                    <input
                        type="text"
                        maxLength={150}
                        value={formData.subheadline}
                        onChange={(e) => setFormData({ ...formData, subheadline: e.target.value })}
                        placeholder="High conversion subheadline"
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#1C73E8] transition-colors"
                    />
                </div>

                {/* CTA - Span 2 */}
                <div className="col-span-2 space-y-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-white">
                        <svg className="w-4 h-4 text-[#1C73E8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 9l3 3m0 0l-3 3m3-3H8m13 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        CTA
                    </label>
                    <input
                        type="text"
                        maxLength={20}
                        value={formData.callToAction}
                        onChange={(e) => setFormData({ ...formData, callToAction: e.target.value })}
                        placeholder="e.g. Buy Now"
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#1C73E8] transition-colors"
                    />
                </div>

                {/* Required Info - Span 2 */}
                <div className="col-span-2 space-y-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-white">
                        <svg className="w-4 h-4 text-[#1C73E8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Info
                    </label>
                    <input
                        type="text"
                        maxLength={20}
                        value={formData.requiredInfo}
                        onChange={(e) => setFormData({ ...formData, requiredInfo: e.target.value })}
                        placeholder="e.g. Disclaimer"
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#1C73E8] transition-colors"
                    />
                </div>
            </div>

            {/* Fourth Section - Description & Assets */}
            <div className="grid grid-cols-12 gap-6">
                {/* Notes - Span 8 */}
                <div className="col-span-8 space-y-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-white">
                        <svg className="w-4 h-4 text-[#1C73E8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Description / Notes
                    </label>
                    <textarea
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        placeholder="Briefing details..."
                        rows={4}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#1C73E8] transition-colors resize-none h-[140px]"
                    />
                </div>

                {/* Assets Column - Span 4 */}
                <div className="col-span-4 space-y-4">
                    {/* Images */}
                    <div className="space-y-2">
                        <label className="flex items-center gap-2 text-sm font-medium text-white">
                            <svg className="w-4 h-4 text-[#1C73E8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            Images
                        </label>
                        <input
                            type="text"
                            value={formData.imageLinks}
                            onChange={(e) => setFormData({ ...formData, imageLinks: e.target.value })}
                            placeholder="Paste links"
                            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#1C73E8] transition-colors"
                        />
                    </div>

                    {/* References */}
                    <div className="space-y-2">
                        <label className="flex items-center gap-2 text-sm font-medium text-white">
                            <svg className="w-4 h-4 text-[#1C73E8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                            </svg>
                            References
                        </label>
                        <input
                            type="text"
                            value={formData.referenceLinks}
                            onChange={(e) => setFormData({ ...formData, referenceLinks: e.target.value })}
                            placeholder="Paste links"
                            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#1C73E8] transition-colors"
                        />
                    </div>
                </div>
            </div>

            {/* Footer Buttons */}
            <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                <button
                    type="button"
                    onClick={handleCancel}
                    className="px-4 py-2 text-sm font-medium text-white bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-2 text-sm font-bold text-white bg-[#1C73E8] rounded-lg hover:bg-[#1557b0] transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                    Request Design
                </button>
            </div>
        </form>
    )
}
