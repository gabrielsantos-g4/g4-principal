'use client'

import { useEffect, useState } from 'react'
import { getUserReports, getReportById, deleteReport, updateReportTitle } from '@/actions/report-actions'
import { FileText, Calendar, DollarSign, Loader2, Trash2, Clock, Pencil, Check, X } from 'lucide-react'
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
    payload?: AdsReportData // Added payload
}

export function ReportsList({ onSelectReport }: ReportsListProps) {
    const [reports, setReports] = useState<ReportSummary[]>([])
    const [loading, setLoading] = useState(true)
    const [deleteId, setDeleteId] = useState<string | null>(null)
    const [isDeleting, setIsDeleting] = useState(false)
    const [loadingId, setLoadingId] = useState<string | null>(null)

    // Editing state
    const [editingId, setEditingId] = useState<string | null>(null)
    const [editTitle, setEditTitle] = useState('')
    const [isSaving, setIsSaving] = useState(false)

    useEffect(() => {
        loadReports()
    }, [])

    const loadReports = async () => {
        try {
            const data = await getUserReports()
            // Cast the data to include payload as it's now fetched but not strictly typed in the return of getUserReports (which infers from select string potentially)
            // Ideally we'd update the return type of getUserReports, but casting here works for quick UI fix.
            setReports(data as unknown as ReportSummary[] || [])
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

    const startEditing = (e: React.MouseEvent, report: ReportSummary) => {
        e.stopPropagation()
        setEditingId(report.id)
        setEditTitle(report.title)
    }

    const cancelEditing = (e: React.MouseEvent) => {
        e.stopPropagation()
        setEditingId(null)
        setEditTitle('')
    }

    const saveTitle = async (e: React.MouseEvent | React.FormEvent, reportId: string) => {
        e.stopPropagation()
        if (!editTitle.trim()) {
            toast.error('O título não pode estar vazio')
            return
        }

        setIsSaving(true)
        try {
            const { error } = await updateReportTitle(reportId, editTitle)
            if (error) {
                toast.error(error)
            } else {
                toast.success('Report renamed successfully')
                setReports(prev => prev.map(r => r.id === reportId ? { ...r, title: editTitle } : r))
                setEditingId(null)
            }
        } catch (err) {
            console.error(err)
            toast.error('Failed to rename report')
        } finally {
            setIsSaving(false)
        }
    }

    const handleCardClick = async (reportId: string) => {
        // Prevent click if editing
        if (editingId === reportId) return

        setLoadingId(reportId)
        try {
            const fullReport = await getReportById(reportId)

            if (fullReport && fullReport.payload) {
                onSelectReport(fullReport.payload)
                toast.success('Report loaded successfully!')
            } else {
                toast.error('Could not load report details.')
            }
        } catch (error) {
            console.error('Error in handleCardClick:', error)
            toast.error('Error loading report.')
        } finally {
            setLoadingId(null)
        }
    }

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {reports.map((report) => {
                    const startDate = report.payload?.meta?.start_date ? new Date(report.payload.meta.start_date).toLocaleDateString() : 'N/A'
                    const endDate = report.payload?.meta?.end_date ? new Date(report.payload.meta.end_date).toLocaleDateString() : 'N/A'
                    const dateGenerated = new Date(report.created_at).toLocaleDateString()
                    // Infer channel or logic. For now static or simple check
                    const channel = "LinkedIn Ads"

                    const isEditing = editingId === report.id

                    return (
                        <div
                            key={report.id}
                            onClick={() => !isEditing && handleCardClick(report.id)}
                            className={`relative group cursor-pointer rounded-lg bg-[#0f1115] border border-white/5 hover:border-orange-500/50 transition-all duration-300 overflow-hidden ${loadingId === report.id ? 'opacity-70 pointer-events-none' : ''} p-4`}
                        >
                            {/* Delete Button */}
                            {!isEditing && (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        setDeleteId(report.id)
                                    }}
                                    className="absolute bottom-3 right-3 p-1.5 text-gray-600 hover:text-red-500 hover:bg-red-500/10 rounded-full transition-colors z-10"
                                    title="Delete Report"
                                >
                                    <Trash2 className="w-3.5 h-3.5" />
                                </button>
                            )}

                            <div className="space-y-3">
                                {/* Title and Channel (Edit Mode vs View Mode) */}
                                <div>
                                    {isEditing ? (
                                        <div className="flex items-center gap-2 mb-1" onClick={e => e.stopPropagation()}>
                                            <input
                                                type="text"
                                                value={editTitle}
                                                onChange={(e) => setEditTitle(e.target.value)}
                                                className="bg-black/50 border border-white/20 rounded px-2 py-0.5 text-white text-base font-bold w-full focus:outline-none focus:border-orange-500"
                                                autoFocus
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') saveTitle(e, report.id)
                                                    if (e.key === 'Escape') cancelEditing(e as any)
                                                }}
                                            />
                                            <button
                                                onClick={(e) => saveTitle(e, report.id)}
                                                disabled={isSaving}
                                                className="text-emerald-400 hover:text-emerald-300 p-1"
                                            >
                                                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                                            </button>
                                            <button
                                                onClick={cancelEditing}
                                                disabled={isSaving}
                                                className="text-red-400 hover:text-red-300 p-1"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="flex items-start justify-between gap-2 group/title">
                                            <h3 className="font-bold text-white text-base truncate group-hover:text-orange-400 transition-colors flex-1" title={report.title}>
                                                {report.title || 'Untitled Report'}
                                            </h3>
                                            <button
                                                onClick={(e) => startEditing(e, report)}
                                                className="text-gray-600 hover:text-white transition-colors p-0.5"
                                                title="Edit Name"
                                            >
                                                <Pencil className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    )}

                                    <div className="flex items-center gap-2 mt-1">
                                        {/* Simple Channel Badge/Text */}
                                        <span className="text-xs text-slate-400 bg-white/5 px-2 py-0.5 rounded border border-white/5">
                                            {channel}
                                        </span>
                                    </div>
                                </div>

                                {/* Divider */}
                                <div className="h-px bg-white/5 w-full" />

                                {/* Meta Details */}
                                <div className="space-y-1.5">
                                    {/* Period */}
                                    <div className="flex items-center gap-2 text-xs text-gray-500" title="Analysis Period">
                                        <Calendar className="w-3.5 h-3.5 text-slate-600" />
                                        <span>Period: {startDate} - {endDate}</span>
                                    </div>

                                    {/* Generated Date */}
                                    <div className="flex items-center gap-2 text-xs text-gray-500" title="Date Generated">
                                        <Clock className="w-3.5 h-3.5 text-slate-600" />
                                        <span>Generated: {dateGenerated}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )
                })}
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
