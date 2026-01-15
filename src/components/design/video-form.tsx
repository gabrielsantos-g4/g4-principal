'use client'

import { useState } from 'react'
import { MultiSelect } from '@/components/ui/multi-select'

export function VideoForm() {
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

    const handleVideoSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        console.log('Video request submitted:', videoFormData)
        // TODO: Implement submission logic
    }

    const handleCancel = () => {
        setVideoFormData({
            materialName: '',
            objective: '',
            aspectRatio: [],
            fileFormat: [],
            captions: '',
            takesLink: '',
            referenceLinks: '',
            instructions: '',
            deadlineDate: '',
            deadlineTime: ''
        })
    }

    return (
        <form onSubmit={handleVideoSubmit} className="space-y-6 max-w-[1400px] mx-auto">
            {/* Top Row - 5 Fields */}
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
                <div className="col-span-12 lg:col-span-5 space-y-6">
                    {/* Takes */}
                    <div className="space-y-2">
                        <label className="flex items-center gap-2 text-sm font-medium text-white">
                            <svg className="w-4 h-4 text-[#1C73E8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            Takes
                        </label>

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
                            References
                        </label>

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
                <div className="col-span-12 lg:col-span-5">
                    <div className="space-y-2 h-full flex flex-col">
                        <div>
                            <label className="flex items-center gap-2 text-sm font-medium text-white">
                                <svg className="w-4 h-4 text-[#1C73E8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                                </svg>
                                Instructions for editing
                            </label>

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
                <div className="col-span-12 lg:col-span-2 space-y-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-white">
                        <svg className="w-4 h-4 text-[#1C73E8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        Deadline
                    </label>

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
    )
}
