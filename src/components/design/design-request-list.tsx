'use client'

import { useEffect, useState } from 'react'
import { getDesignRequests } from '@/actions/design-actions'
import { Loader2 } from 'lucide-react'

// Define type based on DB schema
interface DesignRequest {
    id: string
    material_name: string
    status: string
    deadline: string
    created_at: string
    // Add other fields if needed for display
}

export function DesignRequestList({ refreshTrigger }: { refreshTrigger: number }) {
    const [requests, setRequests] = useState<DesignRequest[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        loadRequests()
    }, [refreshTrigger]) // Reload when trigger changes

    const loadRequests = async () => {
        try {
            const data = await getDesignRequests()
            if (data) {
                setRequests(data as any[]) // minimal type casting
            }
        } catch (error) {
            console.error('Failed to load design requests:', error)
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="flex justify-center p-8">
                <Loader2 className="w-6 h-6 text-[#1C73E8] animate-spin" />
            </div>
        )
    }

    return (
        <div className="bg-white/5 border border-white/10 rounded-lg p-6">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">Deliverables List - Design</h2>
                <button className="bg-[#1C73E8] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#1557b0] transition-colors">
                    Schedule a quick call
                </button>
            </div>

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
                        {requests.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="py-8 text-center text-gray-500">
                                    No design requests found.
                                </td>
                            </tr>
                        ) : requests.map((req) => (
                            <tr key={req.id} className="hover:bg-white/5 transition-colors">
                                <td className="py-4 px-4 text-sm text-white font-medium">{req.material_name}</td>
                                <td className="py-4 px-4 text-sm text-gray-400">
                                    {new Date(req.created_at).toLocaleString()}
                                </td>
                                <td className="py-4 px-4">
                                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium 
                                        ${req.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-[#1C73E8]/10 text-[#1C73E8]'}`}>
                                        {req.status || 'Pending'}
                                    </span>
                                </td>
                                <td className="py-4 px-4 text-sm text-gray-400">
                                    {req.deadline ? new Date(req.deadline).toLocaleDateString() : '-'}
                                </td>
                                <td className="py-4 px-4 text-sm">
                                    <span className="text-gray-600">-</span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
