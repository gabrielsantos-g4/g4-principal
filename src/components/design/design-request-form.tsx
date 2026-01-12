'use client'

import { useState } from 'react'

import { MultiSelect } from '@/components/ui/multi-select'

export function DesignRequestForm() {
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

    const [activeTab, setActiveTab] = useState<'design' | 'video'>('design')

    const [videoFormData, setVideoFormData] = useState({
        materialName: '',
        objective: '',
        aspectRatio: [] as string[],
        fileFormat: [] as string[],
        captions: '',
        takesLink: '',
        referenceLinks: '',
        instructions: '',
        deadlineDate: '',
        deadlineTime: ''
    })

    const handleVideoSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        console.log('Video request submitted:', videoFormData)
        // TODO: Implement submission logic
    }

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
        // Reset form or navigate away
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
        <div className="w-full max-w-[1400px] mx-auto space-y-8">
            {/* Tabs Header */}
            <div className="flex items-center gap-8 border-b border-white/10 mb-8">
                <button
                    onClick={() => setActiveTab('design')}
                    className={`pb-4 text-sm font-medium transition-colors relative ${activeTab === 'design' ? 'text-white' : 'text-gray-400 hover:text-gray-300'
                        }`}
                >
                    Design
                    {activeTab === 'design' && (
                        <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#1C73E8]" />
                    )}
                </button>
                <button
                    onClick={() => setActiveTab('video')}
                    className={`pb-4 text-sm font-medium transition-colors relative ${activeTab === 'video' ? 'text-white' : 'text-gray-400 hover:text-gray-300'
                        }`}
                >
                    Vídeo
                    {activeTab === 'video' && (
                        <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#1C73E8]" />
                    )}
                </button>
            </div>

            {activeTab === 'design' && (
                <div className="space-y-12">
                    {/* Request Form Section */}
                    <div>
                        <div className="mb-6 flex items-center justify-between">
                            <div>
                                <h1 className="text-2xl font-bold text-white mb-1">Request / Guardrails</h1>
                                <p className="text-sm text-gray-400">Submit your request. If any information is not applicable, you can leave it blank.</p>
                            </div>
                            <div className="bg-[#1C73E8]/10 border border-[#1C73E8]/30 px-3 py-1.5 rounded-md text-[#1C73E8] text-xs font-medium flex items-center gap-2">
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                                </svg>
                                Design
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* First Row - 5 Fields */}
                            <div className="grid grid-cols-5 gap-4">
                                {/* Material Name */}
                                <div className="space-y-2">
                                    <label className="flex items-center gap-2 text-sm font-medium text-white">
                                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                        Material Name
                                    </label>
                                    <p className="text-xs text-gray-500">What should we call this request?</p>
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
                                    <p className="text-xs text-gray-500">What do you want to achieve?</p>
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
                                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-3zM14 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1h-4a1 1 0 01-1-1v-3z" />
                                        </svg>
                                        Aspect Ratio
                                        <svg className="w-3.5 h-3.5 text-gray-500 cursor-help" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </label>
                                    <p className="text-xs text-gray-500">Which formats (aspect ratios)?</p>
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
                                    <p className="text-xs text-gray-500">How would you like to receive it?</p>
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
                                    <p className="text-xs text-gray-500">How many different versions?</p>
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
                                    <p className="text-xs text-gray-500">Max. 50 characters</p>
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
                                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                                        </svg>
                                        Subheadline
                                    </label>
                                    <p className="text-xs text-gray-500">Max. 150 characters</p>
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
                                    <p className="text-xs text-gray-500">Max. 20 characters</p>
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
                                    <p className="text-xs text-gray-500">What must be included? Max. 20 characters</p>
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
                                    <p className="text-xs text-gray-500">Upload photos or visual elements to be used</p>
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

                                {/* References (Inspiration) */}
                                <div className="space-y-2">
                                    <label className="flex items-center gap-2 text-sm font-medium text-white">
                                        <svg className="w-4 h-4 text-[#1C73E8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                        </svg>
                                        References (Inspiration)
                                    </label>
                                    <p className="text-xs text-gray-500">Inspiration screenshots</p>
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
                                    <p className="text-xs text-gray-500">Extra instructions, visual direction, important observations</p>
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
                                    <p className="text-xs text-gray-500">When does this need to be ready?</p>
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
                    </div>

                    {/* Deliverables List */}
                    <div className="bg-white/5 border border-white/10 rounded-lg p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-white">Deliverables List - Design</h2>
                            <button className="bg-[#1C73E8] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#1557b0] transition-colors">
                                Schedule a quick call
                            </button>
                        </div>

                        {/* Table */}
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-white/10">
                                        <th className="text-left py-3 px-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Name</th>
                                        <th className="text-left py-3 px-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Created</th>
                                        <th className="text-left py-3 px-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                                        <th className="text-left py-3 px-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Deadline</th>
                                        <th className="text-left py-3 px-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Link</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {/* Example rows - replace with real data */}
                                    <tr className="hover:bg-white/5 transition-colors">
                                        <td className="py-4 px-4 text-sm text-white font-medium">name design</td>
                                        <td className="py-4 px-4 text-sm text-gray-400">23/Dec/25, 12:51</td>
                                        <td className="py-4 px-4">
                                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-[#1C73E8]/10 text-[#1C73E8]">
                                                In progress
                                            </span>
                                        </td>
                                        <td className="py-4 px-4 text-sm text-gray-400">25/Dec/25, 20:00</td>
                                        <td className="py-4 px-4 text-sm">
                                            <span className="text-gray-600">-</span>
                                        </td>
                                    </tr>
                                    <tr className="hover:bg-white/5 transition-colors">
                                        <td className="py-4 px-4 text-sm text-white font-medium">efg</td>
                                        <td className="py-4 px-4 text-sm text-gray-400">23/Dec/25, 17:58</td>
                                        <td className="py-4 px-4">
                                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-[#1C73E8]/10 text-[#1C73E8]">
                                                In progress
                                            </span>
                                        </td>
                                        <td className="py-4 px-4 text-sm text-gray-400">25/Dec/25, 17:57</td>
                                        <td className="py-4 px-4 text-sm">
                                            <span className="text-gray-600">-</span>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'video' && (
                <div className="space-y-12">
                    {/* Video Request Form Section */}
                    <div>
                        <div className="mb-6 flex items-center justify-between">
                            <div>
                                <h1 className="text-2xl font-bold text-white mb-1">Request / Guardrails</h1>
                                <p className="text-sm text-gray-400">Submit your request. If any information is not applicable, you can leave it blank.</p>
                            </div>
                            <div className="bg-[#1C73E8]/10 border border-[#1C73E8]/30 px-3 py-1.5 rounded-md text-[#1C73E8] text-xs font-medium flex items-center gap-2">
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                </svg>
                                Video
                            </div>
                        </div>



                        <form onSubmit={handleVideoSubmit} className="space-y-6">
                            {/* Top Row - 5 Fields */}
                            <div className="grid grid-cols-5 gap-4">
                                {/* Material Name */}
                                <div className="space-y-2">
                                    <label className="flex items-center gap-2 text-sm font-medium text-white">
                                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                        Material Name
                                    </label>
                                    <p className="text-xs text-gray-500">What should we call this request?</p>
                                    <input
                                        type="text"
                                        value={videoFormData.materialName}
                                        onChange={(e) => setVideoFormData({ ...videoFormData, materialName: e.target.value })}
                                        placeholder="e.g.: Holiday Campaign, Week X Promotion"
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
                                    <p className="text-xs text-gray-500">What do you want to achieve?</p>
                                    <input
                                        type="text"
                                        value={videoFormData.objective}
                                        onChange={(e) => setVideoFormData({ ...videoFormData, objective: e.target.value })}
                                        placeholder="e.g.: drive traffic to the product page, increase awareness, etc."
                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#1C73E8] transition-colors"
                                    />
                                </div>

                                {/* Aspect Ratio */}
                                <div className="space-y-2">
                                    <label className="flex items-center gap-2 text-sm font-medium text-white">
                                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-3zM14 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1h-4a1 1 0 01-1-1v-3z" />
                                        </svg>
                                        Aspect Ratio
                                        <svg className="w-3.5 h-3.5 text-gray-500 cursor-help" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </label>
                                    <p className="text-xs text-gray-500">Which formats (aspect ratios)?</p>
                                    <MultiSelect
                                        options={aspectRatioOptions}
                                        value={videoFormData.aspectRatio}
                                        onChange={(value) => setVideoFormData({ ...videoFormData, aspectRatio: value })}
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
                                    <p className="text-xs text-gray-500">How would you like to receive it?</p>
                                    <MultiSelect
                                        options={fileFormatOptions}
                                        value={videoFormData.fileFormat}
                                        onChange={(value) => setVideoFormData({ ...videoFormData, fileFormat: value })}
                                        placeholder="Select one or more"
                                    />
                                </div>

                                {/* Add captions? */}
                                <div className="space-y-2">
                                    <label className="flex items-center gap-2 text-sm font-medium text-white">
                                        <svg className="w-4 h-4 text-[#1C73E8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                        </svg>
                                        Add captions?
                                    </label>
                                    <p className="text-xs text-gray-500">If so, what language?</p>
                                    <select
                                        value={videoFormData.captions}
                                        onChange={(e) => setVideoFormData({ ...videoFormData, captions: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#1C73E8] transition-colors"
                                    >
                                        <option value="">Select</option>
                                        <option value="no">No captions</option>
                                        <option value="pt-br">Portuguese (BR)</option>
                                        <option value="en">English</option>
                                        <option value="es">Spanish</option>
                                    </select>
                                </div>
                            </div>

                            {/* Middle Section - Grid Layout */}
                            <div className="grid grid-cols-12 gap-6">
                                {/* Left Column - Takes & References (40%) */}
                                <div className="col-span-5 space-y-6">
                                    {/* Takes */}
                                    <div className="space-y-2">
                                        <label className="flex items-center gap-2 text-sm font-medium text-white">
                                            <svg className="w-4 h-4 text-[#1C73E8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                            Takes
                                        </label>
                                        <p className="text-xs text-gray-500">Provide takes to be used</p>
                                        <textarea
                                            value={videoFormData.takesLink}
                                            onChange={(e) => setVideoFormData({ ...videoFormData, takesLink: e.target.value })}
                                            placeholder="Paste your Google Drive link"
                                            rows={3}
                                            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#1C73E8] transition-colors resize-none"
                                        />
                                    </div>

                                    {/* References */}
                                    <div className="space-y-2">
                                        <label className="flex items-center gap-2 text-sm font-medium text-white">
                                            <svg className="w-4 h-4 text-[#1C73E8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                            </svg>
                                            References (Inspiration)
                                        </label>
                                        <p className="text-xs text-gray-500">Inspiration screenshots, takes or videos</p>
                                        <textarea
                                            value={videoFormData.referenceLinks}
                                            onChange={(e) => setVideoFormData({ ...videoFormData, referenceLinks: e.target.value })}
                                            placeholder="Paste your Google Drive link"
                                            rows={2}
                                            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#1C73E8] transition-colors resize-none"
                                        />
                                    </div>
                                </div>

                                {/* Middle Column - Instructions (40%) */}
                                <div className="col-span-5">
                                    <div className="space-y-2 h-full flex flex-col">
                                        <div>
                                            <label className="flex items-center gap-2 text-sm font-medium text-white">
                                                <svg className="w-4 h-4 text-[#1C73E8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                                                </svg>
                                                Instructions for editing
                                            </label>
                                            <p className="text-xs text-gray-500">Extra instructions or important observations</p>
                                        </div>
                                        <textarea
                                            value={videoFormData.instructions}
                                            onChange={(e) => setVideoFormData({ ...videoFormData, instructions: e.target.value })}
                                            placeholder="Field for general or additional instructions"
                                            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#1C73E8] transition-colors resize-none flex-grow min-h-[160px]"
                                        />
                                    </div>
                                </div>

                                {/* Right Column - Deadline (20%) */}
                                <div className="col-span-2 space-y-2">
                                    <label className="flex items-center gap-2 text-sm font-medium text-white">
                                        <svg className="w-4 h-4 text-[#1C73E8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                        Deadline
                                    </label>
                                    <p className="text-xs text-gray-500">When does this need to be ready?</p>
                                    <div className="space-y-2">
                                        <input
                                            type="date"
                                            value={videoFormData.deadlineDate}
                                            onChange={(e) => setVideoFormData({ ...videoFormData, deadlineDate: e.target.value })}
                                            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#1C73E8] transition-colors"
                                        />
                                        <input
                                            type="time"
                                            value={videoFormData.deadlineTime}
                                            onChange={(e) => setVideoFormData({ ...videoFormData, deadlineTime: e.target.value })}
                                            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#1C73E8] transition-colors"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Footer Buttons */}
                            <div className="flex justify-end gap-3 pt-4 px-0">
                                <button
                                    type="button"
                                    onClick={handleCancel}
                                    className="px-4 py-2 text-sm font-medium text-gray-400 hover:text-white transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-6 py-2 text-sm font-bold text-white bg-[#1C73E8] rounded-lg hover:bg-[#1557b0] transition-colors"
                                >
                                    Request Video Edition
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Deliverables List - Video */}
                    <div className="bg-white/5 border border-white/10 rounded-lg p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-white">Deliverables - Video</h2>
                            <button className="bg-[#1C73E8]/20 text-[#1C73E8] px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#1C73E8]/30 transition-colors">
                                Schedule a quick call
                            </button>
                        </div>

                        {/* Table */}
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-white/10">
                                        <th className="text-left py-3 px-4 text-xs font-bold text-white uppercase tracking-wider">Material Name</th>
                                        <th className="text-left py-3 px-4 text-xs font-bold text-white uppercase tracking-wider">Creation Date</th>
                                        <th className="text-left py-3 px-4 text-xs font-bold text-white uppercase tracking-wider">Status / g4 Comment</th>
                                        <th className="text-left py-3 px-4 text-xs font-bold text-white uppercase tracking-wider">Delivery Deadline</th>
                                        <th className="text-left py-3 px-4 text-xs font-bold text-white uppercase tracking-wider">Delivery Link</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    <tr className="hover:bg-white/5 transition-colors">
                                        <td className="py-4 px-4 text-sm text-gray-300 font-medium">Material Name</td>
                                        <td className="py-4 px-4 text-sm text-gray-400">23/Dec/25, 11:59</td>
                                        <td className="py-4 px-4 text-sm text-gray-400">In progress</td>
                                        <td className="py-4 px-4 text-sm text-gray-400">26/Dec/25, 13:00</td>
                                        <td className="py-4 px-4 text-sm text-[#1C73E8]">-</td>
                                    </tr>
                                    <tr className="hover:bg-white/5 transition-colors">
                                        <td className="py-4 px-4 text-sm text-gray-300 font-medium">Holiday Campaign</td>
                                        <td className="py-4 px-4 text-sm text-gray-400">23/Dec/25, 12:23</td>
                                        <td className="py-4 px-4 text-sm text-gray-400">In progress</td>
                                        <td className="py-4 px-4 text-sm text-gray-400">25/Dec/25, 18:00</td>
                                        <td className="py-4 px-4 text-sm text-[#1C73E8]">-</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
