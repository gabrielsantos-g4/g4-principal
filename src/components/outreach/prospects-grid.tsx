import { Prospect, deleteProspect, updateProspect } from "@/actions/outreach-actions"
import { Users, Plus, Loader2, ChevronLeft, ChevronRight, Search, Trash2, Edit, MoreHorizontal } from "lucide-react"
import { useState, useTransition, useEffect } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { ProspectDetailsModal } from "./prospect-details-modal"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "../ui/button"

interface ProspectsGridProps {
    data: Prospect[]
}

export function ProspectsGrid({ data }: ProspectsGridProps) {
    const router = useRouter()
    const [prospects, setProspects] = useState<Prospect[]>(data)
    const [statusFilter, setStatusFilter] = useState('All')
    const [searchTerm, setSearchTerm] = useState('')
    const [currentPage, setCurrentPage] = useState(1)
    const [itemsPerPage, setItemsPerPage] = useState(10)

    // Modal States
    const [editingProspect, setEditingProspect] = useState<Prospect | null>(null)
    const [deleteId, setDeleteId] = useState<string | null>(null)
    const [isDeleting, setIsDeleting] = useState(false)

    // Sync with server data changes
    useEffect(() => {
        setProspects(data)
    }, [data])

    // 1. Polling: Atualização a cada 5 segundos
    useEffect(() => {
        const interval = setInterval(() => {
            router.refresh()
        }, 5000)

        return () => clearInterval(interval)
    }, [router])


    if (!prospects || prospects.length === 0) {
        return (
            <div className="w-full h-[600px] flex flex-col items-center justify-center bg-black/40 border border-white/10 rounded-xl p-8 text-center animate-in fade-in duration-500">
                <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6">
                    <Users className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">No prospects found</h3>
                <p className="text-gray-400 max-w-md mb-8">
                    You haven't added any prospects for the Outreach agent to work on yet.
                </p>
                <div className="flex items-center justify-center">
                    {/* Placeholder for Add button if it was here, or just empty state info */}
                    <span className="text-sm text-gray-500 italic">Generate or Import prospects to see them here.</span>
                </div>
            </div>
        )
    }

    // Filter Logic
    const filteredData = prospects.filter(item => {
        const matchesStatus = statusFilter === 'All' ? true : item.status === statusFilter
        const matchesSearch = searchTerm === '' ? true : (
            (item.company_name?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
            (item.decisor_name?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
            (item.role?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
            (item.email_1?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
            (item.email_2?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
            (item.phone_1?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
            (item.phone_2?.toLowerCase().includes(searchTerm.toLowerCase()) || false)
        )
        return matchesStatus && matchesSearch
    })

    // Pagination Logic
    const totalPages = Math.ceil(filteredData.length / itemsPerPage)
    const startIndex = (currentPage - 1) * itemsPerPage
    const paginatedData = filteredData.slice(startIndex, startIndex + itemsPerPage)

    const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setStatusFilter(e.target.value)
        setCurrentPage(1) // Reset to first page
    }

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value)
        setCurrentPage(1) // Reset to first page
    }

    const handleDelete = async () => {
        if (!deleteId) return
        setIsDeleting(true)
        try {
            const res = await deleteProspect(deleteId)
            if (res.success) {
                toast.success("Prospect deleted")
                setProspects(prev => prev.filter(p => p.id !== deleteId))
                router.refresh()
            } else {
                toast.error("Failed to delete prospect")
            }
        } catch (error) {
            console.error(error)
            toast.error("Error deleting prospect")
        } finally {
            setIsDeleting(false)
            setDeleteId(null)
        }
    }

    const handleUpdate = async (id: string, updates: Partial<Prospect>) => {
        const res = await updateProspect(id, updates)
        if (res.success) {
            setProspects(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p))
            router.refresh()
        } else {
            throw new Error("Failed to update")
        }
    }

    return (
        <div className="w-full flex flex-col gap-4">
            {/* Header / Filter */}
            <div className="flex justify-between items-center bg-black/40 border border-white/10 rounded-xl p-4">
                <h3 className="text-white font-bold text-lg">Prospects ({filteredData.length})</h3>
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <Search className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            placeholder="Search prospects..."
                            value={searchTerm}
                            onChange={handleSearchChange}
                            className="bg-zinc-900 border border-white/10 text-white text-sm rounded-lg pl-9 pr-4 py-2 outline-none focus:ring-1 focus:ring-blue-500 w-64"
                        />
                    </div>


                    <div className="flex items-center gap-2">
                        <label className="text-xs font-bold text-gray-500 uppercase">Filter Status:</label>
                        <select
                            value={statusFilter}
                            onChange={handleFilterChange}
                            className="bg-zinc-900 border border-white/10 text-white text-sm rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-blue-500"
                        >
                            <option value="All">All</option>
                            <option value="Pending">Pending</option>
                            <option value="Needs Review">Needs Review</option>
                            <option value="Approved">Approved</option>
                            <option value="Rejected">Rejected</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className="w-full max-w-full overflow-hidden border border-white/10 rounded-xl bg-black/40">
                <div className="w-full overflow-x-auto custom-scrollbar">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead>
                            <tr className="border-b border-white/10 bg-white/5">
                                <th className="px-6 py-3 font-bold text-gray-300">Company Name</th>
                                <th className="px-6 py-3 font-bold text-gray-300">Decisor Name</th>
                                <th className="px-6 py-3 font-bold text-gray-300">Role</th>
                                <th className="px-6 py-3 font-bold text-gray-300">Phone 1</th>
                                <th className="px-6 py-3 font-bold text-gray-300">Phone 2</th>
                                <th className="px-6 py-3 font-bold text-gray-300">Email 1</th>
                                <th className="px-6 py-3 font-bold text-gray-300">Email 2</th>
                                <th className="px-6 py-3 font-bold text-gray-300">LinkedIn Profile</th>
                                <th className="px-6 py-3 font-bold text-gray-300">Date</th>
                                <th className="px-6 py-3 font-bold text-gray-300">Status</th>
                                <th className="px-6 py-3 font-bold text-gray-300 w-[50px]">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {paginatedData.map((prospect) => (
                                <tr key={prospect.id} className="hover:bg-white/5 transition-colors">
                                    <td className="px-6 py-3 font-medium text-white select-text cursor-text">{prospect.company_name || '-'}</td>
                                    <td className="px-6 py-3 text-gray-300 select-text cursor-text">{prospect.decisor_name || '-'}</td>
                                    <td className="px-6 py-3 text-gray-300 select-text cursor-text">{prospect.role || '-'}</td>
                                    <td className="px-6 py-3 text-gray-400 select-text cursor-text">{prospect.phone_1 || '-'}</td>
                                    <td className="px-6 py-3 text-gray-400 select-text cursor-text">{prospect.phone_2 || '-'}</td>
                                    <td className="px-6 py-3 text-gray-400 select-text cursor-text">{prospect.email_1 || '-'}</td>
                                    <td className="px-6 py-3 text-gray-400 select-text cursor-text">{prospect.email_2 || '-'}</td>

                                    <td className="px-6 py-3">
                                        {prospect.linkedin_profile ? (
                                            <a
                                                href={prospect.linkedin_profile.startsWith('http') ? prospect.linkedin_profile : `https://${prospect.linkedin_profile}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-blue-400 hover:text-blue-300 underline"
                                            >
                                                View Profile
                                            </a>
                                        ) : (
                                            <span className="text-gray-500">-</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-3 text-gray-400">
                                        {prospect.created_at ? new Date(prospect.created_at).toLocaleDateString() : '-'}
                                    </td>
                                    <td className="px-6 py-3">
                                        <StatusSelect
                                            id={prospect.id}
                                            currentStatus={prospect.status}
                                        />
                                    </td>
                                    <td className="px-6 py-3">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" className="h-8 w-8 p-0 text-gray-400 hover:text-white hover:bg-white/10">
                                                    <span className="sr-only">Open menu</span>
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="bg-[#1A1A1A] border-white/10 text-white">
                                                <DropdownMenuItem
                                                    onClick={() => setEditingProspect(prospect)}
                                                    className="cursor-pointer hover:bg-white/10 focus:bg-white/10 focus:text-white"
                                                >
                                                    <Edit className="mr-2 h-4 w-4" />
                                                    Edit
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    onClick={() => setDeleteId(prospect.id)}
                                                    className="cursor-pointer text-red-500 hover:bg-red-500/10 hover:text-red-400 focus:bg-red-500/10 focus:text-red-400"
                                                >
                                                    <Trash2 className="mr-2 h-4 w-4" />
                                                    Delete
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Controls */}
                {filteredData.length > 0 && (
                    <div className="flex items-center justify-between px-6 py-4 border-t border-white/10 bg-white/5">
                        <div className="flex items-center gap-6">
                            <div className="text-xs text-gray-400">
                                Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredData.length)} of {filteredData.length} entries
                            </div>
                        </div>
                        <div className="flex items-center gap-6">
                            <div className="flex items-center gap-2">
                                <label className="text-xs font-bold text-gray-500 uppercase">Rows per page:</label>
                                <select
                                    value={itemsPerPage}
                                    onChange={(e) => {
                                        setItemsPerPage(Number(e.target.value))
                                        setCurrentPage(1)
                                    }}
                                    className="bg-zinc-900 border border-white/10 text-white text-[10px] rounded px-2 py-0.5 outline-none focus:ring-1 focus:ring-blue-500 h-7"
                                >
                                    <option value={10}>10</option>
                                    <option value={25}>25</option>
                                    <option value={50}>50</option>
                                    <option value={100}>100</option>
                                </select>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                    disabled={currentPage === 1}
                                    className="p-2 rounded hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    <ChevronLeft className="w-4 h-4 text-gray-300" />
                                </button>
                                <span className="text-sm font-medium text-gray-300">
                                    Page {currentPage} of {totalPages}
                                </span>
                                <button
                                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                    disabled={currentPage === totalPages}
                                    className="p-2 rounded hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    <ChevronRight className="w-4 h-4 text-gray-300" />
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Modals */}
            {editingProspect && (
                <ProspectDetailsModal
                    isOpen={!!editingProspect}
                    onClose={() => setEditingProspect(null)}
                    prospect={editingProspect}
                    onSave={handleUpdate}
                />
            )}

            <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
                <AlertDialogContent className="bg-[#1A1A1A] border-white/10 text-white">
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription className="text-gray-400">
                            This action cannot be undone. This will permanently delete the prospect.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel className="bg-transparent border-white/10 text-white hover:bg-white/10 hover:text-white">Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            className="bg-red-500 text-white hover:bg-red-600 border-red-500"
                        >
                            {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Delete"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}

function StatusSelect({ id, currentStatus }: { id: string, currentStatus: string }) {
    const [isPending, startTransition] = useTransition()
    const [status, setStatus] = useState(currentStatus)

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newStatus = e.target.value
        setStatus(newStatus) // Optimistic update

        startTransition(async () => {
            try {
                // Now using server action directly for consistency
                const res = await updateProspect(id, { status: newStatus })
                if (!res.success) {
                    throw new Error('Failed to update')
                }
            } catch (error) {
                console.error('Failed to update status', error)
                setStatus(currentStatus) // Revert on error
                toast.error("Failed to update status")
            }
        })
    }

    const getStatusColor = (val: string) => {
        switch (val) {
            case 'Approved': return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
            case 'Rejected': return 'text-red-400 bg-red-500/10 border-red-500/20'
            case 'Pending': return 'text-gray-400 bg-gray-500/10 border-gray-500/20'
            case 'Needs Review':
            default: return 'text-amber-400 bg-amber-500/10 border-amber-500/20'
        }
    }

    return (
        <div className="relative">
            <select
                value={status}
                onChange={handleChange}
                disabled={isPending}
                className={`appearance-none cursor-pointer text-xs font-bold uppercase tracking-wider px-2 py-1 rounded border outline-none focus:ring-1 focus:ring-white/20 transition-all ${getStatusColor(status)} ${isPending ? 'opacity-50' : ''}`}
            >
                <option value="Pending" className="bg-slate-900 text-gray-400">Pending</option>
                <option value="Needs Review" className="bg-slate-900 text-amber-400">Needs Review</option>
                <option value="Approved" className="bg-slate-900 text-emerald-400">Approved</option>
                <option value="Rejected" className="bg-slate-900 text-red-400">Rejected</option>
            </select>
            {isPending && (
                <Loader2 className="w-3 h-3 absolute -right-4 top-1.5 animate-spin text-gray-500" />
            )}
        </div>
    )
}

