'use client'

import { useState } from 'react'
import { MultiSelect } from '@/components/ui/multi-select'

export function DesignForm() {
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

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        console.log('Design request submitted:', formData)
        // TODO: Implement submission logic
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
            {/* First Row - 5 Fields */}
            <div className="grid grid-cols-5 gap-4">
                {/* Material Name */}
                <div className="space-y-2">
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

                {/* Objective */}
                <div className="space-y-2">
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
                        placeholder="e.g., drive traffic to the product page, increase awareness, etc."
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#1C73E8] transition-colors"
                    />
                </div>

                {/* Aspect Ratio */}
                <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-white">
                        <svg className="w-4 h-4 text-[#1C73E8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-3zM14 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1h-4a1 1 0 01-1-1v-3z" />
                        </svg>
                        Aspect Ratio
                        <svg className="w-3.5 h-3.5 text-gray-500 cursor-help" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </label>

                    <MultiSelect
                        options={aspectRatioOptions}
                        value={formData.aspectRatio}
                        onChange={(value) => setFormData({ ...formData, aspectRatio: value })}
                        placeholder="Select one or more"
                    />
                </div>

                {/* File Format */}
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

                {/* Variations */}
                <div className="space-y-2">
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

            {/* Second Row - 4 Fields */}
            <div className="grid grid-cols-4 gap-4">
                {/* Headline */}
                <div className="space-y-2">
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

                {/* Subheadline */}
                <div className="space-y-2">
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
                        placeholder="e.g., Click to see the details."
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#1C73E8] transition-colors"
                    />
                </div>

                {/* Call to Action */}
                <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-white">
                        <svg className="w-4 h-4 text-[#1C73E8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 9l3 3m0 0l-3 3m3-3H8m13 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Call to Action
                    </label>

                    <input
                        type="text"
                        maxLength={20}
                        value={formData.callToAction}
                        onChange={(e) => setFormData({ ...formData, callToAction: e.target.value })}
                        placeholder="e.g., Learn more, Buy now"
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#1C73E8] transition-colors"
                    />
                </div>

                {/* Required Info */}
                <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-white">
                        <svg className="w-4 h-4 text-[#1C73E8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Required Info
                    </label>

                    <input
                        type="text"
                        maxLength={20}
                        value={formData.requiredInfo}
                        onChange={(e) => setFormData({ ...formData, requiredInfo: e.target.value })}
                        placeholder="e.g., price, date, address, rules, disclaimer"
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#1C73E8] transition-colors"
                    />
                </div>
            </div>

            {/* Third Row - 4 Fields */}
            <div className="grid grid-cols-4 gap-4">
                {/* Images */}
                <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-white">
                        <svg className="w-4 h-4 text-[#1C73E8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        Images
                    </label>

                    <div className="border-2 border-dashed border-white/20 rounded-lg p-6 text-center hover:border-[#1C73E8]/50 transition-colors cursor-pointer">
                        <p className="text-sm text-gray-400">Upload or drag</p>
                    </div>
                    <input
                        type="text"
                        value={formData.imageLinks}
                        onChange={(e) => setFormData({ ...formData, imageLinks: e.target.value })}
                        placeholder="Or paste links"
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

                    <div className="border-2 border-dashed border-white/20 rounded-lg p-6 text-center hover:border-[#1C73E8]/50 transition-colors cursor-pointer">
                        <p className="text-sm text-gray-400">Upload or drag</p>
                    </div>
                    <input
                        type="text"
                        value={formData.referenceLinks}
                        onChange={(e) => setFormData({ ...formData, referenceLinks: e.target.value })}
                        placeholder="Or paste links"
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#1C73E8] transition-colors"
                    />
                </div>

                {/* Notes & Comments */}
                <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-white">
                        <svg className="w-4 h-4 text-[#1C73E8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Notes & Comments
                    </label>

                    <textarea
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        placeholder="Field for general or additional instructions"
                        rows={4}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#1C73E8] transition-colors resize-none"
                    />
                </div>

                {/* Deadline */}
                <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-white">
                        <svg className="w-4 h-4 text-[#1C73E8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        Deadline
                    </label>

                    <div className="space-y-2">
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
                    className="px-6 py-2 text-sm font-bold text-white bg-[#1C73E8] rounded-lg hover:bg-[#1557b0] transition-colors"
                >
                    Request Design
                </button>
            </div>
        </form>
    )
}
