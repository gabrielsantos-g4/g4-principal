'use client'

import { useEffect, useState } from 'react'
import { getUserReports, getReportById, deleteReport } from '@/actions/report-actions'
import { FileText, Calendar, DollarSign, Loader2, Trash2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
import { toast } from 'sonner'
import { AdsReportData } from '@/lib/report-types'

interface ReportsListProps {
    onSelectReport: (data: AdsReportData) => void
}

interface ReportSummary {
    id: string
    title: string
    status: string
    created_at: string
    total_spent: number
    currency: string
}

export function ReportsList({ onSelectReport }: ReportsListProps) {
    const [reports, setReports] = useState<ReportSummary[]>([])
    const [loading, setLoading] = useState(true)
    const [deleteId, setDeleteId] = useState<string | null>(null)
    const [isDeleting, setIsDeleting] = useState(false)
    const [loadingId, setLoadingId] = useState<string | null>(null) // Added loadingId state

    useEffect(() => {
        loadReports()
    }, [])

    const loadReports = async () => {
        try {
            const data = await getUserReports()
            setReports(data || [])
        } catch (error) {
            console.error(error)
            toast.error('Failed to load history.')
        } finally {
            setLoading(false)
        }
    }

    const confirmDelete = async () => {
        if (!deleteId) return

        setIsDeleting(true)
        try {
            const { error } = await deleteReport(deleteId)
            if (error) {
                toast.error(error)
            } else {
                toast.success('Report deleted successfully')
                setReports(prev => prev.filter(r => r.id !== deleteId))
            }
        } catch (err) {
            console.error(err)
            toast.error('Failed to delete report')
        } finally {
            setIsDeleting(false)
            setDeleteId(null)
        }
    }

    const handleCardClick = async (reportId: string) => {
        console.log('Clicked report:', reportId)
        setLoadingId(reportId)
        try {
            console.log('Calling getReportById...')
            const fullReport = await getReportById(reportId)
            console.log('getReportById returned:', fullReport ? 'Found' : 'Null')

            if (fullReport && fullReport.payload) {
                console.log('Selecting report...')
                onSelectReport(fullReport.payload)
                toast.success('Report loaded successfully!')
            } else {
                console.error('Report missing payload or not found')
                toast.error('Could not load report details.')
            }
        } catch (error) {
            console.error('Error in handleCardClick:', error)
            toast.error('Error loading report.')
        } finally {
            console.log('Stopping loading spinner')
            setLoadingId(null)
        }
    }

    if (loading) {
        // ... existing loading state
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gradient bg-clip-text text-transparent bg-gradient-to-r from-orange-400 to-red-500">
                My Reports
            </h2>
            <p className="text-gray-400 -mt-4">History of saved analyses.</p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {reports.map((report) => (
                    <div
                        key={report.id}
                        onClick={() => handleCardClick(report.id)}
                        className={`relative group cursor-pointer rounded-xl bg-[#0f1115] border border-white/5 hover:border-orange-500/50 transition-all duration-300 overflow-hidden ${loadingId === report.id ? 'opacity-70 pointer-events-none' : ''}`}
                    >
                        {/* Status Badge */}
                        <div className="absolute top-4 right-4 flex gap-2">
                            <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                                {report.status || 'Completed'}
                            </span>
                        </div>

                        {/* Delete Button (stopPropagatoin to avoid opening card) */}
                        <button
                            onClick={(e) => {
                                e.stopPropagation()
                                setDeleteId(report.id)
                            }}
                            className="absolute bottom-4 right-4 p-2 text-gray-500 hover:text-red-500 hover:bg-red-500/10 rounded-full transition-colors z-10"
                            title="Delete Report"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>

                        <div className="p-6 space-y-4">
                            {/* Icon & Title */}
                            <div className="space-y-2">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center overflow-hidden border border-white/10 ${loadingId === report.id ? 'bg-orange-500/10' : ''}`}>
                                    {loadingId === report.id ? (
                                        <Loader2 className="w-5 h-5 text-orange-500 animate-spin" />
                                    ) : (
                                        <img
                                            src="https://i.pinimg.com/736x/30/66/80/30668098a6571721adaccd7de8b0e4df.jpg"
                                            alt="Report Avatar"
                                            className="w-full h-full object-cover"
                                        />
                                    )}
                                </div>
                                <h3 className="font-bold text-white text-lg truncate pr-12 group-hover:text-orange-400 transition-colors">
                                    {report.title || 'Untitled Report'}
                                </h3>
                            </div>

                            {/* Divider */}
                            <div className="h-px bg-white/5 w-full" />

                            {/* Details */}
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 text-xs text-gray-500">
                                    <Calendar className="w-3.5 h-3.5" />
                                    <span>{new Date(report.created_at).toLocaleDateString()}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm font-mono text-gray-300">
                                    <span className="text-gray-500">$</span>
                                    <span>{report.currency} {(report.total_spent || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
                <AlertDialogContent className="bg-black border border-white/10 text-white">
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription className="text-gray-400">
                            This action cannot be undone. This will permanently delete the report and remove the data from our servers.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel className="bg-transparent border-white/10 text-white hover:bg-white/5 hover:text-white">Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirmDelete}
                            className="bg-red-600 text-white hover:bg-red-700 border-none"
                            disabled={isDeleting}
                        >
                            {isDeleting ? 'Deleting...' : 'Delete'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
