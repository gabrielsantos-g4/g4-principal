'use client'

import { useState, useEffect } from 'react'
import { updateCompetitor, type Competitor } from '@/actions/competitor-actions'

interface CompetitorFormProps {
    competitor: Competitor
}

export function CompetitorForm({ competitor: initialCompetitor }: CompetitorFormProps) {
    const [competitor, setCompetitor] = useState(initialCompetitor)
    const [isSaving, setIsSaving] = useState(false)

    useEffect(() => {
        setCompetitor(initialCompetitor)
    }, [initialCompetitor])

    const handleUpdate = async (field: keyof Competitor, value: string) => {
        setCompetitor(prev => ({ ...prev, [field]: value }))

        setIsSaving(true)
        await updateCompetitor(competitor.id, { [field]: value })
        setIsSaving(false)
    }

    return (
        <div className="flex-1 overflow-y-auto bg-black p-8">
            <div className="max-w-4xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-white mb-1">Competitor Details</h1>
                        <p className="text-sm text-gray-400">Track and analyze competitor presence</p>
                    </div>
                    {isSaving && (
                        <div className="flex items-center gap-2 text-sm text-gray-400">
                            <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Saving...
                        </div>
                    )}
                </div>

                {/* Competitor Name */}
                <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-white">
                        <svg className="w-4 h-4 text-[#1C73E8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                        Competitor Name
                    </label>
                    <input
                        type="text"
                        value={competitor.name}
                        onChange={(e) => handleUpdate('name', e.target.value)}
                        placeholder="e.g., Acme Corp"
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#1C73E8] transition-colors"
                    />
                </div>

                {/* Website */}
                <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-white">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                        </svg>
                        Website
                    </label>
                    <input
                        type="url"
                        value={competitor.website || ''}
                        onChange={(e) => handleUpdate('website', e.target.value)}
                        placeholder="https://example.com"
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#1C73E8] transition-colors"
                    />
                </div>

                {/* Other Useful Link */}
                <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-white">
                        <svg className="w-4 h-4 text-[#1C73E8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                        </svg>
                        Other Useful Link
                    </label>
                    <input
                        type="url"
                        value={competitor.other_link || ''}
                        onChange={(e) => handleUpdate('other_link', e.target.value)}
                        placeholder="https://..."
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#1C73E8] transition-colors"
                    />
                </div>

                {/* Social Media Profiles - Grid */}
                <div className="grid grid-cols-3 gap-4">
                    {/* Instagram */}
                    <div className="space-y-2">
                        <label className="flex items-center gap-2 text-sm font-medium text-white">
                            <svg className="w-4 h-4 text-[#E4405F]" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                            </svg>
                            Instagram Profile
                        </label>
                        <input
                            type="text"
                            value={competitor.instagram_profile || ''}
                            onChange={(e) => handleUpdate('instagram_profile', e.target.value)}
                            placeholder="/username"
                            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#1C73E8] transition-colors"
                        />
                    </div>

                    {/* LinkedIn */}
                    <div className="space-y-2">
                        <label className="flex items-center gap-2 text-sm font-medium text-white">
                            <svg className="w-4 h-4 text-[#0077b5]" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                            </svg>
                            LinkedIn Profile
                        </label>
                        <input
                            type="text"
                            value={competitor.linkedin_profile || ''}
                            onChange={(e) => handleUpdate('linkedin_profile', e.target.value)}
                            placeholder="/company/name"
                            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#1C73E8] transition-colors"
                        />
                    </div>

                    {/* YouTube */}
                    <div className="space-y-2">
                        <label className="flex items-center gap-2 text-sm font-medium text-white">
                            <svg className="w-4 h-4 text-[#FF0000]" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                            </svg>
                            YouTube Channel
                        </label>
                        <input
                            type="text"
                            value={competitor.youtube_channel || ''}
                            onChange={(e) => handleUpdate('youtube_channel', e.target.value)}
                            placeholder="/@channelname"
                            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#1C73E8] transition-colors"
                        />
                    </div>
                </div>

                {/* Save Button */}
                <div className="flex justify-end pt-6 border-t border-white/10">
                    <button
                        onClick={() => {
                            // Manual save trigger (data is already auto-saving on change)
                            console.log('Manual save triggered')
                        }}
                        className="px-6 py-2.5 text-sm font-bold text-white bg-[#1C73E8] rounded-lg hover:bg-[#1557b0] transition-colors flex items-center gap-2"
                    >
                        {isSaving ? (
                            <>
                                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Saving...
                            </>
                        ) : (
                            <>
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                Save
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    )
}
