import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { Loader2, Search, MoreHorizontal, Edit, ExternalLink } from "lucide-react"
import { useState } from "react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { DesignRequestDetailsModal } from "./design-request-details-modal"
import { DeliveryViewModal } from "./delivery-view-modal"
import { updateDesignRequest } from "@/actions/design-actions"
import { useRouter } from "next/navigation"

export interface DesignRequest {
    id: string
    created_at: string
    material_name: string
    objective: string
    deadline: string | null
    status: string
    notes: string | null
    delivery_link?: string | null
}

interface DesignHistoryListProps {
    requests: DesignRequest[]
    updateAction?: (id: string, updates: Partial<DesignRequest>) => Promise<{ success?: boolean; error?: string }>
    onUpdate?: () => void
}

export function DesignHistoryList({ requests, updateAction, onUpdate }: DesignHistoryListProps) {
    const router = useRouter()
    const [searchTerm, setSearchTerm] = useState('')
    const [statusFilter, setStatusFilter] = useState('All')

    // Edit Modal State
    const [editingRequest, setEditingRequest] = useState<DesignRequest | null>(null)
    // View Modal State
    const [viewingDeliveryRequest, setViewingDeliveryRequest] = useState<DesignRequest | null>(null)

    // Filter Logic
    const filteredData = requests.filter(item => {
        const matchesStatus = statusFilter === 'All' ? true : item.status === statusFilter?.toLowerCase()
        const matchesSearch = searchTerm === '' ? true : (
            (item.material_name?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
            (item.objective?.toLowerCase().includes(searchTerm.toLowerCase()) || false)
        )
        return matchesStatus && matchesSearch
    })

    const getStatusColor = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'approved':
            case 'completed': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'

            case 'in_progress': return 'bg-blue-500/10 text-blue-400 border-blue-500/20'

            case 'for_approval': return 'bg-amber-500/10 text-amber-400 border-amber-500/20'

            case 'cancelled':
            case 'rejected': return 'bg-red-500/10 text-red-400 border-red-500/20'

            case 'to_do':
            case 'pending':
            default: return 'bg-gray-500/10 text-gray-400 border-gray-500/20'
        }
    }

    const formatStatus = (status: string) => {
        if (!status) return 'To Do'
        return status.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
    }

    const handleUpdate = async (id: string, updates: Partial<DesignRequest>) => {
        const action = updateAction || updateDesignRequest
        const res = await action(id, updates)

        if (res.success) {
            router.refresh()
            if (onUpdate) onUpdate()
        }
    }

    if (!requests || requests.length === 0) {
        return (
            <div className="w-full py-12 flex flex-col items-center justify-center border border-white/10 rounded-xl bg-black/40 text-center">
                <p className="text-gray-400">No design requests found.</p>
            </div>
        )
    }

    return (
        <div className="w-full h-full flex flex-col gap-4">
            {/* Header / Filter */}
            <div className="flex justify-between items-center bg-black/40 border border-white/10 rounded-xl p-4 shrink-0">
                <h3 className="text-white font-bold text-lg">Request History ({filteredData.length})</h3>
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <Search className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            placeholder="Search requests..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="bg-zinc-900 border border-white/10 text-white text-sm rounded-lg pl-9 pr-4 py-2 outline-none focus:ring-1 focus:ring-blue-500 w-64"
                        />
                    </div>

                    <div className="flex items-center gap-2">
                        <label className="text-xs font-bold text-gray-500 uppercase">Filter:</label>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="bg-zinc-900 border border-white/10 text-white text-sm rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-blue-500"
                        >
                            <option value="All">All</option>
                            <option value="to_do">To Do</option>
                            <option value="in_progress">In Progress</option>
                            <option value="for_approval">For Approval</option>
                            <option value="approved">Approved</option>
                            <option value="cancelled">Cancelled</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className="w-full flex-1 min-h-0 overflow-hidden border border-white/10 rounded-xl bg-black/40 flex flex-col">
                <div className="w-full h-full overflow-auto custom-scrollbar">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead>
                            <tr className="border-b border-white/10 bg-white/5">
                                <th className="px-6 py-3 font-bold text-gray-300">Material Name</th>
                                <th className="px-6 py-3 font-bold text-gray-300">Objective</th>
                                <th className="px-6 py-3 font-bold text-gray-300">Request Date</th>
                                <th className="px-6 py-3 font-bold text-gray-300">Deadline</th>
                                <th className="px-6 py-3 font-bold text-gray-300">Status</th>
                                <th className="px-6 py-3 font-bold text-gray-300">Delivery</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {filteredData.map((req) => (
                                <tr
                                    key={req.id}
                                    onClick={() => updateAction && setEditingRequest(req)}
                                    className={updateAction ? "hover:bg-white/5 transition-colors cursor-pointer group" : ""}
                                >
                                    <td className="px-6 py-3 font-medium text-white">{req.material_name}</td>
                                    <td className="px-6 py-3 text-gray-300 max-w-xs truncate">{req.objective}</td>
                                    <td className="px-6 py-3 text-gray-400">
                                        {req.created_at ? format(new Date(req.created_at), 'PPP') : '-'}
                                    </td>
                                    <td className="px-6 py-3 text-gray-400">
                                        {req.deadline ? format(new Date(req.deadline), 'PPP') : '-'}
                                    </td>
                                    <td className="px-6 py-3">
                                        <Badge variant="outline" className={`${getStatusColor(req.status)} border`}>
                                            {formatStatus(req.status)}
                                        </Badge>
                                    </td>
                                    <td className="px-6 py-3" onClick={(e) => e.stopPropagation()}>
                                        {req.delivery_link ? (
                                            <button
                                                onClick={() => setViewingDeliveryRequest(req)}
                                                className="flex items-center gap-1.5 text-blue-400 hover:text-blue-300 underline font-medium outline-none focus:ring-2 focus:ring-blue-500 rounded px-1 -ml-1"
                                            >
                                                View <ExternalLink className="w-3 h-3" />
                                            </button>
                                        ) : (
                                            <span className="text-gray-500">-</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Edit Modal */}
            {editingRequest && (
                <DesignRequestDetailsModal
                    isOpen={!!editingRequest}
                    onClose={() => setEditingRequest(null)}
                    request={editingRequest}
                    onSave={handleUpdate}
                />
            )}

            {/* View Delivery Modal */}
            {viewingDeliveryRequest && (
                <DeliveryViewModal
                    isOpen={!!viewingDeliveryRequest}
                    onClose={() => setViewingDeliveryRequest(null)}
                    linkContent={viewingDeliveryRequest.delivery_link || ''}
                    materialName={viewingDeliveryRequest.material_name}
                />
            )}
        </div>
    )
}
