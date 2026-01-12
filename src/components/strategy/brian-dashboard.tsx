'use client'

import { Agent } from '@/lib/agents'

interface BrianDashboardProps {
    agent: Agent
}

export function BrianDashboard({ agent }: BrianDashboardProps) {
    const suggestions = [
        "Help me review my strategic positioning.",
        "Identify attributes that make my brand unique.",
        "How can I improve my brand's value perception?",
        "How can I make my messaging more consistent?"
    ]

    return (
        <div className="flex-1 flex flex-col items-center justify-center min-h-0 bg-black p-8 text-center animate-in fade-in duration-500">
            <div className="w-full max-w-4xl space-y-8">

                {/* Helper Text Only */}
                <p className="text-sm text-gray-400">
                    Not sure how to start the conversation? Use one of these phrases below.
                </p>

                {/* Suggestions Grid */}
                <div className="grid grid-cols-2 gap-4 max-w-3xl mx-auto">
                    {suggestions.map((text, index) => (
                        <button
                            key={index}
                            className="text-left bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all rounded-xl p-4 group"
                            onClick={() => {
                                // Logic to populate chat input (future)
                                console.log('Suggestion clicked:', text)
                            }}
                        >
                            <p className="text-sm text-gray-300 group-hover:text-white transition-colors">
                                {text}
                            </p>
                        </button>
                    ))}
                </div>

            </div>
        </div>
    )
}
