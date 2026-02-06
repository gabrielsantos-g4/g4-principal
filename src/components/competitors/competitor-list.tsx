'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createCompetitor, type Competitor } from '@/actions/competitor-actions'

interface CompetitorListProps {
    competitors: Competitor[]
}

export function CompetitorList({ competitors: initialCompetitors }: CompetitorListProps) {
    const router = useRouter()
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [competitorName, setCompetitorName] = useState('')
    const [isCreating, setIsCreating] = useState(false)

    // Mock data for testing when no DB connection
    const mockCompetitors: Competitor[] = initialCompetitors.length === 0 ? [
        {
            id: 'mock-1',
            user_id: 'mock-user',
            empresa_id: 'mock-company',
            name: 'Acme Corporation',
            website: 'https://acme.com',
            other_link: null,
            instagram_profile: '@acmecorp',
            linkedin_profile: '/company/acme',
            youtube_channel: '/@acmechannel',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        },
        {
            id: 'mock-2',
            user_id: 'mock-user',
            empresa_id: 'mock-company',
            name: 'TechCo Inc',
            website: 'https://techco.io',
            other_link: null,
            instagram_profile: null,
            linkedin_profile: '/company/techco',
            youtube_channel: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        }
    ] : initialCompetitors

    const competitors = mockCompetitors

    const handleOpenModal = () => {
        setIsModalOpen(true)
        setCompetitorName('')
    }

    const handleCloseModal = () => {
        setIsModalOpen(false)
        setCompetitorName('')
    }

    const handleCreateCompetitor = async () => {
        if (!competitorName.trim()) return

        setIsCreating(true)
        const newCompetitor = await createCompetitor(competitorName.trim())
        setIsCreating(false)

        if (newCompetitor) {
            handleCloseModal()
            router.push(`/dashboard/competitors-analysis?competitorId=${newCompetitor.id}`)
        }
    }

    const handleSelectCompetitor = (competitorId: string) => {
        router.push(`/dashboard/competitors-analysis?competitorId=${competitorId}`)
    }

    return (
        <>
            <div className="w-[360px] border-r border-white/10 bg-black flex flex-col shrink-0">
                {/* Header */}
                <div className="p-6 border-b border-white/10">
                    <button
                        onClick={handleOpenModal}
                        className="w-full bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white rounded-xl px-4 py-3 text-sm font-medium transition-all flex items-center justify-center gap-2"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        New Competitor
                    </button>
                </div>

                {/* Competitors List */}
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    <div className="p-4 space-y-1">
                        <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider px-3 py-2">
                            Competitors
                        </h3>

                        {competitors.length === 0 ? (
                            <div className="px-3 py-8 text-center text-sm text-gray-500">
                                No competitors yet.<br />Click "New Competitor" to start.
                            </div>
                        ) : (
                            competitors.map((competitor) => (
                                <button
                                    key={competitor.id}
                                    onClick={() => handleSelectCompetitor(competitor.id)}
                                    className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-white/5 transition-colors text-sm text-gray-300 hover:text-white flex items-center gap-3 group"
                                >
                                    <svg className="w-4 h-4 text-gray-500 group-hover:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                    </svg>
                                    <span className="truncate">{competitor.name}</span>
                                </button>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* Modal Dialog */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 animate-in fade-in duration-200">
                    <div className="bg-[#1A1A1A] rounded-2xl border border-white/10 p-8 w-full max-w-lg mx-4 animate-in zoom-in-95 duration-200">
                        <h2 className="text-2xl font-bold text-white mb-6">Create New Competitor</h2>

                        <input
                            type="text"
                            value={competitorName}
                            onChange={(e) => setCompetitorName(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !isCreating) {
                                    handleCreateCompetitor()
                                } else if (e.key === 'Escape') {
                                    handleCloseModal()
                                }
                            }}
                            placeholder="Competitor Name (e.g., Acme Corp)"
                            autoFocus
                            className="w-full bg-black/40 border-2 border-[#1C73E8] rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#1C73E8] transition-colors mb-6"
                        />

                        <div className="flex items-center justify-end gap-3">
                            <button
                                onClick={handleCloseModal}
                                disabled={isCreating}
                                className="px-6 py-2.5 text-sm font-medium text-gray-400 hover:text-white transition-colors disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleCreateCompetitor}
                                disabled={!competitorName.trim() || isCreating}
                                className="px-6 py-2.5 text-sm font-bold text-white bg-[#1C73E8] rounded-lg hover:bg-[#1557b0] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isCreating ? 'Creating...' : 'Save'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
