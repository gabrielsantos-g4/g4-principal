'use client'

import { DesignHistoryList } from "./design-history-list"

interface DesignDeliverablesProps {
    requests: any[]
}

export function DesignDeliverables({ requests }: DesignDeliverablesProps) {
    return (
        <div className="space-y-6">
            <div className="bg-[#171717] border border-white/10 rounded-xl p-6">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-xl font-bold text-white">Deliverables & History</h2>
                        <p className="text-gray-400 text-sm">Track status and access delivery files.</p>
                    </div>
                </div>

                <DesignHistoryList requests={requests} />
            </div>
        </div>
    )
}
